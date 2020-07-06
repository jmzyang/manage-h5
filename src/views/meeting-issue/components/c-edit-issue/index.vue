<template lang="pug">
  .c-edit-issue-container
    BarHeader(
      layout="title",
      :border="true",
      :title="editTitleTitle"
      :back="true",
      @back="editCancel")
    .edit-issue-container
      .edit-issue-box
        textarea(
          :placeholder="$t('inputIssueTitle')",
          maxlength="500",
          v-model="issueTitle")
        .issue-file-upload-button
          | ({{$t('fileSizeLimitation')}})
          //- :: 单个文件大小不能超过100MB
          .upload-button
            .iconfont.icon-issue-upload
            input(type="file", name="image", @change="selectFile($event)")
        .issue-file-list
          .issue-file-item(v-for="fileVal in issueFileList")
            .ext-thumb(:class="fileVal.name.split('.')[fileVal.name.split('.').length - 1].toLowerCase()")
            .meta
              .title {{fileVal.name}}
              .size 11112.k
            .selected-delete(@click="deletefile(item)")
              i(class="iconfont icon-meeting-delete")
        .issue-contacts(v-if="+KIparameter.OPEN_ISSUE_ATTENDEE === 1")
          span
            | {{$t('issueAttendee')}}
            //- :: 议题参会人
          span(@click="attendeeChoice")
            | {{$t('pleaseChoose')}}
            //- :: 请选择
            span  ({{selectedAttendee.length}}{{$t('people')}})
            //- :: 人
            i.icon-arrow-right.iconfont
      .issue-actions
        .button.submit(@click="sureDelegation()") {{$t('submit')}}
        //- :: 提交
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import { getDataByKey } from '@/utils/array'

import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
import BarHeader from '@/components/c-header'
export default {  
  computed: {
    ...mapState({
      // 联系人
      storeContacts (state) {
        return state.contacts.participantsIssue
      },
      KIparameter (state) {
        return state.common.KIparameter || {}
      }
    })
  },
  data() {
    return {
      issueTitle:'', // 议题标题
      issueFileList:[], // 议题附件列表
      personnelShow: false, // 已选参会人列表显示隐藏
      externalContactsOldValue: [], // 外部联系人旧值
      contactsOldValue: [], // 联系人旧值
      selectedAttendee: [], // 已选择的参会者
      editTitleTitle: this.editTitle || this.$t('addIssue') //- :: 议题标题
    }
  },
  props:{
    // 议题类型 1：会议控制、2：创建会议
    issueType:{
      type:[String,Number],
      default: 1
    },
    // 议题标题
    editTitle:{
      type:[String],
      default:''
    },
    // 编辑的数据
    issueDate:{
      type:[Object],
      default: () => {return {}}
    },
    // 议题名称集合
    topicName:{
      type:[Array],
      default:() => {return []}
    },
  },
  mounted(){
    console.log(this.issueDate)
    if(this.editTitleTitle === this.$t('modifyIssue')){ // :: 修改议题
      this.issueFileList = this.issueDate.fileList
      this.issueTitle = this.issueDate.TOPIC_NAME
      this.externalContactsOldValue = this.issueDate.external // 外部联系人旧值
      this.contactsOldValue = this.issueDate.user_code // 联系人旧值
      this.selectedAttendee = [
        ...this.issueDate.user_code.map(item => { 
          item.CONTACTS_TYPE = '0'
          return item
        }),
        ...this.issueDate.external.map(item => { 
          item.CONTACTS_TYPE = '1'
          return item
        })
      ]
      // 已选参会人
      this.attendeeChoice('Initialization') // 参会人回写
    }
  },
  components: {
    BarHeader
  },
  methods:{
    // 取消编辑议题
    editCancel() {
      if(this.editTitleTitle === this.$t('modifyIssue')){ // :: 修改议题
        this.$emit('editCancel',this.issueDate)
      }else{
        this.$emit('editCancel','add')
      } 
    },
    // 保存编辑议题
    editSubmit() {
      let vm = this
      if(vm.issueTitle.match(/^[ ]*$/) != null || !vm.issueTitle){
        vm.$Notify(this.$t('issueNameNoEmpty')); // :: 议题名称不能为空
      }else{
        let isOfRepeated = vm.topicName.findIndex((value, index, arr) => {
          return value === vm.issueTitle
        })
        if(isOfRepeated > -1){
          vm.$Notify(this.$t('issueNameExisting')); // :: 会议议题已存在
        }else if(this.editTitleTitle === this.$t('modifyIssue')){ // :: 修改议题
          vm.modifyIssue()
        }else{
          vm.addIssue()
        }
      }
    },
    // 新增议题
    async addIssue() { 
      let vm = this
      let attendeeList = [] // 参会人
      let attendeeList2 = [] // 参会人code
      let externalAttendeeList = []  // 外部联系人
      let externalAttendeeList2 = []  // 外部联系人
      let attendeeName = [] // 参会人名称集合
      vm.selectedAttendee.forEach(val => {
        if(vm.issueType == 2){ // 创会
          if (val.CONTACTS_TYPE == '1') {
            externalAttendeeList.push(val)
            externalAttendeeList2.push({
              name: val.USER_NAME,
              tel: val.MOBILE,
              email: val.EMAIL
            })
          }else{
            attendeeList.push(val)
            attendeeList2.push((val.USER_CODE))
          }
          attendeeName.push(val.USER_NAME)
        }else{ // 会控
          if (val.CONTACTS_TYPE == '1') {
            externalAttendeeList.push({
              name: val.USER_NAME,
              tel: val.MOBILE,
              email: val.EMAIL,
              CONTACTS_TYPE: '1'
            })
          }else{
            attendeeList.push(val.USER_CODE)
          }
        }
      })
      if(vm.issueType == 2){ // 创会
        vm.$emit('issueModify', 'add', {
          yitititle: vm.issueTitle,
          TOPIC_NAME: vm.issueTitle, // 议题标题
          fileList: vm.issueFileList, // 议题附件
          user_code: attendeeList, // 内部参会人
          user_code2: attendeeList2.join(','), // 内部参会人code
          external: externalAttendeeList, // 外部联系人
          external2: externalAttendeeList2, // 外部联系人
          code: new Date().getTime(), // 议题标识
          senator: attendeeName.join('、'), // 参会人名称集合
          index: vm.issueDate.index, // 下标
          beizhu: '' // 议题备注
        })
      }else{ // 会控
        let req = [{
          service: 'P1202640',
          topic_id: '',
          metting_id: vm.issueDate.METTING_ID,
          topic_name: vm.issueTitle,
          topic_content: '',
          user_code: attendeeList.join(','), // 参会人
          external: JSON.stringify(externalAttendeeList), // 外部联系人
          number: this.externalContactsOldValue.length + this.contactsOldValue.length, // 原参会人个数
          fileList: vm.issueFileList
        }]
        let result = await vm.$ajaxRequest(req)
        vm.$emit('issueModify','add')
      }
    },
    // 修改议题
    async modifyIssue() {
      let vm = this
      let attendeeList = [] // 参会人
      let attendeeList2 = [] // 参会人code
      let externalAttendeeList = []  // 外部联系人
      let externalAttendeeList2 = []  // 外部联系人
      let attendeeName = [] // 参会人名称集合
      vm.selectedAttendee.forEach(val => {
        if(vm.issueType == 2){ // 创会
          if (val.CONTACTS_TYPE == '1') {
            externalAttendeeList.push(val)
            externalAttendeeList2.push({
              name: val.USER_NAME,
              tel: val.MOBILE,
              email: val.EMAIL
            })
          }else{
            attendeeList.push(val)
            attendeeList2.push((val.USER_CODE))
          }
          attendeeName.push(val.USER_NAME)
        }else{ // 会控
          if (val.CONTACTS_TYPE == '1') {
            externalAttendeeList.push({
              name: val.USER_NAME,
              tel: val.MOBILE,
              email: val.EMAIL,
              CONTACTS_TYPE: '1'
            })
          }else{
            attendeeList.push(val.USER_CODE)
          }
        }
      })
      if(vm.issueType == 2){ // 创会
        vm.$emit('issueModify','modify',{
          yitititle: vm.issueTitle,
          TOPIC_NAME: vm.issueTitle, // 议题标题
          fileList: vm.issueFileList, // 议题附件
          user_code: attendeeList, // 内部参会人
          user_code2: attendeeList2.join(','), // 内部参会人code
          external: externalAttendeeList, // 外部联系人
          external2: externalAttendeeList2, // 外部联系人
          code: vm.issueDate.code, // 议题标识
          senator: attendeeName.join('、'), // 参会人名称集合
          index: vm.issueDate.index, // 下标
          beizhu: '' // 议题备注
        })
      }else{
        let req = [{
          service: 'P1202639',
          topic_id: vm.issueDate.TOPIC_ID,
          metting_id: vm.issueDate.METTING_ID,
          topic_name: vm.issueTitle,
          topic_content: '',
          user_code: attendeeList.join(','), // 参会人
          external: JSON.stringify(externalAttendeeList), // 外部联系人
          number: this.externalContactsOldValue.length + this.contactsOldValue.length, // 原参会人个数
          fileList: vm.issueFileList
        }]
        let result = await vm.$ajaxRequest(req)
        vm.$emit('issueModify','modify',vm.issueDate.index)
      }
    },
    // 选择上传附件
    selectFile(e){
      const file = e.target.files[0]
      if(file.size / 1024 / 1024 > 100){
        this.$Notify(this.$t('fileSizeLimitation')); // :: 单个文件大小不能超过100M
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
            // 上传成功
            let files = {}
            files.name = result.FILENAME
            files.NAME = result.FILENAME
            files.size = file.size
            files.url = result.FILEPATH
            files.URL = result.FILEPATH
            files.ATTA_ID = data['data'][0]['ID']
            this.issueFileList.push(files)
            
            console.log(this.issueFileList)
          })
        } else {
          this.$Notify(this.$t('fileUploadFailed')); // :: 上传附件失败，请重试!
        }
        e.target.value = ''
      })
    },
     // 删除附件
    deletefile(fileData){
      this.issueFileList = this.issueFileList.filter((item) => {
        return item !== fileData
      })
    },
    // 选择议题参议员
    attendeeChoice(type){
      console.log(`attendeeChoice`, this.selectedAttendee)
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
        value: this.selectedAttendee
      })
      if(type !== 'Initialization'){
        this.senatorChoice = true
      }
    },
    // 确定选择的议题参议人员
    async sureDelegation(){
      this.senatorChoice = false
      this.selectedAttendee = await UTILS_CONTACTS.getMembers(this.storeContacts)
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
