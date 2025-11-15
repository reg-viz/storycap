import { ScreenshotOptions, Exposed } from '../shared/types.js';
import {
  mergeScreenshotOptions,
  pickupWithVariantKey,
  expandViewportsOption,
} from '../shared/screenshot-options-helper.js';

type Args<T> = T extends (...args: infer A) => any ? A : never;
type Return<T> = T extends (...args: any) => infer R ? R : never;

type ExposedFns = {
  [P in keyof Exposed]: (...args: Args<Exposed[P]>) => Promise<Return<Exposed[P]>>;
};

type StorycapWindow = typeof window & {
  requestIdleCallback(cb: Function, opt?: { timeout: number }): void;
  optionStore?: { [storyKey: string]: ScreenshotOptions[] };
} & ExposedFns;

function withExpoesdWindow(cb: (win: StorycapWindow) => any) {
  if (typeof 'window' === 'undefined') return;
  const win = window as StorycapWindow;
  if (!win.emitCapture) return;
  return cb(win);
}

function url2StoryKey(url: string) {
  const { searchParams } = new URL(url);
  const id = searchParams.get('id');
  const kind = searchParams.get('selectedKind');
  const story = searchParams.get('selectedStory');
  if (id) {
    // Query string has `id` if Storybook v5
    return id;
  } else if (kind && story) {
    // Query string has `selectedKind` and `selectedStory` if Storybook v4
    return `${kind}/${story}`;
  }
  throw new Error();
}

function waitForDelayTime(time: number = 0) {
  return new Promise(res => setTimeout(res, time));
}

function waitUserFunction(waitFor: undefined | null | string | (() => Promise<any>)) {
  if (!waitFor) return Promise.resolve();
  if (typeof waitFor === 'string') {
    const userDefinedFn = (window as any)[waitFor] as unknown;
    if (typeof userDefinedFn !== 'function') return Promise.resolve();
    return Promise.resolve().then(() => userDefinedFn());
  } else if (typeof waitFor === 'function') {
    return waitFor();
  } else {
    return Promise.resolve();
  }
}

function waitForNextIdle(win: StorycapWindow) {
  return new Promise(res => win.requestIdleCallback(res, { timeout: 3000 }));
}

function pushOptions(win: StorycapWindow, storyKey: string | undefined, opt: Partial<ScreenshotOptions>) {
  if (!storyKey) return;
  if (!win.optionStore) win.optionStore = {};
  if (!win.optionStore[storyKey]) win.optionStore[storyKey] = [];
  win.optionStore[storyKey].push(opt);
}

function consumeOptions(win: StorycapWindow, storyKey: string): ScreenshotOptions[] | null {
  if (!win.optionStore) return null;
  if (!win.optionStore[storyKey]) return null;
  const result = win.optionStore[storyKey];
  delete win.optionStore[storyKey];
  return result;
}

function stock(opt: ScreenshotOptions = {}, context: any) {
  let storyKey: string | undefined = undefined;

  if (context && context.id) {
    storyKey = context.id;
  } else if (context && !!context.story && !!context.kind) {
    storyKey = context.kind + '/' + context.story;
  } else {
    storyKey = url2StoryKey(location.href);
  }

  withExpoesdWindow(win => pushOptions(win, storyKey, opt));
}

function capture() {
  withExpoesdWindow(async win => {
    // First, wait until DOM calculation process is stable because UI frameworks can mutate DOM asynchronously.
    // So we check the number of DOM elements and how many times the browser calculate CSS style.
    // We assume that it's ready for screenshot if these values are stable.
    await win.waitBrowserMetricsStable();

    // Fetch some properties from the Node.js main process
    const [baseScreenshotOptions, variantKey] = await Promise.all([
      win.getBaseScreenshotOptions(), // Options set via CLI
      win.getCurrentVariantKey(), // Variant key for this capturing process
    ]);

    // Get stored screenshot options of this story.
    const storyKey = url2StoryKey(location.href);
    const storedOptsList = consumeOptions(win, storyKey);
    if (!storedOptsList) return; // This code is for type assertion. Stocked options must not be null.

    // Combine all stored options.
    const mergedOptions = storedOptsList.reduce(
      (acc, opt) => mergeScreenshotOptions(acc, expandViewportsOption(opt)),
      baseScreenshotOptions,
    );

    // We should consider the following 2 cases:
    //
    // 1. `variantKey.isDefault: true`
    // It's the first time emitting for this story and Node.js main process don't know what options this story has.
    // So we should emit the entire options to the main process and the main process should queue requests corresponding to variants included in the options.
    //
    // 2. `variantKey.isDefault: false`
    // It's the second(or more) time emitting for this story.
    // In this case, we should emit the only options corresponding to this variant.
    //
    // And the `pickupWithVariantKey` function supports both cases.
    //
    const scOpt = pickupWithVariantKey(mergedOptions, variantKey);

    // Emit canceling to the main process if `skip: true` and exit this function.
    if (scOpt.skip) return win.emitCapture(scOpt, storyKey);

    // Wait for the following:
    // - Delay time set by options(API or CLI)
    // - User promise function
    // - Other browser's main thread procedure(using rIC)
    await waitForDelayTime(scOpt.delay);
    await waitUserFunction(scOpt.waitFor);
    await waitForNextIdle(win);

    // Finally, send options to the Node.js main process.
    await win.emitCapture(scOpt, storyKey);
  });
}

/**
 *
 * Emit given screenshot options to Node.js process.
 *
 * @param screenshotOptions - Options for screenshot
 *
 */
export function triggerScreenshot(screenshotOptions: ScreenshotOptions, context: any) {
  // This function can be called twice or more.
  // So we should stock all options for each calling and emit merged them to Node.js
  stock(screenshotOptions, context);
  Promise.resolve().then(capture);
}
