<template lang="pug">
  .page-wrap.contacts-group
    BarHeader(layout="title", :back="true" v-if="!isSearchsPage",)
      | {{$route.meta.title}}
      template(slot="actions" v-if="maintain")
        .bar-header-add(@click="addGroupClick")
          i.iconfont.icon-header-plus
    .search-input-box(v-if="maintain && !isSearchsPage")
      .search-input(@click="isSearchsPage = true")
        i(class="iconfont icon-search")
        span {{searchsTitle}}
    Scroll.contacts-group-scroll(v-loading="loading", :loading-text="$t('loading')" v-if="!isSearchsPage")
      .placeholder(v-if="!groupData.length && !loading")
        img.placeholder-img(src="~@res/placeholder/Group 5@2x.png")
      .group-item(
        v-for="item in groupData"
        @click.stop="goContactsRouter(item)")
        .group-item-icon
        .group-item-label
          .meta
            .group-name {{item.GROUP_NAME}}
            .count {{item.COUNT || '0'}} {{$t('people')}}
        .arrow
          i.iconfont.icon-arrow-right
    CContactsFooter(
      v-if="!maintain && !isSearchsPage"
      :scene="scene"
      :fixedChosen="fixedChosen"
      :select-type="selectType"
      :business-type="businessType")
    Searchs(
      v-if="maintain && isSearchsPage",
      @getKeyWordDate="searchsResult",
      :meetingNameList="meetingNameList",
      :searchsVal="searchsVal"
    )
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import { getDataByKey } from '@/utils/array'
import BarHeader from '@/components/c-header'
import CContactsFooter from '../c-footer'
import Searchs from '@/views/meeting-control/components/c-searchs'
import Scroll from '@/components/c-scroll/index.vue'
import CSelectContactsGroupItem from './item'
import storage from 'store'
export default {
  name: 'CContactsGroup',
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
  watch: {
    storeContacts (selected) {
      this.mumberList.forEach((item) => {
        let isSelected = this.$store.state.meeting[this.selectType].some((user) => {
          return item.USER_CODE === user.USER_CODE && item.CONTACTS_TYPE === user.CONTACTS_TYPE
        })
        this.$set(this.checkeds, item.USER_CODE, isSelected)
      })
    }
  },
  data () {
    return {
      scene: this.$route.query.scene || this.$t('contacts'), // 联系人
      selectType: this.$route.query.selectType || 'default',
      historyType: this.$route.query.historyType || 'default',
      showSearch: this.$route.query.showSearch,
      businessType: this.$route.query.businessType || 0,
      fixedChosen: this.$route.query.fixedChosen || [],
      maintain:this.$route.query.maintain,
      actionVisible: false,
      actionGroupId: 0,
      groupCurrentId: 0,
      groupData: [], // 分组列表
      mumberList: [], // 所有的人员列表
      loading: false,
      checkeds: {},
      groupCheckeds: {},
      searchsTitle: this.$t('searchGroupsName'), // 搜索框标题
      searchsVal:'', // 搜索框内容
      meetingNameList:[], // 存在的会场列表名称
      isSearchsPage: false, // 是否检索
      actions: [
        {
          name: this.$t('option'), // 选项
          disabled: true
        },
        {
          name: this.$t('modify') // 修改
        },
        {
          name: this.$t('delete') // 删除
        }
      ]
    }
  },  
  created () {
    this.fetchGroup()
    storage.set('EDIT_GROUP_NAME', '')
  },
  components: {
    Scroll,
    BarHeader,
    CSelectContactsGroupItem,
    CContactsFooter,
    Searchs
  },
  methods: {
    goContactsRouter (_data) {
      storage.set('EDIT_GROUP_NAME', _data.GROUP_NAME)
      this.$router.push({
        name: 'contacts.group.item',
        query: {
          groupId: _data.GROUP_ID,
          ...this.$route.query
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
      this.groupDataSource = result.data
      this.groupData = JSON.parse(JSON.stringify(this.groupDataSource))
      this.meetingNameList = getDataByKey(this.groupData, 'GROUP_NAME')
    },
    // 添加组
    addGroupClick () {
      this.$router.push({
        name: 'contacts.group.add',
        query: {
          addGroupTitle: this.$t('establishGroups'), // 创建组
          ...this.$route.query
        }
      })
    },
    // 搜索返回
    searchsResult(val) {
      let vm = this
      this.isSearchsPage = false
      if(val){
        vm.searchsVal = val
        vm.searchsTitle = val
        vm.groupData = []
        vm.groupDataSource.forEach(value => {
          if(value.GROUP_NAME.indexOf(val) > -1){
            vm.$set(vm.groupData, vm.groupData.length, value)
          }
        })
      }else{
        vm.searchsVal = ''
        vm.searchsTitle = this.$t('searchGroupsName') // 搜索组名称
        this.groupData = JSON.parse(JSON.stringify(this.groupDataSource))
      }

    },
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
