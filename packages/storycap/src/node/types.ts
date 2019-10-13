import { Logger } from './logger';
import { LaunchOptions } from 'puppeteer';
import { StorybookConnectionOptions, BaseBrowserOptions } from 'storycrawler';

/**
 *
 * Represents Storycap mode.
 *
 **/
export type RunMode = 'simple' | 'managed';

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
  reloadAfterChangeViewport: boolean;
  outDir: string;
  flat: boolean;
  include: string[];
  exclude: string[];
  disableCssAnimation: boolean;
  parallel: number;
  metricsWatchRetryCount: number;
  launchOptions: LaunchOptions;
  logger: Logger;
}
