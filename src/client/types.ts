export type ScreenShotOptions = {
  delay: number;
  waitImages: boolean;
  waitFor: string | (() => Promise<any>);
  viewport:
    | {
        width: number;
        height: number;
        deviceScaleFactor?: number;
        isMobile?: boolean;
        hasTouch?: boolean;
        isLandscape?: boolean;
      }
    | string;
  fullPage: boolean;
  skip: boolean;
};

export type ScreenShotOptionsForApp = ScreenShotOptions & {
  url: string;
};
