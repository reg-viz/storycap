import addons from '@storybook/addons';
import imagesLoaded = require('imagesloaded');
import { EventTypes } from '../../core/constants';
import { sleep, getWaitForFn, nextIdle } from '../../core/utils';
import { mergeScreenshotOptions } from '../../screenshot-options';
import { PartialScreenshotOptions } from '../../models/options';
import { Story } from '../../models/story';
import { NgStory } from './models';

// TODO:
// According to Issue below, because Angular can not change knob from URL, we are not able to respond.
// Once Issue is resolved, knobs integration will be implemented :)
// https://github.com/storybooks/storybook/issues/3042
const withScreenshot = (options: PartialScreenshotOptions = {}) => {
  const opts = mergeScreenshotOptions(options);

  return (getStory: (story: Story) => NgStory | NgStory) => {
    // tslint:disable-next-line: no-any
    const isFuncStoryGetter = typeof getStory === 'function' || !(getStory as any).component;

    const wrapScreenshotHandler = (ngStory: NgStory, context: Story | null): NgStory => {
      const getContext = (component: ScreenshotWrapperComponent) => (
        component.__getStoryContext__ ? component.__getStoryContext__() : context
      );

      const emit = (type: string, ctx: Story) => {
        addons.getChannel().emit(type, {
          ...ctx,
          viewport: opts.viewport,
          knobs: opts.knobs,
          namespace: opts.namespace,
        });
      };

      class ScreenshotWrapperComponent extends ngStory.component {
        public ngOnInit() {
          if (super.ngOnInit) {
            super.ngOnInit();
          }
          emit(EventTypes.COMPONENT_INIT, getContext(this));
        }

        public ngAfterViewInit() {
          if (super.ngAfterViewInit) {
            super.ngAfterViewInit();
          }
          const { delay, waitFor } = opts;
          emit(EventTypes.COMPONENT_MOUNT, getContext(this));
          // FIXME:
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
            await getWaitForFn(waitFor)();
            await nextIdle();
            emit(EventTypes.COMPONENT_READY, getContext(this));
          });
        }
      }

      if (ScreenshotWrapperComponent.prototype.__WRAPPED_WITH_SCREENSHOT__) {
        return ngStory;
      }

      ScreenshotWrapperComponent.prototype.__WRAPPED_WITH_SCREENSHOT__ = true;

      return {
        ...ngStory,
        component: ScreenshotWrapperComponent,
      };
    };

    if (isFuncStoryGetter) {
      return (story: Story) => wrapScreenshotHandler(getStory(story), story);
    }

    // tslint:disable-next-line: no-any
    return wrapScreenshotHandler(getStory as any, null);
  };
};

export default withScreenshot;
