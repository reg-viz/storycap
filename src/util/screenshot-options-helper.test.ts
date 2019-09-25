import { pickupFromVariantKey } from "./screenshot-options-helper";

describe(pickupFromVariantKey, () => {
  it("should pass through with default variant", () => {
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

  it("should create merged options with variant", () => {
    expect(
      pickupFromVariantKey(
        {
          delay: 10,
          viewport: "iPhone 6",
          variants: {
            k1: {
              delay: 100,
            },
          },
        },
        { isDefault: false, keys: ["k1"] },
      ),
    ).toEqual({
      delay: 100,
      viewport: "iPhone 6",
    });
  });
});
