<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .selected-users-fixed(style="animation-duration: 0.3s", @click.self="close")
    .selected-users-wrap
      BarHeader(
        layout="title",
        :border="true",
        :back="true",
        :backEvent="true",
        @back="close")
        | {{$t('selectedQuantity')}}({{ storeContacts.total }}){{$t('people')}}
        //- 已选择数量...人
        .submit-header(@click.stop="submit") {{$t('determine')}}
        //- 确定
      .content-wrap
        .content
          .selected-list
            .selected-item(v-for="item in storeContacts.organization")
              .org-name {{item.ORG_NAME}}
                span.count ({{item.COUNT}}人)
              .selected-delete(@click="deleteAlias(item)" v-if="!item.irrevocable")
                i(class="iconfont icon-selected-delete")
            .selected-item(v-for="item in storeContacts.member")
              .avatar(v-avatar.sync="item.USER_ICON", :full-name="item.USER_NAME")
              .name
                h2 {{item.USER_NAME}}
                p {{item.MAIN_ROLE_NAME}}
              .selected-delete(@click="deleteAlias(item)", :class="{'disable': fixedChosen.indexOf(item.USER_CODE) > -1}"  v-if="!item.irrevocable")
                i(class="iconfont icon-selected-delete")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import BarHeader from '@/components/c-header'

export default {
  name: 'CContactsSelected',
  props: {
    transition: {
      type: [Array],
      default: ()=> ['slide', 'slideInRight', 'slideOutRight']
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
      sceneTitle: this.scene || this.$t('contacts') // 联系人
    }
  },
  components: {
    BarHeader
  },
  methods: {    
    close () {
      this.$emit('close')
    },
    submit () {
      // submit
      this.$emit('submit')
    },
    deleteAlias (_data) {
      // 不可删除过滤条件
      if (this.fixedChosen.indexOf(_data.USER_CODE) > -1) {
        return false
      }
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: 'delete',
        value: [_data]
      })
    }
  }
}
</script>
<style scoped lang="stylus">
@import './index.styl'
</style>
