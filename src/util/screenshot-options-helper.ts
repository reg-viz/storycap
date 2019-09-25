import { StrictScreenshotOptions, ScreenshotOptions, ScreenshotOptionFragments } from "../client/types";
import { defaultScreenshotOptions } from "../client/default-screenshot-options";
import { VariantKey } from "../types";

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
  if (base.variants) {
    ret.variants = mergeScreenshotOptions(base.variants, fragment.variants || {});
  }
  return ret;
}

export function extractAdditionalVariantKeys<T extends ScreenshotOptions>(options: T): VariantKey[] {
  if (!options.variants) return [];
  return Object.keys(options.variants).map(k => ({ isDefault: false, keys: [k] }));
}

export function pickupFromVariantKey(options: ScreenshotOptions, vk: VariantKey): ScreenshotOptions {
  if (vk.isDefault) return options;
  const base = Object.assign({}, options);
  const variants = base.variants || {};
  delete base.variants;
  return vk.keys.reduce((acc: ScreenshotOptionFragments, key) => mergeScreenshotOptions(acc, variants[key]), base);
}
