import { isEmpty } from 'lodash';
import { StoredKnobs } from '../../models/knobs';
import { StoredStory, StoryWithOptions } from '../../models/story';
import { Viewport } from '../../models/viewport';
import { permutationKnobs, story2filename } from '../utils';

export class StoryStore {
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
      const skipped = this.isSkipStory(story);
      const isMultipleViewport = Array.isArray(story.viewport);
      const isEmptyKnobs = isEmpty(story.knobs);
      const viewports: Viewport[] = isMultipleViewport
        ? <Viewport[]>story.viewport
        : [<Viewport>story.viewport];

      const storyPush = (viewport: Viewport, knobs: StoredKnobs) => {
        this.stories.push({
          kind: story.kind,
          story: story.story,
          parameters: story.parameters,
          viewport,
          knobs,
          skipped,
          filename: story2filename({
            kind: story.kind,
            story: story.story,
            namespace: story.namespace,
            filePattern: story.filePattern,
            viewport: isMultipleViewport ? viewport : null,
            knobs: !isEmptyKnobs ? knobs : null
          })
        });
      };

      viewports.forEach((viewport) => {
        if (isEmptyKnobs) {
          storyPush(viewport, {});

          return;
        }

        const knobList = permutationKnobs(story.knobs);

        for (const knobs of knobList) {
          storyPush(viewport, knobs);
        }
      });
    });
  }

  public get(skipped: boolean = false) {
    return this.stories.filter((story) => story.skipped === skipped);
  }

  private isSkipStory(story: StoryWithOptions) {
    return !!(
      (this.filterKind != null && !this.filterKind.test(story.kind)) ||
      (this.filterStory != null && !this.filterStory.test(story.story))
    );
  }
}
