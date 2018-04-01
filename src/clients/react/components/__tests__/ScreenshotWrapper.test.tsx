/* tslint:disable: no-any */
import { EventEmitter } from 'events';
import * as React from 'react';
import { mount } from 'enzyme';
import { EventTypes, defaultScreenshotOptions } from '../../../../core/constants';
import { sleep } from '../../../../core/utils';
import ScreenshotWrapper from '../ScreenshotWrapper';

describe('React#ScreenshotWrapper', () => {
  it('Should be handle channel', async () => {
    const channel = new EventEmitter();
    const state: any = {
      inited: [],
      mounted: [],
      ready: [],
    };

    channel.on(EventTypes.COMPONENT_INIT, (...args: any[]) => {
      state.inited.push(...args);
    });

    channel.on(EventTypes.COMPONENT_MOUNT, (...args: any[]) => {
      state.mounted.push(...args);
    });

    channel.on(EventTypes.COMPONENT_READY, (...args: any[]) => {
      state.ready.push(...args);
    });

    const component = (
      <ScreenshotWrapper
        channel={channel}
        context={{
          kind: 'foo',
          story: 'bar',
        }}
        delay={0}
        viewport={{
          ...defaultScreenshotOptions.viewport,
        }}
        namespace={''}
      >
        <div>foo</div>
      </ScreenshotWrapper>
    );

    expect(state.inited).toHaveLength(0);
    expect(state.mounted).toHaveLength(0);
    expect(state.ready).toHaveLength(0);

    mount(component);

    expect(state.inited).toHaveLength(1);
    expect(state.mounted).toHaveLength(1);
    expect(state.ready).toHaveLength(0);

    expect(state.inited).toEqual([
      {
        kind: 'foo',
        story: 'bar',
        viewport: {
          ...defaultScreenshotOptions.viewport,
        },
        namespace: '',
      },
    ]);

    expect(state.mounted).toEqual(state.inited);

    await sleep(16);

    expect(state.ready).toEqual(state.inited);
  });
});
