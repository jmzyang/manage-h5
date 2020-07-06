'use strict'

import CryptoJS from 'crypto-js'

class AesUtil {
  constructor () {
    this.config = {
      title: 'Aes加密工具类型'
    }
  }

  /**
   * 加密
   * @param word
   * @param pwd
   * @returns {string}
   * @constructor
   */
  AesEncrypt (data, key) {
    var pwd = CryptoJS.enc.Utf8.parse(key)
    var src = CryptoJS.enc.Utf8.parse(data)
    var encrypted = CryptoJS.AES.encrypt(src, pwd, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  }

  /**
   * 解密
   * @param word
   * @param pwd
   * @constructor
   */
  AesDecrypt (data, key) {
    var pwd = CryptoJS.enc.Utf8.parse(key)
    var decrypt = CryptoJS.AES.decrypt(data, pwd, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(decrypt).toString()
  }
}

export default new AesUtil()
