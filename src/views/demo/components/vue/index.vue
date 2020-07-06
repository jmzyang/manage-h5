<template lang="pug">
.scroll-layout
  //- header.bar.bar-header
  //-   | demo
  Scroll
    div.demo
      div.demo-box
        div.title
          p.f-info wechat
        div.content
          mt-button(type="primary", size="normal", @click="wechatChooseImage") 选择图片
      div.demo-box
        div.title
          p.f-info Toast
        div.content
          mt-button(type="primary", size="normal", @click="toast()") Toast
      div.demo-box
        div.title
          h2.f-info Popup
        div.content
          mt-button(type="primary", size="normal", @click="wechatChooseImage") Popup
      div.demo-box
        div.title
          h2.f-info Switch
        div.content
          mt-button(type="primary", size="normal", @click="wechatChooseImage") Switch
      div.demo-box
        div.title
          h2.f-info Spinner
        div.content
          mt-button(type="primary", size="normal", @click="wechatChooseImage") Spinner
      div.demo-box
        div.title
          h2.f-info {{$t('demo.directives')}}
        div.content
          h2 距离明天此时还有：
          span.countdown(v-countdown='overTime', formatter='HH小时mm分ss秒')
      div.demo-box
        div.title
          h2.f-info {{$t('demo.filters')}}
        div.content
          p 当前日期：
            | {{formatTime}}
          p 格式化后：
            | {{formatTime, 'YYYY-MM-DD HH:mm' | date-filter}}
      div.demo-box
        div.title
          h2.f-info {{$t('demo.utils')}}
        div.content
          p 转换数据格式等工具类组件
      div.demo-box
        div.title
          h2.f-info {{$t('demo.http')}}
        div.content
          mt-button.demo(type="default", @click="handelGetUserInfo") 请求
          p.address
            template(v-if='user') {{user.userName}}
            template(v-else) 未获取
          pre 详细用法请参考工程目录下README.md
      div.demo-box
        div.title
          h2.f-info {{$t('demo.localstorage')}}
        div.content
          mt-button.demo(type="default", @click="changeLang('cn')") 简体中文
          mt-button.demo(type="primary", @click="changeLang('en')") 英文
          mt-button.demo(type="danger", @click="clearLang()") 清除
      div.demo-box
        div.title
          h2.f-info {{$t('demo.componentsEvent')}}
        div.content.f-clearfix
          mt-button.demo(type="default", @click="handelChangeComponent") 改变组件标题
          mt-button.demo(type="primary", @click="handelComponent") 调用子组件事件
          PropsComponent(:title="component.title", :list="component.list", :status.sync="component.status", @handelParent="handelParent")
      div.demo-box
        div.title
          h2.f-info {{$t('demo.componentsVuex')}}
        div.content.f-clearfix
          mt-button.demo(type="default", @click="handelCommit") commit
          mt-button.demo(type="primary", @click="handelAction") action
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
      parent: '我是父组件的内容',
      overTime: moment('2018-09-10').diff('2018-09-09'),
      formatTime: moment(),
      demoCalendarVisibled: false,
      component: {
        title: '我是一个组件',
        list: [1, 2, 3, 4],
        status: true
      }
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
    handelFocus () {
      // setTimeout(function () {
      //   document.body.scrollTop = document.body.scrollHeight
      // }, 1000)
    },
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
