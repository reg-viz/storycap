import { StrictScreenshotOptions, ScreenshotOptions, ScreenshotOptionFragments } from '../client/types';
import { VariantKey } from '../types';

export const defaultScreenshotOptions = {
  waitImages: true,
  waitFor: '',
  fullPage: true,
  skip: false,
  focus: '',
  hover: '',
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

export function createBaseScreenshotOptions({
  delay,
  viewports,
}: {
  delay: number;
  viewports: string[];
}): StrictScreenshotOptions {
  if (viewports.length > 1) {
    return {
      ...defaultScreenshotOptions,
      delay,
      viewport: viewports[0],
      variants: viewports.slice(1).reduce((acc, vp) => ({ ...acc, [vp]: { viewport: vp } }), {}),
      defaultVariantSuffix: viewports[0],
    };
  } else {
    return {
      ...defaultScreenshotOptions,
      delay,
      viewport: viewports[0],
      defaultVariantSuffix: '',
    };
  }
}

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

export type InvalidVariantKeysReference = CircularVariantRef | VariantKeyNotFound;

export function extractVariantKeys({
  variants,
  defaultVariantSuffix,
}: ScreenshotOptions): [InvalidVariantKeysReference | null, VariantKey[]] {
  if (!variants) return [null, []];
  let invalidReason: InvalidVariantKeysReference | undefined = undefined;
  const ret = Object.keys(variants).reduce(
    (acc, key) => {
      const keysList: string[][] = [];
      const getParentKeys = (currentKey: string, childrenKeys: string[] = []): boolean => {
        if (defaultVariantSuffix && defaultVariantSuffix === currentKey) {
          keysList.push([currentKey, ...childrenKeys]);
          return true;
        }
        if (!variants[currentKey]) {
          invalidReason = {
            type: 'notFound',
            from: childrenKeys[0],
            to: currentKey,
          };
          return false;
        }
        if (childrenKeys.find(k => k === currentKey)) {
          invalidReason = {
            type: 'circular',
            refs: [currentKey, ...childrenKeys],
          };
          return false;
        }
        const parent = variants![currentKey].extends;
        const parentKeys = Array.isArray(parent) ? parent : typeof parent === 'string' ? [parent] : [];
        if (!parentKeys.length) {
          keysList.push([currentKey, ...childrenKeys]);
          return true;
        }
        return parentKeys.every(pk => getParentKeys(pk, [currentKey, ...childrenKeys]));
      };
      getParentKeys(key);
      return [...acc, ...keysList.map(keys => ({ isDefault: false, keys }))];
    },
    [] as VariantKey[],
  );
  if (!invalidReason) return [null, ret];
  return [invalidReason, []];
}

export function pickupFromVariantKey(options: ScreenshotOptions, vk: VariantKey): ScreenshotOptions {
  if (vk.isDefault) return options;
  const base = Object.assign({}, options);
  const variants = base.variants || {};
  delete base.variants;
  const offset = vk.keys[0] && vk.keys[0] === options.defaultVariantSuffix ? 1 : 0;
  return vk.keys
    .slice(offset)
    .reduce((acc: ScreenshotOptionFragments, key) => mergeScreenshotOptions(acc, variants[key]), base);
}
