<template lang="pug">
  .c-issue-modify-container
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
        //- 请输入议题标题
        .issue-file-upload-button
          | ({{$t('fileSizeLimitation')}})
          //- 单个文件大小不能超过100MB
          .upload-button
            .iconfont.icon-issue-upload
            input(type="file", name="image", @change="selectFile($event)")
        .issue-file-list
          .issue-file-item(v-for="(file, index) in fileList")
            .ext-thumb(:class="file.name.split('.')[file.name.split('.').length - 1].toLowerCase()")
            .meta
              .f-name {{file.name}}
              .f-size {{file.size}} K
            .delete(@click="deletefile(file, index)")
              i.iconfont.icon-selected-delete
        .issue-contacts(v-if="+KIparameter.OPEN_ISSUE_NOTICE === 1")
          span
            | {{$t('issueAttendee')}}
            //- :: 议题参会人：
          span(@click="chooseContacts")
            | {{$t('pleaseChoose')}}
            //- :: 请选择
            span  ({{storeContacts.total}}{{$t('people')}})
            //- :: 人
            i.icon-arrow-right.iconfont
      .issue-actions
        .button.submit(@click="submit()") {{$t('submit')}}
        //- :: 提交
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_MEETING from '@/stores/meeting/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'
import { getDataByKey } from '@/utils/array'
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
import BarHeader from '@/components/c-header'
export default {
  components: {
    BarHeader
  },
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
  data () {
    return {
      docTitle: this.$t('addIssue'), // 标题  添加议题
      title: '', // 议题标题
      loading: false,
      fileList: [] // 议题附件列表
    }
  },
  props:{
    
  },
  watch: {
    
  },
  methods:{
    // 取消编辑议题
    handlerBack() {
      this.$emit('returnControl',false)
    },
    // 提交
    submit() {
      
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
        this.$Notify(this.$t('fileLengthLimitation'));  // :: 附件名称长度不可超过128位
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
          this.$Notify(this.$t('fileUploadFailed'));  // 上传附件失败，请重试!
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
          scene: this.$t('issueAttendee'), // :: 议题参会人：
          selectType: 'participantsIssue',
          key: 'participantsIssue',
          ...this.$route.query
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>