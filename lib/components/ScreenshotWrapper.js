'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _imagesloaded = require('imagesloaded');

var _imagesloaded2 = _interopRequireDefault(_imagesloaded);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable react/prop-types */
/* eslint-disable react/no-find-dom-node */


var ScreenshotWrapper = function (_Component) {
  _inherits(ScreenshotWrapper, _Component);

  function ScreenshotWrapper(props) {
    var _ref;

    _classCallCheck(this, ScreenshotWrapper);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = ScreenshotWrapper.__proto__ || Object.getPrototypeOf(ScreenshotWrapper)).call.apply(_ref, [this, props].concat(args)));

    _this.handleRef = function (component) {
      _this.component = component;
    };

    _this.emit(_constants.EventTypes.COMPONENT_INIT);
    return _this;
  }

  _createClass(ScreenshotWrapper, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var delay = this.props.delay;

      var node = (0, _reactDom.findDOMNode)(this.component);
      this.emit(_constants.EventTypes.COMPONENT_MOUNT);

      (0, _imagesloaded2.default)(node, function () {
        setTimeout(function () {
          _this2.emit(_constants.EventTypes.COMPONENT_READY);
        }, delay);
      });
    }
  }, {
    key: 'emit',
    value: function emit(type) {
      this.props.channel.emit(type, _extends({}, this.props.context, {
        viewport: this.props.viewport,
        namespace: this.props.namespace
      }));
    }
  }, {
    key: 'render',
    value: function render() {
      var children = this.props.children;


      return _react2.default.createElement(
        'span',
        { ref: this.handleRef },
        children
      );
    }
  }]);

  return ScreenshotWrapper;
}(_react.Component);

exports.default = ScreenshotWrapper;
//# sourceMappingURL=ScreenshotWrapper.js.map