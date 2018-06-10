import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../../../lib/';

// Screenshots
addDecorator(initScreenshot());
addDecorator(withScreenshot({
  namespace: 'global',
}));

// initialize
const req = require.context('../src', true, /\.stories\.js/);

configure(() => req.keys().forEach(req), module);
