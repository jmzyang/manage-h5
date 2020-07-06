<template lang="pug">
  .page-wrap.issue-box(
    v-loading="isLoading"
    :loading-text="$t('uploading')" 
    :class="{'meetingDetails': type !== 'demaxiya'}")
    BarHeader(
      layout="title",
      :border="true",
      :back="true",
      v-if="!cardIssueFormVisible && type === 'demaxiya'")
      | {{$t('addIssue')}}
      //- :: 添加议题
      .button-add-issue(@click.stop="addIssure()" @keyup.enter.native="addIssure")
        van-icon(name="plus")    
    .issue-container(v-show="!cardIssueFormVisible")
      .issue-main
        .no-issue(v-if="issueList.length < 1 && type === 'demaxiya'")
          .empty-img
          .empty-content {{$t('noIssue')}}
            //- :: 没有议题
            p {{$t('clickAdd')}}
            //- :: 点击右上角按钮新增
        Scroll(v-if="type === 'demaxiya' && issueList.length > 0")
          van-collapse(v-model="activeName")
            van-collapse-item.meeting-issue-box(
              v-for="(item,index) in issueList",
              :key="index",
              :title="item.TOPIC_NAME",
              :name="index",
              :border="false", 
              :title-class="activeName.indexOf(index) >-1 ? 'collapseTitleOpen' : 'collapseTitleRetract'")
              .issue-right
                .file-list-box
                  .file-list(v-for="fileVal in item.fileList")
                    .img(:class="fileVal.name.split('.')[fileVal.name.split('.').length - 1]")
                    .losureContent
                      p {{fileVal.name}}
                      p {{fileVal.size}}
                    .download(@click="downloadFile(fileVal.url, fileVal.name)")
                      i(class="iconfont icon-download")
                .attendee(v-if="item.senator") {{$t('issueAttendee')}}：{{item.senator}}
                //- :: 议题参会人：
              .issue-btn
                van-button(type="default" @click="issueDelete(item)")
                  | {{$t('delete')}}
                  //- :: 删除
                van-button(type="default" @click="editIssue(item)")
                  | {{$t('modify')}}
                  //- :: 修改
        van-collapse(v-model="activeName",v-if="type !== 'demaxiya' && issueList.length > 0")
          van-collapse-item.meeting-issue-box(
            v-for="(item,index) in issueList",
            :key="index",
            :title="item.TOPIC_NAME",
            :name="index",
            :border="false", 
            :title-class="activeName.indexOf(index) >-1 ? 'collapseTitleOpen' : 'collapseTitleRetract'")
            .issue-right
              .file-list-box
                .file-list(v-for="fileVal in item.fileList")
                  .img(:class="fileVal.name.split('.')[fileVal.name.split('.').length - 1]")
                  .losureContent
                    p {{fileVal.name}}
                    p {{fileVal.size}}
                  .download(@click="downloadFile(fileVal.url, fileVal.name)")
                    i(class="iconfont icon-download")
              .attendee(v-if="item.senator") {{$t('issueAttendee')}}：{{item.senator}}
              //- :: 议题参会人：
            .issue-btn(:class="{'Notification': !isNotice || item.senator.length < 1 }")
              van-button(type="default" @click="controlEditIssue(item,'delete')" v-if="type === 'meetingControl'")
                  | {{$t('delete')}}
                  //- :: 删除
              van-button(type="default" @click="controlEditIssue(item,'modify')" v-if="type === 'meetingControl'")
                  | {{$t('modify')}}
                  //- :: 修改
              van-button(class="sendNotice" type="default" v-if="isNotice && item.senator.length > 0 " @click="sendingNotice(item,index)")
                | {{$t('sendNotice')}}
                //- :: 发送通知

    CEditIssue(
      v-if="cardIssueFormVisible",
      :issueDate="targetClickIssue", 
      :topicName="topicName", 
      @editCancel="editCancel", 
      @issueModify="issueModify", 
      :editTitle.sync="editTitle", 
      :issueType="2")
</template>
<script>
import { getDataByKey,externalFormatAdd } from '@/utils/array'

import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
import CEditIssue from '../../../meeting-issue/components/c-edit-issue'
export default {
  components: {
    BarHeader,
    Scroll,
    CEditIssue
  },
  data () {
    return {
      issueList: [],
      isLoading: false,
      issueCode: 1, // 议题编号（前端用）
      targetClickIssue: {}, // 查看的议题
      cardIssueFormVisible: false, // 议题表单卡片显示开关
      topicName: [], // 议题名称
      targetClickIssue: {}, // 修改的议题对象
      editTitle: '', // 添加/修改议题标题
      activeName: [], // 展开收起
    }
  },
	directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  props:{
    // 议题数据
    meetingIssue:{
      type: [Object, Array, String],
      default:() => []
    },
    // 议题类型
    type:{
      type: [String],
      default: 'demaxiya'
    },
    // 会议状态
    isNotice:{
      type: [String, Boolean],
      default: false
    }
  },
  watch:{
    issueList(val){
      if(this.type === 'demaxiya'){
        let issueData = []
        val.forEach(val => {
          issueData.push({
            yitititle: val.TOPIC_NAME,
            external: externalFormatAdd(val.external),
            fileList: val.fileList,
            user_code: getDataByKey(val.user_code, 'USER_CODE').join(','),
            topic_id: val.TOPIC_ID ? val.TOPIC_ID : ''
          })
        })
        this.$emit('issue', issueData)
      }
    },
    meetingIssue(val){
      if(this.type !== 'demaxiya'){
        this.issueList = JSON.parse(JSON.stringify(val))
        this.activeName = []
      }
    }
  },
  mounted () {
    window['downLoadCallBack'] = (result) => {
      let obj = JSON.parse(result)
      if (obj.progress >= 100) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadCompleted')},${this.$t('saveAddress')}：${obj.downloadPath}`, duration: 3000, background: '#1989fa' })
      } else if (obj.state == 0) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadFailure')}`, duration: 2000 })
      }
		}
  },
  created(){
    if(this.meetingIssue && this.type === 'demaxiya'){
      this.issueList = JSON.parse(JSON.stringify(this.meetingIssue))
      this.issueList.forEach(val => {
        val.senator = getDataByKey([...val.user_code,...val.external], 'USER_NAME').join('、')
      })
    }
  },
  methods: {
    addIssure () {
      // 添加议题
      this.cardIssueFormVisible = true
      this.editTitle = this.$t('addIssue') // :: 添加议题
    },
    editCancel() {
      // 取消添加议题
      this.cardIssueFormVisible = false
    },
    issueModify(type,data) {
      // 保存议题
      this.cardIssueFormVisible = false
      if(type === 'modify'){ // 修改       
        let isOfRepeated = this.issueList.findIndex(value => {
          return value.TOPIC_ID === data.TOPIC_ID
        })
        this.$set(this.issueList, isOfRepeated, data)
      }else{
        this.$set(this.issueList, this.issueList.length, data)
      }
      this.$set(this.topicName, this.topicName.length, data.TOPIC_NAME)
    },
    issueDelete(data) {
      // 删除议题
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('isDeletTheIssue') // :: 确认是否删除该议题
      }).then(() => {
        this.issueList = this.issueList.filter((it) => {
          return it.TOPIC_NAME !== data.TOPIC_NAME
        })
        this.topicName = this.topicName.filter((it) => {
          return data.TOPIC_NAME !== it
        })
      })
    },
    editIssue(val) {
      // 修改议题
      this.cardIssueFormVisible = true
      this.editTitle = this.$t('modifyIssue') // :: 修改议题
      this.targetClickIssue = val
      let isOfRepeated = this.topicName.findIndex(value => {
        return value === val.TOPIC_NAME
      })
      this.topicName[isOfRepeated] = null
    },
    // 本地会控编辑议题
    controlEditIssue(data,type) {
      this.$emit('controlEditIssue',data,type)
    },
    // 发送通知
    sendingNotice(data,index) {
      data.index = index + 1
      this.$emit('sendingNotice',data)
    },
    setImage (e, issue) {
      // 上传附件
      const file = e.target.files[0]
      if(file.size / 1024 / 1024 > 100){
        this.$Notify(this.$t('fileSizeLimitation')); // :: 单个文件大小不能超过100M
        return false;
      }
      if(file.name.length > 128){
        this.$Notify(this.$t('fileLengthLimitation')); // :: 单个文件大小不能超过100M
        return false;
      }
      this.filesData = file
      if (e.target.files.length === 0) {
        e.target.value = ''
        return
      }
      if (!file.type.includes('image/')) {
        e.target.value = ''
        return
      }
      let image = new FormData()
      image.append('avatar', this.filesData)
      let req = {
        service: 'P1008501',
        ATTA_CHNL: 1,
        DIR: 'images',
        data: image
      }
      let data = ImageUpload(req)
      axios.defaults.headers['Content-Type'] = data['multipart/form-data']
      this.isLoading = true
      axios.post(data.url, data['data'])
        .then(res => {
          if (res['data'][0].flag === 'true') {
            let result = res['data'][0]['data'][0]
            let req2 = [{
              service: 'U1008501',
              ATTA_CHNL: 1,
              ATTA_NAME: result['FILENAME'],
              ATTA_URL: result['FILEPATH'],
              ATTA_SIZE: result['FILESIZE'],
              mask: false
            }]
            this.$ajaxRequest(req2, (data) => {
              // 上传成功
              let img = {}
              img.src = result['FILEVIEWURL']
              img.name = file.name
              img.url = result['FILEPATH']
              img.ATTA_ID = data['data'][0]['ID']
              issue.imgList.push(img)
              this.isLoading = false
            })
          } else {
            this.isLoading = false
            this.$toast({
              message: this.$t('fileUploadFailed'), // :: 上传文件失败，请重试！
              duration: 1000,
              position: 'top'
            })
          }
          this.$refs['fileinput'].value = ''
        })
    },
    // 文件
    downloadFile (url, fileName) {
      if (window.AndroidWebView && window.AndroidWebView.downLoadFile) {
        if (!fileName || fileName.match(/^[ ]*$/) != null) {
          this.$Notify({ message: `"${fileName}"${this.$t('downloadFailure')}`, duration: 2000 }) // :: 下载失败
        } else {
          this.$Notify({ message: `"${fileName}"${this.$t('startDownloading')}!`, duration: 1000, background: '#1989fa' }) // :: 开始下载
          this.$android.downLoadFile(url, fileName)
        }
      }
    }
  }
}
</script>
<style scoped lang="stylus">
  @import './index.styl'
</style>
