<template lang="pug">
.page-wrap.page-login(v-loading="loading" loading-text="")
  .card-login
    h1 {{$t('hello')}}，
    h2 {{$t('appLoginTitle')}}
    ul
      li
        i.iconfont.icon-account
        input.inpt-account(type="text", autocomplete="off", :maxlength="40",:placeholder="$t('inputAccount')", v-model="userName", v-validate="'required'", name="userName", :data-vv-as="$t('account')")
        span.tips(v-show="errors.has('userName') && false") {{ errors.first('userName') }}
      li
        i.iconfont.icon-password
        input.inpt-pwd(:type="showPwd?'text':'password'", autocomplete="off", :maxlength="40", :placeholder="$t('inputPassword')", v-model="pwd", name="pwd", :data-vv-as="$t('password')", v-validate="'required'")
        i.iconfont.showPwd(:class="{'icon-show-pwd':showPwd,'icon-hide-pwd':!showPwd}", @click="showPwd=!showPwd")
        span.tips(v-show="errors.has('pwd') && false") {{ errors.first('pwd') }}
      li.action
        button.btn-login(:disable="!canLogin", @click="login()") {{$t('signIn')}}
</template>
<script>
// import { mapState } from 'vuex'
import storage from '@/commons/storage'
import { language } from '@/conf/'
import http from '@/commons/http'
import Cookies from 'js-cookie'
import UtilsDes from '@/utils/login-des'
export default {
  data () {
    return {
      userName: '',
      pwd: '',
      showPwd: false,
      kencKey: '', // 动态密钥
      kencPassword: '', // 加密后的密码,
      kencPassword1: '',
      loading: false,
      CODE: '',
      STATE: '',
      flag: false
    }
  },
  created () {
    //  console.log("created  location.href------------>" + location.href)
  },
  components: {},
  computed: {
    // 计算是否输入完成帐号密码能否点击登录
    canLogin () {
      return this.userName && this.pwd
    }
  },
  beforeUpdate () {
    // if (location.search.indexOf('code') > -1 && location.search.indexOf('state') > -1) {
    //   this.$Dialog.alert({
    //     title: 'local', // :: 提示
    //     message: this.$route.query.redirect // :: 会议已超时结束或被删除！
    //   })
    //   const routerParamsData = unescape(this.$route.query.redirect).split('&')
    //   this.$Dialog.alert({
    //     title: this.$t('tips'), // :: 提示
    //     message: JSON.stringify(routerParamsData) // :: 会议已超时结束或被删除！
    //   })
    //   const len = routerParamsData.length
    //   this.CODE = routerParamsData[len - 2].split('=')[1]
    //   this.STATE = routerParamsData[len - 1].split('=')[1]
    // } else {
    //   this.CODE = ''
    //   this.STATE = ''
    // }
    // this.checkSession()
  },
  mounted () {
    // console.log('mounted------>'+location.href)
    // console.log(this.$route.query)
    // welink
    if (this.$isAndroid) {
      this.$android.setBarTopColor(this.$route.meta.barStatusBg, this.$route.meta.barStatusIsDark)
    }
    if (window.location.href.indexOf('code') > -1 && window.location.href.indexOf('state') > -1) {
      if (this.$route.query.code && this.$route.query.state) {
        this.CODE = this.$route.query.code
        this.STATE = this.$route.query.state
      } else {
        const routerParamsData = unescape(this.$route.query.redirect).split('&')
        const len = routerParamsData.length
        this.CODE = routerParamsData[len - 2].split('=')[1]
        this.STATE = routerParamsData[len - 1].split('=')[1]
      }
    } else {
      this.CODE = ''
      this.STATE = ''
    }
    this.checkSession()
    // if(false){
    //   this.loading = true
    //   this.$welink.getAuthCode({
    //     clientId: '20190905150412663734317'
    //   }).then(data => {
    //     this.checkSessionWelink(data.code)
    //     return false
    //   }).catch(error => {
    //   });
    //   this.loading = false
    // }else if(true){
    //   this.checkSession()
    // }else{
    //   // 如果存在存储账号密码则自动登录
    //   if(localStorage.KIuserName && localStorage.KIuserPwd){
    //     this.login(true)
    //   }
    // }
  },
  methods: {
    // welink
    // async getWelinToken (code) {
    //   let result = await http({
    //     isUCCInterfaceNumber: false,
    //     apiType: 'WELINL',
    //     method: 'post',
    //     url: '/tickets',
    //     headers: {
    //       'X-Requested-With': 'XMLHttpRequest',
    //       'Content-Type': 'application/json; charset=utf-8',
    //       'Data-Type': 'text'
    //     },
    //     data: {
    //       "client_id": "20190905150412663734317",
    //       "client_secret": "d1b6c177-7c25-4e1d-9afa-caf1fff3a67f",
    //       "type": "u",
    //       "code": code || ''
    //     }
    //   })
    //   console.log('获取token：',result)
    //   this.getWelinkUserid(result.code)
    // },
    // async getWelinkUserid (code) {
    //   let result = await http({
    //     isUCCInterfaceNumber: false,
    //     apiType: 'WELINL',
    //     method: 'get',
    //     url: '/userid',
    //     headers: {
    //       'X-Requested-With': 'XMLHttpRequest',
    //       'Content-Type': 'application/json; charset=utf-8',
    //       'Data-Type': 'text',
    //       'x-wlk-Authorization': code || ''
    //     }
    //   })
    //   console.log('获取userID：',result)
    //   if(result.code == '0' && result.userId){
    //     this.login(true, result.userId)
    //   }
    // },
    // welink loginType=1
    async checkSessionWelink (code) {
      let result = await http({
        isUCCInterfaceNumber: false,
        apiType: 'UCC',
        method: 'POST',
        url: '/njdf_session' + (code ? `?loginType=1&code=${code}` : ''),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // 传递对象
          'Content-Type': 'application/json; charset=utf-8',
          // 传递字符串
          // 'Content-Type': 'application/x-www-form-urlencoded',
          'Data-Type': 'text'
        }
      })
      if (result.data && result.data.USER_CODE && result.data.USER_PASS) {
        localStorage.KIuserName = result.data.USER_CODE
        localStorage.KIuserPwd = result.data.USER_PASS
        this.login(true)
      }
    },
    // 微信对接 loginType=2
    async checkSession () {
      let result = await http({
        isUCCInterfaceNumber: false,
        apiType: 'UCC',
        method: 'POST',
        url: '/njdf_session?loginType=2&code=' + this.CODE + '&state=' + this.STATE,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // 传递对象
          'Content-Type': 'application/json; charset=utf-8',
          // 传递字符串
          // 'Content-Type': 'application/x-www-form-urlencoded',
          'Data-Type': 'text'
        }
      })
      if (result.data && result.data.USER_CODE && result.data.USER_PASS) {
        localStorage.KIuserName = result.data.USER_CODE
        localStorage.KIuserPwd = result.data.USER_PASS
        this.login(true)
      }
    },

    // 登陆
    login (type) {
      this.$validator.validateAll().then(async (result) => {
        if (result || type) {
          this.loading = true
          Cookies.set('account', this.userName, { expires: 720 })
          storage.xAuthToken = false
          this.kencKey = await http({
            apiType: 'UCC',
            method: 'get',
            url: `/njdf_encrypkey`
          })['data']
          this.kencKey = ''
          if (localStorage.KIuserName && localStorage.KIuserPwd) {
            this.userName = localStorage.KIuserName
            this.kencPassword = localStorage.KIuserPwd
          } else {
            this.kencPassword = UtilsDes.des.encrypt(this.pwd, this.userName)
          }
          let params = {
            USER_ACCOUNT: this.userName,
            TRD_PWD: this.kencPassword,
            VALIDATECODE: '',
            OP_LANGUAGE: storage.lang || language.default
          }
          let requestXmlStr = UtilsDes.des.encrypt(UtilsDes.resolveXml([params]), this.kencKey)
          try {
            let { data: result } = await http({
              apiType: 'UCC',
              method: 'post',
              url: '/njdf_login?encoderType=des',
              mask: false,
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'text/xml; charset=utf-8',
                'Data-Type': 'text'
              },
              data: requestXmlStr
            })
            // 判断是否登录成功
            if (result['IRETCODE'] + '' === '0') {
              localStorage.KIuserName = this.userName
              localStorage.KIuserPwd = this.kencPassword
              for (let lkey in result) {
                this.$store.commit('M_COMMON_LOGIN', { key: lkey, val: result[lkey] })
              }
              storage.xAuthToken = true
              this.redirect()
            } else if (result['FAILCODE'] === '-99') {
              // 删除loading
              localStorage.removeItem('KIuserName')
              localStorage.removeItem('KIuserPwd')
              this.loading = false
              this.$Toast(result['IRETINFO'])
            } else {
              // 删除loading
              localStorage.removeItem('KIuserName')
              localStorage.removeItem('KIuserPwd')
              this.loading = false
              this.$Toast(this.$t('accountOrPasswordError'))
            }
          } catch (e) {
            localStorage.removeItem('KIuserName')
            localStorage.removeItem('KIuserPwd')
            this.loading = false
            console.log(e)
          }
        } else {
          this.$Toast(this.$t('accountOrPasswordEmpty'))
        }
      })
    },
    redirect () {
      // let redirect = this.$route.query.redirect
      // if (redirect) {
      //   this.$router.replace(redirect)
      // } else {
      //   this.$router.replace('meeting')
      // }
      // if (redirect) {
      //   window.location.replace(process.env.BASE_URL + redirect.substr(1))
      // } else {
      window.location.replace(process.env.BASE_URL + 'meeting')
      // }eting?code=' + this.CODE + '&state=' + this.STATE)
      // }
    }
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
