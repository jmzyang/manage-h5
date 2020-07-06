'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push({
    name: 'my',
    path: '/my',
    redirect: { name: 'my.index' },
    component: resolve => require(['../views/layout/default/'], resolve),
    children: [
      {
        path: '',
        name: 'my.index',
        meta: {
          barStatusBg: '255,18,118,244',
          barStatusIsDark: 'false',
          title: '我的'
        },
        component: resolve => require(['../views/my/'], resolve)
      },
      {
        path: 'notice-details',
        name: 'my.notice-details',
        // style: {
        //     background: '#fff',
        //     marginTop: '50px'
        // },
        meta: {
          title: '消息详情'
        },
        component: resolve => require(['../views/my/notice-details'], resolve)
      },
      // {
      //   path: 'scan-page',
      //   name: 'my.scan-page',
      //   // style: {
      //   //     background: '#fff',
      //   //     marginTop: '50px'
      //   // },
      //   meta: {
      //     title: '扫一扫'
      //   },
      //   component: resolve => require(['../views/my/scan-page'], resolve)
      // },
      {
        path: 'help',
        name: 'my.help',
        meta: {
          title: '帮助中心'
        },
        component: resolve => require(['../views/my/components/help'], resolve)
      },
      {
        path: 'feedback',
        name: 'my.feedback',
        meta: {
          title: '问题反馈'
        },
        component: resolve =>
          require(['../views/my/components/feedback'], resolve)
      },
      {
        path: 'editing',
        name: 'my.editing',
        meta: {
          title: '个人资料'
        },
        component: resolve =>
          require(['../views/my/components/editing'], resolve)
      },
      {
        path: 'problem-details',
        name: 'my.help.problemDetails',
        meta: {
          title: '常见问题'
        },
        component: resolve =>
          require([
            '../views/my/components/help/components/c-problem-details'
          ], resolve)
      }
    ]
  })
}