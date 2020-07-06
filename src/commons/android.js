'use strict'
import Vue from 'vue'

import storage from '@/commons/storage'

// 扫描二维码回调
window.scanCodeCallBack = function(path) {
    storage.androidQrCode = path
}
window.downLoadCallBack = function(info) {
    storage.androidQrCode = info
}

class Android {
    constructor() {
        this.defaults = {}
    }
    downLoadFile(url, fileName) {
        // alert(baseUrl)
            url = url.replace(/(^\\)|(^\/)/, '').replace(/\\/ig, '/')
            let baseUrl = window.location.protocol + '//' + window.location.host + '/fileServer/' + url
            window.AndroidWebView.downLoadFile(baseUrl, fileName)
        }
        // 下载控制：取消：cancel，继续：resume，结束：stop
    downloadAction(action, url) {
            window.AndroidWebView.downloadAction(action, url)
        }
        // 打开文件
    openFile(url) {
        window.AndroidWebView.openFile(url)
    }
    selectFile() {
        window.AndroidWebView.selectFile()
    }
    scanCode() {
        window.AndroidWebView.scanCode()
    }
    goApp(_userId, _password) {
            window.AndroidWebView.goApp(_userId, _password)
        }
        /***************************************
         * 设置状态颜色
         * params bg {String} (透明度,red,blue,green) 注意中间不能有空格
         * params isDark  {String} 'true' 状态栏图标颜色
         * *********************************** */
    setBarTopColor(bg, isDark) {
        // 默认是白色背景，黑色字体或图标
        if (window.AndroidWebView && window.AndroidWebView.setColor) {
            window.AndroidWebView.setColor(bg || '255,255,255,255', isDark || 'true')
        }
    }
}

const android = new Android()

Vue.prototype.$android = android