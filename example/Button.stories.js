import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../src/';
import Button from './Button';

storiesOf('Button', module)
  .add('with text',
    withScreenshot()(() => (
      <Button>Default</Button>
    ))
  )
  .add('with primary',
    withScreenshot()(() => (
      <Button primary>Primary</Button>
    ))
  )
  .add('with not capture button', () => (
    <Button>Not Capture</Button>
  ));
