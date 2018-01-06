import { story2filename } from '../utils';
import { StoryWithOptions, StoredStory } from '../../models/story';
import { Viewport } from '../../models/viewport';

export default class StoryStore {
  private stories: StoredStory[] = [];
  private filterKind: RegExp | undefined;
  private filterStory: RegExp | undefined;

  public constructor(filterKind: RegExp | undefined, filterStory: RegExp | undefined) {
    this.filterKind = filterKind;
    this.filterStory = filterStory;
  }

  public set(stories: StoryWithOptions[]) {
    this.stories = [];

    stories.forEach((story) => {
      const skipped = !!(
        (this.filterKind && !this.filterKind.test(story.kind)) ||
        (this.filterStory && !this.filterStory.test(story.story))
      );

      const isMultipleViewport = Array.isArray(story.viewport);
      const viewports: Viewport[] = isMultipleViewport
        ? (story.viewport as Viewport[])
        : [(story.viewport as Viewport)];

      viewports.forEach((viewport) => {
        this.stories.push({
          kind: story.kind,
          story: story.story,
          viewport,
          skipped,
          filename: story2filename(
            story.kind,
            story.story,
            isMultipleViewport ? viewport : null,
            story.namespace,
          ),
        });
      });
    });
  }

  public get(skipped: boolean = false) {
    return this.stories.filter(story => story.skipped === skipped);
  }
}
