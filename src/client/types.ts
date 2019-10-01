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
  extends?: string | string[];
}

export interface ScreenshotOptions extends ScreenshotOptionFragments {
  viewports?: string[] | { [key: string]: string | Viewport };
  variants?: {
    [key: string]: ScreenshotOptionFragmentsForVariant;
  };
  defaultVariantSuffix?: string;
}

export interface StrictScreenshotOptions extends $Strict<ScreenshotOptionFragments> {
  variants: {
    [key: string]: $Strict<ScreenshotOptionFragmentsForVariant>;
  };
  defaultVariantSuffix: string;
}

export type ScreenshotOptionsForApp = StrictScreenshotOptions & {
  url: string;
};
