import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import MyButton from '../MyButton';
import MyInputText from '../MyInputText';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);
storiesOf('Welcome_override', module)
.add('to Storybook', () => <Welcome showApp={linkTo('Button')} />, {
  screenshot: {
    viewport: 'iPhone 6',
    variants: {
      XSMALL: {
        viewport: 'iPhone 5',
      },
    },
  },
});

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}>
      <span role="img" aria-label="so cool">
        😀 😎 👍 💯
      </span>
    </Button>
  ));

storiesOf('Button_to_be_skipped', module)
  .addParameters({
    screenshot: {
      skip: true,
    },
  })
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)

storiesOf('MyInputText', module)
  .add('default', () => <MyInputText />, {
    screenshot: {
      focus: 'input[type="text"]',
    },
  });

storiesOf('MyButton', module)
  .add('default', () => <MyButton />, {
    screenshot: {
      variants: {
        hover: {
          hover: '.my-button',
        },
      },
    },
  });
