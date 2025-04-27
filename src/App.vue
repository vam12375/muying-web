<script setup>
import { onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import Navbar from '@/components/layout/Navbar.vue'
import { useRoute } from 'vue-router'

const userStore = useUserStore()
const cartStore = useCartStore()
const route = useRoute()

onMounted(() => {
  // 初始化检查用户登录状态
  userStore.checkAuth()
  
  // 如果用户已登录，加载购物车数据
  if (userStore.isLoggedIn) {
    cartStore.fetchCartItems()
  }
})

// 判断当前是否是登录页面
const isLoginPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})
</script>

<template>
  <div class="app-container">
    <!-- 全局导航栏，在登录页面不显示 -->
    <Navbar v-if="!isLoginPage" />
    
    <div class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style>
/* 应用全局样式在main.scss中 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px; /* 底部间距 */
  position: relative;
  width: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
