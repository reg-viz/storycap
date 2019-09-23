import { BaseBrowser, BaseBrowserOptions } from "./base-browser";
import { Story } from "../story-types";
import { Logger } from "../logger";

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

  async setCurrentStory(s: Story) {
    this._currentStory = s;
    this.debug("Set story", s.kind, s.story);
    const data = this.createPostmessageData(s);
    await this.page.evaluate((d: typeof data) => window.postMessage(JSON.stringify(d), "*"), data);
  }

  private createPostmessageData(story: Story) {
    // REMARKS
    // This uses storybook post message channel, which is Storybook internal API.
    switch (story.version) {
      case "v4":
        return {
          key: "storybook-channel",
          event: {
            type: "setCurrentStory",
            args: [
              {
                kind: story.kind,
                story: story.story,
              },
            ],
            from: "storycap",
          },
        };
      case "v5":
        return {
          key: "storybook-channel",
          event: {
            type: "setCurrentStory",
            args: [
              {
                storyId: story.id,
              },
            ],
            from: "storycap",
          },
        };
    }
  }
}
