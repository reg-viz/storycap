// tslint:disable: no-ordered-imports
import { initScreenshot as NgInitScreenshot } from './clients/angular/initScreenshot';
import { initScreenshot as ReactInitScreenshot } from './clients/react/initScreenshot';
import { initScreenshot as VueInitScreenshot } from './clients/vue/initScreenshot';
// tslint:enable

import { noopDecorator } from './clients/noop';
import { getStorybookEnv } from './core/utils';

const storybookEnv = getStorybookEnv();
let initScreenshot: Function;

if (storybookEnv == null) {
  initScreenshot = noopDecorator;
} else {
  switch (storybookEnv) {
    case 'react':
      initScreenshot = ReactInitScreenshot;
      break;
    case 'angular':
      initScreenshot = NgInitScreenshot;
      break;
    case 'vue':
      initScreenshot = VueInitScreenshot;
      break;
    default:
      throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
  }
}

export { initScreenshot };
