import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../../../lib/';
import Button from './Button';

storiesOf('Button', module)
  .add('with default style', withScreenshot()(() => (
    <Button>Default Style</Button>
  )))
  .add('with primary style', withScreenshot()(() => (
    <Button primary={true}>Primary Style</Button>
  )));

// import React from 'react';
// import { storiesOf } from '@storybook/react';
// import { withScreenshot } from '../src/';
// import Button from './Button';
//
// storiesOf('Button', module)
//   .addDecorator(withScreenshot({
//     namespace: 'button_decorator'
//   }))
//   .add('with text', withScreenshot({
//     namespace: 'button_element'
//   })(() => (
//     <Button>Default</Button>
//   )))
//   .add('with primary', () => (
//     <Button primary>Primary</Button>
//   ));
