import { BaseBrowser, BaseBrowserOptions } from './base-browser';
import { Logger } from '../logger';
import { NoStoriesError, StoriesTimeoutError } from '../errors';
import { Story } from '../story-types';
import { StorybookConnection } from '../storybook-connection';

interface API {
  store?: () => {
    _configuring?: boolean; // available SB v6 or later
  };
  storyStore?: {
    // available SB v6.4 or later
    cacheAllCSFFiles: () => Promise<void>;
    cachedCSFFiles?: Record<string, unknown>;
  };
  raw?: () => { id: string; kind: string; name: string }[]; // available SB v5 or later
}

type ExposedWindow = typeof window & {
  __STORYBOOK_CLIENT_API__: API;
};

/**
 *
 * Browser class to fetch all stories names.
 *
 **/
export class StoriesBrowser extends BaseBrowser {
  /**
   *
   * @param connection Connected connection to the target Storybook server
   * @param opt Options to launch browser
   * @param logger Logger instance
   *
   **/
  constructor(
    protected connection: StorybookConnection,
    protected opt: BaseBrowserOptions = {},
    protected logger: Logger = new Logger('silent'),
  ) {
    super(opt);
  }

  /**
   *
   * Fetches stories' id, kind and names
   *
   * @returns List of stories
   *
   * @remarks
   * This method automatically detects version of the Storybook.
   *
   **/
  async getStories() {
    this.logger.debug('Wait for stories definition.');
    await this.page.goto(this.connection.url);
    let stories: Story[] | null = null;
    await this.page.goto(
      this.connection.url + '/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story',
      {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      },
    );
    await this.page.waitForFunction(() => (window as ExposedWindow).__STORYBOOK_CLIENT_API__, {
      timeout: 60_000,
    });
    await this.page.evaluate(() => {
      const { __STORYBOOK_CLIENT_API__: api } = window as ExposedWindow;
      api.storyStore && api.storyStore.cacheAllCSFFiles();
    });
    const result = await this.page.evaluate(
      () =>
        new Promise<{ stories: Story[] | null; timeout: boolean }>(res => {
          const getStories = (count = 0) => {
            const MAX_CONFIGURE_WAIT_COUNT = 4_000;
            const { __STORYBOOK_CLIENT_API__: api } = window as ExposedWindow;
            if (api.raw) {
              // for Storybook v6
              const configuring = api.store && api.store()._configuring;
              // for Storybook v6 and 'storyStoreV7' option
              const configuringV7store = api.storyStore && !api.storyStore.cachedCSFFiles;

              if (configuring || configuringV7store) {
                if (count < MAX_CONFIGURE_WAIT_COUNT) {
                  setTimeout(() => getStories(++count), 16);
                } else {
                  res({ stories: null, timeout: true });
                }
                return;
              }
              // for Storybook v5
              const stories = api.raw().map(_ => ({ id: _.id, kind: _.kind, story: _.name, version: 'v5' } as Story));
              res({ stories, timeout: false });
            }
          };
          getStories();
        }),
    );
    if (result.timeout) {
      throw new StoriesTimeoutError();
    }
    stories = result.stories;
    if (!stories) {
      throw new NoStoriesError();
    }
    this.logger.debug(stories);
    return stories;
  }
}
