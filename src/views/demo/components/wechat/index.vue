<template lang="pug">
.scroll-layout
  header.bar.bar-header
    | demo
  footer.bar.bar-footer
    | 底部
  Scroll
    div.demo
      div.demo-box
        div.title
          h2.f-info wechat
        div.content
          mt-button(type="primary", size="normal", @click="wechatChooseImage") 选择图片
</template>

<script>
// 引入依赖
import moment from 'moment'
import storage from '@/commons/storage'
import { mapState } from 'vuex'
import { A_USER_GET, M_DEMO_GET_ADDRESS, A_DEMO_GET_ADDRESS } from '@/stores/demo/types'

// 引入组件
import weChat from '@/commons/wechat'
import Scroll from '@/components/c-scroll/index.vue'

// 配置JSSDK
let currUrl = location.protocol + '//' + location.host + '/demo'

weChat.getConfig(currUrl)

export default {
  data () {
    return {
      parent: '我是父组件的内容',
      overTime: moment('2018-09-10').diff('2018-09-09'),
      formatTime: moment(),
      component: {
        title: '我是一个组件',
        list: [1, 2, 3, 4],
        status: true
      }
    }
  },
  components: {
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
      this.$toast({
        message: 'Upload Complete',
        position: 'bottom',
        duration: 5000
      })
    },
    // 获取用户信息
    handelGetUserInfo () {
      let vm = this
      vm.$store.dispatch(A_USER_GET)
    },
    // 本地存储 - 设置
    changeLang (_lang) {
      storage.lang = _lang
      this.$i18n.locale = _lang
    },
    // 本地存储 - 获取
    clearLang () {
      storage.lang = null
      this.$message('本地存储lang已清除')
    },
    // 更改组件数据
    handelChangeComponent () {
      this.component.title = '更改后的组件'
    },
    // child
    handelComponent () { },
    // handelParent
    handelParent (_data) {
      this.$message(`${_data}${this.parent}`)
    },
    // vuex - commit
    handelCommit () {
      this.$store.commit(M_DEMO_GET_ADDRESS, { address: '深圳市' })
    },
    // vuex - action
    handelAction () {
      this.$store.dispatch(A_DEMO_GET_ADDRESS, {}).then((res) => {
        console.log(res)
      })
    },
    // 选择图片
    wechatChooseImage () {
      weChat.ready(
        'chooseImage',
        {
          count: 1,
          success: function (res) {
            window.alert(JSON.stringify(res))
          },
          fail: function (res) {
            res = JSON.stringify(res)
            window.alert('上传失败，请重试哦')
          }
        }
      )
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
