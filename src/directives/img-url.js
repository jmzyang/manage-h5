'use strict'

import defaultImg from '@/assets/images/placeholder/avatar.png'

export default {
  // 倒计时
  'img-url': {
    async bind (el, binding, vnode) {
      let imgURL = binding.value // 获取图片地址
      let defaultURL = el.getAttribute('src') || defaultImg// 获取默认图片地址
      console.log(`imgUrl`, imgURL)
      if (imgURL) {
        let exist = await imageIsExist(imgURL)
        if (exist) {
          el.setAttribute('src', imgURL)
        } else {
          if (defaultURL) {
            el.setAttribute('src', defaultURL)
          }
        }
      }
    },
    update (el, binding, vnode) {
      if (binding.oldValue !== binding.value) {
        console.log(`imgUrl-update`, binding)
      }
    }
  }
}

/**
 * 检测图片是否存在
 * @param url
 */
let imageIsExist = function (url) {
  return new Promise(resolve => {
    var img = new Image()
    img.onload = function () {
      if (this.complete === true) {
        console.log(`imageIsExist`, img)
        resolve(true)
        img = null
      }
    }
    img.onerror = function () {
      resolve(false)
      img = null
    }
    img.src = url
  })
}
