const njdf = {
  version: {
    version: '1.0.0'
  },
  config: {
    title: '',
    version: '1.0',
    minWidth: 900,
    minHeight: 300,
    language: 'zh',
    base: 'njs-base/',
    // theme: 'integration',//银泰皮肤
    // theme: 'ucdef',  //默认皮肤，
    theme: 'chinalife', // 白色皮肤
    style: 'blank.png'
  },
  logining: false,
  desVersion: 'des', // des 旧版des加密，desNew 新版的des加密  base64 base64加密;
  status: 'init',
  treeData: [],
  groups: {},
  njdfmenus: [],
  childMenus: [],
  encKey: '',
  lockCallback: '',
  loginType: 'w3c'
}
export default njdf
