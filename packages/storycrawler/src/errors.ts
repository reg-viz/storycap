export class InvalidUrlError extends Error {
  name = ' InvalidUrlError';

  constructor(invalidUrl: string) {
    super();
    this.message = `The URL ${invalidUrl} is invalid.`;
  }
}

export class StorybookServerTimeoutError extends Error {
  name = 'ScreenshotTimeoutError';

  constructor(msec: number) {
    super();
    this.message = `Storybook server launch timeout exceeded in ${msec} ms.`;
  }
}

export class NoStoriesError extends Error {
  name = 'NoStoriesError';
}

export class StoriesTimeoutError extends Error {
  name = 'StoriesTimeoutError';

  constructor() {
    super();
    this.message = `Getting stories was failed. Make sure that your Storybook is rendered correctly.`;
  }
}

export class ChromiumNotFoundError extends Error {
  name = 'ChromiumNotFoundError';
}
