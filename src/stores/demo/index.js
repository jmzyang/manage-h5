'use strict'

import storage from '@/commons/storage'
import actions from './actions'
import mutations from './mutations'

export default {
  state: {
    userBaseInfo: storage.userBaseInfo,
    address: storage.demoAddress
  },
  actions,
  mutations
}
