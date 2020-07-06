<template lang="pug">
  .choose-existing(v-loading="loading" :loading-text="$t('loading')" :style="{position: showSearch?'absolute':'relative'}")
    BarHeader(layout="default" v-if="showSearch")
      .back(@click="back()")
        i.iconfont.icon-arrow-left.arrow-left
        | {{$t('return')}}
        //- :: 返回
      .search-topics
        | {{$t('choiceExternalContacts')}}
        //- :: 选择外部联系人
      .search-input(@click="toSearch")
        i(class="iconfont icon-search")
        span {{$t('searchNameTelephoneMailbox')}}
        //- :: 搜索姓名、电话、邮箱
      .sure(@click="sure()")
        | {{$t('determine')}}({{ storeContactsExternal.length }})
        //- :: 确定
    .room-container
      Scroll.room-main
        .contacts-type
          .list-item.search-list-title
            .van-checkbox
              .van-checkbox__label {{$t('contactsList')}}
              //- :: 联系人列表
          .list-item(v-for="(item,index) in contactsData" :key="item.USER_CODE")
            van-checkbox(
              v-model="item.checked",
              :name="item.USER_CODE",
              @change="handlerChange(item)")
              .check-lable
                .base-info
                  .name {{ item.USER_NAME }}
                  .job {{ item.MAIN_ROLE_NAME }}
                .phone {{ item.MOBILE }}
                .email {{ item.EMAIL }}
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  components: {
    BarHeader,
    Scroll
  },
  data () {
    return {
      selectType: 'participants',
      loading: false,
      contactsData: []
    }
  },
  props: {
    selecttype: {
      type: String
    },
    showSearch: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 已选外部联系人
      storeContactsExternal (state) {
        return state.contacts[this.selectType].member.filter(item => +item.CONTACTS_TYPE === 1)
      }
    })
  },
  async created () {
    if (this.selecttype) {
      this.selectType = this.selecttype
    } else if (this.$route.params.selectType) {
      this.selectType = this.$route.params.selectType
    }
    // 获取已存联系人
    this.loading = true
    let result = await this.$ajaxRequest({
      service: 'M4002009',
      page: 1,
      pagecount: 9999,
      mask: false
    }, () => {
      this.loading = false
    })
    if (result.code === '0') {
      let list = result['data'].map(item => {
        item.USER_CODE = item.OUTSIDE_USER_CODE
        item.EMAIL = item.EMAIL_ADDRESS
        item.MOBILE = item.PHONE_NO
        item.CONTACTS_TYPE = '1'
        return item
      })
      this.watchSelected(list)
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    sure () {
      this.$router.go(-1)
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    },
    watchSelected (_list) {
      let list = _list.map((item) => {
        let _index = this.storeContactsExternal.findIndex(row => +item.USER_CODE === +row.USER_CODE)
        item.checked = (_index > -1 ? true : false)
        return item
      })
      this.contactsData = JSON.parse(JSON.stringify(list))
    },
    toSearch () {
      let toRoute = 'meeting.create.create-search-org'
      if (+this.$route.params.businessType === 1 && this.$route.name === 'meeting.edt') {
        toRoute = 'meeting.edt.create-search-org'
      }
      this.$router.push({
        name: toRoute,
        params: {
          placeholder: this.$t('searchNameTelephoneMailbox'),
          selectType: this.selectType,
          searchWays: [
            {
              wayName: this.$t('searchNameTelephoneMailbox'),
              wayCode: 1
            }
          ],
          resultVue: 'SearchResultOutSide',
          historyType: '6'
        }
      })
    }
  },
  watch: {
    storeContactsExternal () {
      this.watchSelected(this.contactsData)
    }
  }
}
</script>
<style lang="stylus">
  @import './c-choose-existing.styl'
</style>
