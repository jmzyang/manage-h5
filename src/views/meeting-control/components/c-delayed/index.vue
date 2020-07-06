<template lang="pug">
  .c-delayed-container
    BarHeader(
      layout="title",
      :back="true",
      :backEvent="true",
      @back="returnControl")
      | {{$t('meetingExtend')}}
      //- 延长会议
    .delayed-main
      .delayed-top
        | {{$t('maxExtend')}}
        //- :: 当前可延长最大时长
        span.time {{canExtendTime}}{{$t('minutes')}}
        //- :: 分钟
        span(v-show="canExtendTime < 360") ,
        span.see(@click="seeRoomState" v-show="canExtendTime < 360") {{$t('clickSee')}}
        //- :: 点击查看
        | {{canExtendTimeTxt}}
      .delayed-middle
        van-button.extend(type="default", v-for="(value,index) in extendOption", :key="index", :class="{'btn-selection':extendBtn == value, 'btn-prohibit':canExtendTime < value}", @click="selectExtend(value)")
          | {{value}}{{$t('minutes')}}
          //- :: 分钟
        input.extend(:placeholder="$t('custom')" @focus="focusInput" @blur="blurInput" v-model="extendFree" :class="{'btn-selection':extendBtn === '9999'}" @input="extendInputRGE" maxlength="4")
        //- :: 自定义
      .delayed-bottom
        van-button(type="default",@click="delayedDetermine") {{$t('determine')}}
        //- :: 确定
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import { getDataByKey } from '@/utils/array'
import BarHeader from '@/components/c-header'
export default {
  components: {
    BarHeader
  },
  data () {
    return {
      extendOption:[10,20,30,60,120], // 会议延长时间选择节点
      extendBtn:'', // 延长会议选择的时限
      extendFree:'', // 延长会议自定义的时限
      canExtendTime: '360', // 会议可延长时间
      canExtendTimeTxt: '', // 可延长的时间提示
    }
  },
  props: {
    // 会议ID
    meetingId:{
      type: [String],
      default: ''
    },
    // 会控ID
    platId:{
      type: [String],
      default: ''
    },
    // 会议类型
    meetingType:{
      type: [String],
      default: ''
    },
    // 会场
    roomData:{
      type: [Array],
      default: []
    }
  },
  mounted () {
    this.getCanExtendTips()
  },
  methods:{
    // 查询可延长会议的最多时长
    async getCanExtendTips () {
      // 会议可延长时间查询
      let vm = this;
      vm.extendShow = true
      vm.extendBtn = '' // 延长会议选择的时限
      vm.extendFree = '' // 延长会议自定义的时限
      let req = [
        {
          service: "M4002400",
          METTING_ID: vm.meetingId, // 会议ID
          mask: false // 禁用全局菊花
        }
      ];
      vm.canExtendTime = '360'
      vm.canExtendTimeTxt = ''
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.canExtendTime = parseInt(result.data[0].DURATION) < 0 ? 0 : parseInt(result.data[0].DURATION);
        if(vm.canExtendTime < 360){
          vm.canExtendTimeTxt = this.$t('placeOccupancySituation') // :: 会场占用详情
        }
      }
    },
    // 确定延长会议
    async delayedDetermine () {
      if(this.extendBtn === '9999'){
        if(!this.extendFree || this.extendFree < 1 || this.extendFree > 360 || typeof(this.extendFree) !== "number"){
          this.$Notify({message: this.$t('minimumExtensionTime')}); // 延长时长不能小于1分钟!
          return false
        }
      }
      if (!this.extendBtn) {
        this.$Notify({message: this.$t('extendTimeCanNotBeEmpty')}); // 延长时长不能为空!
        return
      }
      let vm = this
      let req = [
        {
          service: "P1202624",
          metting_plat_id: vm.platId,
          metting_id: vm.meetingId,
          video_conference: vm.meetingType,
          date: vm.extendBtn === '9999' ? vm.extendFree : vm.extendBtn
        }
      ];
      let result = await vm.$ajaxRequest(req,() => {
        this.extendShow = false
        this.extendBtn=''
      })
      if (result.code === '0') {
        this.$emit('returnControl', true)
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      } else {
        vm.$Notify({message:result.msg});
      }
    },
    // 延长会议自定义获取焦点
    focusInput(e) {
      this.extendBtn = '9999' // 标识自定义时间选择
      e.target.removeAttribute('placeholder')
    },
    // 延长会议自定义失去焦点
    blurInput(e){
      e.target.setAttribute('placeholder',this.$t('custom')) // 自定义
    },
    // 延长会议验证
    extendInputRGE(){
      let vm = this
      const maxVal = parseInt(this.canExtendTime)
      let value = vm.extendFree.replace(/\D+/ig, "");
      if(value == 0){
        vm.extendFree = ''
      }else if(value > maxVal){
        vm.extendFree = maxVal
      }else{
        vm.extendFree = value ? parseInt(value) : value
      }
    },
    // 选择时间
    selectExtend(val){
      if(this.canExtendTime > val){
        this.extendBtn = val
      }
    },
    // 返回会议控制
    returnControl () {
      this.$emit('returnControl', false)
    },
    // 跳转会场状态页
    seeRoomState () {
      this.$store.commit(TYPES_MEETING.M_MEETING_ROOM_SELF, {
        ignoreCheckRoom: true,
        value: this.roomData
      })
      this.$router.push({
        name: 'meetingRoom.status',
        query: {
          businessType: 3,
          ...this.$route.query
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
