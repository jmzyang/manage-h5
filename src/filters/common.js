'use strict'

import moment from 'moment'

const dayLabels = ['一', '二', '三', '四', '五', '六', '日']

export default {
  // 格式化时间
  dateFilter (val, format) {
    if (val === null || typeof val === 'undefined') {
      return val
    }
    return moment(val).format(format || 'YYYY-MM-DD')
  },
  // 转换周几
  dateWeekDay (val) {
    const result = dayLabels[moment(val).isoWeekday() - 1]
    return `周${result}` || '未知'
  },
  meetingTypeFilter (type) {
    let typeText = ''
    switch (+type) {
      case 1:
        typeText = '即时会议'
        break
      case 2:
        typeText = '预约会议'
        break
      case 3:
        typeText = '周期会议'
        break
      case 4:
        typeText = '固定会议'
        break
      default:
        typeText = '未知类型'
        break
    }
    return `${typeText}`
  },
  // 是否是视频会议、本地会议
  meetingIsVideoFilter (isVideo) {
    let isVideoText = ''
    switch (+isVideo) {
      case 1:
        isVideoText = '视频'
        break
      case 2:
        isVideoText = '本地'
        break
      default:
        isVideoText = '视频'
        break
    }
    return `${isVideoText}`
  },
  // 会议设备 - 返回中文
  meetingRoomEquipment (val, cn) {
    const EQ = val ? val.split(',') : []
    let result = []
    if (EQ.length && Array.isArray(cn) && cn.length > 0) {
      EQ.forEach(item => {
        cn.forEach(vItem => {
          if (+vItem.EQUIPMENT_ID === +item) {
            result.push(vItem.EQUIPMENT_NAME)
          }
        })
      })
    }
    return result.join(',')
  }
}
