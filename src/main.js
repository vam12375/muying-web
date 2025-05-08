import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import './assets/styles/main.scss'
import 'animate.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 导入自定义指令


// 引入请求清理函数
import { cleanupRequests } from '@/utils/request'

const app = createApp(App)

// 注册全部Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 初始化AOS
AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: true
})

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(pinia)
app.use(router)

// 在页面卸载前清理请求状态
app.config.globalProperties.$cleanupOnUnmount = () => {
  cleanupRequests()
}

// 挂载应用
app.mount('#app')

// 在页面卸载时清理请求状态
window.addEventListener('beforeunload', () => {
  cleanupRequests()
})
