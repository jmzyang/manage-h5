<template lang="pug">
  .detailsSontent
    .container
      slot
    .box(v-if="data")
      .control(v-if="+data.IF_ATTEND === 0")
        .joiningBtn
          van-icon(name="passed")
          | {{$t('accept')}}
          //- :: 已接受
      .control(v-if="+data.IF_ATTEND === 1")
        .noJoiningBtn
          van-icon(name="close")
          | {{$t('refuse')}}
          //- :: 已拒绝
      .control(v-if="+data.IF_ATTEND === 2")
        van-button.noJoinMeetingBtn(type="default", @click="noJoin()") {{$t('noParticipation')}}
        //- :: 不参加
        van-button.joinMeetingBtn(type="default", @click="join(0)") {{$t('participate')}}
        //- :: 参加
      .control(v-if="+data.IF_ATTEND === 3")
        van-button.noJoinMeetingBtn(type="default", @click="noJoin()") {{$t('noParticipation')}}
        //- :: 不参加
        van-button.undeterminedBtn(type="default", @click="join(2)") {{$t('undetermined')}}
        //- :: 待定
        van-button.joinMeetingBtn(type="default", @click="join(0)") {{$t('participate')}}
        //- :: 参加
      van-popup(v-model="popupShow")
        .title {{$t('reasons')}}
        //- :: 填写原因
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
            @click="closeReason")  {{$t('close')}}
            //- :: 关闭
          div
          van-button(
            type="default",
            :disabled="isDisabled",
            @click="submitReason",
            v-loading.fullscreen.lock="fullscreenLoading")  {{$t('submit')}}
            //- :: 提交
</template>
<script>

export default {
  data () {
    return {
      popupShow: false, // 拒绝原因弹出层显示隐藏
      noJoinReason: '', // 拒绝原因
      isDisabled: true, // 拒绝原因提交按钮禁用状态
      fullscreenLoading: false,
      reason: ''
    }
  },
  props: {
    data: {
      type: [Object],
      default: ()=> {}
    },
    dataIndex: {
      type: [Number, String],
      default: 0
    }
  },
  watch: {
    dataIndex (val, oldVal) {
      this.$emit(`callback`, this.data, this.dataIndex)
    }
  },
  mounted () {
    this.$emit(`callback`, this.data, this.dataIndex)
  },
  methods: {
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
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
