import { createApp } from 'vue'
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

app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.mount('#app')
