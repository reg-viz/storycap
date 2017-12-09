/* eslint-disable react/prop-types */
/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import imagesLoaded from 'imagesloaded';
import { EventTypes } from '../constants';

export default class ScreenshotWrapper extends Component {
  constructor(props, ...args) {
    super(props, ...args);
    this.emit(EventTypes.COMPONENT_INIT);
  }

  componentDidMount() {
    const { delay } = this.props;
    const node = findDOMNode(this.component);
    this.emit(EventTypes.COMPONENT_MOUNT);

    imagesLoaded(node, () => {
      setTimeout(() => {
        this.emit(EventTypes.COMPONENT_READY);
      }, delay);
    });
  }

  emit(type) {
    this.props.channel.emit(type, {
      ...this.props.context,
      viewport: this.props.viewport,
      namespace: this.props.namespace,
    });
  }

  handleRef = (component) => {
    this.component = component;
  };

  render() {
    const { children } = this.props;

    return (
      <span ref={this.handleRef}>
        {children}
      </span>
    );
  }
}
