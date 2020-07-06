import { addClass, removeClass } from './dom'

class Loading {
  constructor (options) {
    this.queueNum = 0
    this._options = options || {}
    document.body.appendChild((this.$loading = this._buildDom()))
  }

  start () {
    if (this._options.sync) {
      this.queueNum += 1
    }
    this._start()
    return this
  }

  _start () {
    removeClass(this.$loading, 'hidden')
  }

  stop (force) {
    if (this._options.sync) {
      this.queueNum -= 1
    }
    if (this.queueNum <= 0 || force) {
      this.queueNum = 0
      this._stop()
    }
    return this
  }

  _stop () {
    addClass(this.$loading, 'hidden')
  }

  // 创建dom
  _buildDom () {
    const zLoadingBox = this._createElement('g-loading-box hidden')
    const loadContainer = this._createElement('g-loading-rolling')
    zLoadingBox.appendChild(loadContainer)
    loadContainer.appendChild(this._createElement(''))
    return zLoadingBox
  }

  _createElement (className) {
    const div = document.createElement('div')
    div.className = className
    return div
  }
}

export default Loading
