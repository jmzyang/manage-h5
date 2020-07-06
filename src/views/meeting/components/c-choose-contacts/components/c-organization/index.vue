<template lang="pug">
  CContactsEnterprise(:select-type="selectType" :history-type="historyType" :business-type="businessType")
</template>
<script>
// import CContactsEnterprise from '@/components/c-contacts-enterprise'
import CContactsEnterprise from '@/components/c-contacts-enterprise'
export default {
  components: {
    CContactsEnterprise
  },
  props: {
    selectType: {
      type: String
    },
    historyType: {
      type: String
    },
    // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控, 4：转授权
    businessType: {
      type: [String, Number],
      default: 0
    }
  },
  data () {
    return {

    }
  },
  methods: {

  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
