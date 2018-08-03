#!/usr/bin/env node

import 'babel-polyfill'; // tslint:disable-line: no-import-side-effect
import { execSync, spawn } from 'child_process';
import program from 'commander';
import isCI from 'is-ci';
import * as path from 'path';
import { App, Browser, Server, StoryStore, Terminal } from './core/app';
import { parser } from './core/utils';
import { CLIOptions } from './models/options';

// tslint:disable-next-line: no-var-requires no-require-imports
const pkg = require('../package.json');

// tslint:disable: max-line-length
program
  .version(pkg.version)
  .usage('[options]')
  .option('-p, --port [number]', 'Storybook server port.', parser.identity, 9001)
  .option('-h, --host [string]', 'Storybook server host.', parser.identity, 'localhost')
  .option('-s, --static-dir <dir-names>', 'Directory where to load static files from.', parser.list)
  .option(
    '-c, --config-dir [dir-name]',
    'Directory where to load Storybook configurations from.',
    parser.identity,
    '.storybook'
  )
  .option(
    '-o, --output-dir [dir-name]',
    'Directory where screenshot images are saved.',
    parser.identity,
    '__screenshots__'
  )
  .option(
    '--parallel [number]',
    'Number of Page Instances of Puppeteer to be activated when shooting screenshots.',
    parser.number,
    4
  )
  .option(
    '--filter-kind [regexp]',
    'Filter of kind with RegExp. (example: "Button$")',
    parser.regexp
  )
  .option(
    '--filter-story [regexp]',
    'Filter of story with RegExp. (example: "^with\\s.+$")',
    parser.regexp
  )
  .option(
    '--inject-files <file-names>',
    'Path to the JavaScript file to be injected into frame.',
    parser.list,
    []
  )
  .option(
    '--browser-timeout [number]',
    'Timeout milliseconds when Puppeteer opens Storybook.',
    parser.number,
    30000
  )
  .option(
    '--puppeteer-launch-config [json]',
    'JSON string of launch config for Puppeteer.',
    parser.identity,
    '{"args":["--no-sandbox","--disable-setuid-sandbox", "--disable-dev-shm-usage"]}'
  )
  .option('--silent', 'Suppress standard output.', parser.identity, false)
  .option('--debug', 'Enable debug mode.', parser.identity, false)
  .parse(process.argv);
// tslint:enable

const bin = execSync('echo $(npm bin)', { encoding: 'utf-8' })
  .toString()
  .trim();

const options: CLIOptions = {
  port: program.port,
  host: program.host,
  staticDir: program.staticDir,
  configDir: program.configDir,
  outputDir: program.outputDir,
  filterKind: program.filterKind,
  filterStory: program.filterStory,
  browserTimeout: program.browserTimeout,
  parallel: program.parallel,
  injectFiles: program.injectFiles,
  puppeteerLaunchConfig: program.puppeteerLaunchConfig,
  silent: !!program.silent,
  debug: !!program.debug,
  ciMode: isCI,
  cwd: path.resolve(bin, '..', '..'),
  cmd: path.resolve(bin, 'start-storybook')
};

// tslint:disable-next-line: no-floating-promises
(async () => {
  const store = new StoryStore(options.filterKind, options.filterStory);

  const terminal = new Terminal(
    process.stdout,
    process.stderr,
    options.silent,
    options.debug,
    options.ciMode
  );

  const app = new App(
    options,
    store,
    terminal,
    new Server(options, terminal, spawn),
    (id: number) => new Browser(id, store, options)
  );

  try {
    await app.validate();
    await app.launch();
    await app.prepare();
    await app.capture();
    await app.teardown();
    process.exit(0);
  } catch (e) {
    await app.terminate(e);
    process.exit(1);
  }
})();
