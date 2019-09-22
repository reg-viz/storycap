import { StoryKind } from "@storybook/addons";
import { Story, V4Story } from "../types";
import minimatch = require("minimatch");

export type Task<T, S> = (runner: S) => Promise<T>;

export function sleep(time: number = 0) {
  return new Promise(res => {
    setTimeout(() => res(), time);
  });
}

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

export function filterStories(flatStories: Story[], include: string[], exclude: string[]): Story[] {
  const conbined = flatStories.map(s => ({ ...s, name: s.kind + "/" + s.story }));
  const included = include.length ? conbined.filter(s => include.some(rule => minimatch(s.name, rule))) : conbined;
  const excluded = exclude.length ? included.filter(s => !exclude.some(rule => minimatch(s.name, rule))) : included;
  return excluded;
}

export const execParalell = <T, S>(tasks: Task<T, S>[], runners: S[]) => {
  const copied = tasks.slice();
  const results = <T[]>[];
  const p = runners.length;
  if (!p) throw new Error("No runners");
  return Promise.all(
    new Array(p).fill("").map(
      (_, i) =>
        new Promise((res, rej) => {
          function next(): Promise<number | void> {
            const t = copied.shift();
            return t == null
              ? Promise.resolve(res())
              : t(runners[i])
                  .then(r => results.push(r))
                  .then(next)
                  .catch(rej);
          }
          return next();
        }),
    ),
  ).then(() => results);
};
