import { BaseBrowser, BaseBrowserOptions } from './base-browser';
import { Logger } from '../logger';
import { NoStoriesError } from '../errors';
import { Story, StoryKind, V5Story } from '../story-types';
import { flattenStories } from '../flatten-stories';
import { StorybookConnection } from '../storybook-connection';

interface API {
  raw?: () => { id: string; kind: string; name: string }[];
  getStorybook(): { kind: string; stories: { name: string }[] }[];
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
    let oldStories: StoryKind[] | null = null;
    await this.page.goto(
      this.connection.url + '/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story',
    );
    await this.page.waitFor(() => (window as ExposedWindow).__STORYBOOK_CLIENT_API__);
    const result = await this.page.evaluate(() => {
      const win = window as ExposedWindow;
      if (win.__STORYBOOK_CLIENT_API__.raw) {
        // for storybook v5
        const stories = win.__STORYBOOK_CLIENT_API__
          .raw()
          .map(_ => ({ id: _.id, kind: _.kind, story: _.name, version: 'v5' } as V5Story));
        return { stories, oldStories: null };
      } else {
        // for storybook v4
        const oldStories = win.__STORYBOOK_CLIENT_API__
          .getStorybook()
          .map(({ kind, stories }) => ({ kind, stories: stories.map(s => s.name) }));
        return { stories: null, oldStories };
      }
    });
    stories = result.stories;
    oldStories = result.oldStories;
    if (oldStories) {
      stories = flattenStories(oldStories);
    }
    if (!stories) {
      throw new NoStoriesError();
    }
    this.logger.debug(stories);
    return stories;
  }
}
