import React from 'react';
import assign from 'assign-deep';
import addons from '@storybook/addons';
import { EventTypes } from './constants';
import { getScreenshotOptions } from './screenshot-options';
import ScreenshotWrapper from './components/ScreenshotWrapper';

const withScreenshot = (options = {}) => {
  const channel = addons.getChannel();

  channel.emit(EventTypes.COMPONENT_COUNT);

  return storyFn => (context) => {
    const props = {
      ...assign({}, getScreenshotOptions(), options),
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
