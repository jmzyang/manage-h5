'use strict'

import moment from 'moment'

const LEAP_MONTHS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const NONLEAP_MONTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const self = {
  daysInYear (year) {
    return self.isLeapYear(year) ? 366 : 365
  },
  daysInMonth (year, month) {
    return self.isLeapYear(year) ? LEAP_MONTHS[month] : NONLEAP_MONTHS[month]
  },
  isLeapYear (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  },
  takesTime (val, other, format) {
    if (!val) {
      return val
    }
    const mbegin = moment(val)
    const mend = moment(other)
    const diff = mend.diff(mbegin, 'seconds')
    return self.secondsFormat(diff, format)
  },
  seconds2HMS (diff) {
    const seconds = diff % 60
    const minutes = (diff - seconds) % 3600
    const hours = diff - minutes - seconds
    return [hours / 3600, minutes / 60, seconds]
  },
  secondsFormat (diff, format) {
    format = format || 'HH小时mm分'
    let val = self.seconds2HMS(diff)
    val = format.replace(/HH/g, val[0])
      .replace(/mm/g, val[1])
      .replace(/ss/g, val[2])
    return val
  },
  milliseconds2HMS (diff) {
    const millisecond = diff % 1000
    diff = diff - millisecond
    return self.seconds2HMS(diff / 1000)
  },
  toZeroStr (val, num = 2) {
    num = num || 2
    return (new Array(num)
      .join('0') + val)
      .slice(-num)
  },
  // 获取生日
  getBirthday (psidno) {
    let birthdayno
    let birthdaytemp
    if (psidno.length === 18) {
      birthdayno = psidno.substring(6, 14)
    } else if (psidno.length === 15) {
      birthdaytemp = psidno.substring(6, 12)
      birthdayno = `19${birthdaytemp}`
    } else {
      return null
    }
    let birthday = [birthdayno.substring(0, 4), birthdayno.substring(4, 6), birthdayno.substring(6, 8)]
    return moment(birthday).isValid() ? birthday : null
  },
  // 获取性别
  getSex (psidno) {
    let sexno
    if (psidno.length === 18) {
      sexno = psidno.substring(16, 17)
    } else if (psidno.length === 15) {
      sexno = psidno.substring(14, 15)
    } else {
      return null
    }
    let tempid = sexno % 2
    return tempid === 0 ? 0 : 1
  },
  // 设置标题
  setTitle (title) {
    document.title = title
    const mobile = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(mobile)) {
      const iframe = document.createElement('iframe')
      iframe.style.visibility = 'hidden'
      iframe.style.width = '1px'
      iframe.style.height = '1px'
      iframe.setAttribute('src', '/favicon.ico')
      const iframeCallback = () => {
        setTimeout(() => {
          iframe.removeEventListener('load', iframeCallback)
          document.body.removeChild(iframe)
        }, 0)
      }
      iframe.addEventListener('load', iframeCallback)
      document.body.appendChild(iframe)
    }
  }
}

export default self
