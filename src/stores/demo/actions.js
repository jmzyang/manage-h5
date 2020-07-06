'use strict'

import http from '@/commons/http'
import * as types from './types'

export default {
  /***************************************
   * demo 获取链接
   * @author sniper
   **************************************/
  [types.A_DEMO_GET_ADDRESS] ({
    commit
  }, options) {
    return http({
      apiType: 'DEMO',
      mask: true,
      method: 'get',
      url: '/getUserError'
    })
      .then(response => {
        let { data } = response
        commit(types.M_DEMO_GET_ADDRESS, data)
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 获取用户信息
   * @author sniper
   **************************************/
  [types.A_USER_GET] ({
    commit
  }, options) {
    return http({
      apiType: 'DEMO',
      mask: true,
      method: 'get',
      url: '/getUser'
    })
      .then(response => {
        let { data } = response
        console.log(data)
        if (data.success) {
          commit(types.M_GET_USER, data.data)
        } else {
          options.fail && options.fail(data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
}
