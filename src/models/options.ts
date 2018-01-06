import { Viewport } from './viewport';

export type AppType = 'react';

export interface CLIOptions {
  port: number;
  host: string;
  staticDir: string;
  outputDir: string;
  configDir: string;
  filterKind: RegExp | undefined;
  filterStory: RegExp | undefined;
  browserTimeout: number;
  parallel: number;
  injectFiles: string[];
  silent: boolean;
  debug: boolean;
  cwd: string;
  cmd: string;
}

export interface ScreenshotOptions {
  namespace?: string;
  delay: number;
  viewport: Viewport | Viewport[];
}

export interface PartialScreenshotOptions {
  namespace?: string;
  delay?: number;
  viewport?: Partial<Viewport> | Partial<Viewport>[];
}
