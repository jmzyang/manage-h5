<template lang="pug">
  .page-wrap.contacts-box
    .contacts-main
      BarHeader(
        layout="title",
        :back="true",
        :title="scene",
        :backEvent="true",
        @back="handlerBack")
      .contacts-container
        .contacts-main
          commonly(:select-type="selectType")
      CContactsFooter(
        :scene="scene"
        :fixedChosen="fixedChosen"
        :select-type="selectType"
        :business-type="businessType")
</template>
<script>
import { mapState } from 'vuex'

import * as TYPES_COMMON from '@/stores/common/types'
import * as TYPES_MEETING from '@/stores/meeting/types'

import BarHeader from '@/components/c-header'
import commonly from './components/c-commonly/sh_index'
import CContactsFooter from './components/c-footer/sh_index'

import CContactsExternal from './components/c-external'
import CContactsGroup from './components/c-group'
import CContactsOrganization from './components/c-organization'
export default {
  computed: {
    // 当前路由
    tabItemLength () {
      return 0
    },
    ...mapState({
      storeMutationForm (state) {
        // 根据业务类型参数判断
        let result = TYPES_MEETING.M_MEETING_FORM_DATA
        const BUSINESS_TYPE = +state.route.query.businessType
        if (BUSINESS_TYPE === 1) {
          result = TYPES_MEETING.M_MEETING_FORM_DATA_EDIT
        }
        return result
      },
      storeContactsMutation (state) {
        return state.contacts.alias[this.selectType].mutation
      },
      // 已选联系人
      storeContacts (state) {
        return state.contacts[this.selectType]
      }
    })
  },
  data () {
    return {
      // 入参
      scene: this.$route.query.scene || this.$t('contacts'),
      selectType: this.$route.query.selectType,
      fixedChosen: (this.$route.query.fixedChosen ? this.$route.query.fixedChosen.split(',') : []),
      historyType: this.$route.query.historyType,
      businessType: this.$route.query.businessType || 0,
      meetingId: this.$route.query.meetingId || '',
      issueType: this.$route.query.issueType || 0, // 议题类型
      routerSubmit: this.$route.query.routerSubmit || 0, // 议题类型
      navActive: 0,
      selectedVisible: false,
      mask: false
    }
  },
  mounted () {
  },
  components: {
    commonly,    
    BarHeader,
    CContactsFooter,
    CContactsExternal,
    CContactsGroup,
    CContactsOrganization
  },
  beforeDestroy () {
    // 监听退回历史事件
  },
  methods: {
    handlerBack () {
      if(+this.businessType === 5){
        this.$router.go(-1)
      }else{
        this.$Dialog.confirm({
          title: this.$t('tips'),
          message: this.$t('exitOperation'), // :: 确定退出此操作吗？
          showCancelButton: true
        }).then(action => {
          if (action === 'confirm') {
            this.$store.commit(this.storeContactsMutation, {
              type: 'clear'
            })
            this.routerBack()
          }
        })
      }
    },
    routerBack () {
      if (+this.businessType === 0 || +this.businessType === 1 || +this.businessType === 3) {
        // 创会、修改会议、会议控制
        if (+this.issueType === 2 || +this.issueType === 1) {
          // 议题参会人
          console.log(`ROUTER_SUBMIT`, this.routerSubmit)
          // 路由跳转
          this.$router.push({
            name: this.routerSubmit,
            query: {
              selected: true, // 是否已经选过了
              ...this.$route.query
            }
          })
        }else{
          // 清空vuex状态管理器内的数据
          this.$store.commit(this.storeContactsMutation, {
            type: 'clear'
          })
          // 路由跳转
          switch (+this.businessType) {
            case 0:
              // 创会
              this.$router.replace({
                name: 'meeting.create'
              })
              break
            case 1:
              // 修改会议
              this.$router.replace({
                name: 'meeting.edit',
                params: {
                  meetingId: this.meetingId
                }
              })
              break
            case 3:
              // 会控
              this.$router.push({
                name: 'meeting-control',
                query: {
                  meetingId: this.$route.query.meetingId,// 会议ID
                  platId: this.$route.query.platId,// 什么什么ID
                  meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地

                  founderName: this.$route.query.founderName,
                  unread: this.$route.query.unread,
                  listType: this.$route.query.listType,
                  currentNav: this.$route.query.currentNav,
                  Jurisdiction: this.$route.query.Jurisdiction,
                  waterType: this.$route.query.waterType
                }
              })
              break
            default:
              this.$router.go(-1)
              break
          }
        }
      }else{
        this.$router.go(-1)
      }
    },
    goContactsRouter (_type) {
      switch (_type) {
        // 组织机构
        case 1:
          this.$router.push({
            name: 'contacts.organization',
            query: this.$route.query
          })
          break

        // 外部联系人
        case 2:
          this.$router.push({
            name: 'contacts.external',
            query: this.$route.query
          })
          break

        // 自定义组
        case 3:
          this.$router.push({
            name: 'contacts.group',
            query: this.$route.query
          })
          break

        default:
          break
      }
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
