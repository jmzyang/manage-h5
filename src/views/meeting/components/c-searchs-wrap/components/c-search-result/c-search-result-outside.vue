<template lang="pug">
  .searchs-content(v-loading="loading" :loading-text="$t('loading')")
    .header
      .back(@click="back")
        i.iconfont.icon-arrow-left.arrow-left
        | {{$t('close')}}
        //- :: 关闭
      .input-content
        i(class="iconfont icon-search")
        input(
          type="search"
          :placeholder="placeholderTitle"
          maxlength="40"
          :focus="focusStatus"
          v-model="inputValue"
          ref="searchsInput"
          @keyup="TargetContent")
      .icons(@click="search")
        | {{$t('search')}}
        //- :: 搜索
    Scroll.result-main-scroll(style='flex:none;max-height:1200px;')
      .result-main
        .list
          .list-item.search-list-title(v-if="contactsData.length")
            | {{$t('searchResult')}}
            //- :: 搜索出以下结果
          .contacts-list
            van-checkbox.contacts-item(
              v-for="(item, index) in contactsData",
              v-model="item.checked",
              :itemData="item"
              :disabled="item.disabled"
              :name="item.USER_CODE"
              @change="handlerChange(item)")
                .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
                .name(style='text-align:left;')
                  h2 {{item.USER_NAME}}
                  p {{item.MAIN_ROLE_NAME}}
                .contact(style="margin-top:0.24067rem;text-align:left;width:4.8rem;margin-top: 0.24067rem;margin-left: 0.24067rem;")
                  .phone(style='height: 0.49rem; line-height:0.49rem') {{item.MOBILE}}
                  .email(style='height: 0.49rem; line-height:0.49rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;') {{item.EMAIL}}
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import Scroll from '@/components/c-scroll/index.vue'
export default {
  props: {
    placeholder: {
      type: [String],
      default: ''
    },
    params: {
      type: [Object],
      default: {
        searchBy: 1,
        searchKey: ''
      }
    }
  },
  directives: {
    // focus: {
    //   inserted: function (el) {
    //     el.focus()
    //   }
    // }
  },
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // storeContactsExternal
      storeContactsExternal (state) {
        return state.contacts[this.selectType].member.filter(item => +item.CONTACTS_TYPE === 1)
      }
    })
  },
  data () {
    return {
      focusStatus: false,
      loading: false,
      inputValue: this.params.searchKey, // 输入框内容
      selectType: this.$route.params.selectType,
      contactsData: [],
      placeholderTitle: this.placeholder || this.$t('searchTopics') // :: 搜索会议主题
    }
  },
  created () {
    this.search()
  },
  components: {
    Scroll
  },
  watch: {
    storeContactsExternal: {
      handler: function (val, oldVal) {
        this.contactsData.forEach((item, index) => {
          let _index = val.findIndex(row => +item.USER_CODE === +row.USER_CODE)
          !item.disabled && this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    async search () {
      let inputValue = this.inputValue
      if (this.params.searchBy === 1) {
        // 按人搜
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
            let _index = this.storeContactsExternal.findIndex(row => item.USER_CODE === row.USER_CODE)
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
