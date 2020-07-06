<template lang="pug">
 Scroll(:scrollX="true", :scrollWidth="scrollWidth", ref="scroll")
  .meeting-room-calendar-day(ref="scrollChildren")
    template(v-for="(item, index) in resolvedDays")
      .item(
        :id="resolveItemId(index)"
        :style="{'width': itemWidth + 'px'}",
        v-if="item.datetime && !item.isBefore",
        :class="{'selected': selectedDays[0] === item.datetime}",
        @click.stop="selectDate(item)")
        .week(v-if="item.isToday") {{$t('today')}}
        //- :: 今天
        .week(v-else) {{item.datetime | dateWeekDay }}
        .date {{item.datetime, 'MM-DD' | dateFilter }}
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CALENDAR from '@/stores/calendar/types'

import moment from '@/commons/moment'
import * as $dom from '@/commons/dom'

import BarHeader from '@/components/c-header'
import SpCalendar from '@/components/c-calendar'
import Scroll from '@/components/c-scroll/index.vue'

export default {
  name: 'MeetingRoomCalendarDay',  
  computed: {
    scrollWidth () {
      let result = 0
      const days = this.resolveDays(this.$store.state.calendar.days)
      if (this.itemWidth > 0 && days.length > 0) {
        result = this.itemWidth * days.length
      }
      return result
    },
    resolvedDays () {
      let result = this.resolveDays(this.$store.state.calendar.days)
      return result
    },
    ...mapState ({
      days: state => state.calendar.days,
      selectedDays: state => state.calendar.selectedDays,
      rangedDays: state => state.calendar.rangedDays
    })
  },
  data () {
    return {
      monthTitle: '',
      itemWidth: 0
    }
  },
  mounted () {
    // 计算横向滚动容器宽度
    const SCROLLELE = this.$refs.scroll.$el
    this.itemWidth = parseInt($dom.getStyle(SCROLLELE, 'width')) / 7.5
    // 时间显示
    this.monthTitle = moment(this.selectedDays[0]).years() + this.$t('year') + (moment(this.selectedDays[0]).months() + 1) + this.$t('month')
    // :: 年，:: 月
  },
  watch: {
    // 监听选中日期
    selectedDays: {
      handler: function (val, oldVal) {
        if (val.length > 0) {
          // 执行你的动作
        }
      },
      deep: true
    }
  },
  methods: {
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
      this.monthTitle = data
    },    
    selectDate (item) {
      if (!item.disabled) {
        this.$store.commit(TYPES_CALENDAR.C_CALE_SELECT_DAYS, {
          params: {
            item,
            multiple: false
          }
        })
        this.$emit(`swipeCallback`, this.resolveCalendarSwipeIndex(item))
      }
    },
    resolveDays (arr) {
      let result = []
      arr.forEach((item) => {
        item.days.forEach((itemDay, indexDay) => {
          if (itemDay.datetime && !itemDay.isBefore) {
            result.push(itemDay)
          }
        })
      })
      return result
    },
    resolveCalendarSwipeIndex (item) {
      let result = 0
      this.days.forEach((item, index) => {
        item.days.forEach((itemDay, indexDay) => {
          if (itemDay.datetime === this.selectedDays[0]) {
            result = index
          }
        })
      })
      return result
    },
    scrollTo (_index) {
      this.$refs.scroll.scrollToElement(`#calendarDays${_index}`, 300, true)
    },
    resolveItemId (_index) {
      return `calendarDays${_index}`
    }
  },
  components: {
    BarHeaderMonth: BarHeader,
    monthCalendar: SpCalendar,
    Scroll
  }
}
</script>

<style scoped lang="stylus">
@import './index.styl'
</style>
