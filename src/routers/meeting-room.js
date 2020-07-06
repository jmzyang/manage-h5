'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push(
    {
      name: 'meetingRoom',
      path: '/meeting-room',
      redirect: { name: 'meetingRoom.index' },
      component: resolve => require(['../views/layout/default/'], resolve),
      children: [
        {
          path: '',
          name: 'meetingRoom.index',
          // query: {
          //   meetingId: '',
          //   videoConference: 1,
          //   startTime: '',
          //   duration: 0,
          //   mutation: 'M_MEETING_ROOM_SELF',
          //   stateName: 'meetingRoomSelf',
          //   businessType: 2
          // },
          meta: {
            barStatusBg: '255,0,122,255',
            barStatusIsDark: 'false',
            title: '会场',
            keepAlive: false
          },
          component: resolve => require(['../views/meeting-room/'], resolve)
        },
        {
          path: 'status',
          name: 'meetingRoom.status',
          // query: {
          //   meetingId: '',
          //   videoConference: 1,
          //   startTime: '',
          //   duration: 0,
          //   mutation: 'M_MEETING_ROOM_SELF',
          //   stateName: 'meetingRoomSelf',
          //   businessType: 2
          // },
          meta: {
            title: '会场状态',
            keepAlive: false
          },
          component: resolve => require(['../views/meeting-room/status'], resolve)
        }
      ]
    }
  )
}
