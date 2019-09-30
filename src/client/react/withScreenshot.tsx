import React from 'react';
import { StoryKind, makeDecorator } from '@storybook/addons';
import { capture, stock } from '../capture';
import { ScreenshotOptions } from '../types';

type Props = {
  screenshotOptions?: Partial<ScreenshotOptions>;
};

class ScreenshotWrapper extends React.Component<Props> {
  componentWillMount() {
    stock(this.props.screenshotOptions);
  }

  componentDidMount() {
    capture();
  }

  render() {
    return <>{this.props.children}</>;
  }
}

// NOTE:
// `makeDecorator` is only available with @storybook/addons@^5.0.0 .
const withScreenshotDecorator =
  makeDecorator &&
  makeDecorator({
    name: 'withScreenshot',
    parameterName: 'screenshot',
    skipIfNoParametersOrOptions: false,
    allowDeprecatedUsage: true,
    wrapper: (getStory, context, { parameters, options }) => {
      const props = {
        screenshotOptions: parameters || options,
      };
      return <ScreenshotWrapper {...props}>{getStory(context)}</ScreenshotWrapper>;
    },
  });

function withScreenshotLegacy(opt: Partial<ScreenshotOptions> = {}) {
  return (storyFn: Function, ctx: StoryKind | undefined) => {
    const wrapperWithContext = (context: any) => {
      const props = {
        screenshotOptions: opt,
      };

      return <ScreenshotWrapper {...props}>{storyFn(context)}</ScreenshotWrapper>;
    };

    if (ctx) {
      return wrapperWithContext(ctx);
    }

    return (context: StoryKind) => wrapperWithContext(context);
  };
}

export const withScreenshot = withScreenshotDecorator || withScreenshotLegacy;
