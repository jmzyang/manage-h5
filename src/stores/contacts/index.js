'use strict'

import actions from './actions'
import mutations from './mutations'
import * as types from './types'

export default {
  state: {
    enterprise: { organization: [], member: [], total: 0 }, // 企业内部联系人
    // 具体的业务场景
    isLoadingOrganozation: false, // 组织机构是否正在加载
    convenor: { organization: [], member: [], total: 0 }, // 创会时选中的主持人
    convenorEdit: { organization: [], member: [], total: 0 }, // 修改会议时选中的主持人
    participants: { organization: [], member: [], total: 0 }, // 创会时选中的参会人
    participantsEdit: { organization: [], member: [], total: 0 }, // 修改会议时选中的参会人
    leader: { organization: [], member: [], total: 0 }, // 创会时选中的参会人领导
    leaderEdit: { organization: [], member: [], total: 0 }, // 修改会议时选中的参会人领导
    customGroupMember: { organization: [], member: [], total: 0 }, // 自定义组选择了的成员集合
    authorizer: { organization: [], member: [], total: 0 }, // 权限准仪授权人列表
    participantsIssue: { organization: [], member: [], total: 0 }, // 议题参会人
    customGroup: { organization: [], member: [], total: 0 }, // 添加自定义组人员
    // 变量结合业务场景别名
    alias: {
      default: {
        state: 'enterprise',
        mutation: types.M_CONTACTS_ENTERPRISE
      },
      convenor: {
        state: 'convenor',
        mutation: types.M_CONVENOR
      },
      convenorEdit: {
        state: 'convenorEdit',
        mutation: types.M_CONVENOR_EDIT
      },
      participants: {
        state: 'participants',
        mutation: types.M_PARTICIPANTS
      },
      participantsEdit: {
        state: 'participantsEdit',
        mutation: types.M_PARTICIPANTS_EDIT
      },
      leader: {
        state: 'leader',
        mutation: types.M_PARTICIPANTS_LEADER
      },
      leaderEdit: {
        state: 'leaderEdit',
        mutation: types.M_PARTICIPANTS_LEADER_EDIT
      },
      customGroupMember: {
        state: 'customGroupMember',
        mutation: types.M_CUSTOM_GROUP_MEMBER
      },
      authorizer: {
        state: 'authorizer',
        mutation: types.M_AUTHORIZER
      },
      participantsIssue: {
        state: 'participantsIssue',
        mutation: types.M_PARTICIPANTS_ISSUE
      },
      customGroup: {
        state: 'customGroup',
        mutation: types.M_CUSTOM_GROUP
      }
    }
  },
  actions,
  mutations
}
