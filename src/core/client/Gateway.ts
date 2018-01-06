import { Adapter } from './AppAdapter';
import { StoredStory, StoryWithOptions } from '../../models/story';

export default class Gateway {
  private adapter: Adapter;

  public constructor(adapter: Adapter) {
    this.adapter = adapter;
  }

  public readyComponent() {
    return this.adapter.readyComponentScreenshot();
  }

  public getStories(): StoredStory[] {
    return this.adapter.getScreenshotStories();
  }

  public setStories(stories: StoryWithOptions[]) {
    return this.adapter.setScreenshotStories(stories);
  }

  public failure(err: Error | string) {
    return this.adapter.failureScreenshot(err instanceof Error ? err.message : err);
  }
}
