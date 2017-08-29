/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable comma-dangle */
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
    withScreenshot({
      viewport: {
        width: 300,
        height: 120,
        deviceScaleFactor: 2,
      },
    })(() => (
      <Tag large>Large</Tag>
    ))
  );
