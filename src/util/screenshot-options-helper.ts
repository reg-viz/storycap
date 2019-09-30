import { StrictScreenshotOptions, ScreenshotOptions, ScreenshotOptionFragments } from "../client/types";
import { VariantKey } from "../types";

export const defaultScreenshotOptions = {
  delay: 0,
  waitImages: true,
  waitFor: "",
  fullPage: true,
  skip: false,
  focus: "",
  hover: "",
  variants: {},
} as const;

export function expandViewportsOption(options: ScreenshotOptions) {
  if (!options.viewports) return options;
  const { viewports } = options;
  const ret = { ...options };
  delete ret.viewports;

  const viewportNames = Array.isArray(viewports) ? viewports : Object.keys(viewports);
  if (!viewportNames.length) return options;

  const getVp = (vpName: string) => (Array.isArray(viewports) ? vpName : viewports[vpName]);

  const variants = { ...options.variants } || {};
  viewportNames.slice(1).forEach(vpName => (variants[vpName] = { viewport: getVp(vpName) }));
  ret.viewport = getVp(viewportNames[0]);
  ret.variants = variants;

  if (viewportNames.length > 1) {
    ret.defaultVariantSuffix = viewportNames[0] as string;
  }

  return ret;
}

export function createBaseScreenshotOptions({ viewports }: { viewports: string[] }): StrictScreenshotOptions {
  if (viewports.length > 1) {
    return {
      ...defaultScreenshotOptions,
      viewport: viewports[0],
      variants: viewports.slice(1).reduce((acc, vp) => ({ ...acc, [vp]: { viewport: vp } }), {}),
      defaultVariantSuffix: viewports[0],
    };
  } else {
    return {
      ...defaultScreenshotOptions,
      viewport: viewports[0],
      defaultVariantSuffix: "",
    };
  }
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
