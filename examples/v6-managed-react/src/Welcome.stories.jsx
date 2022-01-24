import { linkTo } from '@storybook/addon-links';
import { Welcome } from '@storybook/react/demo';

export default {
  title: 'Welcome',
  component: Welcome,
};

export const ToStorybook = {
  args: {
    showApp: linkTo('Button'),
  },
};
