export class ScreenshotTimeoutError extends Error {
  name = 'ScreenshotTimeoutError';

  constructor(msec: number, target: { kind?: string; story?: string }) {
    super();
    this.message = `Screenshot timeout exceeded. 'capture' function is not triggered in ${msec} ms. Target story: ${target.kind}/${target.story}`;
  }
}

export class InvalidCurrentStoryStateError extends Error {
  name = 'InvalidCurrentStoryStateError';

  constructor() {
    super();
    this.message = 'Fail to screenshot. The current story is not set.';
  }
}
