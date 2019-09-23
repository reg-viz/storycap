type $Strict<T> = {
  [P in keyof T]-?: T[P];
};

export type Viewport = {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  isLandscape?: boolean;
};

export interface ScreenshotOptionFragments {
  delay?: number;
  waitImages?: boolean;
  waitFor?: string | (() => Promise<any>);
  viewport?: Viewport | string;
  fullPage?: boolean;
  skip?: boolean;
}

export interface ScreenshotOptions extends ScreenshotOptionFragments {}

export interface StrictScreenshotOptions extends $Strict<ScreenshotOptionFragments> {}

export type ScreenshotOptionsForApp = StrictScreenshotOptions & {
  url: string;
};
