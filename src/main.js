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

// 导入用户store和认证工具
import { useUserStore } from '@/stores/user'
import { isAuthenticated, getToken } from '@/utils/auth'
import { startSessionRefresh } from '@/utils/request'

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

// 初始化用户登录状态
const initUserAuth = async () => {
  console.log('main.js: 初始化用户登录状态');
  
  // 检查是否有token
  if (getToken()) {
    console.log('main.js: 检测到token，验证登录状态');
    
    // 验证token是否有效
    if (isAuthenticated()) {
      console.log('main.js: token有效，恢复用户登录状态');
      
      // 获取用户store并检查认证状态
      const userStore = useUserStore();
      await userStore.checkAuth();
      
      // 启动会话刷新，保持登录状态
      startSessionRefresh();
    } else {
      console.warn('main.js: token无效，不恢复登录状态');
    }
  } else {
    console.log('main.js: 未检测到token，用户未登录');
  }
};

// 应用挂载后初始化用户认证状态
app.mount('#app');
initUserAuth();

// 在页面卸载时清理请求状态
window.addEventListener('beforeunload', () => {
  cleanupRequests()
})
