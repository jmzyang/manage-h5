<template lang="pug">
LayoutPage
    template(slot="left")
      LeftHeader(
        layout="title"
        :title="$t('personalData')"
        :style="{'boxShadow':'0px 4px 8px 0px rgba(100,120,160,0.05)'}"
        :back="true")
      //- 个人资料
      .my-info-editing
        .form
          .formItem
            .avatar(v-avatar="head" :full-name="name" :base-url="baseUrl")
            input.upload-head(type="file", name="image", @change="selectFile",ref="fileinput", accept="image/jpeg, image/png")
            span.formTitle {{$t('headPortrait')}}
            //- 头像
          .formItem
            input(v-model="phone", v-validate="'required|phone'",maxlength="40", name="phone", :data-vv-as="$t('phoneNumber')")
            span.formTitle {{$t('phoneNumber')}}
            //- 手机号码
            span.tips(v-show="errors.has('phone')") {{ errors.first('phone') }}
          .formItem
            input(v-model="email", v-validate="'required|email|max:200'",maxlength="200", name="email", :data-vv-as="$t('mailbox')")
            span.formTitle {{$t('mailbox')}}
            //- 邮箱地址
            span.tips(v-show="errors.has('email')") {{ errors.first('email') }}
        .commit(@click="commit" v-loading.fullscreen.lock="fullscreenLoading") {{$t('submit')}}
        //- 提交
</template>
<script>
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'

import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
export default {
  components: {
    LayoutPage,
    LeftHeader: BarHeader
  },
  data () {
    return {
      fullscreenLoading: false,
      baseUrl: window.location.protocol + '//' + window.location.host + '/fileServer/',
      // baseUrl: 'http://172.16.4.155:82/fileServer/',
      name: this.$store.state.common.userBaseInfo.USER_NAME || '',
      phone: this.$store.state.common.userBaseInfo.MOBILE || '',
      email: this.$store.state.common.userBaseInfo.EMAIL || '',
      head: this.$store.state.common.userBaseInfo.USER_ICON || ''
    }
  },
  mounted () {
    // console.log(this.$store.state.common.userBaseInfo)
  },
  methods: {
    selectFile(e) {
      // 新增附件
      let vm = this
      const file = e.target.files[0]
      if(file.size / 1024 / 1024 > 100){
        this.$Notify(this.$t('fileSizeLimitation'));  // 单个文件大小不能超过100MB
        return false;
      }
      if(file.name.length > 128){
        this.$Notify(this.$t('fileLengthLimitation'));  // 文件名称长度不可超过128位
        return false;
      }
      this.filesData = file
      if (e.target.files.length === 0) {
        e.target.value = ''
        return
      }
      let image = new FormData()
      image.append('avatar', this.filesData)
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
            this.head = result.FILENAME
            let req = [{
              service: 'P0004015',
              USER_ICON: this.head
            }]
            this.$ajaxRequest(req, (result) => {
              if (result.code === '0') {
                this.fullscreenLoading = false
                this.$toast({
                  message: this.$t('uploadSuccess'),  // 上传头像成功！
                  duration: 1000,
                  position: 'top'
                })
                this.$store.commit('M_COMMON_LOGIN', { key: 'USER_ICON', val: this.head })
              }
            })
          })
        } else {
          vm.$Notify(this.$t('fileUploadFailed'));  // 上传头像失败，请重试!
        }
        this.$refs['fileinput'].value = ''
      })
    },
    commit () {
      this.fullscreenLoading = true
      this.$validator.validateAll().then((result) => {
        if (result) {
          let MOBILE = this.$store.state.common.userBaseInfo.MOBILE
          let EMAIL = this.$store.state.common.userBaseInfo.EMAIL
          if (this.phone === MOBILE && this.email === EMAIL) {
            this.fullscreenLoading = false
            this.$toast({
              message: this.$t('personalDataNotModified'), // :: 个人资料未做任何修改！
              duration: 1000,
              position: 'top'
            })
          } else {
            let req = [{
              service: 'P0004015',
              EMAIL: this.email,
              MOBILE: this.phone
            }]
            this.$ajaxRequest(req, (result) => {
              if (result.code === '0') {
                this.fullscreenLoading = false
                this.$toast({
                  message: this.$t('personalDataAmended'), // :: 个人资料修改成功！
                  duration: 1000,
                  position: 'top'
                })
                this.$store.commit('M_COMMON_LOGIN', { key: 'EMAIL', val: this.email })
                this.$store.commit('M_COMMON_LOGIN', { key: 'MOBILE', val: this.phone })
              }
            })
          }
        }
        this.fullscreenLoading = false
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import 'index.styl'
</style>
