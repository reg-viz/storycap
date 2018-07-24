import { EventEmitter } from 'events';
import * as React from 'react';
import { mount } from 'enzyme';
import { EventTypes } from '../../../../core/constants';
import InitScreenshotWrapper from '../InitScreenshotWrapper';

describe('React#InitScreenshotWrapper', () => {
  it('Should be handle channel', () => {
    const channel = new EventEmitter();
    const finished: any[] = [];

    channel.on(EventTypes.COMPONENT_FINISH_MOUNT, (...args: any[]) => {
      finished.push(...args);
    });

    const component = (
      <InitScreenshotWrapper
        channel={channel}
        context={{
          kind: 'kind-test',
          story: 'story-test',
        }}
      >
        <div>foo</div>
      </InitScreenshotWrapper>
    );

    expect(finished).toHaveLength(0);

    mount(component);

    expect(finished).toEqual([
      {
        kind: 'kind-test',
        story: 'story-test',
      },
    ]);
  });
});
