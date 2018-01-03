/* eslint-disable no-underscore-dangle */
import addons from '@storybook/addons';
import { EventTypes } from '../constants';

export default function initScreenshot(getStory, ctx) {
  const story = getStory(ctx);
  if (story.component) {
    const clazz = story.component.prototype;
    clazz.__getStoryContext__ = () => ctx;
    if (!clazz.__WRAPPED_INIT_SCREENSHOT__) {
      const delegateAfterViewInit = clazz.ngAfterViewInit || (() => { });
      clazz.ngAfterViewInit = function afterViewInit() {
        delegateAfterViewInit.call(this);
        addons.channel.emit(EventTypes.COMPONENT_FINISH_MOUNT, {
          ...this.__getStoryContext__(),
        });
      };
      clazz.__WRAPPED_INIT_SCREENSHOT__ = true;
    }
  }
  return story;
}
