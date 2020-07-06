'use strict'
/***********************************************
 * @params meta {Obejct}
 *          @params barStatusBg {String} (透明度,red,blue,green) 注意中间不能有空格
 *          @params barStatusIsDark {String} 'true' 状态栏图标颜色
 * ***********************************************/
export default router => {
  router.push(
    {
      name: 'contacts',
      path: '/contacts',
      redirect: { name: 'contacts.index' },
      component: resolve => require(['../views/layout/default/'], resolve),
      children: [
        {
          path: '',
          name: 'contacts.index',
          meta: {
            title: '联系人'
          },
          component: resolve => require(['../views/contacts/'], resolve),
          children: []
        },
        {
          path: '',
          name: 'contacts.index.view',
          meta: {
            title: '已选联系人'
          },
          component: resolve => require(['../views/contacts/view'], resolve),
          children: []
        },
        {
          path: 'external',
          name: 'contacts.external',
          meta: {
            title: '外部联系人'
          },
          component: resolve => require(['../views/contacts/components/c-external'], resolve),
          children: []
        },
        {
          path: 'external/add',
          name: 'contacts.externalAdd',
          meta: {
            title: '添加外部联系人'
          },
          component: resolve => require(['../views/contacts/components/c-external/add'], resolve),
          children: []
        },
        {
          path: 'group',
          name: 'contacts.group',
          meta: {
            title: '自定义组'
          },
          component: resolve => require(['../views/contacts/components/c-group'], resolve),
          children: []
        },
        {
          path: 'group/item',
          name: 'contacts.group.item',
          meta: {
            title: '自定义组'
          },
          component: resolve => require(['../views/contacts/components/c-group/item'], resolve),
          children: []
        },
        {
          path: 'addGroup',
          name: 'contacts.group.add',
          meta: {
            title: '添加自定义组'
          },
          component: resolve => require(['../views/contacts/components/c-add-group'], resolve),
          children: []
        },
        {
          path: 'organization',
          name: 'contacts.organization',
          meta: {
            title: '组织结构'
          },
          component: resolve => require(['../views/contacts/components/c-organization'], resolve),
          children: []
        },
        {
          path: 'seeContacts',
          name: 'contacts.seeContacts',
          meta: {
            title: '参会人信息'
          },
          component: resolve => require(['../views/contacts/components/c-see-contacts'], resolve),
          children: []
        }
      ]
    }
  )
}
