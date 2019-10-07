import { StoryKind, makeDecorator } from '@storybook/addons';

import { ScreenshotOptions } from '../shared/types';
import { triggerScreenshot } from './trigger-screenshot';

export interface WithScreenshot {
  /**
   *
   * @deprecated
   * You can use `addParameters` instead of call decorator as a function with Storybook v5 or later.
   *
   */
  <T = Function>(options?: Partial<ScreenshotOptions>): T;
}

// NOTE:
// `makeDecorator` is only available with @storybook/addons@^5.0.0 .
const withScreenshotDecorator =
  makeDecorator &&
  makeDecorator({
    name: 'withScreenshot',
    parameterName: 'screenshot',
    skipIfNoParametersOrOptions: false,
    allowDeprecatedUsage: true,
    wrapper: (getStory, context, { parameters, options }) => {
      const screenshotOptions = parameters || options;
      triggerScreenshot(screenshotOptions);
      return getStory(context);
    },
  });

function withScreenshotLegacy(screenshotOptions: ScreenshotOptions = {}) {
  return (storyFn: Function, ctx: StoryKind | undefined) => {
    const wrapperWithContext = (context: any) => {
      triggerScreenshot(screenshotOptions);
      return storyFn(context);
    };

    if (ctx) {
      return wrapperWithContext(ctx);
    }

    return (context: StoryKind) => wrapperWithContext(context);
  };
}

const withScreenshot: WithScreenshot = (withScreenshotDecorator || withScreenshotLegacy) as any;

export { withScreenshot };
