import { BaseBrowser, BaseBrowserOptions } from './base-browser';
import { Logger } from '../logger';
import { NoStoriesError } from '../errors';
import { Story, StoryKind, V5Story } from '../story-types';
import { flattenStories } from '../flatten-stories';

export interface StoriesBrowserOptions extends BaseBrowserOptions {
  storybookUrl: string;
}

interface API {
  raw?: () => { id: string; kind: string; name: string }[];
  getStorybook(): { kind: string; stories: { name: string }[] }[];
}

type ExposedWindow = typeof window & {
  __STORYBOOK_CLIENT_API__: API;
};

export class StoriesBrowser extends BaseBrowser {
  constructor(protected opt: StoriesBrowserOptions, protected logger: Logger) {
    super(opt);
  }

  async getStories() {
    this.logger.debug('Wait for stories definition.');
    await this.openPage(this.opt.storybookUrl);
    let stories: Story[] | null = null;
    let oldStories: StoryKind[] | null = null;
    await this._page.goto(
      this.opt.storybookUrl + '/iframe.html?selectedKind=story-crawler-kind&selectedStory=story-crawler-story',
    );
    await this._page.waitFor(() => (window as ExposedWindow).__STORYBOOK_CLIENT_API__);
    const result = await this._page.evaluate(() => {
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
    this.logger.log(`Found ${this.logger.color.green(stories.length + '')} stories.`);
    return stories;
  }
}
