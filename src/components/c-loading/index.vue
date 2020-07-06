<template lang="pug">
  .lds-css(v-show="visible" :style="{ backgroundColor: background || '' }")
    .lds-rolling
      div
    .lds-text {{text}}
</template>
<script>
export default {
  data() {
    return {
      text: '', // 加载中
      background: null,
      visible: false
    }
  },
  methods: {
    setText(text) {
      this.text = text;
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>

