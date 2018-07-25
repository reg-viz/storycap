import { ClientMetadata } from '../app/Browser';
import { StoryWithOptions, StoredStory } from '../../models/story';

export interface Adapter {
  getMetadata(): Promise<ClientMetadata>;
  readyComponentScreenshot(): void;
  getScreenshotStories(): StoredStory[];
  setScreenshotStories(stories: StoryWithOptions[]): void;
  failureScreenshot(err: string): void;
}

export default class AppAdapter implements Adapter {
  public getMetadata(): Promise<ClientMetadata> {
    return (window as any).getPageId();
  }

  public readyComponentScreenshot(): void {
    (window as any).readyComponentScreenshot();
  }

  public getScreenshotStories(): StoredStory[] {
    return (window as any).getScreenshotStories() as StoredStory[];
  }

  public setScreenshotStories(stories: StoryWithOptions[]): void {
    (window as any).setScreenshotStories(stories);
  }

  public failureScreenshot(err: string): void {
    (window as any).failureScreenshot(err);
  }
}
