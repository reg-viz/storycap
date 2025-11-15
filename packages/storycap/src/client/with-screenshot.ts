import { makeDecorator } from 'storybook/preview-api';

import { triggerScreenshot } from './trigger-screenshot.js';

const withScreenshotDecorator = makeDecorator({
  name: 'withScreenshot',
  parameterName: 'screenshot',
  skipIfNoParametersOrOptions: false,
  wrapper: (getStory, context, { parameters, options }) => {
    if (typeof process !== 'undefined' && process?.env.JEST_WORKER_ID !== undefined) {
      return getStory(context);
    }
    const screenshotOptions = parameters || options;
    triggerScreenshot(screenshotOptions, context);
    return getStory(context);
  },
});

const withScreenshot = withScreenshotDecorator;

export { withScreenshot };
