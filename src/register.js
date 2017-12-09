import 'babel-polyfill';
import { flattenDeep } from 'lodash';
import { compose, flattenDepth, map } from 'lodash/fp';
import addons from '@storybook/addons';
import qs from 'query-string';
import {
  PhaseTypes,
  EventTypes,
} from './constants';
import { promiseChain } from './internal/utils';
import pkg from '../package.json';


const query = qs.parse(window.location.search);
const phase = query['chrome-screenshot'];
const selectKind = query.selectKind;
const selectStory = query.selectStory;

const searchScreenshotWrappersByStory = (kind, story, api, channel) => {
  const inited = [];
  const mounted = [];

  // One story can have several usage of withScreenshot.
  // Using the events from teh ScreenshotWrapper we try to know about the wrappers
  // events are firing in this sequence. init, mount
  // If story doesn't have any withScreenshot wrappers, we handle it with FINISH_MOUNT event.
  // initScreenshot decorator must be added before the gloabl withScreenshot,
  // so the mount event of the wrapper element in initScreenshot will be fired after
  // the all mount events of the withScreenthot HOC

  // Why we use 2 kind of events: init and mount?
  // we use 2 events, init and mount, because in this way
  // we can recognize when all wrappers are mounted.
  // Init events always fire before a mount events.
  // so when we handle first mount event we know the total count of the wrappers.

  return new Promise((resolve) => {
    const onInit = (context) => {
      if (context.kind !== kind || context.story !== story) return;
      inited.push(context);
    };

    const onMount = (context) => {
      if (context.kind !== kind || context.story !== story) return;
      mounted.push(context);
      if (mounted.length === inited.length) {
        onResolve(mounted); // eslint-disable-line no-use-before-define
      }
    };

    const onFinishMount = (context) => {
      if (context.kind !== kind || context.story !== story) return;
      if (inited.length === 0) onResolve([]); // eslint-disable-line no-use-before-define
    };

    const onResolve = (contexts) => {
      resolve(contexts);
      channel.removeListener(EventTypes.COMPONENT_INIT, onInit);
      channel.removeListener(EventTypes.COMPONENT_MOUNT, onMount);
      channel.removeListener(EventTypes.COMPONENT_FINISH_MOUNT, onFinishMount);
    };

    channel.on(EventTypes.COMPONENT_INIT, onInit);
    channel.on(EventTypes.COMPONENT_MOUNT, onMount);
    channel.on(EventTypes.COMPONENT_FINISH_MOUNT, onFinishMount);

    api.selectStory(kind, story);
  });
};

const searchTargetStories = (channel, api) => new Promise((resolve, reject) => {
  channel.once('setStories', ({ stories }) => {
    const storiesPlainList = compose(
      flattenDepth(2),
      map(group => group.stories.map(story => ({ kind: group.kind, story }))) // eslint-disable-line
    )(stories);

    promiseChain(
      storiesPlainList,
      cur => searchScreenshotWrappersByStory(cur.kind, cur.story, api, channel) // eslint-disable-line
    ).then((results) => {
      const contexts = flattenDeep(results);
      resolve(contexts);
    }, reject);

    channel.on(EventTypes.COMPONENT_ERROR, reject);
  });
});


addons.register(pkg.name, async (api) => {
  if (!phase) {
    return;
  }

  try {
    const channel = addons.getChannel();

    switch (phase) {
      case PhaseTypes.PREPARE:
        await window.setScreenshotStories(await searchTargetStories(channel, api));
        return;

      case PhaseTypes.CAPTURE:
        channel.on(EventTypes.COMPONENT_READY, ({ kind, story }) => {
          if (selectKind === kind && selectStory === story) {
            window.readyComponentScreenshot();
          }
        });
        api.selectStory(selectKind, selectStory);
        break;

      default: throw new Error(`An unknown phase called "${phase}" is being executed.`);
    }
  } catch (e) {
    window.failureScreenshot(e);
  }
});
