<template lang="pug">
  .c-meeting-issue-container
    BarHeader(layout="default")
      .container-title(class="title")
        span(@click="summaryReturn")
          i.icon-close.iconfont
        | {{$t('issue')}}
        //- :: 议题
    .meeting-issue-container
      Scroll
        .meeting-issue-box
          .issue-main
            .issue-left
              .list-code {{issueDate.index}}
            .issue-right
              .title
                | {{issueDate.TOPIC_NAME}}
              .file-list(v-for="fileVal in issueDate.fileList")
                .img(:class="fileVal.name.split('.')[fileVal.name.split('.').length - 1]")
                .losureContent
                  p {{fileVal.name}}
                  p {{fileVal.size}}
                .download(@click="fileDownload(fileVal.url, fileVal.name)")
                  i(class="iconfont icon-download")
              .attendee {{$t('issueAttendee')}}：{{issueDate.senator}}
              //- :: 议题参会人：
          .issue-btn
            van-button(type="default" @click="deleteIssue")
              | {{$t('delete')}}
              //- :: 删除
            van-button(type="default" @click="editIssue")
              | {{$t('modify')}}
              //- :: 修改
            van-button(class="sendNotice" type="default" v-if="issueDate.senator.length > 0" @click="sendingNotice")
              | {{$t('sendNotice')}}
              //- :: 发送通知
</template>

<script>
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  components: {
    BarHeader,
    Scroll
  },
  data() {
    return {
      
    }
  },
  props:{
    // 议题数据
    issueDate:{
      type:[Object],
      default: () => {return {}}
    }
  },
  mounted() {
    // 监听下载文件进度
    window['downLoadCallBack'] = (result) => {
      let obj = JSON.parse(result)
      if (obj.progress >= 100) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadCompleted')},${this.$t('saveAddress')}：${obj.downloadPath}`, duration: 3000, background: '#1989fa' })
      } else if (obj.state == 0) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadFailure')}`, duration: 2000 })
      }
    }
  },
  methods:{
    summaryReturn() {
      // 关闭议题页面
      this.$emit('issueClose')
    },
    deleteIssue() {
      // 删除议题
      let vm = this
      this.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('isDeletTheIssue') // :: 确认是否删除该议题
      }).then(async() => {
        let req = [{
          service: 'P1202641',
          topic_id: vm.issueDate.TOPIC_ID, // 议题ID
          metting_id: vm.issueDate.METTING_ID, // 会议ID
          topic_name: vm.issueDate.TOPIC_NAME, // 议题名称
          number: vm.issueDate.external.length + vm.issueDate.user_code.length, // 参议员人数
          fileList: vm.issueDate.fileList // 议题附件
        }];
        let result = await vm.$ajaxRequest(req)
        if (result.code === '0') {
          vm.$emit('issueModify','delet')
          vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        } else {
          vm.$Notify({message:result.msg});
        }
      }).catch(() => {
        // on cancel
      });
    },
    editIssue() {
      // 修改议题
      this.$emit('editIssue','modify',this.issueDate)
    },
    fileDownload(url,fileName) {
      // 下载附件
      console.log(url)
      if(window.AndroidWebView && window.AndroidWebView.downLoadFile){
        if (!fileName || fileName.match(/^[ ]*$/) != null) {
          this.$Notify({ message: `"${fileName}"${this.$t('downloadFailure')}`, duration: 2000 }) // :: 下载失败
        } else {
          this.$Notify({ message: `"${fileName}"${this.$t('startDownloading')}!`, duration: 1000, background: '#1989fa' }) // :: 开始下载
          this.$android.downLoadFile(url, fileName)
        }
      }
    },
    // 发送通知
    sendingNotice() {
      this.$emit('sendingNotice',this.issueDate)
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
