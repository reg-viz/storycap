import { Logger } from './logger';
import type { LaunchOptions } from 'puppeteer-core';
import { StorybookConnectionOptions, BaseBrowserOptions } from 'storycrawler';

/**
 *
 * Represents Storycap mode.
 *
 **/
export type RunMode = 'simple' | 'managed';

/**
 *
 * Channel to search local Chromium
 *
 **/
export type ChromeChannel = 'puppeteer' | 'canary' | 'stable' | '*';

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
  parallel: number;
  metricsWatchRetryCount: number;
  chromiumChannel: ChromeChannel;
  chromiumPath: string;
  launchOptions: LaunchOptions;
  logger: Logger;
}
