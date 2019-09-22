import { ExposedWindow } from "../node/types";
import { ScreenShotOptions } from "./types";
import imagesloaded from "imagesloaded";
import { sleep } from "../util";
import { defaultScreenshotOptions } from "./default-screenshot-options";

function waitImages(enabled: boolean, selector = "body") {
  if (!enabled) return Promise.resolve();
  const elm = document.querySelector(selector);
  if (!elm) return Promise.reject();
  return new Promise<void>(res => imagesloaded(elm, () => res()));
}

function waitUserFunction(waitFor: string | (() => Promise<any>), win: ExposedWindow) {
  if (!waitFor) return Promise.resolve();
  if (typeof waitFor === "string") {
    if (!win.waitFor || typeof win.waitFor !== "function") return Promise.resolve();
    return win.waitFor();
  } else if (typeof waitFor === "function") {
    return waitFor();
  } else {
    return Promise.resolve();
  }
}

function waitNextIdle(win: ExposedWindow) {
  return new Promise(res => win.requestIdleCallback(() => res(), { timeout: 3000 }));
}

function pushOptions(win: ExposedWindow, storyKey: string | undefined, opt: Partial<ScreenShotOptions>) {
  if (!storyKey) return;
  if (!win.optionStore) win.optionStore = {};
  if (!win.optionStore[storyKey]) win.optionStore[storyKey] = [];
  win.optionStore[storyKey].push(opt);
}

function consumeOptions(win: ExposedWindow, storyKey: string | undefined): Partial<ScreenShotOptions>[] | null {
  if (!storyKey) return null;
  if (!win.optionStore) return null;
  if (!win.optionStore[storyKey]) return null;
  const result = win.optionStore[storyKey];
  delete win.optionStore[storyKey];
  return result;
}

function withExpoesdWindow(cb: (win: ExposedWindow) => any) {
  if (typeof "window" === "undefined") return;
  const win = window as ExposedWindow;
  if (!win.emitCatpture) return;
  return cb(win);
}

export function stock(opt: Partial<ScreenShotOptions> = {}) {
  withExpoesdWindow(win => {
    win.getCurrentStoryKey(location.href).then(storyKey => pushOptions(win, storyKey, opt));
  });
}

export function capture() {
  withExpoesdWindow(win => {
    win.getCurrentStoryKey(location.href).then(storyKey => {
      if (!storyKey) return;
      const options = consumeOptions(win, storyKey);
      if (!options) return;
      const scOpt = options.reduce(
        (acc: ScreenShotOptions, opt: Partial<ScreenShotOptions>) => ({ ...acc, ...opt }),
        defaultScreenshotOptions,
      );
      if (scOpt.skip) win.emitCatpture(scOpt);
      Promise.resolve()
        .then(() => waitImages(scOpt.waitImages))
        .then(() => sleep(scOpt.delay))
        .then(() => waitUserFunction(scOpt.waitFor, win))
        .then(() => waitNextIdle(win))
        .then(() => win.emitCatpture(scOpt));
    });
  });
}
