<template lang="pug">
  .searchs-content
    .header
      i.icon-close.iconfont(@click="closSearchs")
      .input-content
        i(class="iconfont icon-search")
        input(:placeholder="placeholder" v-validate="'required|max:20'" maxlength="20" type="search" v-model="inputValue" @input="inputFocus" @keyup="TargetContent" ref="searchsInput")
      .icons(@click="searchClick")
        | {{$t('search')}}
        //- :: 搜索
    .main
      .searchs-operation(v-show="isKeyWord !== 'searchs'")
        | {{$t('historySearch')}}
        //- :: 历史搜索
        i(class="iconfont icon-clear" @click="confirmDeletion")
      .noSearchsRecord(v-show="isKeyWord === 'noRecord'")
        | {{$t('noSearchRecord')}}
        //- :: 暂无查询记录...
      .keyword-list(v-show="isKeyWord === 'keyword'")
        .list-content(v-for="(Kvalue,KIndex) in KeyWordData" @click="TargetContent") {{Kvalue.METTING_CONTENT}}
      .searchs-list(v-show="isKeyWord === 'searchs'")
        .list-content(v-for="(Kvalue,KIndex) in searchsData" @click="TargetContent") {{Kvalue.METTING_CONTENT}}
</template>
<script>
export default {
  data () {
    return {
      inputValue: this.$route.query.searchsVal || '', // 输入框内容
      isKeyWord: 'keyword', // 查询方式
      KeyWordData: [], // 关键词数据
      searchsData: [],// 输入内容模糊查询数据
      placeholder: this.$route.query.placeholder || this.$t('searchTopics'),
      deleteCode: this.$route.query.deleteCode || '',
      keyWordCode: this.$route.query.keyWordCode || '',
      searchsType: this.$route.query.searchsType || 'meeting',
      currentTab: this.$route.query.currentNav ? this.$route.query.currentNav : 0 // 0：未完成，1：已完成，2：待审核
    }
  },
  // directives: {
  //   focus: {
  //   // 指令的定义
  //     insertedinsertedinserted: function (el) {
  //       el.focus()
  //     }
  //   }
  // },
  mounted () {
    this.getKeyWordList('keyWord')
    this.$refs.searchsInput.focus()
  },
  methods: {
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
      // 检索返回
      // this.$router.go(-1)
      this.$router.push({
        name: this.searchsType,
        query: {
          currentNav: this.currentTab,
        }
      })
      // this.$emit('getKeyWordDate', '')
    },
    // 搜索
    searchClick () {
      this.$router.push({
        name: this.searchsType,
        query: {
          currentNav: this.currentTab,
          searchsVal: this.inputValue
        }
      })
      // this.$emit('getKeyWordDate', this.inputValue)
    },
    TargetContent (e) {
			// 选中关键词获取会议信息
			// this.$refs.searchsInput.blur() // 为啥键盘抬起要让输入框失去焦点？？？
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.$router.push({
            name: this.searchsType,
            query: {
              currentNav: this.currentTab,
              searchsVal: this.inputValue
            }
          })
          // this.$emit('getKeyWordDate', this.inputValue)
        }
      } else {
        this.$router.push({
          name: this.searchsType,
          query: {
            currentNav: this.currentTab,
            searchsVal: e.target.innerHTML
          }
        })
        // this.$emit('getKeyWordDate', e.target.innerHTML)
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
        message: this.$t('determineClearSearchRecords'), // :: 确定删除所有搜索记录吗?
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
        vm.KeyWordData = []
        vm.isKeyWord = 'noRecord'
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
