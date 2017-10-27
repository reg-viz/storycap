import React from 'react';
import addons from '@storybook/addons';
import InitScreenshotWrapper from './components/InitScreenshotWrapper';

const initScreenshot = () => (storyFn) => {
  const channel = addons.getChannel();

  return (<InitScreenshotWrapper channel={channel}>
    { storyFn() }
  </InitScreenshotWrapper>);
};

export default initScreenshot;
