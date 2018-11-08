import { ScreenshotOptions } from '../models/options';

export const PhaseIdentity = 'chrome-screenshot';

export const PhaseTypes = {
  LAUNCH: 'LAUNCH',
  PREPARE: 'PREPARE',
  CAPTURE: 'CAPTURE',
  DONE: 'DONE'
};

const prefix = PhaseIdentity;

export const EventTypes = {
  COMPONENT_INIT: `${prefix}/component-init`,
  COMPONENT_MOUNT: `${prefix}/component-mount`,
  COMPONENT_READY: `${prefix}/component-ready`,
  COMPONENT_ERROR: `${prefix}/component-error`,
  COMPONENT_FINISH_MOUNT: `${prefix}/component-finish-mount`,
  READY: `${prefix}/ready`
};

export const defaultScreenshotOptions: ScreenshotOptions = {
  delay: 0,
  viewport: {
    width: 1024,
    height: 1,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false
  },
  knobs: {},
  filePattern: null,
  waitFor: ''
};
