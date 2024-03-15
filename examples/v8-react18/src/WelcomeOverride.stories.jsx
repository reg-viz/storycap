import { linkTo } from '@storybook/addon-links';
import { Welcome } from './Welcome';

export default {
  title: 'Welcome Override',
  component: Welcome,
  parameters: {
    screenshot: {
      viewport: 'iPhone 6',
      variants: {
        XSMALL: {
          viewport: 'iPhone 5',
        },
      },
    },
  },
};

export const ToStorybook = {
  args: {
    showApp: linkTo('Button'),
  },
};
