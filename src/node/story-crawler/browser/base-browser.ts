import { launch, Browser as PuppeteerBrowser, Page, LaunchOptions } from 'puppeteer';
import { sleep } from '../async-utils';

export interface BaseBrowserOptions {
  launchOptions?: LaunchOptions;
}

export class BaseBrowser {
  private browser!: PuppeteerBrowser;
  protected _page!: Page;
  private debugInputResolver = () => {};
  private debugInputPromise: Promise<void> = Promise.resolve();

  constructor(protected opt: BaseBrowserOptions) {}

  async boot() {
    this.browser = await launch(
      this.opt.launchOptions || {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
      },
    );
    this._page = await this.browser.newPage();
    await this.setupDebugInput();
    return this;
  }

  protected async openPage(url: string) {
    await this._page.goto(url);
  }

  protected async setupDebugInput() {
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

  protected async waitForDebugInput() {
    if (this.opt.launchOptions && this.opt.launchOptions.headless === false) {
      // eslint-disable-next-line no-console
      console.log(
        'story-crawler waits for your input. Open Puppeteer devtool console and exec "nextStep()" to go to the next step.',
      );
      await this.debugInputPromise;
    }
  }

  get page(): Page {
    return this._page;
  }

  async close() {
    try {
      await this._page.close();
      await sleep(50);
      await this.browser.close();
    } catch (e) {
      // nothing to do
    }
  }
}
