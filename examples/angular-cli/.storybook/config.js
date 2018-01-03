import { configure } from '@storybook/angular';

import { addDecorator } from '@storybook/angular';
import initScreenshot from '../../../lib/init-screenshot';

addDecorator(initScreenshot);

function loadStories() {
  require('../stories/index.ts');
}

configure(loadStories, module);
