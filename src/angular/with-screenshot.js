/* eslint-disable no-underscore-dangle */
import addons from '@storybook/addons';
import { mergeScreenshotOptions } from '../screenshot-options';
import { EventTypes } from '../constants';

const noopHook = () => { };

export default function withScreenshot(options = {}) {
  const opt = mergeScreenshotOptions(options);
  return (getStory) => {
    const story = getStory();
    const clazz = story.component.prototype;
    if (clazz.__WRAPPED_WITH_SCREENSHOT__) return getStory;

    const delegateOnInit = clazz.ngOnInit || noopHook;
    const delegateAfterViewInit = clazz.ngAfterViewInit || noopHook;

    const emit = (type, context) => {
      addons.channel.emit(type, {
        ...context,
        viewport: opt.viewport,
        namespace: opt.namespace,
      });
    };

    clazz.ngOnInit = function onInit() {
      delegateOnInit.call(this);
      if (!this.__getStoryContext__) return;
      emit(EventTypes.COMPONENT_INIT, this.__getStoryContext__());
    };

    clazz.ngAfterViewInit = function afterViewInit() {
      delegateAfterViewInit.call(this);
      if (!this.__getStoryContext__) return;
      const delay = { opt };
      emit(EventTypes.COMPONENT_MOUNT, this.__getStoryContext__());
      // TODO wait for images loaded
      setTimeout(() => emit(EventTypes.COMPONENT_READY, this.__getStoryContext__()), delay);
    };

    clazz.__WRAPPED_WITH_SCREENSHOT__ = true;

    return () => ({
      ...story,
      component: story.component,
    });
  };
}
