<template lang="pug">
.layout-header(:class="{ 'border': border, 'meetingList': layout === 'meeting' }")
  template(v-if="layout === 'default'")
    slot
  template(v-if="layout === 'title'")
    .title
      | {{title}}
      slot
    i.icon-header-back.iconfont.back(@click="toBack" v-if="back")
    i.icon-header-close.iconfont.close(@click="handlerClose" v-if="close")
    slot(name="actions")
  template(v-if="layout === 'meeting'")
    .calendar(@click="calendarClick")
      i(class="iconfont icon-calendar")
    .search
      .label(:class="{'placeholder': true}" @click="searchClick")
        i(class="iconfont icon-search")
        | {{searchTitle}}
    .scan(@click='scanClick')
      i(class="iconfont icon-scan")
    notice
  template(v-if="layout === 'my'")
    div(style="flex-grow: 1;")
    notice(class="my")
  template(v-if="layout === 'calendar'")
    .return(@click="returnClick")
      i(class="iconfont icon-arrow-left")
    .title
      | {{title}}
</template>

<script>
import notice from '@/components/c-notice'
export default {
  name: 'BarHeader',
  components: {
    notice
  },
  props: {
    // 布局引用业务类型
    layout: {
      type: [String],
      default: 'title'
    },
    // 标题
    title: {
      type: [String],
      default: ''
    },
    // 搜索默认
    search: {
      type: [String],
      default: ''
    },
    // 是否显示底部边线
    border: {
      type: [Boolean],
      default: false
    },
    // 是否显示返回按钮
    back: {
      type: [Boolean],
      default: false
    },
    // 是否自定义back事件
    backEvent: {
      type: [Boolean],
      default: false
    },
    // 是否显示关闭按钮
    close: {
      type: [Boolean],
      default: false
    }
  },
  data () {
    return {
      searchTitle: this.search || this.$t('searchTopics')
    }
  },
  watch:{
    search (val) {
      this.searchTitle = val
    }
  },
  mounted () {

  },
  methods: {
    toBack () {
      if (this.backEvent) {
        this.$emit(`back`)
      } else {
        this.$router.go(-1)
      }
    },
    searchClick () {
      this.$emit('search')
    },
    handlerClose () {
      this.$emit(`close`)
    },
    calendarClick() {
      this.$emit('calendar')
    },
    scanClick () {
      this.$emit('scan')
    },
    returnClick() {
      this.$emit('returnClick')
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import './index.styl'
</style>
