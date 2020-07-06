<template lang="pug">
.scroll-layout
  Scroll
    div.demo
      div.demo-box
        div.title
          p.f-info 选择文件
        div.content
          div {{selectedFile}}
          div {{selectedFileBase64}}
          van-button(type="primary", size="normal", @click="$android.selectFile") 选择附件
      div.demo-box
        div.title
          p.f-info H5上传
        div.preview(v-if="uploadedFiles.length > 0")
          .item(v-for="item in uploadedFiles")
            img(:src="item")
        div.content
          van-uploader(:after-read="onRead", accept="image/gif, image/jpeg", :max-size="1024*1024*100", multiple, @oversize="oversize")
            van-icon(name="plus", style="font-size: 100px")
      div.demo-box
        div.title
          p.f-info 下载文件
        div.content
          input(type="button" value="下载文件" @click="downLoadFile")
      div.demo-box
        div.title
          p.f-info 扫一扫
        div.content
          div {{qrCode}}
          van-button(type="primary", size="normal", @click="scanCode") 扫一扫
      div.demo-box
        div.title
          p.f-info 无纸化APP
        div.content
          div {{qrCode}}
          van-button(type="primary", size="normal", @click="goApp") 打开无纸化
</template>

<script>
import storage from '@/commons/storage'
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
// 引入组件
import Scroll from '@/components/c-scroll/'
window.downLoadCallBack = function(info){
  let obj = JSON.parse(info)
  if (obj.progress >= 100) {
    alert('下载完成：' + obj.downloadPath)
  }
}
export default {
  data () {
    return {
      selectedFile: '',
      selectedFileBase64: '',
      qrCode: '',
      filesLength: 0,
      uploadedFiles: []
    }
  },
  computed: {},
  created () { },
  mounted () {
    let vm = this
    // 注册一个全局选择附件回调
    window['selectFileCallBack'] = (result) => {
      vm.selectedFile = result
    }
    window['scanCodeCallBack'] = (result) => {
      this.qrCode = result
    }
  },
  watch: {},
  methods: {
    scanCode () {
      this.$android.scanCode()
    },
    goApp () {
      const USERID = '1195'
      const PASSWORD = '920153261fdf52c5a742f85cb190caee'
      this.$android.goApp(USERID, PASSWORD)
    },
    onRead(file) {
      if (Array.isArray(file)) {
        this.filesLength = file.length
        for (let i = 0; i < file.length; i++) {
          this.uploadFile(file[i])
        }
      } else {
        this.filesLength = 1
        this.uploadFile(file)
      }
    },
    oversize (file) {
      this.$Toast.fail(`文件超了`)
    },
    downLoadFile() {
      let b="http://s1.xmcdn.com/apk/MainApp_v6.5.69.3_seo-xiongzhanghao.apk?shortlink=59c9030f&pid=seo-xiongzhanghao";
      window.AndroidWebView.downLoadFile(b,"apk");
      let c="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1556427881805&di=b64fbd9629d2c123bd1729970496efce&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201411%2F08%2F20141108190050_uc3Jf.jpeg";
      window.AndroidWebView.downLoadFile(c,"jpg");
    },
    uploadFile (_file) {
      let uploadForm = new FormData()
      uploadForm.append('demo', _file.file)
      let req = {
        service: 'P1008501',
        ATTA_CHNL: 1,
        DIR: 'images',
        data: uploadForm
      }

      let data = ImageUpload(req)
      
      axios.defaults.headers['Content-Type'] = data['multipart/form-data']
      axios.post(data.url, data['data']).then((res) => {
        let result = res['data'][0]['data'][0]
        if (res['data'][0].flag === 'true') {
          let result = res['data'][0]['data'][0]
          this.uploadedFiles.push(result['FILEVIEWURL'])
          this.$Toast(`上传成功`)
        } else {
          this.$Toast.fail(`上传失败`)
        }          
      }).catch((error)=> {
        this.$Toast.fail(`上传失败`)
      })
    }
  },
  components: {
    Scroll
  },
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
