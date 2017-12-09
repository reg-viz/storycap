/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable comma-dangle */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../src/';
import Button from './Button';

storiesOf('Button', module)
  .addDecorator(withScreenshot({
    namespace: 'button_decorator'
  }))
  .add('with text', withScreenshot({
    namespace: 'button_element'
  })(() => (
    <Button>Default</Button>
  )))
  .add('with primary', () => (
    <Button primary>Primary</Button>
  ));
