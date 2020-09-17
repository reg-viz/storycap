import {
  StorybookConnection,
  StoriesBrowser,
  StoryPreviewBrowser,
  MetricsWatcher,
  createExecutionService,
} from 'storycrawler';

(async function () {
  // Connect to the target Storybook server.
  const storybookUrl = 'https://storybookjs.netlify.app/vue-kitchen-sink';
  const connection = await new StorybookConnection({ storybookUrl }).connect();

  // Launch Puppeteer process to fetch stories info.
  const storiesBrowser = await new StoriesBrowser(connection).boot();
  // Item in stories has name, kind and id of the corresponding story
  const stories = await storiesBrowser.getStories();

  // Launce Puppeteer browsers to visit each story's preview window(iframe.html)
  const workers = await Promise.all([0, 1, 2, 3].map(i => new StoryPreviewBrowser(connection, i).boot()));

  try {
    // `createExecutionService` creates a queue of the tasks for each story.
    const service = createExecutionService(workers, stories, story => async worker => {
      // Display story in the worker's preview window
      await worker.setCurrentStory(story);

      // Wait for UI framework updating DOM
      await new MetricsWatcher(worker.page).waitForStable();

      // Extract information from the preview window.
      // You can access Puppeteer's page instance via `worker.page`.
      const m = await worker.page.metrics();
      return { story, nodesCount: m.Nodes };
    });

    // `createExecutionService` register tasks but does not kick them.
    // Tasks in queue start via calling `.execute()`.
    const results = await service.execute();

    results.forEach(({ story, nodesCount }) => console.log(`${story.id}: ${nodesCount}`));
  } finally {
    await storiesBrowser.close();
    await Promise.all(workers.map(worker => worker.close()));
    await connection.disconnect();
  }
})();
