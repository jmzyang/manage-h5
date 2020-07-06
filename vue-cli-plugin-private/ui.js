'use strict'
const path = require('path')

function pathResolve (dir) {
  return path.join(__dirname, './', dir)
}

module.exports = api => {
  console.log(`api.getProject():`)
  console.log(api.getProject())
  api.addClientAddon({
    id: 'org.vue.webpack.client-addon',
    // 包含构建出来的 JS 文件的文件夹
    path: '@vue/cli-ui-addon-webpack/dist'
  })
  // 在这里使用 API...
  api.describeTask({
    // 用于匹配脚本命令的 RegExp 对象，来选择要被描述的任务
    match: /gulp/,
    description: '前置任务预执行，vantUI',
    // “More info”链接
    link: 'https://www.gulpjs.com.cn/',
    icon: '/public/vant.png'
  })
}
