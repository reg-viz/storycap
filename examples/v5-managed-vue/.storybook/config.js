import { configure, addDecorator, addParameters } from '@storybook/vue';
import { withScreenshot } from 'storycap';

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

// automatically import all files ending in *.stories.js
configure(require.context('../stories', true, /\.stories\.js$/), module);
