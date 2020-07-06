'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push({
    name: 'demo',
    path: '/demo',
    redirect: { name: 'demo.index' },
    component: resolve => require(['@/views/layout/default/'], resolve),
    children: [
      {
        name: 'demo.index',
        path: '',
        meta: {
          title: 'demo',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/'], resolve)
      },
      {
        name: 'demo.vant',
        path: 'vant',
        meta: {
          title: 'vant',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/components/vant'], resolve)
      },
      {
        name: 'demo.calendar',
        path: 'calendar',
        meta: {
          title: 'calendar',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/components/calendar'], resolve)
      },
      {
        name: 'demo.socket',
        path: 'socket',
        meta: {
          title: 'socket',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/components/socket'], resolve)
      },
      {
        name: 'demo.wechat',
        path: 'wechat',
        meta: {
          title: 'wechat',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/components/wechat'], resolve)
      },
      {
        name: 'demo.android',
        path: 'android',
        meta: {
          title: 'android',
          ignoreAuth: true
        },
        component: resolve => require(['@/views/demo/components/android'], resolve)
      }
    ]
  })
}
