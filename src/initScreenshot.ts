import { getStorybookEnv } from './core/utils';
import ReactInitScreenshot from './clients/react/initScreenshot';

const storybookEnv = getStorybookEnv();

let initScreenshot: () => Function;

switch (storybookEnv) {
  case 'react':
    initScreenshot = ReactInitScreenshot;
    break;
  default:
    throw new Error(`storybook-chrome-screenshot does not support "${storybookEnv}".`);
}

export default initScreenshot;
