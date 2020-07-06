<template lang="pug">
div.component
  mt-button.demo(size="small", @click="handelEmit") 调用父组件事件
  h2(v-if="title") {{title}}
  h3 状态
    span.true(v-if='status') 真的
    span.false(v-else) 假的
  ul(v-if="list && list.length > 0", v-for="(item) in list")
    li {{item}}
</template>

<script>
export default {
  props: {
    title: {
      type: [Object, String],
      default: ''
    },
    list: {
      type: [Array],
      default: () => []
    },
    status: {
      type: [Boolean, String],
      default: false
    }
  },
  data () {
    return {}
  },
  mounted () {},
  watch: {},
  methods: {
    handelEmit () {
      this.$emit('handelParent', 'emit：')
    }
  }
}
</script>

<style scoped lang="stylus">
@import './index.styl'
</style>
