'use strict';

require('babel-polyfill');

var _react = require('@storybook/react');

var _lodash = require('lodash');

var _fp = require('lodash/fp');

var _addons = require('@storybook/addons');

var _addons2 = _interopRequireDefault(_addons);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

var _constants = require('./constants');

var _utils = require('./internal/utils');

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // eslint-disable-line


var query = _queryString2.default.parse(window.location.search);
var phase = query['chrome-screenshot'];
var selectKind = query.selectKind;
var selectStory = query.selectStory;

var searchScreenshotWrappersByStory = function searchScreenshotWrappersByStory(kind, story, api, channel) {
  var inited = [];
  var mounted = [];

  // One story can have several usage of withScreenshot.
  // Using the events from teh ScreenshotWrapper we try to know about the wrappers
  // events are firing in this sequence. init, mount
  // If story doesn't have any withScreenshot wrappers, we handle it with delay.
  // Unfortunately, we can directly check if the story has the wrapper,
  // so we hope that init event will be fired in SEARCH_COMPONENT_TIMEOUT miliseconds.
  // Overwise, we think, that story doesn't have the wrappers

  // Why we use 2 kind of events: init and mount?
  // we use 2 events, init and mount, because in this way
  // we can recognize when all wrappers are mounted.
  // Init events always fire before a mount events.
  // so when we handle first mount event we know the total count of the wrappers.

  return new Promise(function (resolve) {
    function onInit(context) {
      if (context.kind !== kind || context.story !== story) return;
      inited.push(context);
    }
    function onMount(context) {
      if (context.kind !== kind || context.story !== story) return;
      mounted.push(context);
      if (mounted.length === inited.length) {
        onResolve(mounted); // eslint-disable-line
      }
    }
    function onResolve(contexts) {
      resolve(contexts);
      channel.removeListener(_constants.EventTypes.COMPONENT_INIT, onInit);
      channel.removeListener(_constants.EventTypes.COMPONENT_MOUNT, onMount);
    }
    channel.on(_constants.EventTypes.COMPONENT_INIT, onInit);
    channel.on(_constants.EventTypes.COMPONENT_MOUNT, onMount);

    api.selectStory(kind, story);
    setTimeout(function () {
      if (inited.length === 0) onResolve([]);
    }, _constants.SEARCH_COMPONENT_TIMEOUT);
  });
};

var searchTargetStories = function searchTargetStories(channel, api) {
  return new Promise(function (resolve, reject) {
    channel.once('setStories', function (_ref) {
      var stories = _ref.stories;

      var storiesPlainList = (0, _fp.compose)((0, _fp.flattenDepth)(2), (0, _fp.map)(function (group) {
        return group.stories.map(function (story) {
          return { kind: group.kind, story: story };
        });
      }) // eslint-disable-line
      )(stories);

      (0, _utils.promiseChain)(storiesPlainList, function (cur) {
        return searchScreenshotWrappersByStory(cur.kind, cur.story, api, channel);
      } // eslint-disable-line
      ).then(function (results) {
        var contexts = (0, _lodash.flattenDeep)(results);
        resolve(contexts);
      }, reject);

      channel.on(_constants.EventTypes.COMPONENT_ERROR, reject);
    });
  });
};

_addons2.default.register(_package2.default.name, function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(api) {
    var channel;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (phase) {
              _context.next = 2;
              break;
            }

            return _context.abrupt('return');

          case 2:
            _context.prev = 2;
            channel = _addons2.default.getChannel();
            _context.t0 = phase;
            _context.next = _context.t0 === _constants.PhaseTypes.PREPARE ? 7 : _context.t0 === _constants.PhaseTypes.CAPTURE ? 14 : 17;
            break;

          case 7:
            _context.t1 = window;
            _context.next = 10;
            return searchTargetStories(channel, api);

          case 10:
            _context.t2 = _context.sent;
            _context.next = 13;
            return _context.t1.setScreenshotStories.call(_context.t1, _context.t2);

          case 13:
            return _context.abrupt('return');

          case 14:
            channel.on(_constants.EventTypes.COMPONENT_READY, function (_ref3) {
              var kind = _ref3.kind,
                  story = _ref3.story;

              if (selectKind === kind && selectStory === story) {
                window.readyComponentScreenshot();
              }
            });
            api.selectStory(selectKind, selectStory);
            return _context.abrupt('break', 18);

          case 17:
            throw new Error('An unknown phase called "' + phase + '" is being executed.');

          case 18:
            _context.next = 23;
            break;

          case 20:
            _context.prev = 20;
            _context.t3 = _context['catch'](2);

            window.failureScreenshot(_context.t3);

          case 23:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[2, 20]]);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}());
//# sourceMappingURL=register.js.map