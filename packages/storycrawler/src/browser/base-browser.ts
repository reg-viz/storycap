import { launch, Browser as PuppeteerBrowser, Page, LaunchOptions } from 'puppeteer';
import { sleep } from '../async-utils';

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
  launchOptions?: LaunchOptions;
}

/**
 *
 * Wrapper for Puppeteer page.
 *
 **/
export abstract class BaseBrowser {
  private browser!: PuppeteerBrowser;
  private _page!: Page;
  private debugInputResolver = () => {};
  private debugInputPromise: Promise<void> = Promise.resolve();

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
    this.browser = await launch(
      this.opt.launchOptions || {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      },
    );
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
    if (this.opt.launchOptions && this.opt.launchOptions.headless === false) {
      // eslint-disable-next-line no-console
      console.log(
        'story-crawler waits for your input. Open Puppeteer devtool console and exec "nextStep()" to go to the next step.',
      );
      await this.debugInputPromise;
    }
  }

  private async setupDebugInput() {
    if (this.opt.launchOptions && this.opt.launchOptions.headless === false) {
      const resetInput: () => void = () =>
        (this.debugInputPromise = new Promise(res => (this.debugInputResolver = res)).then(() => {
          setTimeout(() => resetInput(), 10);
          return;
        }));
      resetInput();
      await this._page.exposeFunction('nextStep', () => this.debugInputResolver());
    }
  }
}
