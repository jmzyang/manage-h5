'use strict'
const _baseUrl = window.location.protocol + '//' + window.location.host + '/fileServer/userIcon/'

export default {
  // avatar
  'avatar': {
    async bind (el, binding, vnode) {
      // nothing
    },
    async inserted (el, binding, vnode) {
      let imgURL = binding.value // 获取图片地址
      let baseUrl = el.getAttribute('base-url') || _baseUrl // 获取默认图片地址
      const fullName = el.getAttribute('full-name') || '无名' // 获取默认图片地址
      const NAME = fullName.substring(fullName.length - 2)
      // el.innerHTML = `${NAME}`
      console.log(`inserted`, imgURL)
      if (imgURL) {
        let exist = await imageIsExist(`${baseUrl + imgURL}`)
        if (exist) {
          el.innerHTML = `<img src="${baseUrl + imgURL}" width="100%" height="100%">`
        } else {
          el.innerHTML = `${NAME}`
        }
      } else {
        el.innerHTML = `${NAME}`
      }
    },
    update (el, binding, vnode) {
      binding.def.inserted(el, binding, vnode)
    },
    unbind (el, binding, vnode) {
      // console.log(`unbind`)
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
