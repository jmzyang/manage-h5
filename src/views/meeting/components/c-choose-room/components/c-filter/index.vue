<template lang="pug">
transition(:name="transition[0]", :enter-active-class="transition[1]", :leave-active-class="transition[2]")
  .filter-box(style="animation-duration: 0.5s", @click.self="closePage")
    .filter-main
      .accommodate
        .accommodate-title
          | {{$t('inclusionRadio')}}
          //- :: 容纳人数(单选)
        .accommodate-card(
          v-for="value in accommodateCard"
          @click="accommodateState = accommodateState === value.val ? '' : value.val"
          :class="{selection:accommodateState === value.val}")
          | {{value.content}}
      .equipment
        .equipment-title
          | {{$t('venueEquipmentOptional')}}
          //- :: 会场设备(可多选)
        .equipment-card(
          v-for="value in equipments"
          @click="choiceEquipment(value.EQUIPMENT_ID)"
          :class="{selection: equipmentState.indexOf(value.EQUIPMENT_ID) > -1}")
          | {{value.EQUIPMENT_NAME}}
      .operation
        .operation-reset(@click="reset")
          | {{$t('reset')}}
          //- :: 重置
        .operation-sure(@click="submit")
          | {{$t('determine')}}
          //- :: 确定
</template>
<script>
export default {
  props: {
    transition: {
      type: [Array],
      default: ()=> ['slide', 'slideInRight', 'slideOutRight']
    },
    value: {
      type: [Object],
      default: ()=> {}
    },
    equipments: {
      type: [Array],
      default: ()=> []
    }
  },
  data () {
    return {
      accommodateCard: [
        { content: `10${this.$t('people')}`, val: 10 }, // :: 人
        { content: `15${this.$t('people')}`, val: 15 },
        { content: `20${this.$t('people')}`, val: 20 },
        { content: `25${this.$t('people')}`, val: 25 },
        { content: `30${this.$t('people')}`, val: 30 },
        { content: `35${this.$t('people')}`, val: 35 },
        { content: `40${this.$t('people')}`, val: 40 },
        { content: `45${this.$t('people')}`, val: 45 }
      ],
      accommodateState: '', // 容纳人数
      equipmentState: [] // 选中设备
    }
  },
  created () {
    this.accommodateState = this.value.capacity
    this.equipmentState = this.value.room_equipment ? this.value.room_equipment.split(',') : []
  },  
  methods: {
    close () {
      this.$emit('closeFilter', false)
    },
    choiceEquipment (val) {
      // 设备多选
      let vm = this
      if (vm.equipmentState.indexOf(val) > -1) {
        let index = vm.equipmentState.findIndex(fruit => fruit === val)
        vm.equipmentState.splice(index, 1)
      } else {
        vm.equipmentState.push(val)
      }
    },
    closePage () {
      this.equipmentState = []
      this.accommodateState = ''
      this.close()
    },
    reset () {
      this.equipmentState = []
      this.accommodateState = ''
      // this.$emit('input', {
      //   have: false, // 是否有过滤条件
      //   room_equipment: '',
      //   capacity: ''
      // })
      // this.$emit('closeFilter', false)
    },    
    submit () {
      if (this.accommodateState || this.equipmentState.length) {
        this.$emit('input', {
          have: true, // 是否有过滤条件
          room_equipment: this.equipmentState.join(','),
          capacity: this.accommodateState
        })
      } else {
        this.$emit('input', {
          have: false, // 是否有过滤条件
          room_equipment: '',
          capacity: ''
        })
      }
      this.close()
    }
  }
}
</script>
<style lang="stylus" scoped>
@import './index.styl'
</style>
