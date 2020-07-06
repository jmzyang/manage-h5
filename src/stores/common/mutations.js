'use strict'

import storage from '@/commons/storage'
import * as types from './types'

export default {
  // 获取用户信息
  [types.M_COMMON_LOGIN] (state, payload) {
    if (payload.key) {
      state.userBaseInfo[payload.key] = payload.val
      storage.userBaseInfo = state.userBaseInfo
    }
  },
  [types.M_KIPARAMETER] (state, payload) {
    if (payload.val) {
      state.KIparameter = payload.val
    } else {
      state.KIparameter = {}
    }
  },
  [types.M_COMMON_LOGIN_OUT] (state, payload) {
    storage.xAuthToken = false
    state.userBaseInfo = {}
    storage.userBaseInfo = null
  },
  // 菜单
  [types.M_COMMON_MENU] (state, _data) {
    storage.menu = _data
    state.menu = _data
  },
  // 数据字典
  [types.M_DICT_LIST] (state, _data) {
    storage.dictList = _data
    state.dictList = _data
  },
  // 系统参数
  [types.M_SYS_PARAM] (state, _data) {
    storage.sysParam = _data
    state.sysParam = _data
  },
  // 角色信息
  [types.M_ROLE_LIST] (state, _data) {
    storage.roleList = _data
    state.roleList = _data
  },
  // 组织机构列表 - 企业通讯录
  [types.M_ORG_LIST] (state, _data) {
    storage.orgList = _data
    state.orgList = _data
  },
  // 组织机构列表 - 会场
  [types.M_ORG_MEETING_ROOM] (state, _data) {
    storage.orgMeetingRoom = _data
    state.orgMeetingRoom = _data
  },
  // 构造socket对象
  [types.M_NOTICE_SOCKET] (state, _data) {
    state.noticeSocket = _data
  },
  // 会场设备别名
  [types.M_MEETING_ROOM_EQUIPMENTS_ALIAS] (state, _data) {
    storage.meetingRoomEquipmentsAlias = _data
    state.meetingRoomEquipmentsAlias = _data
  },
  // 服务项别名
  [types.A_SERVICE_ITEM] (state, _data) {
    storage.serviceItem = _data
    state.serviceItem = _data
  }
}
