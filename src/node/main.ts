import { StorybookServer, StoriesBrowser } from './story-crawler';
import { CapturingBrowser } from './capturing-browser';
import { filterStories } from '../util';
import { MainOptions, RunMode } from './types';
import { FileSystem } from './file';
import { createScreenshotService } from './screenshot-service';

async function detectRunMode(storiesBrowser: StoriesBrowser, opt: MainOptions) {
  await storiesBrowser.page.goto(opt.serverOptions.storybookUrl);
  await storiesBrowser.page.waitForNavigation();
  const registered: boolean | undefined = await storiesBrowser.page.evaluate(
    () => (window as any).__STORYCAP_MANAGED_MODE_REGISTERED__,
  );
  const mode: RunMode = registered ? 'managed' : 'simple';
  opt.logger.log(`Storycap runs with ${mode} mode`);
  return mode;
}

async function bootCapturingBrowserAsWorkers(opt: MainOptions, mode: RunMode) {
  const browsers = await Promise.all(
    [...new Array(Math.max(opt.parallel, 1)).keys()].map(i => new CapturingBrowser(opt, mode, i).boot()),
  );
  opt.logger.debug(`Started ${browsers.length} capture browsers`);
  return browsers;
}

export async function main(opt: MainOptions) {
  const fileSystem = new FileSystem(opt);

  const storybookServer = new StorybookServer(opt.serverOptions, opt.logger);

  const storiesBrowser = new StoriesBrowser(
    {
      showBrowser: opt.showBrowser,
      storybookUrl: opt.serverOptions.storybookUrl,
    },
    opt.logger,
  );

  await storybookServer.launchIfNeeded();
  await storiesBrowser.boot();

  const allStories = await storiesBrowser.getStories();
  const mode = await detectRunMode(storiesBrowser, opt);
  storiesBrowser.close();

  const stories = filterStories(allStories, opt.include, opt.exclude);

  if (stories.length === 0) {
    opt.logger.warn('There is no matched story. Check your include/exclude options.');
  }

  const workers = await bootCapturingBrowserAsWorkers(opt, mode);

  await createScreenshotService({ workers, stories, fileSystem, logger: opt.logger }).execute();

  if (opt.showBrowser) return;

  await Promise.all(workers.map(worker => worker.close()));

  storybookServer.shutdown();
}
