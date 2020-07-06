<template lang="pug">
.demo-calendar  
  .demo-calendar-750
    BarHeaderMonth(:title="monthTitle")
    monthCalendar(:disabledDate='disabledDate', businessType="1", :isBeforeDate='isBeforeDate', :multiple="false", v-model='selectedDays', @changeTitle="changeTitle" )
</template>

<script>
import moment from '@/commons/moment'

import BarHeader from '@/components/c-header'
import SpCalendar from '@/components/c-calendar'

export default {
  computed: {},
  data () {
    return {
      selectedDays: [moment().format('YYYY-MM-DD')],
      monthTitle: '12'
    }
  },
  mounted () {
    this.monthTitle = moment(this.selectedDays[0]).years() + '年' + (moment(this.selectedDays[0]).months() + 1) + '月'
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
    }
  },
  components: {
    BarHeaderMonth: BarHeader,
    BarHeaderDay: BarHeader,
    monthCalendar: SpCalendar,
    dayCalendar: SpCalendar
  }
}
</script>

<style scoped lang="stylus">
@import './index.styl'
</style>
