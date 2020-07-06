'use strict'

// 打印钩子函数运行的时间
export const hookTime = (component, hookFnName) => {
  let date = new Date()
  let m = date.getMinutes()
  let s = date.getSeconds()
  let ms = date.getMilliseconds()
  console.log(`${component} ${hookFnName} ${m}-${s}-${ms}`)
}

// 将平级格式数据 深度递归
export const sonsTree = (arr, id) => {
  let temp = []
  let lev = 0
  var forFn = function (arr, id, lev) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i]
      if (item.parent_id === id) {
        item.lev = lev
        temp.push(item)
        forFn(arr, item.id, lev + 1)
      }
    }
  }
  forFn(arr, id, lev)
  return temp
}

// 递归函数
export const toTree = (data) => {
  // 删除 所有 children,以防止多次调用
  data.forEach(function (item) {
    delete item.children
  })
  // 将数据存储为 以 id 为 KEY 的 map 索引数据列
  var map = {}
  data.forEach(function (item) {
    map[item.id] = item
  })
  // console.log(map);
  var val = []
  data.forEach(function (item) {
    // 以当前遍历项，的pid,去map对象中找到索引的id
    var parent = map[item.pid]
    // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      // 如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
      val.push(item)
    }
  })
  return val
}

// 获取指定key，返回数组格式
export const getDataByKey = (arr, key) => {
  let result = []
  arr.forEach((item) => {
    result.push(item[key])
  })
  return result
}
// 外部联系人提交格式转换
export const externalFormatAdd = (data) => {
  let result = []
  if (data && data.length > 0) {
    data.forEach((item) => {
      if (item.USER_NAME) {
        result.push({
          name: item.USER_NAME,
          tel: item.MOBILE ? item.MOBILE : '',
          email: item.EMAIL ? item.EMAIL : ''
        })
      }
    })
    result = JSON.stringify(result)
  } else {
    result = ''
  }
  return result
}
