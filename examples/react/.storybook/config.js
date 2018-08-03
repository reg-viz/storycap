import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../../../lib/';

// Screenshots
addDecorator(initScreenshot());
addDecorator(
  withScreenshot({
    namespace: 'global'
  })
);

// Initialize
const req = require.context('../src', true, /\.stories\.tsx/);

configure(() => {
  req.keys().forEach((filename) => req(filename));
}, module);
