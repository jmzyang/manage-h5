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
      class: _vm.b({
        on: _vm.value === _vm.activeValue,
        disabled: _vm.disabled
      }),
      style: _vm.style,
      on: {
        "click": _vm.onClick
      }
    }, [_c('div', {
      class: _vm.b('node')
    }, [_vm.loading ? _c('loading', {
      class: _vm.b('loading')
    }) : _vm._e()], 1)]);
  },
  name: 'switch',
  props: {
    value: null,
    loading: Boolean,
    disabled: Boolean,
    activeColor: String,
    inactiveColor: String,
    activeValue: {
      type: null,
      default: true
    },
    inactiveValue: {
      type: null,
      default: false
    },
    size: {
      type: String,
      default: '30px'
    }
  },
  computed: {
    style: function style() {
      return {
        fontSize: this.size,
        backgroundColor: this.value ? this.activeColor : this.inactiveColor
      };
    }
  },
  methods: {
    onClick: function onClick() {
      if (!this.disabled && !this.loading) {
        var checked = this.value === this.activeValue;
        var value = checked ? this.inactiveValue : this.activeValue;
        this.$emit('input', value);
        this.$emit('change', value);
      }
    }
  }
});

exports.default = _default;