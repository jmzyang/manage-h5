<template lang="pug">
  .page-wrap
    BarHeader(
      v-if="!addVisible"
      layout="title",
      :back="true")
      | {{$route.meta.title}}
      template(slot="actions")
        .bar-header-add(@click.stop="addVisible = true")
          i.iconfont.icon-header-plus
    .bar-search
      .search-input(@click="toSearch")
        i(class="iconfont icon-search")
        span 搜索姓名、电话、邮箱
    //- van-checkbox.contacts-external-item-check-all.contacts-check-all(v-model="checkedAll")
    //-   .group-name {{$t('allElection')}}
      //- 全选
    Scroll.contacts-external-item-scroll(v-loading="loading", loading-text="")
      van-checkbox.contacts-item(
        v-for="item in contactsData"
        v-model="item.checked"
        @change="handlerChange(item)"
        :disabled="item.disabled")
        .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
        .name
          h2 {{item.USER_NAME}}
          p {{item.MAIN_ROLE_NAME}}
    CContactsFooter(
      :scene="scene"
      :fixedChosen="fixedChosen"
      :select-type="selectType"
      :business-type="businessType")
    transition(name="bounce", enter-active-class="bounceInRight", leave-active-class="bounceOutRight")
      CContactsExternalAdd(@close="addVisible = false", v-if="addVisible")
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import BarHeader from '@/components/c-header'
import CContactsFooter from '../c-footer'
import Scroll from '@/components/c-scroll/index.vue'

import CContactsExternalAdd from './add.vue'
export default {
  name: 'CContactsExternal',
  props: {
    // group: {
    //   type: Object,
    //   default: () => []
    // },
    // selectType: {
    //   type: String,
    //   default: ''
    // }
  },
  computed: {    
    checkedAll: {
      set (val) {
        const TYPE = val ? 'concat' : 'delete'
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: TYPE,
          value: this.contactsData.filter(item => !item.disabled)
        })
      },
      get () {
        let result = false
        let _contactsData = this.contactsData.filter(item => !item.disabled)
        if (_contactsData.length > 0 && _contactsData.every(item => item.checked)) {
          result = true
        } else {
          result = false
        }
        return result
      }
    },
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 联系人
      storeContacts (state) {
        return state.contacts[this.selectType]
      }
    }),
    // 是否正在选择主持人，如果是选择主持人则要去掉外部联系人
    isConvenor () { 
      return this.selectType === 'convenor' || this.selectType === 'convenorEdit'
    },
    isDisbaledAll () { // 是否禁用全组
      if (this.isConvenor) {
        return this.contactsData.every((item) => {
          return item.CONTACTS_TYPE === '1'
        })
      } else {
        return false
      }
    },
  },
  data () {
    return {
      scene: this.$route.query.scene || this.$t('contacts'), // 联系人
      selectType: this.$route.query.selectType || 'default',
      historyType: this.$route.query.historyType || 'default',
      showSearch: this.$route.query.showSearch,
      businessType: this.$route.query.businessType || 0,
      fixedChosen: this.$route.query.fixedChosen || [],
      groupId: this.$route.query.groupId,
      groupName: this.$route.query.groupName,
      loading: false,
      addVisible: false,
      contactsData: []
    }
  },
  watch: {
    // 判断是否全选状态
    storeContacts: {
      handler: function (val, oldVal) {
        console.log(`storeContacts`, val)
        let list = this.contactsData.forEach((item, index) => {
          let _index = val.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === 1 && !item.disabled)
          this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  created () {
    this.fetchData()
  },
  components: {
    Scroll,
    BarHeader,
    CContactsExternalAdd,
    CContactsFooter
  },
  methods: {
    handlerBack () {

    },
    // 添加外部联系人
    handlerAdd () {
      this.$router.push({
        name: 'contacts.externalAdd',
        query: this.$route.query
      })
    },
    // 一次性返回数据，待优化
    async fetchData () {
      let vm = this
      vm.loading = true
      let result = await this.$ajaxRequest({
        service: 'M4002009',
        page: 1,
        pagecount: 9999,
        mask: false
      }, () => {
        this.loading = false
      })
      if (+result.code === 0 && Array.isArray(result['data']) && result['data'].length > 0) {
        // 过滤没有名字的外部联系人
        vm.contactsData = JSON.parse(JSON.stringify(this.transformDataFormat(result['data'].filter(item => item.USER_NAME))))
      } else {
        vm.contactsData = []
      }
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    },
    // 数据转换
    transformDataFormat (_data) {
      let result = []
      _data.forEach((item)=> {
        let _index = this.storeContacts.member.findIndex(row => +item.OUTSIDE_USER_CODE === +row.USER_CODE && +row.CONTACTS_TYPE === 1)
        let _checked = (_index > -1 ? true : false)
        console.log(`transformDataFormat`, _checked)
        result.push({
          checked: _checked,
          USER_CODE: item.OUTSIDE_USER_CODE,
          EMAIL: item.EMAIL_ADDRESS,
          MOBIL: item.PHONE_NO,
          CONTACTS_TYPE: '1',
          USER_NAME: item.USER_NAME
        })
      })
      return result
    },
    toSearch () {
      let toRoute = 'meeting.create.create-search-org'
      if (+this.businessType === 1 && this.$route.name === 'meeting.edt') {
        toRoute = 'meeting.edt.create-search-org'
      }else if(+this.businessType === 3){
        toRoute = 'meetingControl-search-org'
      }else if(+this.businessType === 5 || +this.businessType === 6) {
        toRoute = 'meeting-search-org'
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
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
