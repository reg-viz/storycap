import { Viewport } from './viewport';
import { Knobs } from './knobs';

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
  ciMode: boolean;
  cwd: string;
  cmd: string;
}

export interface ScreenshotOptions {
  namespace?: string;
  delay: number;
  viewport: Viewport | Viewport[];
  knobs: Knobs;
  filePattern: string | null;
  imageComparison: ((file1: string, file2: string) => boolean) | null;
  imageThreshold: number | 0;
}

export interface PartialScreenshotOptions {
  namespace?: string;
  delay?: number;
  viewport?: Partial<Viewport> | Partial<Viewport>[];
  knobs?: Knobs;
  filePattern?: string | null;
  imageComparison?: ((file1: string, file2: string) => boolean) | null;
  imageThreshold?: number | 0;
}
