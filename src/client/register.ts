type Addons = {
  register(name: string, cb: Function): void;
};

(window as any).__STORYCAP_MANAGED_MODE_REGISTERED__ = true;

const addoons = require('@storybook/addons').default as Addons;

addoons.register('storycap', () => {
  // nothing to do
});
