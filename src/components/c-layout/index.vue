<template lang="pug">
.layout-page
  slot
  .layout-page-left
    slot(name="left")
  .layout-page-right
    slot(name="right")
</template>

<script>
export default {
  name: 'LayoutPage',
  data () {
    return {}
  },
  mounted () {},
  methods: {

  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
