'use strict'

import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import { getDataByKey } from '@/utils/array'

// 前端数据格式转为后台数据格式
export const issueFormat = async (_data) => {
  const RESULT = await Promise.all(_data.map(async (item) => {
    // 参会人
    const contacts = await UTILS_CONTACTS.getMembers(item.contacts)
    // 内部联系人
    const contactsEnterprise = contacts.filter(item => +item.CONTACTS_TYPE !== 1)
    // 外部联系人
    const contactsExternal = contacts.filter(item => +item.CONTACTS_TYPE === 1)
    // 转换外部联系人数据格式
    let external = []
    contactsExternal.forEach((item) => {
      external.push({
        name: item.USER_NAME,
        tel: item.MOBILE,
        email: item.EMAIL
      })
    })
    item.user_code = getDataByKey(contactsEnterprise, 'USER_CODE').join(',') // 内部参会人员
    item.external = JSON.stringify(external)
    item.yitititle = item.title
    item.TOPIC_NAME = item.title
    delete item.title
    delete item.contacts
    return item
  }))
  return RESULT
}
// 后台数据格式转为前端数据格式
export const issueFormatFront = async (_data) => {
  const RESULT = await Promise.all(_data.map(async (item) => {
    // 参会人
    const CONTACTS = [
      ...item.user_code,
      ...item.external.map((item) => {
        item.USER_CODE = item.OUTSIDE_USER_CODE
        item.CONTACTS_TYPE = '1'
        item.EMAIL = item.EMAIL_ADDRESS
        item.MOBILE = item.PHONE_NO
        return item
      })
    ]
    item.contacts = {
      organization: [],
      member: CONTACTS,
      total: CONTACTS.length
    }
    item.title = item.TOPIC_NAME
    item.id = item.TOPIC_ID
    return item
  }))
  return RESULT
}