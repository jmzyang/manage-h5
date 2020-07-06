<template lang="pug">
.scroll-content(ref="wrapper")
  .scroll-transform(ref="wrapperScroll", :style="{ width: scrollX && scrollWidth + 'px'}")
    .refresh-container(v-if="pulldown && enableRefresh" :class="{shell:shellShow}")
      .refresh-con
        span(v-if="refreshState ==='release'" v-for="key in 12")
        i(class="iconfont icon-arrow-top" v-if="refreshState=='dropDown'")
        i(class="iconfont icon-arrow-bottom" v-if="refreshState=='pullDown'")
        b {{refreshContent}}
    .refresh-shell(v-if="shellShow && enableRefresh")
    slot
  template
    .load-container(v-if="lodingState && pullup && enableRefresh")
      .refresh-con
        span(v-for="key in 12" v-if="loadContent === $t('loading')")
        //- :: 加载中...
        b {{loadContent}}
</template>
<script>
import BScroll from 'better-scroll'
import * as TYPES_CALENDAR from '@/stores/calendar/types'
export default {
  data () {
    return {
      lodingState: false,
      refreshContent: this.$t('dropdownRefresh'), // :: 下拉刷新...
      loadContent: this.$t('loading'), // :: 加载中...
      refreshState: 'dropDown', // 下拉dropDown，上拉pullDown，释放release
      shellShow: false,// 下拉刷新占位展示
      refreshOvertime: null// 刷新超时定时器
    }
  },
  props: {
    /**
     * 1 滚动的时候会派发scroll事件，会截流。
     * 2 滚动的时候实时派发scroll事件，不会截流。
     * 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
     */
    probeType: {
      type: Number,
      default: 1
    },
    autoBlur: {
      type: Boolean,
      default: true
    },
    /**
     * 点击列表是否派发click事件
     */
    click: {
      type: Boolean,
      default: true
    },
    /**
     * 是否开启横向滚动
     */
    scrollX: {
      type: Boolean,
      default: false
    },
    /**
     * 开启横向滚动，必须要给外围容器赋值宽度
     */
    scrollWidth: {
      type: [String, Number],
      default: 0
    },
    /**
     * 是否派发滚动事件
     */
    listenScroll: {
      type: Boolean,
      default: false
    },
    /**
     * 列表的数据
     */
    data: {
      type: Array,
      default: null
    },
    /**
     * 是否派发滚动到底部的事件，用于上拉加载
     */
    pullup: {
      type: Boolean,
      default: false
    },
    /**
     * 是否派发顶部下拉的事件，用于下拉刷新
     */
    pulldown: {
      type: Boolean,
      default: false
    },
    /**
     * 是否派发列表滚动开始的事件
     */
    beforeScroll: {
      type: Boolean,
      default: false
    },
    /**
     * 当数据更新后，刷新scroll的延时。
     */
    refreshDelay: {
      type: Number,
      default: 300
    },
    /**
     * 底部上拉加载滑动距离。
     */
    scrollEndValue: {
      type: Number,
      default: 50
    },
    /**
     * 顶部下拉加载滑动距离。
     */
    touchendValue: {
      type: Number,
      default: 50
    },
    /**
     * 是否显示滚动条。
     */
    beforeScroll: {
      type: Boolean,
      default: false
    },
    /**
     * 刷新加载是否完成。
     */
    refreshEnd: {
      type: [String],
      default: ''
    },
    /**
     * 启用刷新提示。
     */
    enableRefresh: {
      type: Boolean,
      default: false
    },
    /**
     * 启用刷新提示。
     */
    scrollBottom:{
      type: Boolean,
      default: false
    }
    
  },
  mounted () {
    // 保证在DOM渲染完毕后初始化better-scroll
    setTimeout(() => {
      this._initScroll()
    }, 20)
  },
  watch: {
    // 监听数据的变化，延时refreshDelay时间后调用refresh方法重新计算，保证滚动效果正常
    data () {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    },
    refreshEnd (val) {
      this.refreshLoad(val)
    },
    scrollBottom(){
      setTimeout(() => {
        this.scroll.scrollTo(0,this.scroll.maxScrollY,0)
      }, this.refreshDelay)
    },
    scrollWidth (val) {
      setTimeout(() => {
        this.refresh()
      }, this.refreshDelay)
    }    
  },
  methods: {
    _initScroll () {
      if (!this.$refs.wrapper) {
        return
      }
      if (this.scrollX) {
        this.$refs.wrapperScroll.style.width = this.scrollWidth
      }
      // better-scroll的初始化
      this.scroll = new BScroll(this.$refs.wrapper, {
        probeType: this.probeType,
        autoBlur: this.autoBlur,
        click: this.click,
        preventDefault: false,
        preventDefaultException: {
          tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,
          className: /(^|\s)content(\s|$)/
        },
        scrollX: this.scrollX,
        scrollbar: this.beforeScroll
      })

      // 是否派发滚动事件
      if (this.listenScroll) {
        let me = this
        this.scroll.on('scroll', (pos) => {
          me.$emit('scroll', pos)
        })
      }

      // 滚动中
      this.scroll.on('scroll', (pos) => {
        let vm = this
        if (vm.pulldown && !vm.shellShow && !vm.lodingState) {
          if(pos.y > vm.touchendValue){
            vm.refreshContent = this.$t('releaseRefresh'); // :: 释放立刻刷新...
            vm.refreshState = 'pullDown';
          }else{
            vm.refreshContent = this.$t('dropdownRefresh'); // :: 下拉刷新
            vm.refreshState= 'dropDown';
          }
        }

        this.$store.commit(TYPES_CALENDAR.C_CALENDAR_SCROLL, {
          rollingVal: pos.y,
          end: false
        })

        // if(vm.pullup && !vm.shellShow && !vm.lodingState){
        //   if(!vm.lodingState && !vm.shellShow && vm.pullup && (vm.scroll.maxScrollY - pos.y) > vm.scrollEndValue){
        //     vm.lodingState = true
        //   }else{
        //     vm.lodingState = true
        //   }
        // }
      })

      // 滚动刷新加载
      this.scroll.on('touchEnd', (pos) => {
        let vm = this;
        if (!vm.lodingState && !vm.shellShow && vm.pullup && (vm.scroll.maxScrollY - pos.y) > vm.scrollEndValue) {
          // 底部上拉加载
          vm.loadContent = this.$t('loading') // :: 正在加载...
          vm.lodingState = true
          vm.refreshOvertime = setTimeout(() => {
            vm.loadContent = this.$t('loadTimeout') // :: 加载超时
            setTimeout(()=>{
              vm.lodingState = false
            },1000)
          },20000)
          vm.$emit('scrollToEnd');
        }else{
          this.$store.commit(TYPES_CALENDAR.C_CALENDAR_SCROLL, {
            rollingVal: pos.y,
            end: true
          })
        }
        if (!vm.lodingState && !vm.shellShow && vm.pulldown && pos.y > vm.touchendValue) {
          // 顶部下拉刷新
          vm.refreshContent = this.$t('refreshing'); // :: 正在刷新
          vm.refreshState = 'release';
          vm.shellShow = true;

          vm.refreshOvertime = setTimeout(()=>{
            vm.refreshContent = this.$t('refreshTimeout') // :: 刷新超时
            vm.refreshState = '';
            setTimeout(()=>{
              vm.shellShow = false;
              vm.refreshContent = this.$t('dropdownRefresh'); // :: 下拉刷新
              vm.refreshState= 'dropDown';
            },1000)
          },20000)
          vm.$emit('repeatGetData')
        }else{
          this.$store.commit(TYPES_CALENDAR.C_CALENDAR_SCROLL, {
            rollingVal: pos.y,
            end: true
          })
        }
      })

      // 是否派发列表滚动开始的事件
      if (this.beforeScroll) {
        this.scroll.on('beforeScrollStart', () => {
          this.$emit('beforeScroll')
        })
      }
    },
    // 上拉刷新下拉加载结束
    refreshLoad (val) {
      let vm = this
      if(!val){return false}

      if(val === "1"){
        vm.refreshContent = this.$t('refreshSuccess') // :: 刷新成功
        vm.loadContent = this.$t('loadingCompleted') // :: 加载完成
      }else if(val === "2"){
        vm.refreshContent = this.$t('refreshFailed') // :: 刷新失败
        vm.loadContent = this.$t('notLoadedIntoData') // :: 没有加载到数据
      }
      vm.refreshState = ''
      clearInterval(vm.refreshOvertime)
      setTimeout(()=>{
        vm.lodingState = false
        vm.shellShow = false
        vm.refreshContent = this.$t('dropdownRefresh') // :: 下拉刷新
        vm.refreshState= 'dropDown'
      },1500)
    },
    disable () {
      // 代理better-scroll的disable方法
      this.scroll && this.scroll.disable()
    },
    enable () {
      // 代理better-scroll的enable方法
      this.scroll && this.scroll.enable()
    },
    refresh () {
      // 代理better-scroll的refresh方法
      this.scroll && this.scroll.refresh()
    },
    scrollTo () {
      // 代理better-scroll的scrollTo方法
      this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
    },
    scrollToElement () {
      // 代理better-scroll的scrollToElement方法
      this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
    }
  }
}

</script>

<style lang="stylus">
@import './index.styl'
</style>
