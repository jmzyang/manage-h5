<template lang="pug">
  .summary-container
    BarHeader(
      layout="title",
      :back="true",
      :backEvent="true",
      @back="summaryReturn")
      | {{$t('meetingSummary')}}
      //- :: 会议纪要
    .summary-box
      Scroll
        .summary-box-head {{summaryData.METTING_NAME}}
        .summary-box-main
          .summary-box-main-read-only
            .read-only-box
              .read-only-left {{$t('host')}}
              //- :: 主持人
              .read-only-right {{summaryData.METTING_USER}}
            .read-only-box
              .read-only-left {{$t('meetingTime')}}
              //- :: 会议时间
              .read-only-right {{summaryData.time}}
            .read-only-box(v-show="showAll")
              .read-only-left {{$t('conferenceHall')}}
              //- :: 会场
              .read-only-right {{summaryData.METTING_ROOM}}
            .read-only-box(v-show="showAll")
              .read-only-left {{$t('attendee')}}
              //- :: 参会人
              .read-only-right {{summaryData.ATTEND_LIST ? summaryData.ATTEND_LIST : $t('kong')}}
            .read-only-box(v-show="showAll")
              .read-only-left {{$t('dove')}}
              //- :: 应会未到
              .read-only-right {{summaryData.NO_ATTEND_LIST ? summaryData.NO_ATTEND_LIST : $t('kong')}}
          .toggle 
            span(@click="showAll = true" v-show="!showAll")
              | {{$t('expand')}} &nbsp;&nbsp;
              //- :: 展开
              van-icon(name="arrow-down")
            span(@click="showAll = false" v-show="showAll")
              | {{$t('retract')}} &nbsp;&nbsp;
              //- :: 收起
              van-icon(name="arrow-up")
          .card-issue-wrap(v-if="issueDataVal && issueDataVal.length > 0")
            .editable-title | {{$t('meetingIssue')}}
            //- :: 会议议题
            .editable-list(v-for="(item,index) in issueDataVal" :key="index")
              .issue-main(@click="toggle(index)")
                .issue-left {{index+1}}
                .issue-center {{item.TOPIC_NAME}}
                van-icon.toggle-icon(name="arrow-down" :class="{show: item.show}")
              .issues-info-wrap(v-show="item.show")
                .issue-man(v-if="item.DECISION_CONTENTS")
                  .item-tile {{$t('conclusion')}}{{item.DECISION_CONTENTS}}
                .uploads(:ref="'ff'+index")
                  ul.file-list(v-if="item.FILE.length")
                    li.is-success(v-for="sub in item.FILE")
                      .img(:class="sub.ATTA_NAME.split('.')[sub.ATTA_NAME.split('.').length - 1]")
                      .file-item
                        p.name {{sub.ATTA_NAME}}
                        p.size {{sub.ATTA_SIZE}}
                      i.iconfont.icon-download(@click="downloadFile(sub)")
</template>
<script>
import { ImageUpload } from '@/utils/formate'
import axios from 'axios'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  data(){
    return {
      operationBtn: this.$t('edit'), // 左上角操作按钮 :: 编辑
      summaryData: [], // 会议纪要数据
      issuesData: [], // 议题列表
      hiddenState:[false,false,false], // 展开显示隐藏：0：会议地点，1：参会人员，2：应会未到
      hiddenContent:[false,false,false], // 展开显示隐藏：0：会议地点，1：参会人员，2：应会未到
      participantVal:'', // 编辑参会人员值
      doveVal:'', // 编辑应到人员值
      issueDataVal:[], // 编辑议题值
      showAll: false, // 是否展开全部
    }
  },
  components: {
    Scroll,
    BarHeader
  },
  props: {
    // 详情入参
    meetingId: {
      type: [String],
      default: ''
    }
  },
  mounted(){
    window['downLoadCallBack'] = (result) => {
      let obj = JSON.parse(result)
      if (obj.progress >= 100) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadCompleted')},${this.$t('saveAddress')}：${obj.downloadPath}`, duration: 3000, background: '#1989fa' })
      } else if (obj.state == 0) {
        this.$Notify({ message: `"${obj.name}"${this.$t('downloadFailure')}`, duration: 2000 })
      }
    }
    this.getSummaryData()
  },
  methods:{
    // 返回
    summaryReturn(){
      let vm = this
      if(vm.operationBtn === this.$t('preservation')){ // :: 保存
        vm.operationBtn = this.$t('edit') // :: 编辑
      }else{
        vm.$emit('summaryReturn')
      }
    },
    // 展开收起
    toggle(i) {
      let isShow = this.issueDataVal[i].show
      this.$set(this.issueDataVal[i], 'show', !isShow)
    },
    // 获取会议纪要数据
    async getSummaryData(){
      if(!this.meetingId){
        return false
      }
      let vm = this
      let req = [{
          service: 'M4007401',
          METTING_ID: vm.meetingId,
          mask: false // 禁用全局菊花
      }]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.issueDataVal =  JSON.parse(JSON.stringify(result.data[0].top)) // 深拷贝保存编辑的议题数据源对象
        vm.summaryData = result.data[0] // 会议纪要数据源
        if(vm.summaryData.METTING_STARTTIME && vm.summaryData.METTING_ENDTIME){
          let endTime = vm.summaryData.METTING_ENDTIME
          vm.summaryData.time = vm.summaryData.METTING_STARTTIME.substring(0, endTime.length - 3) + '-' + endTime.substring(endTime.length - 8, endTime.length - 3)
        }else{
          vm.summaryData.time = vm.summaryData.METTING_STARTTIME
        }
      } else {
        vm.summaryData = []
        vm.issueDataVal = []
      }
    },
    // 下载附件
    downloadFile(url,fileName) {     
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
<style lang="stylus" scoped>
@import './index.styl'
</style>
