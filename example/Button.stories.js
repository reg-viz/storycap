/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable comma-dangle */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Button from './Button';

storiesOf('Button', module)
  .add('with text', () => (
    <Button>Default</Button>
  ))
  .add('with primary', () => (
    <Button primary>Primary</Button>
  ))
  .add('with not capture button', () => (
    <Button>Not Capture</Button>
  ));
