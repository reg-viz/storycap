import { EventEmitter } from 'events';
import { parse } from 'url';
import querystring from 'querystring';
import { Viewport } from 'puppeteer';
import { StoryPreviewBrowser, MetricsWatcher } from './story-crawler';

import { ExposedWindow, MainOptions, RunMode } from './types';
import { ScreenshotOptions, ScreenshotOptionsForApp, StrictScreenshotOptions } from '../client/types';
import { ScreenshotTimeoutError, InvalidCurrentStoryStateError } from './errors';
import { VariantKey } from '../types';
import {
  createBaseScreenshotOptions,
  mergeScreenshotOptions,
  extractVariantKeys,
  pickupFromVariantKey,
} from '../util/screenshot-options-helper';
import { sleep } from '../util';
const dd = require('puppeteer/DeviceDescriptors') as { name: string; viewport: Viewport }[];

function url2StoryKey(url: string) {
  const q = parse(url).query || '';
  const { id, selectedKind: kind, selectedStory: story } = querystring.parse(q);
  if (!id) {
    if (!kind || Array.isArray(kind) || !story || Array.isArray(story)) return;
    return `${kind}/${story}`;
  } else {
    if (Array.isArray(id)) return;
    return id;
  }
}

export class CapturingBrowser extends StoryPreviewBrowser {
  private currentStoryRetryCount = 0;
  private viewport?: Viewport;
  private emitter: EventEmitter;
  private readonly processedStories = new Set<string>();
  private baseScreenshotOptions: StrictScreenshotOptions;
  private currentRequestId!: string;
  private currentVariantKey: VariantKey = { isDefault: true, keys: [] };
  private touched = false;

  constructor(protected opt: MainOptions, private mode: RunMode, idx: number) {
    super(opt, idx, opt.logger);
    this.emitter = new EventEmitter();
    this.emitter.on('error', e => {
      throw e;
    });
    this.baseScreenshotOptions = createBaseScreenshotOptions(opt);
  }

  async boot() {
    await super.boot();
    await this.expose();
    await this.addStyles();
    await this.openPage(
      this.opt.serverOptions.storybookUrl + '/iframe.html?selectedKind=scszisui&selectedStory=scszisui',
    );
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
  caret-color: transparentt !important;
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
    this.page.exposeFunction('emitCatpture', (opt: any, clientStoryKey: string) =>
      this.handleOnCapture(opt, clientStoryKey),
    );
    this.page.exposeFunction('getBaseScreenshotOptions', () => this.baseScreenshotOptions);
    this.page.exposeFunction('getCurrentStoryKey', (url: string) => url2StoryKey(url));
    this.page.exposeFunction('getCurrentVariantKey', () => this.currentVariantKey);
    this.page.exposeFunction('waitBrowserMetricsStable', () => this.waitBrowserMetricsStable('preEmit'));
  }

  private async resetIfTouched() {
    const story = this.currentStory;
    if (!this.touched || !story) return;
    this.debug('Reset story because page state got dirty in this request.', this.currentRequestId);
    await this.setCurrentStory(story, { forceRerender: true });
    this.touched = false;
    return;
  }

  private async handleOnCapture(opt: ScreenshotOptionsForApp, clientStoryKey: string) {
    if (this.touched) return;
    if (!this.currentStory) {
      this.emitter.emit('error', new InvalidCurrentStoryStateError());
      return;
    }
    if (this.currentStory.id !== clientStoryKey) {
      this.debug('This options was sent from previous story', this.currentStory.id, clientStoryKey);
      return;
    }
    if (this.processedStories.has(this.currentRequestId)) {
      this.debug(
        'This story was already processed:',
        this.currentRequestId,
        this.currentStory.kind,
        this.currentStory.story,
        this.currentVariantKey,
        JSON.stringify(opt),
      );
      return;
    }
    this.processedStories.add(this.currentRequestId);
    this.debug(
      'Start to process to screenshot story:',
      this.currentRequestId,
      this.currentStory.kind,
      this.currentStory.story,
      this.currentVariantKey,
      JSON.stringify(opt),
    );
    this.emitter.emit('screenshotOptions', opt);
  }

  private async waitScreenShotOption() {
    return new Promise<ScreenshotOptions | undefined>((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let id: NodeJS.Timer;
      const cb = (opt?: ScreenshotOptions) => {
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
        if (this.currentStoryRetryCount < this.opt.captureMaxRetryCount) {
          this.opt.logger.warn(
            `Capture timeout exceeded in ${this.opt.captureTimeout +
              ''} msec. Retry to screenshot this story after this sequence.`,
            this.currentStory.kind,
            this.currentStory.story,
          );
          resolve();
          return;
        }
        reject(new ScreenshotTimeoutError(this.opt.captureTimeout, this.currentStory));
      }, this.opt.captureTimeout);
      this.emitter.once('screenshotOptions', cb);
    });
  }

  private async setViewport(opt: StrictScreenshotOptions) {
    if (!this.currentStory) {
      throw new InvalidCurrentStoryStateError();
    }
    let nextViewport: Viewport;
    if (typeof opt.viewport === 'string') {
      if (opt.viewport.match(/^\d+$/)) {
        nextViewport = { width: +opt.viewport, height: 600 };
      } else if (opt.viewport.match(/^\d+x\d+$/)) {
        const [w, h] = opt.viewport.split('x');
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
      this.debug('Change viewport', JSON.stringify(nextViewport));
      await this.page.setViewport(nextViewport);
      this.viewport = nextViewport;
      if (this.opt.reloadAfterChangeViewport) {
        this.processedStories.delete(this.currentRequestId);
        await Promise.all([this.page.reload(), this.waitScreenShotOption()]);
      } else {
        await sleep(this.opt.viewportDelay);
      }
    }
    return true;
  }

  private async warnIfTargetElementNotFound(selector: string) {
    const targetElement = await this.page.$(selector);
    if (this.currentStory && !targetElement) {
      this.logger.warn(
        `No matched element for "${this.logger.color.yellow(selector)}" in story "${this.currentStory.id}".`,
      );
    }
  }

  private async setHover(screenshotOptions: StrictScreenshotOptions) {
    if (!screenshotOptions.hover) return;
    await this.warnIfTargetElementNotFound(screenshotOptions.hover);
    await this.page.hover(screenshotOptions.hover);
    this.touched = true;
    return;
  }

  private async setFocus(screenshotOptions: StrictScreenshotOptions) {
    if (!screenshotOptions.focus) return;
    await this.warnIfTargetElementNotFound(screenshotOptions.focus);
    await this.page.focus(screenshotOptions.focus);
    this.touched = true;
    return;
  }

  private async waitBrowserMetricsStable(phase: 'preEmit' | 'postEmit') {
    const mw = new MetricsWatcher(this.page, this.opt.metricsWatchRetryCount);
    const checkCountUntillStable = await mw.waitForStable();
    this.debug(`[${phase}] Browser metrics got stable in ${checkCountUntillStable} times checks.`);
    if (checkCountUntillStable >= this.opt.metricsWatchRetryCount) {
      this.opt.logger.warn(
        `Metrics is not stable while ${this.opt.metricsWatchRetryCount} times. ${this.opt.logger.color.yellow(
          JSON.stringify(this.currentStory),
        )}`,
      );
    }
  }

  async screenshot(requestId: string, variantKey: VariantKey, retryCount: number) {
    this.currentRequestId = requestId;
    this.currentVariantKey = variantKey;
    this.currentStoryRetryCount = retryCount;
    let emittedScreenshotOptions: ScreenshotOptions | undefined;
    if (this.mode === 'managed') {
      emittedScreenshotOptions = await this.waitScreenShotOption();
      if (!this.currentStory) {
        throw new InvalidCurrentStoryStateError();
      }
      if (!emittedScreenshotOptions) {
        return { buffer: null, succeeded: false, variantKeysToPush: [], defaultVariantSuffix: '' };
      }
      if (emittedScreenshotOptions.skip) {
        return { buffer: null, succeeded: true, variantKeysToPush: [], defaultVariantSuffix: '' };
      }
    } else {
      await sleep(this.opt.delay);
      emittedScreenshotOptions = pickupFromVariantKey(this.baseScreenshotOptions, this.currentVariantKey);
    }
    const mergedScreenshotOptions = mergeScreenshotOptions(this.baseScreenshotOptions, emittedScreenshotOptions);
    this.touched = false;
    const changed = await this.setViewport(mergedScreenshotOptions);
    if (!changed) return { buffer: null, succeeded: true, variantKeysToPush: [], defaultVariantSuffix: '' };
    await this.setHover(mergedScreenshotOptions);
    await this.setFocus(mergedScreenshotOptions);
    await this.waitBrowserMetricsStable('postEmit');
    await this.page.evaluate(
      () => new Promise(res => (window as ExposedWindow).requestIdleCallback(() => res(), { timeout: 3000 })),
    );
    const [invalidReason, keys] = extractVariantKeys(mergedScreenshotOptions);
    if (invalidReason) {
      if (invalidReason.type === 'notFound') {
        this.logger.warn(
          `Invalid variants. The variant key '${invalidReason.to}' does not exist(story id: ${this.currentStory!.id}).`,
        );
      } else if (invalidReason.type === 'circular') {
        this.logger.warn(
          `Invalid variants. Reference ${invalidReason.refs.join(' -> ')} is circular(story id: ${
            this.currentStory!.id
          }).`,
        );
      }
    }
    const variantKeysToPush = this.currentVariantKey.isDefault ? keys : [];
    const buffer = await this.page.screenshot({ fullPage: emittedScreenshotOptions.fullPage });
    await this.resetIfTouched();
    return {
      buffer,
      succeeded: true,
      variantKeysToPush,
      defaultVariantSuffix: emittedScreenshotOptions.defaultVariantSuffix,
    };
  }
}
