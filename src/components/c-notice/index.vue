<template lang="pug">
  .warn(@click="toNoticeDetails")
    i(class="iconfont icon-info-warn")
    .news(v-if="newsNum>0 && newsNum<=99") {{newsNum}}
    .news(v-else-if="newsNum>99") 99+
</template>

<script>
export default {
  name: 'notice',
  data () {
    return {
      newsNum: 0,
      msgData: [],
      socket: null, // 接收消息的websocket对象
      isdupFlag: false // 是否被其他人强制断开连接或者主动断连或者会话超时
    }
  },
  methods: {
    toNoticeDetails () {
      this.$router.push({
        name: 'my.notice-details'
      })
    },
    // async getMsgList () {
    //   let req = [{
    //     USER_CODE: 1,
    //     mask: false,
    //     service: "U1101803",
    //     page: "1",
    //     pagecount: "1000"
    //   }]
    //   let result = await this.$ajaxRequest(req)
    //   if (result.code === '0') {
    //     this.newsNum = result.data.filter(item => +item.REMIND_STAT === 0).length
    //   }
    // },
    initWebsocket () {
      if (this.socket) {
        return
      }
      let uri
      // var uri = "://" + window.location.host + njs.baseUrl + "/njdf_websocket?USER_CODE=" + top.window.g_user.userId + "&SOCKET_TYPE=1"
      // var uri = `${window.location.host}/njdf_websocket?USER_CODE=${this.$store.state.common.userBaseInfo.USER_CODE}&SOCKET_TYPE=1`
      if (process.env.NODE_ENV === 'production') {
        uri = `${window.location.host}/ucc_server/njdf_websocket?USER_CODE=${this.$store.state.common.userBaseInfo.USER_CODE}&SOCKET_TYPE=1`
      } else {
        uri = `localhost/ucc_server/njdf_websocket?USER_CODE=${this.$store.state.common.userBaseInfo.USER_CODE}&SOCKET_TYPE=1`
      }
      var str = window.location.protocol === 'http:' ? 'ws://' : 'wss://'
      // 初始化 websocket
      this.socket = new WebSocket(str + uri)
      this.socket.onopen = function () {
        // console.log('socket连接建立成功！', str + uri)
      }
      this.socket.onclose = (event) => {
        console.log('连接中断！')
        this.socket = null
        if (!this.isdupFlag) {
          setTimeout(() => {
            this.initWebsocket()
          }, 5000)
        }
      }
      this.socket.onmessage = (event) => {
        var str = event.data.replace(/&quot;/g, '\\"') // 转义
        var msgObj = JSON.parse(str) // 由JSON字符串转换为JSON对象
        if (msgObj.type === '0') {
          if (msgObj.subtype === '2') {
            this.isdupFlag = true
            this.socket.close()
          }
        } else if (msgObj.type === '2') { 
          // 处理业务消息
          // this.refreshNewsNum()
          this.getMsgList()
        }
      }
      this.$store.commit('M_NOTICE_SOCKET',this.socket)
    }
  },
  created () {
    // this.refreshNewsNum()
    this.getMsgList()
    this.initWebsocket()
  }
}
</script>

<style lang="stylus" scoped>
  @import './index.styl'
</style>
