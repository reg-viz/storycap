/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable comma-dangle */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withScreenshot } from '../src/';
import Container from './Container';

storiesOf('Container', module)
  .add('with single viewport', () => (
    <Container>
      Single Viewport
    </Container>
  ))
  .add('with multiple viewport',
    withScreenshot({
      viewport: [
        // Mobile
        {
          width: 300,
          height: 420,
          isMobile: true,
          hasTouch: true,
        },
        // Tablet
        {
          width: 768,
          height: 800,
          isMobile: true,
          hasTouch: true,
        },
        // Desktop
        {
          width: 1024,
          height: 768,
        },
      ],
    })(() => (
      <Container>
        Multiple Viewport
      </Container>
    ))
  );
