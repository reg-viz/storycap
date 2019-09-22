import addons from '@storybook/addons';
import { EventTypes } from '../../core/constants';
import { Story } from '../../models/story';
import { hoc } from './hoc';
import { VueStory } from './models';

export const initScreenshot = () => (getStory: (context: VueStory) => VueStory, ctx: Story) => {
  const component = getStory(ctx);

  return hoc(component, {
    mounted() {
      addons.getChannel().emit(EventTypes.COMPONENT_FINISH_MOUNT, {
        ...ctx
      });
    }
  });
};
