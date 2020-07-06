'use strict'

import http from '@/commons/http'
import storage from './storage'
import { formateData, jsonResultCallback } from '@/utils/formate'

/*******************************************************************
 * @name njdfAjax 对http进行二次封装，提供单接口、多接口调用
 * @prama options {Object} 单接口调用传入参数
 *  #url
 *    #Object 多接口 {key1:['url', {httpOptions}]}
 *    #String  单接口 url
 *  #options
 *    #method <String> 请求方式，支持restful(get、post、delete、put、patch)
 *    #apiType <String> 请求接口类型，请查阅@conf/index.js
 *    #data {Object} post入参
 *    #params {Object} get入参
 *    #mask <null、Boolean> 默认不展示菊花，显示则设置为true
 *    #json <null、Boolean> 设置为true则为设置 content-type=text/json
 *    #token <null、Boolean> 需要用户登录，设置为false则不需要验证
 *    #formUpload <null、Boolean> 是否是form提交的方式上传附件，设置为true则为设置 content-type=multipart/form-data
 *  @prama callback {Object} 接口请求钩子回调事件
 *      #<Function> 成败 ----- 执行完之后的动作
 *      #[Array] 执行完之后的动作集
 *        #0 <Function> 成功 ----- 执行完之后的动作
 *        #1 <Function> 失败 ----- 执行完之后的动作
 *        #2 <Function> 成败 ----- 执行完之后的动作
 *        #3 <Function> 捕捉异常 ----- 执行完之后的动作
 ******************************************************************/

export default {
  njdfAjax: async (options, _callback) => {
    let _options = []
    if (Array.isArray(options)) {
      _options = options
    } else {
      _options[0] = options
    }
    try {
      let data = formateData(_options)
      if (_options.length && _options[0].mask === false) {
        data.mask = false
      } else {
        data.mask = {
          background: 'rgba(255,255,255,0.25)'
        }
      }
      return httpRequst(data.url, {
        method: 'post',
        data: data['data'],
        headers: {
          'Content-Type': data['contentType']
        },
        mask: data.mask,
        callback: _callback
      }).then(res => {
        let result = jsonResultCallback(res.data)
        if (+result.code === 10069) {
          storage.xAuthToken = false
          window.location.replace(process.env.BASE_URL + 'login')
        } else {
          return Promise.resolve(result)
        }
      }).catch(e => {
        return Promise.reject(e)
      })
    } catch (err) {
      console.error(err)
    }
  },
  njdfUpload: async options => {
    try {
      return httpRequst(options)
    } catch (err) {
      console.error(err)
    }
  }
}

// 起源
class OrginHttp {
  constructor (_url, _options) {
    const options = _options || {}
    this.options = Object.assign(
      {
        mask: true,
        method: 'get'
      },
      this._setOptions(_url, options)
    )
  }

  request (resolve, reject) {
    const options = this.options
    const CALLBACK = options.callback
    options.isUCCInterfaceNumber = true
    http(options)
      .then(response => {
        // 无论咋样
        CALLBACK[2] && CALLBACK[2](jsonResultCallback(response.data))
        resolve(response)
      })
      .catch(e => {
        // 捕捉异常
        CALLBACK[3] && CALLBACK[3](e)
        reject(e)
      })
  }

  _setOptions (_url, _options) {
    let options = _options
    options.url = _url
    if (typeof _options.callback === 'function') {
      options.callback = [null, null, _options.callback]
    } else if (!_options.callback) {
      options.callback = []
    }
    return options
  }
}

const httpRequst = (url, options) => {
  return new Promise((resolve, reject) => {
    const baseRequest = new OrginHttp(url, options)
    baseRequest.request(resolve, reject)
  })
}
