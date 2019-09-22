import * as React from 'react';
import { EventTypes } from '../../../core/constants';
import { Story } from '../../../models/story';
import { Channel } from '../../../models/storybook';

export interface Props {
  channel: Channel;
  context: Story;
  children: React.ReactChild;
}

export class InitScreenshotWrapper extends React.Component<Props> {
  public componentDidMount() {
    this.emit(EventTypes.COMPONENT_FINISH_MOUNT);
  }

  public emit(type: string) {
    this.props.channel.emit(type, { ...this.props.context });
  }

  public render() {
    return this.props.children;
  }
}
