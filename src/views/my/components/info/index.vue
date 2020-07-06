<template lang="pug">
  .info
    .info-main(@click="active")
      .avatar(v-avatar="iconSrc" :full-name="name")
      .some
        .name {{name}}
          span.job ({{job}})
        .department {{department}}
      van-icon(name="arrow")
</template>

<script>
export default {
  name: 'info',
  data () {
    return {
      userImgState: false, // 头像成功失败
      // baseUrl: 'http://172.16.4.155:82/fileServer/',
      baseUrl: window.location.protocol + '//' + window.location.host + '/fileServer/userIcon/', //重新配置地址
      userImgSrc:'', // 头像地址
      userName:'', //昵称
    }
  },
  computed: {
    name () {
      this.userName = this.$store.state.common.userBaseInfo.USER_NAME || ''
      if(this.userName.length > 2){
        let len = this.userName.length
        this.userImgSrc = this.userName.substring(len - 2, len)
      }else{
        this.userImgSrc = this.userName
      }
      return this.userName
    },
    job () {
      return this.$store.state.common.userBaseInfo.MIN_USER_ROLE_NAME || ''
    },
    department () {
      let ORG_CODE = this.$store.state.common.userBaseInfo.ORG_CODE || ''
      let ORGNAME = this.$store.state.common.userBaseInfo.ORGNAME || ''
      return ORGNAME
      // return ORG_CODE + ' ' + ORGNAME
    },
    iconSrc () {
      return this.$store.state.common.userBaseInfo.USER_ICON || ''
    }
  },
  methods: {
    active () {
      this.$router.push({name:'my.editing'})
    }
  }
}
</script>

<style lang="stylus" scoped>
.info
  padding 0 60px 0 60px
  border-bottom solid 1px #F6F7F8
  height 350px
  box-sizing border-box
  .info-main
    height 134px
    width 100%
    display flex
    .avatar
      width 134px
      height 134px
      border-radius 50%
      background-color #fff
      color #3296FA
      overflow hidden
      white-space nowrap
      line-height 134px
      text-align center
      font-size 36px
      img
        width 80px
        height 80px
        border-radius 50%
    .some
      padding-left 40px
      flex-grow 1
      height 134px
      display inline-block
      vertical-align middle
      margin-top 18px
      .name
        font-size 36px
        color #fff
        line-height 50px
        font-weight bold
        padding-top 4px
        .job
          vertical-align bottom
          font-size 28px
          padding-left 14px
          position relative
          top 4px
          color #fff
          font-weight 400
      .department
        color #fff
        line-height 37px
        font-size 26px
        padding-top 4px
    .van-icon
      line-height 134px
      color #fff
      font-size 36px
</style>
