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
          <router-link to="/messages" class="icon-item" v-if="isLoggedIn">
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
          <div 
            class="avatar-container" 
            @mouseenter="handleMouseEnter" 
            @mouseleave="handleMenuMouseLeave"
            @click="toggleDropdown"
          >
            <el-avatar :src="userInfo.avatar" :size="40">{{ userStore.username.substring(0, 1) }}</el-avatar>
            <span class="username">{{ userStore.username }}</span>
          </div>
          
          <!-- 下拉菜单 -->
          <div 
            v-show="showDropdown" 
            class="dropdown-menu"
            @mouseenter="handleMenuMouseEnter"
            @mouseleave="handleMenuMouseLeave"
          >
            <router-link to="/user" class="dropdown-item" @click="closeDropdown">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </router-link>
            <router-link to="/orders" class="dropdown-item" @click="closeDropdown">
              <el-icon><List /></el-icon>
              <span>我的订单</span>
            </router-link>
            <router-link to="/messages" class="dropdown-item" @click="closeDropdown">
              <el-icon><Message /></el-icon>
              <span>消息中心</span>
              <el-badge v-if="unreadMessages" :value="unreadMessages" :max="99" class="item-badge" />
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
  name: 'NavbarComponent'
}
</script>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useMessageStore } from '@/stores/message'
import { Search, Message, ShoppingCart, User, List, Star, Discount, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import defaultAvatarImg from '@/assets/default-avatar.png'

// 状态
const searchKeyword = ref('')
const isFixed = ref(false)
const showDropdown = ref(false)
const hasNewNotification = ref(false)
const messageRefreshTimer = ref(null)
const dropdownCloseTimer = ref(null) // 下拉菜单关闭定时器
const hoverDelay = 300 // 悬停延迟时间（毫秒）

// Store
const userStore = useUserStore()
const cartStore = useCartStore()
const messageStore = useMessageStore()
const router = useRouter()
const route = useRoute()

// 计算属性
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => {
  // 智能修复头像URL
  let avatarUrl = userStore.avatar || defaultAvatarImg
  if (userStore.avatar) {
    avatarUrl = userStore.fixAvatarUrl(userStore.avatar)
    console.log('Navbar: 修复后的头像URL:', avatarUrl)
    
    // 如果修复后为空，使用默认头像
    if (!avatarUrl) {
      avatarUrl = defaultAvatarImg
    }
  }
  
  return {
    nickname: userStore.nickname || userStore.username,
    avatar: avatarUrl,
    id: userStore.id
  }
})
const cartItemCount = computed(() => {
  const count = cartStore.cartItemCount;
  console.log('Navbar 显示的购物车数量:', count);
  return count;
})
const unreadMessages = computed(() => messageStore.unreadCount)

// 判断当前是否在商品详情页
const isProductDetailPage = computed(() => {
  return route.path.includes('/product/');
})

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

// 鼠标移入头像区域
const handleMouseEnter = () => {
  // 清除可能存在的关闭定时器
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value)
    dropdownCloseTimer.value = null
  }
  // 显示下拉菜单
  showDropdown.value = true
}

// 鼠标移入下拉菜单
const handleMenuMouseEnter = () => {
  // 清除关闭定时器
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value)
    dropdownCloseTimer.value = null
  }
}

// 鼠标移出下拉菜单
const handleMenuMouseLeave = () => {
  // 延迟关闭菜单，给用户一定的操作时间
  dropdownCloseTimer.value = setTimeout(() => {
    showDropdown.value = false
    dropdownCloseTimer.value = null
  }, hoverDelay)
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
  // 只有当点击的不是用户资料区域且下拉菜单正在显示时才关闭菜单
  if (userProfile && !userProfile.contains(event.target) && showDropdown.value) {
    // 立即关闭菜单，无需延迟
    showDropdown.value = false
    // 清除可能存在的定时器
    if (dropdownCloseTimer.value) {
      clearTimeout(dropdownCloseTimer.value)
      dropdownCloseTimer.value = null
    }
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
  // 只有在非商品详情页时启用吸顶效果
  if (isProductDetailPage.value) {
    isFixed.value = false;
  } else {
    isFixed.value = window.scrollY > 0;
  }
}

// 刷新购物车数量
const refreshCartCount = async () => {
  if (isLoggedIn.value) {
    try {
      await cartStore.fetchCartItems();
    } catch (error) {
      console.error('刷新购物车数据失败:', error);
    }
  }
}

// 刷新消息数量
const refreshMessageCount = async () => {
  if (isLoggedIn.value) {
    try {
      await messageStore.fetchUnreadCount();
      // 根据未读消息数量更新通知点
      hasNewNotification.value = messageStore.hasUnreadMessages;
    } catch (error) {
      console.error('刷新消息数量失败:', error);
    }
  }
}

// 组件挂载
onMounted(() => {
  // 刷新购物车数量
  refreshCartCount();
  
  // 刷新消息数量
  refreshMessageCount();
  
  // 设置定时刷新消息数量
  messageRefreshTimer.value = setInterval(refreshMessageCount, 60000); // 每60秒刷新一次
  
  // 添加点击外部关闭下拉菜单的事件监听
  document.addEventListener('click', handleClickOutside);
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 初始化状态
});

// 组件卸载
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', handleScroll);
  
  // 清除消息刷新定时器
  if (messageRefreshTimer.value) {
    clearInterval(messageRefreshTimer.value);
  }
  
  // 清除下拉菜单定时器
  if (dropdownCloseTimer.value) {
    clearTimeout(dropdownCloseTimer.value);
  }
});
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
  align-items: center;
  gap: 20px;
  margin-right: 20px;
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
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.avatar-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 1000;
  opacity: 1;
  transform-origin: top right;
  transform: translateY(0);
  transition: opacity 0.25s ease, transform 0.25s ease;
  
  &:before {
    content: '';
    position: absolute;
    top: -16px;
    right: 12px;
    border: 8px solid transparent;
    border-bottom-color: white;
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #333;
  transition: background-color 0.3s;
  text-decoration: none;
  position: relative;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 8px 0;
}

.logout-item {
  color: #f56c6c;
  cursor: pointer;
}

.logout-item:hover {
  background-color: #fef0f0;
}

.item-badge {
  position: absolute;
  right: 16px;
}

/* 通知红点样式 */
.notification-dot {
  margin-left: 2px;
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

/* 使用Vue的v-show过渡效果 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style> 