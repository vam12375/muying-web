<template>
  <div :class="['navbar-container', { 'is-fixed': isFixed }]">
    <div class="navbar-wrapper">
      <!-- 左侧Logo和导航链接 -->
      <div class="navbar-left">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="母婴商城" class="logo-img" />
          <h1 class="logo-text">母婴商城</h1>
        </div>
        <nav class="nav-links">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/products" class="nav-item">商品列表</router-link>
          <router-link to="/points" class="nav-item">积分商城</router-link>
          <router-link to="/cart" class="nav-item">购物车</router-link>
          <router-link to="/help" class="nav-item">
            帮助
            <el-badge v-if="hasNewNotification" is-dot class="notification-dot" />
          </router-link>
        </nav>
      </div>

      <!-- 中间搜索框 -->
      <div class="search-container">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品"
          class="search-input"
          :prefix-icon="Search"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 右侧用户区域 -->
      <div class="navbar-right">
        <div class="icon-group">
          <router-link to="/messages" class="icon-item">
            <el-badge :value="unreadMessages" :max="99" :hidden="!unreadMessages">
              <el-icon :size="24"><Message /></el-icon>
            </el-badge>
          </router-link>
          <router-link to="/cart" class="icon-item">
            <el-badge :value="cartItemCount" :max="99" :hidden="!cartItemCount">
              <el-icon :size="24"><ShoppingCart /></el-icon>
            </el-badge>
          </router-link>
        </div>

        <!-- 未登录状态 -->
        <div v-if="!isLoggedIn" class="auth-buttons">
          <router-link to="/login" class="login-btn">登录</router-link>
          <router-link to="/register" class="register-btn">
            <el-button type="primary" size="small" round>注册</el-button>
          </router-link>
        </div>

        <!-- 已登录状态 - 改进交互方式 -->
        <div v-else class="user-profile">
          <div class="avatar-container" @click="toggleDropdown">
            <el-avatar :src="userInfo.avatar" :size="40">{{ userStore.username.substring(0, 1) }}</el-avatar>
            <span class="username">{{ userStore.username }}</span>
          </div>
          
          <!-- 下拉菜单 -->
          <div v-show="showDropdown" class="dropdown-menu">
            <router-link to="/user" class="dropdown-item" @click="closeDropdown">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </router-link>
            <router-link to="/orders" class="dropdown-item" @click="closeDropdown">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </router-link>
            <router-link to="/favorites" class="dropdown-item" @click="closeDropdown">
              <el-icon><Star /></el-icon>
              <span>我的收藏</span>
            </router-link>
            <router-link to="/coupons" class="dropdown-item" @click="closeDropdown">
              <el-icon><Discount /></el-icon>
              <span>我的优惠券</span>
            </router-link>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item logout-item" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { Search, Message, ShoppingCart, Menu, User, List, Star, Discount, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultAvatarImg from '@/assets/default-avatar.png'

// 状态
const searchKeyword = ref('')
const isFixed = ref(false)
const showDropdown = ref(false)
const unreadMessages = ref(0)
const hasNewNotification = ref(true)

// Store
const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => ({
  nickname: userStore.nickname || userStore.username,
  avatar: userStore.avatar || defaultAvatarImg,
  id: userStore.id
}))
const cartItemCount = computed(() => cartStore.cartItemCount)

// 方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  })
}

// 切换下拉菜单显示状态
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 关闭下拉菜单方法
const closeDropdown = () => {
  nextTick(() => {
    showDropdown.value = false
  })
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const userProfile = document.querySelector('.user-profile')
  if (userProfile && !userProfile.contains(event.target) && showDropdown.value) {
    showDropdown.value = false
  }
}

const handleLogout = async () => {
  try {
    // 先关闭菜单，再执行登出操作
    closeDropdown()
    await userStore.userLogout()
    ElMessage.success('退出登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('退出登录失败，请重试')
    console.error('登出错误:', error)
  }
}

// 监听滚动实现吸顶效果
const handleScroll = () => {
  isFixed.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', handleClickOutside)
  // 模拟获取未读消息数量
  unreadMessages.value = 5
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.navbar-container {
  width: 100%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  z-index: 100;
  border-bottom: 1px solid rgba(242, 124, 141, 0.12);

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
    animation: slideDown 0.3s ease;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

.navbar-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 15px;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: 25px;
  cursor: pointer;
  transition: transform 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.02);
  }

  .logo-img {
    width: 42px;
    height: 42px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    margin-left: 8px;
    color: #f27c8d;
    letter-spacing: 0.5px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.nav-links {
  display: flex;
  align-items: center;
  height: 100%;
  flex-shrink: 0;

  .nav-item {
    height: 72px;
    line-height: 72px;
    padding: 0 15px;
    font-size: 16px;
    color: #303133;
    text-decoration: none;
    position: relative;
    transition: color 0.3s ease;
    font-weight: 500;
    letter-spacing: 0.3px;
    white-space: nowrap;
    min-width: 56px;
    text-align: center;
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 3px;
      background-color: #f27c8d;
      transition: width 0.3s ease;
    }

    &:hover, &.router-link-active {
      color: #f27c8d;
      
      &:after {
        width: 60%;
      }
    }

    .notification-dot {
      margin-left: 4px;
    }
  }
}

.search-container {
  flex: 1;
  min-width: 200px;
  max-width: 380px;
  margin: 0 15px;

  .search-input {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    border-radius: 22px;
    box-shadow: 0 0 0 1px rgba(242, 124, 141, 0.2);
    transition: all 0.3s ease;
    
    &:hover, &:focus-within {
      box-shadow: 0 0 0 1px rgba(242, 124, 141, 0.5);
    }
  }

  :deep(.el-input__inner) {
    font-size: 15px;
  }

  :deep(.el-input-group__append) {
    border-top-right-radius: 22px;
    border-bottom-right-radius: 22px;
    
    .el-button {
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      background-color: #f27c8d;
      border-color: #f27c8d;
      font-weight: 500;
      
      &:hover {
        background-color: #f06c7d;
        border-color: #f06c7d;
      }
    }
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 15px;
}

.icon-group {
  display: flex;
  margin-right: 18px;
  flex-shrink: 0;

  .icon-item {
    margin: 0 12px;
    position: relative;
    color: #606266;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      color: #f27c8d;
      transform: translateY(-2px);
    }
  }
}

.auth-buttons {
  display: flex;
  align-items: center;

  .login-btn {
    margin-right: 15px;
    color: #606266;
    text-decoration: none;
    font-size: 15px;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      color: #f27c8d;
      transform: translateY(-1px);
    }
  }
  
  .register-btn {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
    
    :deep(.el-button) {
      background-color: #f27c8d;
      border-color: #f27c8d;
      font-weight: 500;
      letter-spacing: 0.5px;
      padding: 8px 16px;
      
      &:hover {
        background-color: #f06c7d;
        border-color: #f06c7d;
        box-shadow: 0 4px 12px rgba(242, 124, 141, 0.3);
      }
    }
  }
}

.user-profile {
  position: relative;
  cursor: pointer;

  .avatar-container {
    display: flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 20px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(242, 124, 141, 0.08);
    }
    
    .username {
      margin-left: 10px;
      font-size: 15px;
      max-width: 80px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      color: #333;
    }
  }
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 180px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  padding: 8px 0;
  margin-top: 5px;
  z-index: 100;
  transform-origin: top right;
  animation: dropdownFadeIn 0.25s ease;

  @keyframes dropdownFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    right: 22px;
    width: 10px;
    height: 10px;
    background: white;
    transform: rotate(45deg);
    box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.04);
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    padding: 12px 18px;
    color: #606266;
    text-decoration: none;
    transition: all 0.3s ease;
    font-weight: 500;
    letter-spacing: 0.3px;

    &:hover {
      background: rgba(242, 124, 141, 0.08);
      color: #f27c8d;
      padding-left: 22px;
    }

    .el-icon {
      margin-right: 10px;
      font-size: 18px;
    }
  }

  .dropdown-divider {
    height: 1px;
    background: #ebeef5;
    margin: 6px 0;
  }

  .logout-item {
    color: #f56c6c;
    cursor: pointer;
    
    &:hover {
      background: rgba(245, 108, 108, 0.08);
      color: #f56c6c;
    }
  }
}

/* 移动端适配 */
@media screen and (max-width: 1200px) {
  .navbar-wrapper {
    padding: 0 15px;
  }
  
  .nav-links .nav-item {
    padding: 0 10px;
    font-size: 15px;
  }
  
  .logo-container {
    margin-right: 20px;
    min-width: 100px;
  }
  
  .logo-container .logo-text {
    font-size: 16px;
  }
  
  .search-container {
    min-width: 180px;
    margin: 0 10px;
  }
}

@media screen and (max-width: 992px) {
  .nav-links .nav-item {
    padding: 0 8px;
    font-size: 14px;
    min-width: 42px;
  }
  
  .search-container {
    min-width: 160px;
    margin: 0 8px;
  }
  
  .icon-group {
    margin-right: 10px;
  }
  
  .icon-group .icon-item {
    margin: 0 6px;
  }
  
  .logo-container {
    min-width: 42px;
  }
  
  .logo-container .logo-text {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .nav-links {
    display: none; /* 在移动端隐藏导航链接 */
  }
  
  .search-container {
    min-width: 140px;
    max-width: none;
    flex: 1;
  }
  
  .navbar-left {
    margin-right: 8px;
  }
  
  .navbar-right {
    margin-left: 8px;
  }
}
</style> 