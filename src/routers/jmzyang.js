'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/

export default router => {
  router.push(
    {
      name: 'login',
      path: '/jmzyang',
      meta: {
        barStatusBg: '255,255,255,255',
        barStatusIsDark: 'true',
        title: '加入会议', // 文档标题
        ignoreAuth: true // 是否不需要验证权限
      },
      component: resolve => require(['../views/jmzyang/'], resolve)
    }
  )
}
