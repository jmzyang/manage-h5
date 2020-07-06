<template lang="pug">
  .page-wrap.issue-box
    BarHeader(
      layout="title",
      :border="true",
      :back="true",
      :backEvent="true",
      @back="handlerBack")
      | {{$t('issue')}}
      //- :: 议题
      template(slot="actions")
        .bar-header-add(@click.stop="addIssure()", @keyup.enter.native="addIssure")
          i.iconfont.icon-header-plus
    .issue-container(v-show="!cardIssueFormVisible")
      .issue-main
        .no-issue(v-if="meetingIssue.length < 1")
          .empty-img
          .empty-content
            | {{$t('noIssue')}}
            p {{$t('clickAdd')}}
            //- 没有议题  点击右上角按钮新增
        template(v-if="meetingIssue.length > 0")
          van-collapse(v-model="activeName")
            van-collapse-item.meeting-issue-box(
              v-for="(item, index) in meetingIssue",
              :key="index",
              :title="index + 1 + '、' + item.title",
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
                    //- 文件下载
                    .download(@click="downloadFile(fileVal.url, fileVal.name)")
                      i(class="iconfont icon-download")
                .attendee(v-if="item.contacts.total") {{$t('issueAttendee')}}：
                  //- :: 议题参会人：
                  span(v-for="(oItem) in item.contacts.organization")
                    | {{oItem.ORG_NAME}}、
                  span(v-for="(mItem, mIndex) in item.contacts.member", :key="mIndex", v-if="mItem.USER_NAME")
                    | {{mItem.USER_NAME}}
                    template(v-if="mIndex < item.contacts.member.length - 1")
                      | 、
                .vote-container(v-if="item.vote && KIparameter.PAPERLESS_TYPE == 1")
                  span {{$t('voteContent')}}：
                  div(v-for="(voteItem,voteIndex) in item.vote" :key="voteIndex" v-show="voteItem.voteContent")
                    | {{voteItem.voteContent}}
              .issue-btn
                van-button(type="default" @click="issueDelete(item, index)")
                  | {{$t('delete')}}
                  //- :: 删除
                van-button(type="default" @click="editIssue(item, index)")
                  | {{$t('modify')}}
                  //- :: 修改
    //- CEditIssue(
    //-   v-if="cardIssueFormVisible",
    //-   :issueDate="targetClickIssue", 
    //-   :topicName="topicName", 
    //-   @editCancel="editCancel", 
    //-   @issueModify="issueModify", 
    //-   :editTitle.sync="editTitle", 
    //-   :issueType="2")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'

import { getDataByKey, externalFormatAdd } from '@/utils/array'

import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'

export default {
  computed: {
    ...mapState ({
      storeMutationForm: (state) => {
        let result = 'M_MEETING_FORM_DATA'
        switch (+state.route.query.businessType) {
          case 0:
            result = 'M_MEETING_FORM_DATA'
            break
          case 1:
            result = 'M_MEETING_FORM_DATA_EDIT'
            break
          default:
            break
        }
        return result
      },
      KIparameter (state) {
        return state.common.KIparameter || {}
      },
      // 议题数据
      meetingIssue: state => state.meeting[state.route.query.stateName].meetingIssue || []
    })
  },
  data () {
    return {
      // 路由参数
      isNotice: this.$route.query.isNotice || false, // 会议状态
      issueType: this.$route.query.issueType || 2, // 议题类型 1：会议控制、2：创建会议
      meetingId: this.$route.query.meetingId || '',
      stateName: this.$route.query.stateName || '',
      mutation: this.$route.query.mutation || '',
      businessType: this.$route.query.businessType || 0,
      // 组件参数
      isLoading: false,
      issueCode: 1, // 议题编号（前端用）
      targetClickIssue: {}, // 查看的议题
      cardIssueFormVisible: false, // 议题表单卡片显示开关
      topicName: [], // 议题名称
      targetClickIssue: {}, // 修改的议题对象
      editTitle: '', // 添加/修改议题标题
      activeName: [] // 展开收起
    }
  },
	directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },  
  watch:{
    
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
    
  },
  components: {
    BarHeader,
    Scroll
  },
  methods: {
    handlerBack () {
      switch (+this.businessType) {
        case 0:
          // 创会
          this.$router.replace({
            name: 'meeting.create'
          })
          break
        case 1:
          // 修改会议
          this.$router.replace({
            name: 'meeting.edit',
            params: {
              meetingId: this.meetingId
            }
          })
          break
        default:
          break
      }
    },
    addIssure () {
      this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_FORM,  {
        type: 'clear'
      })
      // 添加议题
      this.$router.push({
        name: 'meeting.issue.add',
        query: {
          issueIndex: -1,
          ...this.$route.query
        }
      })
    },
    issueDelete(data, _index) {
      // 删除议题
      this.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('isDeletTheIssue') // :: 确认是否删除该议题
      }).then(() => {
        let _meetingIssue = JSON.parse(JSON.stringify(this.meetingIssue))
        _meetingIssue.splice(_index, 1)
        this.$store.commit(TYPES_MEETING[this.storeMutationForm], {
          type: 'assign',
          value: {
            meetingIssue: _meetingIssue
          }
        })
      })
    },
    editIssue(val, _index) {
      this.$store.commit(TYPES_MEETING.M_MEETING_ISSUE_FORM,  {
        type: 'assign',
        value: {
          title: val.title,
          fileList: val.fileList,
          contacts: val.contacts,
          vote: val.vote
        }
      })
      // 修改议题
      this.$router.push({
        name: 'meeting.issue.add',
        query: {
          issueIndex: _index,
          ...this.$route.query
        }
      })
    },
    setImage (e, issue) {
      // 上传附件
      const file = e.target.files[0]
      if(file.size / 1024 / 1024 > 100){
        this.$Notify(this.$t('fileSizeLimitation')); // :: 单个文件大小不能超过100M
        return false;
      }
      if(file.name.length > 128){
        this.$Notify(this.$t('fileLengthLimitation')); // :: 附件名称长度不可超过128位
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
              message: this.$t('fileUploadFailed'), // :: 上传附件失败，请重试!
              duration: 1000,
              position: 'top'
            })
          }
          this.$refs['fileinput'].value = ''
        })
    },
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
<style lang="stylus">
  @import './index.styl'
</style>
