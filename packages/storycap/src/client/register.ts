import type { Addons } from '@storybook/addons';

let addons: Addons | undefined;
try {
  addons = require('@storybook/addons').addons;
} catch {}
try {
  addons = require('@storybook/manager-api').addons;
} catch {}

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

addons &&
  addons.register('storycap', () => {
    // nothing to do
  });
