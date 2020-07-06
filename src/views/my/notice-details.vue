<template lang="pug">
  LayoutPage
    template(slot="left")
      LeftHeader(
        layout="title"
        :title="$t('sessageCenter')"
        :style="{'boxShadow':'0px 4px 8px 0px rgba(100,120,160,0.05)'}"
        :back="true")
      Scroll.msg-wrap(
        :pullup="true",
        :pulldown="true",
        :beforeScroll="true",
        @scrollToEnd="scrollToEnd",
        @pulldown="pulldown")
        .msg-content
          .msg-list(v-for="(item,index) in msgList" @click="changeStatus(item,index)")
            .msg-box
              .msg-header
                i.read-state(v-show="item.REMIND_STAT == '0'")
                span.new(v-if="item.MESG_RECE == '0' && item.REMIND_STAT == '0'")
                span.change(v-else-if="item.MESG_RECE == '2' && item.REMIND_STAT == '0'")
                span.cancel(v-else-if="item.MESG_RECE == '1' && item.REMIND_STAT == '0'")
                span.wu(v-else)
                i.iconfont.icon-notice-meeting-new(v-if="item.MESG_PARM == '0'" style="color:#007AFF")
                i.iconfont.icon-notice-meeting-change(v-else-if="item.MESG_PARM == '2'" style="color:#F3AF1F")
                i.iconfont.icon-notice-meeting-cancel(v-else-if="item.MESG_PARM == '1'" style="color:#FE5E57")
                i.iconfont.icon-notice-default(v-else style="color:#cccccc")
                .titlecon {{msgType(item.MESG_PARM)}}
                .time {{ item.REMIND_TIME | getTime }}
              .msg-main
                .msg-title {{ item.METTING_NAME }}
                .msg-info(v-html="item.MESG_CONT")
              .msg-footer
                .control(v-if="+item.IF_ATTEND === 0")
                  .joiningBtn
                    van-icon(name="checked")
                    | {{$t('accept')}}
                    //- 已接受
                .control(v-if="+item.IF_ATTEND === 1")
                  .noJoiningBtn
                    van-icon(name="clear")
                    | {{$t('refuse')}}
                    //- 已拒绝
                .control(v-if="+item.IF_ATTEND === 2")
                  van-button.noJoinMeetingBtn(type="default", @click="noJoin(item)") {{$t('noParticipation')}}
                  //- 不参加
                  van-button.joinMeetingBtn(type="default", @click="join(item,0)") {{$t('participate')}}
                  //- 参加
                .control(v-if="+item.IF_ATTEND === 3")
                  van-button.noJoinMeetingBtn(type="default", @click="noJoin(item)") {{$t('noParticipation')}}
                  //- 不参加
                  van-button.undeterminedBtn(type="default", @click="join(item,2)") {{$t('undetermined')}}
                  //- 待定
                  van-button.joinMeetingBtn(type="default", @click="join(item,0)") {{$t('participate')}}
                  //- 参加
      van-popup(v-model="popupShow")
        .title {{$t('reasons')}}
        //- 填写原因
        .content
          textarea(
            :placeholder="$t('reviewReasons')",
            maxlength="150",
            v-model="noJoinReason",
            @input="noJoinReasonInput")
          //- 请输入原因并提交或无原因关闭
        .btn
          van-button(
            type="default",
            @click="closeReason") {{$t('close')}}
            //- 关闭
          div
          van-button(
            type="default",
            :disabled="isDisabled",
            @click="submitReason",
            v-loading.fullscreen.lock="fullscreenLoading") {{$t('submit')}}
            //- 提交
</template>

<script>
import moment from 'moment'

import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  components: {
    LayoutPage,
    LeftHeader: BarHeader,
    Scroll
  },
  filters: {
    getTime (value) {
      let year = moment().format('YYYY')
      let time =  moment(value).format('YYYY-MM-DD')
      if (time == moment().format('YYYY-MM-DD')) {
        return moment(value).format('HH:mm')
      } else if (time.indexOf(year) != -1) {
        return moment(value).format('MM-DD HH:mm')
      } else {
        return time
      }
    }
  },
  data () {
    return {
      msgList: [], // 总消息信息
      oneMsg: [], // 单个消息信息
      activeIndex: 0,
      activeSno: '',
      activeMsg: {},
      page: 1, // 当前第几页
      hasMore: true,
      popupShow: false, // 拒绝原因弹出层显示隐藏
      noJoinReason: '', // 拒绝原因
      isDisabled: true, // 拒绝原因提交按钮禁用状态
      fullscreenLoading: false,
      reason: ''
    }
  },
  created () {
    this.getMsgList()
  },
  methods: {
    // MESG_RECE:0.新会议通知、1.修改会议通知、2.取消会议通知
    msgType (value) {
      if (value == '0') {
        return this.$t('newMeetingNotice') // 新会议通知
      } else if (value == '2') {
        return this.$t('changeMeetingNotice') // 更改会议通知
      } else if (value == '1') {
        return this.$t('cancelMeetingNotice') // 取消会议通知
      } else {
        return this.$t('unknownNews') // 未知消息
      }
    },
    // 更新已读未读
    changeStatus (msg, _index) {
			let req = [{
        OPT_FLAG: 1,
        mask: false, // 是否显示loading
				MESG_SNO: msg.MESG_SNO,
				service: 'U1101702'
      }]
      this.$ajaxRequest(req, (result) => {
        if (result.code === '0') {
          this.$set(this.msgList[_index], 'REMIND_STAT', '1')
        }
      })
    },
    // 滚动到下面添加页
    scrollToEnd () {
      if (this.hasMore) {
        this.page++
        this.getMsgList(this.page)
      }
    },
    // 下拉刷新
    pulldown () {
      this.page = 1
      this.hasMore = true
      this.getMsgList()
    },
    // 获取消息列表
    // async getMsgList (page) {
    //   let req = [{
    //     USER_CODE: 1,
    //     page: page || 1,
		// 		pagecount: 10,
		// 		REMIND_STAT: 0,
    //     service: 'U1101803'
    //   }]
    //   this.$ajaxRequest(req, (result) => {
    //     if (result.code === '0') {
    //       if (page) {
    //         if (result['data'].length > 0) {
    //           result['data'].forEach(item => {
    //             this.msgList.push(item)
    //           })
    //         } else {
    //           this.hasMore = false
    //         }
    //       } else {
    //         this.msgList = result['data']
    //         if (result['data'][0]) {
    //           this.activeSno = result['data'][0].MESG_SNO
    //           this.activeMsg = result['data'][0]
    //         } else {
    //           this.hasMore = false
    //         }
    //       }
    //     }
    //   })
    // },
    noJoinReasonInput () {
      // 监听审核原因输入更改提交按钮状态
      if (!this.noJoinReason || this.noJoinReason.match(/^[ ]*$/)) {
        this.isDisabled = true
      } else {
        this.isDisabled = false
      }
    },
     // 关闭拒绝原因
    closeReason () {
      this.popupShow = false
    },
     // 提交拒绝原因
    submitReason () {
      this.popupShow = false
      this.join (this.oneMsg,1)
    },
    noJoin (msg){
      this.popupShow = true
      this.oneMsg = msg
    },
    // 提交应会反馈
    async join (msg,type) {
      let vm = this
      vm.oneMsg = msg
      if (!vm.oneMsg.MESG_OBJ_ID || !vm.oneMsg.DISCUSS_ID) {
        vm.$Notify(this.$t('contactManagement')); // 操作失败，请联系管理员
        return false
      }
      if (type != 1) {
        vm.noJoinReason = ''
      }
			let req = [{
        METTING_ID: vm.oneMsg.MESG_OBJ_ID,
        IF_ATTEND: type, // 0参加 1不参加 2待定
        NO_ATTEND_REASON: vm.noJoinReason,
        DISCUSS_ID: vm.oneMsg.DISCUSS_ID,
				service: 'M4003300'
      }]
      this.$ajaxRequest(req, (result) => {
        if (result.code === '0') {
          vm.noJoinReason = ''
          vm.popupShow = false
          if (type == 0) {
            this.$Notify({message: result.msg, duration: 3000, background: '#1989fa'})
          }
        } else {
          this.$notify(result.msg)
        }
        this.getMsgList()
      })
    }
  },
  computed: {

  }
}
</script>

<style scoped lang="stylus">
  @import './notice-details.styl'
</style>
