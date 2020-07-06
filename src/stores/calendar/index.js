'use strict'

import actions from './actions'
import mutations from './mutations'

export default {
  state: {
    days: [],
    selectedDays: [],
    rangedDays: {},
    weeks: [],
    calendarScroll: {}
  },
  actions,
  mutations
}
