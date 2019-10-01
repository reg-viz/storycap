import { expandViewportsOption, pickupFromVariantKey, extractAdditionalVariantKeys } from './screenshot-options-helper';

describe(expandViewportsOption, () => {
  it('should expand viewport and variants from viewports', () => {
    expect(
      expandViewportsOption({
        viewports: ['iPad'],
      }),
    ).toEqual({
      viewport: 'iPad',
      variants: {},
    });

    expect(
      expandViewportsOption({
        viewports: ['iPad', 'iPhone6'],
      }),
    ).toEqual({
      viewport: 'iPad',
      variants: {
        iPhone6: {
          viewport: 'iPhone6',
        },
      },
      defaultVariantSuffix: 'iPad',
    });

    expect(
      expandViewportsOption({
        viewports: {
          hoge: {
            width: 1000,
            height: 1000,
          },
        },
      }),
    ).toEqual({
      viewport: {
        width: 1000,
        height: 1000,
      },
      variants: {},
    });

    expect(
      expandViewportsOption({
        viewports: {
          hoge: {
            width: 1000,
            height: 1000,
          },
          bar: {
            width: 500,
            height: 500,
          },
        },
      }),
    ).toEqual({
      viewport: {
        width: 1000,
        height: 1000,
      },
      variants: {
        bar: {
          viewport: {
            width: 500,
            height: 500,
          },
        },
      },
      defaultVariantSuffix: 'hoge',
    });
  });
});

describe(extractAdditionalVariantKeys, () => {
  it('should return an empty array when options has no variants', () => {
    expect(extractAdditionalVariantKeys({})).toEqual([null, []]);
  });

  it('should extract variant keys from simple variants', () => {
    expect(
      extractAdditionalVariantKeys({
        variants: {
          a: {},
        },
      }),
    ).toEqual([null, [{ isDefault: false, keys: ['a'] }]]);
  });

  it('should extract variant keys expanding extension others', () => {
    expect(
      extractAdditionalVariantKeys({
        variants: {
          a: {},
          b: {
            extends: 'a',
          },
          c: {
            extends: ['b', 'a'],
          },
        },
      }),
    ).toEqual([
      null,
      [
        { isDefault: false, keys: ['a'] },
        { isDefault: false, keys: ['a', 'b'] },
        { isDefault: false, keys: ['a', 'b', 'c'] },
        { isDefault: false, keys: ['a', 'c'] },
      ],
    ]);
  });

  it('should return keys with defaultVariantSuffix', () => {
    expect(
      extractAdditionalVariantKeys({
        variants: {
          a: {
            extends: 'root',
          },
        },
        defaultVariantSuffix: 'root',
      }),
    ).toEqual([null, [{ isDefault: false, keys: ['root', 'a'] }]]);
  });

  it('should return invalid reason when target variant does not exist', () => {
    expect(
      extractAdditionalVariantKeys({
        variants: {
          a: {},
          c: {
            extends: 'b',
          },
        },
      }),
    ).toEqual([
      {
        type: 'notFound',
        from: 'c',
        to: 'b',
      },
      null,
    ]);
  });

  it('should return invalid reason when circular reference', () => {
    expect(
      extractAdditionalVariantKeys({
        variants: {
          a: {
            extends: 'c',
          },
          b: {
            extends: 'a',
          },
          c: {
            extends: 'b',
          },
        },
      }),
    ).toEqual([
      {
        type: 'circular',
        refs: ['c', 'a', 'b', 'c'],
      },
      null,
    ]);
  });
});

describe(pickupFromVariantKey, () => {
  it('should pass through with default variant', () => {
    expect(
      pickupFromVariantKey(
        {
          variants: {
            k1: {
              delay: 100,
            },
          },
        },
        { isDefault: true, keys: [] },
      ),
    ).toEqual({
      variants: {
        k1: {
          delay: 100,
        },
      },
    });
  });

  it('should create merged options with variant', () => {
    expect(
      pickupFromVariantKey(
        {
          delay: 10,
          viewport: 'iPhone 6',
          variants: {
            k1: {
              delay: 100,
              hover: 'fuga',
            },
            k2: {
              hover: 'hoge',
            },
          },
        },
        { isDefault: false, keys: ['k1', 'k2'] },
      ),
    ).toEqual({
      delay: 100,
      hover: 'hoge',
      viewport: 'iPhone 6',
    });
  });

  it('should ignore when head of keys equals to defaultVariantSuffix', () => {
    expect(
      pickupFromVariantKey(
        {
          delay: 10,
          defaultVariantSuffix: 'iPhone 6',
          viewport: 'iPhone 6',
          variants: {
            k1: {
              delay: 100,
            },
          },
        },
        { isDefault: false, keys: ['iPhone 6', 'k1'] },
      ),
    ).toEqual({
      delay: 100,
      viewport: 'iPhone 6',
      defaultVariantSuffix: 'iPhone 6',
    });
  });
});
