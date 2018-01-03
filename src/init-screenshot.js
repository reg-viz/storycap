import React from 'react';
import addons from '@storybook/addons';
import InitScreenshotWrapper from './components/InitScreenshotWrapper';
import NgInitScreenshot from './angular/init-screenshot';

const ReactInitScreenshot = () => (storyFn, ctx) => {
  const channel = addons.getChannel();

  return (<InitScreenshotWrapper channel={channel} context={ctx}>
    { storyFn() }
  </InitScreenshotWrapper>);
};

const initScreenshot = window.STORYBOOK_ENV === 'angular' ? NgInitScreenshot : ReactInitScreenshot;

export default initScreenshot;
