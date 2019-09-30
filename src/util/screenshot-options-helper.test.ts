import { expandViewportsOption, pickupFromVariantKey } from './screenshot-options-helper';

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
            },
          },
        },
        { isDefault: false, keys: ['k1'] },
      ),
    ).toEqual({
      delay: 100,
      viewport: 'iPhone 6',
    });
  });
});
