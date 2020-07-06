'use strict'

import { language } from '@/conf/'
import storage from '@/commons/storage'
// 语言基础包
import zhCN from './zh_CN'

const MESSAGES = {
  zh_CN: zhCN
}
// 将语言配置包存储到本地，方便其他组件调用
storage.langPackage = MESSAGES
// 储存默认http状态提示语
storage.httpStatus = MESSAGES[language.default].status

export default MESSAGES
