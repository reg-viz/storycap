import addons from '@storybook/addons';
import * as React from 'react';
import { Story } from '../../models/story';
import { InitScreenshotWrapper } from './components/InitScreenshotWrapper';

export const initScreenshot = () => (storyFn: Function, ctx: Story) => (
  <InitScreenshotWrapper channel={addons.getChannel()} context={ctx}>
    {storyFn()}
  </InitScreenshotWrapper>
);
