'use strict'

import http from '@/commons/http-async'
import { getDataByKey } from '@/utils/array'

export const getMembers = async (data) => {
  let list = []
  let fetchData = []
  let { organization, member } = data
  try {
    if (countOrg(organization) > 0) {
      let result = await http.njdfAjax({
        service: 'U2001808',
        ID_IN: getDataByKey(organization, 'ORG_ID').join(','),
        page: 1,
        pagecount: 9999,
        mask: false
      })
      console.log(result.data)
      if (+result.code === 0 && result.data.length > 0) {
        fetchData = result.data
        member = member.concat(fetchData)
      } else {
      }
    }
    // 组织机构如果有成员
    if (fetchData.length > 0) {
      let map = {}
      list = member.reduce((result, next) => {
        // 防止外部联系人与内部联系人ID冲突
        let _key = `${next.CONTACTS_TYPE || '0'}-${next.USER_CODE}`
        if (!map[_key]) {
          map[_key] = true
          result.push(next)
        }
        return result
      }, [])
    } else {
      list = member
    }
    return Promise.resolve(list)
  } catch (e) {
    console.log(e)
    // return Promise.reject(e)
  }
}

// 计算部门人数总和
const countOrg = (_org) => {
  let result = 0
  _org.forEach(item => {
    result += +item.COUNT
  })
  return result
}
