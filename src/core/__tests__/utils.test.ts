/* tslint:disable: no-any */
import * as utils from '../utils';
import { Viewport } from '../../models/viewport';

describe('Utilities', () => {
  it('filenamify()', () => {
    const table = [
      ['foo bar baz', 'foo-bar-baz'],
      ['foo    bar', 'foo-bar'],
      ['foo_bar/baz', 'foo_barbaz'],
    ];

    for (const [s, o] of table) {
      expect(utils.filenamify(s)).toBe(o);
    }
  });

  it('viewport2string()', () => {
    const vp = {
      width: 900,
      height: 400,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
      deviceScaleFactor: 1,
    };

    const table: [Viewport, string][] = [
      [
        {
          ...vp,
        },
        '900x400',
      ],
      [
        {
          ...vp,
          width: 100,
          height: 200,
        },
        '100x200',
      ],
      [
        {
          ...vp,
          isMobile: true,
          hasTouch: true,
          isLandscape: true,
          deviceScaleFactor: 2,
        },
        '900x400-mobile-touch-landscape@2x',
      ],
    ];

    for (const [v, o] of table) {
      expect(utils.viewport2string(v)).toBe(o);
    }
  });

  it('story2filename', () => {
    const table: [[string, string, Viewport | null, string | null], string][] = [
      [
        [
          'Kind',
          'Story',
          null,
          null,
        ],
        'Kind-Story.png',
      ],
      [
        [
          'foo',
          'bar',
          {
            width: 100,
            height: 200,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 2,
          },
          null,
        ],
        'foo-bar-100x200@2x.png',
      ],
      [
        [
          'foo',
          'bar',
          {
            width: 1,
            height: 2,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
            deviceScaleFactor: 1,
          },
          'baz',
        ],
        'foo-bar_baz-1x2.png',
      ],
    ];

    for (const [[kind, story, vp, ns], o] of table) {
      expect(utils.story2filename(kind, story, vp, ns)).toBe(o);
    }
  });

  it('pascalize()', () => {
    const table = [
      ['camelCase', 'CamelCase'],
      ['foo_bar_baz', 'FooBarBaz'],
      ['foo bar baz', 'FooBarBaz'],
    ];

    for (const [s, o] of table) {
      expect(utils.pascalize(s)).toBe(o);
    }
  });

  it('humanizeDuration()', () => {
    const table: [number, string][] = [
      [
        1000,
        '1s',
      ],
      [
        2100,
        '2.1s',
      ],
      [
        5111,
        '5.11s',
      ],
      [
        1 * 1000 * 60 + 2000,
        '1min 2s',
      ],
      [
        19 * 1000 * 60 + 5610,
        '19min 5.61s',
      ],
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
