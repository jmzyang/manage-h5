<template lang="pug">
  .page-wrap.room-state-box
    BarHeader(
        layout="title",
        :back="true",
        :backEvent="true",
        @back="handlerBack")
        | {{barRightTitle}}
    .page-meeting-room-r(ref="pageMeetingRoomR", v-loading="loading")
      .box-selected-rooms
        template(v-if="storeMeetingRoom.length > 0")
          .item(v-for="item in storeMeetingRoom" :key="item.ROOM_ID"  @click="deleteSingle(item)")
            | {{item.ROOM_NAME}}
            .delete
              i(class="iconfont icon-delete" v-if="businessType !== 3")
        .no-data(v-else) {{$t('noChoiceRoom')}}
        //- :: 未选择会场
      .box-calendar(v-show="businessType !== 3")
        .header
          h2 {{$t('meetingDate')}}
          //- :: 会议日期
          .r
            .ele-month(@click="timeVisible = true") 
              | {{showTime}}
              .iconfont.icon-arrow-bottom(v-show="!timeVisible")
              .iconfont.icon-arrow-top(v-show="timeVisible")
      .bar-status-color
        .item.expired {{$t('notAvailable')}}
        //- :: 不可用
        .item.can-use {{$t('free')}}
        //- :: 空闲
        .item.used {{$t('occupy')}}
        //- :: 占用
        .item.selected {{$t('selected')}}
        //- :: 已选
      .box-status-time
        template(v-for="(item, index) in statusData")
          .item(
            :class="{'expired': +item.STATE === 0, 'can-use': +item.STATE === 1, 'used': +item.STATE === 2, 'selected': checkSelectedTime(index)}",
            @click="selectTime(item, index)")
            | {{item.START_STAMP}} - {{item.END_STAMP}}
            .icon-status
              i(class="iconfont icon-selected")
        //- .item.expired 08:00-08:30
        //- .item.can-use 08:00-08:30
        //- .item.used 08:00-08:30
        //- .item.selected 08:00-08:30
    .bar-actions(v-show="businessType !== 3")
      van-button(type="info", size="large", :disabled="loading", @click="submit") {{$t('creatingMeeting')}}
      //- :: 创建会议
    CardMeetingRoomStatusDetail(v-show="detailVisible", :params="detailParams" @close="cardDetailSwitch(false)")
    //- 事件选择器
    van-popup(
      v-model="timeVisible"
      position="bottom")
      van-datetime-picker(
        v-model="startTime"
        type="date"
        :min-date="minDate"
        :formatter="formatterDate"
        :title="$t('chooseStartTime')"
        :show-toolbar="true"
        cancel-button-text=""
        @confirm="datetimeConfirm"
        @cancel="datetimeCancel")
        //- 请选择会议开始时间
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import moment from '@/commons/moment'
import * as utilsArray from '@/utils/array'
import BarHeader from '@/components/c-header'
import ChoosRoom from '@/views/meeting/components/c-choose-room'
import MeetingRoomCalendarMonth from '../c-calendar-month'
import MeetingRoomCalendarDay from '../c-calendar-day'
import CardMeetingRoomStatusDetail from '../c-status-detail'
export default {
  computed: {
    barRightTitle () {
      let result = this.$t('selectedVenue') // :: 已选会场
      const mr = this.$store.state.meeting.meetingRoomSelf
      if (mr.length > 0) {
        result += `（${mr.length}）`
      } else {
        result += `（0）`
      }
      return result
    },
    ...mapState({
      selectedDays: state => state.calendar.selectedDays,
      storeMeetingRoom: state => state.meeting.meetingRoomSelf
    })
  },
  data () {
    return {
      detailVisible: false,
      detailParams: {},
      loading: false,
      selectedDate: this.$t('dateAll'), // :: 全部日期
      selectedDay: '',
      statusData: [],
      selectedTimes: [],
      calendarVisible: false,
      calendarMonthPosition: {},
      timeVisible: false,
      showTime: '',
      minDate: new Date(),
      startTime: '',
      sureStarTime: '',
      formatterDate (type, value) {
        if (type === 'year') {
          return `${value}${this.$t('year')}` // 年
        } else if (type === 'month') {
          return `${value}${this.$t('month')}` // 月
        } else if (type === 'day') {
          return `${value}${this.$t('day')}` // 日
        }
        return value
      },
      businessType: this.$route.query.businessType // 3：会控
    }
  },
  watch: {
    // 监听数据
    statusData (val, oldVal) {
      this.selectedTimes = []
    },
    // 监听选中会场
    storeMeetingRoom: {
      handler: function (val, oldVal) {
        if (val.length > 0 && this.selectedDays && this.selectedDays[0]) {
          this.queryStatus()
        } else {
          this.statusData = []
        }
      },
      // 深度观察监听
      deep: true
    },
    sureStarTime (val, oldVal) {
      this.showTime = moment(val).format('YYYY-MM-DD')
      if (val && this.storeMeetingRoom.length > 0) {
        this.queryStatus()
      } else {
        this.statusData = []
      }
    }
  },
  created () {
    const START_TIME = this.$route.query.startTime || moment().format('YYYY/MM/DD')
    this.showTime = START_TIME
    let t = new Date(moment(START_TIME).format('YYYY/MM/DD')).getTime()
    this.startTime = new Date(t)
    this.sureStarTime = new Date(t)
    this.selectedTimes = this.$route.query.selectedTimes || []
  },
  components: {
    BarHeader: BarHeader,
    ChoosRoom,
    MeetingRoomCalendarMonth,
    MeetingRoomCalendarDay,
    CardMeetingRoomStatusDetail
  },
  methods: {
    handlerBack () {
      if(this.businessType === 3){
        this.$router.push({
          name: 'meeting-control',
          query: {
            ...this.$route.query
          }
        })
      }else{
        this.$router.replace({
          name: 'meetingRoom.index',
          "query": {
            meetingId: '',
            videoConference: 2,
            startTime: this.showTime,
            duration: 0,
            mutation: 'M_MEETING_ROOM_SELF',
            stateName: 'meetingRoomSelf',
            businessType: 2,
            selectedTimes: this.selectedTimes
          },
        })
      }
    },
    datetimeConfirm () {
      this.sureStarTime = this.startTime
      this.timeVisible = false
    },
    datetimeCancel () {
      this.timeVisible = false
    },
    cardDetailSwitch (_val) {
      this.detailVisible = _val
    },
    deleteSingle (item) {
      if(this.businessType !== 3){
        this.$store.commit(TYPES_MEETING.M_MEETING_ROOM_SELF, {
          type: 'delete',
          value: [item]
        })
        this.queryStatus ()
      }
    },
    // 查询状态
    async queryStatus () {
      let vm = this
      vm.loading = true
      const rooms = utilsArray.getDataByKey(vm.storeMeetingRoom, 'ROOM_ID').join(',')
      let options = [{
        service: 'M4002012',
        ROOMID_STR: rooms,
        MEETING_DATE: moment(this.showTime).format('YYYYMMDD'),
        mask: false
      }]
      let result = await vm.$ajaxRequest(options, () => {
        vm.loading = false
      })
      if (result.code === '0') {
        vm.statusData = result.data
      } else {
        vm.$Notify(result.msg)
      }
    },
    // 选择时间
    selectTime (_item, _index) {
      let vm = this
      if (+_item.STATE === 1) {
          // 数据长度
        if(this.businessType === 3){
          return false
        }
        const DATA_LENGTH = vm.selectedTimes.length
        switch (DATA_LENGTH) {
          case 0:
            vm.selectedTimes.splice(0, 1, _index)
            break
          case 1:
            if (_index === vm.selectedTimes[0]) {
              vm.selectedTimes.splice(0, 1, _index)
            } else {
              if (vm.selectedTimes[0] > _index && vm.isCanSelectSelectedTimes([_index, vm.selectedTimes[0]])) {
                vm.selectedTimes.splice(1, 1, vm.selectedTimes[0])
                vm.selectedTimes.splice(0, 1, _index)
              } else if (vm.isCanSelectSelectedTimes([vm.selectedTimes[0], _index])) {
                vm.selectedTimes.splice(1, 1, _index)
              } else {
                vm.selectedTimes.splice(0, 1, _index)
              }
            }
            break
          case 2:
            vm.selectedTimes.splice(0, 2, _index)
            break
        }
      } else if (+_item.STATE === 2) {
        const rooms = utilsArray.getDataByKey(vm.storeMeetingRoom, 'ROOM_ID').join(',')
        this.detailParams = {
          rooms: rooms,
          MEETING_DATE: moment(vm.selectedDays[0]).format('YYYYMMDD'),
          START_DATE: _item.START_DATE,
          END_DATE: _item.END_DATE
        }
        this.detailVisible = true
      }
    },
    // 检测此时间区域能否被连选
    isCanSelectSelectedTimes (_arr) {
      let vm = this
      let oData = [] // 实际数据
      let dData = [] // 理论数据
      for (let i = 0; i < (_arr[1] - _arr[0] + 1); i++) {
        if (+vm.statusData[+_arr[0] + i].STATE === 1)  {
          oData.push(+_arr[0] + i)
        }
        dData.push(+_arr[0] + i)
      }
      return oData.length === dData.length
    },
    // 检测此时间段是否被选中
    checkSelectedTime (_index) {
      let _arr = []
      if (this.selectedTimes.length > 1) {
        for (let i = 0; i < (this.selectedTimes[1] - this.selectedTimes[0] + 1); i++) {
          _arr.push(+this.selectedTimes[0] + i)
        }
      } else {
        _arr = this.selectedTimes
      }
      if (_arr.findIndex(item => item === _index) > -1) {
        return true
      } else {
        return false
      }
    },
    // 处理传递给创会页面的参数
    submit () {
      let vm = this
      let _duration = 0
      if (this.selectedTimes.length === 1) {
        _duration = 30
      } else if (this.selectedTimes.length === 2) {
        _duration = (this.selectedTimes[1] - this.selectedTimes[0] + 1) * 30
      }
      if (!this.storeMeetingRoom.length > 0) {
        this.$Notify({
          message: this.$t('chooseVenue'), // :: 请选择会场
          background: '#ff0000'
        })
        return false
      }
      if (!+_duration > 0) {
        this.$Notify({
          message: this.$t('chooseStartTime'), // :: 请选择会议开始时间
          background: '#ff0000'
        })
        return false
      }
      
      let params = {
        action: 'byMettingRoom',
        startTime: this.showTime + ' ' + this.statusData[this.selectedTimes[0]].START_STAMP + ':00',
        duration: _duration
      }
      vm.$store.commit('M_MEETING_FORM_DATA', {
        type: 'assign',
        value: {
          videoConference: 2,
          startTime: params.startTime,
          duration: params.duration,
          meetingRoom: this.storeMeetingRoom
        }
      })
      this.$router.push({
        name: 'meeting.create'
      })
    },
    returnClose(){
      // 关闭弹框页面
      this.$emit('returnClose', true)
    },
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>

