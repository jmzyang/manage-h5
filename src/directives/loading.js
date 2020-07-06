import Vue from 'vue'
import Loading from '@/components/c-loading/'

const Mask = Vue.extend(Loading)

/* istanbul ignore next */
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/
const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

function hasClass (el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
}

function addClass (el, cls) {
  if (!el) return
  var curClass = el.className
  var classes = (cls || '').split(' ')

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
};

function removeClass (el, cls) {
  if (!el || !cls) return
  var classes = cls.split(' ')
  var curClass = ' ' + el.className + ' '

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

function getStyle (element, styleName) {
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

const toggleLoading = (el, binding) => {
  if (binding.value) {
    Vue.nextTick(() => {
      el.originalPosition = getStyle(el, 'position')
      insertDom(el, el, binding)
    })
  } else {
    el.domVisible = false
    removeClass(el, 'el-loading-parent--relative')
    el.instance.visible = false
  }
}
const insertDom = (parent, el, binding) => {
  if (!el.domVisible && getStyle(el, 'display') !== 'none' && getStyle(el, 'visibility') !== 'hidden') {
    if (el.originalPosition !== 'absolute' && el.originalPosition !== 'fixed') {
      addClass(parent, 'el-loading-parent--relative')
    }
    el.domVisible = true
    parent.appendChild(el.mask)
    Vue.nextTick(() => {
      el.instance.visible = true
    })
    el.domInserted = true
  }
}

export default {
  // loading指令
  loading: {
    bind (el, binding, vnode) {
      const textExr = el.getAttribute('loading-text')
      const backgroundExr = el.getAttribute('loading-background')
      const vm = vnode.context
      const mask = new Mask({
        el: document.createElement('div'),
        data: {
          text: vm && vm[textExr] || textExr,
          background: vm && vm[backgroundExr] || backgroundExr
        }
      })
      el.instance = mask
      el.mask = mask.$el

      binding.value && toggleLoading(el, binding)
    },

    update (el, binding, vnode) {
      el.instance.setText(el.getAttribute('loading-text'))
      if (binding.oldValue !== binding.value) {
        toggleLoading(el, binding)
      }
    },

    unbind (el, binding, vnode) {
      if (el.domInserted) {
        el.mask &&
        el.mask.parentNode &&
        el.mask.parentNode.removeChild(el.mask)
        toggleLoading(el, { value: false, modifiers: binding.modifiers })
      }
    }
  }
}
