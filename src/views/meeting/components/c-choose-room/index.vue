<template lang="pug">
  .page-wrap.room-box(:loading-text="$t('loading')", v-loading="loading")    
    BarHeader(
      :class="{'blue': +businessType === 2}"
      layout="title",
      :title="$t('addDevice')",
      :back="+businessType === 0 || +businessType === 1 || +businessType === 3",
      :backEvent="true",
      @back="handlerBack")
      template(slot="actions", v-if="+businessType === 2")
        button.submit-header-meeting-room(@click.stop="submit") {{$t('determine')}}({{storeMeetingRoom.length}})
    .room-container
      .room-choice-main
        .room-gather
          .room-search
            .room-search-input(@click="searchVisible = true")
              .icon-search-wrap
                i.iconfont.icon-search 搜索
            //- :: 常用的会场
          .room-name(:class="{'selection': +targetRoom === 0}" @click="selectRoomType(0)")
            | {{$t('all')}}
            //- :: 全部
          template(v-if="orgRoot && orgRoot.length > 0")
            .room-name(v-for="(item, index) in orgRoot" :class="{'selection': targetRoom == item.STRUCTURE_ID}" @click="selectRoomType(item)")
              | {{item.STRUCTURE_NAME}}
        .room-list
          .bar-status-color(v-if="+businessType === 0 || +businessType === 1")
            .item.expired {{$t('notAvailable')}}
            //- 不可用
            .item.locked {{$t('locking')}}
            //- 锁定
            .item.used {{$t('occupy')}}
            //- 占用
            .item.can-use {{$t('free')}}
            //- 空闲
          Scroll.room-card-scroll(
            :pullup="true"
            :pulldown="true"
            :beforeScroll="true"
            @scrollToEnd="scrollToEnd"
            @repeatGetData="repeatData"
            :refreshEnd="refreshState"
            :enableRefresh="true")
            .room-card-container
              //- 0-不可用，1-已预订，2-可用，3-临时锁定
              .room-card(
                v-for="(item, index) in roomsData"
                :class="{'selected': (+item.STATUS === 2 || ignoreShowStatus) && item.checked, 'can-not': +item.STATUS === 0 && !ignoreShowStatus, 'used': +item.STATUS === 1 && !ignoreShowStatus, 'lock': +item.STATUS === 3 && !ignoreShowStatus}"
                @click="handlerSelect(item)")
                .item-header
                  .nanme {{item.ROOM_NAME}}
                  .number {{item.CAPACITY}}{{$t('people')}}
                .item-meta
                  .equipment
                    | {{item.ROOM_EQUIPMENT | meetingRoomEquipment(meetingRoomEquipmentsAlias)}}
                .status(v-if="item.checked")
                  i.iconfont.icon-selected
                .actions-detail(
                  v-if="+item.STATUS === 1"
                  @click.stop="cardDetailSwitch(true, item)")
                  span {{$t('details')}}
                  //- :: 详情
    .actions-footer(@click="selectedVisible = true", v-if="+businessType === 1 || +businessType === 0 || +businessType === 3")
      .total
        span(v-if="+businessType !== 3") {{$t('selected')}}：{{storeMeetingRoom.length}}{{$t('PCS')}}
      .actions
        button.submit(@click.stop="submit") {{$t('determine')}}({{storeMeetingRoom.length}})
    CardMeetingRoomDetail(
      v-show="detailVisible && (+businessType === 1 || +businessType === 0 || +businessType === 3)",
      :params="detailParams",
      @close="cardDetailSwitch(false)")
    Selected(
      v-if="selectedVisible && (+businessType === 1 || +businessType === 0)"
      :startTime="startTime",
      :duration="duration",
      :ignoreCheckRoom="ignoreCheckRoom",
      :meetingType="meetingType",
      :mutation="mutation",
      :state-name="stateName",
      @close="selectedVisible = false",
      @submit="submit")
    CSearch(
      v-if="searchVisible",
      :key-word="keyWord",
      :history-params="historyParams",
      :delete-history-params="deleteHistoryParams",
      @search="searchCallback")
    FilterTab(
      v-if="filterVisible"
      v-model="filterData"
      :equipments="meetingRoomEquipmentsAlias"
      @closeFilter="filterVisible = false")
</template>
<script>
// # 0-不可用，1-已预订，2-可用，3-临时锁定
import { mapState } from 'vuex'
import * as TYPES_COMMON from '@/stores/common/types'
import * as TYPES_MEETING from '@/stores/meeting/types'

import { getDataByKey } from '@/utils/array'

import CardMeetingRoomDetail from './components/c-details'
import Selected from './components/c-selected'
import CSearch from '@/components/c-search'
import FilterTab from './components/c-filter'
import BarHeader from '@/components/c-header'
import Scroll from '@/components/c-scroll/index.vue'

export default {
  props: {
    // // 业务类型 0：创会 1：修改会议, 2: 会场, 3: 会控
    // businessType: {
    //   type: [String, Number],
    //   default: 0
    // },
    // // 会场支持类型 1：视频，2：本地
    // videoConference: {
    //   type: [String],
    //   default: '1'
    // },
    // // 会议类型，1：即时 2：预约，3：周期
    // meetingType: {
    //   type: [String],
    //   default: '2'
    // },
    // // 会议开始时间
    // startTime: {
    //   type: [String],
    //   default: ''
    // },
    // // 会议持续时长
    // duration: {
    //   type: [Number],
    //   default: 30
    // },
    // // 所选会场数据在vuex中存储的的地址
    // stateName: {
    //   type: [String],
    //   required: true,
    //   default: 'meetingRoom'
    // },
    // // 改变所选会场数据的mutation
    // mutation: {
    //   type: [String],
    //   required: true,
    //   default: TYPES_MEETING.M_MEETING_ROOM
    // },
    // // 会议ID，在修改会议的时候用到此参数
    // meetingId: {
    //   type: [String],
    //   default: ''
    // }
  },
  computed: {
    // 不需要校验会场是否可用
    ignoreCheckRoom () {
      return +this.businessType === 2 || +this.businessType === 3
    },
    // 不需要展示状态
    ignoreShowStatus () {
      return +this.businessType === 2
    },
    checkedAll: {
      get () {
        let result = false
        let _roomsData = this.roomsData.filter(item => +item.STATUS === 2 || this.ignoreCheckRoom)
        if (_roomsData.length > 0 && _roomsData.every(item => item.checked === true)) {
          result = true
        } else {
          result = false
        }
        return result
      },
      set (val) {
        // 如果是本地会议、会控拉会场，禁止触发全选
        if (+this.videoConference === 2 || +this.businessType === 3) {
          
        } else {
          const TYPE = val ? 'concat' : 'delete'
          if (TYPE === 'concat') {
            !this.ignoreCheckRoom && this.lockMeetingRoomAdd(this.roomsData.filter(item => +item.STATUS === 2))
          }
          this.$store.commit(TYPES_MEETING[this.mutation], {
            ignoreCheckRoom: this.ignoreCheckRoom,
            meetingType: this.meetingType,
            timeRange: {
              startTime: this.startTime,
              duration: this.duration
            },
            type: TYPE,
            value: this.roomsData.filter(item => +item.STATUS === 2 || this.ignoreShowStatus)
          })
        }
      }
    },
    ...mapState({
      storeMutationForm (state) {
        // 根据业务类型参数判断
        let result = TYPES_MEETING.M_MEETING_FORM_DATA
        const BUSINESS_TYPE = +state.route.query.businessType
        if (BUSINESS_TYPE === 1) {
          result = TYPES_MEETING.M_MEETING_FORM_DATA_EDIT
        }
        return result
      },
      orgRoot: (state) => state.common.orgMeetingRoom,
      meetingRoomEquipmentsAlias: (state) => state.common.meetingRoomEquipmentsAlias,
      storeMeetingRoom (state)  {
        return state.meeting[this.stateName]
      }
    })
  },
  watch: {
    // 会议类型
    mettingType (val) {
      this.refreshData()
    },
    // 监听已选会场
    storeMeetingRoom (val) {
      this.roomsData.forEach((item, index) => {
        if (+item.STATUS === 2 || this.ignoreShowStatus) {
          let _index = val.findIndex(row => +item.ROOM_ID === +row.ROOM_ID)
          this.$set(this.roomsData[index], 'checked', _index > -1 ? true : false)
        }
      })
    },
    // 监听过滤条件
    filterData () {
      this.refreshData()
    }
  },
  data () {
    return {
      // 入参
      businessType: this.$route.query.businessType,
      videoConference: this.$route.query.videoConference,
      meetingType: this.$route.query.meetingType || '2',
      startTime: this.$route.query.startTime,
      duration: this.$route.query.duration,
      stateName: this.$route.query.stateName,
      mutation: this.$route.query.mutation,
      meetingId: this.$route.query.meetingId,
      // 组件参数
      loading: false,
      roomsData: [],
      headerTitle: this.$t('topMeetingRoom'), //- :: 常用会场
      targetRoom: -1, // 会场列表选中状态
      curPage: 1, // 页码
      pageSize: 10, // 每页数据条数
      total: 0,
      refreshState: '',
      filterVisible: false, // 展开筛选
      selectedVisible: false, // 展开已选会场
      detailVisible: false, // 展示详情
      detailParams: {}, // 卡片详情参数
      keyWord: '',
      filterData: { // 过滤条件数据
        have: false, // 是否有过滤条件
        room_equipment: '',
        capacity: ''
      },
      searchVisible: false,
      // 获取历史搜索记录入参
      historyParams: {
        service: 'M4002004',
        mask: false,
        SEARCH_TYPE: '1'
      },
      // 删除历史记录入参
      deleteHistoryParams: {
        service: 'M4002005',
        mask: false,
        SEARCH_TYPE: '1'
      }
    }
  },  
  mounted () {
    this.$nextTick(() => {
      this.getRoom(-1)
    })
  },
  created () {
    // 获取最新组织机构
    this.$store.dispatch(TYPES_COMMON.A_ORG_MEETING_ROOM)
    // 获取最新会场设备别名数据
    this.$store.dispatch(TYPES_COMMON.A_MEETING_ROOM_EQUIPMENTS_ALIAS)
  },
  components: {
    BarHeader,
    FilterTab,
    Selected,
    CSearch,
    CardMeetingRoomDetail,
    Scroll
  },
  methods: {
    searchCallback (_data) {
      console.log(`searchCallback`, _data)
      this.searchVisible = false
      this.keyWord = _data
      this.refreshData()
    },
    selectRoomType (roomType) {
      this.curPage = 1
      if (roomType === -1) {
        this.targetRoom = -1
        this.headerTitle = this.$t('topMeetingRoom') // :: 常用的会场
        this.getRoom(-1, true)
      } else if (roomType.STRUCTURE_ID) {
        this.targetRoom = roomType.STRUCTURE_ID
        this.headerTitle = `${roomType.STRUCTURE_NAME}${this.$t('of')}${this.$t('conferenceHall')}`
        this.getRoom(roomType.STRUCTURE_ID, true)
      } else {
        this.targetRoom = 0
        this.headerTitle = this.$t('allMeetingRoom') // :: 全部的会场
        this.getRoom(0, true)
      }
    },
    /*********************************************************
     * 获取会场
     * @params _id, 左侧分类
     * @params _isChangeCate，是否切换分类触发 
     * ****************************************************/ 
    async getRoom (_id, _isChangeCate, _end) {
      if ((+this.businessType === 1 || +this.businessType === 0) && (!this.startTime || !this.duration)) {
        // this.$Notify(`请选择时间`)
        return false
      }
      // loading
      this.loading = true
      // 公共入参
      let options = {
        Number: 1,
        mask: false,
        metting_type: 2, // 2表示预约会议
        page: this.curPage,
        pagecount: this.pageSize,
        metting_startTime: ((this.businessType === 1 || this.businessType === 0 || this.businessType === 3) ? this.startTime : ''),
        duration: this.duration,
        room_name: this.keyWord,
        room_equipment: this.filterData.room_equipment,
        capacity: this.filterData.capacity
      }
      // 判断分类
      if (+_id === -1) {
        options.service = 'M4002003'
      } else if (+_id > -1) {
        options.service = 'P1202582'
        options.room_dept_id = (+_id === 0 ? '' : _id)
      } else {
        this.$Notify(this.$t('parameterError')) // :: 参数错误
        return false
      }
      // 出参
      let result = await this.$ajaxRequest(options, () => {
        this.loading = false
      })
      // 数据处理
      if (+result.code === 0) {
        this.getRoomCallback(result.data, _isChangeCate)
      }
    },
    getRoomCallback (data, _isChangeCate, _end) {
      console.log(`getRoomCallback`, data)
      let list = data.map(item => {
        if (+item.STATUS === 2 || this.ignoreShowStatus) {          
          let _index = this.storeMeetingRoom.findIndex(row => +item.ROOM_ID === +row.ROOM_ID)
          item.checked = (_index > -1 ? true : false)
        }
        return item
      })
      if (_isChangeCate) {
        // 深度拷贝下，防止视图更新失败
        this.roomsData = JSON.parse(JSON.stringify(list))
      } else {
        // 深度拷贝下，防止视图更新失败
        this.roomsData = JSON.parse(JSON.stringify(this.roomsData.concat(list)))
      }
      if (_end) {
        this.refreshState = '2'
      } else {
        this.refreshState = '1'
      }
    },
    // 锁定会场
    async lockMeetingRoomAdd (_room) {
      console.log(`lockMeetingRoomAdd`, +this.meetingType, _room)
      // 判断会场长度
      if (_room.length === 0) {
        return false
      }
      // 入参
      let options
      // 预约会议
      if (+this.meetingType === 1 || +this.meetingType === 2) {
        options = {
          service: 'M4005101',
          METTING_STARTTIME: this.startTime,
          DURATION: this.duration,
          ROOM_ID: getDataByKey(_room, 'ROOM_ID').join(','),
          mask: false
        }
        let result = await this.$ajaxRequest(options)
        console.log(`lockMeetingRoomAdd`, result)
      }
    },
    scrollToEnd () {
      console.log(`scrollToEnd`)
      // 上拉加载
      this.refreshState = ''
      this.curPage += 1
      this.getRoom(this.targetRoom, false, 'end')
    },
    repeatData () {
      // 下拉刷新
      this.refreshState = ''
      this.curPage = 1
      this.refreshData()
    },
    cardDetailSwitch (_val, _item) {
      let _time = 150
      if (_val && _item) {
        this.detailParams = {
          ROOM_ID: _item.ROOM_ID,
          roomName: _item.ROOM_NAME,
          duration: this.duration,
          metting_type: '2',
          metting_startTime: this.startTime
        }
      }
      if (_val) {
        _time = 150
      }
      setTimeout(()=> {
        this.detailVisible = _val
      }, _time)      
    },
    handlerSelect (_item) {
      // 可选状态才改变
      // 不需要展示状态
      if (+_item.STATUS !== 2 && !this.ignoreShowStatus) {
        return false
      }
      const TYPE = _item.checked ? 'delete' : 'concat'
      if (TYPE === 'concat') {
        if (+this.videoConference === 2 || +this.businessType === 3) {
          this.$store.commit(TYPES_MEETING[this.mutation], {
            ignoreCheckRoom: this.ignoreCheckRoom,
            meetingType: this.meetingType,
            timeRange: {
              startTime: this.startTime,
              duration: this.duration
            },
            oldVal: this.storeMeetingRoom,
            value: [_item]
          })
        } else {
          !this.ignoreShowStatus && this.lockMeetingRoomAdd([_item])
          this.$store.commit(TYPES_MEETING[this.mutation], {
            ignoreCheckRoom: this.ignoreCheckRoom,
            meetingType: this.meetingType,
            timeRange: {
              startTime: this.startTime,
              duration: this.duration
            },
            type: 'concat',
            value: [_item]
          })
        }
      } else {
        this.$store.commit(TYPES_MEETING[this.mutation], {
          ignoreCheckRoom: this.ignoreCheckRoom,
          meetingType: this.meetingType,
          timeRange: {
            startTime: this.startTime,
            duration: this.duration
          },
          type: 'delete',
          value: [_item]
        })
      }
    },
    countTotal (orgId) {
      let num = 0
      this.storeMeetingRoom.forEach((item) => {
        if (this.storeMeetingRoom[this.stateName].some((result) => {
          return result.ROOM_ID === item.ROOM_ID
        })) {
          num++
        }
      })
      return num > 0 ? `(${num})` : ''
    },
    toSearch () {
      let routerName = 'meeting.create.create-search-meeting'
      if (+this.businessType === 2) {
        routerName = 'meetingRoom.search'
      } else if (+this.businessType === 1) {
        routerName = 'meeting.edt.create-search-meeting'
      }else if (+this.businessType === 3){
        routerName = 'meetingControl.search'
      }
      this.$router.push({
        name: routerName,
        params: {
          placeholder: this.$t('inputRoomNameSearch'),  // 输入会场名称搜索
          selectType: this.selectType,
          businessType: this.businessType,
          videoConference: this.videoConference,
          meetingType: this.meetingType,
          startTime: this.startTime,
          duration: this.duration,
          stateName: this.stateName,
          mutation: this.mutation,
          meetingId: this.meetingId,
          searchWays: [
            {
              wayName: this.$t('roomNameSearch'),  // 按会场名称搜索
              wayCode: 1
            }
          ],
          historyType: '1'
        }
      })
    },
    refreshData () {
      if (this.targetRoom === -1) {
        this.getRoom(-1, true)
      } else if (+this.targetRoom !== 0) {
        this.getRoom(this.targetRoom, true)
      } else {
        this.getRoom(0, true)
      }
    },
    searchClose () {
      // 会议控制-关闭选择会场
      this.$emit('searchClose', '')
    },
    controlOperation () {
      // 会议控制-确定选择会场
      this.$emit('controlOperation', '')
    },
    handlerBack () {
      this.$Dialog.confirm({
        title: this.$t('tips'),
        message: this.$t('exitOperation'), // 确定退出此操作吗？
        showCancelButton: true
      }).then(action => {
        if (action === 'confirm') {          
          switch (+this.businessType) {
            case 0:
              // 创会
              this.$store.commit(this.mutation, {
                type: 'clear'
              })
              this.$router.replace({
                name: 'meeting.create'
              })
              break
            case 1:
              // 修改会议
              this.$store.commit(this.mutation, {
                type: 'clear'
              })
              this.$router.replace({
                name: 'meeting.edit',
                params: {
                  meetingId: this.meetingId
                }
              })
              break
            case 3:
              // 会控
              this.$router.push({
                name: 'meeting-control',
                query: {
                  meetingId: this.$route.query.meetingId,// 会议ID
                  platId: this.$route.query.platId,// 什么什么ID
                  meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地

                  founderName: this.$route.query.founderName,
                  unread: this.$route.query.unread,
                  listType: this.$route.query.listType,
                  currentNav: this.$route.query.currentNav,
                }
              })
            default:
              break
          }
        }
      })
    },
    // 提交
    submit () {      
      switch (+this.businessType) {
        case 0:
          // 创会
          this.$store.commit(TYPES_MEETING[this.storeMutationForm], {
            type: 'assign',
            value: {
              meetingRoom: this.storeMeetingRoom
            }
          })
          this.$store.commit(this.mutation, {
            type: 'clear'
          })
          this.$router.replace({
            name: 'meeting.create'
          })
          break
        case 1:
          // 修改会议
          this.$store.commit(TYPES_MEETING[this.storeMutationForm], {
            type: 'assign',
            value: {
              meetingRoom: this.storeMeetingRoom
            }
          })
          this.$store.commit(this.mutation, {
            type: 'clear'
          })
          this.$router.replace({
            name: 'meeting.edit',
            params: {
              meetingId: this.meetingId
            }
          })
          break
        case 2:
          // 会场创会
          if(this.storeMeetingRoom.length > 0) {
            this.$router.push({
              name: 'meetingRoom.status',
              query: {
                startTime: this.$route.query.startTime,
                selectedTimes: this.$route.query.selectedTimes || []
              }
            })
          }else{
            this.$Notify({duration: 1000, message: this.$t('chooseVenue')});
          }
          break
        case 3:
          // 会控添加会场
          let failRoom = []
          this.storeMeetingRoom.forEach(val => {
            if(!val.ROOM_TERMINAL_URI){
              this.$set(failRoom, failRoom.length, val.ROOM_NAME)
            }
          })
          if(failRoom.length > 0){
            this.$Notify({message: `${this.$t('conferenceHall')}：${failRoom.join('、')}${this.$t('notVideo')}`});
          }else if(this.storeMeetingRoom.length < 1){
            this.$Notify({message:this.$t('chooseTheMeetingRoomToJoin')}); // :: 请选择需要加入的会场！
          }else{
            this.addMeetingRoom()
          }
        default:
          break
      }
    },
    async addMeetingRoom() {
      // 添加会场
      let req = [{
        service:'P1202625',
        metting_plat_id: this.$route.query.platId, // 会场ID
        siteUris: getDataByKey(this.storeMeetingRoom, 'ROOM_TERMINAL_URI').join(','), // 邀请入会的会场uri字符串集合
        metting_id: this.$route.query.meetingId, // 会议ID
        room_id: getDataByKey(this.storeMeetingRoom, 'ROOM_ID').join(',') // 邀请入会的会场ID集合
      }];
      let result = await this.$ajaxRequest(req)
      if (result.code === '0') {
        this.$Notify({message:result.msg,duration: 1000,background: '#1989fa'});
        this.$router.push({
          name: 'meeting-control',
          query: {
            meetingId: this.$route.query.meetingId,// 会议ID
            platId: this.$route.query.platId,// 什么什么ID
            meetingType: this.$route.query.meetingType,// 会议控制类型，1：视频；2：本地

            founderName: this.$route.query.founderName,
            unread: this.$route.query.unread,
            listType: this.$route.query.listType,
            currentNav: this.$route.query.currentNav,
          }
        })
      } else {
        this.$Notify({message:result.msg});
      }
    },
  }
}
</script>
<style lang="stylus">
@import './index.styl'
</style>
