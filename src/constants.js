export const PhaseTypes = {
  LAUNCH: 'LAUNCH',
  PREPARE: 'PREPARE',
  CAPTURE: 'CAPTURE',
  DONE: 'DONE',
};

const addonPrefix = 'chrome-screenshot';

export const EventTypes = {
  COMPONENT_INIT: `${addonPrefix}/component-init`,
  COMPONENT_READY: `${addonPrefix}/component-ready`,
  COMPONENT_COUNT: `${addonPrefix}/component-count`,
  COMPONENT_ERROR: `${addonPrefix}/component-error`,
  READY: `${addonPrefix}/ready`,
};

export const SEARCH_COMPONENT_TIMEOUT = 36000;

export const defaultScreenshotOptions = {
  delay: 0,
  viewport: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
};
