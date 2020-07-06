<template lang="pug">
.page-wrap.details-sontent-container
  .jurisdiction-container(v-if="detailsShow === 'jurisdiction'")
    rightHeader(
      layout="title"
      :back="true",
      :backEvent="true",
      @back="returnDetails")
      | {{$t('transferAuthority')}}
      //- ::权限转移
      template(slot="actions")
        span(
          @click="sureDelegation",
          :class="{selectionColor: $store.state.contacts.authorizer.total > 0}")  {{$t('determine')}}
          //- ::确定
    CContactsEnterprise(
      select-type="authorizer",
      history-type="1, 2",
      :fixedChosen="fixedChosen",
      :businessType="4")
  .summary-box(v-if="detailsShow === 'summary'")
    Summary(@summaryReturn="returnDetails" :meetingId="meetingId")
  .detailsSontent(v-loading="loading", v-show="detailsShow === 'details' || detailsShow === 'empty'")
    .empty(v-show="detailsShow === 'empty'")
      leftHeader(
        layout="title"
        :back="true",
        :backEvent="true",
        @back="jumpPage")
        | {{rTitle}}
      .empty-img
      .empty-content
        | {{$t('noContent')}}
        //- ::当前没有内容
        p(v-if="listType === 'meetingList'") 
          | {{$t('noMeetingContent')}}
          //- :: 左侧输入搜索关键词或选择历史试试吧
    .details-box(v-show="detailsShow !== 'empty'")
      .details-header
        leftHeader(
          layout="title",
          :back="true",
          :backEvent="true",
          @back="jumpPage")
          | {{rTitle}}
          template(slot="actions")
            .send-message(@click="sendingNotice(DataSource)" v-if="isNotice && +KIparameter.OPEN_MEETING_NOTICE == 1 && +Jurisdiction !== 1") 
              | {{$t('sendNotice')}}
              //- :: 发送通知
        .details-header-main
          .meeting-title {{DataSource.METTING_NAME}}
          .meeting-time
            span.type {{DataSource.meetingType}}
            span.timeDate {{DataSource.time}}
            span.week ({{DataSource.cycle}})
            span.time {{DataSource.timeSlot}}
          .meeting-attendee
            i(class="iconfont icon-meeting-form-host" v-if="DataSource.ZHAOKAIREN")
            | {{DataSource.ZHAOKAIREN}}
            i(class="iconfont icon-meeting-form-room" v-if="DataSource.conferenceList")
            | {{DataSource.conferenceList}}
      .details-main
        Scroll
          .container
            .content(:class="{'container-retract':retractAndOpen === `${$t('expand')}`}")
              //- :: 展开
              div
                .roomData
                  .subheading {{$t('conferenceHall')}}
                    //- :: 会场
                    .attendance-statistics(@click="signInClick" v-if="listType !== 'verify' && $route.query.currentNav < 2") {{$t('meetingSignIn')}}
                    //- :: 签到查看
                  .subheadingContent {{DataSource.conferenceList}}
              div
                .roomData
                  .subheading {{$t('attendeeLeader')}}
                    //- :: 参会人领导
                    .attendance-statistics(@click="responseState" v-if="listType !== 'verify'") {{$t('attendance')}}
                    //- :: 应会情况
                  .subheadingContent {{DataSource.insideContactsLeader}}
              div
                .roomData
                  .subheading {{$t('host')}}
                    //- :: 主持人
                  .subheadingContent {{DataSource.hostContent}}
              div
                .roomData
                  .subheading {{$t('hostDepartment')}}
                    //- :: 主办部门
                  .subheadingContent {{DataSource.ORG_NAME}}        
              div
                .roomData
                  .subheading {{$t('attendee')}}
                    //- :: 参会人
                  .subheadingContent {{DataSource.attendeeList}}
              div
                .roomData
                  .subheading {{$t('services')}}
                  //- :: 服务项
                  .subheadingContent {{DataSource.DEVICETYPE}}
              div
                .roomData
                  .subheading {{$t('meetingPassword')}}
                  //- :: 会议密码
                  .subheadingContent
                    p {{$t('accessPassword')}}
                      //- :: 接入密码：
                      span.accessCode {{DataSource.METTING_ACCESSCODE}}
                    p {{$t('chairmanPassword')}}
                      //- :: 主席密码：
                      span.accessCode {{DataSource.METTING_CHAIRMAIN_PWD}}
                    p {{$t('memberPassword')}}
                      //- :: 成员密码：
                      span.accessCode {{DataSource.METTING_COMMON_PWD}}
              div
                .roomData
                  .subheading {{$t('founder')}}
                   //- :: 创建人
                  .subheadingContent {{founderName}}
              div
                .roomData
                  .subheading {{$t('creationTime')}}
                  //- :: 创建时间
                  .subheadingContent {{DataSource.CTime}}
            .retractAndOpen(:class="{'retract-open':retractAndOpen === `${$t('expand')}`}")
              span(@click="retractAndOpenClick")
                | {{retractAndOpen}}
                i.iconfont.icon-arrow-bottom(v-if="retractAndOpen === $t('expand')")
                i.iconfont.icon-arrow-top(v-if="retractAndOpen === $t('retract')")
            .issue-box
              .issue-title {{$t('meetingIssue')}}  
              //- 会议议题 
              Issue(
                :issueData="DataSource.metting_topics" 
                :isNotice="isNotice" 
                :Jurisdiction="Jurisdiction"
                :issueType="1"
                @sendingNotice="sendingNotice"
              )
      //- [{0:'未开始',1:'进行中',2:'已结束',3:'已取消'},
      //- {0:'未审核',1:'无需审核',2:'已通过',3:'审核中',4:'未通过'},
      .control(v-if="$route.query.currentNav < 2 && listType == 'meetingList' && DataSource.METTING_STATUS != 3 && +Jurisdiction === 1")
        van-button(type="default",@click="meetingSummary",v-if="DataSource.METTING_STATUS == 2") {{$t('meetingSummary')}}
        //- :: 会议纪要
        van-button(type="default",class="permissionTransferBtn",@click="transferParticipationShow",v-if="DataSource.METTING_STATUS != 2 && waterType == 0") {{$t('transferParticipation')}}
        //- :: 参会转移
      .control(v-if="listType == 'meetingList' && DataSource.METTING_STATUS != 3 && +Jurisdiction === 0")
        van-button(type="default",@click="endMeeting",v-if="DataSource.METTING_STATUS == 1",class="endMeetingBtn") {{$t('meetingEnd')}}
        //- :: 结束会议
        //- van-button(type="default",@click="responseState",v-if="DataSource.AUDITING_STATUS == 1 || DataSource.AUDITING_STATUS == 2" class="responseStateBtn") 应会情况
        van-button(type="default",@click="cancelMeeting",v-if="DataSource.METTING_STATUS == 0",class="cancelMeetingBtn") {{$t('meetingCancel')}}
        //- :: 取消会议
        van-button(
          type="default",
          @click="querySelected",
          v-if="(DataSource.METTING_STATUS == 0 || DataSource.METTING_STATUS == 1) && (DataSource.AUDITING_STATUS == 1 || DataSource.AUDITING_STATUS == 2)", 
          class="permissionTransferBtn") {{$t('transferAuthority')}}
        //- :: 权限转移
        van-button(
          type="default",
          v-if="(DataSource.METTING_STATUS == 0 || DataSource.METTING_STATUS == 1) && (DataSource.AUDITING_STATUS == 1 || DataSource.AUDITING_STATUS == 2) && waterType == 0",
          @click="transferParticipationShow",
          class="permissionTransferBtn") {{$t('transferParticipation')}}
        //- :: 参会转移
        van-button(type="default",@click="modifyMeeting",v-if="DataSource.METTING_STATUS == 0") {{$t('revisionMeeting')}}
        //- :: 修改会议
        van-button(type="default",@click="meetingSummary",v-if="DataSource.METTING_STATUS == 2") {{$t('meetingSummary')}}
        //- :: 会议纪要
        van-button(type="default",@click="entrySettings",v-if="DataSource.METTING_STATUS == 1 && DataSource.AUDITING_STATUS != 4",class="entrySettingsBtn") {{$t('accessControl')}}
        //- :: 进入控制
      .control(v-if="listType == 'verify' && DataSource.AUDITING_STATUS == '0'")
        van-button(type="default",@click="verifyReject",class="endMeetingBtn") {{$t('reject')}}
        //- :: 驳回
        van-button(type="default",@click="verifyAdopt",class="entrySettingsBtn") {{$t('adopt')}}
        //- :: 通过
  van-popup(v-model="popupShow")
    .title {{$t('reasons')}}
    //- :: 填写原因
    .content
      textarea(
        :placeholder="$t('reviewReasons')",
        maxlength="150",
        v-model="verifyReason",
        @input="verifyReasonInput")
      //- 请输入原因并提交或无原因关闭
    .btn
      van-button(type="default",@click="sloseReason") {{$t('close')}}
      //- :: 关闭
      div
      van-button(type="default",:disabled="isDisabled",@click="submitReason" v-loading.fullscreen.lock="fullscreenLoading") {{$t('submit')}}
      //- :: 提交
  .delegation-operation(v-if="detailsShow === 'jurisdiction'" @click="personnelShow=true")
    i.iconfont.icon-meeting-attendees
    span {{$store.state.contacts.authorizer.total}}
  .mask(v-show="personnelShow && detailsShow === 'jurisdiction'" @click.self="personnelShow=false")
    PersonnelDetails(
      @hide-details="personnelShow=false",
      select-type="authorizer",
      :fixedChosen="fixedChosen",
      :businessType="4")
</template>
<script>
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as TYPES_MEETING from '@/stores/meeting/types'
import { getDataByKey } from '@/utils/array'
import { mapState } from 'vuex'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
import CContactsEnterprise from '@/components/c-contacts-enterprise'
import Summary from '../c-summary'
import Issue from '@/views/meeting-control/components/c-issue'
import PersonnelDetails from '../c-choose-contacts/components/c-personnel-details'
import moment from '@/commons/moment.js'
export default {
  data () {
    return {
      rTitle: this.$t('meetingDetails'), // :: 会议详情
      DataSource: {}, // 数据源
      fileUrl: '/fileServer', // 文件服务器路径
      loading: false, // loading开启关闭
      detailsShow: 'details', // empty：无详情数据，details：展示详情数据，jurisdiction：权限转移，localControl：本地会议控制，summary：会议纪要，notice：发送通知
      popupShow: false, // 驳回原因弹出层显示隐藏
      verifyReason: '', // 审核原因
      isDisabled: true, // 审核原因提交按钮禁用状态
      personnelShow: false, // 已选参会人列表显示隐藏
      fixedChosen: [], // 不可删除的授权人员
      examineData: [], // 审核记录
      fullscreenLoading: false, // 审核记录提交LOADING
      retractAndOpen: '展开', // 详情是否收起
      isNotice: false, // 是否可发送通知
      stateOption: { 1: this.$t('video'), 2: this.$t('local') }, // 会议类型 视频/本地

      meetingId: this.$route.query.meetingId,
      founderName: this.$route.query.founderName,
      unread: this.$route.query.unread,
      listType: this.$route.query.listType,
      Jurisdiction: this.$route.query.Jurisdiction,
      waterType: this.$route.query.waterType,
    }
  },
  computed: {
    ...mapState({
      // 联系人
      KIparameter (state) {
        return state.common.KIparameter || {}
      },
      customGroupMember (state) {
        return state.contacts.customGroupMember || {}
      }
    })
  },
	filters: {
		time (value) {
			return moment(value).format('YYYY.MM.DD HH:mm')
		}
	},
  components: {
    Scroll,
    PersonnelDetails,
    leftHeader: BarHeader,
    rightHeader: BarHeader,
    CContactsEnterprise,
    Summary,
    Issue
  },
  beforeRouterLeave(to,from,next) {
    if (to.name === 'meeting.index') {
      to.meta.keepAlive = true
    }
    next()
  },
  mounted () {
    this.getDetails()
    if(this.$route.params.authorizer){
      // 确认授权转移
      this.sureDelegation()
    }
    if(this.$route.params.agent){
      // 确认参会授权人
      this.transferParticipationEdit()
    }
    window['downLoadCallBack'] = (result) => {
      let obj = JSON.parse(result)
      if (obj.progress >= 100) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadCompleted')},${this.$t('saveAddress')}：${obj.downloadPath}`, duration: 3000, background: '#1989fa' })
      } else if (obj.state == 0) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadFailure')}`, duration: 2000 })
      }
    }
  },
  methods: {
		async examineHistory () {
			// 审核记录
			let vm = this;
      let req = [{
				metting_id: vm.meetingId,
        service: 'M4005400',
      }];
			let result = await vm.$ajaxRequest(req)
			if (result.code == 0) {
				vm.examineData = result.data
			} else {
        vm.$Notify({ message: result.msg })
			}
    },
    // 进入控制
    entrySettings () {      
      let vm = this
      if (vm.DataSource.VIDEO_CONFERENCE === '1') { // 视频会议控制
        if (vm.meetingId && vm.DataSource.METTING_PLAT_ID) {
          vm.getTableData()
        } else {
          this.$Notify(this.$t('noConferenceIDNoAccess')) // :: 平台会议创建失败，无法进入会控...
        }
      } else { // 本地会议控制
        if (vm.meetingId) {
          vm.getIntoControl()
        } else {
          this.$Notify(this.$t('noConferenceIDNoAccess')) // :: 平台会议创建失败，无法进入会控...
        }
      }
    },
    // 获取右侧会议列表数据
    async getTableData () {
      let vm = this
      let req = [
        {
          service: 'P1202614',
          id: vm.DataSource.METTING_PLAT_ID, // 会控ID
          metting_id: vm.meetingId, // 会议ID
          page: 1,
          pagecount: 10,
          mask: false
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.getIntoControl()
      } else if (result.code === '-1') {
        vm.$Notify({ message: this.$t('inTheProcessOfCreation'), background: '#FFF68F', color: '#8E8E8E' }) // :: 会议创建中，请耐心等待
      } else {
        vm.$Notify({ message: result.msg })
        if (result.code === '1347420162') {
          vm.meetingEnd() // 结束会议
        }
			}
    },
    // 进入会控
    getIntoControl () {
      this.$router.push({
        name: 'meeting-control',
        query: {
          meetingId: this.meetingId, // 会议ID
          meetingType: this.DataSource.VIDEO_CONFERENCE, // 会议类型
          platId: this.DataSource.METTING_PLAT_ID, // 会控ID
          ...this.$route.query
        }
      })
    },
    controlEnd (type) {
      // 会议控制结束会议
      if (type === 'end') {
        this.endMeeting() // 确认结束会议
      } else {
        this.meetingEnd() // 结束会议
      }
    },
    async cancelMeeting () {
      // 取消会议
      let vm = this
      vm.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isMeetingCancel') // :: 确认是否取消会议
      }).then(async () => {
        let req = [
          {
            service: 'P1202662',
            metting_plat_id: vm.DataSource.METTING_PLAT_ID,
            video_conference: vm.DataSource.VIDEO_CONFERENCE,
            metting_id: vm.meetingId
          }
        ]
        let result = await vm.$ajaxRequest(req, () => {
          vm.jumpPage()
        })
        if (result.code === '0') {
          vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
        } else {
          vm.$Notify({ message: result.msg })
        }
      }).catch(async => {

      })
    },
    async endMeeting () {
      // 结束会议
      let vm = this
      vm.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isMeetingEnd')  // :: 确认是否结束会议
      }).then(() => {
        vm.meetingEnd() // 结束会议
      })
    },
    async meetingEnd () {
      // 会议结束
      let vm = this
      let req = [{
        service: 'P1202627',
        metting_plat_id: vm.DataSource.METTING_PLAT_ID,
        video_conference: vm.DataSource.VIDEO_CONFERENCE,
        metting_id: vm.meetingId
      }]
      let result = await vm.$ajaxRequest(req, () => {
        vm.jumpPage()
      })
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    async getDetails () {
      // 获取会议详情
      let vm = this
      if (vm.type && vm.detailsShow === 'details') {
        return
      }
      if (!vm.meetingId) {
        vm.detailsShow = 'empty'
        vm.DataSource = []
        return
      }
      this.retractAndOpen = this.$t('expand') // :: 展开
      vm.loading = true
      let req = [{
        service: 'P1202613',
        metting_id: vm.meetingId, // 会议ID
        UNREAD: vm.unread, // 0：已读，1：未读
        mask: true // 禁用全局菊花
      }]
      let result = await vm.$ajaxRequest(req, () => {
        vm.loading = false
      })
      if (result.code === '0' && result.data.length > 0) {
        vm.DataSource = result.data[0]
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
        vm.DataSource.CTime = vm.DataSource.METTING_STARTTIME.replace(/-/ig, '.') // 会议创建时间
        vm.DataSource.conferenceList = getDataByKey(result.data[0].metting_room || [], 'ROOM_NAME').join('、')// 会场
        vm.DataSource.meetingType = vm.stateOption[vm.DataSource.VIDEO_CONFERENCE] // 会议类型
        if((vm.DataSource.AUDITING_STATUS == 1 || vm.DataSource.AUDITING_STATUS == 2) && this.$route.query.currentNav != 4){ // 审核已通过
          if(vm.DataSource.METTING_STATUS == 0 || vm.DataSource.METTING_STATUS == 1){ // 会议状态未开始，进行中
            vm.isNotice = true
          }
        }
        // 议题参会人
        vm.DataSource.metting_topics.forEach(val => {
          val.senator = getDataByKey([...val.user_code || [],...val.external || []], 'USER_NAME').join('、')
        })
        // 主持人
        vm.DataSource.hostContent = getDataByKey([...vm.DataSource.meeting_host || [], ...vm.DataSource.host_external || []],"USER_NAME").join('、')
        vm.DataSource.ORG_NAME = getDataByKey(result.data[0].org_id || [], 'ORG_NAME').join('、')// 主办部门
        // 参会领导
        vm.DataSource.insideContactsLeader = getDataByKey([...vm.DataSource.main_user_code || [], ...vm.DataSource.main_user_code_external || []], 'USER_NAME').join('、')
        // 参会人员
        vm.DataSource.attendeeList = getDataByKey([...vm.DataSource.user_code || [], ...vm.DataSource.external || []], 'USER_NAME').join('、')
        vm.detailsShow = 'details'
      } else {
        vm.DataSource = []
        vm.detailsShow = 'empty'
			}
    },
    // 会议详情展开收起
    retractAndOpenClick(){
      if(this.retractAndOpen === this.$t('expand')){ // :: 展开全部
        this.retractAndOpen = this.$t('retract') // :: 收起
      }else{
        this.retractAndOpen = this.$t('expand') // :: 展开全部
      }
    },
    modifyMeeting () { // 修改会议
      if (this.meetingId) {
        this.$router.push({
          name: 'meeting.edit',
          params: {
            meetingId: this.meetingId
          }
        })
      } else {
        this.$Notify(this.$t('noConferenceID')) // :: 没有会议ID
      }
    },
    // 进入会议纪要
    meetingSummary () {
      this.detailsShow = 'summary'
    },
    // 签到查看
    signInClick () {
      this.$router.push({
        name: 'meeting-sign',
        query: {
          meetingName: this.DataSource.METTING_NAME,
          ...this.$route.query
        }
      })
    },
    // 进入应会情况
    responseState () {
      this.$router.push({
        name: 'meeting-respond',
        query: {
          ...this.$route.query
        }
      })
    },
    // 返回详情
    returnDetails(type) {
      this.detailsShow = 'details'
    },
    // 发送议题通知
    sendingNotice(data) {
      // this.noticeDate = data
      // this.detailsShow = 'notice'
      this.$router.push({
        name: 'meeting-notice',
        params: {
          data: data, // 详情数据
          type: 'meeting-details' // 出口
        },
        query: {
          ...this.$route.query
        }
      })
    },
    delegationReturn (val) {
      // 授权转移返回至详情
      this.detailsShow = 'details'
      if (val === 'local') {
        this.getDetails()
      }
    },
    // 保存参会授权人
    async transferParticipationEdit() {
      if(!this.$route.params.agent || this.$route.params.agent.total < 1){
        return false
      }
      let vm = this;
      let req = [
        {
          service: "M4030901",
          MEETING_ID: vm.meetingId, // 会议ID
          WATER_USER: getDataByKey(this.$route.params.agent.member, 'USER_CODE').join(',') // 被授权人
        }
      ];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    // 确定转授权
    async sureDelegation () {      
      let vm = this
      if(!this.$route.params.authorizer || this.$route.params.authorizer.total < 1){
        return false
      }
      let req = [
        {
          service: 'm4030801',
          METTING_ID: vm.meetingId, // 会议ID
          USER_LICENSEE: getDataByKey(this.$route.params.authorizer.member, 'USER_CODE').join(','), // 授权人列表
          FOUNDER: vm.founderName // 创建人
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    async querySelected () {
      // 查询已授权人员
      let vm = this
      let req = [
        {
          service: 'm4030802',
          metting_id: vm.meetingId// 会议ID
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.fixedChosen = getDataByKey(result.data.filter(item => +item.OPERATION === 1), 'USER_CODE')
        let list = result.data.map(item => {
          item.CONTACTS_TYPE = '0'
          item.irrevocable = item.OPERATION === '1'
          return item
        })
        this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
          value: list
        })
      }
      this.$router.replace({
        name: 'contacts.organization',
        query: {
          scene: this.$t('transferAuthority'),  // 权限转移
          selectType: 'participantsIssue',
          key: 'participants',
          historyType: '2, 3',
          businessType: 4,
          ...this.$route.query
        }
      })
    },
    // 选择参会授权人
    transferParticipationShow () {
      // this.detailsShow = 'transferParticipation'
      this.$store.commit(TYPES_CONTACTS.M_CUSTOM_GROUP_MEMBER, {
        value: []
      })
      this.$router.push({
        name: 'contacts.organization',
        query: {
          scene: this.$t('transferParticipation'), // 组织机构
          selectType: 'customGroupMember',
          key: 'participants',
          historyType: '2, 3',
          businessType: 6,
          ...this.$route.query
        }
      })
    },
    verifyReject () {
      // 审核驳回
      this.verifyReason = ''
      this.popupShow = true
    },
    verifyAdopt () {
      // 审核通过
      this.verifySubmission('0')
    },
    verifyReasonInput () {
      // 监听审核原因输入更改提交按钮状态
      if (!this.verifyReason || this.verifyReason.match(/^[ ]*$/)) {
        this.isDisabled = true
      } else {
        this.isDisabled = false
      }
    },
    sloseReason () {
      // 关闭审核原因
      this.popupShow = false
    },
    submitReason () {
      // 提交审核原因
      this.verifySubmission('1')
      this.popupShow = false
    },
    async verifySubmission (state) {
      // 审核提交
      let vm = this
      vm.fullscreenLoading = true
      let req = [{
        service: 'P1202612',
        metting_type: vm.DataSource.METTING_TYPE, // 会议类型
        metting_id: vm.DataSource.METTING_ID, // 会议ID
        video_conference: vm.DataSource.VIDEO_CONFERENCE || '1', // 是否视频会议
        user_name: vm.DataSource.USER_NAME, // 创会人ID
        status: state, // 通过：1，驳回：0
        comments: vm.verifyReason, // 驳回原因
        // meeting_content:vm.DataSource.MEETING_CONTENT, // 会议内容
        metting_name: vm.DataSource.METTING_NAME // 会议名称
      }]
      let result = await vm.$ajaxRequest(req, () => {
        vm.fullscreenLoading = false
        vm.jumpPage()
      })
      if (result.code === '0') {
        vm.fullscreenLoading = false
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
      } else {
        vm.fullscreenLoading = false
        vm.$Notify({ message: result.msg })
      }
    },
    // 返回会议列表/审核列表
    jumpPage (type) {
      let jump = 'meeting'
      if(this.listType === 'verify'){ // 会议列表
        jump = 'meetingVerify.index'
      }
      this.$router.push({
        name: jump,
        params: {},
        query: {
          currentNav: this.$route.query.currentNav != 5 ? this.$route.query.currentNav : ''
        }
      })
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl';
</style>
