import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../src/';
import Tag from './Tag';

storiesOf('Tag', module)
  .add('with text',
    withScreenshot()(() => (
      <Tag>Default</Tag>
    ))
  )
  .add('with large size',
    withScreenshot()(() => (
      <Tag large>Large</Tag>
    ))
  );
