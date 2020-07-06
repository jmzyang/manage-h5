<template lang="pug">
  .meeting-list-box
    .nav(v-if="calendarShow==='nav'")
      div(
        v-for="(item,index) in navTabDate", 
        v-if="item.type === meetingListType", 
        :class="{targetNav: index == currentNav}", 
        @click="navSwitch(index)"
      ) {{item.name}}
        p
    .empty(v-show="meetingList === 'noRecord'")
      .empty-container
        img(class="img31" src="~@/assets/images/public/noRecord.png")
        .empty-content
          | {{$t('noMeeting')}}
          //- :: 当前没有会议
          p(v-if="meetingListType === 'meetingList'") {{$t('otherDates')}}
          //- :: 先逛逛其他日期的会议吧
    .listContent(v-show="meetingList === 'meeting'")
      Scroll(
        :pullup="true",
        :pulldown="true",
        :beforeScroll="true",
        @scrollToEnd="scrollToEnd",
        @repeatGetData="repeatData",
        :refreshEnd="refreshState",
        :enableRefresh="true"
      )
        .yearList(v-for="(YValue,YIndex) in meetingListData")
          p(v-if="YValue.time != YValue.show && calendarShow === 'nav'") {{YValue.time}}
          .dayList(v-for="(DValue,DIndex) in YValue.data")
            p(v-if="calendarShow==='nav'") {{DValue.time}}
            .listMain(
              v-for="(item,index) in DValue.data",
              :data-code="item.meetingId",
              @click="listClick(YIndex,DIndex,index,item)",
              :class="{sign:item.meetingId === currentList}"
            )
              .mainHeader(:class="item.stateRgb")
                i(v-if="listState.indexOf(item.meetingId) < 0 && meetingListType === 'meetingList' && currentNav == 0")
                .headerLeft {{item.timeSlot}}
                  span {{item.conferenceType}}
                .headerRight(@click.stop='showCheckedStatus(item.state,item)') {{item.state}}
              .mainContent
                | {{item.title}}
              .mainBottom
                i(class="iconfont icon-meeting-form-host" v-if="item.Founder")
                span.name {{item.Founder}}
                i(class="iconfont icon-meeting-form-room" v-if="item.meeting")
                span {{item.meeting}}
</template>
<script>
import Scroll from '@/components/c-scroll/index.vue'
import moment from '@/commons/moment.js'
export default {
  data () {
    return {
      fileUrl: window.location.protocol + '//' + window.location.host + '/fileServer/userIcon/', // 文件服务器路径
      meetingList: 'noRecord', // 会议列表或无会议记录提示
      refreshState: '', // 下拉刷新
      currentList: '', // 会议目标位置
      listState: [], // 查看过的会议
      navTabDate: [
        { name: this.$t('notFinished'), type: 'meetingList' },  // :: 未完成
        { name: this.$t('completed'), type: 'meetingList' },  // :: 已完成
        { name: this.$t('beingReview'), type: 'meetingList' },  // :: 审核中
        { name: this.$t('waitingReview'), type: 'verify' },  // :: 待审核
        { name: this.$t('audited'), type: 'verify' }  // :: 已审核
      ],
      meetingType: '', // 会议类型
      meetingStatus: [0, 1], // 会议状态0：未开始，1：进行中，2：已结束，3：已取消
      shstatus: [0, 3], // 审核状态0：未审核，1：无需审核，2：已通过，3：审核中，4：未通过
      searchsTitle: this.$t('searchTopics'), // 检索框内容 :: 搜索会议主题
      summaryInfo: '', // 主题、创建人、会场名称
      meetingHost: '', // 会议创建人
      curPage: [1, 1, 1, 1, 1, 1], // 页码
      pagesize: [10, 10, 10, 10, 10, 10], // 每页数据条数
      listDate: [[], [], [], [], []], // 会议列表数据
      stateOption: [
        { 0: `${this.$t('notStarted')}`,  // :: 未开始
          1: `${this.$t('underway')}-headerRed`,  // :: 进行中
          2: `${this.$t('end')}-headerGray`,  // :: 已结束
          3: `${this.$t('cancelled')}-headerGray` },  // :: 已取消
        { 0: `${this.$t('waitingReview')}-headerYellow`,  // :: 待审核
          1: `${this.$t('noAuditRequired')}`, // :: 无需审核
          2: `${this.$t('adopted')}-headerGreen`, // :: 已通过
          3: `${this.$t('beingReview')}-headerYellow`, // :: 审核中
          4: `${this.$t('failedPass')}-headerGray` }, // :: 未通过
        { 1: ` [${this.$t('video')}]`, // :: 视频
          2: ` [${this.$t('local')}]` }, // :: 本地
        { 1: this.$t('instantMeeting'), // :: 即时会议
          2: this.$t('appointmentMeeting'), // :: 预约会议
          3: this.$t('cycleMeeting'), // :: 周期会议
          4: this.$t('fixedMeeting') }], // :: 固定会议
      meetingListYearData: [], // 不重复的年
      meetingListData: [], // 会议列表重新编译数据源
      currentNav: this.currentTab, // tab页位置
      calendarStartTime: '', // 日历查询开始时间
      calendarEndtTime: '' ,// 日历查询结束时间
      checkedResult: ''
    }
  },
  components: {
    Scroll
  },
  props: {
    // 获取值变化监听刷新会议列表
    getmeetingList: {
      type: [Object],
      default: () => {}
    },
    // nav：选项卡，SpCalendar：日历
    calendarShow: {
      type: [String],
      default: 'nav'
    },
    // 当前TAB页位置，0：未完成，1：已完成，2：待审核
    currentTab: {
      type: [String, Number],
      default: 0
    },
    // 会议查询时间段
    calendarTime: {
      type: [Object],
      default: () => {
        return { start: '', end: '' }
      }
    },
    // 会议列表类型，verify:会议审核列表，meetingList:会议列表
    meetingListType: {
      type: [String],
      default: 'meetingList'
    }
  },
  watch: {
    // 刷新会议列表
    getmeetingList (val) {
      this.getListData(val.type)
    }
  },
  mounted () {
    if(this.$route.query.searchsVal){
      this.searchValue(this.$route.query.searchsVal)
    }else{
      this.getListData()
    }
    
  },
  beforeRouterLeave(to,from,next) {
    // if (to.name === 'meeting.index') {
      from.meta.keepAlive = false
    // }
    next()
  },
  methods: {
    searchValue (val) {
      this.curPage[this.currentNav] = 1
      if (this.summaryInfo != val) {
        if (!val || val.match(/^[ ]*$/)) {
          this.searchsTitle = this.$t('searchTopics') // :: 搜索会议主题
          this.summaryInfo = ''
        } else {
          this.searchsTitle = val
          this.summaryInfo = val
        }
        this.getListData('searcha')
      }
    },
    scrollToEnd () {
      // 下拉加载
      this.refreshState = ''
      this.curPage[this.currentNav]++
      this.getListData('toEnd')
    },
    repeatData () {
      // 上拉刷新
      let vm = this
      vm.refreshState = ''
      this.curPage[this.currentNav] = 1
      vm.listDate[this.currentNav] = []
      this.getListData('toEnd')
    },
    listClick (YIndex, DIndex, index, item) {
      // 会议列表切换
      let vm = this
      vm.currentList = item.meetingId
      vm.dassignDetails(item)
    },
    navSwitch (index) {
      // 选项卡切换
      let vm = this
      vm.currentNav = index
      vm.$emit('switchNav', vm.currentNav)
      vm.meetingListData = []
      vm.meetingList = 'meeting'// 展示会议列表
      if (vm.searchsTitle == vm.summaryInfo) {
        vm.listDate[vm.currentNav] = []
      }
      if (vm.listDate[index] && vm.listDate[index].length > 0) {
        vm.meetingListData = vm.listDate[index]
      } else {
        vm.getListData('tab')
      }
    },
    async getListData (entrance) {
      // 获取会议列表
      if (entrance === 'calendar' || entrance === 'searcha') {
        this.listDate[this.currentNav] = []
      }
      let vm = this
      if(entrance !== 'toEnd'){
        // 重复加载
        // vm.$emit('loadingState', true)
        vm.$emit('loadingState', false)
      }
      let req = [
        {
          service: vm.meetingListType === 'verify' ? 'M4007001' : 'P1202597',
          metting_type: vm.meetingType, // 会议类型
          completion_status: vm.currentNav == '5' ? '' : vm.currentNav, // 会议类型
          metting_name: vm.summaryInfo, // 主题、创建人、会场名称
          meeting_host: vm.meetingHost, // 创建人
          page: vm.curPage[vm.currentNav], // 页码
          pagecount: vm.pagesize[vm.currentNav], // 单页条数
          metting_startTime: vm.calendarTime.start, // 起始时间
          metting_endTime: vm.calendarTime.end, // 结束时间
          auditing_status: '', // 审核状态
          mask: true // 禁用全局菊花
        }
      ]
      vm.meetingList = 'meeting'// 展示会议列表
      let result = await vm.$ajaxRequest(req, () => {
        vm.$emit('loadingState', false)
      })
      if (result.code === '0' && result.data.length > 0) {
        vm.analyticalData(result)
      } else if (vm.searchsTitle == vm.summaryInfo && entrance !== 'toEnd' || entrance === 'tab' || entrance === 'calendar') {
        vm.meetingListData = []
        vm.meetingList = 'noRecord'
        vm.curPage[this.currentNav]--
      } else if (entrance === 'toEnd') {
        vm.refreshState = '2'
      } else if (vm.curPage[this.currentNav] > 1) {
        vm.curPage[this.currentNav]--
      }else{
        vm.meetingList = 'noRecord'
      }
    },
    analyticalData (result) {
      // 重组数据
      let vm = this
      vm.meetingListData = this.listDate[this.currentNav]
      let day = []// 不重复的会议日期
      let datas = []// 重勾的会议数据数组
      let daySyaye = true// 是新增天数还是已有天数
      result.data.forEach((element, index) => {
        if (!element.METTING_ENDTIME) {
          element.METTING_ENDTIME = ' '
        }
        if (!element.METTING_STARTTIME) {
          element.METTING_STARTTIME = ' '
        }
        if (vm.listState.indexOf(element.METTING_ID) < 0 && element.UNREAD == '1') { // 已读会场
          vm.$set(vm.listState, vm.listState.length, element.METTING_ID)
        }
        let time = element.METTING_STARTTIME.split(' ')[1]
        let time2 = element.METTING_ENDTIME.split(' ')[1]
        if (day.indexOf(element.METTING_STARTTIME.split(' ')[0]) === -1) { // 年月日
          vm.$set(day, day.length, element.METTING_STARTTIME.split(' ')[0])
        }
        if (vm.meetingListYearData.indexOf(element.METTING_STARTTIME.split(' ')[0].substring(0, 4)) === -1) { // 年份
          vm.$set(vm.meetingListYearData, vm.meetingListYearData.length, element.METTING_STARTTIME.split(' ')[0].substring(0, 4))
        }
        let stateVal = null
        let stateRgbVal = null
        if (vm.meetingListType === 'verify' || vm.currentNav == 2) { // 如果是审核列表
          vm.stateOption[1][0] = vm.currentNav == 2?`${this.$t('waitingReview')}-headerYellow` : `${this.$t('notAudited')}-headerYellow` // :: 待审核、::未审核
          let verifyState = vm.stateOption[1][element.AUDITING_STATUS]
          stateVal = verifyState?verifyState.split('-')[0]:this.$t('undefined') // 审核列表状态 ::未定义
          stateRgbVal = verifyState?verifyState.split('-')[1]:'headerGray' // 审核列表状态颜色
        } else if(vm.currentNav == 5 && element.AUDITING_STATUS == '0' && element.METTING_STATUS == 0 || element.AUDITING_STATUS == '4' && element.METTING_STATUS == 0){ // 日程会议列表未开始未审核
          let verifyState = vm.stateOption[1][element.AUDITING_STATUS]
          stateVal = verifyState?verifyState.split('-')[0]:this.$t('undefined') // 审核列表状态 ::未定义
          stateRgbVal = verifyState?verifyState.split('-')[1]:'headerGray' // 审核列表状态颜色
        }else{ // 会议列表
          let meetingState = vm.stateOption[0][element.METTING_STATUS]
          stateVal = meetingState?meetingState.split('-')[0]:this.$t('undefined') // 会议列表状态 ::未定义
          stateRgbVal = meetingState?meetingState.split('-')[1]:'headerGray' // 会议列表状态颜色
        }
        if(element.CHUANGJIANREN.length > 2){
          let len = element.CHUANGJIANREN.length
          element.CHUANGJIANREN2 = element.CHUANGJIANREN.substring(len - 2, len)
        }else{
          element.CHUANGJIANREN2 = element.CHUANGJIANREN
        }
        vm.$set(datas, datas.length, {
          timeSlot: time.substring(0, 5) + ' - ' + time2.substring(0, 5), // 会议时间
          titleSlot: moment(element.METTING_STARTTIME).format('a'), // 会议开始时段
          state: stateVal, // 会议状态
          stateRgb: stateRgbVal, // 会议状态颜色
          title: element.METTING_NAME, // 会议标题
          Founder: element.CHUANGJIANREN, // 会议主持人
          userImg: element.USER_ICON ? vm.fileUrl + element.USER_ICON : '', // 会议主持人头像
          userImg2: element.CHUANGJIANREN2, // 兜底头像
          conferenceType: vm.stateOption[2][element.VIDEO_CONFERENCE], // 会议类型
          conferenceNumber: element.ZONGSHU + '人', // 参会人数
          time: element.METTING_STARTTIME.split(' ')[0], // 会议日期
          meetingId: element.METTING_ID, // 会议ID
          founderName: element.CHUANGJIANREN, // 创建人
          unread: element.UNREAD, // 0：未读，1：已读
          type: element.VIDEO_CONFERENCE, // 1：视频会议，2：本地会议
          meeting: element.ROOM_NAME ? element.ROOM_NAME.split(',')[0] : '', // 第一个会场
          Jurisdiction: element.PERMISSION_TYPE,
          waterType: element.WATER_TYPE
        })
      })
      vm.meetingListYearData.forEach(function (value, index) {
        if (!vm.meetingListData[index] || vm.meetingListData[index].time !== value) {
          vm.$set(vm.meetingListData, vm.meetingListData.length, { 'time': value, 'data': [], 'show': new Date().getFullYear() })
        }
        day.forEach(function (value1) {
          if (value1.indexOf(vm.meetingListData[index].time) > -1) {
            let dayDate = []
            datas.forEach(function (value3) {
              if (value3.time === value1) {
                vm.$set(dayDate, dayDate.length, value3)
              }
            })
            daySyaye = true
            vm.meetingListData[index].data.forEach(value2 => {
              if (value2.day === value1) {
                vm.$set(value2.data, value2.data.length, ...dayDate)
                daySyaye = false
              }
            })
            if (daySyaye) {
              vm.$set(vm.meetingListData[index].data, vm.meetingListData[index].data.length, {
                'time': value1.substring(5, value1.length) + ' ' + moment(value1).format('dddd'),
                'day': value1,
                'data': dayDate
              })
            }
          }
        })
      })
      vm.listDate[vm.currentNav] = vm.meetingListData
      vm.refreshState = '1'
    },
    dassignDetails (data) {
      // 会议详情传参
      data = data || {}
      let vm = this
      if (data.meetingId) {
        if (vm.listState.indexOf(data.meetingId) < 0) {
          vm.$set(vm.listState, vm.listState.length, data.meetingId)
        }
        vm.$router.push({
          name: 'meeting-details',
          query: { // 加载会议详情
            meetingId: data.meetingId ? data.meetingId : '', // 会议ID
            founderName: data.founderName ? data.founderName : '', // 创会人名称
            unread: data.unread ? data.unread : '0', // 1：已读，0：未读
            listType: vm.meetingListType, // 列表类型
            currentNav: vm.currentNav, // 列表位置
            Jurisdiction: data.Jurisdiction, // 权限
            waterType: data.waterType // 参会转移
          }
        })
      }
    },
    async showCheckedStatus (status, item) {
      if (status === '未通过') {
       await this.examineHistory(item)
       if(this.checkedResult) {
         this.$Notify({message: this.checkedResult,duration: 3000})
       }
     }
    },
    async examineHistory (item) {
			// 审核记录
			let vm = this;
      let req = [{
				metting_id:item.meetingId,
        service: 'M4005400',
      }];
			let result = await vm.$ajaxRequest(req)
			if (result.code == 0) {
        vm.checkedResult = result.data[0].AUDIT_CONTENT
			} else {
        vm.$Notify({ message: result.msg })
			}
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
