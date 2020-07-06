<template lang="pug">
.page-wrap.meeting-choose-duration(v-loading="loading")
  BarHeader(
    layout="title",
    :border="true",
    :back="true")
    | {{$route.meta.title}}
  .selection-extend
    van-button.extend(
      type="default",
      v-for="(value,index) in options",
      :key="index",
      :class="{'btnSelection': duration === value && !isInput}",
      @click="duration = value; isInput = false")
      | {{value}}{{$t('minutes')}}
    input.extend(
      :placeholder="$t('custom')",
      @focus="focusInput",
      @blur="blurInput",
      v-model="durationInput",
      :class="{ 'btnSelection': isInput }",
      @input="extendInputRGE",
      maxlength="4")
  .actions
    van-button.submit(type="info", @click="submit") {{$t('determine')}}
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'

import moment from 'moment'
import { getDataByKey } from '@/utils/array'


import BarHeader from '@/components/c-header'

export default {
  computed: {
    ...mapState ({
      storeMeetingFormData: state => state.meeting[state.route.query.stateName],
      meetingRoom (state) {
        let result = state.meeting[state.route.query.stateName].meetingRoom
        return result || []
      }
    })
  },
  data () {
    return {
      // 路由参数
      meetingId: this.$route.query.meetingId || '',
      stateName: this.$route.query.stateName || '',
      mutation: this.$route.query.mutation || '',
      businessType: this.$route.query.businessType || 0,
      isInput: false, // 是否输入框的值
      extendCustom: true, // 延长会议时限选择自选/自定义
      options: [30, 60, 90, 120, 180], // 会议时间选择节点
      duration: 30, // 延长会议选择的时限
      durationInput: '',
      oldDuration: 30,
      loading: false
    }
	},  
  created () {
    console.log(`created`, +this.storeMeetingFormData.duration)
    const DURATION = +this.storeMeetingFormData.duration || 30
    if (this.options.findIndex(item => +item === DURATION) > -1) {
      this.duration = DURATION
      this.oldDuration = DURATION
    } else {
      this.isInput = true
      this.durationInput = DURATION
    }
  },
  components: {
    BarHeader
  },
  methods: {
    handlerBack () {
      switch (+this.businessType) {
        case 0:
          // 创会
          this.$router.replace({
            name: 'meeting.create'
          })
          break
        case 1:
          // 修改会议
          this.$router.replace({
            name: 'meeting.edit',
            params: {
              meetingId: this.meetingId
            }
          })
          break
        default:
          break
      }
    },
    handlerRoute () {
      // 路由跳转
      switch (+this.businessType) {
        case 0:
          // 创会
          this.$router.replace({
            name: 'meeting.create'
          })
          break
        case 1:
          // 修改会议
          this.$router.replace({
            name: 'meeting.edit',
            params: {
              meetingId: this.meetingId
            }
          })
          break
        default:
          break
      }
    },
    // 提交到VUEX
    submit () {
      // 前置判断
      if (this.isInput && !this.durationInput || (!this.isInput && !this.duration)) {
        this.$notify({
          message: this.$t('pleaseFillTime'),  // 请填写时间
          background: '#ff0000'
        })
        return false
      }
      // 赋值到数据管理器
      const DURATION = this.isInput ? this.durationInput : this.duration
      this.$store.commit(TYPES_MEETING[this.mutation], {
        type: 'assign',
        value: {
          duration: DURATION
        }
      })
      // 临时锁定修改
      if (DURATION !== this.oldDuration) {
        this.lockMeetingRoomEdit(DURATION, this.oldDuration)
      } else {
        this.handlerRoute()
      }
    },
    // 锁定会场-时间修改
    async lockMeetingRoomEdit (_duration, _oldDuration) {
      console.log(`lockMeetingRoomEdit`, this.meetingRoom)
      // 深度拷贝下会场
      let meetingRoom = JSON.parse(JSON.stringify(this.meetingRoom))
      console.log(`lockMeetingRoomEdit-JSON`, meetingRoom)
      // 判断是否有会场
      if (meetingRoom.length === 0) {
        this.handlerRoute()
        return false
      }
      // 预约会议
      this.loading = true
      let options = {
        service: 'M4005305',
        metting_id: this.meetingId,
        METTING_STARTTIME: this.storeMeetingFormData.startTime,
        DURATION: _duration,
        ROOM_ID: getDataByKey(meetingRoom, 'ROOM_ID').join(','),
        OLD_METTING_STARTTIME: this.storeMeetingFormData.startTime,
        OLD_DURATION: _oldDuration,
        mask: false
      }
      let result = await this.$ajaxRequest(options, ()=> {
        this.loading = false
      })
      if (+result.code === 0) {        
        let _meetingRoom = JSON.parse(JSON.stringify(this.meetingRoom))
        result.data.forEach(rItem => {
          _meetingRoom = _meetingRoom.filter((item) => {
            return +item.ROOM_ID !== +rItem.ROOM_ID && +rItem.STATUS !== 2
          })
        })
        console.log(`lockMeetingRoomEdit`, _meetingRoom)
        this.$store.commit(this.mutation, {
          type: 'assign',
          value: {
            meetingRoom: _meetingRoom
          }
        })
      }
      this.handlerRoute()
    },
    focusInput(e) {
      this.isInput = true // 标识自定义时间选择
      e.target.removeAttribute('placeholder')
    },
    blurInput(e){
      e.target.setAttribute('placeholder', this.$t('custom')) // 自定义
    },
    // 数字监听
    extendInputRGE () {
      // 延长会议验证
      let vm = this
      let value = vm.durationInput.replace(/\D+/, '')
      if (value == 0) {
        vm.durationInput = ''
      } else if (value > 600) {
        vm.durationInput = 600
      } else {
        vm.durationInput = value ? parseInt(value) : value
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
