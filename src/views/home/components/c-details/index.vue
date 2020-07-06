<template lang="pug">
  .detailsSontent(v-loading="loading")
    Scroll
      .container
        .header
          .title {{DataSource.METTING_NAME}}
          .dateTime
            span.timeDate {{DataSource.time}}
            span.week {{DataSource.cycle}}
            span.time {{DataSource.timeSlot}}
            span.timeSlot {{DataSource.titleSlot}}
          .Convenor
            img(:src="founderImg")
            span 主持人：{{DataSource.userName}} ({{DataSource.mobile}})
        .content
          div
            .icons
              i(class="iconfont icon-meeting-room")
            .roomData
              .Subheading 会场
              .SubheadingContent {{DataSource.conferenceList}}
          div
            .icons
              i(class="iconfont icon-meeting-attendees")
            .roomData
              .Subheading 参会人 ({{DataSource.attendeeLength}})
              .SubheadingContent {{DataSource.attendeeList}}
          div
            .icons
              i(class="iconfont icon-meeting-founder")
            .roomData
              .Subheading 创建人
              .SubheadingContent {{DataSource.founderName}}
          div
            .icons
              i(class="iconfont icon-time")
            .roomData
              .Subheading 创建时间
              .SubheadingContent {{DataSource.CTime}}
          div
            .icons
              i(class="iconfont icon-meeting-issues")
            .roomData
              .Subheading 会议议题
              .SubheadingContent
                .issues(v-for="(time,index) in DataSource.metting_topics") {{time.TOPIC_NAME}}
                  .topicsContent {{time.TOPIC_CONTENT}}
                    .losure(v-for="(time2,index2) in time.fileList")
                      img(:src="fileUrl + time2.url")
                      .losureContent
                        p {{time2.name}}
                        p 22.3k
                      .download(@click="fileDownload(fileUrl + time2.url)")
                        i(class="iconfont icon-download")
                        | 下载
          div
            .icons
              i(class="iconfont icon-meeting-password")
            .roomData
              .Subheading 会场密码
              .SubheadingContent
                p 接入密码：
                  span(style="color:#333333FF") {{DataSource.METTING_ACCESSCODE}}
                p 主席密码：
                  span(style="color:#333333FF") {{DataSource.METTING_CHAIRMAIN_PWD}}
                p 成员密码：
                  span(style="color:#333333FF") {{DataSource.METTING_COMMON_PWD}}
    .control
      <mt-button type="danger">删除会议</mt-button>
      <mt-button type="primary" @click="entrySettings">进入控制</mt-button>
</template>
<script>
import Scroll from '@/components/c-scroll/index.vue'
import moment from '@/commons/moment.js'
export default {
  data() {
    return {
      DataSource: {},//数据源
      weekDay: ["周天", "周一", "周二", "周三", "周四", "周五", "周六"],// 周期
      fileUrl: '/fileServer/',//文件服务器路径
      loading: false // loading开启关闭
    }
  },
  components: {
    Scroll
  },
  props: {
    meetingId: {//会议ID
      type: [String],
      default: ''
    },
    creationTime: {//会议创建时间
      type: [String],
      default: ''
    },
    founderName: {//创建人
      type: [String],
      default: ''
    },
    founderImg: {// 创建人头像
      type: [String],
      default: ''
    }
  },
  watch:{
    meetingId() {
      this.getDetails()
    },
  },
  methods: {
    entrySettings() {
      // 进入控制

    },
    async getDetails() {
      //获取会议详情
      let vm = this;
      if(!vm.meetingId){
        vm.DataSource = []
        return
      }
      vm.loading = true
      let req = [{
        service: 'P1202613',
        metting_id: vm.meetingId,
        mask: false // 禁用全局菊花
      }];
      let result = await vm.$ajaxRequest(req,()=>{
        vm.loading = false;
      })
      if(result.code === '0'){
        vm.DataSource = result.data[0]
        if(!vm.DataSource.METTING_ENDTIME){
          vm.DataSource.METTING_ENDTIME = ' '
        }
        let time = vm.DataSource.METTING_STARTTIME.split(' ')[1]
        let time2 = vm.DataSource.METTING_ENDTIME.split(' ')[1]
        vm.DataSource.timeSlot = time.substring(0,5)+' - '+time2.substring(0,5);//会议时间
        vm.DataSource.titleSlot = moment(vm.DataSource.METTING_STARTTIME).format('a');//会议时间段
        vm.DataSource.cycle = moment(vm.DataSource.METTING_STARTTIME.split(' ')[0]).format('dddd');//周几
        vm.DataSource.time = vm.DataSource.METTING_STARTTIME.split(' ')[0].replace('-','.');//会议日期
        vm.DataSource.userName = result.data[0].meeting_host[0].USER_NAME;//主持人名称
        vm.DataSource.mobile = result.data[0].meeting_host[0].MOBILE;//主持人手机号
        vm.DataSource.CTime = vm.creationTime;//会议创建时间
        vm.DataSource.founderName = vm.founderName;//创建人
        let conference = []
        if(result.data[0].metting_room){
          result.data[0].metting_room.forEach((value) => {
            conference.push(value.ROOM_NAME)
          })
        }
        vm.DataSource.conferenceList = conference.join('、');//会场
        let attendee = []
        if(result.data[0].user_code){
          result.data[0].user_code.forEach((value) => {
            attendee.push(value.USER_NAME)
          })
        }
        vm.DataSource.attendeeLength = attendee.length + '人';//参会人数
        vm.DataSource.attendeeList = attendee.join('、');//参会人员
      }
    },
    fileDownload(url) {
      console.log(url)
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
