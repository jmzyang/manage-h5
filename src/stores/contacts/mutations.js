'use strict'

/*************************************************************
 * @tips 当组件被缓存起来的时候，请注意在适当的时候清除掉相关数据
 * @summary delet：删除，concat：新增或者合并，clear：清除
 * ************************************************************/

import * as types from './types'
import { getDataByKey } from '@/utils/array'

export default {
  /**************************************************
   * 企业内部联系人-基础业务
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_CONTACTS_ENTERPRISE] (state, action) {
    state.enterprise = JSON.parse(JSON.stringify(resolveMembers(action, state.enterprise)))
  },

  /**************************************************
   * 主持人
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_CONVENOR] (state, action) {
    state.convenor = JSON.parse(JSON.stringify(resolveMembers(action, state.convenor)))
  },
  [types.M_CONVENOR_EDIT] (state, action) {
    state.convenorEdit = JSON.parse(JSON.stringify(resolveMembers(action, state.convenorEdit)))
  },
  /**************************************************
   * 参会人
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_PARTICIPANTS] (state, action) {
    state.participants = JSON.parse(JSON.stringify(resolveMembers(action, state.participants)))
  },
  [types.M_PARTICIPANTS_EDIT] (state, action) {
    state.participantsEdit = JSON.parse(JSON.stringify(resolveMembers(action, state.participantsEdit)))
  },
  /**************************************************
   * 参会人领导
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_PARTICIPANTS_LEADER] (state, action) {
    state.leader = JSON.parse(JSON.stringify(resolveMembers(action, state.leader)))
  },
  [types.M_PARTICIPANTS_LEADER_EDIT] (state, action) {
    state.leaderEdit = JSON.parse(JSON.stringify(resolveMembers(action, state.leaderEdit)))
  },
  /**************************************************
   * 组成员
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_CUSTOM_GROUP_MEMBER] (state, action) {
    state.customGroupMember = JSON.parse(JSON.stringify(resolveMembers(action, state.customGroupMember)))
  },
  /**************************************************
   * 授权人
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_AUTHORIZER] (state, action) {
    state.authorizer = JSON.parse(JSON.stringify(resolveMembers(action, state.authorizer)))
  },
  /**************************************************
   * 议题参会人
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_PARTICIPANTS_ISSUE] (state, action) {    
    state.participantsIssue = JSON.parse(JSON.stringify(resolveMembers(action, state.participantsIssue)))
  },
  /**************************************************
   * 添加自定义组人员
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
  [types.M_CUSTOM_GROUP] (state, action) {    
    state.customGroup = JSON.parse(JSON.stringify(resolveMembers(action, state.customGroup)))
  }
}

/**************************************************
   * 公共处理工具函数
   * @params action {Object}
   *         @params type {String} delete、concat、clear
   *         @params value {Array}
   * ************************************************/
const resolveMembers = (action, data) => {
  const { type, value } = action
  let { organization, member } = data
  switch (type) {
    case 'delete':
      value.forEach(vItem => {
        if (vItem.org) {
          organization = organization.filter(item => +item.ORG_ID !== +vItem.ORG_ID)
        } else {
          member = member.filter(item => {
            return !(+item.USER_CODE == +vItem.USER_CODE && +item.CONTACTS_TYPE === +vItem.CONTACTS_TYPE)
          })
        }
      })
      break
    case 'concat':
      value.forEach((item) => {
        if (item.org) {
          organization.push(item)
        } else {
          member.push(item)
        }
      })
      break
    case 'clear':
      organization = []
      member = []
      break
    default:
      organization = value.organization ? value.organization : []
      member = value.member ? value.member : value
      break
  }
  // 去重
  let mapOrg = {}
  const organizationResolved = organization.reduce((result, next) => {
    if (!mapOrg[+next.ORG_ID]) {
      mapOrg[+next.ORG_ID] = true
      result.push(next)
    }
    return result
  }, [])
  let mapMember = {}
  const memberResolved = member.reduce((result, next) => {
    // 防止外部联系人与内部联系人ID冲突
    let _key = `${next.CONTACTS_TYPE || '0'}-${next.USER_CODE}`
    if (!mapMember[_key]) {
      mapMember[_key] = true
      result.push(next)
    }
    return result
  }, [])
  // 计算用户总数（毛统计）
  const total = countMembers(organizationResolved, memberResolved)
  return {
    organization: organizationResolved,
    member: memberResolved,
    total: total
  }
}

// 计算部门人数总和
const countMembers = (_org, _member) => {
  const MEMBER = _member.filter(item => {
    return !item.ORG_ID || !(_org.findIndex(oItem => +oItem.ORG_ID === +item.ORG_ID) > -1)
  })
  let result = MEMBER.length
  _org.forEach(item => {
    result += +item.COUNT
  })
  return result
}
