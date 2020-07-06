<template lang="pug">
  .notice-container
    BarHeader(layout="default")
      .container-title(class="title")
        span(@click="noticeReturn")
          | {{$t('cancel')}}
          //- :: 取消
        | {{$t('sendNotice')}}
        //- :: 发送通知
    .notice-box
      Scroll
        .title(v-if="noticeDate.TOPIC_ID")
          | {{$t('issue')}}{{$toChinesNum(noticeDate.index)}}：{{noticeDate.TOPIC_NAME}}
          //- :: 议题
        .title(v-if="!noticeDate.TOPIC_ID")
          | {{$t('meetingTheme')}}：{{noticeDate.METTING_NAME}}
          //- :: 会议主题：
        .main
          .type
            span {{$t('messageType')}}：
            //- :: 消息类型
            <van-radio-group v-model="radio">
              <van-radio name="0">{{$t('newMeetingNotice')}}</van-radio>
              //- :: 新会议通知
              <van-radio name="1">{{$t('cancelMeetingNotice')}}</van-radio>
              //- :: 取消会议通知
              <van-radio name="2">{{$t('changeMeetingNotice')}}</van-radio>
              //- :: 更改会议通知
            </van-radio-group>
          //- .notice-info-div(contenteditable="true" ref="issuesInfo")
          .content
            textarea(:placeholder="$t('inputNoticeCentent')" maxlength="250" v-model="noticeContent")
            //- 请输入通知内容
          .attendee-box(v-if="noticeDate.leaderNumber && noticeDate.leaderNumber > 0")
            .attendee-title
              div
                | {{$t('attendeeLeader')}}
                span {{noticeDate.leaderNumber}}/
                span {{leaderUser_code.length + leaderExternal.length}}{{$t('people')}}
              span(@click="selectionLeaderAll")
                | {{leaderSelectAll}}
            .attendee-list
              .attendee(v-for="(val,index) in noticeDate.main_user_code" :key="'a' + index")
                .attendee-headPortrait
                  div(:class="{selectionAttendee:leaderUser_code.indexOf(val.USER_CODE) < 0}" @click="selectionLeader(val,'user_code')")
                    i.icon-issue-checked.iconfont
                    .avatar(v-avatar="val.USER_ICON", :full-name="val.USER_NAME")
                  .attendee-name {{val.USER_NAME}}
              .attendee(v-for="(val,index) in noticeDate.main_user_code_external" :key="'b' + index")
                .attendee-headPortrait
                  div(:class="{selectionAttendee:leaderExternal.indexOf(val.OUTSIDE_USER_CODE) < 0}" @click="selectionLeader(val,'external')")
                    i.icon-issue-checked.iconfont
                    .avatar(v-avatar="val.USER_ICON", :full-name="val.USER_NAME")
                  .attendee-name {{val.USER_NAME}}
          .attendee-box
            .attendee-title
              div
                | {{noticeAttendee}}
                span {{noticeDate.attendeeNumber}}/
                span {{user_code.length + external.length}}{{$t('people')}}
              span(@click="selectionSttendeeAll")
                | {{isSelectAll}}
            .attendee-list
              .attendee(v-for="(val,index) in noticeDate.user_code" :key="'a' + index")
                .attendee-headPortrait
                  div(:class="{selectionAttendee:user_code.indexOf(val.USER_CODE) < 0}" @click="selectionSttendee(val,'user_code')")
                    i.icon-issue-checked.iconfont
                    .avatar(v-avatar="val.USER_ICON", :full-name="val.USER_NAME")
                  .attendee-name {{val.USER_NAME}}
              .attendee(v-for="(val,index) in noticeDate.external" :key="'b' + index")
                .attendee-headPortrait
                  div(:class="{selectionAttendee:external.indexOf(val.OUTSIDE_USER_CODE) < 0}" @click="selectionSttendee(val,'external')")
                    i.icon-issue-checked.iconfont
                    .avatar(v-avatar="val.USER_ICON", :full-name="val.USER_NAME")
                  .attendee-name {{val.USER_NAME}}
    .operation
      van-checkbox-group.c-meeting-notice-checkbox-group(v-model="noticeTypeVal")
        van-checkbox.c-meeting-notice-checkbox(v-for="(item, index) in noticeModeList" :key="item.val" :name="item.val")
          | {{item.name}}
      van-button(type="default",@click="sendingNotice") {{$t('determine')}}
      //- :: 确定
</template>
<script>
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import { getDataByKey } from '@/utils/array'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  data() {
    return {
      noticeDate:{}, // 通知数据
      noticeAttendee: this.$t('meetingAttendee'), // 会议通知标题 :: 会议参会人
      radio:'0', // 消息类型
      userImgState: false, // 头像状态
      user_code: [], // 已选择的内部联系人
      external: [], // 已选择的外部联系人
      leaderUser_code: [], // 已选择的内部领导
      leaderExternal: [], // 已选择的外部领导
      isSelectAll: this.$t('allElection'), // 是否全选 :: 全选
      leaderSelectAll: this.$t('allElection'), // 是否全选 :: 全选
      noticeModeList: [{name:this.$t('inApplication'), val:'0'}, {name:this.$t('shortMessage'), val:'1'}, {name:this.$t('mail'), val:'2'}],
      noticeTypeVal: ['0'],
      noticeContent: '',
      noticeTypeList: [
        `${this.$t('newMeetingNotice')}：<br/>`,
        `${this.$t('cancelMeetingNotice')}：<br/>`,
        `${this.$t('changeMeetingNotice')}：<br/>`
      ] // 通知类型
    }
  },
  components: {
    Scroll,
    BarHeader
  },
  mounted(){
    this.refreshPage()
  },
  methods: {
    // 刷新页面
    refreshPage() {
      if(this.$route.params.data){
        this.noticeDate = this.$route.params.data
        this.noticeDate.attendeeNumber = this.noticeDate.user_code.length + this.noticeDate.external.length
        if(this.noticeDate.TOPIC_ID){ // 如果是议题
          this.noticeAttendee = this.$t('issueAttendee') // :: 议题参会人
        }else{
          this.selectionLeaderAll()
        }
        this.selectionSttendeeAll()
      }
    },
    // 全选参会人
    selectionSttendeeAll() { 
      if(this.isSelectAll === this.$t('allElection')){ // :: 全选
        this.user_code = getDataByKey(this.noticeDate.user_code, 'USER_CODE')
        this.external = getDataByKey(this.noticeDate.external, 'OUTSIDE_USER_CODE')
        this.isSelectAll = this.$t('cancelAllElection') // :: 取消全选
      }else{
        this.user_code = []
        this.external = []
        this.isSelectAll = this.$t('allElection') // :: 全选
      } 
    },
    // 全选参会领导
    selectionLeaderAll() { 
      if(this.leaderSelectAll === this.$t('allElection')){ // :: 全选
        this.leaderUser_code = getDataByKey(this.noticeDate.main_user_code || [], 'USER_CODE')
        this.leaderExternal = getDataByKey(this.noticeDate.main_user_code_external || [], 'OUTSIDE_USER_CODE')
        this.leaderSelectAll = this.$t('cancelAllElection') // :: 取消全选
        this.noticeDate.leaderNumber = this.leaderUser_code.length + this.leaderExternal.length
      }else{
        this.leaderUser_code = []
        this.leaderExternal = []
        this.leaderSelectAll = this.$t('allElection') // :: 全选
      } 
    },
    // 返回
    noticeReturn() {
      this.$router.push({
        name: this.$route.params.type,
        query: {
          ...this.$route.query
        }
      })
    },
    // 选择/取消参会人
    selectionSttendee(val,type) {
      if(type === 'user_code'){ // 内部联系人
        if(this.user_code.indexOf(val.USER_CODE) > -1){
          let isOfRepeated = this.user_code.findIndex(value => {
            return val.USER_CODE === value
          })
          this.user_code.splice(isOfRepeated, 1)
        }else{
          this.$set(this.user_code,this.user_code.length,val.USER_CODE)
        }
      }else{ // 外部联系人
        if(this.external.indexOf(val.OUTSIDE_USER_CODE) > -1){
          let isOfRepeated = this.external.findIndex(value => {
            return val.OUTSIDE_USER_CODE === value
          })
          this.external.splice(isOfRepeated, 1)
        }else{
          this.$set(this.external,this.external.length,val.OUTSIDE_USER_CODE)
        }
      }
      if((this.external.length + this.user_code.length) >= this.noticeDate.attendeeNumber){
        this.isSelectAll = this.$t('cancelAllElection') // :: 取消全选
      }else{
        this.isSelectAll = this.$t('allElection') // :: 全选
      }
    },
    // 选择/取消参会领导
    selectionLeader(val,type) {
      if(type === 'user_code'){ // 内部联系人
        if(this.leaderUser_code.indexOf(val.USER_CODE) > -1){
          let isOfRepeated = this.leaderUser_code.findIndex(value => {
            return val.USER_CODE === value
          })
          this.leaderUser_code.splice(isOfRepeated, 1)
        }else{
          this.$set(this.leaderUser_code,this.leaderUser_code.length,val.USER_CODE)
        }
      }else{ // 外部联系人
        if(this.leaderExternal.indexOf(val.OUTSIDE_USER_CODE) > -1){
          let isOfRepeated = this.leaderExternal.findIndex(value => {
            return val.OUTSIDE_USER_CODE === value
          })
          this.leaderExternal.splice(isOfRepeated, 1)
        }else{
          this.$set(this.leaderExternal,this.leaderExternal.length,val.OUTSIDE_USER_CODE)
        }
      }
      if((this.leaderExternal.length + this.leaderUser_code.length) >= this.noticeDate.leaderNumber){
        this.leaderSelectAll = this.$t('cancelAllElection') // :: 取消全选
      }else{
        this.leaderSelectAll = this.$t('allElection') // :: 全选
      }
    },
    // 发送通知
    async sendingNotice() {
      let vm = this
      if(!this.noticeContent || this.noticeContent.length < 1){
        vm.$Notify({ message: this.$t('noticeContentEmpty') }) // :: 通知内容不能为空
        return false
      }
      let inside = [...vm.user_code,...vm.leaderUser_code]
      let external = [...vm.external,...vm.leaderExternal]
      if(inside.length < 1 && external.length < 1){
        vm.$Notify({ message: this.$t('noNotifier') }) // :: 请选择需要发送通知人
        return false
      }
      let req = [
        {
          service: 'M4003500',
          METTING_ID: vm.noticeDate.METTING_ID, // 会议ID
          DISCUSS_ID: vm.noticeDate.TOPIC_ID ? vm.noticeDate.TOPIC_ID : '', // 议题ID
          METTING_STARTTIME: vm.noticeDate.TOPIC_ID ? vm.noticeDate.TOPIC_STARTTALKTIME.split(' ')[0] : vm.noticeDate.METTING_STARTTIME.split(' ')[0], // 开始日期
          SYSTEM_USER: inside.join(','), // 内部参会人
          EXTERNAL_USER: external.join(','), // 外部参会人
          SENT_CONTEN: vm.noticeTypeList[vm.radio] + this.noticeContent.replace(/\n|\r\n/g, '<br/>').replace(/\s/g, '&nbsp;'), // 通知内容
          NOTICE_TYPE: vm.radio, // 通知类型
          NOTICE_CHANNEL: vm.noticeTypeVal.join(','), // 通知方式
        }
      ]
      let result = await vm.$ajaxRequest(req, () => {
        vm.$emit('refreshMeetingList', true)
      })
      if (result.code === '0') {
        vm.$Notify({ message: result.msg, duration: 1000, background: '#1989fa' })
        this.noticeReturn()
      } else {
        vm.$Notify({ message: result.msg })
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
