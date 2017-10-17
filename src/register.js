import 'babel-polyfill';
import { getStorybook } from '@storybook/react'; // eslint-disable-line
import addons from '@storybook/addons';
import qs from 'query-string';
import {
  PhaseTypes,
  EventTypes,
  SEARCH_COMPONENT_TIMEOUT,
} from './constants';
import pkg from '../package.json';


const query = qs.parse(window.location.search);
const phase = query['chrome-screenshot'];
const selectKind = query.selectKind;
const selectStory = query.selectStory;


const searchTargetStories = (channel, api) => new Promise((resolve, reject) => {
  const results = [];
  let count = 0;
  let resolved = false;

  const handleCount = () => {
    count += 1;
  };

  const handleInit = (context) => {
    results.push(context);
    if (resolved) {
      console.log('handleInit after the resolving', context);
    }

    if (results.length >= count) {
      // removeListeners(); // eslint-disable-line no-use-before-define
      resolve(results);
      resolved = true;
    }
  };

  const handleError = (error) => {
    reject(error);
  };

  const removeListeners = () => {
    channel.removeListener(EventTypes.COMPONENT_COUNT, handleCount);
    channel.removeListener(EventTypes.COMPONENT_INIT, handleInit);
    channel.removeListener(EventTypes.COMPONENT_ERROR, handleError);
  };

  channel.on(EventTypes.COMPONENT_COUNT, handleCount);
  channel.on(EventTypes.COMPONENT_INIT, handleInit);
  channel.on(EventTypes.COMPONENT_ERROR, handleError);

  channel.once('setStories', ({ stories }) => {
    /* eslint-disable no-restricted-syntax */
    for (const group of stories) {
      for (const story of group.stories) {
        api.selectStory(group.kind, story);
      }
    }
    /* eslint-enable */
  });

  setTimeout(() => {
    if (count === 0) {
      reject('The target stories was not found.');
    }
  }, SEARCH_COMPONENT_TIMEOUT);
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
