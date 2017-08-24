import 'babel-polyfill';
import { getStorybook } from '@storybook/react';
import addons from '@storybook/addons';
import { EventTypes, SEARCH_COMPONENT_TIMEOUT } from './constants';
import pkg from '../package.json';


const isPuppeteer = /chrome-screenshot/.test(window.location.search);


const searchTargetStories = (channel, api) => new Promise((resolve, reject) => {
  let results = [];
  let count = 0;

  const handleCount = () => {
    count += 1;
  };

  const handleInit = (context) => {
    results.push(context);

    if (results.length >= count) {
      removeListeners();
      resolve(results);
    }
  };

  const removeListeners = () => {
    channel.removeListener(EventTypes.COMPONENT_COUNT, handleCount);
    channel.removeListener(EventTypes.COMPONENT_INIT, handleInit);
  };

  channel.on(EventTypes.COMPONENT_COUNT, handleCount);
  channel.on(EventTypes.COMPONENT_INIT, handleInit);

  channel.once('setStories', ({ stories }) => {
    for (let group of stories) {
      for (let story of group.stories) {
        api.selectStory(group.kind, story);
      }
    }
  });

  setTimeout(() => {
    if (count === 0) {
      reject('TODO: Not found stories');
    }
  }, SEARCH_COMPONENT_TIMEOUT);
});


const takeComponentScreenshot = (channel, api, { kind, story, viewport }) => new Promise((resolve) => {
  channel.once(EventTypes.COMPONENT_READY, async () => {
    await window.takeScreenshot({ kind, story, viewport });
    resolve();
  });

  api.selectStory(kind, story);
});


addons.register(pkg.name, async (api) => {
  if (!isPuppeteer) {
    return;
  }

  try {
    const channel = addons.getChannel();
    const stories = await searchTargetStories(channel, api);
    window.setScreenshotStories(stories);

    for (let context of stories) {
      await takeComponentScreenshot(channel, api, context);
    }

    window.doneScreenshotAll();

  } catch (e) {
    console.log(e);
  }
});
