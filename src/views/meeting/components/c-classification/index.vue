<template lang="pug">
.page-wrap.meeting-choose-classification
  BarHeader(
    layout="title",
    :border="true",
    :back="true",
    :backEvent="true",
    @back="handlerBack")
    | {{$route.meta.title}}
  .selection-extend
    van-button.extend(
      type="default",
      v-for="(value, index) in meetingClassification",
      :key="index",
      :class="{'btnSelection': classification == value.DICT_ITEM}",
      @click="classification = value.DICT_ITEM;")
      | {{value.DICT_ITEM_NAME}}
  .actions
    van-button.submit(type="info", @click="submit") {{$t('determine')}}
    //- 确定
</template>
<script>
import { mapState } from 'vuex'
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
      meetingClassification: [], // 会议分类
      classification: '', // 选中值的下标
    }
  },
  created () {
    this.getMeetingClass()
  },
  components: {
    BarHeader
  },
  methods: {
    // 获取会议分类信息
    async getMeetingClass () {
      let vm = this
      let req = [{
        service: 'P0004011',
        DICT_CODE:'TOPIC_TYPE',
      }];
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0') {
        vm.meetingClassification = result.data
        if (this.storeMeetingFormData.classification) {
          this.classification = this.storeMeetingFormData.classification
        }
        if (this.classification) {
          this.classVal = this.meetingClassification[this.classification].DICT_ITEM_NAME
        }
      } else {
        vm.$Notify({message:result.msg});
      }
    },
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
      if (!this.classification) {
        this.$notify({
          message: this.$t('choiceMeetingSort'),  // 请选择会议分类
          background: '#ff0000'
        })
        return false
      }
      this.$store.commit(TYPES_MEETING[this.mutation], {
        type: 'assign',
        value: {
          classification: this.classification
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
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
