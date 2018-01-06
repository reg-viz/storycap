import { Viewport } from './viewport';

export interface Story {
  kind: string;
  story: string;
}

export interface StoryWithOptions extends Story {
  namespace: string | null;
  viewport: Viewport | Viewport[];
}

export interface StoredStory extends Story {
  viewport: Viewport;
  skipped: boolean;
  filename: string;
}
