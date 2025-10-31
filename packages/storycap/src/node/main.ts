import picomatch from 'picomatch';
import { StorybookConnection, StoriesBrowser, Story, sleep, ChromiumNotFoundError } from 'storycrawler';
import { CapturingBrowser } from './capturing-browser.js';
import { MainOptions, RunMode } from './types.js';
import { FileSystem } from './file.js';
import { createScreenshotService } from './screenshot-service.js';
import { shardStories, sortStories } from './shard-utilities.js';

const { isMatch } = picomatch;

async function detectRunMode(storiesBrowser: StoriesBrowser, opt: MainOptions) {
  // Reuse `storiesBrowser` instance to avoid cost of re-launching another Puppeteer process.
  await storiesBrowser.page.goto(opt.serverOptions.storybookUrl);
  await sleep(100);

  // We can check whether the secret value is set by `register.js` or not.
  const registered: boolean | undefined = await storiesBrowser.page.evaluate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (window as any).__STORYCAP_MANAGED_MODE_REGISTERED__,
  );
  const mode: RunMode = registered ? 'managed' : 'simple';
  opt.logger.log(`Storycap runs with ${mode} mode`);
  return mode;
}

async function bootCapturingBrowserAsWorkers(connection: StorybookConnection, opt: MainOptions, mode: RunMode) {
  const browsers = await Promise.all(
    [...new Array(Math.max(opt.parallel, 1)).keys()].map(i => new CapturingBrowser(connection, opt, mode, i).boot()),
  );
  opt.logger.debug(`Started ${browsers.length} capture browsers`);
  return { workers: browsers, closeWorkers: () => Promise.all(browsers.map(b => b.close.bind(b))) };
}

function filterStories(flatStories: Story[], include: string[], exclude: string[]): Story[] {
  const conbined = flatStories.map(s => ({ ...s, name: s.kind + '/' + s.story }));
  const included = include.length ? conbined.filter(s => include.some(rule => isMatch(s.name, rule))) : conbined;
  const excluded = exclude.length ? included.filter(s => !exclude.some(rule => isMatch(s.name, rule))) : included;
  return excluded;
}

/**
 *
 * Run main process of Storycap.
 *
 * @param mainOptions - Parameters for this procedure
 *
 **/
export async function main(mainOptions: MainOptions) {
  const logger = mainOptions.logger;
  const fileSystem = new FileSystem(mainOptions);

  // Wait for connection to Storybook server.
  const connection = await new StorybookConnection(mainOptions.serverOptions, logger).connect();
  logger.debug('Created to connection.');

  // Launch Puppeteer process and fetch names of all stories.
  const storiesBrowser = await new StoriesBrowser(connection, mainOptions, logger).boot();
  logger.log('Executable Chromium path:', logger.color.magenta(storiesBrowser.executablePath));
  const allStories = await storiesBrowser.getStories();
  logger.debug('Ended to fetch stories metadata.');

  // Mode(simple / managed) deteciton.
  const mode = await detectRunMode(storiesBrowser, mainOptions);
  storiesBrowser.close();

  const stories = filterStories(allStories, mainOptions.include, mainOptions.exclude);

  if (stories.length === 0) {
    logger.warn('There is no matched story. Check your include/exclude options.');
    return 0;
  }

  const sortedStories = sortStories(stories);
  const shardedStories = shardStories(sortedStories, mainOptions.shard.shardNumber, mainOptions.shard.totalShards);

  if (shardedStories.length === 0) {
    logger.log('This shard has no stories to screenshot.');
    return 0;
  }

  if (mainOptions.shard.totalShards === 1) {
    logger.log(`Found ${logger.color.green(String(stories.length))} stories.`);
  } else {
    logger.log(
      `Found ${logger.color.green(String(stories.length))} stories. ${logger.color.green(
        String(shardedStories.length),
      )} are being processed by this shard (number ${mainOptions.shard.shardNumber} of ${
        mainOptions.shard.totalShards
      }).`,
    );
  }

  // Launce Puppeteer processes to capture each story.
  const { workers, closeWorkers } = await bootCapturingBrowserAsWorkers(connection, mainOptions, mode);
  logger.debug('Created workers.');

  try {
    // Execution caputuring procedure.
    const captured = await createScreenshotService({
      workers,
      stories: shardedStories,
      fileSystem,
      logger,
      forwardConsoleLogs: mainOptions.forwardConsoleLogs,
      trace: mainOptions.trace,
    }).execute();
    logger.debug('Ended ScreenshotService execution.');
    return captured;
  } catch (error) {
    if (error instanceof ChromiumNotFoundError) {
      throw new Error(
        `Chromium is not installed. Execute "npm i puppeteer" or install manually and set "--chromiumPath" option.`,
      );
    }
    throw error;
  } finally {
    // Shutdown workers and dispose connection.
    closeWorkers();
    logger.debug('Ended to dispose workers.');
    connection.disconnect();
    logger.debug('Ended to dispose connection.');
  }
}
