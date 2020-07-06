'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push(
    {
      name: 'home',
      path: '/',
      redirect: { name: 'meeting.index' },
      component: resolve => require(['../views/layout/default/'], resolve),
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: {
            title: '首页'
          },
          component: resolve => require(['../views/home/'], resolve)
        }
      ]
    }
  )
}
