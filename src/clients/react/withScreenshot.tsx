import addons from '@storybook/addons';
import * as React from 'react';
import inspect from 'util-inspect';
import { EventTypes } from '../../core/constants';
import { PartialScreenshotOptions } from '../../models/options';
import { Story } from '../../models/story';
import { mergeScreenshotOptions } from '../../screenshot-options';
import { ScreenshotWrapper } from './components/ScreenshotWrapper';

export const withScreenshot = (options: PartialScreenshotOptions = {}) => (
  storyFn: Function,
  ctx: Story | undefined
) => {
  const channel = addons.getChannel();

  const wrapperWithContext = (context: Story) => {
    const props = {
      ...mergeScreenshotOptions(options),
      channel,
      context
    };

    return <ScreenshotWrapper {...props}>{storyFn(context)}</ScreenshotWrapper>;
  };

  if (typeof storyFn !== 'function') {
    const msg = `The story may not be correct, (storyFn = "${inspect(storyFn)}")`;
    channel.emit(EventTypes.COMPONENT_ERROR, msg); // For puppeteer
    throw new Error(msg); // For browser
  }

  if (ctx != null) {
    return wrapperWithContext(ctx);
  }

  // tslint:disable-next-line: no-unnecessary-callback-wrapper
  return (context: Story) => wrapperWithContext(context);
};
