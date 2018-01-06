import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../../../lib/';
import Tag from './Tag';

storiesOf('Tag', module)
  .add('with default size', () => (
    <Tag>Default</Tag>
  ))
  .add('with large size', withScreenshot({
    viewport: {
      width: 300,
      height: 120,
      deviceScaleFactor: 2,
    },
  })(() => (
    <Tag large={true}>Large</Tag>
  )));
