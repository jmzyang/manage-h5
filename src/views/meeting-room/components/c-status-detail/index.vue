<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .card-meeting-room-status-detail(@click.self="close", style="animation-duration: 0.3s")
    .con-wrap
      .header
        h2 {{$t('placeOccupancySituation')}}
        //- :: 会场占用详情      
      Scroll.main(v-loading="loading")
        van-collapse(v-model="activeName", accordion, :border="false")
          template(v-for="(item, index) in infoData")
            van-collapse-item(:title="item.METTING_ORG_NAME || $t('wholeCountry') + ' - ' + item.ROOM_NAME", :name="index", class="group-title")
              //- :: 全国
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
                    span.gray {{item.POST_NAME}}
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
  name: 'CardMeetingRoomStatusDetail',
  props: {
    transition: {
      type: [Array],
      default: ()=> ['fade', 'fadeIn', 'fadeOut']
    },
    params: {
      type: [Object],
      default: ()=> {}
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
        service: 'M4002013',
        ROOMID_STR: vm.params.rooms,
        MEETING_DATE: vm.params.MEETING_DATE,
        START_DATE: vm.params.START_DATE,
        END_DATE: vm.params.END_DATE,
        mask: false
      }]
      let result = await vm.$ajaxRequest(options, () => {
        vm.loading = false
      })
      if (result.code === '0') {
        vm.infoData = result.data
      } else {
        vm.$Notify(result.msg)
      }
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
