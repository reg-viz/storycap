import { EventEmitter } from 'events';
import * as path from 'path';
import * as qs from 'query-string';
import * as puppeteer from 'puppeteer';
import { PhaseIdentity, PhaseTypes, EventTypes } from '../constants';
import { StoryWithOptions, StoredStory } from '../../models/story';
import { CLIOptions } from '../../models/options';
import { knobsQueryObject } from '../utils';

export interface ConsoleHandler {
  (type: string, text: string): void;
}

export default class Page extends EventEmitter {
  private page: puppeteer.Page;
  private url: string;
  private options: CLIOptions;

  public constructor(
    page: puppeteer.Page,
    url: string,
    options: CLIOptions,
    consoleHandler: ConsoleHandler
  ) {
    super();

    this.page = page;
    this.url = url;
    this.options = options;

    this.page.on('console', (data: puppeteer.ConsoleMessage) => {
      if (typeof data.type === 'function') {
        consoleHandler(data.type(), data.text());
      } else {
        // it IS a string, by fact. Type definitions are wrong
        // @ts-ignore
        consoleHandler(data.type as string, data.text as string);
      }
    });
  }

  public async goto(phase: string, query: object = {}) {
    const q = {
      ...query,
      full: 0,
      addons: 0,
      stories: 0,
      panelRight: 0,
      [PhaseIdentity]: phase
    };

    const url = `${this.url}?${qs.stringify(q)}`;

    return this.page.goto(url, {
      timeout: this.options.browserTimeout,
      waitUntil: 'domcontentloaded'
    });
  }

  public async screenshot(story: StoredStory) {
    const { cwd, outputDir, injectFiles } = this.options;

    await this.page.setViewport(story.viewport);

    await Promise.all([
      this.waitComponentReady(),
      this.goto(PhaseTypes.CAPTURE, {
        selectKind: story.kind,
        selectStory: story.story,
        ...knobsQueryObject(story.knobs)
      })
    ]);

    const file = path.join(outputDir, story.filename);

    await Promise.all(
      injectFiles.map((fpath) =>
        this.page.addScriptTag({
          path: fpath
        })
      )
    );

    const frameName = 'storybook-preview-iframe';

    const frame = await this.page.frames().find((f) => f.name() === frameName);
    if (frame == null) {
      throw new Error(`"${frameName}" not founded, Probably failed navigation...`);
    }

    const body = await frame.$('body');
    if (body == null) {
      throw new Error(`"body" element not found in "${frameName}"`);
    }

    await body.screenshot({
      path: path.resolve(cwd, file)
    });

    return file;
  }

  public exposeSetScreenshotStories() {
    return this.exposeFunction('setScreenshotStories', (stories: StoryWithOptions[]) => {
      this.emit('handleScreenshotStories', stories);
    });
  }

  public waitScreenshotStories() {
    return new Promise<StoryWithOptions[]>((resolve) => {
      this.once('handleScreenshotStories', (stories: StoryWithOptions[]) => {
        resolve(stories);
      });
    });
  }

  public async exposeFunction(name: string, fn: (...args: any[]) => any) {
    return this.page.exposeFunction(name, fn);
  }

  private waitComponentReady() {
    return new Promise((resolve) => {
      this.once(EventTypes.COMPONENT_READY, resolve);
    });
  }
}
