<template lang="pug">
  .wrap-search-meeting
    Search(:placeholder="$route.params.placeholder" @search="search" v-if="isBefore")
    SearchResult(:placeholder="$route.params.placeholder" :params="params" @back="resultBack" v-else)
</template>

<script>
import Search from './components/c-searchs/index'
import SearchResult from './components/c-search-result/c-search-result-meeting'
export default {
  components: {
    Search,
    SearchResult
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
<style lang="stylus" scoped>
  @import 'c-search-meeting.styl'
</style>
