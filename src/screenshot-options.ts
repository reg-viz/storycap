import assign = require('deep-assign');
import { defaultScreenshotOptions } from './core/constants';
import { ScreenshotOptions } from './models/options';

let opts = defaultScreenshotOptions;

export const getScreenshotOptions = () => (
  opts
);

export const mergeScreenshotOptions = (options: Partial<ScreenshotOptions>) => {
  let viewport = {};

  if (Array.isArray(options.viewport)) {
    const base = !Array.isArray(opts.viewport)
      ? opts.viewport
      : defaultScreenshotOptions.viewport;

    viewport = options.viewport.map((vp) => ({
      ...base,
      ...vp,
    }));
  } else {
    viewport = {
      ...(options.viewport || {}),
    };
  }

  return assign({}, opts, {
    ...options,
    viewport,
  });
};

export const setScreenshotOptions = (options: Partial<ScreenshotOptions>) => {
  opts = mergeScreenshotOptions(options);
};
