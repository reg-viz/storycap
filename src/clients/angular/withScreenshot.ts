import addons from '@storybook/addons';
import imagesLoaded = require('imagesloaded');
import { EventTypes } from '../../core/constants';
import { sleep } from '../../core/utils';
import { mergeScreenshotOptions } from '../../screenshot-options';
import { PartialScreenshotOptions } from '../../models/options';
import { Story } from '../../models/story';
import { NgStory } from './models';

const noopHook = () => {}; // tslint:disable-line:no-empty

const withScreenshot = (options: PartialScreenshotOptions = {}) => {
  const opts = mergeScreenshotOptions(options);

  return (getStory: () => NgStory) => {
    const story = getStory();
    const clazz = story.component.prototype;
    if (clazz.__WRAPPED_WITH_SCREENSHOT__) {
      return getStory;
    }

    const delegateOnInit = clazz.ngOnInit || noopHook;
    const delegateAfterViewInit = clazz.ngAfterViewInit || noopHook;

    const emit = (type: string, context: Story) => {
      addons.getChannel().emit(type, {
        ...context,
        viewport: opts.viewport,
        namespace: opts.namespace,
      });
    };

    clazz.ngOnInit = function onInit() {
      delegateOnInit.call(this);
      if (!this.__getStoryContext__) {
        return;
      }
      emit(EventTypes.COMPONENT_INIT, this.__getStoryContext__());
    };

    clazz.ngAfterViewInit = function afterViewInit() {
      delegateAfterViewInit.call(this);
      if (!this.__getStoryContext__) {
        return;
      }
      const { delay } = opts;
      emit(EventTypes.COMPONENT_MOUNT, this.__getStoryContext__());
      // FIXME
      // The "[ng-version]" selector means "Angular application root element".
      // We should use [elementRef](https://angular.io/api/core/ElementRef) to get DOM node.
      // However it's hard to override class's constructor and inject depndency on `ElementRef`.
      // Is there a better way?
      const node = document.querySelector('[ng-version]');
      if (!node) {
        return;
      }
      imagesLoaded(node, async () => {
        await sleep(delay);
        emit(EventTypes.COMPONENT_READY, this.__getStoryContext__());
      });
    };

    clazz.__WRAPPED_WITH_SCREENSHOT__ = true;

    return () => ({
      ...story,
      component: story.component,
    });
  };
};

export default withScreenshot;
