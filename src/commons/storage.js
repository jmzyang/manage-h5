'use strict'

import storage from 'store'

// 用户信息
const USER_BASE_INFO = 'USER_BASE_INFO'
// 语言
const LANG = 'LANG'
// 语言包
const LANGPACKAGE = 'LANGPACKAGE'
// http状态码
const HTTP_STATUS = 'HTTP_STATUS'
// TOKEN
const X_AUTH_TOKEN = 'X_AUTH_TOKEN'
// 例子
const DEMO_ADDRESS = 'DEMO_ADDRESS'

// 组织机构 - 企业通讯录
const ORG_LIST = 'ORG_LIST'

// 组织机构 - 会场
const ORG_MEETING_ROOM = 'ORG_MEETING_ROOM'

// 会场设备别名
const MEETING_ROOM_EQUIPMENTS_ALIAS = 'MEETING_ROOM_EQUIPMENTS_ALIAS'

// 创会表单
const MEETING_FORM_DATA = 'MEETING_FORM_DATA'
const MEETING_FORM_DATA_EDIT = 'MEETING_FORM_DATA_EDIT'

// 创会议题
const MEETING_ISSUE = 'MEETING_ISSUE'
const MEETING_ISSUE_FORM = 'MEETING_ISSUE_FORM'

// 会场创会
const MEETING_ROOM_SELF = 'MEETING_ROOM_SELF'

export default {
  get lang () {
    return storage.get(LANG)
  },
  set lang (val) {
    if (!val) {
      storage.remove(LANG)
    } else {
      storage.set(LANG, val)
    }
  },
  get langPackage () {
    return storage.get(LANGPACKAGE)
  },
  set langPackage (val) {
    if (!val) {
      storage.remove(LANGPACKAGE)
    } else {
      storage.set(LANGPACKAGE, val)
    }
  },
  get demoAddress () {
    return storage.get(DEMO_ADDRESS)
  },
  // token
  set xAuthToken (val) {
    if (!val) {
      storage.remove(X_AUTH_TOKEN)
    } else {
      storage.set(X_AUTH_TOKEN, val)
    }
  },
  get xAuthToken () {
    return storage.get(X_AUTH_TOKEN)
  },
  set userBaseInfo (val) {
    if (!val) {
      storage.remove(USER_BASE_INFO)
    } else {
      storage.set(USER_BASE_INFO, val)
    }
  },
  get userBaseInfo () {
    return storage.get(USER_BASE_INFO)
  },
  // http状态提示语
  get httpStatus () {
    return storage.get(HTTP_STATUS)
  },
  set httpStatus (val) {
    if (!val) {
      storage.remove(HTTP_STATUS)
    } else {
      storage.set(HTTP_STATUS, val)
    }
  },
  // 组织机构 - 企业通讯录
  get orgList () {
    return storage.get(ORG_LIST)
  },
  set orgList (val) {
    if (!val) {
      storage.remove(ORG_LIST)
    } else {
      storage.set(ORG_LIST, val)
    }
  },
  // 组织机构 - 会场
  get orgMeetingRoom () {
    return storage.get(ORG_MEETING_ROOM)
  },
  set orgMeetingRoom (val) {
    if (!val) {
      storage.remove(ORG_MEETING_ROOM)
    } else {
      storage.set(ORG_MEETING_ROOM, val)
    }
  },
  // 会场设备别名
  get meetingRoomEquipmentsAlias () {
    return storage.get(MEETING_ROOM_EQUIPMENTS_ALIAS)
  },
  set meetingRoomEquipmentsAlias (val) {
    if (!val) {
      storage.remove(MEETING_ROOM_EQUIPMENTS_ALIAS)
    } else {
      storage.set(MEETING_ROOM_EQUIPMENTS_ALIAS, val)
    }
  },
  // 创会表单
  get meetingFormData () {
    return storage.get(MEETING_FORM_DATA)
  },
  set meetingFormData (val) {
    if (!val) {
      storage.remove(MEETING_FORM_DATA)
    } else {
      storage.set(MEETING_FORM_DATA, val)
    }
  },
  get meetingFormDataEdit () {
    return storage.get(MEETING_FORM_DATA_EDIT)
  },
  set meetingFormDataEdit (val) {
    if (!val) {
      storage.remove(MEETING_FORM_DATA_EDIT)
    } else {
      storage.set(MEETING_FORM_DATA_EDIT, val)
    }
  },
  get meetingIssue () {
    return storage.get(MEETING_ISSUE)
  },
  set meetingIssue (val) {
    if (!val) {
      storage.remove(MEETING_ISSUE)
    } else {
      storage.set(MEETING_ISSUE, val)
    }
  },
  get meetingIssueForm () {
    return storage.get(MEETING_ISSUE_FORM)
  },
  set meetingIssueForm (val) {
    if (!val) {
      storage.remove(MEETING_ISSUE_FORM)
    } else {
      storage.set(MEETING_ISSUE_FORM, val)
    }
  },
  get meetingRoomSelf () {
    return storage.get(MEETING_ROOM_SELF)
  },
  set meetingRoomSelf (val) {
    if (!val) {
      storage.remove(MEETING_ROOM_SELF)
    } else {
      storage.set(MEETING_ROOM_SELF, val)
    }
  }
}
