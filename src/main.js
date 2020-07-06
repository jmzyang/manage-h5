import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import Router from 'vue-router'
import { sync } from 'vuex-router-sync'
import storage from './commons/storage'
import mixins from './mixins/'
import ajaxRequest from '@/commons/http-async'
import { isAndroid, isiOS } from '@/utils/device'
// 设置html font-size
import './utils/flexible.js'

// 路由切换进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// android
import '@/commons/android'

// ios
import '@/commons/ios'

// chinesNum阿拉伯数字转换中文数字
import '@/commons/chinesNum'

// 国际化
import i18n from './i18n/'

// 按需引入ui组件
import './plugins/vant'
// 引入表单验证插件
import './plugins/vee-validate'
// touch
// import './plugins/vue-touch'
// touch animate
// import './plugins/vue-touch-ripple'
// vue-swipe
import './plugins/vue-swipe'
// 触摸事件
import fastClick from 'fastclick'
fastClick.attach(document.body)

// welink
Vue.prototype.$welink = window.HWH5

// 设备判断
Vue.prototype.$isAndroid = isAndroid
Vue.prototype.$isiOS = isiOS

// 注册全局的调用UCC系统接口的方法
Vue.prototype.$ajaxRequest = ajaxRequest.njdfAjax

Vue.config.productionTip = false
// 是否开启严格模式
const strict = process.env.NODE_ENV !== 'production'

// 加载路由
const routes = []
let requireContext = require.context('./routers', false, /^\.\/.*\.js$/)
requireContext.keys().forEach((key) => {
  const mod = requireContext(key);
  (mod.__esModule && mod.default ? mod.default : mod)(routes)
})
// 404、500
routes.push({
  path: '/*',
  redirect: '/404'
})

Vue.use(Router)
console.log(process.env.BASE_URL)
const router = new Router({
  strict: strict,
  routes: routes,
  mode: 'history',
  // base: process.env.NODE_ENV === 'production' ? '/CloudLink' : '/CloudLink'
  base: process.env.BASE_URL
})
// 配置路由钩子
// storage.xAuthToken = false // 初始化认为会话不存在，然后调用后台会话接口确认会话是否存在
router.beforeEach((to, from, next) => {
  // 加载loading
  NProgress.start()
  next()
  return
  // eslint-disable-next-line no-unreachable
  if (!to.matched.some(r => r.meta.ignoreAuth)) {
    console.log(to)
    if (to.query.code && to.query.state) {
      storage.xAuthToken = false
      next({
        name: 'login',
        query: {
          redirect: to.fullPath
        }
      })
    } else {
      if (storage.xAuthToken) {
        next()
      } else {
        next({
          name: 'login',
          query: {
            redirect: to.fullPath
          }
        })
      }
    }
  } else {
    next()
  }
})
router.afterEach(route => {
  // 删除loading
  NProgress.done()
})

// 动态加载vuex
const modules = {}
requireContext = require.context('./stores', true, /^\.\/.*\/index\.js$/)
requireContext.keys().forEach((key) => {
  const mod = requireContext(key)
  modules[key.slice(2, -9)] = mod.__esModule && mod.default ? mod.default : mod
})
Vue.use(Vuex)
const store = new Vuex.Store({
  modules,
  strict
})
// 将路由写进state
sync(store, router)

// 加载过滤器
Vue.use((Vue) => {
  ((r) => {
    const arr = r.keys().map(r) || []
    arr.forEach((filter) => {
      filter = filter.__esModule && filter.default ? filter.default : filter
      Object.keys(filter).forEach((key) => {
        Vue.filter(key, filter[key])
      })
    })
  })(require.context('./filters', false, /^\.\/.*\.js$/))
})

// 加载指令
Vue.use((Vue) => {
  ((r) => {
    const arr = r.keys().map(r) || []
    arr.forEach((directive) => {
      directive = directive.__esModule && directive.default ? directive.default : directive
      Object.keys(directive).forEach((key) => {
        Vue.directive(key, directive[key])
      })
    })
  })(require.context('./directives', false, /^\.\/.*\.js$/))
})

// PWA
if (process.env.NODE_ENV === 'production') {
  require('./commons/pwa')
}

window.app = new Vue({
  mixins: [mixins],
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')
