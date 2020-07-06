'use strict'

// 通用报错信息
const DEFAULT_ERROR = '您与服务器的连接已经断开，请联系管理员处理'

export default {
  status: {
    DEFAULT_ERROR: DEFAULT_ERROR,
    404: '您与服务器的连接已经断开，请联系管理员处理',
    500: DEFAULT_ERROR,
    700: DEFAULT_ERROR,
    1001: '服务API入口不存在',
    1002: '没有权限访问，请联系管理员',
    1011: '账号不存在，或者账号异常，请重新登录系统',
    1012: '账号被禁用',
    1013: '用户名或密码不匹配API网关',
    1101: '创建验证码失败',
    3500: '您是非担保酒店，该功能无法使用，请重新登录',
    1104: '图片验证码错误',
    1103: '图形验证码已被使用',
    1105: '图形验证码已过期'
  },
  app: {
    systemTitle: 'UCC客服系统',
    languageChangeTipSuccess: '切换语言成功',
    languageChangeTipError: '切换语言失败，无法获取语言包'
  },
  demo: {
    directives: '指令 - 倒计时',
    filters: '过滤器 - 格式化时间',
    utils: '工具类',
    http: 'http请求 - 获取用户信息',
    localstorage: '本地存储 - 国际化',
    componentsEvent: '组件通信 - 简单',
    componentsVuex: '组件通信 - vuex'
  }
}
