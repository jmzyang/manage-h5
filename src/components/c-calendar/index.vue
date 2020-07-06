<template lang="pug">
.calendar(:class="calendarClass")
  .calendar-header
    span.calendar-week-label.weekend {{$t('day')}}
    //- :: 日
    span.calendar-week-label(v-for="item in dayLabels")
      | {{item}}
    span.calendar-week-label.weekend {{$t('six')}}
    //- :: 六
  .calendar-body(v-show="isWeeklyCalendar === 'month'")
    swipe(
      class="calendar-swipe", 
      :allowTouchMove="false", 
      :defaultIndex="defaultIndex", 
      :auto="0", 
      :continuous="false", 
      :showIndicators="false", 
      @change="handelChange", 
      ref="swipeCalendar"
    )
      swipe-item(v-for="(item, index) in days")
        .calendar-grids
          template(v-for="(item2, index2) in item.days")
            .calendar-grid(@click.stop="selectDate(item2)")
              .calendar-day-wrap(:class="{'calendar-grid-disabled': item2.disabled, 'calendar-grid-before': item2.isBefore, 'calendar-grid-start': !item2.disabled && selectedDays[0] == item2.datetime, 'calendar-grid-end': !item2.disabled && selectedDays[1] == item2.datetime && multiple, 'unmultiple': !multiple, 'calendar-grid-range': !!rangedDays[item2.datetime]}")
                span.calendar-day(:class="{'c-green': item2.isToday}") {{item2.date}}
                span.calendar-day-note {{multiple && !item2.disabled && selectedDays[0] == item2.datetime ? startLabelVal : !item2.disabled && selectedDays[1] == item2.datetime ? endLabelVal : ''}}
                span.calendar-day-has-meeting(v-if="item2.meetingStatus === 1" :class="{'ios-styl':targetSystem === 'IOS'}")
  .calendar-grids(v-show="isWeeklyCalendar === 'week'" style="display:block;transform:none;")
    template(v-for="(item3, index3) in weeks")
      .calendar-grid(@click.stop="selectDate(item3)")
        .calendar-day-wrap(:class="{'calendar-grid-disabled': item3.disabled, 'calendar-grid-before': item3.isBefore, 'calendar-grid-start': !item3.disabled && selectedDays[0] == item3.datetime, 'calendar-grid-end': !item3.disabled && selectedDays[1] == item3.datetime && multiple, 'unmultiple': !multiple, 'calendar-grid-range': !!rangedDays[item3.datetime]}")
          span.calendar-day(:class="{'c-green': item3.isToday}") {{item3.date}}
          span.calendar-day-note {{multiple && !item3.disabled && selectedDays[0] == item3.datetime ? startLabelVal : !item3.disabled && selectedDays[1] == item3.datetime ? endLabelVal : ''}}
          span.calendar-day-has-meeting(v-if="item3.meetingStatus === 1" :class="{'ios-styl':targetSystem === 'IOS'}")
  .calendar-bottom(@click="weekOrMonthSwitch")
    i.iconfont.icon-arrow-bottom(v-show="isWeeklyCalendar === 'week'")
    i.iconfont.icon-arrow-top(v-show="isWeeklyCalendar === 'month'")
</template>

<script>
import moment from '@/commons/moment'
import { mapState } from 'vuex'
import * as TYPES_CALENDAR from '@/stores/calendar/types'
import { setTimeout } from 'timers';
export default {
  name: 'SpCalendar',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    // 渲染开始日期
    renderDate: {
      type: [String],
      default: moment().format('YYYY-MM-DD')
    },
    // 是否多选
    multiple: {
      type: [String, Boolean],
      default: true
    },
    // 一次渲染几个月
    duration: {
      type: [String, Number],
      default: 12
    },
    // 业务类型 1：会议日程列表, 2:会场创建会议日程及周日历
    businessType: {
      type: [String, Number],
      default: 1
    },
    // 时间类型
    dateType: {
      type: [String, Number],
      default: ''
    },
    // 禁用哪个时间段的回调函数
    disabledDate: {
      type: Function,
      default: () => { }
    },
    // 是否是以前的日期
    isBeforeDate: {
      type: Function,
      default: () => { }
    },
    startLabel: {
      type: String,
      default: ''
    },
    endLabel: {
      type: String,
      default: ''
    },
    // 是否展示日期滚动选择
    isChoice: {
      type: String,
      default: 'false'
    },
    // 是否完全展开日历
    isOpen: {
      type: String,
      default: 'true'
    }
  },
  computed: {
    defaultIndex () {
      let result = 0
      if (+this.businessType === 1 && this.duration) {
        result = +this.duration
      }
      return result
    },
    ...mapState({
      days: state => state.calendar.days,
      selectedDays: state => state.calendar.selectedDays,
      rangedDays: state => state.calendar.rangedDays,

      weeks: state => state.calendar.weeks,
      rollingData: state => state.calendar.calendarScroll
    })
  },
  data () {
    return {
      calendarClass: '',
      MONTH_LABELS: [
        this.$t('one'),
        this.$t('two'),
        this.$t('three'),
        this.$t('four'),
        this.$t('five'),
        this.$t('six'),
        this.$t('seven'),
        this.$t('eight'),
        this.$t('nine'),
        this.$t('ten'),
        this.$t('eleven'),
        this.$t('twelve')
      ],
      dayLabels: [this.$t('one'), this.$t('two'), this.$t('three'), this.$t('four'), this.$t('five')],
      currentYearMonth: '',
      initialPosition: 0,
      isWeeklyCalendar: 'month', // month：月日历，week：周日历
      targetMonth: moment().format(`YYYY${this.$t('year')}M${this.$t('month')}`), // 当前月
      targetSystem: 'Android',
      startLabelVal: this.startLabel || this.$t('start'),
      endLabelVal: this.endLabel || this.$t('over')
    }
  },
  mounted () {
    // 判断系统
    if (!!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
　　　　this.targetSystem = 'IOS'
    }
    // 初始化相关数据
    this.initDates()
    this.initWeekDates(this.renderDate)
    this.updateDays(this.value)
    this.resizeHeight(this.days[this.defaultIndex].days.length)
    this.$nextTick(()=> {
      // 业务类型为会议列表时调用此查询接口
      if (+this.businessType === 1) {
        this.updateMeetingStatus(this.defaultIndex)
      }
    })
  },
  methods: {
    selectDate (item) {
      if (!item.disabled) {
        this.$store.commit(TYPES_CALENDAR.C_CALE_SELECT_DAYS, {
          params: {
            item,
            multiple: this.multiple
          }
        })
        try {
          this.$emit('selectCallback', this.resolveCalendarDyasIndex(item))
        } catch (e) {}
      }
      if (this.multiple && this.selectedDays.length > 1) {
        this.$emit('select', this.selectedDays.slice(0))
        return
      }
      if (!this.multiple) {
        this.$emit('select', this.selectedDays)
      }
      this.initWeekDates(this.selectedDays[0])
    },
    initDates () {
      this.$store.commit(TYPES_CALENDAR.C_CALE_INIT_DAYS, {
        params: {
          duration: this.duration,
          renderDate: this.renderDate,
          disabledDate: this.disabledDate,
          isBeforeDate: this.isBeforeDate,
          businessType: this.businessType
        }
      })
    },
    initWeekDates (targetTime) {
      if(this.isWeeklyCalendar !== 'week'){
        this.$store.commit(TYPES_CALENDAR.C_CALE_INIT_WEEKS, {
          params: {
            renderDate: targetTime, // 当前开始日期
            isBeforeDate: this.isBeforeDate, // 是否是以前的日期
          }
        })
      }
    },
    updateDays (arr) {
      this.$store.commit(TYPES_CALENDAR.C_CALE_SELECTED_DAYS, {
        oper: 'update',
        params: arr
      })
    },
    // 更新日程会议状态
    async updateMeetingStatus (index) {
      let monthTime = ''
      let weekStarTime = ''
      let weekEndTime = ''
      let vm = this
      if(index){
        let _currerntMonth = (+this.days[index]['month'] + 1).toString().split('')
        let currerntMonth = _currerntMonth.length < 2 ? _currerntMonth.unshift(`0`) && _currerntMonth.join('') : _currerntMonth
        monthTime = `${this.days[index]['year']}${currerntMonth}`
      }else{
        weekStarTime = moment(this.weeks[0].datetime).format('YYYYMMDD')
        weekEndTime = moment(this.weeks[this.weeks.length - 1].datetime).format('YYYYMMDD')
      }
      let req = [
        {
          service: "P1202669",
          metting_startTime: monthTime,// 会议类型
          startTime: weekStarTime, // 周开始时间
          endTime: weekEndTime, // 周结束时间
          mask: false // 禁用全局菊花
        }
      ]
      let result = await vm.$ajaxRequest(req)
      // 请求成功之后回调事件
      this.$store.commit(TYPES_CALENDAR.C_CALE_U_MEETING_STATUS, {
        daysIndex: index,
        meeting: result.data
      })
    },
    deleteDays () {
      this.$store.commit(TYPES_CALENDAR.C_CALE_SELECTED_DAYS, {
        oper: 'delete'
      })
    },
    // swipe切换监听
    handelChange (index, oldIndex) {
      let title = `${this.days[index].year}${this.$t('year')}${this.days[index].month + 1}${this.$t('month')}`
      // :: 年，:: 月
      this.currentYearMonth = `${this.days[index].year}-${this.days[index].month + 1}`
      this.resizeHeight(this.days[index].days.length)
      this.targetMonth = title
      this.$emit(`changeTitle`, title)
      // 业务类型为会议列表时调用此查询接口
      if (+this.businessType === 1) {
        this.updateMeetingStatus(index)
      }
    },
    // 改变日历容器高度
    resizeHeight (_length) {
      this.calendarClass = `c${Math.ceil(_length / 7)}`
    },
    // 外部引用swipe事件
    goToIndex (_index) {
      this.$refs.swipeCalendar.goto(_index)
    },
    // 组件内部调用，返回周日历当前日期索引
    resolveCalendarDyasIndex (_day) {
      let result = 0
      let days = []
      this.days.forEach((item, index) => {
        item.days.forEach((itemDay, indexDay) => {
          if (itemDay.datetime && !itemDay.isBefore) {
            days.push(itemDay)
          }
        })
      })
      result = days.findIndex((item) => item.datetime === _day.datetime)
      return result
    },
    // 展开（月）收起（周）
    weekOrMonthSwitch () {
      console.log()
      if(this.isWeeklyCalendar === 'week'){
        this.$emit(`changeTitle`, this.targetMonth)
        this.calendarClass = ''
        this.isWeeklyCalendar = 'month'
      }else{
        this.updateMeetingStatus()
        this.$emit(`changeTitle`, moment(this.weeks[0].datetime).format(`YYYY${this.$t('year')}M${this.$t('month')}`))
        // :: 年，:: 月
        this.calendarClass = 'c1'
        this.isWeeklyCalendar = 'week'
      }
    },
  },
  watch: {
    rollingData (val) {
      return false
      if(val.end){
        console.log(val.rollingVal, this.initialPosition)
        if(this.initialPosition - val.rollingVal > 200){
          this.calendarClass = 'c1'
          setTimeout(() => {
            this.isWeeklyCalendar = 'week'
          },500)
        }else if(val.rollingVal - this.initialPosition > 300){
          this.calendarClass = 'c6'
          this.isWeeklyCalendar = 'month'
        }
        this.initialPosition = val.rollingVal
      }else{
        console.log(val.rollingVal, this.initialPosition, val.rollingVal - this.initialPosition)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import './index.styl'
</style>
