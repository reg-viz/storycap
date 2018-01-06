#!/usr/bin/env node

import * as path from 'path';
import { spawn, execSync } from 'child_process';
import 'babel-polyfill';
import { parser } from './core/utils';
import { App, Terminal, Server, Browser, StoryStore } from './core/app/';
import { CLIOptions } from './models/options';
import program = require('commander');

const pkg = require('../package.json');

/* tslint:disable:max-line-length */
program
  .version(pkg.version)
  .usage('[options]')
  .option('-p, --port [number]', 'Storybook server port.', parser.identity, 9001)
  .option('-h, --host [string]', 'Storybook server host.', parser.identity, 'localhost')
  .option('-s, --static-dir <dir-names>', 'Directory where to load static files from.', parser.list)
  .option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from.', parser.identity, '.storybook')
  .option('-o, --output-dir [dir-name]', 'Directory where screenshot images are saved.', parser.identity, '__screenshots__')
  .option('--parallel [number]', 'Number of Page Instances of Puppeteer to be activated when shooting screenshots.', parser.number, 4)
  .option('--filter-kind [regexp]', 'Filter of kind with RegExp. (example: "Button$")', parser.regexp)
  .option('--filter-story [regexp]', 'Filter of story with RegExp. (example: "^with\\s.+$")', parser.regexp)
  .option('--inject-files <file-names>', 'Path to the JavaScript file to be injected into frame.', parser.list, [])
  .option('--browser-timeout [number]', 'Timeout milliseconds when Puppeteer opens Storybook.', parser.number, 30000)
  .option('--silent', 'Suppress standard output.', parser.bool, false)
  .option('--debug', 'Enable debug mode.', parser.bool, false)
  .parse(process.argv);
/* tslint:enable */

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
  silent: program.silent,
  debug: program.debug,
  cwd: path.resolve(bin, '..', '..'),
  cmd: path.resolve(bin, 'start-storybook'),
};

(async () => {
  const store = new StoryStore(
    options.filterKind,
    options.filterStory,
  );

  const terminal = new Terminal(
    process.stdout,
    process.stderr,
    options.silent,
    options.debug,
  );

  const app = new App(
    options,
    store,
    terminal,
    new Server(options, terminal, spawn),
    new Browser(store, options),
  );

  try {
    await app.validate();
    await app.launch();
    await app.prepare();
    await app.capture();
    await app.teardown();
    process.exit(0);

  } catch (e) {
    app.terminate();
    process.exit(1);
  }
})();
