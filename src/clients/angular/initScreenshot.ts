import addons from '@storybook/addons';
import { EventTypes } from '../../core/constants';
import { Story } from '../../models/story';
import { NgStory } from './models';

const initScreenshot = () => (getStory: (context: Story) => NgStory, ctx: Story) => {
  const story = getStory(ctx);

  if (story.component) {
    const clazz = story.component.prototype;
    clazz.__getStoryContext__ = () => ctx;
    if (!clazz.__WRAPPED_INIT_SCREENSHOT__) {
      const delegateAfterViewInit = clazz.ngAfterViewInit || (() => {}); // tslint:disable-line: no-empty
      clazz.ngAfterViewInit = function afterViewInit() {
        delegateAfterViewInit.call(this);
        addons.getChannel().emit(EventTypes.COMPONENT_FINISH_MOUNT, {
          ...this.__getStoryContext__()
        });
        clazz.__WRAPPED_INIT_SCREENSHOT__ = true;
      };
    }
  }

  return story;
};

export default initScreenshot;
