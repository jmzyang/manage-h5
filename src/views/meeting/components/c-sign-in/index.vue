<template lang="pug">
  .sign-in-container
    BarHeader(
      layout="title"
      :back="true",
      :backEvent="true",
      @back="returnDetails")
      | {{$t('meetingSignIn')}}
    .sign-in-box
      .sign-theme
        | {{$t('theme')}}：{{meetingName}}
      .sign-main
        .sign-head
          div(v-for="(item,index) in voteHeadList" :key="index")
            | {{item}}
        Scroll
          .sign-term(v-for="(item,index) in signInData" :key="index")
            div {{item.USER_NAME}}
            div
              span(v-if="item.ATTA_URL") ✔
            div
              img(:src="fileUrl + item.ATTA_URL" v-if="item.ATTA_URL")
      .sign-bottom(v-if="false")
        van-button(type="info" @click="returnDetails") {{$t('export')}}
        van-button(type="default" @click="returnDetails") {{$t('close')}}
</template>
<script>
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  data () {
    return {
      fileUrl: window.location.protocol + '//' + window.location.host + '/fileServer/',
      signInData: [], // 签到数据
      voteHeadList: [this.$t('attendee'),this.$t('signInState',),this.$t('autograph')],
      meetingId: this.$route.query.meetingId || '',
      meetingName: this.$route.query.meetingName || ''
    }
  },
  components: {
    BarHeader,
    Scroll
  },
  mounted () {
    this.getSignInData() // 查询签到详情
  },
  methods: {
    async getSignInData () {
      let vm = this;
      let req = [
        {
          service: "M4030905",
          MEETING_ID: this.meetingId
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.signInData = result.data
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    returnDetails () {
      this.$router.go(-1)
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl';
</style>