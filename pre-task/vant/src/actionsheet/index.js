"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _icon = _interopRequireDefault(require("../icon"));

var _loading = _interopRequireDefault(require("../loading"));

var _popup = _interopRequireDefault(require("../mixins/popup"));

var _use = (0, _utils.use)('actionsheet'),
    sfc = _use[0],
    bem = _use[1];

var _default = sfc({
  mixins: [_popup.default],
  props: {
    title: String,
    value: Boolean,
    actions: Array,
    cancelText: String,
    overlay: {
      type: Boolean,
      default: true
    },
    closeOnClickOverlay: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onSelect: function onSelect(event, item) {
      event.stopPropagation();

      if (!item.disabled && !item.loading) {
        if (item.callback) {
          item.callback(item);
        }

        this.$emit('select', item);
      }
    },
    onCancel: function onCancel() {
      this.$emit('input', false);
      this.$emit('cancel');
    }
  },
  render: function render(h) {
    var _this = this;

    if (!this.shouldRender) {
      return;
    }

    var title = this.title,
        cancelText = this.cancelText,
        onCancel = this.onCancel;

    var Header = function Header() {
      return h("div", {
        "class": [bem('header'), 'van-hairline--top-bottom']
      }, [title, h(_icon.default, {
        "attrs": {
          "name": "close"
        },
        "on": {
          "click": onCancel
        }
      })]);
    };

    var Option = function Option(item) {
      return h("div", {
        "class": [bem('item', {
          disabled: item.disabled || item.loading
        }), item.className, 'van-hairline--top'],
        "on": {
          "click": function click(event) {
            _this.onSelect(event, item);
          }
        }
      }, [item.loading ? h(_loading.default, {
        "class": bem('loading'),
        "attrs": {
          "size": "20px"
        }
      }) : [h("span", {
        "class": bem('name')
      }, [item.name]), item.subname && h("span", {
        "class": bem('subname')
      }, [item.subname])]]);
    };

    var Footer = cancelText ? h("div", {
      "class": bem('cancel'),
      "on": {
        "click": onCancel
      }
    }, [cancelText]) : h("div", {
      "class": bem('content')
    }, [this.$slots.default]);
    return h("transition", {
      "attrs": {
        "name": "van-slide-up"
      }
    }, [h("div", {
      "directives": [{
        name: "show",
        value: this.value
      }],
      "class": bem({
        withtitle: title
      })
    }, [title ? Header() : this.actions.map(Option), Footer])]);
  }
});

exports.default = _default;