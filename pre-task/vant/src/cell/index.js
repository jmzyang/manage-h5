"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _icon = _interopRequireDefault(require("../icon"));

var _cell = _interopRequireDefault(require("../mixins/cell"));

var _routerLink = _interopRequireDefault(require("../mixins/router-link"));

var _use = (0, _utils.use)('cell'),
    sfc = _use[0],
    bem = _use[1];

var _default = sfc({
  mixins: [_cell.default, _routerLink.default],
  props: {
    size: String,
    clickable: Boolean,
    arrowDirection: String
  },
  methods: {
    onClick: function onClick() {
      this.$emit('click');
      this.routerLink();
    }
  },
  render: function render(h) {
    var _bem;

    var slots = this.$slots;
    var showTitle = slots.title || (0, _utils.isDef)(this.title);
    var showValue = slots.default || (0, _utils.isDef)(this.value);
    var Title = showTitle && h("div", {
      "class": [bem('title'), this.titleClass]
    }, [slots.title || h("span", [this.title]), this.label && h("div", {
      "class": [bem('label'), this.labelClass]
    }, [this.label])]);
    var Value = showValue && h("div", {
      "class": [bem('value', {
        alone: !slots.title && !this.title
      }), this.valueClass]
    }, [slots.default || h("span", [this.value])]);
    var LeftIcon = slots.icon || this.icon && h(_icon.default, {
      "class": bem('left-icon'),
      "attrs": {
        "name": this.icon
      }
    });
    var arrowIcon = this.arrowDirection ? "arrow-" + this.arrowDirection : 'arrow';
    var RightIcon = slots['right-icon'] || this.isLink && h(_icon.default, {
      "class": bem('right-icon'),
      "attrs": {
        "name": arrowIcon
      }
    });
    return h("div", {
      "class": bem((_bem = {
        center: this.center,
        required: this.required,
        borderless: !this.border,
        clickable: this.isLink || this.clickable
      }, _bem[this.size] = this.size, _bem)),
      "on": {
        "click": this.onClick
      }
    }, [LeftIcon, Title, Value, RightIcon, slots.extra]);
  }
});

exports.default = _default;