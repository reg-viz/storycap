import { BaseBrowser, BaseBrowserOptions } from './base-browser.js';
import { Story } from '../story-types.js';
import { Logger } from '../logger.js';
import { sleep } from '../async-utils.js';
import { StorybookConnection } from '../storybook-connection.js';

const dummyStory: Story = {
  version: 'v5',
  id: '__dummy__--__dummy__',
  kind: '__dummy__',
  story: '__dummy__',
};

/**
 *
 * Browser class to visit Storybook's preview window.
 *
 **/
export class StoryPreviewBrowser extends BaseBrowser {
  private _currentStory?: Story;

  /**
   *
   * @param connection Connected connection to the target Storybook
   * @param idx Index number of this browser
   * @param opt Options to launch browser
   * @param logger Logger instance
   *
   **/
  constructor(
    protected connection: StorybookConnection,
    protected readonly idx = 0,
    protected opt: BaseBrowserOptions = {},
    protected readonly logger: Logger = new Logger('silent'),
  ) {
    super(opt);
  }

  /**
   *
   * @override
   *
   **/
  async boot() {
    await super.boot();
    await this.page.goto(this.connection.url + '/iframe.html?selectedKind=scszisui&selectedStory=scszisui', {
      timeout: 60_000,
      waitUntil: 'domcontentloaded',
    });
    return this;
  }

  /**
   *
   * @returns Story which this instance visit
   *
   **/
  get currentStory() {
    return this._currentStory;
  }

  /**
   *
   * Triggers to change story to display in the browser page's frame
   *
   * @param story Target story
   * @param opt: Options
   *
   * @remarks
   * To resolve of this method **does not** mean completion of rendering the target story.
   *
   **/
  async setCurrentStory(story: Story, opt: { forceRerender?: boolean } = {}) {
    if (this._currentStory && this._currentStory.id === story.id && !!opt.forceRerender) {
      await this.page.evaluate(
        (d: any) => window.postMessage(JSON.stringify(d), '*'),
        this.createPostmessageData(dummyStory),
      );
      await sleep(50);
    }
    this._currentStory = story;
    this.debug('Set story', story.id);
    const data = this.createPostmessageData(story);
    await this.page.evaluate((d: typeof data) => window.postMessage(JSON.stringify(d), '*'), data);
  }

  /**
   *
   * Logs debug message with the index number
   *
   **/
  protected debug(...args: any[]) {
    this.logger.debug.apply(this.logger, [`[cid: ${this.idx}]`, ...args]);
  }

  private createPostmessageData(story: Story) {
    // REMARKS
    // This uses storybook post message channel, which is Storybook internal API.
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
