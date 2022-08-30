import { addons } from '@storybook/addons';

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

addons.register('storycap', () => {
  // nothing to do
});
