import addons from '@storybook/addons';
import { Env, AppAdapter, Gateway, Client } from './core/client/';
import { getStorybookEnv } from './core/utils';

const pkg = require('../package.json');
const env = new Env(getStorybookEnv(), window.location.search);

addons.register(pkg.name, async (api) => {
  const gateway = new Gateway(new AppAdapter());
  const client = new Client(env, gateway, addons.getChannel(), api);
  client.run();
});
