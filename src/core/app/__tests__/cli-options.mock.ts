import { CLIOptions } from '../../../models/options';

export const cliOptions: CLIOptions = {
  port: 9000,
  host: 'localhost',
  staticDir: '',
  outputDir: 'output',
  configDir: 'config',
  filterKind: undefined,
  filterStory: undefined,
  browserTimeout: 10000,
  parallel: 4,
  injectFiles: [],
  puppeteerLaunchConfig: '{"args":["--no-sandbox","--disable-setuid-sandbox"]}',
  silent: false,
  debug: false,
  ciMode: false,
  cwd: '/repo',
  cmd: 'start-storybook',
};
