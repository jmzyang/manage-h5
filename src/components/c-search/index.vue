<template lang="pug">
  .c-search-wrap
    .header
      .input-content
        i(class="iconfont icon-search")
        input(
          :placeholder="placeholderTitle",
          v-validate="'required|max:20'",
          maxlength="20" type="search",
          v-model="inputValue",
          @input="inputFocus",
          @keyup="submit",
          ref="searchsInput")
      .icons(@click="cancel")
        | {{$t('cancel')}}
        //- :: 取消
    .main
      .searchs-operation(v-show="isKeyWord !== 'searchs'")
        | {{$t('historySearch')}}
        //- :: 历史搜索
        i(class="iconfont icon-clear" @click="clear")
      .noSearchsRecord(v-show="isKeyWord === 'noRecord'")
        | {{$t('noSearchRecord')}}
        //- :: 暂无查询记录...
      .keyword-list(v-show="isKeyWord === 'keyword'")
        .list-content(v-for="(Kvalue, KIndex) in historyData" @click="submit") {{Kvalue.SEARCH_KEY}}
      .searchs-list(v-show="isKeyWord === 'searchs' && isAssociational")
        .list-content(v-for="(Kvalue, KIndex) in associationalData" @click="submit") {{Kvalue.SEARCH_KEY}}
</template>
<script>
export default {
  name: 'CSearch',
  data () {
    return {
      inputValue: this.keyWord, // 输入框内容
      isKeyWord: 'keyword', // 查询方式
      historyData: [], // 关键词数据
      associationalData: [],// 输入内容模糊查询数据
      placeholderTitle: this.placeholder || this.$t('searchTopics')
    }
  },
  props: {
    placeholder: {
      type: [String],
      default: ''
    },
    // 关键词
    keyWord: {
      type: [String],
      default: ''
    },
    // 是否需要实时联想词
    isAssociational: {
      type: [Boolean],
      default: false
    },
    // 获取历史搜索记录
    associationalParams: {
      type: [Object],
      default: () => {}
    },
    // 获取历史搜索记录
    historyParams: {
      type: [Object],
      default: () => {}
    },
    // 删除历史搜索记录
    deleteHistoryParams: {
      type: [Object],
      default: () => {}
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
    // 获取历史搜索记录
    this.fetchHistory()
    this.$refs.searchsInput.focus()
  },
  methods: {
    // 取消
    cancel () {      
      this.$emit('search', '')
    },
    // 获取联想词
    async fetchAssociational () {
      let vm = this
      let result = await vm.$ajaxRequest(this.associationalParams)
      if (result.code === '0' && result.data.length > 0) {
        this.isKeyWord = 'searchs'
        vm.associationalData = result.data
      } else {
        this.isKeyWord = 'noRecord'
      }
    },
    // 获取历史搜索记录
    async fetchHistory () {
      // 获取关键词列表
      let vm = this
      let result = await vm.$ajaxRequest(this.historyParams)
      if (result.code === '0' && result.data.length > 0) {
        vm.historyData = result.data
      } else {
        this.isKeyWord = 'noRecord'
      }
    },
    // 获取关键并回调
    submit (e) {
      console.log(`submit`, e)
			// this.$refs.searchsInput.blur() // 为啥键盘抬起要让输入框失去焦点？？？
      if (e.keyCode) {
        if (e.keyCode === 13) {
          this.$emit('search', this.inputValue)
        }
      } else {
        this.$emit('search', e.target.innerHTML)
      }
    },
    // input监听
    inputFocus (e) {
      console.log(`inputFocus`, e)
      // vm.inputValue = e.detail.value;
      // vm.$data.inputValue = this.inputValue;
      if (!this.inputValue || this.inputValue.match(/^[ ]*$/)) {
        if (this.historyData.length > 0) {
          this.isKeyWord = 'keyword'
        } else {
          this.isKeyWord = 'noRecord'
        }
      } else {
        this.isAssociational && this.fetchAssociational()
      }
    },
    // 清除文本输入框
    clear () {
      let vm = this
      if (vm.historyData.length < 1) {
        return false
      }
      vm.$Dialog.confirm({
        title: this.$t('tips'), 
        message: this.$t('determineClearSearchRecords'), // :: 确定删除所有搜索记录吗?
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {
          vm.deleteHistoryRecord()
        }
      }).catch((e)=> {
        // nothing
      })
    },
    async deleteHistoryRecord () {
      // 删除搜索关键词记录
      let vm = this
      let result = await vm.$ajaxRequest(this.deleteHistoryParams)
      if (result.code === '0' && result.data.length > 0) {
        vm.historyData = []
        vm.isKeyWord = 'noRecord'
      }
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
