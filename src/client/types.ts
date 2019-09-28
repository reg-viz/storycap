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
  hover?: string;
  focus?: string;
  skip?: boolean;
}

export interface ScreenshotOptionFragmentsForVariant extends ScreenshotOptionFragments {
  followWith?: string[];
}

export interface ScreenshotOptions extends ScreenshotOptionFragments {
  variants?: {
    [key: string]: ScreenshotOptionFragmentsForVariant;
  };
}

export interface StrictScreenshotOptions extends $Strict<ScreenshotOptionFragments> {
  variants: {
    [key: string]: $Strict<ScreenshotOptionFragmentsForVariant>;
  };
}

export type ScreenshotOptionsForApp = StrictScreenshotOptions & {
  url: string;
};
