<template lang="pug">
.scroll-layout
  Scroll
    van-cell(title="vant组件" is-link to="/demo/vant")
    van-cell(title="calendar" is-link to="/demo/calendar")
    van-cell(title="socket" is-link to="/demo/socket")
    van-cell(title="android" is-link to="/demo/android")
    van-cell(title="wechat" is-link to="/demo/wechat")
</template>

<script>
import Scroll from '@/components/c-scroll'

export default {
  data () {
    return {}
  },
  async created () {
    let req = [
      {
        service: 'P2018122502',
        START_YEAR_WEEK: '201832',
        END_YEAR_WEEK: '201901'
      }
    ]
    this.$ajaxRequest(req, (r) => {
      console.log('测试！调用UCC系统接口成功，返回数据请看控制台！', `回调方式：`, r)
    })

    let dd = await this.$ajaxRequest(req)
    console.log('await方式：', dd)
  },
  components: {
    Scroll
  }
}
</script>

<style lang="stylus">
</style>
