import { ExposedWindow } from '../node/types';
import { ScreenshotOptions } from './types';
import imagesloaded from 'imagesloaded';
import { sleep } from '../util';
import { mergeScreenshotOptions, pickupFromVariantKey, expandViewportsOption } from '../util/screenshot-options-helper';

function waitImages(enabled: boolean, selector = 'body') {
  if (!enabled) return Promise.resolve();
  const elm = document.querySelector(selector);
  if (!elm) return Promise.reject();
  return new Promise<void>(res => imagesloaded(elm, () => res()));
}

function waitUserFunction(waitFor: undefined | null | string | (() => Promise<any>), win: ExposedWindow) {
  if (!waitFor) return Promise.resolve();
  if (typeof waitFor === 'string') {
    if (!win.waitFor || typeof win.waitFor !== 'function') return Promise.resolve();
    return win.waitFor();
  } else if (typeof waitFor === 'function') {
    return waitFor();
  } else {
    return Promise.resolve();
  }
}

function waitNextIdle(win: ExposedWindow) {
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
    await waitImages(!!scOpt.waitImages);
    await sleep(scOpt.delay);
    await waitUserFunction(scOpt.waitFor, win);
    await waitNextIdle(win);
    await win.emitCatpture(scOpt, storyKey);
  });
}

export function triggerScreenshot(screenshotOptions: ScreenshotOptions) {
  stock(screenshotOptions);
  Promise.resolve().then(capture);
}
