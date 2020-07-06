<template lang="pug">
.page-wrap.my
  .back-box
    LeftHeader(layout="my" style="background:none")
    info
  .cellwrap
    cell(:title="$t('customGroups')", icon="icon-group-grouping", iconcolor="#007AFF", @active="active('group', $t('customGroups'))", name="help")
    //- :: 自定义组
    cell(:title="$t('help')", icon="icon-my-help", iconcolor="#007AFF", @active="active('help', $t('help'))", name="help")
    //- :: 帮助
    cell(:title="$t('feedback')", icon="icon-my-problem", iconcolor="#21AF92", @active="active('feedback', $t('feedback'))", name="feedback")
    //- :: 问题反馈
    cell(:title="$t('versionInformation')", icon="icon-my-edition", iconcolor="#F9B44A", name="contact", :notClickable="true")
    //- :: 版本信息
  .exitwrap
    a.exit(@click="exit") {{$t('exitAccount')}}
    //- :: 退出帐号
</template>

<script>
import * as TYPES_COMMON from '@/stores/common/types'
import http from '@/commons/http'
import storage from '@/commons/storage'

import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
import info from './components/info'
import cell from './components/cell'
export default {
  data () {
    return {
      activemenu: {
        info: true,
        help: false,
        contact: false,
        feedback: false
      }
    }
  },
  components: {
    LayoutPage,
    LeftHeader: BarHeader,
    RightHeader: BarHeader,
    info,
    cell
  },
  methods: {
    active (val, title) {      
      switch (val) {
        case 'help':
          this.$router.push({
            name: 'my.help',
            query: {
              title: title
            }
          })
          break
        case 'feedback':
          this.$router.push({
            name: 'my.feedback',
            query: {
              title: title
            }
          })
          break
        case 'contact':
          this.$router.push({
            name: 'my.contact',
            query: {
              title: title
            }
          })
          break
        case 'group':
          this.$router.push({
            name: 'contacts.group',
            query: {
              maintain:true,
              meetingId: '',
              scene: this.$t('attendee'),  // 参会人
              selectType: 'participants',
              key: 'participants',
              historyType: '2, 3',
              businessType: 0
            }
          })
        default:
          break
      }
    },
    exit () {
      let vm = this
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 确定
        message: this.$t('confirmLogout'), // :: 确定要退出登录?
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {
          vm.$store.dispatch(TYPES_COMMON.A_COMMON_LOGIN_OUT, {
            cbSuccess: () => {
              localStorage.removeItem('KIuserName')
              localStorage.removeItem('KIuserPwd')
              vm.$router.push('/login')
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped lang="stylus">
@import './index.styl'
</style>
