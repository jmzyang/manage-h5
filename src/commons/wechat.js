'use strict'

import $http from './http'
import storage from 'store'

class WeChat {
  constructor () {
    this.defaults = {}
  }

  _wxconfig (config) {
    wx.config({
      debug: false,
      appId: config.appId,
      timestamp: config.timestamp,
      nonceStr: config.nonceStr,
      signature: config.signature,
      jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'onMenuShareQZone',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onVoiceRecordEnd',
        'playVoice',
        'onVoicePlayEnd',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
      ]
    })
  }

  getConfig (currUrl, delayedTime) {
    if (!wx) {
      const error = new Error('未加载jweixin')
      return Promise.reject(error)
    }
    // alert(navigator.userAgent);
    currUrl = currUrl || window.location.href
    // 去掉锚点
    const idx = currUrl.indexOf('#')
    if (idx > -1) {
      currUrl = currUrl.slice(0, idx)
    }
    const me = this
    const defaults = me.defaults
    let config = defaults[currUrl]
    if (!config) {
      return new Promise((resolve, reject) => {
        $http({
          method: 'GET',
          apiType: 'WECHAT',
          url: '/getJssdk',
          mask: true,
          data: {
            currUrl: currUrl
          }
        }).then(function (res) {
          defaults[currUrl] = config = res.data.data
          me._wxconfig(config)
          delayedTime = +delayedTime
          wx.ready(
            () =>
              (delayedTime
                ? setTimeout(() => resolve(config), delayedTime)
                : resolve(config))
          )
        })
      })
    } else {
      return new Promise((resolve, reject) => {
        wx.ready(
          () =>
            (delayedTime
              ? setTimeout(() => resolve(config), delayedTime)
              : resolve(config))
        )
      })
    }
  }

  ready (name, params, currUrl) {
    return this.getConfig(currUrl).then(() => wx[name](params))
  }

  share (shareData, currUrl) {
    return this.getConfig(currUrl, 500).then(() => {
      wx.onMenuShareAppMessage({
        title: shareData.title,
        desc: shareData.desc,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        trigger: function (res) {
          shareData.trigger && shareData.trigger()
        },
        success: function (res) {
          shareData.success && shareData.success()
          // alert('已分享');
        },
        cancel: function (res) {
          shareData.cancel && shareData.cancel()
          // alert('已取消');
        },
        fail: function (res) {
          shareData.fail && shareData.fail()
          // alert(JSON.stringify(res));
        }
      })

      wx.onMenuShareTimeline({
        title: shareData.title,
        desc: shareData.desc,
        link: shareData.link,
        imgUrl: shareData.imgUrl,
        trigger: function (res) {
          shareData.trigger && shareData.trigger()
        },
        success: function (res) {
          shareData.success && shareData.success()
        },
        cancel: function (res) {
          shareData.cancel && shareData.cancel()
        },
        fail: function (res) {
          shareData.fail && shareData.fail()
        }
      })
    })
  }

  weChatPay (data, params) {
    if (data) {
      const $appid = data.appid
      const $timeStamp = data.timestamp
      const $nonceStr = data.noncestr
      const $packageValue = data.packageValue
      const $signType = data.signType
      const $paySign = data.sign
      const requestParam = {
        appId: $appid + '', // 公众号名称，由商户传入
        timeStamp: $timeStamp + '', // 时间戳，自1970年以来的秒数
        nonceStr: $nonceStr + '', // 随机串
        package: $packageValue + '',
        signType: $signType + '', // 微信签名方式:
        paySign: $paySign + '' // 微信签名
      }
      const MSG_CONST = 'err_msg'
      WeixinJSBridge.invoke('getBrandWCPayRequest', requestParam, res => {
        const resp = res
        const errMsg = resp[MSG_CONST]
        if (errMsg === 'get_brand_wcpay_request:ok') {
          params.success && params.success(resp)
        } else {
          if (errMsg === 'get_brand_wcpay_request:cancel') {
            params.cancel && params.cancel(resp)
          } else {
            params.fail && params.fail(resp)
          }
        }
      })
    }
  }

  hideMenuItems (currUrl) {
    return this.getConfig(currUrl).then(() => {
      wx.hideMenuItems({
        menuList: [
          'menuItem:share:appMessage',
          'menuItem:share:timeline',
          'menuItem:share:qq',
          'menuItem:share:weiboApp',
          'menuItem:favorite',
          'menuItem:share:facebook',
          'menuItem:share:QZone',
          'menuItem:copyUrl'
        ]
      })
    })
  }

  scanQRCode (params, currUrl) {
    return this.getConfig(currUrl).then(() => {
      wx.scanQRCode({
        needResult: params.needResult || 1,
        success: function (res) {
          params.success && params.success(res)
        },
        cancel: function (res) {
          params.cancel && params.cancel(res)
        },
        fail: function (res) {
          params.fail && params.fail(res)
        }
      })
    })
  }

  geo (currUrl, params, failCurrUrl) {
    let self = this
    if (storage.get('location')) {
      params.success && params.success(storage.get('location'))
    } else {
      let getLocation = () => {
        wx.getLocation({
          type: 'wgs84',
          success (res) {
            if (/:ok$/.test(res.errMsg)) {
              let data = {
                latitude: res.latitude,
                longitude: res.longitude
              }
              params.success && params.success(data)
            }
          },
          fail (err) {
            if (/invalid signature/.test(err.errMsg) && failCurrUrl) {
              self.getConfig(currUrl).then(getLocation)
            }
            params.error && params.error(err)
          },
          cancel (err) {
            params.cancel && params.cancel(err)
          }
        })
      }
      self.getConfig(currUrl).then(getLocation)
    }
  }
}

const weChat = new WeChat()

export default weChat
