import { API, StoryKind } from "@storybook/addons";
import { ScreenShotOptions } from "../client/types";
import { Logger } from "./logger";

export type ExposedWindow = typeof window & {
  __STORYBOOK_CLIENT_API__: API;
  stories?: StoryKind[];
  emitCatpture(opt: ScreenShotOptions): void;
  waitFor?: () => Promise<any>;
  requestIdleCallback(cb: Function, opt?: { timeout: number }): void;
  getCurrentStoryKey: (url: string) => Promise<string | undefined>;
  optionStore?: { [storyKey: string]: (Partial<ScreenShotOptions>)[] };
};

export type RunMode = "simple" | "managed";

export interface MainOptions {
  showBrowser: boolean;
  storybookUrl: string;
  serverCmd: string;
  serverTimeout: number;
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
