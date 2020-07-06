'use strict'
import Vue from 'vue'

// 阿拉伯数字转换为中文数字
const toChinesNum = (num) => {
  if (num > 0) {
    let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    let unit = ['', '十', '百', '千', '万']
    num = parseInt(num)
    let getWan = (temp) => {
      let strArr = temp.toString().split('').reverse()
      let newNum = ''
      strArr.forEach((value, index) => {
        newNum = (index === 0 && value === 0 ? '' : (index > 0 && value === 0 && strArr[index - 1] === 0 ? '' : changeNum[value] + (value === 0 ? unit[0] : unit[index]))) + newNum
      })
      if (newNum[0] === '一' && newNum[1] === '十') {
        newNum = newNum.substring(1, newNum.length)
      }
      return newNum
    }
    let overWan = Math.floor(num / 10000)
    let noWan = num % 10000
    if (noWan.toString().length < 4) noWan = '0' + noWan
    return overWan ? getWan(overWan) + '万' + getWan(noWan) : getWan(num)
  }
}

Vue.prototype.$toChinesNum = toChinesNum
