import React from 'react';
import assign from 'assign-deep';
import addons from '@storybook/addons';
import { EventTypes } from './constants';
import { getScreenshotOptions } from './screenshot-options';
import ScreenshotWrapper from './components/ScreenshotWrapper';

const withScreenshot = (options = {}) => (storyFn, ctx) => {
  const channel = addons.getChannel();

  const wrapperWithContext = (context) => {
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

  channel.emit(EventTypes.COMPONENT_COUNT);

  if (ctx) {
    return wrapperWithContext(ctx);
  }

  return context => (
    wrapperWithContext(context)
  );
};

export default withScreenshot;
