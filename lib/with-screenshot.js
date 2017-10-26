'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addons = require('@storybook/addons');

var _addons2 = _interopRequireDefault(_addons);

var _utilInspect = require('util-inspect');

var _utilInspect2 = _interopRequireDefault(_utilInspect);

var _constants = require('./constants');

var _screenshotOptions = require('./screenshot-options');

var _ScreenshotWrapper = require('./components/ScreenshotWrapper');

var _ScreenshotWrapper2 = _interopRequireDefault(_ScreenshotWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var withScreenshot = function withScreenshot() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (storyFn, ctx) {
    var useDecorator = !!ctx;
    var channel = _addons2.default.getChannel();

    var wrapperWithContext = function wrapperWithContext(context) {
      var props = _extends({}, (0, _screenshotOptions.mergeScreenshotOptions)(options), {
        channel: channel,
        context: context
      });

      return _react2.default.createElement(
        _ScreenshotWrapper2.default,
        props,
        storyFn(context)
      );
    };

    if (typeof storyFn !== 'function') {
      var err = 'The story may not be correct, (storyFn = "' + (0, _utilInspect2.default)(storyFn) + '")';
      channel.emit(_constants.EventTypes.COMPONENT_ERROR, err); // For Puppeteer
      throw new Error(err); // For browser
    }

    if (useDecorator) {
      return wrapperWithContext(ctx);
    }

    return function (context) {
      return wrapperWithContext(context);
    };
  };
};

exports.default = withScreenshot;
//# sourceMappingURL=with-screenshot.js.map