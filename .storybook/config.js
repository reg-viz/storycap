import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../src/';

const req = require.context('../example', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(initScreenshot())
addDecorator(withScreenshot({
  namespace: 'global'
}));

configure(loadStories, module);
