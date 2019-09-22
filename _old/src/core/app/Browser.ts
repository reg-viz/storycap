import puppeteer from 'puppeteer';
import { CLIOptions } from '../../models/options';
import { EventTypes } from '../constants';
import { ConsoleHandler, Page } from './Page';
import { StoryStore } from './StoryStore';

export type ClientMetadata = {
  clientId: number;
  clientsCount: number;
};

export class Browser {
  private readonly id: number;
  private readonly store: StoryStore;
  private readonly options: CLIOptions;
  private browser: puppeteer.Browser | null;

  public constructor(id: number, store: StoryStore, options: CLIOptions) {
    this.id = id;
    this.store = store;
    this.options = options;
    this.browser = null;
  }

  public async launch() {
    this.browser = await puppeteer.launch(JSON.parse(this.options.puppeteerLaunchConfig));
  }

  public async close() {
    if (this.browser == null) {
      throw new Error('Browser does not exist');
    }

    return this.browser.close();
  }

  public async createPage(url: string, consoleHandler: ConsoleHandler) {
    if (this.browser == null) {
      throw new Error('Browser does not exist');
    }

    const page = new Page(await this.browser.newPage(), url, this.options, consoleHandler);

    await page.exposeFunction('getPageId', () => ({
      clientId: this.id,
      clientsCount: this.options.parallel
    }));

    await page.exposeFunction('readyComponentScreenshot', (index: number) => {
      page.emit(EventTypes.COMPONENT_READY, index);
    });

    await page.exposeFunction('getScreenshotStories', () => this.store.get());

    await page.exposeFunction('failureScreenshot', (error: string) => {
      throw new Error(error);
    });

    return page;
  }
}
