'use strict'

// http接口地址（类型）根路径
export const API = {
  // 开发环境
  development: {
    DEFAULT: 'http://10.20.2.19:8089' || process.env.BASE_URL,
    DEMO: '/api/',
    SOCKET: '',
    IMR: '/imr/',
    MAIL: '/MailService/',
    CMS: '/cmsService/',
    UCC: '/ucc_server',
    WELINL: '/welink'
  },
  // 生产环境
  production: {
    DEFAULT: process.env.BASE_URL,
    DEMO: '/api',
    SOCKET: '',
    IMR: '/imr',
    MAIL: '/MailService',
    CMS: '/cmsService',
    UCC: '/ucc_server',
    WELINL: '/welink'
  }
}

// 项目语言配置
export const language = {
  // 默认语言
  default: 'zh_CN',
  // 支持语言
  package: ['zh_CN'],
  // 语言别名
  alias: {
    zh_CN: '中文简体'
  },
  // 语言包数据
  data: {
    zh_CN: 'zh_CN.json'
  }
}
