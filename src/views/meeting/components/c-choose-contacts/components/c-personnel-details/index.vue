<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .selected-users-fixed(style="animation-duration: 0.3s", @click.self="close")
    .selected-users-wrap
      .title
        | {{$t('selected')}}
        //- :: 已选择
        span.num {{ storeContacts.total }}
        | {{$t('PCS')}}{{contacts}}
        .iconfont.icon-delete.close(@click="close")
      .content-wrap
        .content
          .selected-list
            .selected-item(v-for="item in storeContacts.organization")
              .org-name {{item.ORG_NAME}}
              .action(@click="clearOne(item)")
                | {{$t('delete')}}
                //- :: 删除
            .selected-item(v-for="item in storeContacts.member")
              .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
              .name
                h2 {{item.USER_NAME}}
                p {{item.MAIN_ROLE_NAME}}
              .action(@click="clearOne(item)", :class="{'disable': fixedChosen.indexOf(item.USER_CODE) > -1}")
                | {{$t('delete')}}
                //- :: 删除
      .foot
        .concel(@click="clearUser") {{$t('empty')}}
        //- :: 清空
        .add-group(v-if="selectType!=='authorizer' || selectType === 'participantsIssue'" @click="addGroup") {{$t('saveAsAGroup')}}
        //- :: 保存为组
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

export default {
  props: {
    transition: {
      type: [Array],
      default: ()=> ['slide', 'slideInUp', 'slideOutDown']
    },
    // 场景名称
    scene: {
      type: String,
      default: ''
    },
    selectType: {
      type: String,
      default: 'default'
    },
    businessType: {
      type: [String, Number],
      default: ''
    },
    // 转授权功能禁止删除人员
    fixedChosen: {
      type: [Array],
      default: () => []
    }
  },
  
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 联系人
      storeContacts (state) {
        return state.contacts[this.selectType]
      }
    })
  },
  data () {
    return {
      contacts: this.scene || this.$t('contacts') //- :: 联系人
    }
  },
  methods: {
    close () {
      this.$emit('hide-details')
    },
    clearOne (_data) {
      // 不可删除过滤条件
      if (this.fixedChosen.indexOf(_data.USER_CODE) > -1) {
        return false
      }
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: 'delete',
        value: [_data]
      })
    },
    clearUser () {
      let data = this.enterpriseContacts
      // 转授权
      if (+this.businessType == 4) {
        // 转授权逻辑
        const DELETE_DATA = data.filter(val => this.fixedChosen.findIndex(val.USER_CODE) < 0)
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: 'delete',
          value: DELETE_DATA
        })
      } else {
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: 'clear'
        })
      }
    },
    addGroup () {      
      this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP_MEMBER'], {
        value: {
          organization: this.storeContacts.organization,
          member: this.storeContacts.member
        }
      })
      let toRoute = 'meeting.create.create-group'
      // console.log(`12`)
      // return false
      if (+this.businessType === 1 && this.$route.name === 'meeting.edt') {
        toRoute = 'meeting.edt.create-group'
      }

      this.$router.push({
        name: toRoute,
        params: {
          groupId: 'new',
          selectType: 'customGroupMember',
          businessType: this.businessType
        }
      })
    }
  }
}
</script>
<style scoped lang="stylus">
@import './index.styl'
</style>
