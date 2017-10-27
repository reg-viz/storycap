#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';
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
import Store from './internal/store';
import startStorybookServer from './internal/server';
import {
  PhaseTypes,
  EventTypes,
} from './constants';
import {
  identity,
  parseInteger,
  parseList,
  parseRegExp,
  createArray,
  arrayChunk,
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
  .option('--parallel [number]', 'Number of Page Instances of Puppeteer to be activated when shooting screenshots (Default 4)', parseInteger, 4)
  .option('--filter-kind [regexp]', 'Filter of kind with RegExp. (Example "Button$")', parseRegExp)
  .option('--filter-story [regexp]', 'Filter of story with RegExp. (Example "^with\\s.+$")', parseRegExp)
  .option('--inject-files <file-names>', 'Path to the JavaScript file to be injected into frame. (Default "")', parseList, [])
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
  parallel: program.parallel,
  injectFiles: program.injectFiles,
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
  const store = new Store(options.filterKind, options.filterStory);
  let server;
  let browser;
  let progressbar;

  const close = () => {
    if (server) server.kill();
    if (browser) browser.close();
  };

  try {
    logger.section('green', PhaseTypes.LAUNCH, 'Launching storybook server...', true);

    logger.log('NODE', 'Inject files, ', options.injectFiles);
    logger.log('NODE', `Filter of kind and story, (kind = ${options.filterKind}, story = ${options.filterStory})`);

    [server, browser] = await Promise.all([
      startStorybookServer(options, logger),
      puppeteer.launch(),
    ]);

    const pages = await Promise.all(createArray(options.parallel).map(async () => {
      const page = await browser.newPage();
      const emitter = new EventEmitter();

      page.on('console', (...args) => {
        logger.log('BROWSER', ...args);
      });

      await page.exposeFunction('readyComponentScreenshot', (index) => {
        emitter.emit(EventTypes.COMPONENT_READY, index);
      });

      await page.exposeFunction('getScreenshotStories', () => (
        store.getStories()
      ));

      await page.exposeFunction('failureScreenshot', (error) => {
        logger.clear();
        close();
        exit(error);
      });

      const goto = (phase, query = {}) => (
        page.goto(server.createURL({
          ...query,
          full: 1,
          'chrome-screenshot': phase,
        }, {
          timeout: options.browserTimeout,
          waitUntil: 'networkidle',
        }))
      );

      const takeScreenshot = story => new Promise(async (resolve) => {
        await page.setViewport(story.viewport);

        await Promise.all([
          goto(PhaseTypes.CAPTURE, {
            selectKind: story.kind,
            selectStory: story.story,
          }),
          new Promise((resolveEmitter) => {
            emitter.once(EventTypes.COMPONENT_READY, resolveEmitter);
          }),
        ]);

        const file = path.join(options.outputDir, story.filename);

        await Promise.all(options.injectFiles.map(filePath => (
          page.injectFile(filePath)
        )));

        await page.screenshot({
          path: path.resolve(options.cwd, file),
        });

        resolve(file);
      });

      return {
        page,
        goto,
        takeScreenshot,
        exposeFunction: (expose, fn) => page.exposeFunction(expose, fn),
      };
    }));

    const firstPage = pages[0];

    logger.section('cyan', PhaseTypes.PREPARE, 'Fetching the target components...', true);

    const takeScreenshotOfStories = async () => {
      const stories = store.getStories();
      const parallel = Math.min(stories.length, options.parallel);
      const chunkSize = Math.max(1, Math.ceil(stories.length / parallel));
      const chunkedStories = arrayChunk(stories, chunkSize);

      await Promise.all(chunkedStories.map(async (arr, i) => {
        const page = pages[i];

        /* eslint-disable no-restricted-syntax, no-await-in-loop */
        for (const story of arr) {
          const file = await page.takeScreenshot(story);

          logger.log(
            'NODE',
            `Saved to "${file}".
    kind: "${story.kind}"
    story: "${story.story}"
    viewport: "${JSON.stringify(story.viewport)}"`,
          );

          if (progressbar) {
            progressbar.tick();
          }
        }
        /* eslint-enable */
      }));

      doneAllComponentScreenshot(); // eslint-disable-line no-use-before-define
    };

    const doneAllComponentScreenshot = async () => {
      if (progressbar) {
        progressbar.terminate();
      }

      logger.section('cyan', PhaseTypes.DONE, 'Screenshot image saving is completed!');
      logger.blank();

      const stories = store.getStories();
      const skippedStories = store.getSkippedStories();

      stories.forEach(({ filename }) => {
        logger.echo(`  ${logSymbols.success}  ${filename}`);
      });

      skippedStories.forEach(({ filename }) => {
        logger.echo(`  ${logSymbols.warning}  ${filename} ${chalk.yellow('(skipped)')}`);
      });

      logger.blank(2);

      close();
      process.exit(0);
    };

    await firstPage.exposeFunction('setScreenshotStories', (results) => {
      store.setStories(results);
      mkdirp(options.outputDir);

      const stories = store.getStories();
      const skippedStories = store.getSkippedStories();

      logger.section('yellow', PhaseTypes.CAPTURE, 'Capturing component screenshots...');
      logger.blank();
      logger.log('NODE', `Fetched stories ${JSON.stringify(stories, null, '  ')}`);
      logger.log('NODE', `Skipped stories ${JSON.stringify(skippedStories, null, '  ')}`);

      if (!logger.silent && !logger.debug) {
        progressbar = new ProgressBar(emoji.emojify(':camera:  [:bar] :current/:total'), {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: stories.length,
        });
      }

      takeScreenshotOfStories();
    });

    await firstPage.goto(PhaseTypes.PREPARE);
  } catch (e) {
    close();
    exit(e);
  }
})();
