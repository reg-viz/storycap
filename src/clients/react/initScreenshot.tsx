import * as React from 'react';
import addons from '@storybook/addons';
import InitScreenshotWrapper from './components/InitScreenshotWrapper';
import { Story } from '../../models/story';

const initScreenshot = () => (storyFn: Function, ctx: Story) => (
  <InitScreenshotWrapper channel={addons.getChannel()} context={ctx}>
    {storyFn()}
  </InitScreenshotWrapper>
);

export default initScreenshot;
