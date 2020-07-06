<template lang="pug">
  .page-wrap.edit-issue
    BarHeader(
      layout="title",
      :border="true",
      :title.sync="docTitle"
      :back="true",
      :backEvent="true",
      @back="handlerBack")
    .edit-issue-container(v-loading="loading")
      .edit-issue-box
        textarea(
          :placeholder="$t('inputIssueTitle')",
          maxlength="500",
          v-model="title")
        .issue-file-upload-button
          | ({{$t('fileSizeLimitation')}})
          //- :: 单个文件大小不能超过100MB
          .upload-button
            .iconfont.icon-issue-upload
            //- 上传文件
            input(type="file", name="image", @change="selectFile($event)")
        .issue-file-list
          .issue-file-item(v-for="(file, index) in fileList")
            .ext-thumb(:class="file.name.split('.')[file.name.split('.').length - 1].toLowerCase()")
            .meta
              .f-name {{file.name}}
              .f-size {{file.size}} K
            .delete(@click="deletefile(file, index)")
              i.iconfont.icon-selected-delete
        .issue-contacts(v-if="+KIparameter.OPEN_ISSUE_ATTENDEE === 1")
          span
            | {{$t('issueAttendee')}}
            //- :: 议题参会人
          span(@click="chooseContacts")
            | {{$t('pleaseChoose')}}
            //- :: 请选择
            span  ({{storeContacts.total}}{{$t('people')}})
            i.icon-arrow-right.iconfont
        .vote-container(v-if="KIparameter.PAPERLESS_TYPE == 1 && issueType == 2")
          .vote-list(v-for="(itemVote,indexVote) in voteList" :key="indexVote")
            input(v-model="itemVote.voteContent")
            span(@click="deletVote(voteList,indexVote)")
              i.iconfont.icon-clear
          .vote-add(@click="voteAdd(voteList)")
            span
              | {{$t('addVote')}}
              //- :: 添加表决
            span
              | {{$t('added')}}
              //- :: 请选择
              span  ({{voteList.length}}{{$t('PCS')}})
              //- :: 人
              i.icon-arrow-right.iconfont
      .issue-actions
        .button.submit(@click="submit()") {{$t('determine')}}
        //- 提交
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import * as UTILS_CONTACTS from '@/stores/contacts/utils'

import { getDataByKey, externalFormatAdd } from '@/utils/array'

import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
import BarHeader from '@/components/c-header'
export default {
  computed: {
    ...mapState({
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
      meetingFormIssue: state => state.meeting[state.route.query.stateName].meetingIssue || [],
      // 议题数据
      meetingIssueForm: state => state.meeting.meetingIssueForm,
      // 联系人
      storeContacts (state) {
        return state.contacts.participantsIssue
      },
      // 议题集合
      meetingIssueNameList: state => state.meeting.meetingIssueName
    })
  },
  data() {
    return {
      // 路由参数
      issueIndex: this.$route.query.issueIndex, // 议题索引ID，用于判断修改还是新增
      isNotice: this.$route.query.isNotice || false, // 会议状态
      issueType: this.$route.query.issueType || 2, // 议题类型 1：会议控制、2：创建会议
      meetingId: this.$route.query.meetingId || '',
      stateName: this.$route.query.stateName || '',
      mutation: this.$route.query.mutation || '',
      businessType: this.$route.query.businessType || 0,
      selected: this.$route.query.selected || 0, // 是否是选完人之后跳转
      // 组件参数
      loading: false,
      docTitle: this.$t('addIssue'), // 添加议题
      title: '', // 议题标题
      fileList: [], // 议题附件列表,
      voteList: [] // 表决列表
    }
  },
  mounted(){
    // 判断是否编辑
    if (+this.issueIndex > -1) {
      this.docTitle = this.$t('modifyIssue') // 添加议题
    }
    const ISSUES_DATA = JSON.parse(JSON.stringify(this.meetingIssueForm))
    this.fileList = ISSUES_DATA.fileList || []
    this.title = ISSUES_DATA.title
    this.voteList = ISSUES_DATA.vote || []
    if (!this.selected) {
      this.$store.commit(TYPES_CONTACTS.M_PARTICIPANTS_ISSUE, {
        value: {
          organization: ISSUES_DATA.contacts.organization || [],
          member: ISSUES_DATA.contacts.member || [],
          total: ISSUES_DATA.contacts.total || 0
        }
      })
    }
  },
  destroyed () {
    // this.$store.commit(TYPES_CONTACTS['M_MEETING_ISSUE_FORM'], {
    //   type: 'clear'
    // })
    // this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
    //   type: 'clear'
    // })
  },
  components: {
    BarHeader
  },
  methods:{
    // 取消编辑议题
    handlerBack() {
      this.$store.commit(TYPES_MEETING['M_MEETING_ISSUE_NAME_LIST'], {
        type: 'clear'
      })
      this.$store.commit(TYPES_MEETING['M_MEETING_ISSUE_FORM'], {
        type: 'clear'
      })
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
        type: 'clear'
      })
      if (+this.issueType === 2) {
        this.$router.replace({
          name: 'meeting.chooseIssue',
          query: {
            isNotice: this.isNotice,
            issueType: this.issueType,
            meetingId: this.meetingId,
            stateName: this.stateName,
            mutation: this.mutation,
            businessType: this.businessType
          }
        })
      }else if(+this.issueType === 1){
        this.$router.replace({
          name: 'meeting-control',
          query: {
            meetingId: this.$route.query.meetingId,// 会议ID
            platId: this.$route.query.platId,// 什么什么ID
            meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地

            founderName: this.$route.query.founderName,
            unread: this.$route.query.unread,
            listType: this.$route.query.listType,
            currentNav: this.$route.query.currentNav,
          }
        })
      }
    },
    // 提交
    submit() {
      if(!this.title || this.title.length < 1 || this.title.match(/^[ ]*$/) != null) {
        this.$Notify(this.$t('issueNameNoEmpty')); // :: 议题名称不能为空
        return false
      }
      if (+this.issueType === 2) {
        console.log(`submit`, this.meetingFormIssue)
        let isRepeated = this.meetingFormIssue.findIndex((value, index, arr) => {
          return value.title === this.title && +this.issueIndex !== index
        })
        if(isRepeated > -1 ){
          this.$Notify(this.$t('issueNameExisting')); // :: 会议议题已存在
          return false
        }
        // 当前数据集合
        const ISSUE_DATA = {
          title: this.title, // 议题标题
          fileList: this.fileList, // 议题附件
          contacts: this.storeContacts, // 内部参会人
          vote: this.voteList, // 表决
          code: new Date().getTime() // 议题标识
        }
        // 插入数据集合索引位置
        const ISSUE_INDEX = +this.issueIndex > -1 ? +this.issueIndex : this.meetingFormIssue.length
        console.log(`submitCallback`, this.issueIndex, this.meetingFormIssue)
        this.submitCallback(ISSUE_INDEX, ISSUE_DATA)
      } else if(+this.issueType === 1) {
        if(this.meetingIssueNameList.indexOf(this.title) > -1){
          this.$Notify(this.$t('issueNameExisting')); // :: 会议议题已存在
          return false
        }
        this.submitContrilIssue()
      }
    },
    // 提交回调
    async submitCallback(_index, _data) {
      if (+this.issueType === 2) {
        // 创会
        let meetingFormIssue = JSON.parse(JSON.stringify(this.meetingFormIssue))
        meetingFormIssue[_index] = _data

        console.log(`submitCallback`, meetingFormIssue)
        this.$store.commit(TYPES_MEETING[this.storeMutationForm], {
          type: 'assign',
          value: {
            meetingIssue: meetingFormIssue
          }
        })
        this.$store.commit(TYPES_MEETING['M_MEETING_ISSUE_FORM'], {
          type: 'clear'
        })
        this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
          type: 'clear'
        })
        this.$router.replace({
          name: 'meeting.chooseIssue',
          query: {
            isNotice: this.isNotice,
            issueType: this.issueType,
            meetingId: this.meetingId,
            stateName: this.stateName,
            mutation: this.mutation,
            businessType: this.businessType
          }
        })
      }
    },
    async submitContrilIssue () {
      // 内部联系人
      const contactsEnterprise = this.storeContacts.member.filter(item => +item.CONTACTS_TYPE !== 1)
      // 外部联系人
      const contactsExternal = this.storeContacts.member.filter(item => +item.CONTACTS_TYPE === 1)

      let req = [{
        service: this.$route.query.issueId ? 'P1202639' : 'P1202640',
        topic_id: this.$route.query.issueId ? this.$route.query.issueId : '',
        metting_id: this.$route.query.meetingId,
        topic_name: this.title,
        topic_content: '',
        user_code: getDataByKey(contactsEnterprise, 'USER_CODE').join(','), // 参会人
        external: externalFormatAdd(contactsExternal), // 外部联系人
        number: this.$route.query.number ? this.$route.query.number : 0, // 原参会人个数
        fileList: this.fileList
      }]

      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        this.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        this.$router.replace({
          name: 'meeting-control',
          query: {
            meetingId: this.$route.query.meetingId,// 会议ID
            platId: this.$route.query.platId,// 什么什么ID
            meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地

            founderName: this.$route.query.founderName,
            unread: this.$route.query.unread,
            listType: this.$route.query.listType,
            currentNav: this.$route.query.currentNav,
          }
        })
      }else{
        this.$Notify({message:result.msg});
      }
    },
    // 选择上传附件
    selectFile(e){
      const file = e.target.files[0]
      if(file.size / 1024 / 1024 > 100){
        this.$Notify(this.$t('fileSizeLimitation'));  // :: 单个文件大小不能超过100MB
        e.target.value = ''
        return false;
      }
      if(file.name.length > 128){
        this.$Notify(this.$t('fileLengthLimitation')); // :: 附件名称长度不可超过128位
        e.target.value = ''
        return false;
      }
      if (e.target.files.length === 0) {
        e.target.value = ''
        return
      }
      let image = new FormData()
      image.append('avatar', file)
      let req = {
        service: 'P1008501',
        ATTA_CHNL: 1,
        DIR: '',
        data: image
      }
      this.loading = true
      let data = ImageUpload(req)
      axios.defaults.headers['Content-Type'] = data['multipart/form-data']
      axios.post(data.url, data['data']).then(res => {
        if (res['data'][0].flag === 'true') {
          let result = res['data'][0]['data'][0]
          let req2 = [{
            service: 'U1008501',
            ATTA_CHNL: 1,
            ATTA_NAME: result['FILENAME'],
            ATTA_URL: result['FILEPATH'],
            ATTA_SIZE: result['FILESIZE']
          }]
          this.$ajaxRequest(req2, (data) => {
            this.loading = false
            // 上传成功
            let files = {}
            files.name = result.FILENAME
            files.NAME = result.FILENAME
            files.size = file.size
            files.url = result.FILEPATH
            files.URL = result.FILEPATH
            files.ATTA_ID = data['data'][0]['ID']
            this.fileList.push(files)
          })
        } else {
          this.loading = false
          this.$Notify(this.$t('fileUploadFailed')); // :: 上传附件失败，请重试!
        }
        e.target.value = ''
      }).catch((e) => {
        this.loading = false
      })
    },
     // 删除附件
    deletefile(item, _index){
      this.fileList.splice(_index, 1)
    },
    // 选择议题参议员
    chooseContacts(type){
      this.$store.commit(TYPES_MEETING['M_MEETING_ISSUE_FORM'], {
        type: 'assign',
        value: {
          index: this.issueIndex,
          title: this.title,
          fileList: this.fileList
        }
      })
      this.$router.replace({
        name: 'contacts.index',
        query: {
          routerSubmit: 'meeting.issue.add',
          scene: this.$t('issueAttendee'), // 议题参会人
          selectType: 'participantsIssue',
          key: 'participantsIssue',
          ...this.$route.query
        }
      })
    },
    // 添加表决
    voteAdd (data) {
      if(data.length > 0 && (data[data.length - 1].voteContent.length < 1 || data[data.length - 1].voteContent.match(/^[ ]*$/) != null)){
        this.$Notify(this.$t('voteNocomplete'));
      }else{
        this.$set(data,data.length,{
          voteContent: ''
        })
      }
    },
    // 删除表决
    deletVote (item,index) {
      if(!item[index].voteContent || item[index].voteContent.match(/^[ ]*$/) != null || item[index].voteContent.length < 1){
        item.splice(index,1)
      }else{
        this.$Dialog.confirm({
          title: this.$t('tips'), // :: 提示
          message: this.$t('determineToDeleteThisVote') // :: 确认是否删除该表决
        }).then(async() => {
          item.splice(index,1)
        }).catch(() => {
          // on cancel
        });
      }
    },
  }
}
</script>
<style lang="stylus" scoped>
  @import './add.styl'
</style>
