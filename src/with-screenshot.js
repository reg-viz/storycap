import React from 'react';
import assign from 'assign-deep';
import addons from '@storybook/addons';
import { EventTypes } from './constants';
import ScreenshotWrapper from './components/ScreenshotWrapper';

const defaultOptions = {
  delay: 0,
  viewport: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
};

const withScreenshot = (options = {}) => {
  const channel = addons.getChannel();

  channel.emit(EventTypes.COMPONENT_COUNT);

  return storyFn => (context) => {
    const props = {
      ...assign(defaultOptions, options),
      channel,
      context,
    };

    return (
      <ScreenshotWrapper {...props}>
        {storyFn(context)}
      </ScreenshotWrapper>
    );
  };
};

export default withScreenshot;
