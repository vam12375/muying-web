/**
 * 简单的事件总线实现
 * 用于不同组件间的通信
 */
class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * 监听事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {any} payload - 事件数据
   */
  emit(event, payload) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(payload)
      })
    }
  }

  /**
   * 移除事件监听
   * @param {string} event - 事件名称
   * @param {Function} callback - 指定的回调函数(可选)
   */
  off(event, callback) {
    if (this.events[event]) {
      if (callback) {
        this.events[event] = this.events[event].filter(cb => cb !== callback)
      } else {
        delete this.events[event]
      }
    }
  }

  /**
   * 只监听一次事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  once(event, callback) {
    const onceCallback = payload => {
      callback(payload)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

export default new EventBus() 