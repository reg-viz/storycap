'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Store = function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  function Store(filterKind, filterStory) {
    _classCallCheck(this, Store);

    var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

    _this.filterKind = filterKind;
    _this.filterStory = filterStory;
    _this.setStories([]);
    return _this;
  }

  _createClass(Store, [{
    key: 'setStories',
    value: function setStories(stories) {
      var _this2 = this;

      this.current = 0;
      this.stories = [];

      stories.forEach(function (story) {
        var skipped = _this2.filterKind && !_this2.filterKind.test(story.kind) || _this2.filterStory && !_this2.filterStory.test(story.story);

        var isMultipleViewport = Array.isArray(story.viewport);
        var viewport = isMultipleViewport ? story.viewport : [story.viewport];

        viewport.forEach(function (vp) {
          _this2.stories.push(_extends({}, story, {
            viewport: vp,
            skipped: skipped,
            filename: (0, _utils.story2filename)(story.kind, story.story, isMultipleViewport ? vp : null, story.namespace)
          }));
        });
      });
    }
  }, {
    key: 'getStories',
    value: function getStories() {
      return this.stories.filter(function (story) {
        return !story.skipped;
      });
    }
  }, {
    key: 'getSkippedStories',
    value: function getSkippedStories() {
      return this.stories.filter(function (story) {
        return story.skipped;
      });
    }
  }]);

  return Store;
}(_events.EventEmitter);

exports.default = Store;
//# sourceMappingURL=store.js.map