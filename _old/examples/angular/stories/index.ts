import { storiesOf } from '@storybook/angular';
import { withNotes } from '@storybook/addon-notes';
import { withKnobs, text } from '@storybook/addon-knobs/angular';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Welcome, Button } from '@storybook/angular/demo';

import { withScreenshot } from '../../../lib/';
import { MyButtonComponent } from '../src/app/my-button/my-button.component';
import { ButtonGroupComponent } from '../src/app/button-group/button-group.component';

storiesOf('My Button', module)
  .addDecorator(withKnobs)
  .add(
    'naked',
    withScreenshot()(() => ({
      component: MyButtonComponent
    }))
  )
  .add(
    'with custom label',
    withNotes({ text: 'Notes...' })(
      withScreenshot()(() => ({
        component: MyButtonComponent,
        props: {
          text: 'Click me!'
        }
      }))
    )
  )
  .add('with Knobs', () =>
    withScreenshot({
      knobs: {
        text: ['with Knobs', 'Hello World!', '@tsuyoshiwada']
      }
    })({
      component: MyButtonComponent,
      props: {
        text: text('text', 'with Knobs')
      }
    })
  );

storiesOf('Button group', module).add(
  'simple',
  withScreenshot()(() => ({
    component: ButtonGroupComponent,
    props: {
      labels: ['first button', 'second button']
    },
    moduleMetadata: {
      imports: [],
      schemas: [],
      declarations: [MyButtonComponent],
      providers: []
    }
  }))
);

storiesOf('Welcome', module).add('to Storybook', () => ({
  component: Welcome,
  props: {}
}));

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('with text', () => ({
    component: Button,
    props: {
      text: 'Hello Button'
    }
  }))
  .add(
    'with some emoji',
    withNotes({ text: 'My notes on a button with emojis' })(() => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯'
      }
    }))
  )
  .add(
    'with some emoji and action',
    withNotes({ text: 'My notes on a button with emojis' })(() => ({
      component: Button,
      props: {
        text: '😀 😎 👍 💯',
        onClick: action('This was clicked OMG')
      }
    }))
  )
  .add(
    'with Knobs',
    withScreenshot({
      knobs: {
        text: ['with Knobs', 'Hello World!', '@tsuyoshiwada']
      }
    })(() => ({
      component: Button,
      props: {
        text: text('text', 'with Knobs')
      }
    }))
  );

storiesOf('Another Button', module).add('button with link to another story', () => ({
  component: Button,
  props: {
    text: 'Go to Welcome Story',
    onClick: linkTo('Welcome')
  }
}));
