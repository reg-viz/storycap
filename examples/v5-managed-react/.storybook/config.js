import { configure, addDecorator } from '@storybook/react';
import { withScreenshot } from 'storycap';

function loadStories() {
  require('../src/stories');
}

addDecorator(withScreenshot({
  viewport: {
    width: 1200,
    height: 800,
  }
}));

configure(loadStories, module);
