import { getStorybookEnv } from './core/utils';
import ReactWithScreenshot from './clients/react/withScreenshot';
import NgWithScreenshot from './clients/angular/withScreenshot';
import { PartialScreenshotOptions } from './models/options';

export interface WithScreenshot {
  <T = Function>(options?: PartialScreenshotOptions): T;
}

const storybookEnv = getStorybookEnv();
let withScreenshot: WithScreenshot;

switch (storybookEnv) {
  case 'react':
    withScreenshot = (ReactWithScreenshot as WithScreenshot);
    break;
  case 'angular':
    withScreenshot = (NgWithScreenshot as WithScreenshot);
    break;
  default:
    throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
}

export default withScreenshot;
