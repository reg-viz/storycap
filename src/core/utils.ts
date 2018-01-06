import * as _ from 'lodash';
import sanitize = require('sanitize-filename');
import { Viewport } from '../models/viewport';
import { StorybookEnv } from '../models/storybook';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const parser = {
  identity: (v: string | undefined) => v,
  bool: (v: string | undefined) => v === undefined ? false : !!v,
  number: (v: string | undefined) => v ? parseInt(v, 10) : 0,
  list: (v: string | undefined) => v ? v.split(',').map(o => o.trim()) : null,
  regexp: (v: string | undefined) => v ? new RegExp(v) : null,
};

export const filenamify = (filename: string) => (
  (sanitize(filename.trim()) as string)
    .replace(/\s{2,}/g, ' ')
    .replace(/\s/g, '-')
);

export const viewport2string = (viewport: Viewport) => ([
  `${viewport.width}x${viewport.height}`,
  `${viewport.isMobile ? '-mobile' : ''}`,
  `${viewport.hasTouch ? '-touch' : ''}`,
  `${viewport.isLandscape ? '-landscape' : ''}`,
  `${viewport.deviceScaleFactor > 1 ? `@${viewport.deviceScaleFactor}x` : ''}`,
].join(''));

export const story2filename = (kind: string, story: string, vp: Viewport | null, ns: string | null) => (
  `${filenamify(`${kind}-${story}${ns ? `_${ns}` : ''}${vp ? `-${viewport2string(vp)}` : ''}`)}.png`
);

export const pascalize = (v: string) => (
  `${v.charAt(0).toUpperCase()}${_.camelCase(v.slice(1))}`
);

const Time = {
  MINUTES: 1000 * 60,
  SECONDS: 1000,
};

export const humanizeDuration = (timestamp: number) => {
  const arr: string[] = [];
  let ts = timestamp;

  if (timestamp > Time.MINUTES) {
    const min = Math.floor(ts / Time.MINUTES);
    ts = ts - (min * Time.MINUTES);
    arr.push(`${min}min`);
  }

  const sec = (ts / Time.SECONDS)
    .toString()
    .split('.')
    .map(s => s.slice(0, 2))
    .join('.');

  arr.push(`${sec}s`);

  return arr.join(' ');
};

export const createArray = (length: number) => (
  (new Array(length)).fill(null)
);

export const getStorybookEnv = () => (
  ((window as any).STORYBOOK_ENV as StorybookEnv) // tslint:disable-line:no-any
);
