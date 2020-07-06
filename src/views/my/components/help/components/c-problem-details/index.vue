<template lang="pug">
  LayoutPage
    template(slot="left")
      LeftHeader(
        layout="title"
        :title="$route.query.title"
        :style="{'boxShadow':'0px 4px 8px 0px rgba(100,120,160,0.05)'}"
        :back="true")
      keep-alive
        .problem(v-if="$route.query.number == 1")
          h2.problem-title {{$t('question1')}}
          p.help-content {{$t('answer11')}}
          p.help-content {{$t('answer12')}}
          p.help-content {{$t('answer13')}}
          p.help-content {{$t('answer14')}}
          p.help-content {{$t('answer15')}}
        .problem(v-else-if="$route.query.number == 2")
          h2.problem-title {{$t('question2')}}
          p.help-content {{$t('answer21')}}
            img(src="~@/assets/images/public/helpProblem21.png")
          p.help-content {{$t('answer22')}}
        .problem(v-else-if="$route.query.number == 3")
          h2.problem-title {{$t('question3')}}
          p.help-content {{$t('answer31')}}
          p.help-content-title {{$t('answer32')}}
          p.help-content {{$t('answer33')}}
            img(class="img31" src="~@/assets/images/public/helpProblem31.jpg")
          p.help-content {{$t('answer34')}}
          p.help-content {{$t('answer35')}}
          p.help-content-title {{$t('answer36')}}
          p.help-content {{$t('answer37')}}
            img(class="img32" src="~@/assets/images/public/helpProblem32.png")
          p.help-content {{$t('answer38')}}
            img(class="img33" src="~@/assets/images/public/helpProblem33.png")
          p.help-content {{$t('answer39')}}
        .problem(v-else)
          p.help-content {{$t('noFeedback')}}
</template>
<script>
import LayoutPage from '@/components/c-layout'
import BarHeader from '@/components/c-header'
export default {
  components: {
    LayoutPage,
    LeftHeader: BarHeader
  },
}
</script>
<style scoped lang="stylus">
@import './index.styl'
</style>
