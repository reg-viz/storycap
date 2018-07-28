import * as _ from 'lodash';
import sanitize from 'sanitize-filename';
import { Knobs, StoredKnobs } from '../models/knobs';
import { StorybookEnv } from '../models/storybook';
import { Viewport } from '../models/viewport';

const DEFAULT_FILE_PATTERN = '{kind}-{story}-{knobs}_{ns}-{vp}';

// tslint:disable-next-line: no-string-based-set-timeout
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const parser = {
  identity: (v: string | undefined) => v,
  number: (v: string | undefined) => (v != null ? parseInt(v, 10) : 0),
  list: (v: string | undefined) => (v != null ? v.split(',').map((o) => o.trim()) : null),
  regexp: (v: string | undefined) => (v != null ? new RegExp(v) : null)
};

export const filenamify = (filename: string) =>
  sanitize(filename.trim())
    .replace(/\s{2,}/g, ' ')
    .replace(/\s/g, '-');

export const permutationKnobs = (knobs: Knobs): StoredKnobs[] => {
  const keys = Object.keys(knobs).sort();
  if (keys.length === 0) {
    return [];
  }

  const total = keys.reduce((previous, current) => previous * knobs[current].length, 1);
  const result: StoredKnobs[] = [];
  let q = 0;
  let r = 0;

  for (let i = 0; i < total; i += 1) {
    result[i] = {};
    q = i;

    for (const key of keys) {
      r = q % knobs[key].length;
      q = Math.floor(q / knobs[key].length);
      result[i][key] = knobs[key][r];
    }
  }

  return result;
};

export const knobsQueryObject = (knobs: StoredKnobs): StoredKnobs => {
  const queryObject: StoredKnobs = {};

  for (const [name, knob] of Object.entries(knobs)) {
    queryObject[`knob-${name}`] = knob;
  }

  return queryObject;
};

export const viewport2string = (viewport: Viewport) =>
  [
    `${viewport.width}x${viewport.height}`,
    `${viewport.isMobile ? '-mobile' : ''}`,
    `${viewport.hasTouch ? '-touch' : ''}`,
    `${viewport.isLandscape ? '-landscape' : ''}`,
    `${viewport.deviceScaleFactor > 1 ? `@${viewport.deviceScaleFactor}x` : ''}`
  ].join('');

export const knobs2string = (knobs: StoredKnobs) =>
  Object.keys(knobs)
    .sort()
    .map((key) => `${key}-${knobs[key]}`)
    .join('_');

export interface Story2FilenameParams {
  kind: string;
  story: string;
  viewport: Viewport | null;
  namespace: string | null;
  knobs: StoredKnobs | null;
  filePattern?: string | null;
}

interface Story2FilenameReplacer {
  kind: string;
  story: string;
  knobs: string;
  ns: string;
  vp: string;
}

export const story2filename = (params: Story2FilenameParams) => {
  const ns = params.namespace != null ? `${params.namespace}` : '_';
  const vp = params.viewport != null ? `${viewport2string(params.viewport)}` : '_';
  const knobs = params.knobs != null ? `${knobs2string(params.knobs)}` : '_';

  const replacements: Story2FilenameReplacer = {
    kind: params.kind,
    story: params.story,
    knobs,
    ns,
    vp
  };

  const filename = (params.filePattern != null ? params.filePattern : DEFAULT_FILE_PATTERN)
    .replace(/\{(\w+)\}/g, (_, key: keyof Story2FilenameReplacer) => filenamify(replacements[key]))
    .replace(/-_/g, '')
    .replace(/__/g, '')
    .replace(/\/_/g, '');

  return `${filename}.png`;
};

export const pascalize = (v: string) => `${v.charAt(0).toUpperCase()}${_.camelCase(v.slice(1))}`;

const Time = {
  MINUTES: 1000 * 60,
  SECONDS: 1000
};

export const humanizeDuration = (timestamp: number) => {
  const arr: string[] = [];
  let ts = timestamp;

  if (timestamp > Time.MINUTES) {
    const min = Math.floor(ts / Time.MINUTES);
    ts = ts - min * Time.MINUTES;
    arr.push(`${min}min`);
  }

  const sec = (ts / Time.SECONDS)
    .toString()
    .split('.')
    .map((s) => s.slice(0, 2))
    .join('.');

  arr.push(`${sec}s`);

  return arr.join(' ');
};

export type Task<T> = (idx: number) => Promise<T>;

export const execParalell = <T>(tasks: Task<T>[], p: number = 1) => {
  const copied = tasks.slice();
  const results = <T[]>[];

  return Promise.all(
    _.range(p).map(
      (i) =>
        new Promise((res, rej) => {
          function next(): Promise<number | void> {
            const t = copied.shift();

            // tslint:disable: no-void-expression
            return t == null
              ? Promise.resolve(res())
              : t(i)
                  .then((r) => results.push(r))
                  .then(next)
                  .catch(rej);
            // tslint:enable
          }

          return next();
        })
    )
  ).then(() => results);
};

export const getStorybookEnv = () => <StorybookEnv>(<any>window).STORYBOOK_ENV;
