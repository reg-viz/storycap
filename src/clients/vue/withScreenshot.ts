import addons from '@storybook/addons';
import imagesLoaded = require('imagesloaded');
import { EventTypes } from '../../core/constants';
import { sleep } from '../../core/utils';
import { mergeScreenshotOptions } from '../../screenshot-options';
import { hoc } from './hoc';
import { PartialScreenshotOptions } from '../../models/options';
import { Story } from '../../models/story';
import { VueStory } from './models';

const withScreenshot = (options: PartialScreenshotOptions = {}) => {
  const { delay, viewport, knobs, namespace } = mergeScreenshotOptions(options);
  const channel = addons.getChannel();

  return (getStory: (story: Story) => VueStory, ctx: Story | undefined) => {
    const withContext = (context: Story) => {
      const component = getStory(context);

      const emit = (type: string) => {
        channel.emit(type, {
          ...context,
          viewport,
          namespace,
          knobs,
        });
      };

      return hoc(component, {
        beforeCreate() {
          emit(EventTypes.COMPONENT_INIT);
        },
        mounted() {
          emit(EventTypes.COMPONENT_MOUNT);
          imagesLoaded(this.$el, async () => {
            await sleep(delay);
            emit(EventTypes.COMPONENT_READY);
          });
        },
      });
    };

    if (ctx) {
      return withContext(ctx);
    }

    return (context: Story) => withContext(context);
  };
};

export default withScreenshot;
