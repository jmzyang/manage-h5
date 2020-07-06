<template lang="pug">
  .sp-menu
    router-link(
      v-for="(item, index) in menu" v-if="resolveAuthorization(item.authorization) && !item.ignoreShow",
      :to="{name: item.index, query: item.query || ''}",
      :class="{'current': isCurrentMenu(item.index)}")
      i(class="iconfont" :class="item.icon")
      .title {{$t(item.name)}}
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Menu',
  props: {},
  computed: {
    ...mapState({
      userBaseInfo: state => state.common.userBaseInfo,
      currentRouter: state => state.route
    })
  },
  data () {
    return {
      navDemoVisible: process.env.NODE_ENV === 'production',
      menu: [
        {
          'id': 1,
          'parent_id': 0,
          'index': 'meeting.notify',
          'name': 'notify',
          'path': '/notify',
          'icon': 'icon-menu-meeting'
        },
        {
          'id': 1,
          'parent_id': 0,
          'index': 'meeting.index',
          'name': 'meeting',
          'path': '/',
          'icon': 'icon-menu-meeting'
        },
        // {
        //   'id': 2,
        //   'parent_id': 0,
        //   'index': 'meetingVerify.index',
        //   'name': 'examine',
        //   'path': '/meeting-verify',
        //   'icon': 'icon-menu-review',
        //   'authorization': '1113'
        // },
        {
          'id': 3,
          'parent_id': 0,
          'index': 'meeting.contacts',
          'name': 'contacts',
          'path': '/',
          'icon': 'icon-menu-meeting'
        },
        // {
        //   'id': 3,
        //   'parent_id': 0,
        //   'index': 'meeting.create',
        //   'name': 'establish',
        //   'path': '/meeting/create',
        //   'icon': 'icon-menu-create'
        // },
        // {
        //   'id': 4,
        //   'parent_id': 0,
        //   'index': 'meetingRoom.index',
        //   'name': 'conferenceHall',
        //   'query': {
        //     'meetingId': '',
        //     'videoConference': 1,
        //     'startTime': '',
        //     'duration': 0,
        //     'mutation': 'M_MEETING_ROOM_SELF',
        //     'stateName': 'meetingRoomSelf',
        //     'businessType': 2
        //   },
        //   'path': '/meeting-room',
        //   'icon': 'icon-menu-meeting-room'
        // },
        {
          'id': 5,
          'parent_id': 0,
          'index': 'my',
          'name': 'my',
          'path': '/my',
          'icon': 'icon-menu-my'
        }]
    }
  },
  mounted () { },
  watch: {
    $route: {
      handler: function (val, oldVal) {
        this.checkAuthorization(val.meta.authorization || '')
      },
      // 深度观察监听
      deep: true
    }
  },
  created () {
    this.checkAuthorization(this.currentRouter.meta.authorization || '')
  },
  methods: {
    resolveAuthorization (_authorizatio) {
      const USER_ROLE = this.userBaseInfo.USER_ROLE ? this.userBaseInfo.USER_ROLE.split(',') : []
      const RESULT = _authorizatio ? USER_ROLE.findIndex(item => +item === +_authorizatio || +item === 1107) > -1 : true
      return RESULT
    },
    checkAuthorization (_authorizatio) {
      if (!this.resolveAuthorization(_authorizatio)) {
        this.$notify(this.$t('noOperationalPermission'))
        this.$router.replace({
          name: 'home'
        })
      }
    },
    // 判断当前路由是否隶属于左侧导航，写在这里方便以后满足其他需求
    isCurrentMenu (data) {
      let result = this.currentRouter.name.indexOf(data) > -1
      return result
    }
  }
}

</script>

<style lang="stylus" scoped>
@import './index.styl'
</style>
