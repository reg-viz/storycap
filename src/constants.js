export const PhaseTypes = {
  LAUNCH: 'LAUNCH',
  PREPARE: 'PREPARE',
  CAPTURE: 'CAPTURE',
  DONE: 'DONE',
};

const addonPrefix = 'chrome-screenshot';

export const EventTypes = {
  COMPONENT_INIT: `${addonPrefix}/component-init`,
  COMPONENT_MOUNT: `${addonPrefix}/component-mount`,
  COMPONENT_READY: `${addonPrefix}/component-ready`,
  COMPONENT_ERROR: `${addonPrefix}/component-error`,
  COMPONENT_FINISH_MOUNT: `${addonPrefix}/component-finish-mount`,
  READY: `${addonPrefix}/ready`,
};

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
