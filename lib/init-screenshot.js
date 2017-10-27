'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addons = require('@storybook/addons');

var _addons2 = _interopRequireDefault(_addons);

var _InitScreenshotWrapper = require('./components/InitScreenshotWrapper');

var _InitScreenshotWrapper2 = _interopRequireDefault(_InitScreenshotWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initScreenshot = function initScreenshot() {
  return function (storyFn, ctx) {
    var channel = _addons2.default.getChannel();

    return _react2.default.createElement(
      _InitScreenshotWrapper2.default,
      { channel: channel, context: ctx },
      storyFn()
    );
  };
};

exports.default = initScreenshot;
//# sourceMappingURL=init-screenshot.js.map