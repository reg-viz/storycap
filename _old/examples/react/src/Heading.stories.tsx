import * as React from 'react';
import { storiesOf } from '@storybook/react';
import backgrounds from '@storybook/addon-backgrounds';
import { withScreenshot } from '../../../lib/';
import Heading from './Heading';

storiesOf('Heading', module)
  .addDecorator(backgrounds([{ name: 'primary', value: '#03a9f4', default: true }]))
  .addDecorator(
    withScreenshot({
      viewport: {
        width: 400,
        height: 250
      }
    })
  )
  .add('with title', () => <Heading>Title</Heading>)
  .add('with subtitle', () => (
    <Heading>
      Title
      <small>Sub title</small>
    </Heading>
  ));
