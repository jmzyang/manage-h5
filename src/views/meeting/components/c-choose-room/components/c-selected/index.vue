<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .selected-box(style="animation-duration: 0.5s", @click.self="close")
    .selected-container
      .selected-header
        .header-content
          | {{$t('selectedVenue')}}
          //- 已选会场
        .close(@click="close")
          i.iconfont.icon-close
      .selected-main
        .selected-list(v-for="room in storeMeetingRoom" :key="room.ROOM_ID")
          .selected-name
            | {{room.ROOM_NAME}}
          //- .selected-number
          //-   | {{room.CAPACITY+"人"}}
          //- .selected-equipment
          //-   .equipment
          //-     | {{room.ROOM_EQUIPMENT | meetingRoomEquipment(meetingRoomEquipmentsAlias)}}
          .selected-delete(@click="selectSingle(room)")
            i(class="iconfont icon-selected-delete")
      .selected-actions
        button.clear(@click.stop="clear") {{$t('empty')}}
        //- :: 清空
        button.submit(@click.stop="submit") {{$t('determine')}}
        //- :: 确定
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    transition: {
      type: [Array],
      default: ()=> ['fade', 'fadeIn', 'fadeOut']
    },
    // 会议开始时间
    startTime: {
      type: [String],
      default: ''
    },
    // 会议持续时长
    duration: {
      type: [Number],
      default: 30
    },
    // 会议类型，1：即时 2：预约，3：周期
    meetingType: {
      type: [String],
      default: '2'
    },
    ignoreCheckRoom: {
      type: [Boolean],
      default: true
    },
    mutation: {
      type: [String],
      default: ''
    }, 
    stateName: {
      type: [String],
      default: ''
    }
  },
  computed: {
    ...mapState({
      // meetingRoomEquipmentsAlias: (state) => state.common.meetingRoomEquipmentsAlias,
      storeMeetingRoom (state)  {
        return state.meeting[this.stateName]
      }
    })
  },
  methods: {
    close () {
      // 点重置
      this.$emit('close')
    },
    selectSingle (item) {
      this.$store.commit(this.mutation, {
        ignoreCheckRoom: this.ignoreCheckRoom,
        meetingType: this.meetingType,
        timeRange: {
          startTime: this.startTime,
          duration: this.duration
        },
        type: 'delete',
        value: [item]
      })
    },
    clear () {
      this.$store.commit(this.mutation, {
        ignoreCheckRoom: this.ignoreCheckRoom,
        meetingType: this.meetingType,
        timeRange: {
          startTime: this.startTime,
          duration: this.duration
        },
        type: 'clear'
      })
    },
    submit () {
      this.$emit(`submit`)
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
