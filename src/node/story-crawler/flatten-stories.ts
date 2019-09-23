import { StoryKind, Story, V4Story } from "./story-types";

export function flattenStories(stories: StoryKind[]) {
  return stories.reduce(
    (acc, storyKind) => [
      ...acc,
      ...storyKind.stories.map(story => {
        return { id: undefined, kind: storyKind.kind, story, version: "v4" } as V4Story;
      }),
    ],
    [] as Story[],
  );
}
