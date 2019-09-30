import { StoryKind, makeDecorator } from '@storybook/addons';

import { ScreenshotOptions } from './types';
import { prepareCapture } from './capture';

export interface WithScreenshot {
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
      prepareCapture(screenshotOptions);
      return getStory(context);
    },
  });

function withScreenshotLegacy(opt: Partial<ScreenshotOptions> = {}) {
  return (storyFn: Function, ctx: StoryKind | undefined) => {
    const wrapperWithContext = (context: any) => {
      const screenshotOptions = opt;
      prepareCapture(screenshotOptions);
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
