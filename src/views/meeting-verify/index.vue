<template lang="pug">
LayoutPage
  template(slot="left")
    .verify-header-box
      BarHeader(layout="title",:title="$t('meetingAudit')")
    MeetingList(
      @loadingState="loadingState",
      :getmeetingList="getmeetingList",
      v-loading="loading",
      :currentTab="currentTab",
      :meetingListType="meetingListType" )
</template>
<script>
import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
import MeetingList from '../meeting/components/c-list'

import moment from '@/commons/moment.js'
export default {
  data() {
    return {
      detailsData: {}, // 会议详情入参
      loading: false, // loading开启关闭
      currentTab: this.$route.query.currentNav ? this.$route.query.currentNav : 3, // 0：未完成，1：已完成，2：待审核
      meetingListType: 'verify', // 会议列表类型
      getmeetingList: { Monitor: false, type: null }, // 获取会议列表
    }
  },
  components: {
    LayoutPage,
    MeetingList,
    BarHeader
  },
  methods:{
    loadingState(data) {
      // loading状态
      this.loading = data
    }
  }
}
</script>


<style lang="stylus">
@import './index.styl'
</style>