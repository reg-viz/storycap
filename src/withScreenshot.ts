import { getStorybookEnv } from './core/utils';
import ReactWithScreenshot from './clients/react/withScreenshot';
import NgWithScreenshot from './clients/angular/withScreenshot';
import { ScreenshotOptions } from './models/options';

const storybookEnv = getStorybookEnv();
let withScreenshot: (options?: Partial<ScreenshotOptions>) => Function;

switch (storybookEnv) {
  case 'react':
    withScreenshot = ReactWithScreenshot;
    break;
  case 'angular':
    withScreenshot = NgWithScreenshot;
    break;
  default:
    throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
}

export default withScreenshot;
