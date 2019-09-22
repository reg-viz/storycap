import addons from '@storybook/addons';
import { AppAdapter, Client, Env, Gateway } from './core/client';
import { getStorybookEnv } from './core/utils';

// tslint:disable-next-line: no-var-requires no-require-imports
const pkg = require('../package.json');
const env = new Env(getStorybookEnv(), window.location.search);

addons.register(pkg.name, (api) => {
  const appAdapter = new AppAdapter();
  const gateway = new Gateway(appAdapter);
  const client = new Client(env, gateway, addons.getChannel(), api);
  client.run();
});
