#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import 'babel-polyfill';
import program from 'commander';
import emoji from 'node-emoji';
import logSymbols from 'log-symbols';
import ProgressBar from 'progress';
import puppeteer from 'puppeteer';
import mkdirp from 'mkdirp';
import pkg from '../package.json';
import startStorybookServer from './internal/server';
import {
  identity,
  parseInteger,
  parseList,
  filenamify,
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
  .option('--silent', 'Suppress standard output', identity, false)
  .parse(process.argv);


const logger = new Logger(program.silent);

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
  try {
    logger.section(
      'green',
      'LAUNCH',
      'Launching storybook server...',
    );

    const [server, browser] = await Promise.all([
      startStorybookServer(options),
      puppeteer.launch(),
    ]);

    const page = await browser.newPage();

    logger.section(
      'cyan',
      'PREPARE',
      'Fetching the target components...',
    );

    const filenames = [];
    let stories = [];
    let progressbar;

    await page.exposeFunction('setScreenshotStories', (results) => {
      stories = results;

      logger.section(
        'yellow',
        'CAPTURE',
        'Capturing component screenshots...',
      );

      if (!logger.silent) {
        progressbar = new ProgressBar(emoji.emojify(':camera:  [:bar] :current/:total'), {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: stories.length,
        });
      }

      mkdirp(options.outputDir);
    });

    await page.exposeFunction('takeScreenshot', async (params) => {
      const { kind, story, viewport } = params;
      const filename = `${filenamify(`${kind}-${story}`)}.png`;

      await page.setViewport(viewport);
      await page.screenshot({
        path: path.resolve(options.cwd, options.outputDir, filename),
      });

      filenames.push(`${options.outputDir}/${filename}`);

      if (progressbar) {
        progressbar.tick();
      }
    });

    await page.exposeFunction('doneScreenshotAll', () => {
      logger.section('cyan', 'DONE', 'Screenshot image saving is completed!');
      logger.blank();

      filenames.forEach((filename) => {
        logger.log(`  ${logSymbols.success}  ${filename}`);
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

    await page.goto(`${server.getURL()}?full=1&chrome-screenshot=1`);
  } catch (e) {
    exit(e);
  }
})();
