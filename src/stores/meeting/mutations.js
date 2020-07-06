'use strict'

import storage from '@/commons/storage'

import httpAsync from '@/commons/http-async'
import { getDataByKey } from '@/utils/array'
import * as types from './types'

export default {
  /**************************************************
   * 创会表单数据
   * @params action {Object}
   *         @params type {String} assign clear
   *         @params value {Object}
   * ************************************************/
  [types.M_MEETING_FORM_DATA] (state, action) {
    const { type, value } = action
    let result = {}
    switch (type) {
      case 'clear':
        break
      case 'assign':
        result = Object.assign(state.meetingFormData, value)
        break
      default:
        result = value
        break
    }
    storage.meetingFormData = JSON.parse(JSON.stringify(result))
    state.meetingFormData = JSON.parse(JSON.stringify(result))
  },
  /**************************************************
   * 创会表单数据 - 修改
   * @params action {Object}
   *         @params type {String} assign clear
   *         @params value {Object}
   * ************************************************/
  [types.M_MEETING_FORM_DATA_EDIT] (state, action) {
    const { type, value } = action
    let result = {}
    switch (type) {
      case 'clear':
        break
      case 'assign':
        result = Object.assign(state.meetingFormDataEdit, value)
        break
      default:
        result = value
        break
    }
    storage.meetingFormDataEdit = JSON.parse(JSON.stringify(result))
    state.meetingFormDataEdit = JSON.parse(JSON.stringify(result))
  },
  /**************************************************
   * 会场 - 创建会议
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_MEETING_ROOM] (state, action) {
    state.meetingRoom = JSON.parse(JSON.stringify(commonMeetingRoom(action, state.meetingRoom)))
  },

  /**************************************************
   * 会场 - 会控
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_MEETING_ROOM_CONTROL] (state, action) {
    state.meetingRoomControl = JSON.parse(JSON.stringify(commonMeetingRoom(action, state.meetingRoomControl)))
  },
  /**************************************************
   * 会场 - 主模块
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_MEETING_ROOM_SELF] (state, action) {
    const RESULT = JSON.parse(JSON.stringify(commonMeetingRoom(action, state.meetingRoomSelf)))
    storage.meetingRoomSelf = RESULT
    state.meetingRoomSelf = RESULT
  },
  /**************************************************
   * 会议议题 - 主模块
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_MEETING_ISSUE_NAME_LIST] (state, action) {
    const { type, value } = action
    let result = []
    switch (type) {
      case 'clear':
        result = []
        break
      default:
        result = value
        break
    }
    storage.meetingIssueName = JSON.parse(JSON.stringify(result))
    state.meetingIssueName = JSON.parse(JSON.stringify(result))
  },
  /**************************************************
   * 会议议题 - 表单模块
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_MEETING_ISSUE_FORM] (state, action) {
    const { type, value } = action
    let result = {}
    switch (type) {
      case 'clear':
        result = {
          title: [],
          fileList: [],
          contacts: {
            organization: [], member: [], total: 0
          }
        }
        break
      case 'assign':
        result = Object.assign(state.meetingIssueForm, value)
        break
      default:
        result = value
        break
    }
    storage.meetingIssueForm = JSON.parse(JSON.stringify(result))
    state.meetingIssueForm = JSON.parse(JSON.stringify(result))
  }
}

/**************************************************
   * 公共处理工具函数
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
const commonMeetingRoom = (action, data) => {
  const { meetingType, timeRange, type, value, oldVal, callbackAdd, ignoreCheckRoom } = action
  let rooms = data
  switch (type) {
    case 'delete':
      // 锁定会议取消会场
      value.forEach(uItem => {
        rooms = rooms.filter((item) => {
          return +item.ROOM_ID !== +uItem.ROOM_ID
        })
      })
      !ignoreCheckRoom && LockMeetingRoomCancel(meetingType, timeRange, value)
      break
    case 'concat':
      rooms = rooms.concat(value)
      break
    case 'clear':
      // 锁定会议取消会场
      !ignoreCheckRoom && LockMeetingRoomCancel(meetingType, timeRange, rooms)
      rooms = []
      break
    default:
      rooms = value
      break
  }
  // 单选会场问题
  if (!ignoreCheckRoom && oldVal && oldVal.length > 0) {
    LockMeetingRoomCancel(meetingType, timeRange, oldVal)
  }

  // 去重
  let map = {}
  const result = rooms.reduce((result, next) => {
    if (!map[next.ROOM_ID]) {
      map[next.ROOM_ID] = true
      result.push(next)
    }
    return result
  }, [])
  // state.checkedMeetingRoom = rooms
  // 新增状态
  !ignoreCheckRoom && callbackAdd && callbackAdd()
  return result
}

// 取消会场
const LockMeetingRoomCancel = async (_type, _timeRange, _room) => {
  let options
  // 预约会议
  if (+_type === 1 || +_type === 2) {
    options = {
      service: 'M4005203',
      mask: false,
      METTING_STARTTIME: _timeRange.startTime,
      DURATION: _timeRange.duration,
      ROOM_ID: getDataByKey(_room, 'ROOM_ID').join(',')
    }
    await httpAsync.njdfAjax(options)
  }
}
