import { Viewport } from './viewport';
import { Knobs, StoredKnobs } from './knobs';

export interface Story {
  kind: string;
  story: string;
}

export interface StoryWithOptions extends Story {
  namespace: string | null;
  viewport: Viewport | Viewport[];
  knobs: Knobs;
}

export interface StoredStory extends Story {
  viewport: Viewport;
  knobs: StoredKnobs;
  skipped: boolean;
  filename: string;
}
