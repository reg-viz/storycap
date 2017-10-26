#!/usr/bin/env node
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _path = require('path');

var path = _interopRequireWildcard(_path);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _events = require('events');

var _child_process = require('child_process');

require('babel-polyfill');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _nodeEmoji = require('node-emoji');

var _nodeEmoji2 = _interopRequireDefault(_nodeEmoji);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

var _puppeteer = require('puppeteer');

var _puppeteer2 = _interopRequireDefault(_puppeteer);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _store = require('./internal/store');

var _store2 = _interopRequireDefault(_store);

var _server = require('./internal/server');

var _server2 = _interopRequireDefault(_server);

var _constants = require('./constants');

var _utils = require('./internal/utils');

var _logger = require('./internal/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_commander2.default.version(_package2.default.version).usage('[options]').option('-p, --port [number]', 'Storybook server port (Default 9001)', _utils.parseInteger, 9001).option('-h, --host [string]', 'Storybook server host (Default "localhost")', _utils.identity, 'localhost').option('-s, --static-dir <dir-names>', 'Directory where to load static files from', _utils.parseList).option('-c, --config-dir [dir-name]', 'Directory where to load Storybook configurations from (Default ".storybook")', _utils.identity, '.storybook').option('-o, --output-dir [dir-name]', 'Directory where screenshot images are saved (Default "__screenshots__")', _utils.identity, '__screenshots__').option('--parallel [number]', 'Number of Page Instances of Puppeteer to be activated when shooting screenshots (Default 4)', _utils.parseInteger, 4).option('--filter-kind [regexp]', 'Filter of kind with RegExp. (Example "Button$")', _utils.parseRegExp).option('--filter-story [regexp]', 'Filter of story with RegExp. (Example "^with\\s.+$")', _utils.parseRegExp).option('--inject-files <file-names>', 'Path to the JavaScript file to be injected into frame. (Default "")', _utils.parseList, []).option('--browser-timeout [number]', 'Timeout milliseconds when Puppeteer opens Storybook. (Default 30000)', _utils.parseInteger, 30000).option('--silent', 'Suppress standard output', _utils.identity, false).option('--debug', 'Enable debug mode.', _utils.identity, false).parse(process.argv);

var logger = new _logger2.default(_commander2.default.silent, _commander2.default.debug);

var exit = function exit(message) {
  var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

  logger.error(message);
  process.exit(code);
};

var bin = (0, _child_process.execSync)('echo $(npm bin)', { encoding: 'utf-8' }).trim();

var options = {
  port: _commander2.default.port,
  host: _commander2.default.host,
  staticDir: _commander2.default.staticDir,
  configDir: _commander2.default.configDir,
  outputDir: _commander2.default.outputDir,
  filterKind: _commander2.default.filterKind,
  filterStory: _commander2.default.filterStory,
  browserTimeout: _commander2.default.browserTimeout,
  parallel: _commander2.default.parallel,
  injectFiles: _commander2.default.injectFiles,
  debug: _commander2.default.debug,
  cwd: path.resolve(bin, '..', '..'),
  cmd: path.resolve(bin, 'start-storybook')
};

var config = path.resolve(options.cwd, options.configDir, 'config.js');

if (!fs.existsSync(options.cmd)) {
  exit('Storybook does not exists. First, let\'s setup a Storybook!\n    See: https://storybook.js.org/basics/quick-start-guide/');
}

if (!fs.existsSync(config)) {
  exit('"' + options.configDir + '/config.js" does not exists.');
}

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
  var store, server, browser, progressbar, close, _ref2, _ref3, pages, firstPage, takeScreenshotOfStories, _doneAllComponentScreenshot;

  return regeneratorRuntime.wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          store = new _store2.default(options.filterKind, options.filterStory);
          server = void 0;
          browser = void 0;
          progressbar = void 0;

          close = function close() {
            if (server) server.kill();
            if (browser) browser.close();
          };

          _context7.prev = 5;

          logger.section('green', _constants.PhaseTypes.LAUNCH, 'Launching storybook server...', true);

          logger.log('NODE', 'Inject files, ', options.injectFiles);
          logger.log('NODE', 'Filter of kind and story, (kind = ' + options.filterKind + ', story = ' + options.filterStory + ')');

          _context7.next = 11;
          return Promise.all([(0, _server2.default)(options, logger), _puppeteer2.default.launch()]);

        case 11:
          _ref2 = _context7.sent;
          _ref3 = _slicedToArray(_ref2, 2);
          server = _ref3[0];
          browser = _ref3[1];
          _context7.next = 17;
          return Promise.all((0, _utils.createArray)(options.parallel).map(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
            var page, emitter, goto, takeScreenshot;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return browser.newPage();

                  case 2:
                    page = _context3.sent;
                    emitter = new _events.EventEmitter();


                    page.on('console', function () {
                      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                      }

                      logger.log.apply(logger, ['BROWSER'].concat(args));
                    });

                    _context3.next = 7;
                    return page.exposeFunction('readyComponentScreenshot', function (index) {
                      emitter.emit(_constants.EventTypes.COMPONENT_READY, index);
                    });

                  case 7:
                    _context3.next = 9;
                    return page.exposeFunction('getScreenshotStories', function () {
                      return store.getStories();
                    });

                  case 9:
                    _context3.next = 11;
                    return page.exposeFunction('failureScreenshot', function (error) {
                      logger.clear();
                      close();
                      exit(error);
                    });

                  case 11:
                    goto = function goto(phase) {
                      var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                      return page.goto(server.createURL(_extends({}, query, {
                        full: 1,
                        'chrome-screenshot': phase
                      }), {
                        timeout: options.browserTimeout
                      }));
                    };

                    takeScreenshot = function takeScreenshot(story) {
                      return new Promise(function () {
                        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve) {
                          return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                              switch (_context2.prev = _context2.next) {
                                case 0:
                                  _context2.next = 2;
                                  return page.setViewport(story.viewport);

                                case 2:
                                  _context2.next = 4;
                                  return goto(_constants.PhaseTypes.CAPTURE, {
                                    selectKind: story.kind,
                                    selectStory: story.story
                                  });

                                case 4:

                                  emitter.once(_constants.EventTypes.COMPONENT_READY, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                                    var file;
                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                      while (1) {
                                        switch (_context.prev = _context.next) {
                                          case 0:
                                            file = path.join(options.outputDir, story.filename);
                                            _context.next = 3;
                                            return Promise.all(options.injectFiles.map(function (filePath) {
                                              return page.injectFile(filePath);
                                            }));

                                          case 3:
                                            _context.next = 5;
                                            return page.screenshot({
                                              path: path.resolve(options.cwd, file)
                                            });

                                          case 5:

                                            resolve(file);

                                          case 6:
                                          case 'end':
                                            return _context.stop();
                                        }
                                      }
                                    }, _callee, undefined);
                                  })));

                                case 5:
                                case 'end':
                                  return _context2.stop();
                              }
                            }
                          }, _callee2, undefined);
                        }));

                        return function (_x3) {
                          return _ref5.apply(this, arguments);
                        };
                      }());
                    };

                    return _context3.abrupt('return', {
                      page: page,
                      goto: goto,
                      takeScreenshot: takeScreenshot,
                      exposeFunction: function exposeFunction(expose, fn) {
                        return page.exposeFunction(expose, fn);
                      }
                    });

                  case 14:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, undefined);
          }))));

        case 17:
          pages = _context7.sent;
          firstPage = pages[0];


          logger.section('cyan', _constants.PhaseTypes.PREPARE, 'Fetching the target components...', true);

          takeScreenshotOfStories = function () {
            var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
              var stories, parallel, chunkSize, chunkedStories;
              return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      stories = store.getStories();
                      parallel = Math.min(stories.length, options.parallel);
                      chunkSize = Math.max(1, Math.ceil(stories.length / parallel));
                      chunkedStories = (0, _utils.arrayChunk)(stories, chunkSize);
                      _context5.next = 6;
                      return Promise.all(chunkedStories.map(function () {
                        var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(arr, i) {
                          var page, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, story, file;

                          return regeneratorRuntime.wrap(function _callee4$(_context4) {
                            while (1) {
                              switch (_context4.prev = _context4.next) {
                                case 0:
                                  page = pages[i];

                                  /* eslint-disable no-restricted-syntax, no-await-in-loop */

                                  _iteratorNormalCompletion = true;
                                  _didIteratorError = false;
                                  _iteratorError = undefined;
                                  _context4.prev = 4;
                                  _iterator = arr[Symbol.iterator]();

                                case 6:
                                  if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context4.next = 16;
                                    break;
                                  }

                                  story = _step.value;
                                  _context4.next = 10;
                                  return page.takeScreenshot(story);

                                case 10:
                                  file = _context4.sent;


                                  logger.log('NODE', 'Saved to "' + file + '".\n    kind: "' + story.kind + '"\n    story: "' + story.story + '"\n    viewport: "' + JSON.stringify(story.viewport) + '"');

                                  if (progressbar) {
                                    progressbar.tick();
                                  }

                                case 13:
                                  _iteratorNormalCompletion = true;
                                  _context4.next = 6;
                                  break;

                                case 16:
                                  _context4.next = 22;
                                  break;

                                case 18:
                                  _context4.prev = 18;
                                  _context4.t0 = _context4['catch'](4);
                                  _didIteratorError = true;
                                  _iteratorError = _context4.t0;

                                case 22:
                                  _context4.prev = 22;
                                  _context4.prev = 23;

                                  if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                  }

                                case 25:
                                  _context4.prev = 25;

                                  if (!_didIteratorError) {
                                    _context4.next = 28;
                                    break;
                                  }

                                  throw _iteratorError;

                                case 28:
                                  return _context4.finish(25);

                                case 29:
                                  return _context4.finish(22);

                                case 30:
                                case 'end':
                                  return _context4.stop();
                              }
                            }
                          }, _callee4, undefined, [[4, 18, 22, 30], [23,, 25, 29]]);
                        }));

                        return function (_x4, _x5) {
                          return _ref8.apply(this, arguments);
                        };
                      }()
                      /* eslint-enable */
                      ));

                    case 6:

                      _doneAllComponentScreenshot(); // eslint-disable-line no-use-before-define

                    case 7:
                    case 'end':
                      return _context5.stop();
                  }
                }
              }, _callee5, undefined);
            }));

            return function takeScreenshotOfStories() {
              return _ref7.apply(this, arguments);
            };
          }();

          _doneAllComponentScreenshot = function () {
            var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
              var stories, skippedStories;
              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      if (progressbar) {
                        progressbar.terminate();
                      }

                      logger.section('cyan', _constants.PhaseTypes.DONE, 'Screenshot image saving is completed!');
                      logger.blank();

                      stories = store.getStories();
                      skippedStories = store.getSkippedStories();


                      stories.forEach(function (_ref10) {
                        var filename = _ref10.filename;

                        logger.echo('  ' + _logSymbols2.default.success + '  ' + filename);
                      });

                      skippedStories.forEach(function (_ref11) {
                        var filename = _ref11.filename;

                        logger.echo('  ' + _logSymbols2.default.warning + '  ' + filename + ' ' + _chalk2.default.yellow('(skipped)'));
                      });

                      logger.blank(2);

                      close();
                      process.exit(0);

                    case 10:
                    case 'end':
                      return _context6.stop();
                  }
                }
              }, _callee6, undefined);
            }));

            return function _doneAllComponentScreenshot() {
              return _ref9.apply(this, arguments);
            };
          }();

          _context7.next = 24;
          return firstPage.exposeFunction('setScreenshotStories', function (results) {
            store.setStories(results);
            (0, _mkdirp2.default)(options.outputDir);

            var stories = store.getStories();
            var skippedStories = store.getSkippedStories();

            logger.section('yellow', _constants.PhaseTypes.CAPTURE, 'Capturing component screenshots...');
            logger.blank();
            logger.log('NODE', 'Fetched stories ' + JSON.stringify(stories, null, '  '));
            logger.log('NODE', 'Skipped stories ' + JSON.stringify(skippedStories, null, '  '));

            if (!logger.silent && !logger.debug) {
              progressbar = new _progress2.default(_nodeEmoji2.default.emojify(':camera:  [:bar] :current/:total'), {
                complete: '=',
                incomplete: ' ',
                width: 40,
                total: stories.length
              });
            }

            takeScreenshotOfStories();
          });

        case 24:
          _context7.next = 26;
          return firstPage.goto(_constants.PhaseTypes.PREPARE);

        case 26:
          _context7.next = 32;
          break;

        case 28:
          _context7.prev = 28;
          _context7.t0 = _context7['catch'](5);

          close();
          exit(_context7.t0);

        case 32:
        case 'end':
          return _context7.stop();
      }
    }
  }, _callee7, undefined, [[5, 28]]);
}))();
//# sourceMappingURL=cli.js.map