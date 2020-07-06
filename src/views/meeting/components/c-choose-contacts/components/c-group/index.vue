<template lang="pug">
  .custom-wrap(v-loading="loading" :loading-text="$t('loading')")
    .placeholder(v-if="!groupData.length && !loading")
      img.placeholder-img(src="~@res/placeholder/Group 5@2x.png")
      .btn-wrap
        .btn(@click="addGroup") {{$t('addCustomGroups')}}
        //- :: 添加自定义组
    template(v-else)
      .btn(@click="addGroup") {{$t('addCustomGroups')}}
      //- :: 添加自定义组
      Scroll.custom-group-scroll
        CSelectContactsGroupItem(
          v-for="item in groupData"
          :key="item.GROUP_ID"
          @setActionId=""
          :group="item"
          :select-type="selectType"
          @open="open")
    van-actionsheet(
      v-model="actionVisible"
      :actions="actions"
      @select="onSelect")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'

import Scroll from '@/components/c-scroll/index.vue'
import CSelectContactsGroupItem from './item'
export default {  
  props: {
    selectType: {
      type: String,
      default: ''
    },
    // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控
    businessType: {
      type: [String, Number],
      default: 0
    }
  },
  computed: {
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 联系人
      storeContacts (state) {
        return state.contacts[state.contacts.alias[this.selectType].state]
      }
    })
  },
  data () {
    return {
      actionVisible: false,
      actionGroupId: 0,
      groupCurrentId: 0,
      groupData: [], // 分组列表
      mumberList: [], // 所有的人员列表
      loading: false,
      checkeds: {},
      groupCheckeds: {},
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
  components: {
    Scroll,
    CSelectContactsGroupItem
  },
  created () {
    this.fetchGroup()
  },
  activated () {
    this.fetchGroup()
  },
  methods: {
    open (_id) {
      this.actionGroupId = _id
      setTimeout(()=> {
        this.actionVisible = true
      }, 100)
      
    },
    onSelect(item) {
      this.actionVisible = false
      switch (item.name) {
        case this.$t('modify'): // ::修改
          this.modify()
          break
        case this.$t('delete'): // ::删除
          this.del()
          break
        default:
          break
      }
    },
    modify () {
      if (!this.actionGroupId) {
        return false
      }
      this.$router.push({
        name: 'meeting.create.create-group',
        params: {
          groupId: this.actionGroupId
        }
      })
    },
    del () {
      if (!this.actionGroupId) {
        return false
      }
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('confirmDeleteCustomGroups'), // :: 确定要删除该自定义分组?
        showCancelButton: true
      }).then((action) => {
        if (action === 'confirm') {
          this.$ajaxRequest([{
            service: 'M4002007',
            GROUP_ID: this.actionGroupId
          }]).then((result) => {
            if (result.code === '0') {
              this.$notify({
                message: this.$t('successfulDeletion'), // :: 删除自定义组成功
                background: '#1989fa'
              })
              this.fetchGroup()
            } else {
              this.$notify(result.msg)
            }
          })
        }
      })
    },
    addGroup () {
      let toRoute = 'meeting.create.create-group'
      if (+this.businessType === 1 && this.$route.name === 'meeting.edt') {
        toRoute = 'meeting.edt.create-group'
      }
      this.$router.push({
        name: toRoute,
        params: {
          groupId: 'new',
          businessType: this.businessType
        }
      })
    },
    async fetchGroup (_isResetCurrentId) {
      this.loading = true
      let result = await this.$ajaxRequest({
        service: 'M4002014',
        mask: false
      }, () => {
        this.loading = false
      })
      this.groupData = result.data
      // 初始化赋值默认值
      if ((result.data.length && !this.groupCurrentId) || _isResetCurrentId) {
        this.groupCurrentId = result.data[0].GROUP_ID || 0
      }
    }
  },
  computed: {
    selectedMembers () { // 选中的成员
      return this.$store.state.meeting[this.selectType]
    }
  },
  watch: {
    selectedMembers (selected) {
      this.mumberList.forEach((item) => {
        let isSelected = this.$store.state.meeting[this.selectType].some((user) => {
          return item.USER_CODE === user.USER_CODE && item.CONTACTS_TYPE === user.CONTACTS_TYPE
        })
        this.$set(this.checkeds, item.USER_CODE, isSelected)
      })
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
