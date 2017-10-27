'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _constants = require('../constants');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable react/prop-types */
/* eslint-disable react/no-find-dom-node */


var InitScreenshotWrapper = function (_Component) {
  _inherits(InitScreenshotWrapper, _Component);

  function InitScreenshotWrapper() {
    _classCallCheck(this, InitScreenshotWrapper);

    return _possibleConstructorReturn(this, (InitScreenshotWrapper.__proto__ || Object.getPrototypeOf(InitScreenshotWrapper)).apply(this, arguments));
  }

  _createClass(InitScreenshotWrapper, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.emit(_constants.EventTypes.COMPONENT_FINISH_MOUNT);
    }
  }, {
    key: 'emit',
    value: function emit(type) {
      this.props.channel.emit(type, _extends({}, this.props.context));
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);

  return InitScreenshotWrapper;
}(_react.Component);

exports.default = InitScreenshotWrapper;
//# sourceMappingURL=InitScreenshotWrapper.js.map