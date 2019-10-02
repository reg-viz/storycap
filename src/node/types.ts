import { Logger } from './logger';
import { StorybookServerOptions } from './story-crawler';

export type RunMode = 'simple' | 'managed';

export interface MainOptions {
  serverOptions: StorybookServerOptions;
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
  launchOptions: any;
  logger: Logger;
}
