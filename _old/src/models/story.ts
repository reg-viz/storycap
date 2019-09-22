import { Knobs, StoredKnobs } from './knobs';
import { Viewport } from './viewport';

export interface Story {
  kind: string;
  story: string;
}

export interface Parameters {
  [key: string]: string;
}

export interface StoryWithOptions extends Story {
  namespace: string | null;
  viewport: Viewport | Viewport[];
  knobs: Knobs;
  parameters: Parameters;
  filePattern: string;
}

export interface StoredStory extends Story {
  viewport: Viewport;
  knobs: StoredKnobs;
  parameters: Parameters;
  skipped: boolean;
  filename: string;
}
