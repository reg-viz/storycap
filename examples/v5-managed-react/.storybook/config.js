import { configure, addDecorator, addParameters } from '@storybook/react';
import { withScreenshot } from 'storycap';

function loadStories() {
  require('../src/stories');
}

addDecorator(withScreenshot);
addParameters({
  screenshot: {
    viewports: {
      LARGE: {
        width: 1200,
        height: 800,
      },
      SMALL: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
      },
    },
  },
});

configure(loadStories, module);
