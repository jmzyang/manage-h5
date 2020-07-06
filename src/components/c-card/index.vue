<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .fixed-card(@click.self="close")
    .card-wrap
      .header(v-if="title")
        | {{title}}
      main
        slot
      .footer
        slot(name="footer")
</template>

<script>
import BScroll from 'better-scroll'

export default {
  name: 'FiexdCard',
  props: {
    title: {
      type: [String],
      default: ''
    },
    transition: {
      type: [Array],
      default: ()=> ['bounce', 'bounceInRight', 'bounceOutRight']
    }
  },
  mounted () {},
  methods: {
    close () {
      this.$emit(`close`)
    }
  },
  watch: {}
}

</script>

<style lang="stylus">
@import './index.styl'
</style>
