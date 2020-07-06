import njdf from './njdf.js'
import jsEncrypt from './des.js'
import storage from '@/commons/storage'
import { language } from '@/conf/'
const USERBASEINFO = storage.userBaseInfo || {}

// let USERBASEINFO = {
//     asign: "大家好,我是王勇",
//     email: "asdfa@163.com",
//     loginDate: "2018August6th 15:37:27",
//     loginIp: "127.0.0.1",
//     mobile: "13546587895",
//     offTel: "075556895232",
//     openDate: "2009-03-10 00:00:00.0",
//     orgCode: "F10011",
//     orgId: undefined,
//     userCurrRole: "1107",
//     userIcon: "1461728672869.jpeg",
//     userId: "1",
//     userLseId: undefined,
//     userMinPost: "1112",
//     userMinRole: "1107",
//     userName: "王勇",
//     userPass: "093b2d0e75223f44a061eefbc0d822bf",
//     userPost: "1,61,1001,1004,1107,1111,1112,1113",
//     userRole: "1107,1111",
//     userTicket: "DODHK/35T/2DFAWSUU3HLFZFL69Y9CSJ"
// }

let NJSCONSTANTS = {
  SERVICE: 'service',
  PROGRAM: 'menuId'
}
let njs = {
  sessionTimeoutFlag: false
}
njs.baseUrl = ''
njs.ipUrl = window.location.origin + njs.baseUrl
// 记录装载状态
njs.status = 'loaded'
const addProgramParam = function (req) {
  var menuId, fsubsys
  req.forEach(function (item) {
    menuId = getUrlParam(NJSCONSTANTS.PROGRAM)
    fsubsys = getUrlParam('F_SUBSYS')
    if (menuId) {
      item[NJSCONSTANTS.PROGRAM] = menuId
    }
    if (fsubsys) {
      item['F_SUBSYS'] = fsubsys
    }
  })
}
const getUrlParam = function (param) {
  var uri = window.location.search
  var reg = new RegExp(param + '=([^&]*)', 'ig')
  var paramStr = uri.match(reg)
  if (paramStr && paramStr.length > 0) {
    return paramStr[0].substr(param.length + 1)
  } else {
    return ''
  }
}
const getKSDXReqMsgHead = function (request) {
  var reqMsgHeader = {
    LANGUAGE: storage.lang || language.default,
    OP_CODE: USERBASEINFO.USER_CODE || '',
    OP_ROLE: USERBASEINFO.USER_ROLE || '',
    CURR_ROLE: USERBASEINFO.USER_CURR_ROLE || '',
    OP_BRANCH: USERBASEINFO.ORG_CODE || '',
    OP_SITE: USERBASEINFO.OP_SITE || '',
    USER_TICKET_INFO: USERBASEINFO.USER_TICKET_INFO || '',
    OP_WAY: '1',
    OP_LANGUAGE: storage.lang || language.default,
    OP_PROGRAM: request[NJSCONSTANTS.PROGRAM] || '',
    SERVER_ID: request[NJSCONSTANTS.SERVICE] || '',
    MSG_ID: request[NJSCONSTANTS.SERVICE],
    OP_LSE_ID: USERBASEINFO.LSE_ID || '0', // 公共参数增加登录员工的租户信息 		喇建国 	20170714
    OP_LOGINTYPE: USERBASEINFO.OP_LOGINTYPE || '',
    USER_TYPE: USERBASEINFO.USER_TYPE || ''
  }
  return reqMsgHeader
}
const makeJsonRequest = function (requests) {
  var jsonPack = []
  for (var i = 0; i < requests.length; i++) {
    jsonPack[i] = {}
    jsonPack[i].REQ_MSG_HDR = getKSDXReqMsgHead(requests[i])
    jsonPack[i].REQ_COMM_DATA = requests[i]
    /* for(var key in requests[i]){

        } */
  }
  return jsonPack
}
/**
 * 拼请求后台字符串
 * @param json json对象
 * @returns {String} xml格式请求字符串
 */
const makeXmlRequestStr = function (json) {
  var xmlRequestStr =
    '<?xml version="1.0" encoding="UTF-8"?><requests><![CDATA['
  // json对象转json字符串
  var paramJson = njs.jsonArryToString(json)
  xmlRequestStr += paramJson
  xmlRequestStr += ']]></requests>'
  return xmlRequestStr
}
// json格式回调函数
const jsonResultCallback = function (data) {
  let answers = {
    ANSWERS: [
      {
        ANS_MSG_HDR: {
          MSG_CODE: '100',
          MSG_TEXT: '查询无返回结果',
          RESULT_NUM: '0'
        },
        ANS_COMM_DATA: []
      }
    ]
  }
  if (data && data['ANSWERS']) {
    answers = data['ANSWERS']
  }
  let retData = answers
  let retCode = answers[0]['ANS_MSG_HDR']['MSG_CODE']
  let retMsg = answers[0]['ANS_MSG_HDR']['MSG_TEXT']
  let retHead = answers[0]['ANS_MSG_HDR']
  // 100,-130011表示执行成功，没有返回结果

  if (
    retCode === '0' ||
    retCode === '100' ||
    retCode === '-130011' ||
    retCode === '-404'
  ) {
    retData = answers[0]['ANS_COMM_DATA'][0]
    if (
      answers[0]['ANS_COMM_DATA'].length === 3 &&
      answers[0]['ANS_COMM_DATA'][2]['CONFIG']
    ) {
      answers[0]['ANS_COMM_DATA'][2]['CONFIG'] = answers[0]['ANS_MSG_HDR']
    }
  } else if (retCode === '10069') {
    retMsg = '会话过期，请重新进入！'
  } else if (retCode === '2011') {
    retMsg = '接口请求超时！'
  }
  // 对retData做加工，数据转换
  // retData = transformData(retData);
  return {
    code: retCode,
    msg: retMsg,
    data: retData,
    head: retHead
  }
}

const ajaxRequest = function (ajaxParam) {
  var requests = ajaxParam.req || [{}]
  var serviceCode = '0'
  // 获取第一个service的值，用于nginx路由
  if (requests.length > 0) {
    serviceCode = requests[0].service
  }
  for (var i = 0; i < requests.length; i++) {
    if (
      typeof requests[i].service !== 'undefined' &&
      requests[i].service == 'P9999999' &&
      (typeof requests[i].bex_codes === 'undefined' ||
        requests[i].bex_codes == '')
    ) {
      // top.alert(top.$i18n.prop('reqSettingErr'));
      return
    }
    if (
      typeof requests[i].bex_codes === 'string' &&
      typeof requests[i].service === 'undefined'
    ) {
      requests[i].service = 'P9999999'
    }
  }
  try {
    if (requests[0] && requests[0].USER_CODE) {
      var val = requests[0].USER_CODE
      if (val && !$.isNumeric(val)) {
        // USER_CODE不是数字，需要做处理
        requests[0].USER_CODE = ''
      }
    }
    if (requests[0] && requests[0].CUST_CODE) {
      var val = requests[0].CUST_CODE
      if (val && !$.isNumeric(val)) {
        // CUST_CODE不是数字，需要做处理
        requests[0].CUST_CODE = ''
      }
    }
  } catch (ex) {}
  addProgramParam(requests)
  var reqType = 'json'
  var requestStr = ''
  if (reqType == 'json') {
    requests = makeJsonRequest(requests)
    requestStr = '{"REQUESTS":' + JSON.stringify(requests) + '}'
  } else if (reqType == 'xml') {
    requestStr = makeXmlRequestStr(ajaxParam.req)
  }
  if (top && top.njs_debugger) {
    // top.njs_debugger.debug(top.$i18n.prop('njs.core.src.js.batch1'), requestStr);
  }
  var encoderType = 'none' // 默认不加密
  if (ajaxParam.encoderType) {
    encoderType = ajaxParam.encoderType
  }
  // 加密方式
  if (encoderType == 'des') {
    requestStr = jsEncrypt.encrypt(
      requestStr,
      top.window.$kencKey ? top.window.$kencKey : null
    )
  } else if (encoderType == 'desNew') {
    requestStr = encryptNew(
      requestStr,
      top.window.$kencKey ? top.window.$kencKey : null
    )
  } else if (encoderType == 'base64') {
    requestStr = BASE64.encoder(requestStr)
  }
  var ajaxUrl =
    njs.ipUrl +
    '/ucc_server/njdf_ajax?returnType=' +
    reqType +
    '&service=' +
    serviceCode +
    '&encoderType=' +
    encoderType +
    '&loginType=' +
    njdf['loginType']
  if (ajaxParam.url) {
    ajaxParam.url +=
      '&service=' +
      serviceCode +
      '&encoderType=' +
      encoderType +
      '&loginType=' +
      njdf['loginType']
  }
  let params = {
    url: ajaxParam.url || ajaxUrl,
    data: requestStr,
    contentType: 'text/plain; charset=utf-8',
    dataType: reqType
  }
  return params
}
const ImageUpload = function (req) {
  let params = {
    url:
      njs.ipUrl +
      '/ucc_server/njdf_upload?DIR=' +
      req['DIR'] +
      '&service=' +
      req['service'] +
      '&ATTA_CHNL=' +
      req['ATTA_CHNL'] +
      '&UN_RENAME=false',
    data: req['data']
  }
  return params
}
const formateData = req => {
  let data = {
    async: false,
    req: req,
    noProcess: true
  }
  return ajaxRequest(data)
}

export { formateData, jsonResultCallback, ImageUpload }
