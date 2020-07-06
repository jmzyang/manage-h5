<template lang="pug">
  a.cell(@click="active")
    span.con
      i.iconfont.icon(:class="[icon]", :style="{color:iconcolor}")
      span.title {{title}}
      i.iconfont.icon-arrow-right.arrow(v-if="!notClickable")
      i(v-if="notClickable") 1.1.6.3
</template>

<script>
export default {
  name: 'cell',
  data () {
    return {

    }
  },
  props: ['icon', 'title', 'link', 'iconcolor', 'name', 'notClickable'],
  methods: {
    active () {
      if(!this.notClickable){
        this.$emit('active', this.title, this.name)
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.cell
  display flex
  width 100%
  height 100px
  padding 0 30px
  &.active
    background-color #F6F7F8
  .con
    display flex
    width 100%
    height 100px
    align-items center
    font-size 30px
    border-bottom 1px solid #F0F4F6
    .title
      flex-grow 1
      padding-left 14px
    .icon
      font-size 32px
      margin-right 20px
    .arrow
      font-size 20px
</style>
