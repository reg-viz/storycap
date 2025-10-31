import React from 'react';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './MyButton.stories'; // import all stories from the stories file

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Normal } = composeStories(stories);

test('renders primary button with default args', () => {
  const { getByText } = render(<Normal />);
  const buttonElement = getByText(/My Button/i);
  expect(buttonElement).not.toBeNull();
});
