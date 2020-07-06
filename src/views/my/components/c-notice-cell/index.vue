<template lang="pug">
  .cell(@click="active" :class="{'active': data.MESG_SNO === activeSno}")
    .msg-box
      .msg-header
        i.read-state(v-show="data.REMIND_STAT == '0'")
        span.new(v-if="data.MESG_RECE == '0' && data.REMIND_STAT == '0'")
        span.change(v-else-if="data.MESG_RECE == '2' && data.REMIND_STAT == '0'")
        span.cancel(v-else-if="data.MESG_RECE == '1' && data.REMIND_STAT == '0'")
        span.wu(v-else)
        i.iconfont.icon-notice-meeting-new
        .titlecon {{msgType(data.MESG_RECE)}}
        .time {{ data.REMIND_TIME | getTime }}
      .msg-main
        .msg-title {{ data.METTING_NAME }}
        .msg-info(v-html="data.MESG_CONT")
      .msg-footer
        //- .control(v-if="+data.IF_ATTEND === 0")
        //-   .joiningBtn
        //-     van-icon(name="checked")
        //-     | 已接受
        //- .control(v-if="+data.IF_ATTEND === 1")
        //-   .noJoiningBtn
        //-     van-icon(name="clear")
        //-     | 已拒绝
        //- .control(v-if="+data.IF_ATTEND === 2")
        //-   van-button.noJoinMeetingBtn(type="default", @click="noJoin()") 不参加
        //-   van-button.joinMeetingBtn(type="default", @click="join(0)") 参加
        //- .control(v-if="+data.IF_ATTEND === 3")
        .control
          van-button.noJoinMeetingBtn(type="default", @click="noJoin()") {{$t('noParticipation')}}
          //- 不参加
          van-button.undeterminedBtn(type="default", @click="join(2)") {{$t('undetermined')}}
          //- 待定
          van-button.joinMeetingBtn(type="default", @click="join(0)") {{$t('participate')}}
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
export default {
  name: 'cell',
  data () {
    return {
      popupShow: false, // 拒绝原因弹出层显示隐藏
      noJoinReason: '', // 拒绝原因
      isDisabled: true, // 拒绝原因提交按钮禁用状态
      fullscreenLoading: false,
      reason: ''
    }
  },
  mounted () {
    console.log(this.data)
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
  props: ['data', 'dataIndex', 'activeSno'],
  methods: {
    active () {
      this.$emit('active', this.data, this.dataIndex)
    },
    noJoinReasonInput () {
      // 监听审核原因输入更改提交按钮状态
      if (!this.noJoinReason || this.noJoinReason.match(/^[ ]*$/)) {
        this.isDisabled = true
      } else {
        this.isDisabled = false
      }
    },
    closeReason () {
      // 关闭拒绝原因
      this.popupShow = false
    },
    submitReason () {
      // 提交拒绝原因
      this.popupShow = false
      this.join (1)
    },
    noJoin (){
      this.popupShow = true
    },
    // 提交应会反馈
    join (type) {
      let vm = this
      if (type != 1) {
        vm.noJoinReason = ''
      }
			let req = [{
        METTING_ID: vm.data.MESG_PARM ? vm.data.MESG_PARM:'0',
        IF_ATTEND: type, // 0参加 1不参加 2待定
        NO_ATTEND_REASON: vm.noJoinReason,
        DISCUSS_ID: vm.data.DISCUSS_ID ? vm.data.DISCUSS_ID: '0',
				service: 'M4003300'
      }]
      this.$ajaxRequest(req, (result) => {
        if (result.code === '0') {
          vm.noJoinReason = ''
          vm.popupShow = false
          if (type == 0) {
            this.$Notify({message: result.msg, duration: 3000, background: '#1989fa'})
          }
          this.$emit(`callbackJoin`, this.dataIndex, type)
        } else {
          this.$notify(result.msg)
        }
      })
    },
    // MESG_RECE:0.新会议通知、1.修改会议通知、2.取消会议通知
    msgType (value) {
      if (value == '0') {
        return this.$t('newMeetingNotice') // 新会议通知
      } else if (value == '1') {
        return this.$t('cancelMeetingNotice') // 取消会议通知
      } else if (value == '2') {
        return this.$t('changeMeetingNotice') // 更改会议通知
      } else {
        return this.$t('unknownNews') // 未知消息
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.cell
  display flex
  border-radius 16px
  padding 30px
  margin 10px 20px
  box-sizing border-box
  overflow hidden
  &.active
    background-color #F6F7F8
  .msg-box
    width 100%
    .msg-header
      line-height 50px
      height 50px
      position relative
      width 100%
      .read-state
        background #FE5E57
        display inline-block
        height 16px
        width 16px
        border-radius 50%
        position absolute
        left -24px
        top 20px
      span.new,span.cancel,span.change,span.wu
        position absolute
        display inline-block
      .icon-notice-meeting-new
        color #007AFF
        font-size 36px
        display inline-block
      .titlecon
        color #333
        font-size 34px
        display inline-block
        font-weight 500
        margin-left 19px
      .time 
        color #888
        float right 
        font-size 28px
        display inline-block
        font-weight 400
    .msg-main
        padding 20px 0
        box-sizing border-box
        .msg-title
          font-size 34px
          line-height 46px
          font-weight 500
        .msg-info
          margin 20px 0
          color #666
          font-size 30px
          line-height 45px
    .msg-footer
      margin 40px 0
      .control
        width 100%
        display flex
        button
          flex 1
          height 60px
          line-height 60px
          background-color #007AFFFF
          font-size 30px
          font-weight 400
          color #FFFFFFFF
          box-sizing border-box
          border 1PX solid #007AFFFF
          margin 10px
          border-radius 30px
        .undeterminedBtn,
        .noJoinMeetingBtn
          background-color #F5FAFF
          color #007AFF
          border 1PX solid #86C1FC
        .noJoiningBtn
          text-align center
          color #B2B2B2
          height 60px
          line-height 60px
          flex 1
          font-size 30px
          font-weight 400
          .van-icon 
            vertical-align middle
            margin-right 23px
            font-size  50px
            color #B2B2B2
        .joiningBtn
          text-align center
          color #B2B2B2
          height 60px
          line-height 60px
          flex 1
          font-size 30px
          font-weight 400
          .van-icon 
            vertical-align middle
            margin-right 23px
            font-size  50px
            color #1AB47F
  .van-popup
    top 30%
    border-radius 16px
    .title
      line-height 140px
      font-size 36px
      font-weight 500
      color #000
      text-align center
    textarea
      width 640px
      height 348px
      margin 0px 30px 60px 30px
      font-size 32px
      font-weight 400
      color #666666
      padding 30px
      background-color #F6F7F8
      resize none
      border-radius 6px
      border none
    .btn
      display flex
      border-top 1PX solid #E1E8EB
      & > div
        flex none
        width 1PX
        height 67px
        background rgba(225, 232, 235, 1)
        margin-top 17px
      button
        flex 1
        height 106px
        text-align center
        font-size 30px
        font-weight 400
        border none
      & > button:last-child
        color #007AFF
</style>
