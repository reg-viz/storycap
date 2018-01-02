import React from 'react';
import addons from '@storybook/addons';
import insect from 'util-inspect';
import { EventTypes } from './constants';
import { mergeScreenshotOptions } from './screenshot-options';
import ScreenshotWrapper from './components/ScreenshotWrapper';
import NgWithScreenshot from './angular/with-screenshot';

const ReactWithScreenshot = (options = {}) => (storyFn, ctx) => {
  const useDecorator = !!ctx;
  const channel = addons.getChannel();

  const wrapperWithContext = (context) => {
    const props = {
      ...mergeScreenshotOptions(options),
      channel,
      context,
    };

    return (
      <ScreenshotWrapper {...props}>
        {storyFn(context)}
      </ScreenshotWrapper>
    );
  };

  if (typeof storyFn !== 'function') {
    const err = `The story may not be correct, (storyFn = "${insect(storyFn)}")`;
    channel.emit(EventTypes.COMPONENT_ERROR, err); // For Puppeteer
    throw new Error(err); // For browser
  }

  if (useDecorator) {
    return wrapperWithContext(ctx);
  }

  return context => (
    wrapperWithContext(context)
  );
};

const withScreenshot = window.STORYBOOK_ENV === 'angular' ? NgWithScreenshot : ReactWithScreenshot;

export default withScreenshot;
