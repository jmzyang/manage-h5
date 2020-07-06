<template lang="pug">
  .page-wrap.contacts-group
    BarHeader(layout="title", :back="true")
      | {{$t('personalData')}}
      //-  个人资料
    .my-info-editing
      .form
        .formItem
          .avatar(v-avatar="contactsData.USER_ICON" :full-name="contactsData.USER_NAME" :base-url="baseUrl")
          span.formTitle {{$t('headPortrait')}}
          //-  头像
        .formItem
          span.formTitle {{$t('fullName')}}
          //-  名称
          span.tips {{ contactsData.USER_NAME }}
        .formItem
          span.formTitle {{$t('mailbox')}}
          //-  邮箱地址
          span.tips {{ contactsData.EMAIL }}
        .formItem
          span.formTitle {{$t('phoneNumber')}}
          //-  手机号码
          span.tips {{ contactsData.MOBILE }}
        .formItem
          span.formTitle {{$t('shortString')}}
          //-  短号
          span.tips
        .formItem
          span.formTitle {{$t('airlineNumber')}}
          //-  座机号码
          span.tips
</template>

<script>
import { mapState } from 'vuex'
import BarHeader from '@/components/c-header'
export default {
  name: 'CSelectContactsGroupItem',
  data () {
    return {
      baseUrl: window.location.protocol + '//' + window.location.host + '/fileServer/',
      contactsData: {}
    }
  },
  created () {
    if(this.$route.params.contactsData){
      this.contactsData = JSON.parse(JSON.stringify(this.$route.params.contactsData))
    }
  },
  components: {
    BarHeader
  },
  methods: {
    
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
