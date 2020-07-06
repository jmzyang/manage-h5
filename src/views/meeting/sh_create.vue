<template lang="pug">
  .page-wrap.meeting-create(ref="layoutPage")
    BarHeader(
      layout="title",
      :border="true",
      :back="true",
      :backEvent="true",
      @back="handlerBack",
      :title="isEdit ? $t('meetingDetailed') : $t('appointmentMeeting')")
      //- :: 会议详情 ，:: 预约会议
      template(slot="actions")
        .header-cancel(@click="closeVisible = true", v-if="!isEdit")
        //- :: 取消
    .meeting-create-form
      .input-block
        .input-item
            .input-item-con
              span.item-title.video-type
              //- :: 开始时间
              van-field.theme-input(
                v-model="formData.theme"
                placeholder="会议主题"
                :border="false",
                name="theme",
                :data-vv-as="$t('meetingTheme')"
                :class="formData.theme.length > 0 ? 'active' : ''"
              )
        .view-row
        .input-item(@click="selectItem('startTime')" style={'margin-top': '1px'})
          .input-item-con
            span.item-title.starttime {{!isEdit ? '日期' : ''}}
            //- :: 开始时间
            .input-con(:class="!isEdit ? '' : 'detail'") {{ formData.startTime ? formData.startTime.substring(0,10) :  $t('timeChoice') }}
              //- :: 请选择时间
              i.iconfont.icon-arrow-right.arrow-right(v-show="!isEdit")
              .meet-state(v-show="isEdit") 进行中
        .view-row
        .input-item(@click.stop="chooseFormItem('duration')")
          .input-item-con
            span.item-title.duration {{!isEdit ? '时间' : ''}}
            //- :: 会议时长
            .input-con(
              :class="!isEdit ? '' : 'detail'"
              name="duration"
              v-model="formData.duration"
              v-validate="'required'"
              :data-vv-as="$t('meetingDuration')"
              data-vv-name="duration")
              | {{ formData.duration ? `${moment(formData.startTime).format('HH:mm')} - ${moment(formData.startTime).add(formData.duration, 'minute').format('HH:mm') }` : $t('durationChoice') }}
              //- :: 分钟 :: 请选择
              i.iconfont.icon-arrow-right.arrow-right(v-show="!isEdit")
            span.tips {{ errors.first('duration') || ''}}
        .input-item( @click.stop="chooseFormItem('readinessTime')" v-if="+openReadinessTime === 1" )
          .input-item-con
            span.item-title.readinessTime {{$t('prepareTime')}}
            //- :: 准备时间
            .input-con(
              name="readinessTime"
              :data-vv-as="$t('prepareTime')"
              data-vv-name="readinessTime")
              | {{ readinessTime ? `${readinessTime}${$t('minutes')}` : $t('pleaseEnter') }}
              //- :: 分钟，请输入
              i.iconfont.icon-arrow-right.arrow-right
      //- .input-block
      //-   .input-item(@click="chooseFormItem('viewParticipants')")
      //-     .input-item-con
      //-       span.item-title.participants {{$t('attendee')}}
      //-       //- :: 参会人
      //-       .input-con(
      //-         name="participants",
      //-         v-model="formData.participants",
      //-         v-validate="'required'",
      //-         :data-vv-as="$t('attendee')"
      //-         data-vv-name="participants")
      //-         | {{participants.total ? `${!isEdit ? $t('selected') : ''} ${participants.total} ${$t('PCS')}${$t('attendee')}` : $t('pleaseChoose')}}
      //-         //- :: 已选择，::位参会人，::请选择
      //-         i.iconfont.icon-arrow-right.arrow-right
      //-       span.tips {{ participants.total ? participantsValidate: errors.first('participants') || ''}}
      //-   .view-row(style={'margin': 0})
      //-   Scroll.chose-box(v-loading="loading", :loading-text="$t('loading')")
      //-     ul
      //-       li.chose-item(v-for="item in participants.member")
      //-         img(src="https://profile.csdnimg.cn/7/E/6/3_y_cfeng")
      //-       li.chose-item(@click="chooseFormItem('participants')" v-show="!isEdit")
      //-         img(src="~@/assets/images/meeting/meet-user.png")
      .input-block
        //- 成员
        .input-item(@click="chooseFormItem('conferenceHall')")
          .input-item-con
            span.item-title.room 成员
            //- :: 成员
            .input-con(
              name="room"
              v-model="formData.room"
              v-validate="'required'"
              :data-vv-as="$t('conferenceHall')"
              data-vv-name="room")
              | {{meetingRoom.length ? `${!isEdit ? $t('selected') : ''} ${meetingRoom.length} ${$t('PCS')} 设备` : $t('pleaseChoose')}}
              //- :: 已选择，::个会场，::请选择
              i.iconfont.icon-arrow-right.arrow-right
            span.tips {{ errors.first('conferenceHall') || roomValidate}}
          .view-row(style={'margin': 0})
          Scroll.chose-box(v-loading="loading", :loading-text="$t('loading')")
            ul
              li.chose-item(v-for="item in meetingRoom")
                img(src="https://profile.csdnimg.cn/7/E/6/3_y_cfeng")
              li.chose-item(v-show="!isEdit")
                img(src="~@/assets/images/meeting/meet-user.png")
      .input-block(v-if="!isEdit")
        .input-item
          .input-item-con
            span.item-title.room 会议加密
            .input-con(
              name="room"
              v-model="formData.room"
              v-validate="'required'"
              :data-vv-as="$t('conferenceHall')"
              data-vv-name="room")
                van-switch(v-model="checked")
        .input-item(v-if="checked")
            .input-item-con
              span.item-title.lock
              //- :: 开始时间
              van-field.theme-input(
                v-model="formData && formData.meetPwd"
                placeholder="会议室密码"
                :border="false",
                name="theme",
                :data-vv-as="$t('meetingTheme')"
                type="number"
                :class="formData.meetPwd && formData.meetPwd.length > 0 ? 'active' : ''"
            )
      .input-block(v-else)
        .input-item
          .input-item-con
            van-cell(
              value="34587699"
              title="会议ID")
        .input-item
          .input-item-con
            van-cell(
              value="666666"
              title="会议密码")
    .commit-wrap
      //- button.reset(type="danger", @click="resetFormAll", v-if="!isEdit") {{$t('reset')}}
      //- button.reset(type="danger", @click="selectTem", v-if="!isEdit") {{$t('selectTemplate')}}
      button.submit(v-if="!isEdit", type="danger", @click="submit" v-loading.fullscreen.lock="loading") 确定预约
      button.submit(v-else, type="danger",v-loading.fullscreen.lock="loading") 立即参加
      //- button.submit( type="danger",v-loading.fullscreen.lock="loading") 取消会议
      //- button.submit( type="danger",v-loading.fullscreen.lock="loading") 再次发起
      //- button.submit( type="danger",v-loading.fullscreen.lock="loading") 变更会议
      //- :: 发布
    //- 事件选择器
    van-popup(
      v-model="startTimeShow"
      position="bottom")
      van-datetime-picker.chose-time(
        v-model="startTime"
        type="datetime"
        :min-date="minDate"
        :formatter="formatterDate"
        :title="$t('chooseStartTime')"
        :show-toolbar="true"
        cancel-button-text=""
        @confirm="datetimeConfirm"
        @cancel="datetimeCancel")
    van-actionsheet(
      v-model="closeVisible",
      :actions="closeActions",
      :cancel-text="$t('cancel')",
      @select="onSelectClose")
    van-popup(
      v-model="TemplatePopup")
      .meeting-extend
        .selection-template
          .selection-template-title
            span {{$t('pleaseChoose')}}:
            van-radio-group(v-model="templateListType")
              van-radio(name="1") {{$t('template')}}
              van-radio(name="2") {{$t('draft')}}
          .selection-template-main
            van-radio-group(v-model="templateRadio")
              van-cell-group
                van-cell(v-for="(item,index) in templates",
                v-if="item.TEMPLATETYPE === templateListType"
                :key="index",
                :title="item.METTING_TEMPLATE_NAME",
                clickable,
                @click="templateRadio = item.METTING_ID")
                  van-radio(:name="item.METTING_ID")
        .operation-extend
          van-button.extend(type="default" @click="TemplatePopup = false") {{$t('cancel')}}
          //- :: 取消
          van-button.extend(type="default" @click="extendAmeeting") {{$t('determine')}}
          //- :: 确定
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import moment from 'moment'
import { getDataByKey, externalFormatAdd } from '@/utils/array'
import { issueFormat, issueFormatFront } from '@/views/meeting/issue/utils'
import Scroll from '@/components/c-scroll/index.vue'
import storage from '@/commons/storage'
import BarHeader from '@/components/c-header'
import CActionsheet from '@/components/c-actionsheet'
export default {
  data () {
    return {
      scroll: {},
      isEdit: this.$route.name === 'meeting.edit', // 是否为修改会议
      meetingId: this.$route.params.meetingId ? this.$route.params.meetingId : '', // 要修改的会议ID
      formData: {
        theme: '', // 会议主题
        videoConference: '2', // 会议类型
        startTime: '', // 开始时间
        readinessTime: 0, // 准备时间
        duration: 30, // 会议时长
        room: '', // 会场
        convenor: '', // 主持人
        leader: '', // 参会人领导
        participants: '', // 参会人
        issue: '', // 议题
        notifyMode: '2', // 通知方式
        serviceItems: '', // 服务项
        classification: '' // 会议分类
      },
      templates: [], // 模板列表
      TemplatePopup: false, // 弹出层
      checked: false, // 安全滑动块
      templateRadio: '', // 模板单选项
      templateListType: '1', // 模板、草稿列表选择
      openReadinessTime: 0, // 准备时间
      startTimeShow: false, // 选择时间弹出层
      minDate: new Date(),
      startTime: new Date(),
      oldStartTime: new Date(),
      sureStarTime: new Date(),
      selectNotifyMode: {
        '0': false,
        '1': false,
        '2': true
      },
      metting_status: '', // 修改会议时的会议状态
      firstValidate: true, // 是否为第一次校验输入
      loading: false,
      // 关闭反馈参数
      closeVisible: false,
      closeActions: [
        {
          name: this.$t('deleteDraft'), // 删除草稿
          className: 'delete'
        },
        {
          name: this.$t('saveDraft') // 保存草稿
        }
      ],
      meetingClassification: [], // 会议分类
      classVal: '' // 会议分类选中的值
    }
  },
  computed: {
    ...mapState({
      storeMutationForm (state) {
        let result = TYPES_MEETING.M_MEETING_FORM_DATA
        if (state.route.name === 'meeting.edit') {
          result = TYPES_MEETING.M_MEETING_FORM_DATA_EDIT
        }
        return result
      },
      KIparameter (state) {
        return state.common.KIparameter || {}
      },
      storeMeetingFormData: state => state.meeting[state.route.name === 'meeting.edit' ? 'meetingFormDataEdit' : 'meetingFormData']
    }),
    meetingIssue () {
      return this.storeMeetingFormData.meetingIssue || []
    },
    meetingRoom () {
      return this.storeMeetingFormData.meetingRoom || []
    },
    convenor () {
      return this.storeMeetingFormData.convenor || { organization: [], member: [], total: 0 }
    },
    participants () {
      return this.storeMeetingFormData.participants || { organization: [], member: [], total: 0 }
    },
    leader () {
      return this.storeMeetingFormData.leader || { organization: [], member: [], total: 0 }
    },
    serviceItems () {
      return this.storeMeetingFormData.serviceItems || []
    },
    readinessTime () {
      return this.storeMeetingFormData.readinessTime || 0
    },
    participantsValidate () {
      // 外部联系人
      const externalContacts = this.participants.member.filter(item => +item.CONTACTS_TYPE === 1)
      let validate = this.participants.total > externalContacts.length
      if (validate) {
        return ''
      } else {
        return this.$t('needToIncludeInsiders') // :: 参会人必须包含内部联系人
      }
    },
    roomValidate () {
      // 会场的扩展验证方式
      console.log(`roomValidate`, this.meetingRoom)
      let num = this.meetingRoom.length
      if (this.firstValidate && num === 0) {
        return ''
      }
      if (this.formData.videoConference === '2') { // 本地会议只能选一个会场
        if (num > 1) {
          return this.$t('localVenuesIimit1') // 本地会议只能选一个会场
        } else {
          return ''
        }
      } else if (this.formData.videoConference === '1') { // 视频会议只能选两个及以上会场
        if (num < 2) {
          return this.$t('tooFewVideoVenues') // 视频会议只能选两个及以上会场
        } else {
          return ''
        }
      }
    }
  },
  watch: {
    sureStarTime (val, oldVal) {
      this.formData.startTime = moment(val).format('YYYY-MM-DD HH:mm:ss')
      this.$store.commit(this.storeMutationForm, {
        type: 'assign',
        value: {
          startTime: moment(val).format('YYYY-MM-DD HH:mm:ss')
        }
      })
    },
    selectNotifyMode: {
      deep: true,
      immediate: true,
      handler (val) {
        let arr = []
        for (let attr in val) {
          if (val[attr]) {
            arr.push(attr)
          }
        }
        this.formData.notifyMode = arr.join(',')
      }
    }
  },
  async mounted () {
    this.getMeetingClass()
    // 修改会议时获取会议信息
    const isGeted = (this.storeMeetingFormData.meetingId === this.meetingId)
    if (this.isEdit && !isGeted) {
      this.loading = true
      let result = await this.$ajaxRequest({
        service: 'P1202613',
        metting_id: this.meetingId
      }, () => {
        this.loading = false
      })
      if (result.code === '0') {
        this.modifyDefaultItem(result.data[0])
      } else {
        this.$notify(result.msg)
      }
    } else {
      let START_TIME = this.storeMeetingFormData.startTime || moment().add(5, 'm').format('YYYY/MM/DD HH:mm:ss')
      if (this.$route.query.roomId) {
        START_TIME = moment().add(5, 'm').format('YYYY/MM/DD HH:mm:ss')
      }
      this.formData.startTime = START_TIME
      let t = new Date(moment(START_TIME).format('YYYY/MM/DD HH:mm:ss')).getTime()
      this.formData.classification = this.storeMeetingFormData.classification || '',
      this.startTime = new Date(t)
      this.sureStarTime = new Date(t)
      this.oldStartTime = new Date(t)
      this.formData.duration = this.storeMeetingFormData.duration || 30,
      this.formData.theme = this.storeMeetingFormData.theme || '',
      this.formData.videoConference = this.storeMeetingFormData.videoConference + '' || '2'
      this.metting_status = this.storeMeetingFormData.metting_status
      this.storeMeetingFormData.notifyMode.split(',').forEach((item) => {
        this.selectNotifyMode[item] = true
      })
      // 初始化验证
      this.initValidate()

      if (!storage.isInitialCreate) {
        // 服务项
        this.getServiceItem()
      }
    }
  },
  components: {
    BarHeader,
    CActionsheet,
    Scroll
  },
  created () {
    // 准备时间
    this.getSystemParameter()
    // 模板
    this.getTemplate()
    // 扫码创会
    this.scanCreate()
  },
  methods: {
    initScroll () {
      let width = this.recommendList.length * 110// 动态计算出滚动区域的大小，前面已经说过了，产生滚动的原因是滚动区域宽度大于父盒子宽度
      this.$refs.cont.style.width = width + 'px'  // 修改滚动区域的宽度
      this.$nextTick(() => {
        if (!this.scroll) {
          this.scroll = new BScroll(this.$refs.wrapper, {
            startX: 0,  // 配置的详细信息请参考better-scroll的官方文档，这里不再赘述
            click: true,
            scrollX: true,
            scrollY: false,
            eventPassthrough: 'vertical'
          })
        } else {
          this.scroll.refresh()
        }
      })
    },
    // 初始化校验
    initValidate () {
      if (this.storeMeetingFormData.meetingRoom.length) {
        this.formData.room = 'true'
      } else {
        this.formData.room = ''
      }
      if (this.storeMeetingFormData.participants.total > 0) {
        this.formData.participants = 'true'
      } else {
        this.formData.participants = ''
      }
      if (this.storeMeetingFormData.leader.total > 0) {
        this.formData.leader = 'true'
      } else {
        this.formData.leader = ''
      }
      if (this.storeMeetingFormData.convenor.total > 0) {
        this.formData.convenor = 'true'
      } else {
        this.formData.convenor = ''
      }
    },
    // 获取服务项
    async getServiceItem () {
      let req = [{
        service: 'P0004011',
        DICT_CODE: 'CONFERENCE_SERVICES',
        mask: false // 禁用全局菊花
      }]
      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        this.$store.commit(this.storeMutationForm, {
          type: 'assign',
          value: {
            serviceItems: getDataByKey(result.data, 'DICT_ITEM_NAME')
          }
        })
      }
    },
    async getMeetingClass () {
      let vm = this
      let req = [{
        service: 'P0004011',
        DICT_CODE: 'TOPIC_TYPE',
        mask: false // 禁用全局菊花
      }]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.meetingClassification = result.data
        if (this.storeMeetingFormData.classification) {
          this.classVal = this.meetingClassification[this.storeMeetingFormData.classification].DICT_ITEM_NAME
        }
      } else {
        vm.$Notify({ message: result.msg })
      }
    },
    // 选择表单项，路由跳转
    chooseFormItem (val) {
      this.$store.commit(this.storeMutationForm, {
        type: 'assign',
        value: {
          theme: this.formData.theme,
          startTime: this.formData.startTime,
          duration: this.formData.duration,
          videoConference: this.formData.videoConference,
          account: this.formData.notifyMode
        }
      })
      switch (val) {
        // 选择会议分类
        case 'classification':
          this.$router.push({
            name: 'meeting.chooseClassification',
            query: {
              meetingId: this.meetingId,
              stateName: (this.isEdit ? 'meetingFormDataEdit' : 'meetingFormData'),
              mutation: this.storeMutationForm,
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        // 选择时长
        case 'duration':
          this.$router.push({
            name: 'meeting.chooseDuration',
            query: {
              meetingId: this.meetingId,
              stateName: (this.isEdit ? 'meetingFormDataEdit' : 'meetingFormData'),
              mutation: this.storeMutationForm,
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        // 选择服务项
        case 'serviceItems':
          this.$router.push({
            name: 'meeting.chooseServiceItem',
            query: {
              meetingId: this.meetingId,
              stateName: (this.isEdit ? 'meetingFormDataEdit' : 'meetingFormData'),
              mutation: this.storeMutationForm,
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        // 准备时间
        case 'readinessTime':
          this.$router.push({
            name: 'meeting.readyTime',
            query: {
              meetingId: this.meetingId,
              stateName: (this.isEdit ? 'meetingFormDataEdit' : 'meetingFormData'),
              mutation: this.storeMutationForm,
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        // 选择会场
        case 'conferenceHall':
          this.$store.commit(TYPES_MEETING.M_MEETING_ROOM, {
            value: this.meetingRoom
          })
          this.$router.push({
            name: 'meeting.chooseMeetingRoom',
            query: {
              // 会场ID
              meetingId: this.meetingId,
              // 会议类型
              videoConference: this.formData.videoConference,
              // 会议开始时间
              startTime: this.formData.startTime,
              // 会场
              duration: this.formData.duration,
              mutation: 'M_MEETING_ROOM',
              stateName: 'meetingRoom',
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        // 选择主持人
        case 'convenor':
          this.$store.commit(TYPES_CONTACTS.M_CONVENOR, {
            value: this.convenor
          })
          this.$router.push({
            name: 'contacts.index',
            query: {
              meetingId: this.meetingId,
              scene: this.$t('host'), // 主持人
              selectType: 'convenor',
              key: 'convenor',
              historyType: '4, 5',
              businessType: this.isEdit ? 1 : 0
            }
          })
          break
        // 查看参会人
        case 'viewParticipants':
          this.$store.commit(TYPES_CONTACTS.M_PARTICIPANTS, {
            value: this.participants
          })
          this.$router.push({
            name: 'contacts.index.view',
            query: {
              meetingId: this.meetingId,
              scene: this.$t('attendee'), // 参会人
              selectType: 'participants',
              key: 'participants',
              historyType: '2, 3',
              businessType: this.isEdit ? 1 : 0
            }
          })
          break
        // 选择参会人
        case 'participants':
          this.$store.commit(TYPES_CONTACTS.M_PARTICIPANTS, {
            value: this.participants
          })
          this.$router.push({
            name: 'contacts.index',
            query: {
              meetingId: this.meetingId,
              scene: this.$t('attendee'), // 参会人
              selectType: 'participants',
              key: 'participants',
              historyType: '2, 3',
              businessType: this.isEdit ? 1 : 0
            }
          })
          break
        // 选择参会人领导
        case 'leader':
          this.$store.commit(TYPES_CONTACTS.M_PARTICIPANTS_LEADER, {
            value: this.leader
          })
          this.$router.push({
            name: 'contacts.index',
            query: {
              meetingId: this.meetingId,
              scene: this.$t('attendeeLeader'), // 主持人
              selectType: 'leader',
              key: 'leader',
              historyType: '4, 5',
              businessType: this.isEdit ? 1 : 0
            }
          })
          break
        // 选择议题
        case 'issue':
          // this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE, {
          //   value: this.meetingIssue
          // })
          this.$router.push({
            name: 'meeting.chooseIssue',
            query: {
              meetingId: this.meetingId,
              issueType: 2, // 议题类型 1：会议控制、2：创建会议
              stateName: (this.isEdit ? 'meetingFormDataEdit' : 'meetingFormData'),
              mutation: this.storeMutationForm,
              businessType: (this.isEdit ? 1 : 0)
            }
          })
          break
        default:
          break
      }
    },
    // 获取模板，草稿
    async getTemplate () {
      let vm = this
      let req = [{
        service: 'P1202638',
        metting_template_name: '',
        metting_status: '0'
      }]
      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        vm.templates = result['data']
      } else {
        vm.templates = []
      }
    },
    // 选择模板
    selectTem () {
      this.templateListType = '1'
      this.templateRadio = ''
      this.TemplatePopup = true
    },
    async extendAmeeting () {
      if (!this.templateRadio) {
        this.resetFormAll()
      }
      this.TemplatePopup = false
      this.selectNotifyMode[2] = false
      let vm = this
      let req = [{
        service: 'P1202629',
        metting_id: this.templateRadio
      }]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        let data = result.data.map((item) => {
          item.LENGTH = item.LENGTH || '30'
          item.metting_room = item.metting_chamber || []
          item.main_user_code = item.main_user_code || []
          item.METTING_ENDTIME = moment(item.METTING_ENDTIME).format('YYYY-MM-DD HH:mm:ss')
          item.METTING_STARTTIME = moment(item.METTING_STARTTIME).format('YYYY-MM-DD HH:mm:ss')
          item.user_code = item.user_code || []
          item.external = item.external || []
          return item
        })
        this.modifyDefaultItem(data[0])
      } else {
        this.resetFormAll()
      }
    },
    submit () {
      this.firstValidate = false
      this.loading = true
      this.$validator.validateAll().then(async (result) => {
        console.log(`$validator`, result)
        if (result) {
          this.loading = false
          if (this.roomValidate || this.participantsValidate) {
            this.$notify({
              message: this.$t('inspectionOfParticipants'), // 请检查会场和参会人
              background: '#1989fa'
            })
            return false
          }
          // 会场
          const metting_chamber = getDataByKey(this.meetingRoom, 'ROOM_ID').join(',')
          // 主持人
          const creator = await UTILS_CONTACTS.getMembers(this.convenor)
          // 内部主持人
          const creatorEnterprise = getDataByKey(creator.filter(item => +item.CONTACTS_TYPE != 1), 'USER_CODE').join(',')
          // 外部主持人
          const creatorExternal = externalFormatAdd(creator.filter(item => +item.CONTACTS_TYPE == 1))
          // 参会人领导
          const leader = await UTILS_CONTACTS.getMembers(this.leader)
          // 内部参会人领导
          const leaderEnterprise = getDataByKey(leader.filter(item => +item.CONTACTS_TYPE != 1), 'USER_CODE').join(',')
          // 外部参会人领导
          const leaderExternal = externalFormatAdd(leader.filter(item => +item.CONTACTS_TYPE == 1))
          // 参会人
          const contacts = await UTILS_CONTACTS.getMembers(this.participants)
          // 内部联系人
          const contactsEnterprise = getDataByKey(contacts.filter(item => +item.CONTACTS_TYPE != 1), 'USER_CODE').join(',')
          // 外部联系人
          const contactsExternal = externalFormatAdd(contacts.filter(item => +item.CONTACTS_TYPE == 1))
          // 议题格式转换
          const MEETING_ISSUES = await issueFormat(JSON.parse(JSON.stringify(this.meetingIssue)))

          // 准备时间
          let READY_TIME = this.formData.startTime
          if (this.readinessTime && this.readinessTime > 0 && +this.openReadinessTime === 1) {
            READY_TIME = moment(this.formData.startTime).subtract(this.readinessTime, 'm').format('YYYY-MM-DD HH:mm:ss') // 准备时间
          }

          let req = {
            service: this.isEdit ? 'P1202610' : 'P1202588', // 服务
            topic_type: this.formData.classification, // 会议分类
            metting_type: 2, // 会议类型
            metting_startTime: this.formData.startTime, // 开始时间
            metting_endTime: moment(this.formData.startTime).add(+this.formData.duration, 'm').format('YYYY-MM-DD HH:mm:ss'), // 结束时间
            date: this.formData.duration,
            metting_chamber: metting_chamber, // 会场id
            meeting_host: creatorEnterprise, // 主持人window.g_user.userName
            host_external: creatorExternal, // 外部主持人
            user_code: contactsEnterprise, // 内部参会人员
            metting_name: this.formData.theme, // 会议主题
            metting_topics: JSON.stringify(MEETING_ISSUES), // 会议议题
            external: contactsExternal, // 外部联系人
            video_conference: this.formData.videoConference, // 是否视频会议
            READY_TIME: READY_TIME, // 会议准备时间
            notice_channel: this.KIparameter.OPEN_MEETING_NOTICE != 1 ? this.formData.notifyMode : '', // 通知渠道
            devicetype: this.serviceItems.join('、'), // 服务项
            main_user_code: this.KIparameter.MAIN_PARTICIPANTS == 1 ? leaderEnterprise : '', // 参会人领导
            METTING_COMMON_PWD: this.formData.meetPwd || '',
            main_user_code_external: this.KIparameter.MAIN_PARTICIPANTS == 1 ? leaderExternal : '' // 参会人领导
          }
          if (this.isEdit) {
            this.loading = false
            req.metting_id = this.meetingId
            req.date = this.formData.duration
            req.metting_status = this.metting_status
          }
          this.participantConflict(req)
        }
        this.loading = false
      })
    },
    // 参会人冲突
    async participantConflict (req) {
      let req2 = JSON.parse(JSON.stringify(req))
      req2.service = 'M4007002'
      const result = await this.$ajaxRequest(req2)
      if (result.code === '0' && result.data[0] && result.data[0].REPEAT) {
        this.loading = false
        // this.$Dialog.alert({
        //   title: this.$t('tips'), // :: 提示
        //   message: result.data[0].REPEAT, // :: 会议已超时结束或被删除！
        // })
        this.$Dialog.confirm({
          title: this.$t('tips'),
          message: result.data[0].REPEAT,
          confirmButtonText: this.$t('continueToCreate'),
          cancelButtonText: this.$t('cancelCreation')
        }).then(async () => {
          this.creatingMeetings(req) // 有冲突，创建会议
        })
      } else {
        this.creatingMeetings(req) // 无冲突，创建会议
      }
    },
    // 创会提交
    async creatingMeetings (req) {
      this.$ajaxRequest([req]).then((result) => {
        if (result.code === '0') {
          this.loading = false
          this.$notify({
            message: this.isEdit ? this.$t('successfulRevisionOfTheMeeting') : this.$t('createMeetingSuccess'),
            background: '#1989fa'
          })
          // :: 会议修改成功，:: 会议创建成功
          this.$destroy()
          this.$router.replace({
            name: 'meeting',
            query: {
              currentNav: result.data[0].AUDIT_STATUS == 0 ? 2 : 0
            }
          })
        } else {
          this.loading = false
          this.$notify(result.msg)
        }
      })
    },
    selectItem (itemName) {
      if (itemName === 'startTime') {
        this.startTimeShow = true
        this.oldStartTime = this.sureStarTime
      } else {
      }
    },
    formatterDate (type, value) {
      if (type === 'year') {
        return `${value}${this.$t('year')}`
      } else if (type === 'month') {
        return `${value}${this.$t('month')}`
      } else if (type === 'day') {
        return `${value}${this.$t('day')}`
      } else if (type === 'hour') {
        return `${value}${this.$t('hour')}`
      } else if (type === 'minute') {
        return `${value}${this.$t('minute')}`
      }
      return value
    },
    issue (issue) {
      this.formData.issue = issue
    },
    moment,
    datetimeConfirm () {
      this.oldStartTime = this.sureStarTime
      this.sureStarTime = this.startTime
      this.startTimeShow = false
      this.lockMeetingRoomEdit(this.startTime)
    },
    datetimeCancel () {
      // this.sureStarTime = this.oldStartTime
      this.startTimeShow = false
    },
    // 锁定会场-时间修改
    async lockMeetingRoomEdit (_time) {
      // 判断是否有会场
      if (this.meetingRoom.length === 0) {
        return false
      }
      // 预约会议
      this.loading = true
      let options = {
        service: 'M4005305',
        metting_id: this.meetingId,
        METTING_STARTTIME: moment(_time).format('YYYY-MM-DD HH:mm:ss'),
        DURATION: this.formData.duration,
        ROOM_ID: getDataByKey(this.meetingRoom, 'ROOM_ID').join(','),
        OLD_METTING_STARTTIME: moment(this.oldStartTime).format('YYYY-MM-DD HH:mm:ss'),
        OLD_DURATION: this.formData.duration,
        mask: false
      }
      let result = await this.$ajaxRequest(options, () => {
        this.loading = false
      })
      if (+result.code === 0) {
        let meetingRoom = JSON.parse(JSON.stringify(this.meetingRoom))
        result.data.forEach(rItem => {
          meetingRoom = meetingRoom.filter((item) => {
            return +item.ROOM_ID !== +rItem.ROOM_ID && +rItem.STATUS !== 2
          })
        })

        this.$store.commit(this.storeMutationForm, {
          type: 'assign',
          value: {
            meetingRoom: meetingRoom
          }
        })
      }
    },
    // 获取会议详情，并赋值
    async modifyDefaultItem (data) {
      console.log(data)
      this.formData.theme = data.METTING_NAME
      this.metting_status = data.METTING_STATUS
      this.formData.videoConference = data.VIDEO_CONFERENCE
      this.formData.startTime = data.METTING_STARTTIME
      this.formData.classification = data.TOPIC_TYPE // 会议分类
      if (data.TOPIC_TYPE) {
        this.classVal = this.meetingClassification[data.TOPIC_TYPE].DICT_ITEM_NAME
      }

      if (data.METTING_TYPE !== 1 && moment(data.METTING_STARTTIME) < moment()) {
        this.formData.startTime = moment().add(5, 'm').format('YYYY-MM-DD HH:mm:ss')
      }
      data.NOTICE_CHANNEL.split(',').forEach((item) => {
        this.selectNotifyMode[item] = true
      })
      this.startTime = new Date(Date.parse(this.formData.startTime.replace(/-/g, '/')))
      this.sureStarTime = new Date(Date.parse(this.formData.startTime.replace(/-/g, '/')))

      this.formData.duration = +data.LENGTH

      this.metting_status = data.METTING_STATUS

      const PARTICIPANTS = [
        ...data.user_code,
        ...data.external.map((item) => {
          item.USER_CODE = item.OUTSIDE_USER_CODE
          item.CONTACTS_TYPE = '1'
          item.EMAIL = item.EMAIL_ADDRESS
          item.MOBILE = item.PHONE_NO
          return item
        })
      ]

      const CONVENOR = [
        ...data.meeting_host,
        ...data.host_external.map((item) => {
          item.USER_CODE = item.OUTSIDE_USER_CODE
          item.CONTACTS_TYPE = '1'
          item.EMAIL = item.EMAIL_ADDRESS
          item.MOBILE = item.PHONE_NO
          return item
        })
      ]

      const LEADER = data.main_user_code.map((item) => {
        item.CONTACTS_TYPE = '0'
        return item
      })

      // 议题格式转换
      const MEETING_ISSUES = await issueFormatFront(JSON.parse(JSON.stringify(data.metting_topics)))

      this.$store.commit(this.storeMutationForm, {
        type: 'assign',
        value: {
          meetingId: this.meetingId,
          theme: data.METTING_NAME,
          readinessTime: data.READY_TIME,
          startTime: data.METTING_STARTTIME,
          duration: +data.LENGTH,
          notifyMode: data.NOTICE_CHANNEL || '2',
          videoConference: data.VIDEO_CONFERENCE,
          meetingIssue: MEETING_ISSUES.map(item1 => {
            item1.fileList = item1.fileList.map(item2 => {
              item2.name = item2.name || item2.NAME
              item2.NAME = item2.NAME || item2.name
              item2.url = item2.url || item2.URL
              item2.URL = item2.URL || item2.url
              return item2
            })
            if (item1.vote) {
              item1.vote = item1.vote.map(b => {
                b.voteContent = b.VOTE_TITLE
                return b
              })
            }
            return item1
          }),
          meetingRoom: data.metting_room,
          serviceItems: data.DEVICETYPE ? data.DEVICETYPE.split('、') : [],
          convenor: {
            organization: [],
            member: CONVENOR,
            total: CONVENOR.length
          },
          participants: {
            organization: [],
            member: PARTICIPANTS,
            total: PARTICIPANTS.length
          },
          metting_status: data.METTING_STATUS,
          leader: {
            organization: [],
            member: LEADER,
            total: LEADER.length
          }
        }
      })
      this.initValidate()
    },
    handlerBack () {
      this.saveStorageFormData(false)
      this.$router.replace({
        name: 'meeting.index'
      })
    },
    // 关闭此页面反馈事件
    onSelectClose (item) {
      this.closeVisible = false
      switch (item.name) {
        case this.$t('deleteDraft'):
          this.saveStorageFormData(false)
          this.$router.replace({
            name: 'meeting.index'
          })
          break
        case this.$t('saveDraft'):
          this.saveStorageFormData(true)
          this.$router.replace({
            name: 'meeting.index'
          })
          break
        default:
          break
      }
    },
    // 重置
    resetFormAll () {
      this.saveStorageFormData(false)
      const START_TIME = moment().add(5, 'm').format('YYYY/MM/DD HH:mm:ss')
      this.formData.startTime = START_TIME
      let t = new Date(moment(START_TIME).format('YYYY/MM/DD HH:mm:ss')).getTime()
      this.formData.classification = '',
      this.startTime = new Date(t)
      this.sureStarTime = new Date(t)
      this.oldStartTime = new Date(t)
      this.formData.duration = 30,
      this.formData.theme = '',
      this.formData.videoConference = '2'
      this.storeMeetingFormData.notifyMode.split(',').forEach((item) => {
        this.selectNotifyMode[item] = true
      })
      // 初始化验证
      this.initValidate()
      this.getServiceItem()
    },
    // 保存到本地存储
    saveStorageFormData (isSave) {
      storage.isInitialCreate = false
      const meetingId = isSave ? this.meetingId : ''
      const theme = isSave ? this.formData.theme : ''
      const startTime = isSave ? this.formData.startTime : ''
      const duration = isSave ? this.formData.duration : ''
      const videoConference = isSave ? this.formData.videoConference : '2'
      const meetingIssue = isSave ? this.meetingIssue : []
      const meetingRoom = isSave ? this.meetingRoom : []
      const serviceItems = isSave ? this.serviceItems : []
      const convenor = isSave ? this.convenor : { organization: [],
        member: [{
          USER_CODE: this.$store.state.common.userBaseInfo.USER_CODE,
          USER_NAME: this.$store.state.common.userBaseInfo.USER_NAME,
          CONTACTS_TYPE: '0'
        }],
        total: 1 }
      const participants = isSave ? this.participants : { organization: [], member: [], total: 0 }
      const leader = isSave ? this.leader : { organization: [], member: [], total: 0 }
      const notifyMode = isSave ? this.formData.notifyMode : '2'
      const classification = isSave ? this.formData.classification : ''
      this.$store.commit(this.storeMutationForm, {
        value: {
          meetingId,
          theme,
          startTime,
          duration,
          videoConference,
          meetingIssue,
          meetingRoom,
          serviceItems,
          convenor,
          participants,
          leader,
          notifyMode,
          classification
        }
      })
    },
    currentTime () {
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var min = date.getMinutes() + 5
      var seconds = date.getSeconds()
      if (month < 10) {
        month = '0' + month
      }
      if (day < 10) {
        day = '0' + day
      }
      if (hour < 10) {
        hour = '0' + hour
      }
      if (min < 10) {
        min = '0' + min
      }
      if (seconds < 10) {
        seconds = '0' + seconds
      }
      return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + seconds
    },
    // 扫一扫创会
    scanCreate () {
      let vm = this
      let roomId = this.$route.query.roomId
      let startTime = vm.currentTime()
      // let startTime = vm.formData.startTime
      let duration = vm.formData.duration
      if (roomId) {
        this.$ajaxRequest([{ // 请求会场信息,同时判断会场是否可用,如果可用就把会场信息存入vuex,不可用给出提示
          service: 'M4030920',
          ROOM_ID: roomId,
          metting_startTime: startTime,
          duration: duration
        }]).then(result => {
          // vm.scanData = result.data[0].MSG_CODE  undefined
          if (result.code === '0') {
            if (result.head.MSG_CODE == '0') {
              result.data[0].checked = false
              this.$store.commit('M_MEETING_FORM_DATA', {
                type: 'assign',
                value: {
                  meetingRoom: [result.data[0]]
                }
              })
            } else {
              this.$store.commit('M_MEETING_FORM_DATA', {
                type: 'clear'
              })
              vm.$Dialog.alert({
                message: result.head.MSG_TEXT
              })
            }
          } else {
            this.$store.commit('M_MEETING_FORM_DATA', {
              type: ' ',
              value: {
                // serviceItems: this.getServiceItem(),
                serviceItems: this.serviceItems,
                convenor: this.convenor
              }
            })
            setTimeout(function () {
              vm.$Dialog.alert({
                message: result.head.MSG_TEXT
              })
            }, 300)
          }
        })
      }
    }
  }
}
</script>

<style scoped lang="stylus">
  @import './create.styl'
</style>
