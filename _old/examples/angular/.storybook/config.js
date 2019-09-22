import { configure } from '@storybook/angular';

import { addDecorator } from '@storybook/angular';
import { initScreenshot } from '../../../lib/';

addDecorator(initScreenshot());

configure(() => {
  require('../stories/index.ts');
}, module);
