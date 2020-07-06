'use strict'

import { mapState } from 'vuex'
import http from '@/commons/http'
import * as TYPES from '@/stores/common/types'

export default {
  computed: {
    ...mapState({
      currentRouter: state => state.route
    })
  },
  data () {
    return {
      thisRouter: this.$router.currentRoute
    }
  },
  watch: {
    // 监听路由，并做相应得处理
    $route: {
      handler: function (val, oldVal) {
      },
      // 深度观察监听
      deep: true
    }
  },
  created () {
    this.commitMenu()
  },
  mounted () {
  },
  updated () {},
  methods: {
    commitMenu () {
      let vm = this
      http({
        mask: true,
        url: 'data/menu.json'
      }).then((res) => {
        vm.$store.commit(TYPES.M_COMMON_MENU, res.data)
      })
    }
  }
}
