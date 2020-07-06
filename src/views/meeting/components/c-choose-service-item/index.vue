<template lang="pug">
.page-wrap.meeting-choose-service-item
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
      v-for="(value, index) in options",
      :key="index",
      :class="{'btnSelection': serviceItems.indexOf(value) > -1}",
      @click="serverClick(value)")
      | {{value}}
  .actions
    van-button.submit(type="info", @click="submit") {{$t('determine')}}
    //- 确定
</template>
<script>
import { mapState } from 'vuex'
import { getDataByKey } from '@/utils/array'
import * as TYPES_MEETING from '@/stores/meeting/types'
import BarHeader from '@/components/c-header'
import storage from '@/commons/storage'
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
      options: [], // 服务项
      serviceItems: [] // 服务项
    }
  },
  mounted () {
    this.serviceItems = JSON.parse(JSON.stringify(this.storeMeetingFormData.serviceItems))
    this.getServiceItem()
  },
  components: {
    BarHeader
  },
  methods: {
    // 获取服务项
    async getServiceItem () {
      let req = [{
        service: 'P0004011',
        DICT_CODE:'CONFERENCE_SERVICES',
      }];
      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        this.options = getDataByKey(result.data, 'DICT_ITEM_NAME')
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
      if (this.serviceItems.length === 0) {
        this.$notify({
          message: this.$t('fillInService'),  // 请填写服务项
          background: '#ff0000'
        })
        return false
      }
      this.$store.commit(TYPES_MEETING[this.mutation], {
        type: 'assign',
        value: {
          serviceItems: this.serviceItems
        }
      })
      storage.isInitialCreate = true
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
    // 选择服务项
    serverClick (val) {
      if (this.serviceItems.indexOf(val) > -1) {
        let isOfRepeated = this.serviceItems.findIndex(value => {
          return val === value
        })
        this.serviceItems.splice(isOfRepeated, 1)
      } else {
        this.$set(this.serviceItems, this.serviceItems.length, val)
      }
    },
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
