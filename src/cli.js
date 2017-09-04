#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import 'babel-polyfill';
import program from 'commander';
import emoji from 'node-emoji';
import logSymbols from 'log-symbols';
import chalk from 'chalk';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import mkdirp from 'mkdirp';
import pkg from '../package.json';
import startStorybookServer from './internal/server';
import {
  identity,
  parseInteger,
  parseList,
  parseRegExp,
  story2filename,
} from './internal/utils';
import Logger from './internal/logger';


program
  .version(pkg.version)
  .usage('[options]')
  .option('-p, --port [number]', 'Storybook server port (Default 9001)', parseInteger, 9001)
  .option('-h, --host [string]', 'Storybook server host (Default "localhost")', identity, 'localhost')
  .option('-s, --static-dir <dir-names>', 'Directory where to load static files from', parseList)
  .option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from (Default ".storybook")', identity, '.storybook')
  .option('-o, --output-dir [dir-name]', 'Directory where screenshot images are saved (Default "__screenshots__")', identity, '__screenshots__')
  .option('--filter-kind [regexp]', 'Filter of kind with RegExp. (Example "Button$")', parseRegExp)
  .option('--filter-story [regexp]', 'Filter of story with RegExp. (Example "^with\\s.+$")', parseRegExp)
  .option('--browser-timeout [number]', 'Timeout milliseconds when Puppeteer opens Storybook. (Default 30000)', parseInteger, 30000)
  .option('--silent', 'Suppress standard output', identity, false)
  .option('--debug', 'Enable debug mode.', identity, false)
  .parse(process.argv);


const logger = new Logger(program.silent, program.debug);

const exit = (message, code = 1) => {
  logger.error(message);
  process.exit(code);
};

const bin = execSync('echo $(npm bin)', { encoding: 'utf-8' }).trim();

const options = {
  port: program.port,
  host: program.host,
  staticDir: program.staticDir,
  configDir: program.configDir,
  outputDir: program.outputDir,
  filterKind: program.filterKind,
  filterStory: program.filterStory,
  browserTimeout: program.browserTimeout,
  debug: program.debug,
  cwd: path.resolve(bin, '..', '..'),
  cmd: path.resolve(bin, 'start-storybook'),
};

const config = path.resolve(options.cwd, options.configDir, 'config.js');

if (!fs.existsSync(options.cmd)) {
  exit(`Storybook does not exists. First, let's setup a Storybook!
    See: https://storybook.js.org/basics/quick-start-guide/`);
}

if (!fs.existsSync(config)) {
  exit(`"${options.configDir}/config.js" does not exists.`);
}


(async () => {
  let server;
  let browser;

  try {
    logger.section(
      'green',
      'LAUNCH',
      'Launching storybook server...',
      true,
    );

    [server, browser] = await Promise.all([
      startStorybookServer(options, logger),
      puppeteer.launch(),
    ]);

    const page = await browser.newPage();

    const store = {
      shotting: {
        stories: [],
        filenames: [],
      },
      skipped: {
        stories: [],
        filenames: [],
      },
    };

    let progressbar;

    logger.section(
      'cyan',
      'PREPARE',
      'Fetching the target components...',
      true,
    );

    if (options.filterKind || options.filterStory) {
      logger.log('NODE', `Filter of kind and story, (kind = ${options.filterKind}, story = ${options.filterStory})`);
    }

    page.on('console', (...args) => {
      logger.log('BROWSER', ...args);
    });

    await page.exposeFunction('setScreenshotStories', (results) => {
      results.forEach((obj) => {
        if (
          (options.filterKind && !options.filterKind.test(obj.kind)) ||
          (options.filterStory && !options.filterStory.test(obj.story))
        ) {
          store.skipped.stories.push(obj);
        } else {
          store.shotting.stories.push(obj);
        }
      });

      logger.section(
        'yellow',
        'CAPTURE',
        'Capturing component screenshots...',
      );

      logger.blank();

      logger.log(
        'NODE',
        `Fetched stories
${JSON.stringify(store.shotting.stories, null, '  ')}`,
      );

      logger.log(
        'NODE',
        `Skipped stories
${JSON.stringify(store.skipped.stories, null, '  ')}`,
      );

      if (!logger.silent && !logger.debug) {
        progressbar = new ProgressBar(emoji.emojify(':camera:  [:bar] :current/:total'), {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: store.shotting.stories.length,
        });
      }

      mkdirp(options.outputDir);

      store.skipped.stories.forEach(({ kind, story }) => {
        store.skipped.filenames.push(path.join(options.outputDir, story2filename(kind, story)));
      });

      return store.shotting.stories;
    });

    await page.exposeFunction('takeScreenshot', async (params) => {
      const { kind, story, viewport } = params;
      const filename = story2filename(kind, story);
      const file = path.join(options.outputDir, filename);
      const filePath = path.resolve(options.cwd, file);

      await page.setViewport(viewport);
      await page.screenshot({
        path: filePath,
      });

      store.shotting.filenames.push(file);

      logger.log(
        'NODE',
        `Saved to "${file}".
    kind: "${kind}"
    story: "${story}"
    viewport: "${JSON.stringify(viewport)}"`,
      );

      if (progressbar) {
        progressbar.tick();
      }
    });

    await page.exposeFunction('doneScreenshotAll', () => {
      logger.section('cyan', 'DONE', 'Screenshot image saving is completed!');
      logger.blank();

      store.shotting.filenames.forEach((filename) => {
        logger.echo(`  ${logSymbols.success}  ${filename}`);
      });

      store.skipped.filenames.forEach((filename) => {
        logger.echo(`  ${logSymbols.warning}  ${filename} ${chalk.yellow('(skipped)')}`);
      });

      logger.blank(2);

      browser.close();
      server.kill();
      process.exit(0);
    });

    await page.exposeFunction('failureScreenshot', (error) => {
      browser.close();
      server.kill();
      logger.clear();
      exit(error);
    });

    await page.goto(`${server.getURL()}?full=1&chrome-screenshot=1`, {
      timeout: options.browserTimeout,
    });
  } catch (e) {
    if (server) server.kill();
    if (browser) browser.close();
    exit(e);
  }
})();
