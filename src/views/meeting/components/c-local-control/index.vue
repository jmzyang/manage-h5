<template lang="pug">
  .control-container(@click="sliderShowFun" v-loading="loading")
    .personnel-details-box(v-if="issueModifyShow === 'ChoosContacts'")
      attendeetHeader(layout="default")
        .personnel-title(class="title")
          span(@click="issueModifyShow='control'")
            i.icon-arrow-left.iconfont
          | {{$t('meetingAttendee')}}
          //- :: 会议参会人
          span(@click="sureDelegation") {{$t('determine')}}
          //- :: 确定
      ChoosContacts(
        selectType="participantsIssue",
        :businessType="5"
      )
    .modify-main(v-if="issueModifyShow === 'issue'")
      CEditIssue(
        :issueDate="modifyDatas", 
        :topicName="topicName", 
        @editCancel="editCancel", 
        @issueModify="issueModify", 
        :editTitle.sync="title",
      )
    noticeBarHeader(layout="default" v-show="issueModifyShow === 'control'")
      .container-title(class="title")
        span(@click="controlReturn")
          i.icon-arrow-left.iconfont
        | {{title}}
        span(@click="sendingNotice(DataSource)" v-if="+KIparameter.OPEN_MEETING_NOTICE == 1") 
          | {{$t('sendNotice')}}
          //- :: 发送通知
    .control-box(v-show="issueModifyShow === 'control'")
      Scroll
        .control-main
          .main-content-box
            .title {{DataSource.METTING_NAME}}
            .date-time
              span.timeDate {{DataSource.time}}
              span.week {{DataSource.cycle}}
              span.time {{DataSource.timeSlot}}
              span.timeSlot {{DataSource.titleSlot}}
            .control-time
              | {{$t('meetingRemainingTime')}}
              //- :: 会议剩余时间：
              span {{meetingCountDown}}
              .extend-box
                van-button(type="default",class="extendTime", @click="getCanExtendTips") {{$t('meetingExtend')}}
                //- :: 延长会议
                .meeting-extend(v-show="extendShow")
                  .canExtendTips.extend
                    | {{$t('maxExtend')}}
                    //- :: 当前可延长最大时长
                    span.extend {{canExtendTime}}{{$t('minutes')}}
                    //- :: 分钟
                    span(v-show="canExtendTime < 360") ,
                    span.extend(@click="seeRoomState" v-show="canExtendTime < 360") {{$t('clickSee')}}
                    //- :: 点击查看
                    | {{canExtendTimeTxt}}
                  .selection-extend
                    van-button.extend(type="default", v-for="(value,index) in extendOption", :key="'s' + index", :class="{btnSelection:extendBtn == value, btnProhibit:canExtendTime < value}", @click="selectExtend(value)")
                      | {{value}}{{$t('minutes')}}
                    //- :: 分钟
                    input.extend(:placeholder="$t('custom')" @focus="focusInput" @blur="blurInput" v-model="extendFree" :class="{btnSelection:extendBtn == 9999}" @input="extendInputRGE" maxlength="4")
                    //- :: 自定义
                  .operation-extend
                    van-button.extend(type="default" @click="cancelExtensionTime") {{$t('cancel')}}
                    //- :: 取消
                    van-button.extend(type="default" @click="extendAmeeting") {{$t('determine')}}
                    //- :: 确定
            .control-attendee
              span {{$t('attendee')}}：
              //- :: 参会人：
              div {{DataSource.contactsValue}}
                span(@click="addAttendee") {{$t('add')}}
                //- :: 添加
          .main-issue-box
            InputIssue(
              :meetingIssue="DataSource.topic" 
              :isNotice="true" 
              @sendingNotice="sendingNotice" 
              @controlEditIssue="controlEditIssue"
              type="meetingControl"
            )
      .control-btn
        van-button(type="default",@click="meetingEnd",class="endMeetingBtn") {{$t('meetingEnd')}}
        //- :: 结束会议
        van-button(type="default",@click="modifyIssue",class="addIssueBtn") {{$t('addIssue')}}
        //- :: 添加议题
</template>
<script>

import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'

import { getDataByKey } from '@/utils/array'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
import Issue from '../../../meeting-control/components/c-issue'
import InputIssue from '../c-input-issue'
import CEditIssue from '../../../meeting-issue/components/c-edit-issue'
import ChoosContacts from '../c-choose-contacts'
import moment from '@/commons/moment.js'
export default {
  data(){
    return {
      loading: false, // loading开启关闭
      DataSource:{}, // 数据源
      issueShow:1, // 议题编辑隐藏
      issueModifyShow: 'control', // 编辑议题隐藏
      extendShow: false, // 延长会议隐藏
      tiemAlert: true, // 是否可弹出提示框
      extendOption:[10,20,30,60,120], // 会议延长时间选择节点
      extendBtn:'', // 延长会议选择的时限
      extendFree:'', // 延长会议自定义的时限
      meetingCountDown:'00:00:00' , // 会议倒计时
      title: this.$t('meetingControl'), // 标题  :: 会议控制
      canExtendTime: '360', // 会议可延长时间
      canExtendTimeTxt: '', // 可延长的时间提示
      topicName:[], // 已有议题名称源
      modifyDatas:{}, // 修改议题的数据源
      externalContactsOldValue: [], // 外部联系人旧值
      contactsOldValue: [] // 联系人旧值
    }
  },
  computed: {
    ...mapState({
      // 联系人
      KIparameter (state) {
        return state.common.KIparameter || {}
      }
    })
  },
  components: {
    Scroll,
    attendeetHeader:BarHeader,
    noticeBarHeader:BarHeader,
    BarHeader,
    Issue,
    InputIssue,
    CEditIssue,
    ChoosContacts
  },
  props:{
    // 会议ID
    meetingId:{
      type:[String,Number],
      default:''
    },
    // 会议控制ID
    platID:{
      type:[String,Number],
      default:''
    },
    // 会议类型
    meetingType:{
      type:[String,Number],
      default:''
    }
  },
  watch: {
    meetingId (val) {
      if(this.meetingId){
        this.getDetails()
      }
    }
  },
  beforeDestroy(){
    clearInterval(this.countDownTimer)
  },
  mounted(){
    if(this.meetingId){
      this.getDetails()
    }
  },
  methods:{
    async getDetails(){
      // 获取会控信息
      let vm = this
      vm.issueModifyShow = 'control'
      vm.title = this.$t('meetingControl') // :: 会议控制
      vm.loading = true
      let req = [{
        service: 'P1202660',
        metting_id: vm.meetingId, // 会议ID
        mask: false // 禁用全局菊花
      }]
      let result = await vm.$ajaxRequest(req, () => {
        vm.loading = false
      })
      if (result.code === "0") {
        vm.DataSource = result["data"][0]
        if (!vm.DataSource.METTING_ENDTIME) {
          vm.DataSource.METTING_ENDTIME = ' '
        }
        if (!vm.DataSource.METTING_STARTTIME) {
          vm.DataSource.METTING_STARTTIME = ' '
        }
        let time = vm.DataSource.METTING_STARTTIME.split(' ')[1]
        let time2 = vm.DataSource.METTING_ENDTIME.split(' ')[1]
        vm.DataSource.timeSlot = time.substring(0, 5) + ' - ' + time2.substring(0, 5) // 会议时间
        vm.DataSource.titleSlot = moment(vm.DataSource.METTING_STARTTIME).format('a') // 会议时间段
        vm.DataSource.cycle = moment(vm.DataSource.METTING_STARTTIME.split(' ')[0]).format('dddd') // 周几
        vm.DataSource.time = vm.DataSource.METTING_STARTTIME.split(' ')[0].replace(/-/ig, '.') // 会议日期
        vm.externalContactsOldValue = vm.DataSource.external // 外部联系人存值
        vm.contactsOldValue = vm.DataSource.user_code // 联系人存值

        // 议题名称
        vm.topicName = getDataByKey(vm.DataSource.topic || [], 'TOPIC_NAME')

        // 会议参会人
        vm.DataSource.contactsValue = getDataByKey([...vm.DataSource.user_code || [],...vm.DataSource.external || []], 'USER_NAME').join('、')

        // 议题参会人
        vm.DataSource.topic.forEach(val => {
          val.senator = getDataByKey([...val.user_code || [],...val.external || []], 'USER_NAME').join('、')
        })

        // 会议时间
        if(vm.DataSource.METTING_TYPE === '4' || !vm.DataSource.METTING_ENDTIME || moment(vm.DataSource.METTING_ENDTIME) < moment()){
          vm.meetingCountDown = "00:00:00"
        }else{
          vm.countDown(moment(vm.DataSource.METTING_ENDTIME) - moment()) 
        }
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    countDown(time) {
      // 会议倒计时
      let vm = this
      if(vm.countDownTimer){
        clearInterval(vm.countDownTimer)
      }
      let tempTime = moment.duration(time);
      let h = parseInt(tempTime.hours())
      let m = parseInt(tempTime.minutes())
      let s = parseInt(tempTime.seconds())
      vm.countDownTimer = setInterval(()=>{
        s--
        if(s<0){
          m--
          s=59
        }
        if(m<0){
          h--
          m=59
        }
        vm.meetingCountDown = (h<10?'0'+h:h) + ':' + (m<10?'0'+m:m) + ':' + (s<10?'0'+s:s)
        if(h < 1 && m < 1 && s < 1){
          clearInterval(vm.countDownTimer)
          vm.meetingCountDown = "00:00:00"
          vm.$Dialog.alert({
            title: this.$t('tips'), // :: 提示
            message: this.$t('meetingDeleted'), // :: 会议已超时结束或被删除！
          }).then(() => {
            this.$emit('controlEnd')
          }).catch(() => {
            // on cancel
          });
        }if(h < 1 && m < 11 && s < 1 && vm.tiemAlert){
          vm.tiemAlert = false
          vm.$Dialog.confirm({
            title: vm.$t('tips'), // :: 提示
            message: vm.$t('extensionReminder') // :: 会议即将结束！
          }).then(async() => {
            vm.tiemAlert = true
            vm.getCanExtendTips()
          }).catch(() => {
            vm.tiemAlert = true
          });
        }
      },1000)
    },
    controlReturn(){
      // 返回
      this.$emit('controlReturn','local')
    },
    modifyIssue(){
      // 修改/添加议题
      let vm = this
      vm.title = this.$t('addIssue') // :: 添加议题
      this.modifyDatas = {METTING_ID:this.DataSource.METTING_ID}
      this.issueModifyShow = 'issue'
    },
    // 编辑议题
    controlEditIssue (data,type) {
      if(type === 'modify'){ // 修改
        this.title = this.$t('modifyIssue') // :: 修改议题
        this.modifyDatas = data
        this.issueModifyShow = 'issue'

        let isOfRepeated = this.topicName.findIndex(value => {
          return data.TOPIC_NAME === value
        })
        this.topicName.splice(isOfRepeated, 1)
      }else if(type === 'delete'){ // 删除议题
        this.deleteIssue(data)
      }
    },
    // 删除议题
    deleteIssue(itme) {
      // 删除议题
      let vm = this
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isDeletTheIssue') // :: 确认是否删除该议题
      }).then(async() => {
        let req = [{
          service: 'P1202641',
          topic_id: itme.TOPIC_ID, // 议题ID
          metting_id: itme.METTING_ID, // 会议ID
          topic_name: itme.TOPIC_NAME, // 议题名称
          number: itme.external.length + itme.user_code.length, // 参议员人数
          fileList: itme.fileList // 议题附件
        }];
        let result = await vm.$ajaxRequest(req)
        if (result.code === '0') {
          vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        } else {
          vm.$Notify({message:result.msg});
        }
      }).catch(() => {
        // on cancel
      });
    },
    // 保存议题
    issueModify(type,data) {
      this.issueModifyShow = 'control'
      this.getDetails()
    },
    // 取消编辑议题
    editCancel(data) {
      if(data !== 'add'){
        this.$set(this.topicName, this.topicName.length, data.TOPIC_NAME)
      }
      this.issueModifyShow = 'control'
    },
    meetingEnd(){
      // 结束会议
      this.$emit('controlEnd','end')
    },
    sliderShowFun(e){
      // 编辑议题弹框
      if(e.target.className.indexOf('issue-operation') < 0){
        this.issueShow = this.issueShow === 1?0:1
      }
      // 延长会议时限弹框
      if(e.target.className.indexOf('extend') < 0){
        this.extendShow = false
        this.extendCustom=true
      }
    },
    
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
          vm.canExtendTimeTxt = this.$t('placeOccupancySituation') // 会场占用详情
        }
      }
    },
    seeRoomState(){
      // 查看会场占用详情
      this.formDataSource.forEach(val => {
        this.$store.commit('M_SELF_CHECKED_MEETING_ROOM', {
          type: 1,
          value: val
        })
      })
      this.extendShow = false
      this.searchShow = 'meetingStateSee'
    },
    focusInput(e) {
      // 延长会议自定义获取焦点
      this.extendBtn = 9999 // 标识自定义时间选择
      e.target.removeAttribute('placeholder')
    },
    blurInput(e){
      // 延长会议自定义失去焦点
      e.target.setAttribute('placeholder',this.$t('custom')) // :: 自定义
    },
    selectExtend(val){
      // 选择时间
      if(this.canExtendTime > val){
        this.extendBtn = val
      }
    },
    cancelExtensionTime(){
      // 取消延长时间
      this.extendShow=false;
      this.extendBtn=''
    },
    extendInputRGE(){
      // 延长会议验证
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
    async extendAmeeting() {
      // 延长会议
      if(this.extendBtn == 9999){
        if(!this.extendFree || this.extendFree < 1 || this.extendFree > 360 || typeof(this.extendFree) !== "number"){
          console.log('不是可用的值')
          return false
        }
      }
      if (!this.extendBtn) {
        this.$Notify({message: this.$t('extendTimeCanNotBeEmpty')}); // :: 延长时长不能为空！
        return
      }
      let vm = this
      let req = [
        {
          service: "P1202624",
          metting_plat_id: vm.platId,
          metting_id: vm.meetingId,
          video_conference: vm.meetingType,
          date: vm.extendBtn == 9999 ? vm.extendFree : vm.extendBtn
        }
      ];
      let result = await vm.$ajaxRequest(req,() => {
        this.extendShow = false
        this.extendBtn=''
      })
      if (result.code === '0') {
        vm.getDetails()// 请求左侧数据
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      } else {
        vm.$Notify({message:result.msg});
      }
    },
    // 发送议题通知
    sendingNotice (data) {
      data.route = 'control'
      this.$emit('sendingNotice', data)
    },
    // 添加参会人
    addAttendee () {
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
        value: this.contactsOldValue
      })
      this.issueModifyShow = 'ChoosContacts'
    },
    // 确定参会人
    async sureDelegation () {
      let vm = this
      if(this.$store.state.contacts.participantsIssue.total < 1){
        vm.$Notify({ message: this.$t('meetingsNeedParticipants') }) // :: 会议不可没有参会人！
        return false
      }
      const contacts = await UTILS_CONTACTS.getMembers(this.$store.state.contacts['participantsIssue'])
      // 内部联系人
      const contactsEnterprise = contacts.filter(item => +item.CONTACTS_TYPE !== 1)
      // 外部联系人
      const contactsExternal = contacts.filter(item => +item.CONTACTS_TYPE === 1)

      let externalAttendeeList = []
      contactsExternal.forEach(val => {
        this.$set(externalAttendeeList, externalAttendeeList.length, {
          name: val.USER_NAME,
          tel: val.MOBILE,
          email: val.EMAIL
        })
      })

      let req = [
        {
          service: 'M4003406',
          METTING_ID: vm.meetingId, // 会议ID
          user_code: getDataByKey(contactsEnterprise, 'USER_CODE').join(','), // 参会人
          external: JSON.stringify(externalAttendeeList), // 外部联系人
          number: this.externalContactsOldValue.length + this.contactsOldValue.length // 原参会人个数
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
        vm.issueModifyShow = 'control'
        vm.getDetails() // 刷新左侧数据
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>