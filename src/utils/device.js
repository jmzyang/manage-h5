'use strict'

const USERAGENT = navigator.userAgent

export const isAndroid = (USERAGENT.indexOf('Android') > -1 || USERAGENT.indexOf('Adr') > -1)

export const isiOS = !!USERAGENT.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
