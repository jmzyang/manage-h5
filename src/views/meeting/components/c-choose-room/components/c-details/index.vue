<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .card-meeting-room-detail(@click.self.stop="close", style="animation-duration: 0.3s")
    .con-wrap
      .header
        h2 {{params.roomName}}
      Scroll.main(v-loading="loading")
        van-collapse(v-model="activeName", accordion, :border="false")
          template(v-for="(item, index) in infoData")
            van-collapse-item(:title="item.METTING_ORG_NAME || $t('wholeCountry') + ' - ' + item.METTING_NAME", :name="index")
              //- 全国
              .detail
                .item
                  .icon-wrap
                    span.iconfont.icon-meeting-name
                  .text-wrap
                    | {{item.METTING_NAME}}
                .item
                  .icon-wrap
                    span.iconfont.icon-time
                  .text-wrap
                    | {{item.METTING_TIME}}
                .item
                  .icon-wrap
                    span.iconfont.icon-meeting-founder
                  .text-wrap
                    | {{item.USER_NAME}}
                    span.gray {{$t('creator')}}
                    //- :: 创会人
                    //- span.gray {{item.POST_NAME}}
                .item
                  .icon-wrap
                    span.iconfont.icon-phone
                  .text-wrap
                    | {{item.MOBILE}}
      .close(@click.stop="close")
        span.iconfont.icon-close
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
  name: 'CardMeetingRoomDetail',
  props: {
    transition: {
      type: [Array],
      default: () => ['fade', 'fadeIn', 'fadeOut']
    },
    params: {
      type: [Object],
      default: () => {}
    }
  },
  data () {
    return {
      loading: false,
      infoData: [],
      activeName: 0
    }
  },
  components: {
    Scroll
  },
  mounted () {

  },
  watch: {
    params: {
      handler: function (val, oldVal) {
        this.fetchData()
        this.activeName = 0
      },
      deep: true
    }
  },
  methods: {
    // 蒙层关闭
    close () {
      this.$emit(`close`)
    },
    async fetchData () {
      let vm = this
      vm.loading = true
      let options = [{
        service: 'M4002010',
        ROOM_ID: vm.params.ROOM_ID,
        duration: vm.params.duration,
        metting_type: vm.params.metting_type,
        metting_startTime: vm.params.metting_startTime,
        mask: false
      }]
      let result = await vm.$ajaxRequest(options, () => {
        vm.loading = false
      })
      if (result.code === '0') {
        vm.infoData = result.data
      } else {
        vm.$notify(result.msg)
      }
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
