<template lang="pug">
.scroll-layout
  //- header.bar.bar-header
  //-   | demo
  footer.bar.bar-footer
    input.input-message#meText(@focus="handelFocus()", placeholder="回复")
  Scroll
    .chat
      template(v-for="item in chat")
        .item(:class="{my: item.user === 'my'}")
          template(v-if="item.user !== 'my'")
            .user
              .avatar
              .time {{item.time}}
            .con-wrap
              .content {{item.content}}
          template(v-else)
            .con-wrap
              .content {{item.content}}
            .user
              .avatar
              .time {{item.time}}
</template>

<script>
// 引入依赖
import moment from 'moment'
import storage from '@/commons/storage'
import { mapState } from 'vuex'

// 引入组件
import Scroll from '@/components/c-scroll/index.vue'

// 配置JSSDK
// let currUrl = location.protocol + '//' + location.host + '/demo'
// import weChat from '@/commons/wechat'
// weChat.getConfig(currUrl)

export default {
  data () {
    return {
      chat: [
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋'
        },
        {
          type: 'text',
          user: 'ohter',
          time: '23:23:49',
          content: '哈哈'
        },
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '哈哈'
        },
        {
          type: 'text',
          user: 'ohter',
          time: '23:23:49',
          content: '王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋王八蛋'
        },
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '哈哈'
        },
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '哈哈'
        },
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '哈哈'
        },
        {
          type: 'text',
          user: 'my',
          time: '23:23:49',
          content: '哈哈'
        }
      ]
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

  },
  mounted () {
  },
  methods: {
    handelFocus () {
      // setTimeout(function () {
      //   document.body.scrollTop = document.body.scrollHeight
      // }, 1000)
    }
  }
}
</script>

<style lang="stylus" scoped>
@import './index.styl'
</style>
