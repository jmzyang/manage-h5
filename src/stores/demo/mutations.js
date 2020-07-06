'use strict'

import storage from '@/commons/storage'
import * as types from './types'

export default {
  // 获取地址
  [types.M_DEMO_GET_ADDRESS] (state, _data) {
    state.address = _data
  },
  // 获取用户信息
  [types.M_GET_USER] (state, _data) {
    state.userBaseInfo = _data
    storage.userBaseInfo = _data
  }
}
