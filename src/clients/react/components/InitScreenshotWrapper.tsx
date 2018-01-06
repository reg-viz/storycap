import * as React from 'react';
import { EventTypes } from '../../../core/constants';
import { Story } from '../../../models/story';
import { Channel } from '../../../models/storybook';

export interface Props extends React.Props<{}> {
  channel: Channel;
  context: Story;
}

export default class InitScreenshotWrapper extends React.Component<Props> {
  componentDidMount() {
    this.emit(EventTypes.COMPONENT_FINISH_MOUNT);
  }

  emit(type: string) {
    this.props.channel.emit(type, { ...this.props.context });
  }

  render() {
    return this.props.children;
  }
}
