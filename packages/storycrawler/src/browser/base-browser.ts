import type { Browser as PuppeteerBrowser, Page, LaunchOptions, BrowserLaunchArgumentOptions } from 'puppeteer-core';
import { sleep } from '../async-utils';
import { findChrome } from '../find-chrome';
import { ChromiumNotFoundError } from '../errors';
import { ChromeChannel } from '../types';

function getPuppeteer() {
  const pc = require('puppeteer-core') as typeof import('puppeteer-core');
  return pc;
}

/**
 *
 * Parameter for {@link BaseBrowser}
 *
 **/
export interface BaseBrowserOptions {
  /**
   *
   * Options to launch Puppeteer Browser instance.
   *
   **/
  launchOptions?: LaunchOptions & BrowserLaunchArgumentOptions;

  /**
   *
   * Channel to search installed Chromium for.
   *
   **/
  chromiumChannel?: ChromeChannel;

  /**
   *
   * User defind Chromium execuatable binary path
   *
   **/
  chromiumPath?: string;
}

/**
 *
 * Wrapper for Puppeteer page.
 *
 **/
export abstract class BaseBrowser {
  private browser!: PuppeteerBrowser;
  private _page!: Page;
  private _executablePath = '';
  private debugInputResolver = () => {};
  private debugInputPromise: Promise<void> = Promise.resolve();
  private nextStep = process.env['STORYCAP_NEXTSTEP'] !== 'disabled';

  /**
   *
   * @param opt See {@link BaseBrowserOptions}
   *
   **/
  constructor(protected opt: BaseBrowserOptions) {}

  /**
   *
   * @returns Puppeteer Page object.
   *
   * @remarks
   * Use this after calling `boot`.
   *
   **/
  get page(): Page {
    return this._page;
  }

  /**
   *
   * Instantiates Puppeteer browser and page.
   *
   **/
  async boot() {
    const baseExecutablePath = this.opt.chromiumPath || this.opt.launchOptions?.executablePath;
    const { executablePath } = await findChrome({
      executablePath: baseExecutablePath,
      channel: this.opt.chromiumChannel,
    });
    if (!executablePath) {
      throw new ChromiumNotFoundError();
    }
    this._executablePath = executablePath;
    const puppeteer = getPuppeteer();
    this.browser = await puppeteer.launch({
      ...(this.opt.launchOptions || {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      }),
      executablePath,
    });
    this._page = await this.browser.newPage();
    await this.setupDebugInput();
    return this;
  }

  /**
   *
   * Disposes Puppeteer browser and pages.
   *
   **/
  async close() {
    try {
      await this._page.close();
      await sleep(50);
      await this.browser.close();
    } catch (e) {
      // nothing to do
    }
  }

  /**
   *
   * Get found or user defined executable Chromium binray path.
   *
   **/
  get executablePath() {
    return this._executablePath;
  }

  /**
   *
   * Waits for developer's action only if the browser is instantiated with `headless: false` .
   *
   * @example
   *
   * ```ts
   * class MyBrowser extends BaseBrowser {
   *   async doSomething() {
   *     doXxxx();
   *
   *     // This method stops until developer inputs `nextStep()` into the page's developer console
   *     await this.waitForDebugInput();
   *     doYyyy();
   *   }
   * }
   * ```
   *
   **/
  protected async waitForDebugInput() {
    if (this.opt.launchOptions && this.opt.launchOptions.headless === false && this.nextStep) {
      // eslint-disable-next-line no-console
      console.log(
        'story-crawler waits for your input. Open Puppeteer devtool console and exec "nextStep()" to go to the next step.',
      );
      await this.debugInputPromise;
    }
  }

  private async setupDebugInput() {
    if (this.opt.launchOptions && this.opt.launchOptions.headless === false && this.nextStep) {
      const resetInput: () => void = () =>
        (this.debugInputPromise = new Promise<void>(res => (this.debugInputResolver = res)).then(() => {
          setTimeout(() => resetInput(), 10);
          return;
        }));
      resetInput();
      await this._page.exposeFunction('nextStep', () => this.debugInputResolver());
    }
  }
}
