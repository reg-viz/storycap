import { EventEmitter } from 'events';
import { story2filename } from './utils';

export default class Store extends EventEmitter {
  constructor(filterKind, filterStory) {
    super();
    this.filterKind = filterKind;
    this.filterStory = filterStory;
    this.setStories([]);
  }

  setStories(stories) {
    this.current = 0;
    this.stories = [];

    stories.forEach((story) => {
      const skipped = (
        (this.filterKind && !this.filterKind.test(story.kind)) ||
        (this.filterStory && !this.filterStory.test(story.story))
      );

      const isMultipleViewport = Array.isArray(story.viewport);
      const viewport = isMultipleViewport ? story.viewport : [story.viewport];

      viewport.forEach((vp) => {
        this.stories.push({
          ...story,
          viewport: vp,
          skipped,
          filename: story2filename(
            story.kind,
            story.story,
            isMultipleViewport ? vp : null,
          ),
        });
      });
    });
  }

  getStories() {
    return this.stories.filter(story => !story.skipped);
  }

  getSkippedStories() {
    return this.stories.filter(story => story.skipped);
  }
}
