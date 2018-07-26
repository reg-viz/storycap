import { getStorybookEnv } from './core/utils';
import ReactWithScreenshot from './clients/react/withScreenshot';
import NgWithScreenshot from './clients/angular/withScreenshot';
import VueWithScreenshot from './clients/vue/withScreenshot';
import { PartialScreenshotOptions } from './models/options';
import { noopDecorator } from './clients/noop';

export interface WithScreenshot {
  <T = Function>(options?: PartialScreenshotOptions): T;
}

const storybookEnv = getStorybookEnv();
let withScreenshot: WithScreenshot;

if (!storybookEnv) {
  withScreenshot = noopDecorator as WithScreenshot;
} else {
  switch (storybookEnv) {
    case 'react':
      withScreenshot = ReactWithScreenshot as WithScreenshot;
      break;
    case 'angular':
      withScreenshot = NgWithScreenshot as WithScreenshot;
      break;
    case 'vue':
      withScreenshot = VueWithScreenshot as WithScreenshot;
      break;
    default:
      throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
  }
}

export default withScreenshot;
