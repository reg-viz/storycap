import { Logger } from './logger.js';
import type { LaunchOptions } from 'puppeteer-core';
import { StorybookConnectionOptions, BaseBrowserOptions, ChromeChannel } from 'storycrawler';

/**
 *
 * Represents Storycap mode.
 *
 **/
export type RunMode = 'simple' | 'managed';

/**
 *
 * Parameters for sharding.
 *
 **/
export type ShardOptions = {
  shardNumber: number;
  totalShards: number;
};

/**
 *
 * Parameters for main procedure.
 * Almost all of fields are dericed CLI options.
 *
 **/
export interface MainOptions extends BaseBrowserOptions {
  serverOptions: StorybookConnectionOptions;
  captureTimeout: number;
  captureMaxRetryCount: number;
  delay: number;
  viewports: string[];
  viewportDelay: number;
  stateChangeDelay: number;
  reloadAfterChangeViewport: boolean;
  outDir: string;
  flat: boolean;
  include: string[];
  exclude: string[];
  disableCssAnimation: boolean;
  disableWaitAssets: boolean;
  trace: boolean;
  forwardConsoleLogs: boolean;
  parallel: number;
  shard: ShardOptions;
  metricsWatchRetryCount: number;
  chromiumChannel: ChromeChannel;
  chromiumPath: string;
  launchOptions: LaunchOptions;
  logger: Logger;
}
