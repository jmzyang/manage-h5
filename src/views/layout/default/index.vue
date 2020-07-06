<template lang="pug">
.layout-wrap
  .bar.bar-footer(v-if="showFooter")
    Menu
  .-mainlayout(:class="{'android': $isAndroid}")
    transition(:name="transitionName")
      router-view(:key="key", style="animation-duration: 0.2s")
    //- 会议详情回退到日历页面
    //- transition(:name="transitionName")
    //-   keep-alive
    //-     router-view(v-if="$route.meta.keepAlive" style="animation-duration: 0.2s")
    //- transition(:name="transitionName")
    //-   router-view(v-if="!$route.meta.keepAlive" style="animation-duration: 0.2s")

    //- transition(:name="transitionName")
    //-   keep-alive
    //-     router-view(v-if="$route.meta.keepAlive && $route.meta.routerViewName === 'createMeeting'", key="createMeeting",  style="animation-duration: 0.2s") <!--创建会议专用的router-view-->
    //- transition(:name="transitionName")
    //-   router-view(v-if="!$route.meta.keepAlive", key="default", style="animation-duration: 0.2s")
</template>

<script>
import { mapState } from 'vuex'
import * as TYPES_CONTACTS from '@/stores/common/types'
import MxInit from '@/mixins/init'
import * as TYPES_MEETING from '@/stores/meeting/types'
import { isAndroid, isiOS } from '@/utils/device'
import Header from '@/components/c-header'
import Menu from '@/components/c-menu'
import { getDataByKey } from '@/utils/array'
export default {
  name: 'Layout',
  mixins: [MxInit],
  data () {
    return {
      isAndroid: isAndroid,
      footerVisible: true,
      showFooter: false,
      baseInfo: null,
      bodyHeight: 400,
      transitionName: 'fade'
    }
  },
  computed: {
    key () {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  },
  created () {
    if (this.$isAndroid) {
      this.$android.setBarTopColor(this.$route.meta.barStatusBg, this.$route.meta.barStatusIsDark || 'true')
    }
    // this.getSystemParameter()
    this.resolveFooterVisible(this.$route.name)
    this.setConvenor()
  },
  mounted () { },
  watch: {
    $route: {
      handler: function (val, oldVal) {
        this.resolveFooterVisible(val.name)
        // alert(val.name)
        if (this.$isAndroid) {
          this.$android.setBarTopColor(this.$route.meta.barStatusBg, this.$route.meta.barStatusIsDark || 'true')
        }
      },
      // 深度观察监听
      deep: true
    }
  },
  updated () {},
  methods: {
    // async getSystemParameter () {
    //   let req = [
    //     {
    //       service: 'P0000001',
    //       page: 1,
    //       pagecount: 10,
    //       PARAM_CODE:'',
    //       mask: false // 禁用全局菊花
    //     }
    //   ]
    //   let result = await this.$ajaxRequest(req)
    //   let KIparameter = {}
    //   if (result.code === '0') {
    //     result.data.forEach(element => {
    //       this.$set(KIparameter, element.PARAM_CODE, element.PARAM_VAL)
    //     });
    //   }
    //   this.$store.commit(TYPES_CONTACTS['M_KIPARAMETER'], {
    //     val: KIparameter
    //   })
    // },
    // 判断底部导航
    resolveFooterVisible (_name) {
      let footShowArr = ['meeting.index', 'meetingVerify.index', 'my.index', 'meetingRoom.index', 'notify.index']
      if (footShowArr.includes(_name)) {
        this.showFooter = true
      } else {
        this.showFooter = false
      }
    },
    // 设置主持人
    setConvenor () {
      this.$store.commit(TYPES_MEETING.M_MEETING_FORM_DATA, {
        type: 'assign',
        value: {
          convenor: { organization: [],
            member: [{
              USER_CODE: this.$store.state.common.userBaseInfo.USER_CODE + '',
              USER_NAME: this.$store.state.common.userBaseInfo.USER_NAME,
              CONTACTS_TYPE: '0'
            }],
            total: 1 }
        }
      })
    }
  },
  components: {
    Header,
    Menu
  }
}
</script>

<style lang="stylus">
@import './index.styl'
</style>
