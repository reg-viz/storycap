import * as React from 'react';
import { findDOMNode } from 'react-dom';
import imagesLoaded = require('imagesloaded');
import { EventTypes } from '../../../core/constants';
import { sleep } from '../../../core/utils';
import { Story } from '../../../models/story';
import { Channel } from '../../../models/storybook';
import { Viewport } from '../../../models/viewport';
import { Knobs } from '../../../models/knobs';

export interface Props extends React.Props<{}> {
  channel: Channel;
  context: Story;
  delay: number;
  viewport: Viewport | Viewport[];
  knobs: Knobs;
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
    const node = findDOMNode(this.component) as HTMLElement;

    this.emit(EventTypes.COMPONENT_MOUNT);

    imagesLoaded(node, async () => {
      await sleep(delay);
      this.emit(EventTypes.COMPONENT_READY);
    });
  }

  emit(type: string) {
    const { context, channel, viewport, knobs, namespace } = this.props;

    channel.emit(type, {
      ...context,
      viewport,
      knobs,
      namespace
    });
  }

  handleRef = (component: HTMLSpanElement) => {
    this.component = component;
  };

  render() {
    return <span ref={this.handleRef}>{this.props.children}</span>;
  }
}
