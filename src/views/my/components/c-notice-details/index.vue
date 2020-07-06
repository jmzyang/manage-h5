<template lang="pug">
  .message-box(v-if="data.MESG_SNO")
    .title {{ data.METTING_NAME }}
    .con(v-html="data.MESG_CONT")
</template>

<script>
export default {
  props: ['data']
}
</script>

<style lang="stylus" scoped>
.message-box
  width 100%
  .title
    color #333333
    font-size 36px
    line-height 60px
    padding-top 40px
    padding-bottom 40px
    font-weight bold
  .con
    width 100%
    color #666666
    font-size 28px
    line-height 60px
</style>
