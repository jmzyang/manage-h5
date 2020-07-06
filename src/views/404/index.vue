<template lang="pug">
.error-page
  .content 你访问的页面不存在
  .foot {{redirectTime}}秒后为你跳转到首页

</template>

<script>

export default {
  data () {
    return {
      redirectTime: 3
    }
  },
  created () {
    setInterval(() => {
      this.redirectTime--
      if (this.redirectTime === 0) {
        this.$router.push('/dashboard')
      }
    }, 1000)
  }
}
</script>

<style lang="stylus" scoped>
@import './index.styl'
</style>
