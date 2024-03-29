import type { StoryKind, MakeDecorator } from '@storybook/addons';
let makeDecorator: MakeDecorator | undefined;
try {
  makeDecorator = require('@storybook/addons').makeDecorator;
} catch {}
try {
  makeDecorator = require('@storybook/preview-api').makeDecorator;
} catch {}

import type { ScreenshotOptions } from '../shared/types';
const { triggerScreenshot } = require('./trigger-screenshot');

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
      if (typeof process !== 'undefined' && process?.env.JEST_WORKER_ID !== undefined) {
        return getStory(context);
      }
      const screenshotOptions = parameters || options;
      triggerScreenshot(screenshotOptions, context);
      return getStory(context);
    },
  });

function withScreenshotLegacy(screenshotOptions: ScreenshotOptions = {}) {
  return (storyFn: Function, ctx: StoryKind | undefined) => {
    const wrapperWithContext = (context: any) => {
      triggerScreenshot(screenshotOptions, context);
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
