<template lang="pug">
.page-wrap.join-meeting(v-loading="loading")
  BarHeader(
    layout="title",
    :border="true",
    :back="true") 加入会议
  .enter-box
    .enter-title 请输入八位数会议ID
    van-cell-group.enter-input
        van-field(
            v-model="metCode"
            placeholder=""
            :border="false"
            type="number"
            maxlength="8"
        )
  .commit-wrap
      button.reset(type="danger", :class="metCode.length === 8 ? 'active' : ''", @click="joinMet") 加入会议
</template>

<script>
import BarHeader from '@/components/c-header'
export default {
  data () {
    return {
      metCode: '',
      headerType: 'meeting', // 标题类型
      headerTitle: '加入会议',
      loading: false // loading开启关闭
    }
  },
  components: {
    BarHeader
  },
  methods: {
    joinMet () {
      this.$ajaxRequest([{
        service: 'M4030919',
        URL: window.location.href.split('#')[0]
      }]).then(result => {
        if (result.code === '0') {
          let data = result.data[0]
          this.timestamp = data.timestamp
          this.nonceStr = data.noncestr
          this.signature = data.signature
          // config接口注入权限验证配置
          wx.config({
            beta: true,
            debug: false,
            // appId: 'ww30a084437bc3132f',
            // appId: 'ww4f579e6249c5d2cf',
            appId: 'wxe611917ac42838c8',
            timestamp: this.timestamp,
            nonceStr: this.nonceStr,
            signature: this.signature,
            jsApiList: ['scanQRCode'] // 需要使用的JS接口列表，凡是要调用的接口都需要传进来
          })
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
@import './index.styl';
</style>
