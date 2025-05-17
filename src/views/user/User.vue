<template>
  <div class="user-center">
    <div class="container mx-auto py-8 px-4">
      <div v-if="isUserReady" class="user-content">
        <!-- 侧边栏导航栏-->
        <div class="user-sidebar">
          <div class="bg-white rounded-lg shadow-md p-6">
            <!-- 用户基本信息 -->
            <div class="flex flex-col items-center mb-6">
              <div class="avatar-container mb-4">
                <img :src="userStore.avatar || defaultAvatar" :alt="userStore.username || '用户'" class="rounded-full h-24 w-24 object-cover border-2 border-gray-200">
              </div>
              <p class="text-gray-500 mb-2">{{ userStore.email }}</p>
            </div>
            
            <!-- 导航菜单 -->
            <div class="user-menu">
              <div 
                v-for="(menu, index) in menuItems" 
                :key="index"
                :class="['menu-item', { active: activeMenu === menu.key }]"
                @click="activeMenu = menu.key"
              >
                <el-icon class="menu-icon">
                  <component :is="dynamicIconComponent(menu.icon)" />
                </el-icon>
                <span>{{ menu.label }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div class="user-main-content">
          <div class="bg-white rounded-lg shadow-md p-6">
            <!-- 根据选中的菜单显示对应组件-->
            <user-info v-if="activeMenu === 'info'" />
            <address-manager v-else-if="activeMenu === 'address'" />
            <favorite-list v-else-if="activeMenu === 'favorites'" />
            <order-list v-else-if="activeMenu === 'orders'" />
            <user-coupons v-else-if="activeMenu === 'coupons'" />
            <user-points v-else-if="activeMenu === 'points'" />
            <user-comments v-else-if="activeMenu === 'comments'" />
          </div>
        </div>
      </div>
      <div v-else class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'User'
}
</script>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import UserInfo from '@/components/user/UserInfo.vue'
import AddressManager from '@/components/user/AddressManager.vue'
import FavoriteList from '@/components/user/FavoriteList.vue'
import OrderList from '@/components/user/OrderList.vue'
import UserCoupons from '@/components/user/UserCoupons.vue'
import UserPoints from '@/components/user/UserPoints.vue'
import UserComments from '@/components/user/UserComments.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Comment } from '@element-plus/icons-vue'
import defaultAvatarImg from '@/assets/default-avatar.png'

// 默认头像
const defaultAvatar = defaultAvatarImg

// 获取用户存储
const userStore = useUserStore()

// 获取路由实例
const router = useRouter()

// 用户信息是否准备好
const isUserReady = computed(() => {
  const hasUserId = userStore.id || userStore.userId;
  const isReady = userStore.isLoggedIn && hasUserId;
  console.log('User.vue isUserReady computed:', isReady, '(isLoggedIn:', userStore.isLoggedIn, ', userId:', hasUserId, ')');
  return isReady;
})

// 菜单
const menuItems = [
  { key: 'info', label: '个人信息', icon: 'User' },
  { key: 'orders', label: '我的订单', icon: 'Document' },
  { key: 'favorites', label: '我的收藏', icon: 'Star' },
  { key: 'coupons', label: '我的优惠券', icon: 'Ticket' },
  { key: 'points', label: '我的积分', icon: 'Medal' },
  { key: 'address', label: '收货地址', icon: 'Location' },
  { key: 'comments', label: '我的评价', icon: 'Comment' }
]

// 当前选中的菜单
const activeMenu = ref('info')

// 动态获取图标组件
const dynamicIconComponent = (name) => {
  return ElementPlusIconsVue[name]
}

// 页面加载时获取用户信息
onMounted(async () => {
  console.log('User.vue onMounted: 检查用户登录状态');
  
  // 先检查是否有token
  if (!userStore.token) {
    console.log('User.vue: 未检测到token，尝试检查认证状态');
    const authStatus = await userStore.checkAuth();
    if (!authStatus) {
      console.log('User.vue: 用户未登录，跳转到登录页面');
      ElMessage.error('请先登录');
      router.push('/login');
      return;
    }
  }
  
  // 如果有token但没有用户ID，尝试获取用户信息
  const userId = userStore.id || userStore.userId;
  if (!userId) {
    console.log('User.vue: 有token但无用户ID，尝试获取用户信息');
    const success = await userStore.fetchUserInfo();
    if (!success) {
      console.log('User.vue: 获取用户信息失败，跳转到登录页面');
      ElMessage.error('获取用户信息失败，请重新登录');
      router.push('/login');
      return;
    }
  }
  
  // 再次检查用户ID
  const currentUserId = userStore.id || userStore.userId;
  console.log('User.vue: 用户信息加载成功，用户ID:', currentUserId);
})
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.user-content {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.user-sidebar {
  width: 260px;
  flex-shrink: 0;
}

.user-main-content {
  flex: 1;
}

.user-menu {
  margin-top: 24px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 400;
  color: #606266;
  letter-spacing: 0.5px;
}

.menu-icon {
  margin-right: 12px;
  font-size: 18px;
}

.menu-item:hover {
  background-color: #fff1f3;
  color: #f27c8d;
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(242, 124, 141, 0.1);
}

.menu-item.active {
  background-color: #fff1f3;
  color: #f27c8d;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(242, 124, 141, 0.1);
}

.menu-item.active .menu-icon {
  color: #f27c8d;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .user-content {
    flex-direction: column;
  }
  
  .user-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style> 
