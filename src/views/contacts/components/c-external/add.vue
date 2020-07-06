<template lang="pug">
  .page-wrap.layer.external-add
    BarHeader(
      layout="title",
      :back="true",
      :backEvent="true",
      @back="handlerBack")
      | {{$t('addExternalContacts')}}
      //- 添加外部联系人
    form.contacts-external-add-form
      .form-item
        .item-title {{$t('fullName')}}
        //- 姓名
        input.input(
          :placeholder="$t('pleaseEnter')"
          v-model="name"
          v-validate="'required|max:20'"
          :data-vv-as="$t('fullName')"
          type="text"
          name="name")
        span.tips {{ errors.first('name') || '' }}
      //- .form-item
      //-   .item-title 所属单位
      //-   input.input(
      //-     placeholder="请输入"
      //-     v-model="name"
      //-     v-validate="'required|max:20'"
      //-     data-vv-as="所属单位"
      //-     type="text"
      //-     name="org")
      //-   span.tips {{ errors.first('org') || '' }}
      .form-item
        .item-title {{$t('phoneNumber')}}
        input.input(
          :placeholder="$t('pleaseEnter')"
          v-model="phone"
          v-validate="'required|phone'"
          :data-vv-as="$t('phoneNumber')"
          type="text"
          name="phone")
        span.tips {{ errors.first('phone') || '' }}
      .form-item
        .item-title {{$t('mailbox')}}
        input.input(:placeholder="$t('pleaseEnter')"
        v-model="email"
        v-validate="'email'"
        :data-vv-as="$t('mailbox')"
        type="text"
        name="email")
        span.tips {{ errors.first('email') || '' }}
    .contacts-external-add-actions
      .button.submit(@click="submit()") {{$t('continueToAdd')}}
      //- 提交并继续添加
      .button.submit-go(@click="submit(true)") {{$t('completeAdd')}}
      //- 提交且添加完成
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import BarHeader from '@/components/c-header'
export default {
  name: 'CContactsExternalAdd',
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
    // selectType: {
    //   type: String
    // },
    // // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控
    // businessType: {
    //   type: [String, Number],
    //   default: 0
    // }
  },
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      }
    })
  },
  data () {
    return {      
      selectType: this.$route.query.selectType, // 使用场景      
      businessType: this.$route.query.businessType, // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控
      name: '',
      phone: '',
      email: '',
      loading: false
    }
  },
  methods: {
    handlerBack () {
      this.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('exitOperation'), // :: 确定退出此操作吗？
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {
          this.$emit(`close`)
        }
      })
    },
    submit (_isBack) {
      this.loading = true
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
          this.$notify({
            message: this.$t('addSuccessfulJump'), // 添加成功，正在跳转到外部联系人
            background: '#1989fa'
          })
          // 添加并跳转
          if (_isBack) {
            this.$emit(`close`)
          } else {
            this.loading = false
          }
        } else {
          this.loading = false
        }
      })
    }
  }
}
</script>
<style lang="stylus">
  @import './add.styl'
</style>
