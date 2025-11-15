import { addons } from 'storybook/manager-api';

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

addons &&
  addons.register('storycap', () => {
    // nothing to do
  });
