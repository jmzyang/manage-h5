<template lang="pug">
  .custom-group
    .search-group-mumber(
      v-show="$route.name === 'meeting.create.create-search-org.search' || $route.name === 'meeting.edt.create-search-org.search'")
      router-view
    .select-custom-group-mumber(v-if="showSelect")
      BarHeader(layout="default")
        .back(@click="showSelect=false")
          i.iconfont.icon-arrow-left.arrow-left {{$t('return')}}
          //- 返回
        .search-topics {{$t('addingMembers')}}
        //- :: 添加组员
        .search-input(@click="toSearch")
          i(class="iconfont icon-search")
          span {{$t('searchContacts')}}
          //- :: 搜索联系人
        .sure(@click="showSelect = false") {{$t('determine')}}({{ storeContacts.total }})
        //- :: 确定
      .tab
        .tab-item(:class="{active:tab === 1}" @click="tab=1") {{$t('organizational')}}
        //- :: 组织机构
        .tab-item(:class="{active:tab === 2}" @click="tab=2") {{$t('externalContacts')}}
        //- :: 外部联系人
      keep-alive
        CContactsEnterprise(select-type="customGroupMember" :show-search="false" v-if="tab === 1")
        ExentContact(selecttype="customGroupMember" :show-search="false" v-if="tab === 2")
    BarHeader(layout="default")
      .back(@click="back()")
        i.iconfont.icon-arrow-left.arrow-left {{$t('return')}}
        //- 返回
      .title {{title}}
      .sure(@click="sure()" v-loading.fullscreen.lock="fullscreenLoading")
        | {{$t('preservation')}}
        //- :: 保存
    .room-container
      Scroll.add-group-main
        .title {{$t('customGroupName')}}
        //- :: 自定义组名称
        textarea.con(:placeholder="$t('inputName')", v-model="info",maxlength="30," v-validate="'required|max:30'", name="info", :data-vv-as="$t('customGroupName')" ref="addInfo")
        span.tips {{ errors.first('info')||''}}
        .title.imgtitle {{$t('addingMembers')}} ({{ storeContacts.total }})
        //- :: 添加组员
        .imglist
          .imgitem(v-for="item in storeContacts.organization") {{item.ORG_NAME}}
            i.iconfont.icon-delete.del(@click="delOne(item)")
          .imgitem(v-for="item in storeContacts.member") {{item.USER_NAME}}
            i.iconfont.icon-delete.del(@click="delOne(item)")
          a.imgitem.addImg(@click="add") +
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as UTILS_CONTACTS from '@/stores/contacts/utils'

import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
// import Organization from '../c-organization'
import CContactsEnterprise from '@/components/c-contacts-enterprise'
import ExentContact from '../c-choose-contacts/components/c-external/c-choose-existing'
export default {  
  data () {
    return {
      num: 0,
      info: '',
      tab: 1,
      showSelect: false,
      edt: false,
      fullscreenLoading: false,
      groupId: ''
    }
  },
  computed: {
    title () {
      let result = this.$t('addCustomGroups') // :: 添加自定义组
      if (this.$route.params.groupId !== 'new') {
        result = this.$t('modifyCustomGroups') // :: 修改自定义组
      }
      return result
    },
    ...mapState({
      storeMutation (state) {
        return state.contacts.alias[this.$route.params.selectType || 'customGroupMember'].mutation
      },
      // 联系人
      storeContacts (state) {
        return state.contacts[state.contacts.alias[this.$route.params.selectType || 'customGroupMember'].state]
      }
    })
  },
  created () {
    // this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
    //   type: 'clear'
    // })
    if (this.$route.params.groupId === 'new') { // 新建一个自定义组

    } else {
      this.edt = true
      this.groupId = this.$route.params.groupId
      this.queryByGroupId()
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
    },
    async sure () {
      this.fullscreenLoading = true
      this.$validator.validateAll().then(async (result) => {
        if (result) {
          if (!this.storeContacts.total) {
            this.$notify(this.$t('addCustomGroupMembers')) // :: 请添加自定义组组员！
            this.fullscreenLoading = false
            return
          }

          // 获取成员
          let contacts = await UTILS_CONTACTS.getMembers(this.storeContacts)
          // 转换数据结构
          contacts = contacts.map((item) => {
            item.CONTACTS_USER_CODE = item.USER_CODE
            item.USER_CODE_TYPE = item.CONTACTS_TYPE || '0'
            return item
          })

          // [{CONTACTS_USER_CODE:联系人编号,USER_CODE_TYPE:联系人类型},{{CONTACTS_USER_CODE:联系人编号,USER_CODE_TYPE:联系人类型}}]
          let result = await this.$ajaxRequest({
            service: 'M4002006',
            GROUP_NAME: this.info,
            GROUP_ID: this.groupId,
            mask: false,
            LIST: JSON.stringify(contacts)
          })

          if (result.code === '0') {
            this.fullscreenLoading = false
            this.$notify({
              message: this.edt ? this.$t('modifyGroupSuccess') : this.$t('createGroupSuccess'), // :: 修改自定义组成功，创建自定义组成功
              background: '#1989fa'
            })
            this.$router.go(-1)
          } else {
            this.fullscreenLoading = false
            this.$notify(result.msg)
          }
        }
        this.fullscreenLoading = false
      })
    },
    delOne (item) {
      this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
        type: 'delete',
        value: [item]
      })
    },
    add () {
			this.$refs.addInfo.blur()
			this.showSelect = true
    },
    queryByGroupId () {
      if (this.groupId) {
        this.$ajaxRequest([{
          service: 'M4002008',
          GROUP_ID: this.groupId,
          Number: 1,
          page: 1,
          pagecount: 1000,
          mask: false
        }]).then((result) => {
          if (result.code === '0') {
            this.info = result.data[0].GROUP_NAME
            this.$store.commit(TYPES_CONTACTS[this.storeMutation], {
              type: 'concat',
              value: this.transformDataFormat(result.data)
            })
          }
        })
      }
    },
    toSearch () {
      let toRoute = 'meeting.create.create-search-org.search'
      if (+this.$route.params.businessType === 1) {
        toRoute = 'meeting.edt.create-search-org.search'
      }
      this.$router.push({
        name: toRoute,
        params: {
          placeholder: this.$t('searchOrganization'), // :: 搜索组织、姓名、电话、邮箱
          selectType: this.selectType,
          searchWays: [
            {
              wayName:  this.$t('findInsiders'), // :: 找内部人
              wayCode: 1
            },
            {
              wayName: this.$t('findOrganization'), // :: 找组织
              wayCode: 2
            },
            {
              wayName: this.$t('findOutsiders'), // :: 找外部人
              wayCode: 3
            }
          ],
          resultVue: 'SearchResultCustomGroup',
          historyType: '7,8,9'
        }
      })
    },
    transformDataFormat (_data, _isCheckAll) {
      let result = []
      _data.forEach((item)=> {
        result.push({
          CONTACTS_TYPE: item.CONTACTS_TYPE,
          EMAIL: item.EMAIL,
          MOBILE: item.MOBILE,
          USER_CODE: item.CONTACTS_USER_CODE,
          USER_NAME: item.USER_NAME
        })
      })
      return result
    }
  },  
  components: {
    BarHeader,
    Scroll,
    CContactsEnterprise,
    ExentContact
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl'
</style>
