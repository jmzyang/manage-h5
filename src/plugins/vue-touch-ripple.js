'use strict'

import Vue from 'vue'
import VueTouchRipple from 'vue-touch-ripple'

// mount with global
Vue.use(VueTouchRipple, {
  color: '#000000',
  opacity: 0.05,
  speed: 2,
  transition: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)'
})
