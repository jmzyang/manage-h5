<template lang="pug">
  .contacts-box
    //- .mask(v-show="mask" @click.self="hideDetails")
    //- PersonnelDetails(
    //-   v-show="mask"
    //-   :scene="scene"
    //-   @hide-details="hideDetails"
    //-   :select-type="selectType"
    //-   :business-type="businessType")
    //- .person-details(@click="showDetails()")
    //-   i.iconfont.icon-meeting-attendees.attendees
    //-   span.person-num {{ storeContacts.total }}    
    router-view(v-show="$route.name==='meeting.create.create-search-org' || $route.name === 'meeting.create.external' || $route.name === 'meeting.edt.create-search-org' || $route.name === 'meeting.edt.external'")
    BarHeader(layout="title", :back="true")
      | {{scene}}
    .contacts-nav
      .item(@click.stop="tab = 1")
        .image.organization
        .title {{$t('organizational')}}
        //- :: 组织机构
      .item(@click.stop="tab = 2")
        .image.external
        .title {{$t('externalContacts')}}
        //- :: 外部联系人
      .item(@click.stop="tab = 3")
        .image.group
        .title {{$t('customGroups')}}
        //- :: 自定义组
    .contacts-container
      .contacts-main
        commonly(v-if="tab === 0" :select-type="selectType")
        organization(
          v-else-if="tab === 1"
         :select-type="selectType"
         :history-type="historyType"
         :business-type="businessType")
        external(
          v-else-if="tab === 2"
          :select-type="selectType"
          :business-type="businessType")
        group(
          v-else-if="tab === 3"
           :select-type="selectType"
           :business-type="businessType")
    .actions-footer
      .total
        | {{$t('selected')}}：{{storeContacts.total}}{{$t('PCS')}}
        //- 已选择...个
      .actions
        button.submit {{$t('determine')}}({{storeContacts.total}})
        //- 确定
    //- .tab(
    //-   v-show="$route.name !== 'meeting.create.create-search-org' && $route.name !== 'meeting.edt.create-search-org'"
    //-   :class="{'s2': scene === '主持人'}")
    //-   .tab-item(ref="tabItem" :class="{active:tab === 1}" @click="checkTab(1)" v-if="selectType === 'participants' || selectType === 'participantsEdit' || selectType === 'participantsIssue'") 常用联系人
    //-   .tab-item(ref="tabItem" :class="{active:tab === 2}" @click="checkTab(2)") 组织机构
    //-   .tab-item(ref="tabItem" :class="{active:tab === 3}" @click="checkTab(3)") 自定义组
    //-   .tab-item(ref="tabItem" :class="{active:tab === 4}" @click="checkTab(4)" v-if="selectType === 'participants' || selectType === 'participantsEdit' || selectType === 'participantsIssue'") 外部联系人
    //- .room-container(:style="tab === 2 ? 'padding:0;' : ''" v-show="$route.name !== 'meeting.create.create-search-org' && $route.name!=='meeting.edt.create-search-org'")
    //-   .room-main
    //-     keep-alive
    //-       commonly(v-if="tab === 1" :select-type="selectType")
    //-       organization(v-else-if="tab === 2" :select-type="selectType" :history-type="historyType" :business-type="businessType")
    //-       group(v-else-if="tab === 3 && !($route.name==='meeting.create.create-group' || $route.name === 'meeting.edt.create-group')" :select-type="selectType" :business-type="businessType")
    //-       external(v-else-if="tab === 4" :select-type="selectType" :business-type="businessType")
</template>
<script>
import { mapState } from 'vuex'

import BarHeader from '@/components/c-header'
import commonly from './components/c-commonly'
import organization from './components/c-organization'
import group from './components/c-group'
import external from './components/c-external'
import PersonnelDetails from './components/c-personnel-details'
export default {
  components: {
    commonly,
    organization,
    group,
    BarHeader,
    external,
    PersonnelDetails
  },
  props: {
  },
  computed: {
    // 当前路由
    currentRouter: state => state.route,
    tabItemLength () {
      return 0
    },
    ...mapState({
      // 已选联系人
      storeContacts (state) {
        return state.contacts[state.contacts.alias[this.selectType].state]
      }
    })
  },
  data () {
    return {
      // 入参
      scene: this.$route.query.scene,
      selectType: this.$route.query.selectType,
      historyType: this.$route.query.historyType,
      businessType: this.$route.query.businessType,
      tab: 0,
      mask: false
    }
  },
  mounted () {},
  methods: {
    checkTab (item) {
      this.tab = item
    },
    showDetails () {
      this.mask = true
    },
    hideDetails () {
      this.mask = false
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
