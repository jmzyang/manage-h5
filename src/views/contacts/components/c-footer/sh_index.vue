<template lang="pug">
.actions-footer
  .actions
    .submit(@click.stop="submit", style={'width': '100%'}) {{$t('determine')}}
    //- 确定
  CContactsSelected(
    v-show="selectedVisible"
    :scene="sceneVal"
    @submit="submit"
    @close="selectedVisible = false"
    :select-type="selectType"
    :business-type="businessType")
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as TYPES_MEETING from '@/stores/meeting/types'

import CContactsSelected from '../c-selected/sh_index'

export default {
  name: 'CContactsFooter',
  props: {
    transition: {
      type: [Array],
      default: ()=> ['slide', 'slideInUp', 'slideOutDown']
    },
    // 场景名称
    scene: {
      type: String,
      default: ''
    },
    selectType: {
      type: String,
      default: 'members'
    },
    // 转授权功能禁止删除人员
    fixedChosen: {
      type: [Array],
      default: () => []
    }
  },
  computed: {
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
      storeMutation (state) {
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
      businessType: this.$route.query.businessType || 0, // 0：创会 1：修改会议, 2: 会场, 3: 会控, 4：转授权
      meetingId: this.$route.query.meetingId || '',
      routerSubmit: this.$route.query.routerSubmit || '', // 指向跳转路由
      issueType: this.$route.query.issueType || 0, // 议题类型
      selectedVisible: false,
      sceneVal: this.scene || this.$t('contacts') // 联系人
    }
  },
  components: {
    CContactsSelected
  },
  methods: {
    // 确定， 逻辑待优化
    submit () { 
      if(+this.businessType === 5 && this.storeContacts.total > 50){
        this.$Notify({ message: this.$t('noMoreThan50Members') }) // 组员不能超过50人！
        return false
      }     
      let CONTACTS_VALUE = {}
      CONTACTS_VALUE[this.selectType] = this.storeContacts // 赋值已选人
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
      } else {
        // 会议主持人、参会人
        const MUTAION_MEETING = 
        this.$store.commit(TYPES_MEETING[this.storeMutationForm], {
          type: 'assign',
          value: {
            ...CONTACTS_VALUE
          }
        })
        // 清空vuex状态管理器内的数据
        this.$store.commit(this.storeMutation, {
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
            // 会议控制
            if (CONTACTS_VALUE[this.selectType].total < 1 && this.selectType === 'participantsIssue') {
              this.$Notify({ message: this.$t('meetingsNeedParticipants') }) // 会议不可没有参会人！
            } else {
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
                  Jurisdiction: this.$route.query.Jurisdiction, // 权限
                  waterType: this.$route.query.waterType // 参会转移
                },
                params: {
                  meetingAttendee: CONTACTS_VALUE[this.selectType],
                  leaderNumber: this.$route.query.leaderNumber,
                  meetingAttendeeType: this.selectType
                }
              })
            }
            break
          case 4:
            // 权限转移
            if (CONTACTS_VALUE[this.selectType].total < 1) {
              this.$Notify({ message: this.$t('noAuthorizerSelected') }) // 请选择至少一位被授权人！
            } else {
              this.$router.push({
                name: 'meeting-details',
                query: {
                  meetingId: this.$route.query.meetingId,// 会议ID
                  founderName: this.$route.query.founderName,
                  unread: this.$route.query.unread,
                  listType: this.$route.query.listType,
                  currentNav: this.$route.query.currentNav,
                  Jurisdiction: this.$route.query.Jurisdiction, // 权限
                  waterType: this.$route.query.waterType // 参会转移
                },
                params: {
                  authorizer: CONTACTS_VALUE[this.selectType]
                }
              })
            }
            break
          case 5:
            console.log(this.$route.name)
            // 添加自定义组
            this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
              type: 'assign',
              value: CONTACTS_VALUE[this.selectType]
            })
            if(this.$route.name === 'contacts'){
              this.$router.go(-1)
              // this.$router.push({name: 'contacts.group.add'})
            }{
              this.$router.push({name: 'contacts.group.add'})
              this.$router.go(-2)
            }
            break
          case 6:
            if (CONTACTS_VALUE[this.selectType].total < 1) {
              this.$Notify({ message: this.$t('noAuthorizerSelected') }) // 请选择至少一位被授权人！
            } else {
              this.$router.push({
                name: 'meeting-details',
                query: { // 加载会议详情
                  meetingId: this.$route.query.meetingId, // 会议ID
                  founderName: this.$route.query.founderName, // 创会人名称
                  unread: this.$route.query.unread, // 1：已读，0：未读
                  listType: this.$route.query.listType, // 列表类型
                  currentNav: this.$route.query.currentNav, // 列表位置
                  Jurisdiction: this.$route.query.Jurisdiction, // 权限
                  waterType: this.$route.query.waterType // 参会转移
                },
                params: {
                  agent: CONTACTS_VALUE[this.selectType]
                }
              })
            }
            
            break
          default:
            break
        }
      }
    }
  }
}
</script>
<style scoped lang="stylus">
@import './index.styl'
</style>
