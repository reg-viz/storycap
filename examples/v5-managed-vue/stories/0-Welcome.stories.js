import { linkTo } from '@storybook/addon-links';

import Welcome from './Welcome';

export default {
  title: 'Welcome',
  parameters: {
    screenshot: {
      variants: {
        XSMALL: {
          viewport: 'iPhone 5',
        },
      },
    },
  },
};

export const toStorybook = () => ({
  components: { Welcome },
  template: '<welcome :showApp="action" />',
  methods: { action: linkTo('Button') },
});

toStorybook.story = {
  name: 'to Storybook',
};
