'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTitle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _clear2 = require('clear');

var _clear3 = _interopRequireDefault(_clear2);

var _cliSpinner = require('@tsuyoshiwada/cli-spinner');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = console.log; // eslint-disable-line no-console

var createTitle = exports.createTitle = function createTitle(color, title) {
  return _chalk2.default.black['bg' + (0, _utils.pascalize)(color)](' ' + title + ' ');
};

var Logger = function () {
  function Logger(silent, debug) {
    _classCallCheck(this, Logger);

    this.silent = silent;
    this.debug = debug;
  }

  _createClass(Logger, [{
    key: 'clear',
    value: function clear() {
      if (!this.debug && !this.silent) {
        (0, _clear3.default)();
      } else if (this.debug) {
        this.blank(2);
      }

      if (this.spinner) {
        this.spinner.stop(true);
      }
    }
  }, {
    key: 'echo',
    value: function echo() {
      if (!this.silent) {
        log.apply(undefined, arguments);
      }
    }
  }, {
    key: 'log',
    value: function log(title) {
      if (this.debug) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        this.echo.apply(this, ['' + createTitle('blue', 'DEBUG'), _chalk2.default.blue('[' + title + ']')].concat(args));
      }
    }
  }, {
    key: 'blank',
    value: function blank() {
      var repeat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

      for (var i = 0; i < repeat; i += 1) {
        this.echo();
      }
    }
  }, {
    key: 'section',
    value: function section(color, title, message) {
      var useSpinner = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      var output = createTitle(color, title) + ' ' + message;

      this.clear();

      if (useSpinner && !this.silent && !this.debug) {
        this.spinner = new _cliSpinner.Spinner({
          text: output + ' %s  ',
          color: 'cyan'
        });
        this.spinner.setSpinnerString(18);
        this.spinner.start();
      } else {
        this.echo(output);
      }
    }

    /* eslint-disable no-console, class-methods-use-this */

  }, {
    key: 'error',
    value: function error(message) {
      console.log();
      console.log(createTitle('red', 'ERROR') + ' ' + message);
      console.log();
    }
    /* eslint-enable */

  }]);

  return Logger;
}();

exports.default = Logger;
//# sourceMappingURL=logger.js.map