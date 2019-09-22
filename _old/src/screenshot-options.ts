import * as _ from 'lodash';
import { defaultScreenshotOptions } from './core/constants';
import { PartialScreenshotOptions, ScreenshotOptions } from './models/options';

let opts = _.merge({}, defaultScreenshotOptions);

export const getScreenshotOptions = () => opts;

export const mergeScreenshotOptions = (options: PartialScreenshotOptions): ScreenshotOptions => {
  let viewport = {};

  if (Array.isArray(options.viewport)) {
    const base = !Array.isArray(opts.viewport) ? opts.viewport : defaultScreenshotOptions.viewport;
    viewport = options.viewport.map((vp) => _.merge({}, base, vp));
  } else {
    viewport = _.merge({}, options.viewport != null ? options.viewport : {});
  }

  return _.merge({}, opts, {
    ...options,
    viewport
  });
};

export const setScreenshotOptions = (options: Partial<ScreenshotOptions>) => {
  opts = mergeScreenshotOptions(options);
};
