import assign from 'assign-deep';
import { defaultScreenshotOptions } from './constants';

let opts = defaultScreenshotOptions;

export const getScreenshotOptions = () => (
  opts
);

export const mergeScreenshotOptions = (options = {}) => {
  let viewport = {};

  if (Array.isArray(options.viewport)) {
    const baseViewport = !Array.isArray(opts.viewport)
      ? opts.viewport
      : defaultScreenshotOptions.viewport;

    viewport = options.viewport.map(vp => ({
      ...baseViewport,
      ...vp,
    }));
  } else {
    viewport = { ...(options.viewport || {}) };
  }

  return assign({}, opts, {
    ...options,
    viewport,
  });
};

export const setScreenshotOptions = (options = {}) => {
  opts = mergeScreenshotOptions(options);
};
