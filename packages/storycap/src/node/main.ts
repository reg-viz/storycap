import minimatch from 'minimatch';
import { StorybookConnection, StoriesBrowser, Story, sleep } from 'storycrawler';
import { CapturingBrowser } from './capturing-browser';
import { MainOptions, RunMode } from './types';
import { FileSystem } from './file';
import { createScreenshotService } from './screenshot-service';
import { findChrome } from './find-chrome';

async function detectRunMode(storiesBrowser: StoriesBrowser, opt: MainOptions) {
  // Reuse `storiesBrowser` instance to avoid cost of re-launching another Puppeteer process.
  await storiesBrowser.page.goto(opt.serverOptions.storybookUrl);
  await sleep(100);

  // We can check whether the secret value is set by `register.js` or not.
  const registered: boolean | undefined = await storiesBrowser.page.evaluate(
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
  const included = include.length ? conbined.filter(s => include.some(rule => minimatch(s.name, rule))) : conbined;
  const excluded = exclude.length ? included.filter(s => !exclude.some(rule => minimatch(s.name, rule))) : included;
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
  const found = await findChrome({ executablePath: mainOptions.chromiumPath, channel: mainOptions.chromiumChannel });
  logger.debug('Search local Chromium:', logger.color.magenta(mainOptions.chromiumChannel));
  if (!found) {
    throw new Error(
      `Chromium is not installed. Execute "npm i puppeteer" or install manually and set "--chromiumPath" option.`,
    );
  }
  logger.log('Executable Chromium path:', found.executablePath);
  mainOptions.chromiumPath = found.executablePath;

  // Wait for connection to Storybook server.
  const connection = await new StorybookConnection(mainOptions.serverOptions, logger).connect();

  // Launch Puppeteer process and fetch names of all stories.
  const storiesBrowser = await new StoriesBrowser(connection, mainOptions, logger).boot();
  const allStories = await storiesBrowser.getStories();

  // Mode(simple / managed) deteciton.
  const mode = await detectRunMode(storiesBrowser, mainOptions);
  storiesBrowser.close();

  const stories = filterStories(allStories, mainOptions.include, mainOptions.exclude);
  if (stories.length === 0) {
    logger.warn('There is no matched story. Check your include/exclude options.');
    return 0;
  }

  logger.log(`Found ${logger.color.green(stories.length + '')} stories.`);

  // Launce Puppeteer processes to capture each story.
  const { workers, closeWorkers } = await bootCapturingBrowserAsWorkers(connection, mainOptions, mode);

  try {
    // Execution caputuring procedure.
    return await createScreenshotService({ workers, stories, fileSystem, logger }).execute();
  } finally {
    // Shutdown workers and dispose connection.
    await closeWorkers();
    connection.disconnect();
  }
}
