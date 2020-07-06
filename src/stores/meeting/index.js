'use strict'

import storage from '@/commons/storage'

import actions from './actions'
import mutations from './mutations'
import * as types from './types'

export default {
  state: {
    meetingFormData: storage.meetingFormData || {
      theme: '',
      startTime: '',
      readinessTime: 0,
      duration: 30,
      classification: '',
      notifyMode: '2',
      videoConference: '2',
      meetingIssue: [],
      meetingRoom: [],
      serviceItems: [],
      convenor: { organization: [], member: [], total: 0 },
      leader: { organization: [], member: [], total: 0 },
      participants: { organization: [], member: [], total: 0 }
    }, // 创会时选中的会场列表
    meetingFormDataEdit: storage.meetingFormDataEdit || {
      theme: '',
      startTime: '',
      readinessTime: 0,
      duration: 30,
      classification: '',
      notifyMode: '2',
      videoConference: '2',
      meetingIssue: [],
      meetingRoom: [],
      serviceItems: [],
      convenor: { organization: [], member: [], total: 0 },
      leader: { organization: [], member: [], total: 0 },
      participants: { organization: [], member: [], total: 0 }
    }, // 创会时选中的会场列表
    meetingRoom: [], // 创会时选中的会场列表
    meetingRoomControl: [], // 会议控制添加会场选中的会场列表
    meetingRoomSelf: storage.meetingRoomSelf || [], // 会场创会，选中的会场列表
    meetingIssueName: storage.meetingIssueName || [], // 会议议题集合存储
    meetingIssueForm: storage.meetingIssueForm || {
      title: [],
      fileList: []
    }, // 会议议题表单存储
    alias: { // 创会、修改会议中主持人、参会人、会场的选中数据的地址集合
      meetingRoom: {
        state: 'meetingRoom',
        mutations: types.M_MEETING_ROOM
      },
      // meetingRoomEdit: {
      //   state: 'meetingRoomEdit',
      //   mutations: types.M_MEETING_ROOM_EDIT
      // },
      meetingRoomControl: {
        state: 'meetingRoomControl',
        mutations: types.M_MEETING_ROOM_CONTROL
      },
      meetingRoomSelf: {
        state: 'meetingRoomSelf',
        mutations: types.M_MEETING_ROOM_SELF
      }
    }
  },
  actions,
  mutations
}
