import { launch, Browser as PuppeteerBrowser, Page, LaunchOptions } from 'puppeteer';
import { sleep } from '../async-utils';

export interface BaseBrowserOptions {
  launchOptions?: LaunchOptions;
}

export class BaseBrowser {
  private browser!: PuppeteerBrowser;
  protected _page!: Page;

  constructor(protected opt: BaseBrowserOptions) {}

  async boot() {
    this.browser = await launch(
      this.opt.launchOptions || {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: false,
      },
    );
    this._page = await this.browser.newPage();
    return this;
  }

  protected async openPage(url: string) {
    await this._page.goto(url);
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
