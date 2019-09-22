import { configure, addDecorator, addParameters } from '@storybook/react';
import { withScreenshot } from 'storycap';

function loadStories() {
  require('../src/stories');
}

addDecorator(withScreenshot);
addParameters({
  screenshot: {
    viewport: {
      width: 1200,
      height: 800,
    },
  },
});

configure(loadStories, module);
