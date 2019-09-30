import { Story, createExecutionService } from './story-crawler';
import { CapturingBrowser } from './capturing-browser';
import { FileSystem } from './file';
import { Logger } from './logger';
import { VariantKey } from '../types';
import { time } from './story-crawler/timer';

function createRequest({
  story,
  variantKey = { isDefault: true, keys: [] },
  count = 0,
}: {
  story: Story;
  variantKey?: VariantKey;
  count?: number;
}) {
  let rid;
  const base = encodeURIComponent(story.id);
  if (variantKey && variantKey.keys.length) {
    rid = `${base}?keys=${encodeURIComponent(variantKey.keys.join(','))}`;
  } else {
    rid = base;
  }
  return { rid, story, variantKey, count };
}

export type ScreenshotServiceOptions = {
  logger: Logger;
  workers: CapturingBrowser[];
  fileSystem: FileSystem;
  stories: Story[];
};

export function createScreenshotService({ fileSystem, logger, stories, workers }: ScreenshotServiceOptions) {
  const service = createExecutionService(
    workers,
    stories.map(story => createRequest({ story })),
    ({ rid, story, variantKey, count }, { push }) => async worker => {
      await worker.setCurrentStory(story, { forceRerender: true });
      const [result, elapsedTime] = await time(worker.screenshot(rid, variantKey, count));
      const { succeeded, buffer, variantKeysToPush, defaultVariantSuffix } = result;
      if (!succeeded) return push(createRequest({ story, variantKey, count: count + 1 }));
      if (buffer) {
        const vkForSave =
          variantKey.isDefault && defaultVariantSuffix ? { ...variantKey, keys: [defaultVariantSuffix] } : variantKey;
        const path = await fileSystem.save(story.kind, story.story, vkForSave, buffer);
        logger.log(`Screenshot stored: ${logger.color.magenta(path)} in ${elapsedTime} msec.`);
      }
      variantKeysToPush.forEach(variantKey => push(createRequest({ story, variantKey })));
    },
  );
  return {
    execute: () => service.execute(),
  };
}
