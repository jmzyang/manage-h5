'use strict'
import Vue from 'vue'

// version 1.5.7

import {
  Cell,
  CellGroup,
  Button,
  Popup,
  Checkbox,
  CheckboxGroup,
  DatetimePicker,
  Picker,
  RadioGroup,
  Radio,
  Switch,
  Actionsheet,
  Dialog,
  Loading,
  Notify,
  ImagePreview,
  Toast,
  Slider,
  Uploader,
  Icon,
  Collapse,
  CollapseItem,
  Field,
  Tab,
  Tabs
} from 'vant'

// 样式
import '@vant/cell/style'
import '@vant/cell-group/style'
import '@vant/button/style'
import '@vant/popup/style'
import '@vant/checkbox/style'
import '@vant/checkbox-group/style'
import '@vant/datetime-picker/style'
import '@vant/picker/style'
import '@vant/radio/style'
import '@vant/radio-group/style'
import '@vant/switch/style'
import '@vant/actionsheet/style'
import '@vant/dialog/style'
import '@vant/notify/style'
import '@vant/image-preview/style'
import '@vant/toast/style'
import '@vant/slider/style'
import '@vant/uploader/style'
import '@vant/collapse-item/style'
import '@vant/field/style'
import '@vant/tab/style'
import '@vant/tabs/style'

Vue.use(Cell)
Vue.use(CellGroup)
Vue.use(Button)
Vue.use(Popup)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(DatetimePicker)
Vue.use(Picker)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Switch)
Vue.use(Actionsheet)
Vue.use(Dialog)
Vue.use(Loading)
Vue.use(Notify)
Vue.use(ImagePreview)
Vue.use(Toast)
Vue.use(Slider)
Vue.use(Uploader)
Vue.use(Icon)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Field)
Vue.use(Tab)
Vue.use(Tabs)

Vue.prototype.$Notify = Notify
Vue.prototype.$Dialog = Dialog
Vue.prototype.$Toast = Toast
