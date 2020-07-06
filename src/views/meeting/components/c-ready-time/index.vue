<template lang="pug">
.page-wrap.meeting-choose-ready-item
  BarHeader(
    layout="title",
    :border="true",
    :back="true",
    :backEvent="true",
    @back="handlerBack")
    | {{$route.meta.title}}
  .selection-extend
    input(
      type="default",
      v-model="meetingReadyTime"
      :placeholder="$t('inputPrepareTime')"
      @input="extendInputRGE"
    )
    //- 请输入准备时间
  .actions
    van-button.submit(type="info", @click="submit") {{$t('determine')}}
    //- 确定
</template>
<script>
import { mapState } from 'vuex'
import { getDataByKey } from '@/utils/array'
import * as TYPES_MEETING from '@/stores/meeting/types'

import BarHeader from '@/components/c-header'

export default {
  computed: {
    ...mapState ({
      storeMeetingFormData: state => state.meeting[state.route.query.stateName]
    })
  },
  data () {
    return {
      // 路由参数
      meetingId: this.$route.query.meetingId || '',
      stateName: this.$route.query.stateName || '',
      mutation: this.$route.query.mutation || '',
      businessType: this.$route.query.businessType || 0,
      meetingReadyTime: '', // 准备时间
    }
  },
  mounted () {
    if(this.storeMeetingFormData.readinessTime){
      this.meetingReadyTime = JSON.parse(JSON.stringify(this.storeMeetingFormData.readinessTime))
    }
  },
  components: {
    BarHeader
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
    // 提交到VUEX
    submit () {
      this.$store.commit(TYPES_MEETING[this.mutation], {
        type: 'assign',
        value: {
          readinessTime: this.meetingReadyTime
        }
      })
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
    // 键盘监听准备时间
    extendInputRGE(){
      // 准备时间
      let vm = this
      let value = JSON.stringify(+vm.meetingReadyTime).replace(/\D+/ig,'');
      if(value < 0){
        vm.meetingReadyTime = 0;
      }else if(value > 999) {
        vm.meetingReadyTime = 999
      }else{
        vm.meetingReadyTime = value ? parseInt(value) : value;
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
