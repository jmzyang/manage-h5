'use strict'
import storage from '@/commons/storage'
import actions from './actions'
import mutations from './mutations'

export default {
  state: {
    userBaseInfo: storage.userBaseInfo || {}, // 用户基本信息
    KIparameter: {}, // KI系统参数
    menu: storage.menu || [], // 菜单
    meetingRoomEquipmentsAlias: storage.meetingRoomEquipmentsAlias || [], // 会场设备别名
    serviceItem: storage.serviceItem || [], // 服务项
    orgList: storage.orgList || [], // 组织机构列表
    orgMeetingRoom: storage.orgMeetingRoom || [], // 组织机构列表
    noticeSocket: null // socket对象
  },
  actions,
  mutations
}
