import React from "react";
import { StoryKind } from "@storybook/addons";
import { capture, stock } from "../capture";
import { ScreenShotOptions } from "../types";

type Props = {
  screenshotOptions?: Partial<ScreenShotOptions>;
};

class ScreenshotDecorator extends React.Component<Props> {
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

export function withScreenshot(opt: Partial<ScreenShotOptions> = {}) {
  return (storyFn: Function, ctx: StoryKind | undefined) => {
    const wrapperWithContext = (context: any) => {
      const props = {
        screenshotOptions: opt,
      };

      return <ScreenshotDecorator {...props}>{storyFn(context)}</ScreenshotDecorator>;
    };

    if (ctx) {
      return wrapperWithContext(ctx);
    }

    return (context: StoryKind) => wrapperWithContext(context);
  };
}
