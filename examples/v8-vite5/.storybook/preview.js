import { withScreenshot } from 'storycap/lib/client/with-screenshot'

export const decorators = [
  withScreenshot,
];

export const parameters = {
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
};
