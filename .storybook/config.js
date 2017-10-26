import { configure, addDecorator } from '@storybook/react';
import { withScreenshot } from '../src/';

const req = require.context('../example', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(withScreenshot({
  namespace: 'global'
}));

configure(loadStories, module);
