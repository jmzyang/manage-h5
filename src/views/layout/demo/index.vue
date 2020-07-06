<template lang="pug">
div.layout-wrap
  router-view
</template>

<script>
import Header from '@/components/c-header/index'

export default {
  data () {
    return {
      transitionName: 'slide-left',
      baseInfo: null,
      bodyHeight: 400
    }
  },
  created () {},
  mounted () {},
  computed: {},
  watch: {},
  updated () {},
  methods: {},
  components: {
    Header
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
