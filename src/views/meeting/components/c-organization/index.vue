<template lang="pug">
  .org-wrap(v-loading="$store.state.meeting.isLoadingOrganozation" :loading-text="$t('loading')")
    BarHeader(layout="default" v-if="showSearch")
      .search-input(@click="toSearch")
        i(class="iconfont icon-search")
        span {{$t('searchOrganization')}}
        //- :: 搜索机构或人员姓名、电话、邮箱
    Scroll.org-scroll
      .org-con
        OrgCard(v-for="item in orgRoot" :key="item.ORG_ID" :org-info="item" :select-type="selectType" :fixedChosen="fixedChosen")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_COMMON from '@/stores/common/types'
import OrgCard from './c-org-card'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
export default {
  // props: ['selectType', 'historyType'],
  props: {
    selectType: {
      type: String
    },
    historyType: {
      type: String
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控，4：转授权
    businessType: {
      type: [String, Number],
      default: 0
    },
    // 转授权功能禁止删除人员
    fixedChosen: {
      type: [Array],
      default: () => { return [] }
    }
  },
  computed: {
    ...mapState({
      orgRoot () {
        let result = this.$store.state.common.orgList || []
        return result.filter((item, index) => item.PAR_ORG === '0')
      }
    })
  },
  data () {
    return {
      // searchsState: false
    }
  },
  created () {
    // 获取最新组织机构
    this.$store.dispatch(TYPES_COMMON.A_ORG_LIST)
  },
  methods: {
    toSearch () {
      if (+this.businessType === 0) {
        this.$router.push({
          name: 'meeting.create.create-search-org',
          params: {
            placeholder: this.$t('searchOrganization'), // :: 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // :: 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // :: 找组织
                wayCode: 2
              }
            ],
            resultVue: 'SearchResult',
            historyType: this.historyType,
            edt: true,
            meetinngId: this.$route.params.meetinngId
          }
        })
      } else if (+this.businessType === 1) {
        this.$router.push({
          name: 'meeting.edt.create-search-org',
          params: {
            placeholder: this.$t('searchOrganization'), // :: 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // :: 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // :: 找组织
                wayCode: 2
              }
            ],
            resultVue: 'SearchResult',
            historyType: this.historyType
          }
        })
      }else if(+this.businessType === 4){
        this.$router.push({
          name: 'meetingPersonnelDetails.search',
          params: {
            placeholder: this.$t('searchOrganization'), // :: 搜索机构或人员姓名、电话、邮箱
            selectType: this.selectType,
            searchWays: [
              {
                wayName: this.$t('seekSb'), // :: 找人
                wayCode: 1
              },
              {
                wayName: this.$t('seekOrganization'), // :: 找组织
                wayCode: 2
              }
            ],
            resultVue: 'SearchResult',
            historyType: this.historyType
          }
        })
      }
    }
  },
  components: {
    OrgCard,
    BarHeader,
    Scroll
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
