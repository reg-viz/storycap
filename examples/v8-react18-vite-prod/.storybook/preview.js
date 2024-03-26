import { withScreenshot } from 'storycap';

const decorators = [
  withScreenshot,
];

/** @type { import('@storybook/react').Preview } */
const preview = {
  decorators,
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
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
  },
};

export default preview;
