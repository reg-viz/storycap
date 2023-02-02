import { withScreenshot } from 'storycap';

export const decorators = [
  withScreenshot,
];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
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
}