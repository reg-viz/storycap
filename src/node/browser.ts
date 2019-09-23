import { StoryKind } from "@storybook/addons";
import { EventEmitter } from "events";
import { parse } from "url";
import querystring from "querystring";
import { launch, Browser as PuppeteerBrowser, Page, Viewport, Metrics } from "puppeteer";

import { ExposedWindow, MainOptions, RunMode } from "./types";
import { ScreenShotOptions, ScreenShotOptionsForApp } from "../client/types";
import { ScreenshotTimeoutError, InvalidCurrentStoryStateError, NoStoriesError } from "./errors";
import { Story, V5Story } from "../types";
import { flattenStories, sleep } from "../util";
import { defaultScreenshotOptions } from "../client/default-screenshot-options";
const dd = require("puppeteer/DeviceDescriptors") as { name: string; viewport: Viewport }[];

function url2StoryKey(url: string) {
  const q = parse(url).query || "";
  const { id, selectedKind: kind, selectedStory: story } = querystring.parse(q);
  if (!id) {
    if (!kind || Array.isArray(kind) || !story || Array.isArray(story)) return;
    return `${kind}/${story}`;
  } else {
    if (Array.isArray(id)) return;
    return id;
  }
}

class MetricsWatcher {
  private length = 3;
  private previous: Metrics[] = [];

  constructor(private page: Page, private count: number) {}

  async waitForStable() {
    for (let i = this.count; i > 0; --i) {
      if (await this.check()) return i;
      await sleep(20);
    }
    return 0;
  }

  private async check() {
    const current = await this.page.metrics();
    if (this.previous.length < this.length) return this.next(current);
    if (this.diff("Nodes")) return this.next(current);
    if (this.diff("RecalcStyleCount")) return this.next(current);
    if (this.diff("LayoutCount")) return this.next(current);
    return true;
  }

  private diff(k: keyof Metrics) {
    for (let i = 1; i < this.previous.length; ++i) {
      if (this.previous[i][k] !== this.previous[0][k]) return true;
    }
    return false;
  }

  private next(m: Metrics) {
    this.previous.push(m);
    this.previous = this.previous.slice(-this.length);
    return false;
  }
}

export class Browser {
  private browser!: PuppeteerBrowser;
  protected page!: Page;

  constructor(protected opt: MainOptions) {}

  async boot() {
    this.browser = await launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: !this.opt.showBrowser,
    });
    this.page = await this.browser.newPage();
    return this;
  }

  protected async openPage(url: string) {
    await this.page.goto(url);
  }

  async close() {
    try {
      await this.page.close();
      await sleep(50);
      await this.browser.close();
    } catch (e) {
      // nothing to do
    }
  }
}

export class StorybookBrowser extends Browser {
  async getStories() {
    this.opt.logger.debug("Wait for stories definition.");
    await this.openPage(this.opt.storybookUrl);
    const registered: boolean | undefined = await this.page.evaluate(
      () => (window as any).__STORYCAP_MANAGED_MODE_REGISTERED__,
    );
    let stories: Story[] | null = null;
    let oldStories: StoryKind[] | null = null;
    if (registered) {
      const storiesObj = (await this.page
        .waitFor(() => (window as ExposedWindow).stories)
        .then(x => x.jsonValue())) as (StoryKind[] | { [id: string]: V5Story });
      if (Array.isArray(storiesObj)) {
        // for managed mode with storybook v4
        oldStories = storiesObj;
      } else {
        // for managed mode with storybook v5
        stories = Object.keys(storiesObj).map(id => {
          return {
            id,
            kind: storiesObj[id].kind,
            story: storiesObj[id].story,
            version: "v5",
          } as V5Story;
        });
      }
    } else {
      await this.page.goto(this.opt.storybookUrl + "/iframe.html?selectedKind=scszisui&selectedStory=scszisui");
      await this.page.waitFor(() => (window as ExposedWindow).__STORYBOOK_CLIENT_API__);
      const result = await this.page.evaluate(() => {
        const win = window as ExposedWindow;
        if (win.__STORYBOOK_CLIENT_API__.raw) {
          // for simple mode with storybook v5
          // .raw API exsits only if storybook v5
          const stories = win.__STORYBOOK_CLIENT_API__
            .raw()
            .map(_ => ({ id: _.id, kind: _.kind, story: _.name, version: "v5" } as V5Story));
          return { stories, oldStories: null };
        } else {
          // for simple mode with storybook v4
          const oldStories = win.__STORYBOOK_CLIENT_API__
            .getStorybook()
            .map(({ kind, stories }) => ({ kind, stories: stories.map(s => s.name) }));
          return { stories: null, oldStories };
        }
      });
      stories = result.stories;
      oldStories = result.oldStories;
    }
    if (oldStories) {
      stories = flattenStories(oldStories);
    }
    if (!stories) {
      throw new NoStoriesError();
    }
    this.opt.logger.debug(stories);
    this.opt.logger.log(`Found ${this.opt.logger.color.green(stories.length + "")} stories.`);
    return { stories, managed: registered };
  }
}

export class PreviewBrowser extends Browser {
  failedStories: (Story & { count: number })[] = [];
  private viewport?: Viewport;
  private emitter: EventEmitter;
  private currentStory?: Story & { count: number };
  private processStartTime = 0;
  private processedStories: { [key: string]: Story } = {};

  constructor(mainOptions: MainOptions, private mode: RunMode, private idx: number) {
    super(mainOptions);
    this.emitter = new EventEmitter();
    this.emitter.on("error", e => {
      throw e;
    });
  }

  private debug(...args: any[]) {
    this.opt.logger.debug.apply(this.opt.logger, [`[cid: ${this.idx}]`, ...args]);
  }

  async boot() {
    await super.boot();
    await this.expose();
    await this.addStyles();
    await this.openPage(this.opt.storybookUrl + "/iframe.html?selectedKind=scszisui&selectedStory=scszisui");
    await this.addStyles();
    return this;
  }

  private async addStyles() {
    if (this.opt.disableCssAnimation) {
      await this.page.addStyleTag({
        content: `
*, *::before, *::after {
  transition: none !important;
  animation: none !important;
}
        `,
      });
      await this.page.addScriptTag({
        content: `
const $doc = document;
const $style = $doc.createElement('style');
$style.innerHTML = "body *, body *::before, body *::after { transition: none !important; animation: none !important; caret-color: transparent !important; }";
$doc.body.appendChild($style);
        `,
      });
    }
  }

  private async expose() {
    this.page.exposeFunction("emitCatpture", (opt: any) => this.handleOnCapture(opt));
    this.page.exposeFunction("getCurrentStoryKey", (url: string) => url2StoryKey(url));
  }

  private async handleOnCapture(opt: ScreenShotOptionsForApp) {
    if (!this.currentStory) {
      this.emitter.emit("error", new InvalidCurrentStoryStateError());
      return;
    }
    if (this.processedStories[this.currentStory.kind + this.currentStory.story]) {
      this.debug(
        "This story was already processed:",
        this.currentStory.kind,
        this.currentStory.story,
        JSON.stringify(opt),
      );
      return;
    }
    this.processedStories[this.currentStory.kind + this.currentStory.story] = this.currentStory;
    this.debug(
      "Start to process to screenshot story:",
      this.currentStory.kind,
      this.currentStory.story,
      JSON.stringify(opt),
    );
    this.emitter.emit("screenshotOptions", opt);
  }

  private waitScreenShotOption() {
    return new Promise<ScreenShotOptions | undefined>((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let id: NodeJS.Timer;
      const cb = (opt?: ScreenShotOptions) => {
        resolve(opt);
        this.emitter.removeAllListeners();
        clearTimeout(id);
      };
      id = setTimeout(() => {
        this.emitter.removeAllListeners();
        if (!this.currentStory) {
          reject(new InvalidCurrentStoryStateError());
          return;
        }
        if (this.currentStory.count < this.opt.captureMaxRetryCount) {
          this.opt.logger.warn(
            `Capture timeout exceeded in ${this.opt.captureTimeout +
              ""} msec. Retry to screenshot this story after this sequence.`,
            this.currentStory.kind,
            this.currentStory.story,
            this.currentStory.count + 1,
          );
          this.failedStories.push({ ...this.currentStory, count: this.currentStory.count + 1 });
          resolve();
          return;
        }
        reject(new ScreenshotTimeoutError(this.opt.captureTimeout, this.currentStory));
      }, this.opt.captureTimeout);
      this.emitter.once("screenshotOptions", cb);
    });
  }

  private async setViewport(opt: ScreenShotOptions) {
    if (!this.currentStory) {
      throw new InvalidCurrentStoryStateError();
    }
    let nextViewport: Viewport;
    if (typeof opt.viewport === "string") {
      if (opt.viewport.match(/^\d+$/)) {
        nextViewport = { width: +opt.viewport, height: 600 };
      } else if (opt.viewport.match(/^\d+x\d+$/)) {
        const [w, h] = opt.viewport.split("x");
        nextViewport = { width: +w, height: +h };
      } else {
        const hit = dd.find(d => d.name === opt.viewport);
        if (!hit) {
          this.opt.logger.warn(
            `Skip screenshot for ${this.opt.logger.color.yellow(
              JSON.stringify(this.currentStory),
            )} because the viewport ${this.opt.logger.color.magenta(
              opt.viewport,
            )} is not registered in 'puppeteer/DeviceDescriptor'.`,
          );
          return false;
        }
        nextViewport = hit.viewport;
      }
    } else {
      nextViewport = opt.viewport;
    }
    if (!this.viewport || JSON.stringify(this.viewport) !== JSON.stringify(nextViewport)) {
      this.debug("Change viewport", JSON.stringify(nextViewport));
      await this.page.setViewport(nextViewport);
      this.viewport = nextViewport;
      if (this.opt.reloadAfterChangeViewport) {
        delete this.processedStories[this.currentStory.kind + this.currentStory.story];
        await Promise.all([this.page.reload(), this.waitScreenShotOption()]);
      } else {
        await sleep(this.opt.viewportDelay);
      }
    }
    return true;
  }

  private async waitBrowserMetricsStable() {
    const mw = new MetricsWatcher(this.page, this.opt.metricsWatchRetryCount);
    const count = await mw.waitForStable();
    this.debug(`Retry to watch metrics ${this.opt.metricsWatchRetryCount - count} times.`);
    if (count <= 0) {
      this.opt.logger.warn(
        `Metrics is not stable while ${this.opt.metricsWatchRetryCount} times. ${this.opt.logger.color.yellow(
          JSON.stringify(this.currentStory),
        )}`,
      );
    }
  }

  async screenshot() {
    this.processStartTime = Date.now();
    let opt: ScreenShotOptions | undefined = { ...defaultScreenshotOptions, viewport: this.opt.defaultViewport };
    if (this.mode === "managed") {
      opt = await this.waitScreenShotOption();
      if (!this.currentStory) {
        throw new InvalidCurrentStoryStateError();
      }
      if (!opt || opt.skip) {
        const elapsedTime = Date.now() - this.processStartTime;
        return { ...this.currentStory, buffer: null, elapsedTime };
      } else if (!opt.viewport) {
        opt.viewport = this.opt.defaultViewport;
      }
    }
    const succeeded = await this.setViewport(opt);
    if (!succeeded) return { ...this.currentStory, buffer: null, elapsedTime: 0 };
    await this.waitBrowserMetricsStable();
    await this.page.evaluate(
      () => new Promise(res => (window as ExposedWindow).requestIdleCallback(() => res(), { timeout: 300 })),
    );
    const buffer = await this.page.screenshot({ fullPage: opt ? opt.fullPage : true });
    const elapsedTime = Date.now() - this.processStartTime;
    return { ...this.currentStory, buffer, elapsedTime };
  }

  async setCurrentStory(s: Story & { count: number }) {
    this.currentStory = s;
    this.debug("Set story", s.kind, s.story);
    const data = this.createPostmessageData(s);
    await this.page.evaluate((d: typeof data) => window.postMessage(JSON.stringify(d), "*"), data);
  }

  private createPostmessageData(story: Story) {
    // REMARKS
    // zisue uses storybook post message channel, which is Storybook internal API.
    switch (story.version) {
      case "v4":
        return {
          key: "storybook-channel",
          event: {
            type: "setCurrentStory",
            args: [
              {
                kind: story.kind,
                story: story.story,
              },
            ],
            from: "storycap",
          },
        };
      case "v5":
        return {
          key: "storybook-channel",
          event: {
            type: "setCurrentStory",
            args: [
              {
                storyId: story.id,
              },
            ],
            from: "storycap",
          },
        };
    }
  }
}
