'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push(
    {
      name: 'searchs',
      path: '/searchs',
      redirect: { name: 'searchs.index' },
      component: resolve => require(['../views/layout/default/'], resolve),
      children: [
        {
          path: '',
          name: 'meeting-list-searchs',
          meta: {
            barStatusBg: '255,18,118,244',
            barStatusIsDark: 'false',
            title: '搜索会议列表',
            authorization: '1113'
          },
          component: resolve => require(['../views/searchs/'], resolve)
        }
      ]
    }
  )
}
