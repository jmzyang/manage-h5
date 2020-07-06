# manage-vue

## Project setup
```
npm install or cnpm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

## Framework
* Node >= 8.11.x
* webpack >= 4.x
* vue >= 2.x
* stylus
* pug

# 关键代码示例

## 客户端ajax请求

```
import http from '@/commons/http'

http.get('/url').then((response) => {
  console.log(response.data)
});

http.post('/url', {
  param: param
}).then((response) => {
  console.log(response.data)
})

这里有坑，get方法最多传两个参数，post方法最多传三个参数，其实统一写法会好理解一些，如：

http({
  method: 'GET', // GET或者POST
  apiType: '', //接口类型
  url: '/user/12345', // 请求地址
  data: {
    // 调用post接口传参，params中的参数不被接收
  },
  params: {
    // 调用get接口传参，data中参数不被接收
  },
  mask：,         // 设置为false，通过ajax请求接口时，菊花消失
  json：,         // 设置为true，设置headers[ 'Content-Type' ] = 'application/json; charset=UTF-8'
  token：,        // 设置为false，调用后台接口将不自动增加token
}).then((response) => {
  console.log(response.data)
})

```
客户端的ajax公共方法是在axios的基础上包裹了一层，（点击查看<a href="https://github.com/mzabriskie/axios"> axios相关的参数配置）</a>，新增参数如下：
 * apiType: 'DEMO', //接口类型，对多个渠道接口进行统一配置，详情见src/conf/api.js
 * mask：设置为false，通过ajax请求接口时，菊花消失(*￣□￣)
 * json：设置为true，headers[ 'Content-Type' ] = 'application/json; charset=UTF-8'
 * token：设置为false，调用后台接口将不自动增加token


## 组件模块列表
 * pug html编译器 <a href="https://github.com/pugjs/pug">传送门</a>
 * stylus css样式预处理器 <a href="https://github.com/stylus/stylus">传送门</a>
 * moment 时间日期 <a href="https://github.com/moment/moment">传送门</a>
 * element-ui UI <a href="https://github.com/ElemeFE/element">传送门</a>
   
# 常用的模块和组件的使用

```
import qs from 'querystring'       // 格式化请求参数
qs.stringify({a:1, b:2}))            // 输出 a=1&b=2
qs.parse(window.location.search)        // 输出 { x:1, y:1 }

import moment from 'moment'
moment().format('YYYY-MM-DD')        // 格式化时间
moment().add(1, 'days')           // 增加一天时间
```
# 经常会踩到的坑
#### * computed已经检测到了state的改变，为什么页面绑定的元素没有刷新？
   在stores目录下的index.js中的state对象里面预先定义好你需要返回的字段属性名
#### * 页面的子组件获取父页面的动态属性值为undefined？
   子组件需要把该字段加入到watch中去监听它的值变化，监听得到了数据值之后在处理
#### * 操作computed里面绑定的数组，可能不能触发页面元素变化？
   如果直接操作数组下标改变数据无法映射到页面，那就使用数组的splice方法操作数组内容
