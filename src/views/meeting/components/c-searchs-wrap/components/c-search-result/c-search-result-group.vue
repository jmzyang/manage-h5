<template lang="pug">
  .searchs-content(v-loading="loading" :loading-text="$t('loading')")
    .header
      .back(@click="back")
        i.iconfont.icon-arrow-left.arrow-left
        | {{$t('selected')}}({{ storeContacts.total }})
        //- :: 已选
      .input-content
        i(class="iconfont icon-search")
        input(type="search" :placeholder="placeholderTitle" maxlength="40" v-focus v-model="inputValue" ref="searchsInput" @keyup="TargetContent")
      .icons(@click="search")
        | {{$t('search')}}
        //- :: 搜索
    Scroll.result-main-scroll
      .result-main        
        .list
          .list-item.search-list-title(v-if="contactsData.length")
            | {{params.searchBy === 3 ? $t('externalSearchResults') : $t('internalSearchResults')}}
            //- :: 搜索出以下外部联系人/搜索出以下内部联系人
          .contacts-list
            van-checkbox.contacts-item(
              v-for="(item, index) in contactsData",
              v-model="item.checked",
              :itemData="item"
              :disabled="item.disabled"
              :name="item.org ? 'org' + item.ORG_ID : 'user' + item.USER_CODE"
              @change="handlerChange(item)")
              template(v-if="item.org")
                .org-name
                  | {{item.ORG_NAME}}
                  span.count ({{item.COUNT}}{{$t('people')}})
                  //- :: 人
                .next-level(@click.stop="goNext(item)", :class="{'disabled': item.checked}")
                  i.iconfont.icon-org-level
                  | {{$t('subordinate')}}
                  //- :: 下级
              template(v-else)
                .avatar
                .name
                  h2 {{item.USER_NAME}}
                  p {{item.MAIN_ROLE_NAME}}
                .phone {{item.MOBILE}}
                .email {{item.EMAIL}}
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_COMMON from '@/stores/common/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import Scroll from '@/components/c-scroll/index.vue'
export default {
  components: {
    Scroll
  },
  created () {
    this.search()
  },
  data () {
    return {
      loading: false,
      inputValue: this.params.searchKey, // 输入框内容
      selectType: this.$route.params.selectType,
      contactsData: [],
      selectType: 'customGroupMember',
      placeholderTitle: this.placeholder || this.$t('searchTopics'), // :: 搜索会议主题
    }
  },
  props: {
    placeholder: {
      type: [String],
      default: ''
    },
    params: {
      type: [Object],
      default: () => {
        return {
          searchBy: 1,
          searchKey: ''
        }
      }
    }
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  computed: {
    // 禁止操作的成员
    fixedChosen () {
      return this.$route.params.fixedChosen || [] 
    },
    ...mapState({
      // 组织机构
      orgList (state) {
        const orgList = state.common.orgList.slice()
        return orgList.map(item => {
          item.org = true
          return item
        })
      },
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 已选联系人
      storeContacts (state) {
        return state.contacts[state.contacts.alias[this.selectType].state]
      }
    })
  },
  watch: {
    storeContacts: {
      handler: function (val, oldVal) {
        this.contactsData.forEach((item, index) => {
          if (item.org) {
            let _index = val.organization.findIndex(row => +item.ORG_ID === +row.ORG_ID)
            !item.disabled && this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
          } else {
            let _index = val.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE)
            !item.disabled && this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
          }
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    async search () {
      let inputValue = this.inputValue
      if (this.params.searchBy === 2) {
        this.loading = true
        // 找组织
        let result = await this.$ajaxRequest({
          mask: false,
          name: inputValue,
          page: 1,
          pagecount: 9999,
          SEACH_TYPE: this.$route.params.historyType.split(',')[1],
          service: 'M4002022'
        }, ()=> {
          this.loading = false
        })

        if (result.code === '0') {
          let orgData = result.data
          let list = result.data.map(item => {
            let _index = this.storeContacts.organization.findIndex(row => +item.ORG_ID === +row.ORG_ID)
            item.checked = (_index > -1 ? true : false)
            item.org = true
            return item
          })
          // 深度拷贝下，防止视图更新失败
          this.contactsData = JSON.parse(JSON.stringify(orgData))
        }
      } else if (this.params.searchBy === 1) {
        // 内部联系人
        this.loading = true
        let result = await this.$ajaxRequest({
          mask: false,
          name: inputValue,
          page: 1,
          pagecount: 9999,
          SEACH_TYPE: this.$route.params.historyType.split(',')[0],
          service: 'P1202608'
        }, ()=> {
          this.loading = false
        })
        
        if (result.code === '0') {
          let list = result.data.map(item => {
            let _index = this.storeContacts.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE)
            item.disabled = this.fixedChosen.findIndex(fItem => +fItem === +item.USER_CODE) > -1 ? true : false
            item.checked = (_index > -1 ? true : false)
            return item
          })
          // 深度拷贝下，防止视图更新失败
          this.contactsData = JSON.parse(JSON.stringify(list))
        }
      } else if (this.params.searchBy === 3) {
        // 外部联系人
        this.loading = true
        let result = await this.$ajaxRequest({
          mask: false,
          SEACH_TEXT: inputValue,
          SEACH_TYPE: 6,
          page: 1,
          pagecount: 9999,
          service: 'M4002009'
        }, () => {
          this.loading = false
        })

        if (result.code === '0') {
          let list = result.data.map((item) => {
            item.USER_CODE = item.OUTSIDE_USER_CODE
            item.EMAIL = item.EMAIL_ADDRESS
            item.MOBILE = item.PHONE_NO
            item.CONTACTS_TYPE = '1'
            let _index = this.storeContacts.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE)
            item.checked = (_index > -1 ? true : false)
            return item
          })
          // 深度拷贝下，防止视图更新失败
          this.contactsData = JSON.parse(JSON.stringify(list))
        }
      }
    },
    TargetContent (e) {
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.$refs.searchsInput.blur()
          this.search()
        }
      }
    },
    back () {
      // this.$emit('back')
      this.$router.go(-1)
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl'
</style>
