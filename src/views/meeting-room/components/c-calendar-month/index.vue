<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .meeting-room-calendar-month-fixed(@click.self="close")
    .meeting-room-calendar-month-card(:style="{top: position.top + 'px', right: position.right + 'px'}")
      .meeting-room-calendar-month
        BarHeaderMonth(:title="monthTitle")
        monthCalendar(ref="monthCalendar", :disabledDate='disabledDate', businessType="2", :isBeforeDate='isBeforeDate', :multiple="false", v-model='selectedDays', @changeTitle="changeTitle", @selectCallback="selectCallback")
</template>

<script>
import moment from '@/commons/moment'

import BarHeader from '@/components/c-header'
import SpCalendar from '@/components/c-calendar'

export default {
  name: 'MeetingRoomCalendarMonth',
  props : {
    transition: {
      type: [Array],
      default: ()=> ['bounce', 'bounceInRight', 'bounceOutRight']
    },
    position: {
      type: Object,
      default: ()=> {}
    }
  },
  computed: {},
  data () {
    return {
      selectedDays: [moment().format('YYYY-MM-DD')],
      monthTitle: ''
    }
  },
  created() {
    
  },
  mounted () {
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
    // 蒙层关闭
    close () {
      this.$emit(`close`)
    },
    // 月日历选中日期回调事件
    selectCallback (_index) {
      this.$emit(`selectCallback`, _index)
    },
    // 禁止点击日期的规则
    disabledDate (date) {
      // 暂无逻辑的情况下，直接false
      const datebefore = moment().format('YYYY-MM-DD')
      return moment(date).isBefore(datebefore)
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
    // 外部调用 - 月日历跳转事件
    goToIndex (_index) {
      this.$refs.monthCalendar.goToIndex(_index)
    }
  },
  components: {
    BarHeaderMonth: BarHeader,
    monthCalendar: SpCalendar
  }
}
</script>

<style scoped lang="stylus">
@import './index.styl'
</style>
