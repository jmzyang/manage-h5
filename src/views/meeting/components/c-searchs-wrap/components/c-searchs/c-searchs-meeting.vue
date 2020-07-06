<template lang="pug">
  .searchs-content
    .header
      .input-content
        i(class="iconfont icon-search")
        input(type="search" :placeholder="placeholderTitle" maxlength="40" v-focus v-model="inputValue" @input="inputFocus" @keyup="TargetContent" ref="searchsInput")
      .icons(@click="closSearchs")
        | {{$t('cancel')}}
    .main
      .search-way(v-show="inputValue")
        .search-way-item(@click="startSearch(1)")
          .by-people
            | {{$t('searchMeetingRoom')}}：{{ inputValue }}
        <!--.search-way-item(@click="startSearch(2)")-->
          <!--.by-org-->
            <!--| {{$t('seekOrganization')}}：{{ inputValue }}-->
      .searchs-operation(v-show="isKeyWord !== 'searchs'")
        | {{$t('historySearch')}}
        i(class="iconfont icon-clear" @click="confirmDeletion")
      .noSearchsRecord(v-show="isKeyWord === 'noRecord'")
        | {{$t('noSearchRecord')}}
      .keyword-list(v-show="isKeyWord === 'keyword'")
        .list-content(v-for="(Kvalue,KIndex) in KeyWordData" :key="KIndex" @click="TargetContent") {{Kvalue.METTING_CONTENT}}
      .searchs-list(v-show="isKeyWord === 'searchs'")
        .list-content(v-for="(Kvalue,KIndex) in searchsData" :key="KIndex" @click="TargetContent") {{Kvalue.METTING_CONTENT}}
</template>
<script>
export default {
  data () {
    return {
      inputValue: this.searchsVal, // 输入框内容
      isKeyWord: 'keyword', // 查询方式
      KeyWordData: [], // 关键词数据
      searchsData: [], // 输入内容模糊查询数据
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
    },
    deleteCode: { // 历史搜索记录用到的，日后完善
      type: [String],
      default: ''
    },
    keyWordCode: { // 历史搜索记录用到的，日后完善
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
  mounted () {
    this.getKeyWordList('keyWord')
  },
  methods: {
    startSearch (searchBy) {
      this.$emit('search', {
        searchBy: searchBy,
        searchKey: this.inputValue
      })
    },
    // --------------------------------------------------------------------------------------
    async getKeyWordList (type) {
      // 获取关键词列表
      let vm = this
      if (!vm.keyWordCode) {
        this.isKeyWord = 'noRecord'
        return false
      }
      let req = [
        {
          service: vm.keyWordCode,
          METTING_CONTENT_FUZZY: vm.inputValue, // 输入内容
          page: 1, // 页码
          pagecount: 10, // 单页条数
          mask: false // 禁用全局菊花
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0' && result.data.length > 0) {
        if (type === 'keyWord') {
          vm.KeyWordData = result.data
        } else {
          this.isKeyWord = 'searchs'
          vm.searchsData = result.data
        }
      } else {
        this.isKeyWord = 'noRecord'
      }
    },
    closSearchs () {
      this.$router.go(-1)
    },
		TargetContent (e) { // 确定搜索事件函数
			this.$refs.searchsInput.blur()
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.$emit('getKeyWordDate', this.inputValue)
        }
      } else {
        this.$emit('getKeyWordDate', e.target.innerHTML)
      }
    },
    inputFocus () {
      if (!this.inputValue || this.inputValue.match(/^[ ]*$/)) {
        if (this.KeyWordData.length > 0) {
          this.isKeyWord = 'keyword'
        } else {
          this.isKeyWord = 'noRecord'
        }
      } else {
        this.getKeyWordList()
      }
    },
    confirmDeletion () {
      let vm = this
      if (vm.KeyWordData.length < 1 || !vm.deleteCode) {
        return false
      }
      vm.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('determineClearSearchRecords'),
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {
          vm.deleteRecord()
        }
      })
    },
    async deleteRecord () {
      // 删除搜索关键词记录
      let vm = this
      let req = [
        {
          service: vm.deleteCode,
          mask: false // 禁用全局菊花
        }
      ]
      let result = await vm.$ajaxRequest(req)
      if (result.code === '0' && result.data.length > 0) {
        vm.KeyWordData = [{}]
        vm.isKeyWord = 'noRecord'
      }
    }
  }
}
</script>
<style lang="stylus">
  @import './c-searchs-meeting.styl'
</style>
