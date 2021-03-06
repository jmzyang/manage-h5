"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _utils = require("../utils");

var _tag = _interopRequireDefault(require("../tag"));

var _use = (0, _utils.use)('card'),
    sfc = _use[0],
    bem = _use[1];

var _default = sfc({
  props: {
    tag: String,
    desc: String,
    thumb: String,
    title: String,
    centered: Boolean,
    lazyLoad: Boolean,
    thumbLink: String,
    num: [Number, String],
    price: [Number, String],
    originPrice: [Number, String],
    currency: {
      type: String,
      default: '¥'
    }
  },
  render: function render(h) {
    var thumb = this.thumb,
        slots = this.$slots;
    var showThumb = slots.thumb || thumb;
    var showNum = slots.num || (0, _utils.isDef)(this.num);
    var showPrice = slots.price || (0, _utils.isDef)(this.price);
    var showOriginPrice = slots['origin-price'] || (0, _utils.isDef)(this.originPrice);
    var Thumb = showThumb && h("a", {
      "attrs": {
        "href": this.thumbLink
      },
      "class": bem('thumb')
    }, [slots.thumb || (this.lazyLoad ? h("img", {
      "class": bem('img'),
      "directives": [{
        name: "lazy",
        value: thumb
      }]
    }) : h("img", {
      "class": bem('img'),
      "attrs": {
        "src": thumb
      }
    })), this.tag && h(_tag.default, {
      "attrs": {
        "mark": true,
        "type": "danger"
      },
      "class": bem('tag')
    }, [this.tag])]);
    var Title = slots.title || this.title && h("div", {
      "class": bem('title')
    }, [this.title]);
    var Desc = slots.desc || this.desc && h("div", {
      "class": [bem('desc'), 'van-ellipsis']
    }, [this.desc]);
    var Price = showPrice && h("div", {
      "class": bem('price')
    }, [slots.price || this.currency + " " + this.price]);
    var OriginPrice = showOriginPrice && h("div", {
      "class": bem('origin-price')
    }, [slots['origin-price'] || this.currency + " " + this.originPrice]);
    var Num = showNum && h("div", {
      "class": bem('num')
    }, [slots.num || "x " + this.num]);
    var Footer = slots.footer && h("div", {
      "class": bem('footer')
    }, [slots.footer]);
    return h("div", {
      "class": bem()
    }, [h("div", {
      "class": bem('header')
    }, [Thumb, h("div", {
      "class": bem('content', {
        centered: this.centered
      })
    }, [Title, Desc, slots.tags, h("div", {
      "class": "van-card__bottom"
    }, [Price, OriginPrice, Num])])]), Footer]);
  }
});

exports.default = _default;