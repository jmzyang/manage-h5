<template lang="pug">
  .meeting-control-container
    .control-main(v-show="componentSwitching === 'control'" @click="sliderShowFun")
      .control-header
        leftHeader(
          layout="title",
          :back="true",
          :backEvent="true",
          @back="returnDetails")
          | {{$t('meetingControl')}}
          //- :: 会议控制
          template(slot="actions")
            .send-message(@click="sendingNotice(meetingBasicsDate)" v-if="+KIparameter.OPEN_MEETING_NOTICE == 1") 
              | {{$t('sendNotice')}}
              //- 发送通知
        .control-header-main
          .meeting-title {{meetingBasicsDate.METTING_NAME}}
          .meeting-count-down(@click="componentSwitching = 'delayed'")
            | {{meetingCountDown}}
            span +
          .meeting-time
            span.timeDate {{meetingBasicsDate.date}}
            span.week {{meetingBasicsDate.cycle}}
            span.time {{meetingBasicsDate.startTime}}
          .meeting-attendee
            i(class="iconfont icon-meeting-form-host")
            | {{meetingBasicsDate.ZHAOKAIREN}}
      .control-middle
        Scroll
          .navigation(v-if="meetingType === '1'")
            div(:class="{'select-navigation':selectNavigation === '0'}", @click="selectNavigation = '0'")
              span {{$t('basicInformation')}}
              //- 基础信息
              div
            div(:class="{'select-navigation':selectNavigation === '1'}", @click="selectNavigation = '1'")
              span {{$t('meetingControl')}}
              //- :: 会议控制
              div
          .basics-container(v-show="selectNavigation === '0'")
            .content
              .subheading {{$t('attendeeLeader')}}
                //- :: 参会领导
                span(@click="leaderChoice") + {{$t('add')}}
                //- :: 添加
              .subheadingContent {{meetingBasicsDate.insideContactsLeader}}
            .content
              .subheading {{$t('attendee')}}
                //- :: 参会人
                span(@click="attendeeChoice") + {{$t('add')}}
                //- :: 添加
              .subheadingContent {{meetingBasicsDate.contactsValue}}
            .content
              .subheading {{$t('meetingIssue')}}
                //- :: 会议议题
                span(@click="editIssue") + {{$t('add')}}
                //- :: 添加
            Issue(
              :issueData="meetingBasicsDate.topic" 
              :isNotice="true" 
              :issueType="2"
              @sendingNotice="sendingNotice"
              @editIssue="editIssue"
              @refreshPage="getMeetingData"
            )
          .list-container(v-show="selectNavigation === '1'")
            .search-input(@click="componentSwitching='searchs'")
              i(class="iconfont icon-search")
              span {{searchsTitle}}
            .meeting-room-list
              .noDataTips(v-if="!formInformation || formInformation.length < 1") {{$t('notFoundRoom')}}
              //- :: 没有查询到相关会场...
              .meeting-cintril-list(v-for="tableData in formInformation")
                .delete-room(@click="deleteRoom(tableData)")
                  i(class="iconfont icon-close")
                .chairman-room(v-show="tableData.uri === ConferenceStatus.chair")
                  span {{$t('C')}}
                  //- :: 主C
                .list-title
                  | {{tableData.ROOM_NAME}}
                .list-contril
                  .meeting-state
                    van-button(type="default" @click="invitation(tableData)")
                      i(class="iconfont icon-meeting-control-connection-status",:class="{green:tableData.status === '2'}")
                  .meeting-microphone
                    van-button(type="default" @click="setMicrophone(tableData)")
                      i(class="iconfont",:class="{'icon-meeting-control-microphone blue':tableData.isMute == '0','icon-meeting-control-mute':tableData.isMute == '1'}")
                  .meeting-voice
                    van-button(type="default" @click="setVoice(tableData)")
                      i(class="iconfont icon-meeting-control-voice",:class="{'blue':tableData.isQuiet == '0'}")
                  .meeting-broadcast
                    van-button(type="default" @click="setPlay(tableData)")
                      i(class="iconfont icon-meeting-control-broadcast",:class="{blue:tableData.uri === ConferenceStatus.broadcast}")
                  .meeting-chairman
                    van-button(type="default" @click="setChairman(tableData)")
                      i(class="iconfont icon-meeting-control-chairman",:class="{blue:tableData.uri === ConferenceStatus.chair}")
                  .meeting-speak
                    van-button(type="default" @click="setSpeak(tableData)")
                      i(class="iconfont icon-meeting-control-speak",:class="{blue:tableData.isMute == '0'}")
      .end-bottom(v-show="selectNavigation === '0'")
        van-button(type="default",@click="meetingEnd") {{$t('meetingEnd')}}
        //- :: 结束会议
      .control-bottom(v-show="selectNavigation === '1'")
        .meeting-call-box
          van-button(type="default" @click="invitationAll()")
            i(class="iconfont icon-meeting-control-call")
          span {{$t('oneClickCall')}}
          //- :: 一键呼叫
        .meeting-Mute-box
          van-button(type="default" @click="muteAll")
            i(class="iconfont",:class="{'icon-meeting-control-mute':muteAllVal===`${$t('oneClickMute')}`,'icon-meeting-control-microphone':muteAllVal===`${$t('oneClickOpen')}`}")
            //- :: 一键静音，:: 一键开启
          span {{muteAllVal}}
        .meeting-box-volume
          van-button.meeting-volume(type="default" @click="sliderShow=true")
            i(class="iconfont icon-meeting-control-sound-control")
          span {{$t('voiceControl')}}
          //- :: 声控
        .meeting-add-box
          van-button(type="default" @click="addMetingRoom")
            i(class="iconfont icon-meeting-control-add")
          span {{$t('addConferenceHall')}}
          //- :: 添加会场
        .meeting-end-box
          van-button(type="default" @click="meetingEnd")
            i(class="iconfont icon-meeting-control-over")
          span {{$t('meetingEnd')}}
          //- :: 结束会议
      .meeting-volume-slider(v-if="sliderShow")
        van-slider(v-model="sliderValue" :min="0" :vertical="true" :max="100" @change="sliderChange")
    Searchs(
      v-if="componentSwitching === 'searchs'",
      @getKeyWordDate="searchsResult",
      :meetingNameList="meetingNameList",
      :searchsVal="searchsVal"
    )
    Delayed(
      v-if="componentSwitching === 'delayed'",
      :roomData="formDataSource"
      :meetingId="meetingId",
      :platId="platId",
      :meetingType="meetingType",
      @returnControl="returnControl"
    )
    .personnel-edit-box(v-if="componentSwitching === 'ChoosContacts'")
      RightHeader(
        layout="title",
        :back="true",
        :backEvent="true",
        @back="returnControl")
        | {{$t('meetingAttendee')}}
        //- :: 会议参会人
        template(slot="actions")
          .send-message(@click="sureDelegation") 
            | {{$t('determine')}}
            //- :: 确定
      ChoosContacts(
        selectType="participantsIssue",
        :businessType="3"
      )
    .issue-edit-box(v-if="componentSwitching === 'issueEdit'")
      IssueModify(
        :editIssueData="editIssueData"
        @returnControl="returnControl"
      )
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import * as TYPES_MEETING from '@/stores/meeting/types'
import { getDataByKey, externalFormatAdd } from '@/utils/array'
import moment from '@/commons/moment.js'
import Scroll from '@/components/c-scroll/index.vue'
import BarHeader from '@/components/c-header'
import Searchs from './components/c-searchs'
import Delayed from './components/c-delayed'
import Issue from './components/c-issue'
import IssueModify from './components/c-issue-modify'

import ChoosRoom from '../meeting/components/c-choose-room'
import ChoosContacts from '../meeting/components/c-choose-contacts'
import MeetingRoomState from '../meeting-room/components/c-room-state'
import CMeetingIssue from '../meeting-issue'
export default {
  components: {
    Searchs,
    Scroll,
    Delayed,
    Issue,
    IssueModify,
    ChoosRoom,
    LeftHeader:BarHeader,
    RightHeader:BarHeader,
    MeetingRoomState,
    ChoosContacts,
    CMeetingIssue
  },
  data() {
    return {
      fileUrl: '/fileServer', // 文件服务器路径
      sliderShow:false,// 显示声控滑动条
      extendShow:false,// 显示延长会议
      formData: {
        startTime: '', // 开始时间
        duration: 30, // 会议时长
      },
      meetingBasicsDate:[],// 左侧会议信息
      formInformation:[],// 右侧表格数据
      formDataSource:[], // 右侧表格数据源
      meetingNameList:[], // 存在的会场列表名称
      topicName:[],// 存在的议题名称
      preservation:1, // 保存议题修改
      extendOption:[10,20,30,60,120], // 会议延长时间选择节点
      extendBtn:'', // 延长会议选择的时限
      extendFree:'', // 延长会议自定义的时限
      ConferenceStatus:'', // 主席会场标识
      notJoined:[], // 已入会未连接的会场
      sliderValue:0, // 声控阈值
      muteAllVal: this.$t('oneClickMute'), // 底侧一键静音控制 :: 一键静音
      meetingCountDown:'00:00:00' , // 会议倒计时
      searchsVal:'', // 搜索框内容
      searchsTitle: this.$t('searchConferenceHallName'), // 搜索框标题 :: 搜索会场名称
      countDownTimer:null, // 会议时间倒计时定时器
      InviteAllTimer:null, // 邀请全部未连接终端定时器
      timerObject: null, // 轮询请求定时器
      tiemAlert:true, // 是否可以弹出即将超时确认框
      canExtendTime: '360', // 会议可延长时间
      canExtendTimeTxt: '', // 可延长的时间提示
      editTitle:'', // 添加/修改议题标题
      targetClickIssue: {}, // 查看的议题
      noticeDate:{}, // 发送通知数据

      meetingId: this.$route.query.meetingId,// 会议ID
      platId: this.$route.query.platId,// 什么什么ID
      meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地
      retractAndOpen: this.$t('expand'), // 详情是否收起 展开
      isNotice: false, // 是否可发送通知
      selectNavigation: '0', // 0：基础信息，1：会场控制
      componentSwitching: 'control', // 组件切换，control：会控；delayed：延长会议；searchs：搜索会场
      issueTitle: this.$t('addIssue'), // 议题编辑标题
      editIssueData: {} // 编辑议题数据
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
  beforeDestroy(){
    clearInterval(this.countDownTimer)
    clearInterval(this.InviteAllTimer)
    clearInterval(this.timerObject)
  },
  mounted() {
    // 刷新页面
    let vm = this
    if(this.meetingType === '1'){
      if(!vm.InviteAllTimer){
        vm.InviteAllTimer = setInterval(function () {
          vm.invitationAll(true) // 邀请所有为链接的终端
        }, 5000);
      }
      if(!this.timerObject){
        this.timerObject = setInterval(() => {
          this.getTableData(true)
        },5000)
      }
      vm.getTableData()// 请求右侧表格数据
    }

    if(vm.$route.params.meetingAttendeeType === 'participantsIssue'){
      vm.sureDelegation() // 编辑参会人
    }else if(vm.$route.params.meetingAttendeeType === 'leader'){
      vm.sureDelegation('leader') // 请求左侧数据
    }else{
      vm.getMeetingData() // 请求左侧数据
    }
  },
  methods:{
    // 返回详情
    returnDetails () {
      this.$router.push({
        name: 'meeting-details',
        query: {
          ...this.$route.query
        }
      })
    },
    // 发送通知
    sendingNotice (data) {
      this.$router.push({
        name: 'meeting-notice',
        params: {
          data: data, // 详情数据
          type: 'meeting-control' // 出口
        },
        query: {
          ...this.$route.query
        }
      })
    },
    // 会议详情展开收起
    retractAndOpenClick () {
      if(this.retractAndOpen === this.$t('expand')){ // 展开
        this.retractAndOpen = this.$t('retract')  // 收起
      }else{
        this.retractAndOpen = this.$t('expand')  // 展开
      }
    },
    // 返回控制页面
    returnControl (state) {
      this.componentSwitching = 'control'
      if(state){
        this.getMeetingData()// 请求左侧数据
      }
    },
    // 选择参会领导
    leaderChoice() {
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_LEADER'], {
        value: this.meetingBasicsDate.main_user_code || []
      })
      this.$router.push({
        name: 'contacts.index',
        query: {
          scene: this.$t('attendeeLeader'), // 参会领导
          selectType: 'leader',
          key: 'participants',
          historyType: '2, 3',
          businessType: 3,
          leaderNumber: this.meetingBasicsDate.leaderNumber,
          ...this.$route.query
        }
      })
    },
    // 选择参会者
    attendeeChoice() {
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
        value: [
          ...this.meetingBasicsDate.user_code,
          ...this.meetingBasicsDate.external.map((item) => {
            item.USER_CODE = item.OUTSIDE_USER_CODE
            item.CONTACTS_TYPE = '1'
            item.EMAIL = item.EMAIL_ADDRESS
            item.MOBILE = item.PHONE_NO
            return item
          })
        ]
      })
      this.$router.push({
        name: 'contacts.index',
        query: {
          scene: this.$t('attendee'), // 参会人
          selectType: 'participantsIssue',
          key: 'participants',
          historyType: '2, 3',
          businessType: 3,
          leaderNumber: this.meetingBasicsDate.contactsNumber,
          ...this.$route.query
        }
      })
    },
    // 编辑议题
    editIssue(data, index){
      // this.componentSwitching = 'issueEdit'
      // this.editIssueData = data

      if(data.TOPIC_ID){ // 修改议题
        this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_FORM,  {
          type: 'assign',
          value: {
            title: data.TOPIC_NAME,
            fileList: data.fileList,
            contacts: data.contacts
          }
        })
        this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_NAME_LIST,  {
          value: this.topicName.filter((it) => {
            return it !== data.TOPIC_NAME
          })
        })
        // 修改议题
        this.$router.push({
          name: 'meeting.issue.add',
          query: {
            issueIndex: 0,
            issueType: 1,
            issueId: data.TOPIC_ID,
            number: data.user_code.length + data.external.length,
            businessType: 3,
            ...this.$route.query
          }
        })
      }else{ // 添加议题
        this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_FORM,  {
          type: 'clear'
        })
        this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_NAME_LIST,  {
          value: this.topicName
        })
        // 添加议题
        this.$router.push({
          name: 'meeting.issue.add',
          query: {
            issueIndex: -1,
            issueType: 1,
            businessType: 3,
            ...this.$route.query
          }
        })
      }
    },
    // 确定参会人编辑
    async sureDelegation (type) {
      let vm = this
      let contacts = vm.$route.params.meetingAttendee.member
      // 内部联系人
      const contactsEnterprise = getDataByKey(contacts.filter(item => +item.CONTACTS_TYPE != 1), 'USER_CODE').join(',')
      // 外部联系人
      const contactsExternal = externalFormatAdd(contacts.filter(item => +item.CONTACTS_TYPE == 1))

      let req = [
        {
          service: 'M4003406',
          type_participants: type === 'leader' ? '0' : '1',
          METTING_ID: vm.meetingId, // 会议ID
          user_code: contactsEnterprise, // 参会人
          external: contactsExternal, // 外部联系人
          number: vm.$route.params.leaderNumber || 0
        }
      ]
      let result = await vm.$ajaxRequest(req, () => {
        vm.getMeetingData() // 刷新左侧数据
      })
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    // 声控弹框
    sliderShowFun(e){
      this.sliderShow = e.target.className.indexOf('meeting-volume') > -1?true:false;
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
          vm.canExtendTimeTxt = this.$t('placeOccupancySituation') // :: 会场占用详情
        }
      }
    },
    searchsResult(val,type) {
      // 搜索返回
      let vm = this
      if(!type){
        vm.componentSwitching = 'control'
      }
      if(val){
        vm.searchsVal = val
        vm.searchsTitle = val
        vm.formInformation = []
        vm.formDataSource.forEach(value => {
          if(value.ROOM_NAME.indexOf(val) > -1){
            vm.formInformation.push(value)
          }
        })
      }else{
        vm.searchsVal = ''
        vm.searchsTitle = this.$t('searchConferenceHallName') // :: 搜索会场名称
        vm.formInformation = vm.formDataSource
      }

    },
    async getMeetingData(type,index){
      // 获取左侧会议信息
      let vm = this
      let req = [
        {
          service: 'P1202660',
          metting_id: vm.meetingId
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.meetingBasicsDate = result["data"][0]
        // 会议时间格式化处理
        let startDate = vm.meetingBasicsDate.METTING_STARTTIME ? vm.meetingBasicsDate.METTING_STARTTIME : moment().format('YYYY.MM.DD') + ' 23:59:59'
        startDate = startDate.split(' ')
        vm.meetingBasicsDate.date = startDate[0] // 日期
        vm.meetingBasicsDate.cycle = moment(startDate[0]).format('dddd').replace(this.$t('week'),this.$t('weeks')) // 周期
        vm.meetingBasicsDate.startTime = startDate[1].substring(0, 5) // 开始时间
        vm.meetingBasicsDate.endTime = vm.meetingBasicsDate.METTING_ENDTIME ? vm.meetingBasicsDate.METTING_ENDTIME.split(' ')[1].substring(0, 5) : '00:00' // 开始时间
        // 主持人
        vm.meetingBasicsDate.hostContent = getDataByKey([...vm.meetingBasicsDate.meeting_host || [], ...vm.meetingBasicsDate.host_external || []],"USER_NAME").join('、')
        // 会议参会人
        vm.meetingBasicsDate.contactsValue = getDataByKey([...vm.meetingBasicsDate.user_code || [],...vm.meetingBasicsDate.external || []], 'USER_NAME').join('、')
        // 参会人领导
        vm.meetingBasicsDate.insideContactsLeader = getDataByKey([...vm.meetingBasicsDate.main_user_code || [], ...vm.meetingBasicsDate.main_user_code_external || []], 'USER_NAME').join('、')
        vm.meetingBasicsDate.contactsNumber = vm.meetingBasicsDate.contactsValue.split('、').length
        vm.meetingBasicsDate.leaderNumber = vm.meetingBasicsDate.insideContactsLeader.split('、').length
        // 议题参会人
        vm.meetingBasicsDate.topic.forEach(val => {
          val.senator = getDataByKey([...val.user_code || [],...val.external || []], 'USER_NAME').join('、')
          val.contacts = {
            organization: [], 
            member: [
                ...val.user_code,
                ...val.external.map((item) => {
                item.USER_CODE = item.OUTSIDE_USER_CODE
                item.CONTACTS_TYPE = '1'
                item.EMAIL = item.EMAIL_ADDRESS
                item.MOBILE = item.PHONE_NO
                return item
              })
            ],
            total: val.user_code.length + val.external.length
          }
        })
        // 议题名称
        vm.topicName = getDataByKey(vm.meetingBasicsDate.topic || [], 'TOPIC_NAME')
        // 会议倒计时
        if(vm.meetingBasicsDate.METTING_TYPE === '4' || !vm.meetingBasicsDate.METTING_ENDTIME || moment(vm.meetingBasicsDate.METTING_ENDTIME) < moment()){
          vm.meetingCountDown = "00:00:00"
        }else{
          vm.countDown(moment(vm.meetingBasicsDate.METTING_ENDTIME) - moment()) 
        }
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
            vm.endMeeting()
          })
        }else{
          if( h < 1 && s < 1 && m < 11 && vm.tiemAlert){
            vm.tiemAlert = false
            vm.$Dialog.confirm({
              title: this.$t('tips'),
              message: this.$t('extensionReminder') // :: 会议即将超时结束，是否延长会议时间?
            }).then(async () => {
              vm.tiemAlert = true
              this.componentSwitching = 'delayed'
            }).catch(() => {
              vm.tiemAlert = true
            });
          }
        }
      },1000)
    },
    async getTableData(type) {
      // 获取右侧会议列表数据
      let vm = this
      let req = [
        {
          service: "P1202614",
          id: vm.platId,
          metting_id: vm.meetingId,
          page: 1,
          pagecount: 10,
          mask: false
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.formDataSource = result.data[0].status // 源数据
        vm.ConferenceStatus = result.data[0].ConferenceStatusEx[0]
        vm.notJoined = []
        vm.meetingNameList = []
        vm.formDataSource.forEach(function (item) {
          vm.meetingNameList.push(item.ROOM_NAME)
          if (item.status != '2' && item.isRefuse != '1') {
            vm.notJoined.push(item.uri)
          }
        });
        vm.searchsResult(vm.searchsVal,type)
      }else if(result.code === '1347420162'){
        vm.$Dialog.alert({
          title: this.$t('tips'),
          message: this.$t('meetingDeleted'), // :: 会议已超时结束或被删除！
        }).then(() => {
          vm.endMeeting()
        })
      }else{
        vm.$Notify({message:result.msg});
        vm.notJoined = [] // 已入会未连接的会场
        vm.meetingNameList = [] // 已存在的会场列表名称，用作会场名称检索
        vm.formInformation = [] // 会议列表数据
      }
    },
    async endMeeting() {
      // 结束会议
      let vm = this;
      let req = [
        {
          service: "P1202627",
          metting_plat_id: vm.platId,
          video_conference: vm.meetingType,
          metting_id: vm.meetingId
        }
      ];
      await vm.$ajaxRequest(req,()=>{
        this.$router.push({
          name: 'meeting'
        })
      })
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
      this.extendShow = false;
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
        this.$Notify({message: this.$t('extendTimeCanNotBeEmpty')}); // :: 延长时长不能为空
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
        vm.getMeetingData()// 请求左侧数据
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      } else {
        vm.$Notify({message:result.msg});
      }
    },
    // 表格操作
    async invitation(datas) {
      // 邀请入会
      let vm = this
      let req = [
        {
          service: datas.status === "2"?"P1202623":"P1202622",
          metting_plat_id: vm.platId,
          metting_id: vm.meetingId,
          siteUris: datas.uri
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        if(datas.uri == vm.ConferenceStatus.chair){
          vm.ConferenceStatus.chair = ''
        }
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async setMicrophone(datas) {
      // 会场麦克风设置
      let vm = this
      if (datas.status != "2"){
        this.$Notify(this.$t('microphoneInvalid')); // :: 该会场未入会,无法设置麦克风!
        return false
      }
      console.log(datas.isMute)
      let req = [
        {
          service: "P1202619",
          metting_plat_id: vm.platId,
          siteUri: datas.uri,
          isMute: datas.isMute
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        datas.isMute = datas.isMute == '1'?'0':'1'
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async setVoice(datas) {
      // 设置声音状态
      if (datas.status != "2"){
        this.$Notify(this.$t('voiceInvalid')); // :: 该会场未入会,无法设置声音!
        return false
      }
      let vm = this
      let req = [
        {
          service: "P1202632",
          metting_plat_id: vm.platId,
          siteUris: datas.uri,
          isQuiet: datas.isQuiet
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        datas.isQuiet = datas.isQuiet == '1'?'0':'1'
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async setPlay(datas){
      // 设置广播状态
      if (datas.status != "2"){
        this.$Notify(this.$t('broadcastInvalid')); // :: 该会场未入会,无法设置广播!
        return false
      }
      let vm = this;
      let req = [
        {
          service: "P1202618",
          metting_plat_id: vm.platId,
          siteUri: datas.uri,
          isBroadcast: vm.ConferenceStatus.broadcast === datas.uri?1:0
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        if(req[0].isBroadcast === 0){
          vm.ConferenceStatus.broadcast = datas.uri
        }else{
          vm.ConferenceStatus.broadcast = ''
        }
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async setChairman(datas) {
      // 设置主席
      if (datas.status != "2"){
        this.$Notify(this.$t('chairmantInvalid')); // :: 该会场未入会,无法设为主席!
        return false
      }
      let vm = this
      let req = [
        {
          service: datas.uri === vm.ConferenceStatus.chair?"P1202617":"P1202616",
          metting_plat_id: vm.platId,
          chairmanUri: datas.uri === vm.ConferenceStatus.chair?'':datas.uri
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        if(vm.ConferenceStatus.chair){
          vm.ConferenceStatus.chair = ''
        }else{
          vm.ConferenceStatus.chair = datas.uri
        }
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async setSpeak(datas) {
      // 设置点名发言
      if (datas.status != "2"){
        this.$Notify(this.$t('speakInvalid')); // :: 该会场未入会,无法发言!
        return false
      }
      let vm = this;
      let req = [
        {
          service: "P1202620",
          metting_plat_id: vm.platId,
          siteUri: datas.uri
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      }else{
        vm.$Notify({message:result.msg});
      }
    },
    async deleteRoom(datas) {
      // 删除会场
      let vm = this
      if (vm.formDataSource.length < 3) {
        vm.$Notify(this.$t('noLessThanTwo')); // :: 视频会议不能少于两个会场!
        return
      }
      if (datas.status == "2") {
        vm.$Notify(this.$t('removeInvalid')); // :: 正在通话中的会场需先挂断后才能移除!
        return
      }
      vm.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('confirmationRemove') // :: 确认是否移除该会场
      }).then(async() => {
        let req = [{
          service: "P1202626",
          metting_plat_id: vm.platId,
          siteUris: datas.uri,
          metting_id: datas.ROOM_ID
        }];
        let result = await vm.$ajaxRequest(req)
        if (result.code === '0') {
          vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
          vm.getTableData()// 请求右侧表格数据
        } else {
          vm.$Notify({message:result.msg});
        }
      }).catch(() => {

      })
    },
    async invitationAll(type) {
      // 一键邀请所有人入会
      let vm = this
      if(!vm.notJoined || vm.notJoined.length <1){
        return false
      }
      let req = [
        {
          service: "P1202661",
          id: vm.platId,
          urlArray: vm.notJoined,
          mask: false
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0' && !type) {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
      } else if(!type){
        vm.$Notify({message:result.msg});
      }
    },
    async muteAll() {
      // 一键静音
      let vm = this
      let req = [
        {
          service: "P1202646",
          id: vm.platId,
          isQuiet: vm.muteAllVal === this.$t('oneClickMute')?0:1 // :: 一键静音
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        vm.muteAllVal = vm.muteAllVal === this.$t('oneClickMute')?this.$t('oneClickOpen'):this.$t('oneClickMute') // :: 一键静音，:: 一键开启
        console.log(vm.formInformation)
        vm.formInformation.forEach(val => {
          if(val.status === '2' && vm.muteAllVal === this.$t('oneClickMute')){ // :: 一键静音
            val.isQuiet = '0'
          }else if(val.status === '2'){
            val.isQuiet = '1'
          }
        })
      } else {
        vm.$Notify({message:result.msg});
      }
    },
    async sliderChange() {
      // 声控
      let vm = this
      let req = [
        {
          service: "P1202621",
          metting_plat_id: vm.platId,
          swtichGate: vm.sliderValue,
          isSwitch: 1,
          mask: false
        }
      ]
      let result = await vm.$ajaxRequest(req)
    },
    // 添加会场
    addMetingRoom() {
      this.$store.commit(TYPES_MEETING.M_MEETING_ROOM, {
        value: []
      })
      let duration = 30 // 会议时长
      let startTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss') // 开始时间
      if(this.meetingBasicsDate.METTING_ENDTIME){
        let tempTime = moment.duration(moment(this.meetingBasicsDate.METTING_ENDTIME) - moment());
        duration = tempTime.minutes() // 会议时长
      }

      this.$router.push({
        name: 'meeting.chooseMeetingRoom',
        query: {
          videoConference: 1,
          startTime: startTime,
          duration: duration,
          mutation: 'M_MEETING_ROOM',
          stateName: 'meetingRoom',
          businessType: 3,
          ...this.$route.query
        }
      })
    },
    meetingEnd() {
      // 结束会议
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isMeetingEnd') // :: 确认是否结束会议
      }).then(() => {
        this.endMeeting()
      }).catch(() => {

      })
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>

