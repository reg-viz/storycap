import { configure, addDecorator } from '@storybook/react';
import { withScreenshot, initScreenshot } from '../../../lib/';

// Screenshots
addDecorator(initScreenshot());
addDecorator(
  withScreenshot({
    namespace: 'global'
  })
);

// Initialize
configure(() => {
  require('../src/Button.stories.tsx');
  require('../src/Container.stories.tsx');
  require('../src/Heading.stories.tsx');
  require('../src/Tag.stories.tsx');
}, module);
