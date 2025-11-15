import { VariantKey, StrictScreenshotOptions, ScreenshotOptions, ScreenshotOptionFragments } from '../shared/types.js';

const defaultScreenshotOptions = {
  waitAssets: true,
  waitImages: false,
  waitFor: '',
  fullPage: true,
  skip: false,
  focus: '',
  hover: '',
  click: '',
  variants: {},
  omitBackground: false,
  captureBeyondViewport: true,
  clip: null,
  forwardConsoleLogs: false,
  trace: false,
} as const;

/**
 *
 * Convert to `viewport` and `variants` from `viewports` filed.
 *
 * @param options - Screenshot options which may have `viewports` field
 * @returns - Screenshot options with variants corresponding to the `viewports` field
 *
 **/
export function expandViewportsOption(options: ScreenshotOptions) {
  if (!options.viewports) return options;
  const { viewports } = options;
  const ret = { ...options };
  delete ret.viewports;

  const viewportNames = Array.isArray(viewports) ? viewports : Object.keys(viewports);
  if (!viewportNames.length) return options;

  const getVp = (vpName: string) => (Array.isArray(viewports) ? vpName : viewports[vpName]);

  const variants = { ...options.variants };
  viewportNames.slice(1).forEach(vpName => (variants[vpName] = { viewport: getVp(vpName) }));
  ret.viewport = getVp(viewportNames[0]);
  ret.variants = variants;

  if (viewportNames.length > 1) {
    ret.defaultVariantSuffix = viewportNames[0] as string;
  }

  return ret;
}

/**
 *
 * Returns fulfilled `ScreenshotOptions` object from some properties.
 *
 * @param props - Some properties of `ScreenshotOptions` fragment
 * @returns Fulfilled screenshot options
 *
 **/
export function createBaseScreenshotOptions({
  delay,
  disableWaitAssets,
  viewports,
}: {
  delay: number;
  disableWaitAssets: boolean;
  viewports: string[];
}): StrictScreenshotOptions {
  if (viewports.length > 1) {
    return {
      ...defaultScreenshotOptions,
      delay,
      waitAssets: !disableWaitAssets,
      viewport: viewports[0],
      variants: viewports.slice(1).reduce((acc, vp) => ({ ...acc, [vp]: { viewport: vp } }), {}),
      defaultVariantSuffix: viewports[0],
    };
  } else {
    return {
      ...defaultScreenshotOptions,
      delay,
      waitAssets: !disableWaitAssets,
      viewport: viewports[0],
      defaultVariantSuffix: '',
    };
  }
}

/**
 *
 * Combines 2 screenshot options.
 *
 * @param base - The base screenshot options
 * @param fragment - The fragment screenshot options to override the base options
 * @returns Merged screenshot options
 *
 **/
export function mergeScreenshotOptions<T extends ScreenshotOptions>(base: T, fragment: ScreenshotOptions): T {
  const ret = Object.assign({}, base, fragment) as T;
  if (!base.viewport || typeof base.viewport === 'string') {
    if (fragment.viewport) {
      ret.viewport = fragment.viewport;
    }
  } else {
    if (!fragment.viewport) {
    } else if (typeof fragment.viewport === 'object') {
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

export type CircularVariantRef = {
  type: 'circular';
  refs: string[];
};

export type VariantKeyNotFound = {
  type: 'notFound';
  from: string;
  to: string;
};

export type InvalidVariantKeysReason = CircularVariantRef | VariantKeyNotFound;

/**
 *
 * Returns keys of all variants in given screenshot options expanding `extends` field in each variant.
 *
 * @param options - Screenshot options which may have `variants` field
 * @returns If succeeded extracted variant keys. If not succeeded the reason of the failure
 *
 **/
export function extractVariantKeys({
  variants,
  defaultVariantSuffix,
}: ScreenshotOptions): [InvalidVariantKeysReason | null, VariantKey[]] {
  if (!variants) return [null, []];
  let invalidReason: InvalidVariantKeysReason | undefined = undefined;
  const ret = Object.keys(variants).reduce((acc, key) => {
    const keysList: string[][] = [];
    const getParentKeys = (currentKey: string, childrenKeys: string[] = []): boolean => {
      // Set `defaultVariantSuffix` value as the head variant key if it's referred.
      if (defaultVariantSuffix && defaultVariantSuffix === currentKey) {
        keysList.push([currentKey, ...childrenKeys]);
        return true;
      }

      // Check the key exists.
      if (!variants[currentKey]) {
        invalidReason = {
          type: 'notFound',
          from: childrenKeys[0],
          to: currentKey,
        };
        return false;
      }

      // Check circular reference.
      if (childrenKeys.find(k => k === currentKey)) {
        invalidReason = {
          type: 'circular',
          refs: [currentKey, ...childrenKeys],
        };
        return false;
      }

      const parent = variants![currentKey].extends;
      const parentKeys = Array.isArray(parent) ? parent : typeof parent === 'string' ? [parent] : [];

      // Ends recursive process because the root is here.
      if (!parentKeys.length) {
        keysList.push([currentKey, ...childrenKeys]);
        return true;
      }

      // Get variant keys for each parent if this variant has parents to extend.
      return parentKeys.every(pk => getParentKeys(pk, [currentKey, ...childrenKeys]));
    };
    getParentKeys(key);
    return [...acc, ...keysList.map(keys => ({ isDefault: false, keys }))];
  }, [] as VariantKey[]);
  if (!invalidReason) return [null, ret];
  return [invalidReason, []];
}

/**
 *
 * Pick up screenshot options corresponding to given variant from the root screenshot options.
 *
 * @param options - The root(default) screenshot options
 * @param vk - Key of the target variant
 * @returns Screenshot options for the target variant
 *
 **/
export function pickupWithVariantKey(options: ScreenshotOptions, vk: VariantKey): ScreenshotOptions {
  if (vk.isDefault) return options;
  const base = Object.assign({}, options);
  const variants = base.variants || {};
  delete base.variants;
  const offset = vk.keys[0] && vk.keys[0] === options.defaultVariantSuffix ? 1 : 0;
  return vk.keys
    .slice(offset)
    .reduce((acc: ScreenshotOptionFragments, key) => mergeScreenshotOptions(acc, variants[key]), base);
}
