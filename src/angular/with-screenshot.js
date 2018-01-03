/* eslint-disable no-underscore-dangle */
import addons from '@storybook/addons';
import imagesLoaded from 'imagesloaded';
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
      // FIXME
      // The "[ng-version]" selector means "Angular application root element".
      // We should use [elementRef](https://angular.io/api/core/ElementRef) to get DOM node.
      // However it's hard to override class's constructor and inject depndency on `ElementRef`.
      // Is there a better way?
      const node = document.querySelector('[ng-version]');
      if (!node) return;
      imagesLoaded(node, () => {
        setTimeout(() => emit(EventTypes.COMPONENT_READY, this.__getStoryContext__()), delay);
      });
    };

    clazz.__WRAPPED_WITH_SCREENSHOT__ = true;

    return () => ({
      ...story,
      component: story.component,
    });
  };
}
