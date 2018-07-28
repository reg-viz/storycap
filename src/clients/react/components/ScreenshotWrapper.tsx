import imagesLoaded from 'imagesloaded';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { EventTypes } from '../../../core/constants';
import { sleep } from '../../../core/utils';
import { Knobs } from '../../../models/knobs';
import { Story } from '../../../models/story';
import { Channel } from '../../../models/storybook';
import { Viewport } from '../../../models/viewport';

export interface Props extends React.Props<{}> {
  channel: Channel;
  context: Story;
  delay: number;
  viewport: Viewport | Viewport[];
  knobs: Knobs;
  namespace?: string;
}

export class ScreenshotWrapper extends React.Component<Props> {
  private component: HTMLSpanElement | null = null;

  public constructor(props: Props) {
    super(props);
    this.emit(EventTypes.COMPONENT_INIT);
  }

  public componentDidMount() {
    const { delay } = this.props;
    const node = ReactDOM.findDOMNode(this.component as HTMLSpanElement) as HTMLElement;

    this.emit(EventTypes.COMPONENT_MOUNT);

    imagesLoaded(node, async () => {
      await sleep(delay);
      this.emit(EventTypes.COMPONENT_READY);
    });
  }

  public render() {
    return <span ref={this.handleRef}>{this.props.children}</span>;
  }

  private emit(type: string) {
    const { context, channel, viewport, knobs, namespace } = this.props;

    channel.emit(type, {
      ...context,
      viewport,
      knobs,
      namespace
    });
  }

  private handleRef = (component: HTMLSpanElement) => {
    this.component = component;
  };
}
