import { addons } from 'storybook/manager-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

if (addons) {
  addons.register('storycap', () => {
    // nothing to do
  });
}
