"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _cell = _interopRequireDefault(require("../cell"));

var _cellGroup = _interopRequireDefault(require("../cell-group"));

var _use = (0, _utils.use)('panel'),
    sfc = _use[0],
    bem = _use[1];

var _default = sfc({
  props: {
    icon: String,
    desc: String,
    title: String,
    status: String
  },
  render: function render(h) {
    var slots = this.$slots;
    return h(_cellGroup.default, {
      "class": bem()
    }, [slots.header || h(_cell.default, {
      "class": bem('header'),
      "attrs": {
        "icon": this.icon,
        "label": this.desc,
        "title": this.title,
        "value": this.status
      }
    }), h("div", {
      "class": bem('content')
    }, [slots.default]), slots.footer && h("div", {
      "class": [bem('footer'), 'van-hairline--top']
    }, [slots.footer])]);
  }
});

exports.default = _default;