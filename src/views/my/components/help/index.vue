<template lang="pug">
  LayoutPage
    template(slot="left")
      LeftHeader(
        layout="title"
        :title="$route.query.title"
        :style="{'boxShadow':'0px 4px 8px 0px rgba(100,120,160,0.05)'}"
        :back="true")
      .help-container
        h2.help-title {{$t('commonProblem')}}
        //- :: 常见问题
        .help-main
          p.question(@click="collapseChange(1)") {{$t('question1')}}
          p.question(@click="collapseChange(2)") {{$t('question2')}}
          p.question(@click="collapseChange(3)") {{$t('question3')}}
</template>
<script>
import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
export default {
  components: {
    LayoutPage,
    LeftHeader: BarHeader
  },
  methods:{
    collapseChange(val) {
      this.$router.push({
        name:'my.help.problemDetails',
        query: {
          title:this.$t('commonProblem'),
          number: val
        }
      })
    }
  }
}
</script>
<style scoped lang="stylus">
@import './index.styl'
</style>
