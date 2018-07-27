/* tslint:disable: no-any */
import * as utils from '../utils';
import { Viewport } from '../../models/viewport';
import { Knobs, StoredKnobs } from '../../models/knobs';

describe('Utilities', () => {
  it('filenamify()', () => {
    const table = [
      ['foo bar baz', 'foo-bar-baz'],
      ['foo    bar', 'foo-bar'],
      ['foo_bar/baz', 'foo_barbaz']
    ];

    for (const [s, o] of table) {
      expect(utils.filenamify(s)).toBe(o);
    }
  });

  it('permutationKnobs()', () => {
    const table = [
      [{}, []],
      [
        {
          bool: [true, false],
          label: ['foo', 'bar'],
          num: [10, 20]
        },
        [
          { bool: true, label: 'foo', num: 10 },
          { bool: false, label: 'foo', num: 10 },
          { bool: true, label: 'bar', num: 10 },
          { bool: false, label: 'bar', num: 10 },
          { bool: true, label: 'foo', num: 20 },
          { bool: false, label: 'foo', num: 20 },
          { bool: true, label: 'bar', num: 20 },
          { bool: false, label: 'bar', num: 20 }
        ]
      ]
    ];

    for (const [v, o] of table) {
      expect(utils.permutationKnobs(<Knobs>v)).toEqual(o);
    }
  });

  it('knobsQueryObject()', () => {
    const table = [
      [{}, {}],
      [
        {
          label: 'text',
          number: 100,
          bool: true
        },
        {
          'knob-label': 'text',
          'knob-number': 100,
          'knob-bool': true
        }
      ]
    ];

    for (const [v, o] of table) {
      expect(utils.knobsQueryObject(v)).toEqual(o);
    }
  });

  it('viewport2string()', () => {
    const vp = {
      width: 900,
      height: 400,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
      deviceScaleFactor: 1
    };

    const table: [Viewport, string][] = [
      [
        {
          ...vp
        },
        '900x400'
      ],
      [
        {
          ...vp,
          width: 100,
          height: 200
        },
        '100x200'
      ],
      [
        {
          ...vp,
          isMobile: true,
          hasTouch: true,
          isLandscape: true,
          deviceScaleFactor: 2
        },
        '900x400-mobile-touch-landscape@2x'
      ]
    ];

    for (const [v, o] of table) {
      expect(utils.viewport2string(v)).toBe(o);
    }
  });

  it('knobs2string()', () => {
    const table = [
      [
        {
          key4: false,
          key3: true,
          key2: 10,
          key1: 'string'
        },
        'key1-string_key2-10_key3-true_key4-false'
      ],
      [
        {
          'Spacing name': 'string',
          'Spacing number': 102
        },
        'Spacing name-string_Spacing number-102'
      ]
    ];

    for (const [v, o] of table) {
      expect(utils.knobs2string(<StoredKnobs>v)).toBe(o);
    }
  });

  it('story2filename', () => {
    const table: [utils.Story2FilenameParams, string][] = [
      [
        {
          kind: 'Kind',
          story: 'Story',
          viewport: null,
          namespace: null,
          knobs: null
        },
        'Kind-Story.png'
      ],
      [
        {
          kind: 'Kind',
          story: 'Story',
          viewport: null,
          namespace: null,
          knobs: null,
          filePattern: '{story}-{kind}'
        },
        'Story-Kind.png'
      ],
      [
        {
          kind: 'foo',
          story: 'bar',
          viewport: {
            width: 100,
            height: 200,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 2
          },
          namespace: null,
          knobs: null
        },
        'foo-bar-100x200@2x.png'
      ],
      [
        {
          kind: 'foo',
          story: 'bar',
          viewport: {
            width: 1,
            height: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 1
          },
          namespace: 'baz',
          knobs: null
        },
        'foo-bar_baz-1x2.png'
      ],
      [
        {
          kind: 'foo',
          story: 'bar',
          viewport: null,
          namespace: 'baz',
          knobs: null,
          filePattern: '{ns}/{vp}/{kind}-{story}'
        },
        'baz/foo-bar.png'
      ],
      [
        {
          kind: 'foo',
          story: 'bar',
          viewport: {
            width: 1,
            height: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 1
          },
          namespace: 'baz',
          knobs: null,
          filePattern: '{ns}/{vp}/{kind}-{story}'
        },
        'baz/1x2/foo-bar.png'
      ],
      [
        {
          kind: 'foo',
          story: 'bar',
          viewport: {
            width: 1,
            height: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 1
          },
          namespace: 'baz',
          knobs: {
            'Component Label': 'string',
            falsy: false,
            truthy: true
          }
        },
        'foo-bar-Component-Label-string_falsy-false_truthy-true_baz-1x2.png'
      ]
    ];

    for (const [p, o] of table) {
      expect(utils.story2filename(p)).toBe(o);
    }
  });

  it('pascalize()', () => {
    const table = [
      ['camelCase', 'CamelCase'],
      ['foo_bar_baz', 'FooBarBaz'],
      ['foo bar baz', 'FooBarBaz']
    ];

    for (const [s, o] of table) {
      expect(utils.pascalize(s)).toBe(o);
    }
  });

  it('humanizeDuration()', () => {
    const table: [number, string][] = [
      [1000, '1s'],
      [2100, '2.1s'],
      [5111, '5.11s'],
      [1 * 1000 * 60 + 2000, '1min 2s'],
      [19 * 1000 * 60 + 5610, '19min 5.61s']
    ];

    for (const [n, o] of table) {
      expect(utils.humanizeDuration(n)).toBe(o);
    }
  });

  it('getStorybookEnv()', () => {
    (window as any).STORYBOOK_ENV = 'react';
    expect(utils.getStorybookEnv()).toBe('react');

    (window as any).STORYBOOK_ENV = 'angular';
    expect(utils.getStorybookEnv()).toBe('angular');
  });
});
