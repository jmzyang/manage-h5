<template lang="pug">
  .response-container(v-loading="loading")
    BarHeader(
      layout="title",
      :back="true",
      :backEvent="true",
      @back="responseReturn")
      | {{$t('attendance')}}
      //- :: 应会情况
    .response-box   
      .response-info
        Scroll
          van-collapse(v-model="activeName", :border="false")
            template(v-for="(item, index) in responseDateInfo")
              van-collapse-item(:name="item.resType", class="group-title") 
                .title(slot="title") {{ item.type }}
                  span.number {{ item.count }}{{$t('people')}}
                .response-man-box
                  .member-item(v-for="item2 in responseData" :class="{'refuse':item.resType === '1'}" v-if="item.resType == (item2.IF_ATTEND?item2.IF_ATTEND:'3')")
                    .item-box2(v-if="item2.IF_ATTEND == '1'")
                      .head
                        .avatar(v-avatar="item2.USER_ICON", :full-name="item2.USER_NAME")
                      .info
                        h2.name {{item2.USER_NAME}}
                        p.reason {{item2.NO_ATTEND_REASON ? item2.NO_ATTEND_REASON:$t('kong')}}
                        p.time {{item2.CORRESPONDING_TIME ? item2.CORRESPONDING_TIME:$t('kong')}}
                    .item-box(v-else)
                      .avatar(v-avatar="item2.USER_ICON", :full-name="item2.USER_NAME")
                      h2.name {{item2.USER_NAME}}
</template>
<script>
import axios from 'axios'
import Scroll from '@/components/c-scroll/'
import BarHeader from '@/components/c-header'
export default {
  components: {
    Scroll,
    BarHeader
  },
  filters: {
    headImg (i) {
      if (i) {
        i = i.substring(i.length - 2)
        return i
      } else {
        return this.$t('kong')
      }
    }
  },
  mounted () {
    this.getResponse()
  },
  methods: {
    responseReturn(){
      this.$router.push({
        name: 'meeting-details',
        query: {
          ...this.$route.query
        }
      })
    },
    // 获取应会信息
    async getResponse (id) {
      let vm = this;
      vm.loading = true
      let req = [{
        service: 'M4006401',
        METTING_ID: this.$route.query.meetingId,
        IF_ATTEND: vm.responsetype
      }]
      let result = await vm.$ajaxRequest(req)
      if (result.code == 0) {
        vm.loading = false
        vm.responseData = result.data
        vm.responseDataFormat(vm.responseData)
			} else {
        vm.loading = false
        this.$Notify({ message: `${result.msg}`, duration: 2000 })
			}
    },
    // 处理获取到的应会数据
    responseDataFormat (_data) {
      this.responseDateInfo.forEach(i => {
        i['count'] = 0
      })
      _data.forEach(item => {
        if (item.IF_ATTEND == '0') {
          this.responseDateInfo.forEach(i => {
            if(i.type == this.$t('accept')) { // :: 已接受
              i['count']++
            }
          })
        } else if (item.IF_ATTEND == '1') {
          this.responseDateInfo.forEach(i => {
            if(i.type == this.$t('refuse')) { // :: 已拒绝
              i['count']++
            }
          })
        } else if (item.IF_ATTEND == '2') {
          this.responseDateInfo.forEach(i => {
            if(i.type == this.$t('undetermined')) { // :: 待定
              i['count']++
            }
          })
        } else {
          this.responseDateInfo.forEach(i => {
            if(i.type == this.$t('noResponse')) { // :: 未响应
              i['count']++
            }
          })
        }
        if(this.activeName.indexOf(item.IF_ATTEND) < 0){
          this.$set(this.activeName, this.activeName.length, item.IF_ATTEND)
        }
      })
    }
  },
  data () {
    return {
      loading: false,
      active: false,
      activeName: [],
      responsetype: '',
      responseData: [], //获取到的应会情况数据
      responseDateInfo: [
        {
          type: this.$t('accept'), // :: 已接受
          resType: '0',
          count: 0
        },
        {
          type: this.$t('undetermined'), // :: 待定
          resType: '2',
          count: 0
        },
        {
          type: this.$t('noResponse'), // :: 未响应
          resType: '3',
          count: 0
        },
        {
          type: this.$t('refuse'), // :: 已拒绝
          resType: '1',
          count: 0
        }
      ]
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
