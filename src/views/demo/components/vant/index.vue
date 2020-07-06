<template lang="pug">
.scroll-layout
  //- header.bar.bar-header
  //-   | demo
  Scroll
    div.demo
      div.demo-box
        div.title
          p.f-info Toast
        div.content
          mt-button(type="primary", size="normal", @click="toast()") Toast
      div.demo-box
        div.title
          h2.f-info Popup
        div.content
          mt-button(type="primary", size="normal", @click="toast()") Popup
      div.demo-box
        div.title
          h2.f-info Switch
        div.content
          mt-button(type="primary", size="normal", @click="toast()") Switch
</template>

<script>
// 引入依赖
import moment from 'moment'
import storage from '@/commons/storage'
import { mapState } from 'vuex'
import { A_USER_GET, M_DEMO_GET_ADDRESS, A_DEMO_GET_ADDRESS } from '@/stores/demo/types'

// 引入组件
import Scroll from '@/components/c-scroll/'
import PropsComponent from '../props/'
import weChat from '@/commons/wechat'
// 配置JSSDK
let currUrl = location.protocol + '//' + location.host + '/demo'

weChat.getConfig(currUrl)

export default {
  data () {
    return {
      overTime: moment('2018-09-10').diff('2018-09-09'),
      formatTime: moment(),
      demoCalendarVisibled: false
    }
  },
  components: {
    PropsComponent,
    Scroll
  },
  computed: mapState({
    user: state => state.demo.userBaseInfo,
    demoAddress: state => state.demo.address
  }),
  created () {
    console.log(this.$i18n.t('demo'))
  },
  mounted () {
  },
  methods: {
    // toast
    toast () {
      this.$Toast({
        message: 'Upload Complete',
        position: 'bottom',
        duration: 3000
      })
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
