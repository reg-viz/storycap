/* eslint-disable react/prop-types */
/* eslint-disable react/no-find-dom-node */
import { Component } from 'react';
import { EventTypes } from '../constants';

export default class InitScreenshotWrapper extends Component {
  componentDidMount() {
    this.emit(EventTypes.COMPONENT_FINISH_MOUNT);
  }

  emit(type) {
    this.props.channel.emit(type, {
      ...this.props.context,
    });
  }

  render() {
    return this.props.children;
  }
}
