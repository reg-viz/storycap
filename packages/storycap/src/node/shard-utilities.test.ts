import { describe, it, expect } from '@jest/globals';
import { Story } from 'storycrawler';
import { parseShardOptions, sortStories, shardStories } from './shard-utilities';

describe(parseShardOptions, () => {
  it('should accept correct arguments', () => {
    expect(parseShardOptions('1/1')).toMatchObject({ shardNumber: 1, totalShards: 1 });
    expect(parseShardOptions('1/2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('2/2')).toMatchObject({ shardNumber: 2, totalShards: 2 });
    expect(parseShardOptions('1/3')).toMatchObject({ shardNumber: 1, totalShards: 3 });
    expect(parseShardOptions('2/3')).toMatchObject({ shardNumber: 2, totalShards: 3 });
    expect(parseShardOptions('3/3')).toMatchObject({ shardNumber: 3, totalShards: 3 });
  });
  it('should be resiliant to whitespace', () => {
    expect(parseShardOptions(' 1/2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('1/2 ')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions(' 1/2 ')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('1 /2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('1/ 2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('1 / 2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions(' 1 /2')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions('1/ 2 ')).toMatchObject({ shardNumber: 1, totalShards: 2 });
    expect(parseShardOptions(' 1 / 2 ')).toMatchObject({ shardNumber: 1, totalShards: 2 });
  });
  it('errors for incorrect arguments', () => {
    expect(() => parseShardOptions('0')).toThrow();
    expect(() => parseShardOptions('1')).toThrow();
    expect(() => parseShardOptions('text')).toThrow();
    expect(() => parseShardOptions('0/1')).toThrow();
    expect(() => parseShardOptions('-1/1')).toThrow();
    expect(() => parseShardOptions('2/1')).toThrow();
    expect(() => parseShardOptions('0/3')).toThrow();
    expect(() => parseShardOptions('/3')).toThrow();
    expect(() => parseShardOptions('4/')).toThrow();
    expect(() => parseShardOptions('4/3')).toThrow();
    expect(() => parseShardOptions('ab/c')).toThrow();
  });
});

describe(sortStories, () => {
  it('should sort stories alphabetically based on their ID', () => {
    const stories: Story[] = [
      {
        id: 'simple-tooltip--with-component-content',
        kind: 'simple/Tooltip',
        story: 'with component content',
        version: 'v5',
      },
      {
        id: 'complex-scene--for-table-of-contents',
        kind: 'complex/Scene',
        story: 'for table-of-contents',
        version: 'v5',
      },
      {
        id: 'complex-scene--basic-usage',
        kind: 'complex/Scene',
        story: 'basic-usage',
        version: 'v5',
      },
      {
        id: 'complex-scene--verticalannotation',
        kind: 'complex/Scene',
        story: 'verticalannotation',
        version: 'v5',
      },
    ];

    const sortedStories = sortStories(stories);

    let prev: Story | null = null;

    for (const next of sortedStories) {
      if (!prev) {
        prev = next;
        continue;
      }
      expect(next.id > prev.id).toBeTruthy();

      prev = next;
    }
  });
});

describe(shardStories, () => {
  it('a single shard gets all the stories', () => {
    const stories: Story[] = [
      {
        id: 'simple-tooltip--with-component-content',
        kind: 'simple/Tooltip',
        story: 'with component content',
        version: 'v5',
      },
      {
        id: 'complex-scene--for-table-of-contents',
        kind: 'complex/Scene',
        story: 'for table-of-contents',
        version: 'v5',
      },
      {
        id: 'complex-scene--basic-usage',
        kind: 'complex/Scene',
        story: 'basic-usage',
        version: 'v5',
      },
      {
        id: 'complex-scene--verticalannotation',
        kind: 'complex/Scene',
        story: 'verticalannotation',
        version: 'v5',
      },
    ];

    const sortedStories = sortStories(stories);
    const shardedStories = shardStories(sortedStories, 1, 1);

    expect(shardedStories).toMatchObject(sortedStories);
  });
  it('two shards get equal amounts of stories when the number of them is even', () => {
    const stories: Story[] = [
      {
        id: 'simple-tooltip--with-component-content',
        kind: 'simple/Tooltip',
        story: 'with component content',
        version: 'v5',
      },
      {
        id: 'complex-scene--for-table-of-contents',
        kind: 'complex/Scene',
        story: 'for table-of-contents',
        version: 'v5',
      },
      {
        id: 'complex-scene--basic-usage',
        kind: 'complex/Scene',
        story: 'basic-usage',
        version: 'v5',
      },
      {
        id: 'complex-scene--verticalannotation',
        kind: 'complex/Scene',
        story: 'verticalannotation',
        version: 'v5',
      },
    ];

    const sortedStories = sortStories(stories);
    const shardedStoriesA = shardStories(sortedStories, 1, 2);
    const shardedStoriesB = shardStories(sortedStories, 2, 2);

    expect(shardedStoriesA.length).toBe(shardedStoriesB.length);
  });

  it('two shards get roughly equal amounts of stories when the number of them is odd', () => {
    const stories: Story[] = [
      {
        id: 'simple-tooltip--with-component-content',
        kind: 'simple/Tooltip',
        story: 'with component content',
        version: 'v5',
      },
      {
        id: 'complex-scene--for-table-of-contents',
        kind: 'complex/Scene',
        story: 'for table-of-contents',
        version: 'v5',
      },
      {
        id: 'complex-scene--verticalannotation',
        kind: 'complex/Scene',
        story: 'verticalannotation',
        version: 'v5',
      },
    ];

    const sortedStories = sortStories(stories);
    const shardedStoriesA = shardStories(sortedStories, 1, 2);
    const shardedStoriesB = shardStories(sortedStories, 2, 2);

    expect(Math.abs(shardedStoriesA.length - shardedStoriesB.length)).toBeLessThanOrEqual(1);
  });

  it("stories aren't duplicated when there are more shards than stories", () => {
    const stories: Story[] = [
      {
        id: 'simple-tooltip--with-component-content',
        kind: 'simple/Tooltip',
        story: 'with component content',
        version: 'v5',
      },
      {
        id: 'complex-scene--for-table-of-contents',
        kind: 'complex/Scene',
        story: 'for table-of-contents',
        version: 'v5',
      },
    ];

    const sortedStories = sortStories(stories);
    const shardedStoriesA = shardStories(sortedStories, 1, 4);
    const shardedStoriesB = shardStories(sortedStories, 2, 4);
    const shardedStoriesC = shardStories(sortedStories, 3, 4);
    const shardedStoriesD = shardStories(sortedStories, 4, 4);

    expect(shardedStoriesA.length + shardedStoriesB.length + shardedStoriesC.length + shardedStoriesD.length).toBe(
      sortedStories.length,
    );
  });

  it('complex and simple stories are distributed evenly across shards', () => {
    function makeDummyStory(index: number, complex: boolean): Story {
      return {
        id: `${complex ? 'complex' : 'simple'}-component--${index}`,
        kind: `${complex ? 'complex' : 'simple'}/Component`,
        story: `${index}`,
        version: 'v5',
      } as const;
    }

    const stories: Story[] = [
      makeDummyStory(0, true),
      makeDummyStory(1, true),
      makeDummyStory(2, true),
      makeDummyStory(3, true),
      makeDummyStory(4, false),
      makeDummyStory(5, false),
      makeDummyStory(6, false),
      makeDummyStory(7, false),
      makeDummyStory(8, false),
      makeDummyStory(9, false),
      makeDummyStory(10, false),
      makeDummyStory(11, false),
    ];

    const sortedStories = sortStories(stories);
    const shardedStoriesA = shardStories(sortedStories, 1, 2);
    const shardedStoriesB = shardStories(sortedStories, 2, 2);

    const numComplexOnA = shardedStoriesA.filter(story => story.id.startsWith('complex')).length;
    const numComplexOnB = shardedStoriesB.filter(story => story.id.startsWith('complex')).length;

    expect(shardedStoriesA.length).toBe(shardedStoriesB.length);
    expect(numComplexOnA).toBe(numComplexOnB);
  });
});
