'use strict'

import http from '@/commons/http'
import ajaxRequest from '@/commons/http-async'
import storage from '@/commons/storage'
import { language } from '@/conf/'
import * as types from './types'

export default {
  /***************************************
   * 登陆
   * @author sniper
   * @params options: {} | object
   *    @
   **************************************/
  [types.A_COMMON_LOGIN] ({
    commit
  }, options) {
    return http({
      apiType: 'DEMO',
      mask: true,
      method: 'post',
      data: options.data || {},
      url: '/login'
    })
      .then(response => {
        let { data } = response
        if (data.success) {
          // 储存用户信息
          commit(types.M_COMMON_LOGIN, data)
          // 成功回调
          options.cbSuccess && options.cbSuccess()
        } else {
          // 失败回调
          options.cbFail && options.cbFail()
        }
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 登陆
   * @author sniper
   * @params options: {} | object
   *    @
   **************************************/
  [types.A_COMMON_LOGIN_OUT] ({
    commit
  }, options) {
    return http({
      apiType: 'UCC',
      method: 'post',
      mask: '正在退出...',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'text/xml; charset=utf-8',
        'Data-Type': 'text'
      },
      url: '/njdf_logout'
    })
      .then(response => {
        // 储存用户信息
        commit(types.M_COMMON_LOGIN_OUT)
        // 成功回调
        options.cbSuccess && options.cbSuccess()
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 获取数据字典
   * @author litao
   * @params
   * @
   **************************************/
  [types.A_DICT_LIST] ({
    commit
  }) {
    return http({
      apiType: 'UCC',
      method: 'get',
      url: `/njdf_cache?cacheType=dictCache&language=${storage.lang || language.default}`
    })
      .then(response => {
        let { data } = response
        if (response.status === 200) {
          // 储存数据字典信息
          commit(types.M_DICT_LIST, data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 获取数据字典服务项
   * @author litao
   * @params
   * @
   **************************************/
  [types.A_SERVICE_ITEM] ({
    commit
  }) {
    return http({
      apiType: 'UCC',
      method: 'get',
      url: `/njdf_cache?cacheType=devicetype&language=${storage.lang || language.default}`
    })
      .then(response => {
        let { data } = response
        if (response.status === 200) {
          // 储存数据字典信息
          commit(types.A_SERVICE_ITEM, data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 获取系统参数
   * @author litao
   * @params
   * @
   **************************************/
  [types.A_SYS_PARAM] ({
    commit
  }) {
    return http({
      apiType: 'UCC',
      method: 'get',
      url: `/njdf_cache?cacheType=sysParamCache&language=${storage.lang || language.default}`
    })
      .then(response => {
        let { data } = response
        if (response.status === 200) {
          // 储存数据字典信息
          commit(types.M_SYS_PARAM, data)
        }
      })
      .catch(error => {
        console.log(error)
      })
  },
  /***************************************
   * 获取角色信息
   * @author litao
   * @params options: {} | object
   * @
   **************************************/
  [types.A_ROLE_LIST] ({
    commit
  }, options) {
    return http({
      apiType: 'UCC',
      method: 'get',
      url: `/njdf_cache?cacheType=roleCache&language=${storage.lang || language.default}`
    })
      .then(response => {
        let { data } = response
        if (response.status === 200) {
          // 储存数据字典信息
          commit(types.M_ROLE_LIST, data)
          options && options.successCb && options.successCb()
        } else {
          options && options.failCb && options.failCb()
        }
      })
      .catch(error => {
        console.log(error)
        options && options.failCb && options.failCb()
      })
  },
  /***************************************
   * 获取组织机构列表 - 企业通讯录
   * @author litao
   * @params options: {} | object
   * @
   **************************************/
  [types.A_ORG_LIST] ({
    commit
  }, options) {
    return ajaxRequest.njdfAjax([{
      service: 'M4002022'
    }])
      .then(response => {
        let { data } = response
        if (response.code === '0') {
          // 储存组机构列表
          commit(types.M_ORG_LIST, data)
          options && options.successCb && options.successCb()
        } else {
          options && options.failCb && options.failCb()
        }
      })
      .catch(error => {
        console.log(error)
        options && options.failCb && options.failCb()
      })
  },
  /***************************************
   * 获取组织机构列表 - 会场
   * @author sniper
   * @params options: {} | object
   * @
   **************************************/
  [types.A_ORG_MEETING_ROOM] ({
    commit
  }, options) {
    return ajaxRequest.njdfAjax([{
      service: 'M4003400',
      page: 1,
      pagecount: 9999
    }])
      .then(response => {
        let { data } = response
        if (response.code === '0') {
          // 储存组机构列表
          commit(types.M_ORG_MEETING_ROOM, data)
          options && options.successCb && options.successCb()
        } else {
          options && options.failCb && options.failCb()
        }
      })
      .catch(error => {
        console.log(error)
        options && options.failCb && options.failCb()
      })
  },
  /***************************************
   * 设备别名 - 会场
   * @author sniper
   * @params options: {} | object
   * @
   **************************************/
  [types.A_MEETING_ROOM_EQUIPMENTS_ALIAS] ({
    commit
  }, options) {
    return ajaxRequest.njdfAjax({
      service: 'P1202605'
    })
      .then(response => {
        let { data } = response
        if (response.code === '0') {
          // 储存组机构列表
          commit(types.M_MEETING_ROOM_EQUIPMENTS_ALIAS, data)
        } else {
        }
      })
      .catch(error => {
        console.log(error)
      })
  }
}
