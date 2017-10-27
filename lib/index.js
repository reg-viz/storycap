'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _screenshotOptions = require('./screenshot-options');

Object.defineProperty(exports, 'getScreenshotOptions', {
  enumerable: true,
  get: function get() {
    return _screenshotOptions.getScreenshotOptions;
  }
});
Object.defineProperty(exports, 'setScreenshotOptions', {
  enumerable: true,
  get: function get() {
    return _screenshotOptions.setScreenshotOptions;
  }
});

var _withScreenshot = require('./with-screenshot');

Object.defineProperty(exports, 'withScreenshot', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_withScreenshot).default;
  }
});

var _initScreenshot = require('./init-screenshot');

Object.defineProperty(exports, 'initScreenshot', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_initScreenshot).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=index.js.map