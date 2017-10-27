import React from 'react';
import addons from '@storybook/addons';
import InitScreenshotWrapper from './components/InitScreenshotWrapper';

const initScreenshot = () => (storyFn, ctx) => {
  const channel = addons.getChannel();

  return (<InitScreenshotWrapper channel={channel} context={ctx}>
    { storyFn() }
  </InitScreenshotWrapper>);
};

export default initScreenshot;
