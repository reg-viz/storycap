'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseChain = exports.arrayChunk = exports.createArray = exports.pascalize = exports.story2filename = exports.viewport2string = exports.filenamify = exports.parseRegExp = exports.parseList = exports.parseInteger = exports.identity = exports.sleep = undefined;

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sleep = exports.sleep = function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var identity = exports.identity = function identity(v) {
  return v;
};

var parseInteger = exports.parseInteger = function parseInteger(v) {
  return parseInt(v, 10);
};

var parseList = exports.parseList = function parseList(v) {
  return v ? v.split(',').map(function (o) {
    return o.trim();
  }) : null;
};

var parseRegExp = exports.parseRegExp = function parseRegExp(v) {
  return v ? new RegExp(v) : null;
};

var filenamify = exports.filenamify = function filenamify(filename) {
  return (0, _sanitizeFilename2.default)(filename).replace(/\s/g, '-');
};

var viewport2string = exports.viewport2string = function viewport2string(viewport) {
  return [viewport.width + 'x' + viewport.height, '' + (viewport.isMobile ? '-mobile' : ''), '' + (viewport.hasTouch ? '-touch' : ''), '' + (viewport.isLandscape ? '-landscape' : ''), '' + (viewport.deviceScaleFactor > 1 ? '@' + viewport.deviceScaleFactor + 'x' : '')].join('');
};

var story2filename = exports.story2filename = function story2filename(kind, story) {
  var viewport = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var namespace = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  return filenamify(kind + '-' + story + (namespace ? '_' + namespace : '') + (viewport ? '-' + viewport2string(viewport) : '')) + '.png';
};

var pascalize = exports.pascalize = function pascalize(v) {
  return ('' + v.charAt(0).toUpperCase() + v.slice(1)).replace(/[-_](.)/g, function (m, g) {
    return g.toUpperCase();
  });
};

var createArray = exports.createArray = function createArray(length) {
  return new Array(length).fill(null);
};

var arrayChunk = exports.arrayChunk = function arrayChunk(arr, n) {
  return arr.slice(0, (arr.length + n - 1) / n | 0) // eslint-disable-line no-bitwise
  .map(function (c, i) {
    return arr.slice(n * i, n * i + n);
  });
};

var promiseChain = exports.promiseChain = function promiseChain(arr, cb) {
  var results = [];
  return arr.reduce(function (acc, cur) {
    return acc.then(function (result) {
      results.push(result);
      return cb(cur);
    });
  }, Promise.resolve() // eslint-disable-line
  ).then(function (lastResult) {
    return [].concat(results, [lastResult]).slice(1);
  });
};
//# sourceMappingURL=utils.js.map