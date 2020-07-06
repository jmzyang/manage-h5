'use strict'
/***********************************************
 * @params meta {Obejct}
 * @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 * @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/

export default router => {
  router.push({
    name: 'meeting',
    path: '/meeting',
    redirect: { name: 'meeting.notify' },
    component: resolve => require(['../views/layout/default/sh_index'], resolve),
    children: [{
      path: '',
      name: 'meeting.index',
      meta: {
        barStatusBg: '255,0,122,255',
        barStatusIsDark: 'false',
        keepAlive: true,
        title: '会议列表'
      },
      component: resolve => require(['../views/meeting/sh_index'], resolve),
      children: [{
        path: 'search',
        name: 'meetingPersonnelDetails.search',
        meta: {
          title: '授权转移组织机构选择',
          keepAlive: false
        },
        component: resolve => require(['../views/meeting/components/c-searchs-wrap/'], resolve)
      },
      {
        path: 'external',
        name: 'localControl.external',
        meta: {
          title: '本地会控添加参会人的选择现有外部联系人',
          keepAlive: false
        },
        component: resolve => require(['../views/meeting/components/c-choose-contacts/components/c-external/c-choose-existing.vue'], resolve)
      }
      ]
    },
    {
      path: 'details',
      name: 'meeting-details',
      meta: {
        barStatusBg: '255,18,118,244',
        barStatusIsDark: 'false',
        title: '会议详情'
      },
      component: resolve => require(['../views/meeting/components/c-details/sh_index'], resolve)
    },
    {
      path: 'sign',
      name: 'meeting-sign',
      meta: {
        title: '应会情况'
      },
      component: resolve => require(['../views/meeting/components/c-sign-in/'], resolve)
    },
    {
      path: 'notice',
      name: 'meeting-notice',
      meta: {
        title: '会议通知'
      },
      component: resolve => require(['../views/meeting-notice/'], resolve)
    },
    {
      path: 'list',
      name: 'meeting-list',
      meta: {
        title: '全部会议'
      },
      component: resolve => require(['../views/meeting/meeting-list'], resolve)
    },
    {
      path: 'respond',
      name: 'meeting-respond',
      meta: {
        title: '应会状况'
      },
      component: resolve => require(['../views/meeting/components/c-response-state'], resolve)
    },
    {
      path: 'control',
      name: 'meeting-control',
      meta: {
        title: '会议控制'
      },
      component: resolve => require(['../views/meeting-control/'], resolve),
      children: [{
        path: 'search',
        name: 'meetingControl.search',
        meta: {
          title: '搜索会场',
          keepAlive: false
        },
        component: resolve => require(['../views/meeting/components/c-searchs-wrap/c-search-meeting'], resolve)
      },
      {
        path: 'external',
        name: 'meetingControl.external',
        meta: {
          title: '会控添加参会人的选择现有外部联系人',
          keepAlive: false
        },
        component: resolve => require(['../views/meeting/components/c-choose-contacts/components/c-external/c-choose-existing.vue'], resolve)
      }
      ]
    },
    {
      path: 'create',
      name: 'meeting.create',
      meta: {
        title: '创建会议',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/sh_create.vue'], resolve),
      children: [
        {
          path: 'create-group/:groupId/:businessType',
          name: 'meeting.create.create-group',
          meta: {
            title: '创建联系人组',
            keepAlive: true,
            routerViewName: 'createMeeting'
          },
          component: resolve => require(['../views/meeting/components/c-create-group'], resolve),
          children: [
            {
              path: 'search',
              name: 'meeting.create.create-search-org.search',
              meta: {
                title: '创建会议时的搜索自定义组人的路由',
                keepAlive: true,
                routerViewName: 'createMeeting'
              },
              component: resolve => require(['../views/meeting/components/c-searchs-wrap/'], resolve)
            }
          ]
        },

        {
          path: 'create-search-meeting',
          name: 'meeting.create.create-search-meeting',
          meta: {
            title: '创建会议时的搜索会场的路由',
            keepAlive: true,
            routerViewName: 'createMeeting'
          },
          component: resolve => require(['../views/meeting/components/c-searchs-wrap/c-search-meeting'], resolve)
        },
        {
          path: 'create-meeting-external/:businessType',
          name: 'meeting.create.external',
          meta: {
            title: '创建会议时的选择现有外部联系人',
            keepAlive: true,
            routerViewName: 'createMeeting'
          },
          component: resolve => require(['../views/meeting/components/c-choose-contacts/components/c-external/c-choose-existing.vue'], resolve)
        }
      ]
    },
      // 创建会议时的搜索组织或人的路由
    {
      path: 'create-search-org',
      name: 'meeting.create.create-search-org',
      meta: {
        title: '创建会议时的搜索组织或人的路由',
        keepAlive: true,
        routerViewName: 'createMeeting'
      },
      component: resolve => require(['../views/meeting/components/c-searchs-wrap/'], resolve)
    },

    {
      path: 'edit/:meetingId',
      name: 'meeting.edit',
      meta: {
        title: '修改会议'
      },
      component: resolve => require(['../views/meeting/sh_create.vue'], resolve),
      children: []
    },
    {
      path: 'choose-meeting-room',
      name: 'meeting.chooseMeetingRoom',
      meta: {
        title: '选择会场',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/components/c-choose-room/'], resolve)
    },
    {
      path: 'choose-issue',
      name: 'meeting.chooseIssue',
      meta: {
        title: '选择议题',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/issue/'], resolve)
    },
    {
      path: 'issue-add',
      name: 'meeting.issue.add',
      meta: {
        title: '添加议题',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/issue/add'], resolve)
    },
    {
      path: 'choose-duration',
      name: 'meeting.chooseDuration',
      meta: {
        title: '选择时长',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/components/c-choose-duration/'], resolve)
    },
    {
      path: 'choose-service-item',
      name: 'meeting.chooseServiceItem',
      meta: {
        title: '选择服务项',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/components/c-choose-service-item/'], resolve)
    },
    {
      path: 'choose-classification',
      name: 'meeting.chooseClassification',
      meta: {
        title: '选择会议分类',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/components/c-classification/'], resolve)
    },
    {
      path: 'choose-ready-time',
      name: 'meeting.readyTime',
      meta: {
        title: '准备时间',
        keepAlive: true
      },
      component: resolve => require(['../views/meeting/components/c-ready-time/'], resolve)
    }
    ]
  })
}
