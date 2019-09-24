import { StorybookServer, StoriesBrowser, execParalell } from "./story-crawler";
import { CapturingBrowser } from "./capturing-browser";
import { filterStories } from "../util";
import { Story } from "../types";
import { MainOptions, RunMode } from "./types";
import { FileSystem } from "./file";

async function bootCapturingBrowser(opt: MainOptions, mode: RunMode) {
  const browsers = [...new Array(opt.parallel).keys()].map(i => new CapturingBrowser(opt, mode, i));
  await browsers[0].boot();
  await Promise.all(browsers.slice(1, browsers.length).map(b => b.boot()));
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

  await storiesBrowser.page.goto(opt.serverOptions.storybookUrl);
  await storiesBrowser.page.waitForNavigation();
  const registered: boolean | undefined = await storiesBrowser.page.evaluate(
    () => (window as any).__STORYCAP_MANAGED_MODE_REGISTERED__,
  );
  const mode: RunMode = registered ? "managed" : "simple";

  opt.logger.log(`storycap runs with ${mode} mode`);
  storiesBrowser.close();

  let stories = filterStories(allStories, opt.include, opt.exclude).map(s => ({ ...s, count: 0 }));

  if (stories.length === 0) {
    opt.logger.warn("There is no matched story. Check your include/exclude options.");
  }

  const browsers = await bootCapturingBrowser(opt, mode);

  while (stories.length > 0) {
    const tasks = stories.map(s => {
      return async (capturingBrowser: CapturingBrowser) => {
        await capturingBrowser.setCurrentStory(s);
        const { buffer, elapsedTime } = await capturingBrowser.screenshot(s.count);
        if (buffer) {
          const path = await fileSystem.save(s.kind, s.story, buffer);
          opt.logger.log(`Screenshot stored: ${opt.logger.color.magenta(path)} in ${elapsedTime + "" || "--"} msec.`);
        }
      };
    });

    await execParalell(tasks, browsers);
    if (opt.showBrowser) break;
    stories = browsers.reduce((acc, b) => [...acc, ...b.failedStories], [] as (Story & { count: number })[]);
  }

  if (opt.showBrowser) return;
  await Promise.all(browsers.map(b => b.close()));
  storybookServer.shutdown();
}
