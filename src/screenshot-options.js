import assign from 'assign-deep';
import { defaultScreenshotOptions } from './constants';

let opts = defaultScreenshotOptions;

export const getScreenshotOptions = () => (
  opts
);

export const setScreenshotOptions = (options = {}) => {
  opts = assign({}, opts, options);
};
