<template lang="pug">
.sp-actionsheet(@click.self="close")
  .button-wrap
    .button-list
      button(type="button", @click.stop="close") {{$t('determine')}}
      //- :: 确定
    button.button-cancel(@click.stop="close") {{$t('cancel')}}
    //- :: 取消
</template>
<script>
export default {
  name: 'CActionsheet',
  data () {
    return {
      
    }
  },
  props: {
    actions: {
      type: [Array],
      default: () => []
    }
  },
  mounted () {
    
  },
  watch: { },
  methods: {
    close () {
      this.$emit(`close`)
    }
  }
}

</script>

<style lang="stylus">
@import './index.styl'
</style>
