import { StoredStory, StoryWithOptions } from '../../models/story';
import { ClientMetadata } from '../app/Browser';

export interface Adapter {
  getMetadata(): Promise<ClientMetadata>;
  readyComponentScreenshot(): void;
  getScreenshotStories(): StoredStory[];
  setScreenshotStories(stories: StoryWithOptions[]): void;
  failureScreenshot(err: string): void;
}

export class AppAdapter implements Adapter {
  public getMetadata(): Promise<ClientMetadata> {
    return (<any>window).getPageId();
  }

  public readyComponentScreenshot(): void {
    (<any>window).readyComponentScreenshot();
  }

  public getScreenshotStories(): StoredStory[] {
    return <StoredStory[]>(<any>window).getScreenshotStories();
  }

  public setScreenshotStories(stories: StoryWithOptions[]): void {
    (<any>window).setScreenshotStories(stories);
  }

  public failureScreenshot(err: string): void {
    (<any>window).failureScreenshot(err);
  }
}
