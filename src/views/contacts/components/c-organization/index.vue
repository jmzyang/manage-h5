<template lang="pug">
  .page-wrap
    BarHeader(layout="title", :back="true", :backEvent="true", @back="handlerBack")
      | {{$route.meta.title}}
    .bar-search
      .search-input(@click="toSearch")
        i(class="iconfont icon-search")
        span 搜索机构或人员姓名、电话、邮箱
    .organization-nav
        ul
          li {{scene}}
          li.arrow
            i.iconfont.icon-arrow-right
          li {{$t('organizational')}}
          li.arrow
            i.iconfont.icon-arrow-right
          template(v-for="(item, index) in guidData")
            li(ref="guidItem" @click="goNav(item, index)", :class="{'current': index === (guidData.length -1)}") {{item.ORG_NAME}}
            li.arrow(ref="guidItemArrow" v-if="index < guidData.length - 1")
              i.iconfont.icon-arrow-right
    //- van-checkbox.organization-check-all.contacts-check-all(v-model="checkedAll")
    //-   .name {{$t('allElection')}}
    Scroll.organization-scroll(v-loading="loading", :loading-text="$t('loading')")
      .org-list
        van-checkbox.contacts-item(
          v-for="(item, index) in contactsData",
          v-model="item.checked",
          :disabled="item.disabled"
          :name="item.org ? 'org' + item.ORG_ID : 'user' + item.USER_CODE"
          @change="handlerChange(item)")
          template(v-if="item.org")
            .spanspan(style="display:none;")
              | {{item.org}}
            .org-name
              | {{item.ORG_NAME}}
              span.count ({{item.COUNT}}{{$t('people')}})
            .next-level(@click.stop="goNext(item)", :class="{'disabled': item.checked}")
              i.iconfont.icon-org-level
              | {{$t('subordinate')}}
          template(v-else)
            .avatar(v-avatar.sync="item.USER_ICON", :full-name="item.USER_NAME")
            .name
              h2 {{item.USER_NAME}}
              p {{item.MAIN_ROLE_NAME}}
    CContactsFooter(
      :scene="scene"
      :fixedChosen="fixedChosen"
      :select-type="selectType"
      :business-type="businessType")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_COMMON from '@/stores/common/types'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import CContactsFooter from '../c-footer'

import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  name: 'CContactsOrganization',
  computed: {
    checkedAll: {
      set (val) {
        const TYPE = val ? 'concat' : 'delete'
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: TYPE,
          value: this.contactsData
        })
      },
      get () {
        let result = false
        let _contactsData = this.contactsData.filter(item => !item.disabled)
        if (_contactsData.length > 0 && _contactsData.every(item => item.checked === true)) {
          result = true
        } else {
          result = false
        }
        return result
      }
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
    guidData: {
      handler: function (val, oldVal) {
        let ORGLIST = this.orgList.slice()
        console.log(`guidData`, val)
        if (val.length > 0) {
          this.getData(ORGLIST.filter(item => +item.PAR_ORG === +val[val.length - 1].ORG_ID))
        } else {
        }
      },
      // 深度观察监听
      deep: true
    },
    storeContacts: {
      handler: function (val, oldVal) {
        this.contactsData.forEach((item, index) => {
          if (item.org) {
            let _index = val.organization.findIndex(row => +item.ORG_ID === +row.ORG_ID)
            !item.disabled && this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
          } else {
            let _index = val.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === 0)
            !item.disabled && this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
          }
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  data () {
    return {
      scene: this.$route.query.scene || this.$t('contacts'), // 联系人
      selectType: this.$route.query.selectType || 'default',
      historyType: this.$route.query.historyType || 'default',
      showSearch: this.$route.query.showSearch,
      businessType: this.$route.query.businessType || 0, // 0：创会；1：修改会议；2: 会场；3：会议控制；；4：转授权，6：参会授权
      fixedChosen: this.$route.query.fixedChosen || [],
      guidData: [], // 当前机构导航
      orgData: [], // 机构数据
      contactsData: [], // 联系人数据（包含组织机构）
      loading: false
    }
  },
  activated() {
    // this.getCurrentOrgGuid(0)
  },
  created () {
    // 获取最新组织机构
    this.$store.dispatch(TYPES_COMMON.A_ORG_LIST, {
      successCb: ()=> {
        this.getCurrentOrgGuid(0)
      }
    })
  },
  mounted() {},  
  components: {
    BarHeader,
    CContactsFooter,
    Scroll
  },
  methods: {
    goNext (_data) {
      if (!_data.checked) {
        this.guidData.push(_data)
      }
    },
    goNav (_item, _index) {
      if (_index < this.guidData.length - 1) {
        console.log(`goNav`, this.guidData.length - 1 - _index)
        this.guidData.splice(_index + 1, this.guidData.length - 1 - _index)
      }
    },
    handlerChange (_data) {
      console.log(_data)
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    },
    getCurrentOrgGuid (_parentId) {
      this.orgList.forEach(item => {
        if (+item.PAR_ORG === +_parentId) {
          this.guidData.push(item)
        }
      })
    },
    async getData (_orgData) {
      let vm = this
      vm.loading = false
      let result = await vm.$ajaxRequest({
        service: 'U2001808',
        ORG_ID: this.guidData[this.guidData.length - 1].ORG_ID || '',
        page: 1,
        pagecount: 1000,
        mask: false
      }, ()=> {
        vm.loading = false
      })
      let orgList = _orgData.map(item => {
        let _index = this.storeContacts.organization.findIndex(row => +item.ORG_ID === +row.ORG_ID)
        item.checked = (_index > -1 ? true : false)
        return item
      })
      let list = result['data'].map(item => {
        let _index = this.storeContacts.member.findIndex(row => item.USER_CODE === row.USER_CODE && item.CONTACTS_TYPE === row.CONTACTS_TYPE)
        let _index2 = this.storeContacts.member.findIndex(row => item.USER_CODE === row.USER_CODE && item.CONTACTS_TYPE === row.CONTACTS_TYPE && row.irrevocable)
        item.disabled = this.fixedChosen.findIndex(fItem => +fItem === +item.USER_CODE) > -1 ? true : _index2 > -1 ? true : false
        item.checked = (_index > -1 ? true : false)
        return item
      })
      // 深度拷贝下，防止视图更新失败
      vm.contactsData = JSON.parse(JSON.stringify(orgList.concat(list)))
    },
    toSearch () {
      if (+this.businessType === 0 || (+this.businessType === 1 && this.$route.name === 'meeting.create')) {
        this.$router.push({
          name: 'meeting.create.create-search-org',
          params: {
            placeholder: this.$t('searchOrganization'), // 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // 找组织
                wayCode: 2
              }
            ],
            fixedChosen: this.fixedChosen,
            resultVue: 'SearchResult',
            historyType: this.historyType,
            edt: true,
            meetinngId: this.$route.params.meetinngId
          }
        })
      } else if (+this.businessType === 1 && this.$route.name === 'meeting.edt') {
        this.$router.push({
          name: 'meeting.edt.create-search-org',
          params: {
            placeholder: this.$t('searchOrganization'), // 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // 找组织
                wayCode: 2
              }
            ],
            fixedChosen: this.fixedChosen,
            resultVue: 'SearchResult',
            historyType: this.historyType
          }
        })
      } else if (+this.businessType === 4){
        this.$router.push({
          name: 'meetingPersonnelDetails.search',
          params: {
            placeholder: this.$t('searchOrganization'), // 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // 找组织
                wayCode: 2
              }
            ],
            fixedChosen: this.fixedChosen,
            resultVue: 'SearchResult',
            historyType: this.historyType
          }
        })
      }
    },
    // 返回
    handlerBack () {
      // if(+this.businessType === 5) {
      //   this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
      //     type: 'clear'
      //   })
      // }
      if(+this.businessType === 4){
        this.$router.push({
          name: 'meeting-details',
          query: {
            meetingId: this.$route.query.meetingId,// 会议ID
            founderName: this.$route.query.founderName,
            unread: this.$route.query.unread,
            listType: this.$route.query.listType,
            currentNav: this.$route.query.currentNav,
            Jurisdiction: this.$route.query.Jurisdiction,
            waterType: this.$route.query.waterType
          }
        })
      }else{
        this.$router.go(-1)
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
