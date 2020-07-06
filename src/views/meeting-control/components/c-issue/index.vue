<template lang="pug">
  .c-issue-container
    .no-issue(v-if="!pageState && +issueType === 2")
      .empty-img
      .empty-content
        | {{$t('noIssue')}}
        //- :: 没有议题
        p {{$t('clickAdd')}}
        //- :: 点击右上角按钮新增
    template(v-if="pageState")
      van-collapse(v-model="activeName")
        van-collapse-item.meeting-issue-box(
          v-for="(item, index) in issueDataList",
          :key="index",
          :title="index + 1 + '、' + item.TOPIC_NAME",
          :name="index",
          :border="false"
        )
          .issue-right
            .file-list-box
              .file-list(v-for="fileVal in item.fileList")
                .img(:class="fileVal.name.split('.')[fileVal.name.split('.').length - 1]")
                .losureContent
                  p {{fileVal.name}}
                  p {{fileVal.size}}
                .download(@click="downloadFile(fileVal.url, fileVal.name)")
                  i(class="iconfont icon-download")
            .attendee(v-if="item.senator && +KIparameter.OPEN_ISSUE_NOTICE === 1")
              | {{$t('issueAttendee')}}：{{item.senator}}
              //- :: 议题参会人：
          .issue-btn(v-if="+issueType === 2")
            van-button(type="default" @click="issueDelete(item)")
              | {{$t('delete')}}
              //- :: 删除
            van-button(type="default" @click="editIssue(item)")
              | {{$t('modify')}}
              //- :: 修改
            van-button(class="sendNotice" type="default" @click="sendingNotice(item)" v-if="item.senator && +KIparameter.OPEN_ISSUE_NOTICE === 1")
              | {{$t('sendNotice')}}
              //- :: 发送通知
          .issue-btn(v-if="+issueType === 1 && item.senator && isNotice && +KIparameter.OPEN_ISSUE_NOTICE === 1 && Jurisdiction != 1")
            van-button(class="sendNotice" type="default" @click="sendingNotice(item)")
              | {{$t('sendNotice')}}
              //- :: 发送通知
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import { getDataByKey, externalFormatAdd } from '@/utils/array'
export default {
  components: {
    
  },
  data(){
    return {
      issueDataList: [], // 议题拓扑数据
      activeName: [], // 展开收起
      pageState: true // 文明显示
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
  props:{
    // 议题数据源
    issueData:{
      type: [Array,Object],
      default: () => {return []}
    },
    // 是否可发送通知
    isNotice:{
      type: [Boolean],
      default: false
    },
    // 议题类型 1：会议详情；2：会议控制
    issueType:{
      type: [Number],
      default: 1
    },
    // 参会人权限
    Jurisdiction:{
      type: [String],
      default: '0'
    }
  },
  watch: {
    issueData (val) {
      this.issueDataList = JSON.parse(JSON.stringify(this.issueData))
      console.log(this.issueDataList)
      if(this.issueDataList.length > 0){
        this.pageState = true
      }else{
        this.pageState = false
      }
    }
  },
  mounted(){
    let terminal = this.$isiOS ? 'iosdownLoadCallBack' : 'downLoadCallBack'
    window[terminal] = (result) => {
      let obj = JSON.parse(result)
      obj.name = obj.name ? obj.name : ''
      if (obj.progress >= 100) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadCompleted')},${this.$t('saveAddress')}：${obj.downloadPath}`, duration: 3000, background: '#1989fa' })
      } else if (obj.state == 0) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadFailure')}`, duration: 2000 })
      }
		}
  },
  methods:{
    // 删除议题
    issueDelete (datas) {
      // 删除议题
      let vm = this
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isDeletTheIssue') // :: 确认是否删除该议题
      }).then(async() => {
        let req = [{
          service: 'P1202641',
          topic_id: datas.TOPIC_ID, // 议题ID
          metting_id: datas.METTING_ID, // 会议ID
          topic_name: datas.TOPIC_NAME, // 议题名称
          topic_content: '', // 议题内容
          number: datas.external.length + datas.user_code.length, // 参议员人数
          fileList: datas.fileList // 议题附件
        }];
        let result = await vm.$ajaxRequest(req, () => {
          this.$emit('refreshPage', true)
        })
        if (result.code === '0') {
          vm.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        } else {
          vm.$Notify({message:result.msg});
        }
      })
    },
    // 修改议题
    editIssue (data, index) {
      this.$emit('editIssue',data)
    },
    // 发送通知
    sendingNotice (data) {
      this.$emit('sendingNotice',data)
    },
    downloadFile (url, fileName) {
      if (this.$isAndroid && this.$android.downLoadFile) {
        if (!fileName || fileName.match(/^[ ]*$/) != null) {
          this.$Notify({ message: `"${fileName}"${this.$t('downloadFailure')}`, duration: 2000 }) // :: 下载失败
        } else {
          this.$Notify({ message: `"${fileName}"${this.$t('startDownloading')}!`, duration: 1000, background: '#1989fa' }) // :: 开始下载
          this.$android.downLoadFile(url, fileName)
        }
      }else if(this.$isiOS && this.$ios.downLoadFile){
        this.$Notify({ message: `"${fileName}"${this.$t('startDownloading')}!`, duration: 1000, background: '#1989fa' }) // :: 开始下载
        this.$ios.downLoadFile('https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562851170391&di=51c90798a64539f9d957c69ef293a0a5&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201507%2F02%2F20150702211615_nM3N8.thumb.700_0.jpeg', fileName)
      }else{
        this.$Notify({ message: `"${fileName}"${this.$t('downloadFailure')}`, duration: 2000 }) // :: 下载失败
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
