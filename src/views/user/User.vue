<template>
  <div class="user-center">
    <main-layout>
      <div class="container mx-auto py-8 px-4">
        <div class="user-content">
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
            </div>
          </div>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script>
export default {
  name: 'User'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

import UserInfo from '@/components/user/UserInfo.vue'
import AddressManager from '@/components/user/AddressManager.vue'
import FavoriteList from '@/components/user/FavoriteList.vue'
import OrderList from '@/components/user/OrderList.vue'
import UserCoupons from '@/components/user/UserCoupons.vue'
import UserPoints from '@/components/user/UserPoints.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import defaultAvatarImg from '@/assets/default-avatar.png'

// 默认头像
const defaultAvatar = defaultAvatarImg

// 获取用户存储
const userStore = useUserStore()

// 菜单
const menuItems = [
  { key: 'info', label: '个人信息', icon: 'User' },
  { key: 'orders', label: '我的订单', icon: 'Document' },
  { key: 'favorites', label: '我的收藏', icon: 'Star' },
  { key: 'coupons', label: '我的优惠券', icon: 'Ticket' },
  { key: 'points', label: '我的积分', icon: 'Medal' },
  { key: 'address', label: '收货地址', icon: 'Location' }
]

// 当前选中的菜单
const activeMenu = ref('info')

// 动态获取图标组件
const dynamicIconComponent = (name) => {
  return ElementPlusIconsVue[name]
}

// 页面加载时获取用户信息
onMounted(async () => {
  if (userStore.token && !userStore.id) {
    await userStore.fetchUserInfo()
  }
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
