import { BaseBrowser, BaseBrowserOptions } from './base-browser';
import { Story } from '../story-types';
import { Logger } from '../logger';
import { sleep } from '../async-utils';

const dummyV4Story: Story = {
  version: 'v4',
  id: '__dummy__/__dummy__',
  kind: '__dummy__',
  story: '__dummy__',
};

const dummyV5Story: Story = {
  version: 'v5',
  id: '__dummy__--__dummy__',
  kind: '__dummy__',
  story: '__dummy__',
};

export abstract class StoryPreviewBrowser extends BaseBrowser {
  private _currentStory?: Story;

  constructor(protected opt: BaseBrowserOptions, protected readonly idx: number, protected readonly logger: Logger) {
    super(opt);
  }

  protected debug(...args: any[]) {
    this.logger.debug.apply(this.logger, [`[cid: ${this.idx}]`, ...args]);
  }

  get currentStory() {
    return this._currentStory;
  }

  async setCurrentStory(s: Story, opt: { forceRerender?: boolean } = {}) {
    if (this._currentStory && this._currentStory.id === s.id && !!opt.forceRerender) {
      if (s.version === 'v4') {
        await this.page.evaluate(
          (d: any) => window.postMessage(JSON.stringify(d), '*'),
          this.createPostmessageData(dummyV4Story),
        );
      } else {
        await this.page.evaluate(
          (d: any) => window.postMessage(JSON.stringify(d), '*'),
          this.createPostmessageData(dummyV5Story),
        );
      }
      await sleep(50);
    }
    this._currentStory = s;
    this.debug('Set story', s.id);
    const data = this.createPostmessageData(s);
    await this.page.evaluate((d: typeof data) => window.postMessage(JSON.stringify(d), '*'), data);
  }

  private createPostmessageData(story: Story) {
    // REMARKS
    // This uses storybook post message channel, which is Storybook internal API.
    switch (story.version) {
      case 'v4':
        return {
          key: 'storybook-channel',
          event: {
            type: 'setCurrentStory',
            args: [
              {
                kind: story.kind,
                story: story.story,
              },
            ],
            from: 'storycap',
          },
        };
      case 'v5':
        return {
          key: 'storybook-channel',
          event: {
            type: 'setCurrentStory',
            args: [
              {
                storyId: story.id,
              },
            ],
            from: 'storycap',
          },
        };
    }
  }
}
