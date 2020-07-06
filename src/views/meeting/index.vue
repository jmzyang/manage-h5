<template lang="pug">
.page-wrap.meeting-list(v-loading="loading")
  BarHeader(:title="headerTitle", :layout="headerType",:search="searchsTitle", @search="searchInit",@scan="scanCode", @calendar="openAgenda", @returnClick="closeAgenda")
  .meeting-list-container
    SpCalendar(v-if="calendarShow==='SpCalendar'" :disabledDate='disabledDate' :isBeforeDate='isBeforeDate' :multiple="false" v-model='selectedDays' @changeTitle="changeTitle" @select="targetDay")
    MeetingList(:getmeetingList="getmeetingList",
      @loadingState="loadingState",
      @switchNav="switchNav",
      :calendarShow="calendarShow",
      :currentTab="currentTab",
      :calendarTime="calendarTime",
      :meetingListType="meetingListType")
</template>
<script>

import BarHeader from '@/components/c-header'
import SpCalendar from '@/components/c-calendar/'
import MeetingList from './components/c-list'
import moment from '@/commons/moment.js'
import httpAsync from '@/commons/http-async'
import http from '@/commons/http'
import axios from 'axios'
// import wx from 'weixin-js-sdk'
// import jweixin from '@/commons/jweixin.js'

export default {
  data () {
    return {
      selectedDays: [moment().format('YYYY-MM-DD')], // 当前日期
      headerTitle: '12', // 日历标题
      headerType: 'meeting', // 标题类型
      calendarShow: 'nav', // nav：选项卡，SpCalendar：日历
      currentTab: this.$route.query.currentNav ? this.$route.query.currentNav : 0, // 0：未完成，1：已完成，2：待审核
      searchsTitle: this.$t('searchTopics'), // 检索框内容 :: 搜索会议主题
      summaryInfo: '', // 主题、创建人、会场名称
      loading: false, // loading开启关闭
      detailsData: {}, // 会议详情入参
      getmeetingList: { Monitor: false, type: null }, // 获取会议列表
      calendarTime: { start: '', end: '' }, // 日历时间
      meetingListType: 'meetingList', // 会议列表类型,
      // appId: '', // 企业微信的corpID
      timestamp: '', // 签名的时间戳
      nonceStr: '', // 签名的随机串
      signature: '' // 签名，见 附录-JS-SDK使用权限签名算法
      // jsApiList: [] // 需要使用的JS接口列表

    }
  },
  components: {
    BarHeader,
    SpCalendar,
    MeetingList
  },
  created () {
    if (this.$route.query.searchsVal) {
      this.getSearchaDate(this.$route.query.searchsVal)
    }
  },
  mounted () {
    this.headerTitle = moment(this.selectedDays[0]).years() + this.$t('year') + (moment(this.selectedDays[0]).months() + 1) + this.$t('month')
    // :: 年，:: 月
    this.wxconfig()
  },
  methods: {
    searchInit () {
      this.$router.push({
        name: 'meeting-list-searchs',
        query: {
          searchsVal: this.summaryInfo,
          currentNav: this.currentTab,
          deleteCode: 'P1202670',
          keyWordCode: 'P1202668',
          searchsType: 'meeting'
        }
      })
    },
    disabledDate (date) {
      // 暂无逻辑的情况下，直接false
      return false
    },
    // 判断是否小于当前日期
    isBeforeDate (date) {
      const datebefore = moment().format('YYYY-MM-DD')
      return moment(date).isBefore(datebefore)
    },
    // 日程标题 传递给日历组件
    changeTitle (data) {
      this.headerTitle = data
    },
    // 展开日程
    openAgenda () {
      this.calendarShow = 'SpCalendar'
      this.headerType = 'calendar'
      this.calendarTime.start = moment().format('YYYY-MM-DD')// 日历查询开始时间
      this.calendarTime.end = moment().format('YYYY-MM-DD')// 日历查询结束时间
      this.currentTab = '5'
    },
    // 收起日程
    closeAgenda () {
      this.headerType = 'meeting'
      this.calendarShow = 'nav'
      this.calendarTime.start = ''// 日历查询开始时间
      this.calendarTime.end = ''// 日历查询结束时间
      this.currentTab = '0'
    },
    // 选择日程
    targetDay (val) {
      this.calendarTime.start = val[0]
      this.calendarTime.end = val[0]
      this.getmeetingList = { Monitor: !this.getmeetingList.Monitor, type: 'calendar' }
    },
    getSearchaDate (val) {
      // 检索
      let vm = this
      if (vm.summaryInfo !== val) {
        if (!val || val.match(/^[ ]*$/)) {
          vm.searchsTitle = this.$t('searchTopics') // :: 搜索会议主题
          vm.summaryInfo = ''
        } else {
          vm.searchsTitle = val
          vm.summaryInfo = val
        }
      }
    },
    refreshMeetingList () {
      // 刷新会议列表
      this.getmeetingList = { Monitor: !this.getmeetingList.Monitor, type: 'calendar' }
    },
    switchNav (data) {
      this.currentTab = data
    },
    loadingState (data) {
      // loading状态
      this.loading = data
    },
    // wx config
    wxconfig () {
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
    },
    // 扫一扫
    scanCode () {
      let vm = this
      wx.scanQRCode({
        desc: 'scanQRCode desc',
        needResult: 1, // 默认为0，扫描结果由企业微信处理，1则直接返回扫描结果，
        scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是条形码（一维码），默认二者都有
        success: function (res) {
          let result = res.resultStr
          let roomId
          try {
            roomId = result ? (JSON.parse(result).room || '') : ''
          } catch (err) {
            roomId = ''
          }
          if (!roomId) {
            // alert('很抱歉，此会场不可用')
            vm.$Dialog.alert({
              message: '很抱歉，此会场不可用'
            }).then(() => {
              // on close
            })
            return false
          }
          vm.$router.push({
            name: 'meeting.create',
            query: {
              roomId: roomId
            }
          })
        },
        error: function (res) {
          if (res.errMsg.indexOf('function_not_exist') > 0) {
            alert('版本过低请升级')
          }
        }
      })
      wx.error(function (res) {
        alert('出错了：' + res.errMsg)
      })
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
