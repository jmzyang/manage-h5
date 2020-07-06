'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push(
    {
      name: 'meetingVerify',
      path: '/meeting-verify',
      redirect: { name: 'meetingVerify.index' },
      component: resolve => require(['../views/layout/default/'], resolve),
      children: [
        {
          path: '',
          name: 'meetingVerify.index',
          meta: {
            barStatusBg: '255,0,122,255',
            barStatusIsDark: 'false',
            title: '会议审核',
            authorization: '1113'
          },
          component: resolve => require(['../views/meeting-verify/'], resolve)
        }
      ]
    }
  )
}
