<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .selected-box(style="animation-duration: 0.5s", @click.self="closePage")
    .selected-container
      .selected-header
        .header-content
          | {{$t('selected')}}
          //- 已选择
          span {{storeMeetingRoom.length}}
          | {{$t('PCS')}}{{$t('conferenceHall')}}
          //- 个会场
        .closePage(@click="closePage")
          i.iconfont.icon-close
      .selected-main
        .selected-list(v-for="room in storeMeetingRoom" :key="room.ROOM_ID")
          .selected-name
            | {{room.ROOM_NAME}}
          .selected-number
            | {{room.CAPACITY}}{{$t('people')}}
          .selected-equipment
            .equipment
              | {{room.ROOM_EQUIPMENT | meetingRoomEquipment(meetingRoomEquipmentsAlias)}}
          .selected-delete
            i(class="iconfont icon-clear" @click="selectSingle(room)")
      .selected-control(@click="selectAll")
        | {{$t('empty')}}
        //- 清空
</template>
<script>
import { mapState } from 'vuex'

export default {
  props: {
    transition: {
      type: [Array],
      default: ()=> ['slide', 'slideInUp', 'slideOutDown']
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
      meetingRoomEquipmentsAlias: (state) => state.common.meetingRoomEquipmentsAlias,
      storeMeetingRoom (state)  {
        return state.meeting[this.stateName]
      }
    })
  },
  methods: {
    closePage () {
      // 点重置
      this.$emit('closeSelected', false)
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
    selectAll () {
      this.$store.commit(this.mutation, {
        ignoreCheckRoom: this.ignoreCheckRoom,
        meetingType: this.meetingType,
        timeRange: {
          startTime: this.startTime,
          duration: this.duration
        },
        type: 'clear'
      })
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
