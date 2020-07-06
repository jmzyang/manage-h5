<template lang="pug">
  .searchs-content
    .header
      .input-content
        i(class="iconfont icon-search")
        input(type="search" :placeholder="placeholderTitle" maxlength="40" v-focus v-model="inputValue" ref="searchsInput" @keyup="TargetContent")
      .icons(@click="closSearchs")
        | {{$t('cancel')}}
        //- :: 取消
    .main
      .search-way(v-show="inputValue")
        .search-way-item(v-for="way in $route.params.searchWays" :key="way.wayCode" @click="startSearch(way.wayCode)")
          .by-search-way
            | {{ `${way.wayName}：${inputValue}` }}
      .searchs-operation
        | {{$t('historySearch')}}
        //- :: 历史搜索
        i(class="iconfont icon-clear" @click="confirmDeletion")
      .noSearchsRecord(v-show="isSearchHistory === 2")
        | {{$t('noSearchRecord')}}
        //- :: 暂无搜索记录
      .noSearchsRecord(v-show="isSearchHistory === 1")
        | {{$t('queryingRecords')}}
        //- :: 正在查询搜索记录
      .keyword-list(v-show="isSearchHistory === 3")
        .list-content(v-for="(Kvalue,KIndex) in KeyWordData" :key="KIndex" @click="historyToSearch(Kvalue)") {{Kvalue.SEARCH_KEY}}
</template>
<script>
export default {
  data () { // M4002004   SEARCH_TYPE
    return {
      isSearchHistory: 1, // 当前的搜索历史的状态  1：正在查询历史 2：无历史结果 3：有历史结果
      inputValue: this.searchsVal, // 输入框内容
      KeyWordData: [], // 历史搜索关键词数据
      placeholderTitle: this.placeholder || this.$t('searchTopics') // :: 搜索会议主题
    }
  },
  props: {
    placeholder: {
      type: [String],
      default: ''
    },
    searchsVal: {
      type: [String],
      default: ''
    }
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  },
  created () {
    this.getHistorySearch()
  },
  methods: {
    startSearch (searchBy) {
      this.$emit('search', {
        searchBy: searchBy,
        searchKey: this.inputValue
      })
    },
    TargetContent (e) {
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.startSearch(1)
        }
      }
    },
    historyToSearch (param) {
			this.$refs.searchsInput.blur()
      this.inputValue = param.SEARCH_KEY
      let searchBy = 1
      if (param.SEARCH_TYPE === '3' || param.SEARCH_TYPE === '5') {
        searchBy = 2
      }
      this.$emit('search', {
        searchBy: searchBy,
        searchKey: this.inputValue
      })
    },
    getHistorySearch () {
      this.$ajaxRequest([{
        service: 'M4002004',
        mask: false,
        SEARCH_TYPE: this.$route.params.historyType
      }]).then((result) => {
        if (result.code === '0') {
          this.KeyWordData = result.data
          if (this.KeyWordData.length) {
            this.isSearchHistory = 3
          } else {
            this.isSearchHistory = 2
          }
        }
      })
    },
    // --------------------------------------------------------------------------------------
    closSearchs () {
      this.$router.go(-1)
    },
    confirmDeletion () {
      this.$Dialog.confirm({
        title: this.$t('tips'), // :: 提示
        message: this.$t('determineClearSearchRecords'), // :: 确定要清空搜索记录吗?
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {
          this.deleteRecord()
        }
      })
    },
    async deleteRecord () {
      // 删除搜索关键词记录
      let req = [
        {
          service: 'M4002005',
          mask: false,
          SEARCH_TYPE: this.$route.params.historyType
        }
      ]
      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        this.KeyWordData = []
        this.isSearchHistory = 2
        this.$notify({
          message: this.$t('emptyHistorySuccess'), // :: 清空历史搜索成功。
          background: '#1989fa'
        })
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl'
</style>
