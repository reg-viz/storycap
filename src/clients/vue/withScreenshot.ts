import addons from '@storybook/addons';
import imagesLoaded from 'imagesloaded';
import { EventTypes } from '../../core/constants';
import { getWaitForFn, nextIdle, sleep } from '../../core/utils';
import { PartialScreenshotOptions } from '../../models/options';
import { Story } from '../../models/story';
import { mergeScreenshotOptions } from '../../screenshot-options';
import { hoc } from './hoc';
import { VueStory } from './models';

export const withScreenshot = (options: PartialScreenshotOptions = {}) => {
  const { delay, waitFor, viewport, knobs, namespace } = mergeScreenshotOptions(options);
  const channel = addons.getChannel();

  return (getStory: (story: Story) => VueStory, ctx: Story | undefined) => {
    const withContext = (context: Story) => {
      const component = getStory(context);

      const emit = (type: string) => {
        channel.emit(type, {
          ...context,
          viewport,
          namespace,
          knobs
        });
      };

      // tslint:disable: no-invalid-this
      return hoc(component, {
        beforeCreate() {
          emit(EventTypes.COMPONENT_INIT);
        },
        mounted() {
          emit(EventTypes.COMPONENT_MOUNT);
          imagesLoaded(this.$el, async () => {
            await sleep(delay);
            await getWaitForFn(waitFor)();
            await nextIdle();
            emit(EventTypes.COMPONENT_READY);
          });
        }
      });
      // tslint:enable
    };

    if (ctx != null) {
      return withContext(ctx);
    }

    // tslint:disable-next-line: no-unnecessary-callback-wrapper
    return (context: Story) => withContext(context);
  };
};
