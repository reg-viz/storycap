import 'babel-polyfill';
import { getStorybook } from '@storybook/react'; // eslint-disable-line
import addons from '@storybook/addons';
import { EventTypes, SEARCH_COMPONENT_TIMEOUT } from './constants';
import pkg from '../package.json';


const isPuppeteer = /chrome-screenshot/.test(window.location.search);


const searchTargetStories = (channel, api) => new Promise((resolve, reject) => {
  const results = [];
  let count = 0;

  const handleCount = () => {
    count += 1;
  };

  const handleInit = (context) => {
    results.push(context);

    if (results.length >= count) {
      removeListeners(); // eslint-disable-line no-use-before-define
      resolve(results);
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


const takeComponentScreenshot = (channel, api, { kind, story, viewport }) => (
  new Promise((resolve) => {
    channel.once(EventTypes.COMPONENT_READY, async () => {
      await window.takeScreenshot({ kind, story, viewport });
      resolve();
    });

    api.selectStory(kind, story);
  })
);


addons.register(pkg.name, async (api) => {
  if (!isPuppeteer) {
    return;
  }

  try {
    const channel = addons.getChannel();
    const allStories = await searchTargetStories(channel, api);
    const stories = await window.setScreenshotStories(allStories);

    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const context of stories) {
      await takeComponentScreenshot(channel, api, context);
    }
    /* eslint-disable padded-blocks */

    window.doneScreenshotAll();

  } catch (e) {
    window.failureScreenshot(e);
  }
});
