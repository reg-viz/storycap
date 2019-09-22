import { EventEmitter } from 'events';
import * as path from 'path';
import puppeteer from 'puppeteer';
import * as qs from 'query-string';
import { CLIOptions } from '../../models/options';
import { StoredStory, StoryWithOptions } from '../../models/story';
import { EventTypes, PhaseIdentity, PhaseTypes } from '../constants';
import { knobsQueryObject } from '../utils';

export interface ConsoleHandler {
  (type: string, text: string): void;
}

export class Page extends EventEmitter {
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
        consoleHandler(data.type.toString(), <any>data.text);
      }
    });
  }

  public async goto(phase: string, query: object = {}) {
    const q = {
      ...query,
      full: 1,
      [PhaseIdentity]: phase
    };

    const url = `${this.url}?${qs.stringify(q)}`;

    await this.page.goto(url, {
      timeout: this.options.browserTimeout,
      waitUntil: ['domcontentloaded', 'networkidle2']
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

    await this.page.bringToFront();

    const file = path.join(outputDir, story.filename);

    await Promise.all(
      injectFiles.map((fpath) =>
        this.page.addScriptTag({
          path: fpath
        })
      )
    );

    await this.page.screenshot({
      path: path.resolve(cwd, file),
      fullPage: true
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

  // tslint:disable-next-line: no-any
  public async exposeFunction(name: string, fn: (...args: any[]) => any) {
    return this.page.exposeFunction(name, fn);
  }

  private waitComponentReady() {
    return new Promise((resolve) => {
      this.once(EventTypes.COMPONENT_READY, resolve);
    });
  }
}
