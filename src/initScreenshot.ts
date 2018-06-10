import { getStorybookEnv } from './core/utils';
import ReactInitScreenshot from './clients/react/initScreenshot';
import NgInitScreenshot from './clients/angular/initScreenshot';
import VueInitScreenshot from './clients/vue/initScreenshot';
import { noopDecorator } from './clients/noop';

const storybookEnv = getStorybookEnv();
let initScreenshot: Function;

if (!storybookEnv) {
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

export default initScreenshot;
