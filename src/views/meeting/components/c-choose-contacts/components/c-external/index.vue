<template lang="pug">
  .input-external-main(v-loading="loading" :loading-text="$t('loading')")
    .choose-existing-btn(@click="toeXisting") {{$t('existingChoices')}}
    //- :: 从现有中选择
    form.form(v-if="showForm")
      .input-item.name
        .item-title {{$t('fullName')}}
        //- :: 姓名，::请输入姓名
        input.input(
          :placeholder="$t('inputNames')"
          v-model="name"
          v-validate="'required|max:20'"
          :data-vv-as="$t('fullName')"
          type="text"
          name="name")
        span.tips {{ errors.first('name') || '' }}
      .input-item.phone
        .item-title {{$t('phoneNumber')}}
        //- :: 手机号码，::请输入手机号码
        input.input(
          :placeholder="$t('yourPhoneNumber')"
          v-model="phone"
          v-validate="'required|phone'"
          :data-vv-as="$t('phoneNumber')"
          type="text"
          name="phone")
        span.tips {{ errors.first('phone') || '' }}
      .input-item.email
        .item-title {{$t('mailbox')}}
        //- :: 邮箱地址，::请输入邮箱地址
        input.input(:placeholder="$t('yourMailbox')"
        v-model="email"
        v-validate="'required|email'"
        :data-vv-as="$t('mailbox')"
        type="text"
        name="email")
        span.tips {{ errors.first('email') || '' }}
      .commit-wrap
        .commit(
          @click="commit"
          v-loading.fullscreen.lock="fullscreenLoading") {{$t('add')}}
          //- ::添加
    .list-wrap
      .list-title
        .list-title-con
          | {{$t('selectedExternalContacts')}}
          //- ::已选外部联系人
          span.clear-choose(@click="clear") {{$t('empty')}}
          //- ::清空
      .list
        .list-item(v-for="(item,index) in storeContactsExternal" :key="item.USER_CODE")
          .van-checkbox
            .van-checkbox__label
              .check-lable
                .base-info
                  .name {{item.USER_NAME}}
                .del(@click.stop="deleteSingle(item)")
                  i.iconfont.icon-clear
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import BarHeader from '@/components/c-header'
export default {
  watch: {
    name (val) {
      if (!val.match(/^[ ]*$/)) {
        this.name = val
      } else{
        this.name = ''
      }
    }
  },
  components: {
    BarHeader
  },
  props: {
    selectType: {
      type: String
    },
    // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控
    businessType: {
      type: [String, Number],
      default: 0
    }
  },
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 已选联系人
      storeContactsExternal (state) {
        return state.contacts[this.selectType].member.filter(item => +item.CONTACTS_TYPE === 1)
      }
    })
  },
  data () {
    return {
      name: '',
      phone: '',
      email: '',
      loading: false,
      showForm: true,
      fullscreenLoading: false
    }
  },
  methods: {
    commit () {
      this.fullscreenLoading = true
      this.$validator.validateAll().then((result) => {
        if (result) {
          let item = {}
          item.USER_CODE = `888888${new Date().getTime()}`
          item.USER_NAME = this.name
          item.EMAIL = this.email
          item.MOBILE = this.phone
          item.CONTACTS_TYPE = '1'
          this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
            type: 'concat',
            value: [item]
          })
          this.name = ''
          this.email = ''
          this.phone = ''
          this.fullscreenLoading = false
          this.$notify({
            message: this.$t('addedSuccessfully'),
            background: '#1989fa'
          })
          this.showForm = false
          this.$nextTick(() => {
            this.showForm = true
          })
        }
        this.fullscreenLoading = false
      })
    },
    deleteSingle (user) {
      console.log(`deleteSingle`, user)
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: 'delete',
        value: [user]
      })
    },
    clear () {
      if (this.storeContactsExternal.length === 0) {
        return
      }
      this.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('confirmEmptyingOutsiders'),
        showCancelButton: true
      }).then((action) => {
        if (action === 'confirm') {
          this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
            type: 'delete',
            value: this.storeContactsExternal
          })
        }
      })
    },
    toeXisting () {
      let toRoute = 'meeting.create.external'
      if (this.businessType === 1 && this.$route.name === 'meeting.edt') {
        toRoute = 'meeting.edt.external'
      }else if(this.businessType === 3){
        toRoute = 'meetingControl.external'
      }else if(this.businessType === 5) {
        toRoute = 'localControl.external'
      }
      this.$router.push({
        name: toRoute,
        params: {
          selectType: this.selectType,
          businessType: this.businessType
        }
      })
    }
  }
}
</script>
<style lang="stylus">
  @import './index.styl'
</style>
