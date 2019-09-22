import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../../../lib/';

// Screenshots
addDecorator(initScreenshot());
addDecorator(
  withScreenshot({
    namespace: 'global'
  })
);

// initialize
configure(() => {
  require('../src/App.stories.js');
}, module);
