import { StrictScreenshotOptions, ScreenshotOptions } from "../client/types";
import { defaultScreenshotOptions } from "../client/default-screenshot-options";

export function createBaseScreenshotOptions({ defaultViewport }: { defaultViewport: string }): StrictScreenshotOptions {
  return {
    ...defaultScreenshotOptions,
    viewport: defaultViewport,
  };
}

export function mergeScreenshotOptions<T extends ScreenshotOptions>(base: T, fragment: ScreenshotOptions): T {
  const ret = Object.assign({}, base, fragment) as T;
  if (!base.viewport || typeof base.viewport === "string") {
    if (fragment.viewport) {
      ret.viewport = fragment.viewport;
    }
  } else {
    if (!fragment.viewport) {
    } else if (typeof fragment.viewport === "object") {
      ret.viewport = {
        ...base.viewport,
        ...fragment.viewport,
      };
    } else {
      ret.viewport = fragment.viewport;
    }
  }
  return ret;
}
