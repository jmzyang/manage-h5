<template lang="pug">
  .searchs-content
    .header
      i.icon-close.iconfont(@click="closSearchs")
      .input-content
        i(class="iconfont icon-search")
        input(:placeholder="inputTitleTitle" maxlength="40" v-focus v-model="inputValue" @input="inputFocus" @keyup="TargetContent" ref="searchsInput")
        //- :: 搜索会场名称
      .icons(@click="searchClick")
        | {{$t('search')}}
        //- :: 搜索
    .main
      .list-content(v-for="Kvalue in KeyWordData" @click="TargetContent") {{Kvalue}}
</template>
<script>
import { Stream } from 'stream';
export default {
  data () {
    return {
      inputTitleTitle: this.inputTitle || this.$t('searchConferenceHallName'),
      inputValue: this.searchsVal === this.inputTitleTitle?'':this.searchsVal, // 输入框内容
      isKeyWord: 'keyword', // 查询方式
      KeyWordData: [], // 关键词数据
      searchsData: []// 输入内容模糊查询数据
    }
  },
  props: {
    // 输入框内容
    searchsVal: {
      type: String,
      default: ''
    },
    // 会场名称集合
    meetingNameList:{
      type: Array,
      default:[]
    },
    // 输入框引导语
    inputTitle:{
      type: String,
      default: ''
    }
  },
  directives: {
    focus: {
    // 指令的定义
      inserted: function (el) {
        el.focus()
      }
    }
  },
  methods: {
    closSearchs () {
      // 检索返回
      this.$emit('getKeyWordDate','')
    },
    TargetContent (e) {
      // 选中关键词获取会议信息
      let vm = this
      if (e.keyCode) {
        if (e.keyCode === 13) {
          vm.$emit('getKeyWordDate', vm.inputValue)
        }
      } else {
        vm.$emit('getKeyWordDate', e.target.innerHTML)
      }
    },
    searchClick () {
      this.$emit('getKeyWordDate', this.inputValue)
    },
    inputFocus () {
      let vm = this
      vm.KeyWordData = []
      if (vm.inputValue || !vm.inputValue.match(/^[ ]*$/)) {
        vm.meetingNameList.forEach((value)=>{
          if(value.indexOf(vm.inputValue) > -1){
            vm.KeyWordData.push(value)
          }
        })
      }
    },

  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
