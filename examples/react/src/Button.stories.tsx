import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean, text } from '@storybook/addon-knobs/react';
import { withScreenshot } from '../../../lib/';
import Button from './Button';

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('with default style', withScreenshot()(() => (
    <Button>Default Style</Button>
  )))
  .add('with primary style', withScreenshot()(() => (
    <Button primary={true}>Primary Style</Button>
  )))
  .add('with knobs', withScreenshot({
    knobs: {
      'Button Primary': [
        true,
        false,
      ],
      'Button Label': [
        'with Knobs',
        'Hello World!',
        '@tsuyoshiwada',
      ],
    },
  })(() => {
    return (
      <Button primary={boolean('Button Primary', true)}>
        {text('Button Label', 'with Knobs')}
      </Button>
    );
  }));
