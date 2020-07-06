<template lang="pug">
  .org-card
    .title
      van-checkbox(v-model="checkedAll" :disabled="!hasMumber") {{ orgInfo.ORG_CODE_NAME }}
      .toggle(@click="active=!active")
        i.iconfont.icon-arrow-right.title-arrow(:class="{active:active}")
    .list(:class="{active:active}")
      OrgCard(v-for="item in childOrg" ref="childOrgList" :select-type="selectType" @checkall="checkall" :org-info="item" :setCheckedAll="childCheckedAll[item.ORG_ID]")
      .list-item(v-for="(item,index) in mumberList" :key="item.USER_CODE")
        van-checkbox(v-model="checkeds[item.USER_CODE]" :name="item.USER_CODE" @change="changeMumber(item,$event)")
          .check-lable
            img.icon(:src="item.USER_ICON?`/fileServer/userIcon/${item.USER_ICON}`:'~@res/placeholder/avatar.png'")
            .base-info
              .name {{ item.USER_NAME }}
              .job {{ item.MAIN_ROLE_NAME }}
            .phone {{ item.MOBILE }}
            .email {{ item.EMAIL }}
</template>
<script>
export default {
  name: 'OrgCard',
  components: {

  },
  props: ['orgInfo', 'selectType', 'setCheckedAll', 'fixedChosen'],
  data () {
    return {
      active: true, // 是否展开
      isLoading: false, // 是否正在加载当前节点上的所有成员
      isLoadComplete: false, // 是否加载完成当前节点上的所有成员
      mumberList: [], // 当前组织成员列表
      checkeds: {},	// 每个成员的选中状态集合
      orgCheckeds: {}, // 组织机构完成全选的情况
			childCheckedAll: {} // 让子节点全选
    }
  },
  created () {
    this.loadingMumber()
  },
  methods: {
    changeMumber (user, isSelected) {
      this.$store.commit(this.$store.state.meeting.selectAddress[this.selectType].mutations, {
        type: isSelected ? 1 : 2,
        value: user
      })
      // 转授权管理如果该用户不可删除选中则回选
      if (!isSelected && this.fixedChosen && this.fixedChosen.indexOf(user.USER_CODE) > -1) {
        this.$store.commit(this.$store.state.meeting.selectAddress[this.selectType].mutations, {
          type: 1,
          value: user
        })
      }
    },
		checkall (isCheckAll, org) { // 全选事件绑定函数; isCheckAll:true 表示该子机构完成了全选
			this.$set(this.orgCheckeds, org.ORG_ID, isCheckAll)
    },
    loadingMumber (callBack) {
      if (!this.isLoading) {
        this.isLoading = true
        this.$store.commit('M_IS_LOADING_ORGANIZATION', true)
        this.$ajaxRequest([{
          ORG_ID: this.orgInfo.ORG_ID,
          page: 1,
          pagecount: 9999,
          pageoffset: 1,
          rows: 9999,
          service: 'U2001808',
          mask: false
        }]).then((res) => {
          this.$store.commit('M_IS_LOADING_ORGANIZATION', false)
          if (res.code === '0') {
            this.isLoadComplete = true
            res.data.forEach((item) => {
              // let isSelected = this.selectedMembers.indexOf(item.USER_CODE) > -1
              let isSelected = this.$store.state.meeting[this.selectType].some((user) => {
                return user.USER_CODE === item.USER_CODE && user.CONTACTS_TYPE === item.CONTACTS_TYPE
              })
              this.$set(this.mumberList, this.mumberList.length, item)
              this.$set(this.checkeds, item.USER_CODE, isSelected)
            })
          } else {
            this.isLoading = false
          }
          callBack && callBack()
        }).catch((err) => {
          console.log(err)
          this.$store.commit('M_IS_LOADING_ORGANIZATION', false)
          this.isLoading = false
        })
      }
    },
    setCheckedAllMethod (val) {
      if (this.isLoadComplete) {
        this.setCheckedAllChildMethod(val)
      } else {
        this.loadingMumber(() => {
          this.setCheckedAllChildMethod(val)
        })
      }
    },
    setCheckedAllChildMethod (isCheckAll) {
			this.$store.commit('M_IS_LOADING_ORGANIZATION', true)
			setTimeout(()=>{
				this.$nextTick(()=>{
					this.mumberList.forEach((user) => {
						this.$store.commit(this.$store.state.meeting.selectAddress[this.selectType].mutations, {
							type: isCheckAll ? 1 : 2,
							value: user
						})
					})
					this.$nextTick(() => { // 让所有的子节点更新是否全选
						for (let attr in this.childCheckedAll) {
							this.childCheckedAll[attr] = isCheckAll
						}
						this.$nextTick(() => {
							this.$refs.childOrgList && this.$refs.childOrgList.forEach((childOrg) => {
								childOrg.setCheckedAllMethod(childOrg.setCheckedAll)
							})
						})
					})
					this.$nextTick(()=>{
						this.$store.commit('M_IS_LOADING_ORGANIZATION', false)
					})
				})
			},0)
    }
  },
  computed: {
    childOrg () { // 当前节点的子节点
      return this.$store.state.common.orgList.filter((item, index) => {
        this.$set(this.childCheckedAll, item.ORG_ID, false)
        return item.PAR_ORG === this.orgInfo.ORG_ID
      })
    },
    selectedMembers () { // 选中的成员
      return this.$store.state.meeting[this.selectType]
    },
    checkedAll: {
      set (val) {
        this.setCheckedAllMethod(val)
      },
      get () {
        if (this.isLoadComplete) {
          let checkallmumber = true
          for (let attr in this.checkeds) {
            if (!this.checkeds[attr]) {
              checkallmumber = false
              break
            }
          }
          let checkallorg = this.childOrg.every((item) => {
            return this.orgCheckeds[item.ORG_ID]
          })
          let checkAll = checkallmumber && checkallorg
          if (this.hasMumber) {
            this.$nextTick(() => {
              this.$emit('checkall', checkAll, this.orgInfo)
            })
            return checkAll
          } else {
            this.$nextTick(() => {
              this.$emit('checkall', true, this.orgInfo)
            })
            return false
          }
        } else {
          return false
        }
      }
    },
    hasMumber () { // 该组织节点下是否有成员
      return parseInt(this.orgInfo.COUNT) > 0
    }
  },
  watch: {
    active (val) {
      if (val) {
        this.loadingMumber()
      }
    },
    selectedMembers (selected) {
      // this.checkeds = {}
      this.mumberList.forEach((item) => {
        // let isSelected = selected.indexOf(item.USER_CODE) > -1
        let isSelected = this.$store.state.meeting[this.selectType].some((user) => {
          return item.USER_CODE === user.USER_CODE && item.CONTACTS_TYPE === user.CONTACTS_TYPE
        })
        this.$set(this.checkeds, item.USER_CODE, isSelected)
      })
    }
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
