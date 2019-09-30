import { Story } from '../node/story-crawler';
import minimatch = require('minimatch');

export function sleep(time: number = 0) {
  return new Promise(res => {
    setTimeout(() => res(), time);
  });
}

export function filterStories(flatStories: Story[], include: string[], exclude: string[]): Story[] {
  const conbined = flatStories.map(s => ({ ...s, name: s.kind + '/' + s.story }));
  const included = include.length ? conbined.filter(s => include.some(rule => minimatch(s.name, rule))) : conbined;
  const excluded = exclude.length ? included.filter(s => !exclude.some(rule => minimatch(s.name, rule))) : included;
  return excluded;
}
