<template lang="pug">
  .c-add-grounp-container
    BarHeader(
      layout="title",
      :back="true",
      :backEvent="true",
      @back="handlerBack")
      | {{pageTitle}}
    .c-add-grounp-box
      .add-grounp-head
        .group-item-icon
        .group-item-label(:class="{'font-color':grounpTitle}") {{grounpTitle ? grounpTitle : $t('unnamed')}}
      .add-grounp-main
        .grounp-name(:class="{'font-color':grounpTitle}")
          span {{$t('groupName')}}
          //- 组名称
          input(
            v-model="grounpTitle",
            :placeholder="$t('inputName')"
            @input="inputMonitor"
          )
          //- 请输入名称
        .grounp-personnel-box
          .personnel-head-box
            span {{$t('groupMembers')}}
            //- 组成员
            span {{storeContacts.total}}/50{{$t('people')}}
          .personnel-list-box
            Scroll
              .personnel-list(v-for="(item,index) in storeContacts.member" :key="index")
                .group-item-icon
                  i.iconfont.icon-delete.delete-personnel(@click="deletePersonnel(item)" v-show="deletState")
                  img(:src="baseUrl + item.USER_ICON" @onload="iconLoad(index)" v-if="iconLoadSuccess.indexOf(index) > -1")
                  span(v-else) {{item.USER_NAME ? item.USER_NAME.substring(item.USER_NAME.length - 2, item.USER_NAME.length) : item.USER_NAME}}
                .group-item-label {{item.USER_NAME}}
              .personnel-list(@click="addPersonnel")
                .group-item-icon.add-group
                  i.iconfont.icon-group-add
              .personnel-list(@click="deletState = deletState ? false : true" v-show="storeContacts.total > 0")
                .group-item-icon.delet-group
                  i.iconfont.icon-group-reduce
        .grounp-submit-box
          van-button(type="default" :disabled="grounpTitle.length < 1 || storeContacts.total < 1 || storeContacts.total > 50" @click="submit") {{$t('submit')}}
          //- 提交
</template>
<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/contacts/types'
import * as TYPES_MEETING from '@/stores/meeting/types'
import { getDataByKey } from '@/utils/array'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'
import storage from 'store'
export default {
  name: 'CContactsExternalAdd',
  computed: {
    ...mapState({
      // 联系人
      storeContacts (state) {
        return state.contacts.customGroup
      }
    })
  },
  watch: {
    
  },
  components: {
    BarHeader,
    Scroll
  },
  data () {
    return {
      baseUrl: window.location.protocol + '//' + window.location.host + '/fileServer/', //重新配置地址
      pageTitle: this.$route.query.addGroupTitle, // 页面标题
      grounpTitle: storage.get('EDIT_GROUP_NAME') || '', // 组名称
      submitState: true, // 提交状态
      iconLoadSuccess: [], // 头像加载成功
      contactsData: [], // 组成员
      deletState: false // 删除人员状态
    }
  },
  created () {
    if(this.$route.query.groupId && this.$route.params.channel === 'edit'){
      this.fetchData()
    }
  },
  methods: {
    // 获取组成员
    async fetchData () {
      let vm = this
      vm.loading = true
      let result = await vm.$ajaxRequest({
        service: 'M4002008',
        GROUP_ID: this.$route.query.groupId,
        Number: 1,
        page: 1,
        pagecount: 1000,
        mask: false
      }, ()=> {
        vm.loading = false
      })
      if (result.code === '0') {
        let contactsData = this.transformDataFormat(result['data'])
        this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
          type: 'assign',
          value: {
            organization: [],
            member: contactsData,
            total: contactsData.length
          }
        })
      } else {
        vm.$Notify({message:result.msg});
      }

    },
    transformDataFormat (_data) {
      let result = []
      _data.forEach((item)=> {
        result.push({
          disabled: false,
          checked: true,
          CONTACTS_TYPE: item.CONTACTS_TYPE,
          EMAIL: item.EMAIL,
          MOBILE: item.MOBILE,
          USER_CODE: item.CONTACTS_USER_CODE,
          USER_NAME: item.USER_NAME
        })
      })
      return result
    },
    // 退出页面
    handlerBack () {
      if(this.grounpTitle.length > 0 || this.storeContacts.total > 0){
        this.$Dialog.confirm({
          title: this.$t('tips'),
          message: this.$t('exitOperation'), // :: 确定退出此操作吗？
          showCancelButton: true
        }).then(action => {
          this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
            type: 'clear'
          })
          storage.set('EDIT_GROUP_NAME', this.$route.query.groupName)
          this.$router.go(-1)
        })
      }else{
        this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
          type: 'clear'
        })
        storage.set('EDIT_GROUP_NAME', this.$route.query.groupName)
        this.$router.go(-1)
      }
    },
    // 监听组名称输入
    inputMonitor () {
      if(this.grounpTitle.match(/^[ ]*$/) != null) {
        this.grounpTitle = ''
      }
    },
    // 添加组成员
    addPersonnel () {
      this.$store.commit(TYPES_CONTACTS['M_PARTICIPANTS_ISSUE'], {
        type: 'assign',
        value: this.storeContacts.member
      })
      storage.set('EDIT_GROUP_NAME', this.grounpTitle)
      this.$router.push({
        name: 'contacts',
        query: {
          scene: this.$t('organizational'), // 组织机构
          selectType: 'participantsIssue',
          key: 'participants',
          historyType: '2, 3',
          businessType: 5
        }
      })
    },
    // 删除组员
    deletePersonnel (_data) {
      this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
        type: 'delete',
        value: [_data]
      })
    },
    // 提交组创建
    async submit () {
      let contacts = this.storeContacts.member
      // 转换数据结构
      contacts = contacts.map((item) => {
        item.CONTACTS_USER_CODE = item.USER_CODE
        item.USER_CODE_TYPE = item.CONTACTS_TYPE || '0'
        return item
      })
      // [{CONTACTS_USER_CODE:联系人编号,USER_CODE_TYPE:联系人类型},{{CONTACTS_USER_CODE:联系人编号,USER_CODE_TYPE:联系人类型}}]
      let result = await this.$ajaxRequest({
        service: 'M4002006',
        GROUP_NAME: this.grounpTitle,
        GROUP_ID: this.$route.query.groupId,
        LIST: JSON.stringify(contacts)
      })

      if (result.code === '0') {
        this.$notify({
          message: this.$route.query.groupId ? this.$t('modifyGroupSuccess') : this.$t('createGroupSuccess'), // 修改/创建自定义组成功
          background: '#1989fa'
        })
        this.$store.commit(TYPES_CONTACTS['M_CUSTOM_GROUP'], {
          type: 'clear'
        })
        storage.set('EDIT_GROUP_NAME', this.grounpTitle)
        this.$router.go(-1)
      } else {
        this.$notify(result.msg)
      } 
    },
    // 头像加载成功
    iconLoad (index) {
      this.$set(this.iconLoadSuccess, this.iconLoadSuccess.length, index)
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl'
</style>
