import { StorybookServer, StoriesBrowser, createExecutionService } from "./story-crawler";
import { CapturingBrowser } from "./capturing-browser";
import { filterStories } from "../util";
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

  const stories = filterStories(allStories, opt.include, opt.exclude).map(s => ({ ...s, count: 0 }));

  if (stories.length === 0) {
    opt.logger.warn("There is no matched story. Check your include/exclude options.");
  }

  const browsers = await bootCapturingBrowser(opt, mode);

  const processedStoriesMap = new Set<string>();
  stories.forEach(s => processedStoriesMap.add(s.kind + s.story));

  const service = createExecutionService(
    browsers,
    stories,
    (s, queue) => async capturingBrowser => {
      capturingBrowser.setCurrentStory(s);
      const { buffer, elapsedTime, success } = await capturingBrowser.screenshot(s.count);
      if (!success) {
        queue.push({ ...s, count: s.count + 1 });
        return;
      }
      if (buffer) {
        const path = await fileSystem.save(s.kind, s.story, buffer);
        opt.logger.log(`Screenshot stored: ${opt.logger.color.magenta(path)} in ${elapsedTime + "" || "--"} msec.`);
      }
      processedStoriesMap.delete(s.kind + s.story);
      if (processedStoriesMap.size === 0) queue.close();
    },
    {
      allowEmpty: true,
    },
  );

  await service.execute();

  if (opt.showBrowser) return;
  await Promise.all(browsers.map(b => b.close()));
  storybookServer.shutdown();
}
