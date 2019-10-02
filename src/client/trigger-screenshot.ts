import { ScreenshotOptions, Exposed } from '../shared/types';
import imagesloaded from 'imagesloaded';
import {
  mergeScreenshotOptions,
  pickupFromVariantKey,
  expandViewportsOption,
} from '../shared/screenshot-options-helper';

type Args<T> = T extends (...args: infer A) => any ? A : never;
type Return<T> = T extends (...args: any) => infer R ? R : never;

type ExposedFns = {
  [P in keyof Exposed]: (...args: Args<Exposed[P]>) => Promise<Return<Exposed[P]>>;
};

type ExposedWindow = typeof window & {
  requestIdleCallback(cb: Function, opt?: { timeout: number }): void;
  optionStore?: { [storyKey: string]: ScreenshotOptions[] };
} & ExposedFns;

function waitForDelayTime(time: number = 0) {
  return new Promise(res => setTimeout(res, time));
}

function waitForImages(enabled: boolean, selector = 'body') {
  if (!enabled) return Promise.resolve();
  const elm = document.querySelector(selector);
  if (!elm) return Promise.reject();
  return new Promise<void>(res => imagesloaded(elm, () => res()));
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

function waitForNextIdle(win: ExposedWindow) {
  return new Promise(res => win.requestIdleCallback(() => res(), { timeout: 3000 }));
}

function pushOptions(win: ExposedWindow, storyKey: string | undefined, opt: Partial<ScreenshotOptions>) {
  if (!storyKey) return;
  if (!win.optionStore) win.optionStore = {};
  if (!win.optionStore[storyKey]) win.optionStore[storyKey] = [];
  win.optionStore[storyKey].push(opt);
}

function consumeOptions(win: ExposedWindow, storyKey: string | undefined): ScreenshotOptions[] | null {
  if (!storyKey) return null;
  if (!win.optionStore) return null;
  if (!win.optionStore[storyKey]) return null;
  const result = win.optionStore[storyKey];
  delete win.optionStore[storyKey];
  return result;
}

function withExpoesdWindow(cb: (win: ExposedWindow) => any) {
  if (typeof 'window' === 'undefined') return;
  const win = window as ExposedWindow;
  if (!win.emitCatpture) return;
  return cb(win);
}

function stock(opt: Partial<ScreenshotOptions> = {}) {
  withExpoesdWindow(win => win.getCurrentStoryKey(location.href).then(storyKey => pushOptions(win, storyKey, opt)));
}

function capture() {
  withExpoesdWindow(async win => {
    await win.waitBrowserMetricsStable();
    const [baseScreenshotOptions, storyKey, variantKey] = await Promise.all([
      win.getBaseScreenshotOptions(),
      win.getCurrentStoryKey(location.href),
      win.getCurrentVariantKey(),
    ]);
    if (!storyKey) return;
    const options = consumeOptions(win, storyKey);
    if (!options) return;
    const scOpt = pickupFromVariantKey(
      options.reduce((acc, opt) => mergeScreenshotOptions(acc, expandViewportsOption(opt)), baseScreenshotOptions),
      variantKey,
    );
    if (scOpt.skip) win.emitCatpture(scOpt, storyKey);
    await waitForImages(!!scOpt.waitImages);
    await waitForDelayTime(scOpt.delay);
    await waitUserFunction(scOpt.waitFor);
    await waitForNextIdle(win);
    await win.emitCatpture(scOpt, storyKey);
  });
}

export function triggerScreenshot(screenshotOptions: ScreenshotOptions) {
  stock(screenshotOptions);
  Promise.resolve().then(capture);
}
