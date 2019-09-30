type Addons = {
  register(name: string, cb: Function): void;
};

const addoons = require('@storybook/addons').default as Addons;

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

addoons.register('storycap', () => {
  // nothing to do
});
