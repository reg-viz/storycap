import * as puppeteer from 'puppeteer';
import { EventTypes } from '../constants';
import { CLIOptions } from '../../models/options';
import StoryStore from './StoryStore';
import Page, { ConsoleHandler } from './Page';

export type ClientMetadata = {
  clientId: number;
  clientsCount: number;
};

export default class Browser {
  private readonly id: number;
  private readonly store: StoryStore;
  private readonly options: CLIOptions;
  private browser: puppeteer.Browser;

  public constructor(id: number, store: StoryStore, options: CLIOptions) {
    this.id = id;
    this.store = store;
    this.options = options;
  }

  public async launch() {
    this.browser = await puppeteer.launch(JSON.parse(this.options.puppeteerLaunchConfig));
  }

  public async close() {
    return this.browser.close();
  }

  public async createPage(url: string, consoleHandler: ConsoleHandler) {
    const page = new Page(await this.browser.newPage(), url, this.options, consoleHandler);

    await page.exposeFunction(
      'getPageId',
      () =>
        ({
          clientId: this.id,
          clientsCount: this.options.parallel
        } as ClientMetadata)
    );

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
