<template lang="pug">
  LayoutPage
    template(slot="left")
      LeftHeader(
        layout="title"
        :title="$t('feedback')"
        :style="{'boxShadow':'0px 4px 8px 0px rgba(100,120,160,0.05)'}"
        :back="true")
      //- 问题反馈
      .feedback
        .title {{$t('problemDescription')}}
        //- 问题描述
        textarea.con(:placeholder="$t('questionFeedback')", v-model="info", v-validate="'required|max:600'",maxlength="600", name="info", :data-vv-as="$t('problemDescription')")
        //- 请描述您要反馈的问题 ，:: 问题描述
        span.tips {{ errors.first('info')||''}}
        .title.imgtitle {{$t('uploadPictures')}}
          //- 您也可以上传相关问题图片
          span {{imgNum}}/{{imgTotal}}
        .imglist
          .imgitem(v-for="(img,index) in imgList", :key="index")
            img(:src="img.src")
            i.iconfont.icon-delete.del(@click="delImg(img.ATTA_ID)")
          a.imgitem.addImg(v-if="imgNum < imgTotal") +    
            input(class="crop-input", type="file", :value="selectedFile", name="image", accept="image/jpeg, image/png", @change="setImage($event)", @click="selectFile" ref="fileinput")
        .commit(@click="commit" v-loading.fullscreen.lock="fullscreenLoading") {{$t('submit')}}
        //- 提交
</template>
<script>
import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
export default {
  components: {
    LayoutPage,
    LeftHeader: BarHeader
  },
  data () {
    return {
      imgTotal: 5,
      imgList: [],
      filesData: null,
      info: '',
      fullscreenLoading: false,
      selectedFile: ''
    }
  },
  computed: {
    imgNum () {
      return this.imgList.length
    }
  },
  mounted(){
    window['selectFileCallBack'] = (result) => {
      this.selectedFile = result
      this.$nexTick(()=>{
        this.setImage()
      })
    }
  },
  methods: {
    delImg (ATTA_ID) {
      this.imgList = this.imgList.filter((item) => {
        return item.ATTA_ID !== ATTA_ID
      })
    },
    setImage () {
      let image
      const file = this.$refs.fileinput.files[0]
      if(file.name.length > 128){
        this.$Notify(this.$t('fileLengthLimitation')); // :: 附件名称长度不可超过128位
        return false;
      }
      this.filesData = file
      if (this.$refs.fileinput.length === 0) {
        this.selectedFile = ''
        return
      }
      if (!file.type.includes('image/')) {
        this.selectedFile = ''
        return
      }
      image = new FormData()
      image.append('avatar', this.filesData)
      let req = {
        service: 'P1008501',
        ATTA_CHNL: 1,
        DIR: 'images',
        data: image
      }
      let data = ImageUpload(req)
      axios.defaults.headers['Content-Type'] = data['multipart/form-data']
      axios.post(data.url, data['data'])
        .then(res => {
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
              let img = {}
              img.src = result['FILEVIEWURL']
              img.ATTA_ID = data['data'][0]['ID']
              this.imgList.push(img)
            })
          } else {
            this.$toast({
              message: this.$t('fileUploadFailed'), // :: 上传图片失败，请重试！
              duration: 1000,
              position: 'top'
            })
          }
          this.$refs['fileinput'].value = ''
        })
    },
    selectFile(){
      // try {
      //   this.$android.selectFile()
      // }catch (e) {
      //   console.log('当前系统不是安卓系统，已采用H5接口读取本地文件！')
      // }
    },
    commit () {
      this.fullscreenLoading = true
      this.$validator.validateAll().then((result) => {
        if (result) {
          let ATTA_ID = []
          this.imgList.forEach((item) => {
            ATTA_ID.push(item.ATTA_ID)
          })
          ATTA_ID = ATTA_ID.join(',')
          let req = [{
            service: 'p2019010901',
            ATTA_ID,
            FEEDBACK_INFO: this.info
          }]
          this.$ajaxRequest(req, (resut) => {
            if (resut['head']['MSG_CODE'] === '0') {
              this.fullscreenLoading = false
              this.$toast({
                message: this.$t('feedbackSuccess'), // :: 已收到您的反馈，谢谢
                duration: 1000,
                position: 'top'
              })
              this.info = ''
              this.imgList = []
            }
          })
        }
        this.fullscreenLoading = false
      })
    }
  },
  watch:{
    selectedFile(selectedFile){
      if(selectedFile){
        this.setImage(null,selectedFile)
      }
    }
  }
}
</script>
<style scoped lang="stylus">
@import 'index.styl'
</style>
