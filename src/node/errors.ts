export class InvalidUrlError extends Error {
  name = " InvalidUrlError";

  constructor(invalidUrl: string) {
    super();
    this.message = `The URL ${invalidUrl} is invalid.`;
  }
}

export class StorybookServerTimeoutError extends Error {
  name = "ScreenshotTimeoutError";

  constructor(msec: number) {
    super();
    this.message = `Storybook server launch timeout exceeded in ${msec} ms.`;
  }
}

export class NoStoriesError extends Error {
  name = "NoStoriesError";
}

export class ScreenshotTimeoutError extends Error {
  name = "ScreenshotTimeoutError";

  constructor(msec: number, target: { kind?: string; story?: string }) {
    super();
    this.message = `Screenshot timeout exceeded. 'capture' function is not triggerd in ${msec} ms. Target story: ${target.kind}/${target.story}`;
  }
}

export class InvalidCurrentStoryStateError extends Error {
  name = "InvalidCurrentStoryStateError";

  constructor() {
    super();
    this.message = "Fail to screenshot. The current story is not set.";
  }
}
