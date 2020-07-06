'use strict'
import Vue from 'vue'

class Ios {
  constructor () {
    this.defaults = {}
  }
  // 文件下载
  downLoadFile (url, fileName) {
    // url = url.replace(/(^\\)|(^\/)/, '').replace(/\\/ig, '/')
    // let baseUrl = window.location.protocol + '//' + window.location.host + '/fileServer/' + url
    // alert(baseUrl)
    window.webkit.messageHandlers.async.postMessage({ 'action': 'downloadFile', 'data': { url: url }, 'callback': 'receiveValue' })
  }
}

const ios = new Ios()

Vue.prototype.$ios = ios
