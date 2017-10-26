'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setScreenshotOptions = exports.mergeScreenshotOptions = exports.getScreenshotOptions = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _assignDeep = require('assign-deep');

var _assignDeep2 = _interopRequireDefault(_assignDeep);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var opts = _constants.defaultScreenshotOptions;

var getScreenshotOptions = exports.getScreenshotOptions = function getScreenshotOptions() {
  return opts;
};

var mergeScreenshotOptions = exports.mergeScreenshotOptions = function mergeScreenshotOptions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var viewport = {};

  if (Array.isArray(options.viewport)) {
    var baseViewport = !Array.isArray(opts.viewport) ? opts.viewport : _constants.defaultScreenshotOptions.viewport;

    viewport = options.viewport.map(function (vp) {
      return _extends({}, baseViewport, vp);
    });
  } else {
    viewport = _extends({}, options.viewport || {});
  }

  return (0, _assignDeep2.default)({}, opts, _extends({}, options, {
    viewport: viewport
  }));
};

var setScreenshotOptions = exports.setScreenshotOptions = function setScreenshotOptions() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  opts = mergeScreenshotOptions(options);
};
//# sourceMappingURL=screenshot-options.js.map