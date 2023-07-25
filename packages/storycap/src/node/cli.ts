#!/usr/bin/env node

import { time, ChromeChannel, getDeviceDescriptors } from 'storycrawler';
import { main } from './main';
import { MainOptions, ShardOptions } from './types';
import yargs from 'yargs';
import { Logger } from './logger';
import { parseShardOptions } from './shard-utilities';

function showDevices(logger: Logger) {
  getDeviceDescriptors().map(device => logger.log(device.name, JSON.stringify(device.viewport)));
}

function createOptions(): MainOptions {
  const setting = yargs
    .locale('en')
    .wrap(120)
    .version(require('../../package.json').version)
    .usage('usage: storycap [options] storybook_url')
    .option('outDir', { string: true, alias: 'o', default: '__screenshots__', description: 'Output directory.' })
    .option('parallel', { number: true, alias: 'p', default: 4, description: 'Number of browsers to screenshot.' })
    .option('flat', { boolean: true, alias: 'f', default: false, description: 'Flatten output filename.' })
    .option('include', { array: true, alias: 'i', default: [], description: 'Including stories name rule.' })
    .option('exclude', { array: true, alias: 'e', default: [], description: 'Excluding stories name rule.' })
    .option('delay', { number: true, default: 0, description: 'Waiting time [msec] before screenshot for each story.' })
    .option('viewport', { array: true, alias: 'V', default: ['800x600'], description: 'Viewport.' })
    .option('disableCssAnimation', {
      boolean: true,
      default: true,
      description: 'Disable CSS animation and transition.',
    })
    .option('disableWaitAssets', {
      boolean: true,
      default: false,
      description: 'Disable waiting for requested assets',
    })
    .option('trace', { boolean: true, default: false, description: 'Emit Chromium trace files per screenshot.' })
    .option('silent', { boolean: true, default: false })
    .option('verbose', { boolean: true, default: false })
    .option('forwardConsoleLogs', {
      boolean: true,
      default: false,
      description: "Forward in-page console logs to the user's console.",
    })
    .option('serverCmd', { string: true, default: '', description: 'Command line to launch Storybook server.' })
    .option('serverTimeout', {
      number: true,
      default: 60_000,
      description: 'Timeout [msec] for starting Storybook server.',
    })
    .option('shard', {
      string: true,
      default: '1/1',
      description:
        'The sharding options for this run. In the format <shardNumber>/<totalShards>. <shardNumber> is a number between 1 and <totalShards>. <totalShards> is the total number of computers working.',
    })
    .option('captureTimeout', { number: true, default: 5_000, description: 'Timeout [msec] for capture a story.' })
    .option('captureMaxRetryCount', { number: true, default: 3, description: 'Number of count to retry to capture.' })
    .option('metricsWatchRetryCount', {
      number: true,
      default: 1000,
      description: 'Number of count to retry until browser metrics stable.',
    })
    .option('viewportDelay', {
      number: true,
      default: 300,
      description: 'Delay time [msec] between changing viewport and capturing.',
    })
    .option('reloadAfterChangeViewport', {
      boolean: true,
      default: false,
      description: 'Whether to reload after viewport changed.',
    })
    .option('stateChangeDelay', {
      number: true,
      default: 0,
      description: "Delay time [msec] after changing element's state.",
    })
    .option('listDevices', {
      boolean: true,
      default: false,
      description: 'List available device descriptors.',
    })
    .option('chromiumChannel', {
      alias: 'C',
      string: true,
      default: '*',
      description: 'Channel to search local Chromium. One of "puppeteer", "canary", "stable", "*"',
    })
    .option('chromiumPath', {
      string: true,
      default: '',
      description: 'Executable Chromium path.',
    })
    .option('puppeteerLaunchConfig', {
      string: true,
      default: '{ "args": ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"] }',
      description: 'JSON string of launch config for Puppeteer.',
    })
    .example('storycap http://localhost:9009', '')
    .example('storycap http://localhost:9009 -V 1024x768 -V 320x568', '')
    .example('storycap http://localhost:9009 -i "some-kind/a-story"', '')
    .example('storycap http://example.com/your-storybook -e "**/default" -V iPad', '')
    .example('storycap --serverCmd "start-storybook -p 3000" http://localhost:3000', '');
  let storybookUrl;

  if (!setting.argv._.length) {
    storybookUrl = 'http://localhost:9001';
  } else {
    storybookUrl = setting.argv._[0];
  }

  const {
    outDir,
    flat,
    include,
    exclude,
    delay,
    viewport,
    parallel,
    silent,
    verbose,
    forwardConsoleLogs,
    serverTimeout,
    serverCmd,
    shard,
    captureTimeout,
    captureMaxRetryCount,
    metricsWatchRetryCount,
    viewportDelay,
    reloadAfterChangeViewport,
    stateChangeDelay,
    disableCssAnimation,
    disableWaitAssets,
    trace,
    listDevices,
    chromiumChannel,
    chromiumPath,
    puppeteerLaunchConfig: puppeteerLaunchConfigString,
  } = setting.argv;

  const logger = new Logger(verbose ? 'verbose' : silent ? 'silent' : 'normal');

  if (listDevices) {
    showDevices(logger);
    process.exit(0);
  }

  let puppeteerLaunchConfig: string;
  try {
    puppeteerLaunchConfig = {
      headless: process.env['STORYCAP_SHOW'] !== 'enabled',
      ...JSON.parse(puppeteerLaunchConfigString),
    };
  } catch (error) {
    logger.error(error);
    throw error;
  }

  let shardOptions: ShardOptions;
  try {
    shardOptions = parseShardOptions(shard);
  } catch (error) {
    logger.error(error);
    throw error;
  }

  const opt = {
    serverOptions: {
      storybookUrl,
      serverCmd,
      serverTimeout,
    },
    outDir,
    flat,
    include,
    exclude,
    delay,
    viewports: viewport,
    parallel,
    shard: shardOptions,
    captureTimeout,
    captureMaxRetryCount,
    metricsWatchRetryCount,
    viewportDelay,
    reloadAfterChangeViewport,
    stateChangeDelay,
    disableCssAnimation,
    disableWaitAssets,
    trace,
    forwardConsoleLogs,
    chromiumChannel: chromiumChannel as ChromeChannel,
    chromiumPath,
    launchOptions: puppeteerLaunchConfig,
    logger,
  } as MainOptions;
  return opt;
}

const opt = createOptions();
const { logger, ...rest } = opt;

logger.debug('Option:', rest);

time(main(opt))
  .then(([numberOfCaptured, duration]) => {
    logger.log(
      `Screenshot was ended successfully in ${logger.color.green(duration + ' msec')} capturing ${logger.color.green(
        numberOfCaptured + '',
      )} PNGs.`,
    );
    process.exit(0);
  })
  .catch(error => {
    if (error instanceof Error) {
      logger.error(error.message);
      logger.errorStack(error.stack);
    } else {
      logger.error(error);
    }
    process.exit(1);
  });
