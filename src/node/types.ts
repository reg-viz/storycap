import { ScreenshotOptions } from "../client/types";
import { Logger } from "./logger";
import { StorybookServerOptions } from "./story-crawler";

export type ExposedWindow = typeof window & {
  emitCatpture(opt: ScreenshotOptions): void;
  waitFor?: () => Promise<any>;
  requestIdleCallback(cb: Function, opt?: { timeout: number }): void;
  getCurrentStoryKey: (url: string) => Promise<string | undefined>;
  optionStore?: { [storyKey: string]: (Partial<ScreenshotOptions>)[] };
};

export type RunMode = "simple" | "managed";

export interface MainOptions {
  showBrowser: boolean;
  serverOptions: StorybookServerOptions;
  captureTimeout: number;
  captureMaxRetryCount: number;
  defaultViewport: string;
  viewportDelay: number;
  reloadAfterChangeViewport: boolean;
  outDir: string;
  flat: boolean;
  include: string[];
  exclude: string[];
  disableCssAnimation: boolean;
  parallel: number;
  metricsWatchRetryCount: number;
  logger: Logger;
}
