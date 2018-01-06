/* tslint:disable:no-any */
import { StoryWithOptions, StoredStory } from '../../models/story';

export interface Adapter {
  readyComponentScreenshot(): void;
  getScreenshotStories(): StoredStory[];
  setScreenshotStories(stories: StoryWithOptions[]): void;
  failureScreenshot(err: string): void;
}

export default class AppAdapter implements Adapter {
  public readyComponentScreenshot(): void {
    (window as any).readyComponentScreenshot();
  }

  public getScreenshotStories(): StoredStory[] {
    return ((window as any).getScreenshotStories() as StoredStory[]);
  }

  public setScreenshotStories(stories: StoryWithOptions[]): void {
    (window as any).setScreenshotStories(stories);
  }

  public failureScreenshot(err: string): void {
    (window as any).failureScreenshot(err);
  }
}
