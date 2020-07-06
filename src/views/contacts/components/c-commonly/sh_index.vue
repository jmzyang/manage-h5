<template lang="pug">
  Scroll.top-contacts-list(v-loading="loading" :loading-text="$t('loading')")
    .contacts-section(v-if="enterpriseData.length")
      .noBody(v-if="enterpriseData.length = 0") 暂未选中参会人
      .contacts-list(v-show="inShow")
        van-checkbox.contacts-item(
          v-for="(item,index) in enterpriseData"
          v-show="item.checked"
          v-model="item.checked"
          @change="handlerChange(item)")
          .avatar(v-avatar="item.USER_ICON", :full-name="item.USER_NAME")
          .name
            h2 {{item.USER_NAME}}
            p {{item.MAIN_ROLE_NAME}}
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import Scroll from '@/components/c-scroll/index.vue'
export default {
  name: 'CContactsCommonly',
  components: {
    Scroll
  },
  props: ['selectType'],
  computed: {
    // 内部联系人全选
    checkedAllEnterprise: {
      set (val) {
        const TYPE = val ? 'concat' : 'delete'
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: TYPE,
          value: this.enterpriseData
        })
        // let _enterpriseData = this.enterpriseData.slice()
        // _enterpriseData.forEach((item, index) => {
        //   !item.disable && this.$set(this.enterpriseData[index], 'checked', val)
        // })
      },
      get () {
        let result = false
        let _enterpriseData = this.enterpriseData.filter(item => !item.disable)
        if (_enterpriseData.length > 0 && _enterpriseData.every(item => item.checked === true)) {
          result = true
        } else {
          result = false
        }
        return result
      }
    },
    // 外部联系人全选
    checkedAllExternal: {
      set (val) {
        const TYPE = val ? 'concat' : 'delete'
        this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
          type: TYPE,
          value: this.externalData
        })
        // let _externalData = this.externalData.slice()
        // _externalData.forEach((item, index) => {
        //   !item.disable && this.$set(this.externalData[index], 'checked', val)
        // })
      },
      get () {
        let result = false
        let _externalData = this.externalData.filter(item => !item.disable)
        if (_externalData.length > 0 && _externalData.every(item => item.checked === true)) {
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
      // 外部联系人
      storeContactsExternal (state) {
        return state.contacts[state.contacts.alias[this.selectType].state].member.filter(item => +item.CONTACTS_TYPE === 1)
      },
      // 内部联系人
      storeContactsEnterprise (state) {
        return state.contacts[state.contacts.alias[this.selectType].state].member.filter(item => +item.CONTACTS_TYPE !== 1)
      }
    })
  },
  data () {
    return {
      checked: false,
      loading: false,
      externalData: [],
      enterpriseData: [],
      checkeds: {},
      inShow: true, // 内部联系人展开显示
      outShow: true, // 外部联系人展开显示
    }
  },
  activated () {
    
  },
  created () {
    this.fetchData(0)
    this.fetchData(1)
  },
  methods: {
    async fetchData (cateId) {
      this.loading = true
      let result = await this.$ajaxRequest({
        service: 'M4002022',
        CONTACTS_TYPE: cateId,
        page: 1,
        pagecount: 20,
        mask: false
      }, () => {
        this.loading = false
      })
      if (result.code === '0') {
        let resultData = result.data.map(item => {
          item.USER_CODE = item.CONTACTS_NO
          return item
        })
        if (+cateId === 1) {
          // 外部联系人
          let _externalData = resultData.filter(item => +item.CONTACTS_TYPE === 1)
          console.log(`外部联系人`, resultData, _externalData)
          this.externalData = _externalData.map(item => {
            let _index = this.storeContactsExternal.findIndex(row => +item.USER_CODE === +row.USER_CODE)
            item.checked = (_index > -1 ? true : false)
            return item
          })
        } else {
          // 内部联系人
          let _enterpriseData = resultData.filter(item => +item.CONTACTS_TYPE === 0)
          console.log(`内部联系人`, resultData, _enterpriseData)
          this.enterpriseData = _enterpriseData.map(item => {
            let _index = this.storeContactsEnterprise.findIndex(row => +item.USER_CODE === +row.USER_CODE)
            item.checked = (_index > -1 ? true : false)
            return item
          })
        }
      }
    },
    handlerChange (_data) {
      const TYPE = _data.checked ? 'concat' : 'delete'
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: TYPE,
        value: [_data]
      })
    }
  },
  watch: {
    storeContactsExternal: {
      handler: function (val, oldVal) {
        this.externalData.forEach((item, index) => {
          let _index = val.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === 1)
          this.$set(this.externalData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    },
    storeContactsEnterprise: {
      handler: function (val, oldVal) {
        this.enterpriseData.forEach((item, index) => {
          let _index = val.findIndex(row => +item.USER_CODE === +row.USER_CODE && +item.CONTACTS_TYPE === 0)
          this.$set(this.enterpriseData[index], 'checked', _index > -1 ? true : false)
        })
      },
      // 深度观察监听
      deep: true
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
.top-contacts-list
  .contacts-item
    flex-direction row-reverse
    padding-left 15px
    border-bottom 1px solid #ccc
    /deep/.van-checkbox__label
      .avatar
        border-radius 0
  .contacts-section
    border-bottom none
</style>
