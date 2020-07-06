'use strict'

import * as types from './types'

import moment from 'moment'

export default {
  // 初始化天数
  [types.C_CALE_INIT_DAYS] (state, action) {
    const { params } = action
    const { renderDate } = params
    const calendars = []
    const disabledFn = params.disabledDate
    const isBeforeFn = params.isBeforeDate
    let duration = +params.duration
    const businessType = +params.businessType
    // 声明一个遍历的开始时间
    let _startDate = renderDate
    if (+businessType === 1) {
      _startDate = moment(moment(renderDate).subtract(duration, 'M')).format('YYYY-MM-DD')
      duration = duration * 2 + 1
    } else if (+businessType === 2) {
      // 会场创建会议月日历周日历
      _startDate = moment(renderDate).format('YYYY-MM-DD')
    }
    for (let count = 0; count < duration; count++) {
      const initMoment = moment(_startDate)
      const todayStr = moment().format('YYYY-MM-DD')
      const now = initMoment.add(count, 'M')
      let month = now.month()
      let year = now.year()

      let daynow = moment(_startDate).add(count, 'M')
      daynow.date(1)
      const days = []
      let day = daynow.days()
      for (let i = 0; i < day; i++) {
        days[i] = { disabled: true }
      }
      for (let i = 1, max = now.daysInMonth(); i <= max; i++, day++) {
        now.date(i)
        const currentDate = now.format('YYYY-MM-DD')
        days[day] = {
          date: todayStr === currentDate ? '今天' : i,
          isToday: todayStr === currentDate ? 1 : 0,
          datetime: currentDate,
          isBefore: isBeforeFn(currentDate),
          disabled: disabledFn(currentDate),
          meetingStatus: 0
        }
      }
      month = month > 11 ? 0 : month
      calendars[count] = {
        year,
        month,
        days
      }
    }
    state.days = calendars
  },
  // 选择日期回调
  [types.C_CALE_SELECT_DAYS] (state, action) {
    let { selectedDays, rangedDays } = state
    const { params } = action
    const { item } = params
    const { multiple } = params
    const datetime = item.datetime
    rangedDays = {}
    if (multiple) {
      switch (selectedDays.length) {
        case 0:
          selectedDays.splice(0, 1, datetime)
          break
        case 1:
          if (datetime === selectedDays[0]) {
            selectedDays.length = 0
          } else {
            let cMo = moment(datetime)
            let diffDays = 0
            if (cMo.isBefore(selectedDays[0])) {
              selectedDays.splice(1, 1, selectedDays[0])
              selectedDays.splice(0, 1, datetime)
              // selectedDays[1] = selectedDays[0]
              // selectedDays[0] = datetime
            } else {
              // selectedDays[1] = datetime
              selectedDays.splice(1, 1, datetime)
            }
            cMo = moment(selectedDays[0])
            diffDays = -cMo.diff(selectedDays[1], 'days')
            for (let i = 0, j = diffDays - 1; i < j; i++) {
              let tmp = cMo.add(1, 'days').format('YYYY-MM-DD')
              rangedDays[tmp] = tmp
            }
          }
          break
        case 2:
          selectedDays = [datetime]
          break
      }
    } else {
      selectedDays.splice(0, 1, datetime)
    }
    state.selectedDays = selectedDays
    state.rangedDays = rangedDays
  },
  // 选中的日期
  [types.C_CALE_SELECTED_DAYS] (state, action) {
    let selectedDays = state.selectedDays
    const rangedDays = {}
    const { oper, params = [] } = action
    switch (oper) {
      case 'update':
        selectedDays = params.slice(0)
        if (selectedDays.length > 1) {
          const sMo = moment(selectedDays[0])
          const diffDays = -sMo.diff(selectedDays[1], 'days')
          for (let i = 0, j = diffDays - 1; i < j; i++) {
            let tmp = sMo.add(1, 'days').format('YYYY-MM-DD')
            rangedDays[tmp] = tmp
          }
        }
        break
      case 'delete':
        selectedDays = []
        break
    }
    state.selectedDays = selectedDays
    state.rangedDays = rangedDays
  },
  [types.C_CALE_U_MEETING_STATUS]  (state, action) {
    let { meeting } = action
    let { daysIndex } = action
    if (daysIndex) {
      let _days = state.days[daysIndex].days
      let indexLength = _days.filter(item => !item.date).length
      state.days[daysIndex].days && state.days[daysIndex].days.map((item, index) => {
        if (item.date) {
          item.meetingStatus = +meeting[index - indexLength]['TYPE'] || 0
        }
        return item
      })
    } else {
      state.weeks.map((item, index) => {
        if (item.date) {
          item.meetingStatus = +meeting[index]['TYPE'] || 0
        }
        return item
      })
    }
  },
  // 初始化周日历天数
  [types.C_CALE_INIT_WEEKS] (state, action) {
    const { params } = action
    const { renderDate } = params
    const isBeforeFn = params.isBeforeDate
    // 声明一个遍历的开始时间
    let weeks = []
    for (let i = 0; i < 7; i++) {
      const startWeekDate = moment(renderDate).startOf('week').add(i - 1, 'days').format('YYYY-MM-DD')
      weeks[i] = {
        date: moment().format('YYYY-MM-DD') === startWeekDate ? '今天' : parseInt(startWeekDate.split('-')[2]),
        isToday: moment().format('YYYY-MM-DD') === startWeekDate ? 1 : 0,
        datetime: startWeekDate,
        isBefore: isBeforeFn(startWeekDate),
        meetingStatus: 0
      }
    }
    state.weeks = weeks
  },
  [types.C_CALENDAR_SCROLL]  (state, action) {
    state.calendarScroll = action
  }
}
