import * as puppeteer from 'puppeteer';
import { EventTypes } from '../constants';
import { CLIOptions } from '../../models/options';
import { createArray } from '../utils';
import StoryStore from './StoryStore';
import Page, { ConsoleHandler } from './Page';

export default class Browser {
  private store: StoryStore;
  private options: CLIOptions;
  private browser: puppeteer.Browser;

  public constructor(store: StoryStore, options: CLIOptions) {
    this.store = store;
    this.options = options;
  }

  public async launch() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  public async close() {
    return this.browser.close();
  }

  public createPages(url: string, consoleHandler: ConsoleHandler) {
    return Promise.all(createArray(this.options.parallel).map(async () => {
      const page = new Page(
        await this.browser.newPage(),
        url,
        this.options,
        consoleHandler,
      );

      await page.exposeFunction('readyComponentScreenshot', (index: number) => {
        page.emit(EventTypes.COMPONENT_READY, index);
      });

      await page.exposeFunction('getScreenshotStories', () => (
        this.store.get()
      ));

      await page.exposeFunction('failureScreenshot', (error: string) => {
        throw new Error(error);
      });

      return page;
    }));
  }
}
