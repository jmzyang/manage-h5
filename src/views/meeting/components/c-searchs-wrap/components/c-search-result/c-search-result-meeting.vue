<template lang="pug">
  .searchs-content
    Details(v-if="detailsState" @closDetails="detailsState=false")
    .header
      .back(@click="back")
        i.iconfont.icon-arrow-left.arrow-left
        | {{$t('close')}}
        //- :: 关闭
      .input-content
        i(class="iconfont icon-search")
        input(
          type="search"
          :placeholder="placeholderTitle"
          maxlength="40"
          v-model="inputValue"
          ref="searchsInput"
          :focus="focusStatus"
          @keyup="TargetContent")
      .icons(@click="search")
        | {{$t('search')}}
        //- :: 搜索
    Scroll.room-card-scroll(v-loading="loading")
      .room-card-container
        .room-card(
          v-for="item in roomsData"
          :class="{'selected': (+item.STATUS === 2 || ignoreCheckRoom) && item.checked, 'can-not': +item.STATUS === 0 && !ignoreCheckRoom, 'used': +item.STATUS === 1 && !ignoreCheckRoom, 'lock': +item.STATUS === 3 && !ignoreCheckRoom}"
          @click="handlerSelect(item)")
          .item-header
            .nanme {{item.ROOM_NAME}}
            .number {{item.CAPACITY}}{{$t('people')}}
          .item-meta
            .equipment
              | {{item.ROOM_EQUIPMENT | meetingRoomEquipment(meetingRoomEquipmentsAlias)}}
          .status(v-if="item.checked")
            i.iconfont.icon-selected
          .actions-detail(
            v-if="+item.STATUS === 1"
            @click="cardDetailSwitch(true, item)")
            span {{$t('details')}}
            //- :: 详情
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_COMMON from '@/stores/common/types'
import * as TYPES_MEETING from '@/stores/meeting/types'

import { getDataByKey } from '@/utils/array'

import Details from '@/views/meeting/components/c-details'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  components: {
    Details,
    Scroll
  },
  created () {
    this.search()
  },
  data () {
    return {
      focusStatus: false,
      loading: false,
      inputValue: this.params.searchKey, // 输入框内容
      roomsData: [],
      checkStateList: {}, // 当前会场列表的选中状态列表 '':未选中 selectionRoom:已选中 occupyRoom:已占用
      detailsState: false, // 展示详情
      businessType: this.$route.params.businessType,
      videoConference: this.$route.params.videoConference,
      meetingType: this.$route.params.meetingType,
      startTime: this.$route.params.startTime,
      duration: this.$route.params.duration,
      stateName: this.$route.params.stateName,
      mutation: this.$route.params.mutation,
      meetingId: this.$route.params.meetingId,
      placeholderTitle: this.placeholder || this.$t('searchTopics'), // :: 搜索会议主题
    }
  },
  mounted () {
    // this.$refs.searchsInput.focus()
  },
  props: {
    placeholder: {
      type: [String],
      default: ''
    },
    params: {
      type: [Object],
      default () {
        return {
          searchBy: 1,
          searchKey: ''
        }
      }
    }
  },
  directives: {
    // focus: {
    //   bind: function (el) {
    //     el.focus()
    //   }
    // }
  },
  computed: {
    // 不需要校验会场是否可用
    ignoreCheckRoom () {
      return +this.businessType === 2
    },
    ...mapState({
      orgRoot: (state) => state.common.orgMeetingRoom,
      meetingRoomEquipmentsAlias: (state) => state.common.meetingRoomEquipmentsAlias,
      storeMeetingRoom (state)  {
        return state.meeting[this.stateName]
      }
    })
  },
  watch: {
    // 监听已选会场
    storeMeetingRoom (val) {
      this.roomsData.forEach((item, index) => {
        if (+item.STATUS === 2 || this.ignoreCheckRoom) {
          let _index = val.findIndex(row => +item.ROOM_ID === +row.ROOM_ID)
          this.$set(this.roomsData[index], 'checked', _index > -1 ? true : false)
        }
      })
    },
  },
  methods: {
    selectRoomType (roomType) {
      if (roomType === -1) {
        this.targetRoom = roomType
        this.getHotRoom()
      } else {
        this.targetRoom = roomType.ORG_ID
        this.headerTitle = `${roomType.ORG_NAME}${this.$t('of')}${this.$t('conferenceHall')}`
        this.getRoomByOrg(roomType.ORG_ID)
      }
    },
    async search () {
      if (this.params.searchBy === 1) { 
        // 按会场名称搜
        // 前置校验
        if ((+this.businessType === 1 || +this.businessType === 0) && (!this.startTime || !this.duration)) {
          // this.$Notify(`请选择时间`)
          return false
        }
        this.loading = true
        this.roomsData = []
        let result = await this.$ajaxRequest({
          mask: false,
          metting_type: 2, // 2表示预约会议
          page: 1,
          pagecount: 9999,
          metting_startTime: this.startTime,
          duration: this.duration,
          room_name: this.inputValue,
          service: 'P1202582'
        }, () => {
          this.loading = false
        })
        // 数据处理
        if (+result.code === 0) {
          this.getRoomCallback(result.data)
        }
      }
    },
    getRoomCallback (data) {
      let list = data.map(item => {
        if (+item.STATUS === 2 || this.ignoreCheckRoom) {
          let _index = this.storeMeetingRoom.findIndex(row => +item.ROOM_ID === +row.ROOM_ID)
          item.checked = (_index > -1 ? true : false)
        }
        return item
      })
      this.roomsData = JSON.parse(JSON.stringify(list))
    },
    // 锁定会场
    async lockMeetingRoomAdd (_room) {
      console.log(`lockMeetingRoomAdd`, +this.meetingType, _room)
      // 判断会场长度
      if (_room.length === 0) {
        return false
      }
      // 入参
      let options
      // 预约会议
      if (+this.meetingType === 1 || +this.meetingType === 2) {
        options = {
          service: 'M4005101',
          METTING_STARTTIME: this.startTime,
          DURATION: this.duration,
          ROOM_ID: getDataByKey(_room, 'ROOM_ID').join(','),
          mask: false
        }
        let result = await this.$ajaxRequest(options)
        console.log(`lockMeetingRoomAdd`, result)
      }
    },
    // 锁定会场-时间修改
    async lockMeetingRoomEdit (_room, _time) {
      let options
      // 判断新老时间是否有值
      if (!_time.val || !_time.oldVal || _room.length === 0) {
        return false
      }
      // 预约会议
      if (+this.meetingType === 1 || +this.meetingType === 2) {
        options = {
          service: 'M4005305',
          METTING_STARTTIME: _time.val.startTime,
          DURATION: _time.val.duration,
          ROOM_ID: getDataByKey(_room, 'ROOM_ID').join(','),
          OLD_METTING_STARTTIME: _time.oldVal.startTime,
          OLD_DURATION: _time.oldVal.duration,
          mask: false
        }
        let result = await this.$ajaxRequest(options)
        console.log(`lockMeetingRoomEdit`, result)
      }
    },
    TargetContent (e) {
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.$refs.searchsInput.blur()
          this.search()
        }
      }
    },
    back () {
      // this.$emit('back')
      this.$router.go(-1)
    },    
    handlerSelect (_item) {
      // 可选状态才改变
      if (+_item.STATUS !== 2 && !this.ignoreCheckRoom) {
        return false
      }
      const TYPE = _item.checked ? 'delete' : 'concat'
      if (TYPE === 'concat') {
        if (+this.videoConference === 2) {
          this.$store.commit(TYPES_MEETING[this.mutation], {
            ignoreCheckRoom: this.ignoreCheckRoom,
            meetingType: this.meetingType,
            timeRange: {
              startTime: this.startTime,
              duration: this.duration
            },
            oldVal: this.storeMeetingRoom,
            value: [_item]
          })
        } else {
          !this.ignoreCheckRoom && this.lockMeetingRoomAdd([_item])
          this.$store.commit(TYPES_MEETING[this.mutation], {
            ignoreCheckRoom: this.ignoreCheckRoom,
            meetingType: this.meetingType,
            timeRange: {
              startTime: this.startTime,
              duration: this.duration
            },
            type: 'concat',
            value: [_item]
          })
        }
      } else {
        this.$store.commit(TYPES_MEETING[this.mutation], {
          ignoreCheckRoom: this.ignoreCheckRoom,
          meetingType: this.meetingType,
          timeRange: {
            startTime: this.startTime,
            duration: this.duration
          },
          type: 'delete',
          value: [_item]
        })
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './c-search-result-meeting.styl'
</style>
