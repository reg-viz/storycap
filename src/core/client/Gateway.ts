import { StoredStory, StoryWithOptions } from '../../models/story';
import { Adapter } from './AppAdapter';

export class Gateway {
  private adapter: Adapter;

  public constructor(adapter: Adapter) {
    this.adapter = adapter;
  }

  public getMetadata() {
    return this.adapter.getMetadata();
  }

  public readyComponent() {
    this.adapter.readyComponentScreenshot();
  }

  public getStories(): StoredStory[] {
    return this.adapter.getScreenshotStories();
  }

  public setStories(stories: StoryWithOptions[]) {
    this.adapter.setScreenshotStories(stories);
  }

  public failure(err: Error | string) {
    this.adapter.failureScreenshot(err instanceof Error ? err.message : err);
  }
}
