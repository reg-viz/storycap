import { VariantKey, ScreenshotOptions, StrictScreenshotOptions } from '../shared/types';
import { Logger } from './logger';
import { StorybookServerOptions } from './story-crawler';

export type ExposedWindow = typeof window & {
  emitCatpture(opt: ScreenshotOptions, clientStoryKey: string): void;
  waitFor?: () => Promise<any>;
  requestIdleCallback(cb: Function, opt?: { timeout: number }): void;
  waitBrowserMetricsStable: () => Promise<void>;
  getBaseScreenshotOptions: () => Promise<StrictScreenshotOptions>;
  getCurrentStoryKey: (url: string) => Promise<string | undefined>;
  getCurrentVariantKey: () => Promise<VariantKey>;
  optionStore?: { [storyKey: string]: (Partial<ScreenshotOptions>)[] };
};

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
