'use strict'

/*******************************************************************
 * 这是一个表单校验插件，用法可参考login模块
 * 官方文档：https://baianat.github.io/vee-validate/
 ******************************************************************/

import Vue from 'vue'
import VeeValidate from 'vee-validate'

Vue.use(VeeValidate)

// 非空验证
VeeValidate.Validator.extend('required', {
  getMessage: function (name) {
    console.log(`$validator`, name)
    return name + '不能为空'
  },
  validate: function (value) {
    console.log(`$validator`, value)
    return value.length !== 0
  }
})

// 最大输入长度
VeeValidate.Validator.extend('max', {
  getMessage: function (name, param) {
    return name + '的长度不能超过' + param[0]
  },
  validate: function (value, param) {
    if (param[0]) {
      let max = parseInt(param[0])
      return value.length <= max
    }
    return true
  }
})

// 最大输入长度
VeeValidate.Validator.extend('min', {
  getMessage: function (name, param) {
    return name + '的长度不能少于' + param[0]
  },
  validate: function (value, param) {
    if (param[0]) {
      let max = parseInt(param[0])
      return value.length >= max
    }
    return true
  }
})

VeeValidate.Validator.extend('pubYear', {
  getMessage: function () {
    return ' 请输入正确的年份'
  },
  validate: function (value) {
    return /^(19|20)\d{2}$/.test(value)
  }
})

// 验证手机号
VeeValidate.Validator.extend('phone', {
  getMessage: function () {
    return ' 请输入正确的手机号码'
  },
  validate: function (value) {
    return /^1[3456789]\d{9}$/.test(value)
  }
})

// 验证邮箱
VeeValidate.Validator.extend('email', {
  getMessage: function () {
    return ' 请输入正确的邮箱地址'
  },
  validate: function (value) {
    return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+\.){1,63}[a-z0-9]{2,8}$/.test(value)
  }
})
