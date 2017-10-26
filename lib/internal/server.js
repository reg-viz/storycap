'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _child_process = require('child_process');

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StorybookServer = function () {
  function StorybookServer(server, url) {
    _classCallCheck(this, StorybookServer);

    this.server = server;
    this.url = url;
  }

  _createClass(StorybookServer, [{
    key: 'getURL',
    value: function getURL() {
      return this.url;
    }
  }, {
    key: 'createURL',
    value: function createURL(query) {
      return '' + this.getURL() + (query ? '?' + _queryString2.default.stringify(query) : '');
    }
  }, {
    key: 'kill',
    value: function kill() {
      this.server.kill();
    }
  }]);

  return StorybookServer;
}();

var optionsToCommandArgs = function optionsToCommandArgs(options) {
  var args = ['-p', options.port, '-c', options.configDir];

  if (options.host) {
    args.push('-h', options.host);
  }

  if (options.staticDir) {
    args.push('-s', options.staticDir);
  }

  return args;
};

var startStorybookServer = function startStorybookServer(options, logger) {
  return new Promise(function (resolve, reject) {
    var cmd = options.cmd,
        cwd = options.cwd;

    var args = optionsToCommandArgs(options);
    var storybook = (0, _child_process.spawn)(cmd, args, { cwd: cwd });

    storybook.stdout.on('data', function (out) {
      var str = out.toString().trim();
      var m = str.match(/^Storybook started on => (https?:\/\/.+)$/);

      if (m) {
        var s = new StorybookServer(storybook, m[1]);
        resolve(s);
      }
    });

    storybook.stderr.on('data', function (out) {
      logger.log('STDERR', out.toString());
    });

    storybook.on('error', function (err) {
      reject(err.toString());
    });
  });
};

exports.default = startStorybookServer;
//# sourceMappingURL=server.js.map