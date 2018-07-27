// tslint:disable: no-ordered-imports
import { withScreenshot as NgWithScreenshot } from './clients/angular/withScreenshot';
import { withScreenshot as ReactWithScreenshot } from './clients/react/withScreenshot';
import { withScreenshot as VueWithScreenshot } from './clients/vue/withScreenshot';
// tslint:enable

import { noopDecorator } from './clients/noop';
import { getStorybookEnv } from './core/utils';
import { PartialScreenshotOptions } from './models/options';

export interface WithScreenshot {
  <T = Function>(options?: PartialScreenshotOptions): T;
}

const storybookEnv = getStorybookEnv();
let withScreenshot: WithScreenshot;

if (storybookEnv == null) {
  withScreenshot = <WithScreenshot>noopDecorator;
} else {
  switch (storybookEnv) {
    case 'react':
      withScreenshot = <WithScreenshot>ReactWithScreenshot;
      break;
    case 'angular':
      withScreenshot = <WithScreenshot>NgWithScreenshot;
      break;
    case 'vue':
      withScreenshot = <WithScreenshot>VueWithScreenshot;
      break;
    default:
      throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
  }
}

export { withScreenshot };
