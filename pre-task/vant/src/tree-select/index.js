"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _create = _interopRequireDefault(require("../utils/create"));

var _default = (0, _create.default)({
  render: function render() {
    var _vm = this;

    var _h = _vm.$createElement;

    var _c = _vm._self._c || _h;

    return _c('div', {
      class: _vm.b(),
      style: {
        height: _vm.height + 'px'
      }
    }, [_c('div', {
      class: _vm.b('nav')
    }, _vm._l(_vm.items, function (item, index) {
      return _c('div', {
        staticClass: "van-ellipsis",
        class: _vm.b('nitem', {
          active: _vm.mainActiveIndex === index,
          disabled: item.disabled
        }),
        domProps: {
          "textContent": _vm._s(item.text)
        },
        on: {
          "click": function click($event) {
            _vm.onClickNav(item, index);
          }
        }
      });
    }), 0), _c('div', {
      class: _vm.b('content')
    }, _vm._l(_vm.subItems, function (item) {
      return _c('div', {
        key: item.id,
        staticClass: "van-ellipsis",
        class: _vm.b('item', {
          active: _vm.activeId === item.id,
          disabled: item.disabled
        }),
        on: {
          "click": function click($event) {
            _vm.onItemSelect(item);
          }
        }
      }, [_vm._v("\n      " + _vm._s(item.text) + "\n      "), _vm.activeId === item.id ? _c('icon', {
        class: _vm.b('selected'),
        attrs: {
          "name": "checked",
          "size": "16px"
        }
      }) : _vm._e()], 1);
    }), 0)]);
  },
  name: 'tree-select',
  props: {
    items: Array,
    mainActiveIndex: Number,
    activeId: {
      type: [Number, String],
      default: 0
    },
    height: {
      type: Number,
      default: 300
    }
  },
  computed: {
    subItems: function subItems() {
      var selectedItem = this.items[this.mainActiveIndex] || {};
      return selectedItem.children || [];
    }
  },
  methods: {
    onClickNav: function onClickNav(data, index) {
      if (!data.disabled) {
        this.$emit('navclick', index);
      }
    },
    onItemSelect: function onItemSelect(data) {
      if (!data.disabled) {
        this.$emit('itemclick', data);
      }
    }
  }
});

exports.default = _default;