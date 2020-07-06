<template lang="pug">
  .group-card(v-loading="loading")
    van-checkbox.contacts-check-all(v-model="checkAll", @change="handlerChangeAll", @click.self="changeSource = 'all'")
      .group-name {{ group.GROUP_NAME }}
      .issue-operation-box(@click.stop="open") ···
      .toggle(@click.stop="active=!active")
        i.iconfont.icon-arrow-right.title-arrow(:class="{active: active}")
    .list(v-show="active")
        van-checkbox.contacts-item(
          v-for="item in memberData"
          v-model="item.checked"
          @change="handlerChange(item)"
          @click.self="changeSource = 'item'"
          :disabled="item.disabled")
          .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
          .name
            h2 {{item.USER_NAME}}
            p {{item.MAIN_ROLE_NAME}}
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

export default {
  name: 'CSelectContactsGroupItem',
  props: {
    group: {
      type: Object,
      default: () => []
    },
    selectType: {
      type: String,
      default: ''
    }
  },
  computed: {    
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 内部联系人
      storeContacts (state) {
        return state.contacts[state.contacts.alias[this.selectType].state].member
      }
    }),
    // 是否正在选择主持人，如果是选择主持人则要去掉外部联系人
    isConvenor () { 
      return this.selectType === 'convenor' || this.selectType === 'convenorEdit'
    },
    isDisbaledAll () { // 是否禁用全组
      if (this.isConvenor) {
        return this.memberData.every((item) => {
          return item.CONTACTS_TYPE === '1'
        })
      } else {
        return false
      }
    },
  },
  data () {
    return {
      loading: false,
      checkAll: false,
      active: false,
      changeSource: '',
      showEdt: false,
      isFetched: false, // 是否已经请求了
      memberData: [],
      actions: [
        {
          name: this.$t('option'), // ::选项
          disabled: true
        },
        {
          name: this.$t('modify') // ::修改
        },
        {
          name: this.$t('delete') // ::删除
        }
      ]
    }
  },
  watch: {
    checkAll (val, oldVal) {
      !this.isFetched && this.fetchData(val)

      const TYPE = val ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: this.memberData
      })
    },
    changeSource (val, oldVal) {

    },
    active (val, oldVal) {
      val && !this.isFetched && this.fetchData(false)
    },
    // 判断是否全选状态
    memberData: {
      handler: function (val, oldVal) {
        const theoryLength = this.memberData.filter(item => !item.disabled).length
        const realityLength = this.memberData.filter(item => item.checked && !item.disabled).length
        if (theoryLength === realityLength) {
          this.checkAll = true
        } else {
          this.checkAll = false
        }
      },
      deep: true
    },
    storeContacts: {
      handler: function (val, oldVal) {
        let list = this.memberData.forEach((item, index) => {
          let _index = val.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === +row.CONTACTS_TYPE)
          this.$set(this.memberData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    }
  },
  created () {
    console.log(this.group)
  },
  methods: {
    handlerChangeAll (val) {
      console.log(`handlerChangeAll`, val)
    },
    open () {
      this.$emit(`open`, this.group.GROUP_ID)
    },
    async fetchData (_isCheckAll) {
      let vm = this
      vm.loading = true
      let result = await vm.$ajaxRequest({
        service: 'M4002008',
        GROUP_ID: this.group.GROUP_ID,
        Number: 1,
        page: 1,
        pagecount: 1000,
        mask: false
      }, ()=> {
        vm.loading = false
      })
      vm.memberData = this.transformDataFormat(result['data'], _isCheckAll)
      vm.isFetched = true
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    },
    transformDataFormat (_data, _isCheckAll) {
      let result = []
      _data.forEach((item)=> {
        let _disabled = this.isConvenor ? item.CONTACTS_TYPE === '1' : false
        result.push({
          checked: _isCheckAll,
          disabled: _disabled,
          CONTACTS_TYPE: item.CONTACTS_TYPE,
          EMAIL: item.EMAIL,
          MOBILE: item.MOBILE,
          USER_CODE: item.CONTACTS_USER_CODE,
          USER_NAME: item.USER_NAME
        })
      })
      return result
    }
  }
}
</script>

<style lang="stylus">
@import './item.styl'
</style>
