'use strict'

import Vue from 'vue'
import { language } from '@/conf/'
import storage from '@/commons/storage'
// import locale from 'element-ui/lib/locale'
import VueI18n from 'vue-i18n'
import './langs'

Vue.use(VueI18n)
// 从localStorage中拿到用户的语言选择，如果没有，那默认中文。
const i18n = new VueI18n({
  locale: storage.lang || language.default,
  messages: {
    'zh_CN': require('./langs/zh_CN/meeting.json'),
    'en_US': require('./langs/en_US/meeting.json')
  }
})
// 为了实现element插件的多语言切换
// locale.i18n((key, value) => i18n.t(key, value))

export default i18n
