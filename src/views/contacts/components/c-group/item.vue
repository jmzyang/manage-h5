<template lang="pug">
  .page-wrap.contacts-group
    BarHeader(layout="title", :back="true")
      | {{groupName}}
      .submit-header(@click.stop="edit" v-if="maintain") {{$t('edit')}}
    van-checkbox.contacts-group-item-check-all.contacts-check-all(v-model="checkedAll" v-if="!maintain")
      .group-name {{$t('allElection')}}
    Scroll.contacts-group-item-scroll(v-loading="loading", loading-text="")
      .contacts-checkbox-box(v-if="!maintain")
        van-checkbox.contacts-item(
          v-for="item in contactsData"
          v-model="item.checked"
          @change="handlerChange(item)"
          :disabled="item.disabled")
          .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
          .name
            h2 {{item.USER_NAME}}
            p {{item.MAIN_ROLE_NAME}}
      .contacts-item-box(v-if="maintain")
        .contacts-item(v-for="item in contactsData" @click="seeContacts(item)")
          .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
          .name
            span {{item.USER_NAME}}
          .arrow
            i.iconfont.icon-arrow-right
    CContactsFooter(
      v-if="!maintain"
      :scene="scene"
      :fixedChosen="fixedChosen"
      :select-type="selectType"
      :business-type="businessType")
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import storage from 'store'
import BarHeader from '@/components/c-header'
import CContactsFooter from '../c-footer'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  name: 'CSelectContactsGroupItem',
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
        console.log(`123`, this.contactsData.filter(item => !item.disabled))
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: TYPE,
          value: this.contactsData.filter(item => !item.disabled)
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
      selectType: this.$route.query.selectType,
      maintain: this.$route.query.maintain,
      loading: false,
      groupName: '',
      contactsData: []
    }
  },
  watch: {
    // 判断是否全选状态
    storeContacts: {
      handler: function (val, oldVal) {
        let list = this.contactsData.forEach((item, index) => {
          let _index = val.member.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE && !item.disabled)
          this.$set(this.contactsData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  created () {
    this.fetchData()

    this.groupName = storage.get('EDIT_GROUP_NAME')
  },
  components: {
    Scroll,
    BarHeader,
    CContactsFooter
  },
  methods: {
    async fetchData () {
      let vm = this
      vm.loading = true
      let result = await vm.$ajaxRequest({
        service: 'M4002008',
        GROUP_ID: this.groupId,
        Number: 1,
        page: 1,
        pagecount: 1000,
        mask: false
      }, ()=> {
        vm.loading = false
      })
      vm.contactsData = this.transformDataFormat(result['data'])
      console.log(vm.contactsData)
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    },
    transformDataFormat (_data) {
      let result = []
      _data.forEach((item)=> {
        let _disabled = this.isConvenor ? item.CONTACTS_TYPE === '1' : false
        let _index = this.storeContacts.member.findIndex(row => +item.CONTACTS_USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE && !_disabled)
        let _checked = (_index > -1 ? true : false)
        result.push({
          disabled: _disabled,
          checked: _checked,
          CONTACTS_TYPE: item.CONTACTS_TYPE,
          EMAIL: item.EMAIL,
          MOBILE: item.MOBILE,
          USER_CODE: item.CONTACTS_USER_CODE,
          USER_NAME: item.USER_NAME
        })
      })
      return result
    },
    // 查看参会人详情
    seeContacts (item) {
      this.$router.push({
        name: 'contacts.seeContacts',
        query: {
          ...this.$route.query
        },
        params: {
          contactsData: item
        }
      })
    },
    // 编辑参会人
    edit () {
      this.$router.push({
        name: 'contacts.group.add',
        query: {
          addGroupTitle: this.$t('editGroups'), // 编辑组
          groupId: this.groupId,
          groupName: this.groupName,
          ...this.$route.query
        },
        params: {
          channel: 'edit'
        }
      })
    }
  }
}
</script>

<style lang="stylus">
@import './item.styl'
</style>
