import * as React from 'react';
import { findDOMNode } from 'react-dom';
import imagesLoaded = require('imagesloaded');
import { EventTypes } from '../../../core/constants';
import { Story } from '../../../models/story';
import { Channel } from '../../../models/storybook';
import { Viewport } from '../../../models/viewport';

export interface Props extends React.Props<{}> {
  channel: Channel;
  context: Story;
  delay: number;
  viewport: Viewport | Viewport[];
  namespace?: string;
}

export default class ScreenshotWrapper extends React.Component<Props> {
  component: HTMLSpanElement;

  constructor(props: Props) {
    super(props);
    this.emit(EventTypes.COMPONENT_INIT);
  }

  componentDidMount() {
    const { delay } = this.props;
    const node = findDOMNode(this.component);

    this.emit(EventTypes.COMPONENT_MOUNT);

    imagesLoaded(node, () => {
      setTimeout(
        () => {
          this.emit(EventTypes.COMPONENT_READY);
        },
        delay,
      );
    });
  }

  emit(type: string) {
    const { context, channel, viewport, namespace } = this.props;

    channel.emit(
      type,
      {
        ...context,
        viewport,
        namespace,
      },
    );
  }

  handleRef = (component: HTMLSpanElement) => {
    this.component = component;
  }

  render() {
    const { children } = this.props;

    return (
      <span ref={this.handleRef}>
        {children}
      </span>
    );
  }
}
