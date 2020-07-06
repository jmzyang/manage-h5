<template lang="pug">
  .input-external-box
    BarHeader(layout="title" :title="$t('addExternalContacts')")
    //- 添加外部联系人
    .input-external-container
      .input-external-main
        form.form
          .input-item.name
            .item-title 姓名
            input.input(placeholder="请输入姓名" maxlength="20" v-model="name | kong" v-validate="'required|max:20'" data-vv-as="姓名" type="text" name="name")
            span.tips {{ errors.first('name')||'' }}
          .input-item.phone
            .item-title 手机号码
            input.input(placeholder="请输入手机号码" maxlength="40" v-model="phone" v-validate="'required|max:20'" data-vv-as="手机号码" type="text" name="phone")
            span.tips {{ errors.first('phone')||'' }}
          .input-item.email
            .item-title 邮箱地址
            input.input(placeholder="请输入邮箱地址" :maxlength="40" v-model="email" v-validate="'required|max:20'" data-vv-as="邮箱地址" type="text" name="email")
            span.tips {{ errors.first('email')||'' }}
          .commit-wrap
            .commit(@click="commit") 提交
        .list-wrap
          .list-title
            .list-title-con
              | 已添加列表
              span.clear-choose(@click="clearChoose") 批量删除
          .list
            .list-item
              van-checkbox(v-model="checked")
                .check-lable
                  img.icon(src="~@res/placeholder/avatar.png")
                  .base-info
                    .name 李涛
                    .job 前端工程师
                  .phone 156022154878
                  .email 8975456454185@ddf.cdf
                  .del(@click.stop="delOne()")
                    i.iconfont.icon-clear
            .list-item
              van-checkbox(v-model="checked")
                .check-lable
                  img.icon(src="~@res/placeholder/avatar.png")
                  .base-info
                    .name 李涛
                    .job 前端工程师
                  .phone 156022154878
                  .email 8975456454185@ddf.cdf
                  .del(@click.stop="delOne()")
                    i.iconfont.icon-clear
</template>
<script>
import BarHeader from '@/components/c-header'
export default {
  components: {
    BarHeader
  },
  data () {
    return {
      name: '',
      phone: '',
      email: '',
      checked: false
    }
  },
  filters: {
    kong (value) {
      return value.replace(/^ +| +$/g,'')
    }
  },
  methods: {
    commit () {

    },
    delOne () {
      alert('删除单个')
    },
    clearChoose () {
      alert('批量删除')
    }
  }
}
</script>
<style lang="stylus" scoped>
  @import './index.styl'
</style>
