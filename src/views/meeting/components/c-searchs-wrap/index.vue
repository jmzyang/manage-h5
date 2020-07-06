<template lang="pug">
  Search(:placeholder="$route.params.placeholder" @search="search" v-if="isBefore")
  .searchs-content(v-else)
    SearchResult(:placeholder="$route.params.placeholder" :params="params" @back="resultBack" v-if="$route.params.resultVue==='SearchResult'")
    SearchResultOutSide(:placeholder="$route.params.placeholder" :params="params" @back="resultBack" v-if="$route.params.resultVue==='SearchResultOutSide'")
    SearchResultCustomGroup(:placeholder="$route.params.placeholder" :params="params" @back="resultBack" v-if="$route.params.resultVue==='SearchResultCustomGroup'")
</template>

<script>
import Search from './components/c-searchs'
import SearchResult from './components/c-search-result'
import SearchResultOutSide from './components/c-search-result/c-search-result-outside'
import SearchResultCustomGroup from './components/c-search-result/c-search-result-group'
export default {
  components: {
    Search,
    SearchResult,
    SearchResultOutSide,
    SearchResultCustomGroup
  },
  created () {
  },
  data () {
    return {
      isBefore: true,
      params: {}
    }
  },
  methods: {
    search (params) {
      this.isBefore = false
      this.params = params
    },
    resultBack () { // 从搜索结果返回来
      this.isBefore = true
    }
  }
}
</script>
<style lang="stylus">
  @import 'index.styl'
</style>
