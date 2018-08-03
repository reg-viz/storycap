import * as _ from 'lodash';
import { defaultScreenshotOptions } from '../core/constants';
import { PartialScreenshotOptions, ScreenshotOptions } from '../models/options';
import { mergeScreenshotOptions } from '../screenshot-options';

const defaults = _.merge({}, defaultScreenshotOptions);

describe('Screenshot Options', () => {
  it('mergeScreenshotOptions()', () => {
    const table: [PartialScreenshotOptions, ScreenshotOptions][] = [
      [{}, _.merge({}, defaults)],
      [
        {
          namespace: 'foo'
        },
        _.merge({}, defaults, {
          namespace: 'foo'
        })
      ],
      [
        {
          viewport: {
            width: 100,
            height: 1000
          }
        },
        _.merge({}, defaults, {
          viewport: _.merge({}, defaults.viewport, {
            width: 100,
            height: 1000
          })
        })
      ]
    ];

    for (const [opts, o] of table) {
      expect(mergeScreenshotOptions(opts)).toEqual(o);
    }
  });
});
