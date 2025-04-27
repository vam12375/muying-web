<template>
  <div class="admin-layout" :class="{'dark-theme': isDarkTheme}">
    <el-container class="admin-container">
      <el-aside width="220px" class="main-sidebar light-theme">
        <div class="logo-container">
          <svg class="logo-icon" width="36" height="36" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆形 -->
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1890ff" />
                <stop offset="100%" stop-color="#36cfc9" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                <feOffset dx="0" dy="1" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            <!-- 主圆形 -->
            <circle cx="32" cy="32" r="30" fill="url(#gradient)" filter="url(#shadow)" />
            
            <!-- 耳朵 -->
            <circle cx="16" cy="16" r="6" fill="#ffffff" />
            <circle cx="48" cy="16" r="6" fill="#ffffff" />
            
            <!-- 脸部特征 -->
            <circle cx="24" cy="24" r="6" fill="#ffffff" />
            <circle cx="40" cy="24" r="6" fill="#ffffff" />
            <circle cx="24" cy="24" r="2" fill="#333333" />
            <circle cx="40" cy="24" r="2" fill="#333333" />
            
            <!-- 可爱的笑容 -->
            <path d="M22 35c0 5.523 4.477 10 10 10s10-4.477 10-10H22z" fill="#ffffff" />
            <path d="M32 41c-2 0-3.5-0.8-3.5-0.8s1 2 3.5 2 3.5-2 3.5-2-1.5 0.8-3.5 0.8z" fill="#ff9999" />
            
            <!-- 腮红 -->
            <circle cx="20" cy="30" r="3" fill="#ff9999" opacity="0.5" />
            <circle cx="44" cy="30" r="3" fill="#ff9999" opacity="0.5" />
            
            <!-- 奶瓶图标 -->
            <g transform="translate(44, 40) scale(0.15) rotate(15)">
              <rect x="20" y="0" width="20" height="10" rx="2" ry="2" fill="#ccf2ff" />
              <rect x="25" y="10" width="10" height="40" rx="5" ry="5" fill="#e6f9ff" />
              <rect x="25" y="10" width="10" height="20" rx="5" ry="5" fill="#ccf2ff" />
              <rect x="30" y="0" width="1" height="10" fill="#b3ecff" />
            </g>
          </svg>
          <h2 class="logo-text">母婴商城管理</h2>
        </div>
        
        <div class="admin-info">
          <el-avatar 
            :src="adminInfo.admin_head || '/images/admin.png'" 
            size="large"
            @error="(e) => handleAvatarError(e, 'top')"
          ></el-avatar>
          <span class="admin-name">{{ adminInfo.admin_name }}</span>
          <div class="admin-role">管理员</div>
        </div>
        
        <el-menu
          router
          :default-active="activeMenu"
          class="sidebar-menu"
          :collapse="isCollapse">
          <el-sub-menu index="products">
            <template #title>
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/admin/products">商品列表</el-menu-item>
            <el-menu-item index="/admin/categories">商品分类</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/admin/orders">
            <el-icon><Tickets /></el-icon>
            <template #title>订单管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>评价管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/parenting-tips">
            <el-icon><Reading /></el-icon>
            <template #title>育儿知识管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/points">
            <el-icon><Coin /></el-icon>
            <template #title>积分管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/coupons">
            <el-icon><Discount /></el-icon>
            <template #title>优惠券管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/cache">
            <el-icon><Monitor /></el-icon>
            <template #title>缓存管理</template>
          </el-menu-item>
          
          <el-sub-menu index="statistics">
            <template #title>
              <el-icon><PieChart /></el-icon>
              <span>数据统计</span>
            </template>
            <el-menu-item index="/admin/dashboard">控制面板</el-menu-item>
            <el-menu-item index="/admin/sales-report">销售报表</el-menu-item>
            <el-menu-item index="/admin/user-behavior">用户行为分析</el-menu-item>
            <el-menu-item index="/admin/statistics">综合统计</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/admin/settings/general">基本设置</el-menu-item>
            <el-menu-item index="/admin/settings/payment">支付设置</el-menu-item>
          </el-sub-menu>
        </el-menu>
        
        <div class="sidebar-footer">
          <el-button type="primary" @click="toggleSidebar" class="collapse-btn">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
        </div>
      </el-aside>
      
      <el-container class="main-container">
        <el-header height="60px" class="main-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <div class="header-search">
              <el-input
                placeholder="搜索..."
                prefix-icon="Search"
                clearable
                class="search-input"
              />
            </div>
            
            <el-tooltip content="切换主题" placement="bottom">
              <el-button circle @click="toggleTheme">
                <el-icon v-if="isDarkTheme"><Moon /></el-icon>
                <el-icon v-else><Sunny /></el-icon>
              </el-button>
            </el-tooltip>
            
            <el-tooltip content="消息中心" placement="bottom">
              <el-button circle @click="showMessageCenter" class="message-btn">
                <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0">
                  <el-icon><Bell /></el-icon>
                </el-badge>
              </el-button>
            </el-tooltip>
            
            <el-dropdown @command="handleCommand" trigger="click">
              <div class="admin-dropdown">
                <el-avatar 
                  :src="adminInfo.admin_head || '/images/admin.png'" 
                  size="small"
                  @error="(e) => handleAvatarError(e, 'sidebar')"
                ></el-avatar>
                <span class="admin-name">{{ adminInfo.admin_name || '管理员' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="password">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="keepAliveComponents">
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
        
        <el-footer height="40px" class="main-footer">
          <div>© {{ new Date().getFullYear() }} 母婴商城管理系统 版权所有</div>
        </el-footer>
      </el-container>
    </el-container>
    
    <!-- 消息中心弹窗 -->
    <el-dialog
      v-model="messageDialogVisible"
      title="消息中心"
      width="600px"
      class="message-center-dialog"
      destroy-on-close
    >
      <div class="message-header">
        <el-tabs v-model="messageType" @tab-change="handleMessageTypeChange">
          <el-tab-pane label="全部消息" name="all"></el-tab-pane>
          <el-tab-pane label="系统通知" name="1"></el-tab-pane>
          <el-tab-pane label="订单通知" name="2"></el-tab-pane>
          <el-tab-pane label="活动通知" name="3"></el-tab-pane>
        </el-tabs>
        
        <div class="message-actions">
          <el-button type="primary" size="small" @click="markAllAsRead" v-if="hasUnreadMessages">
            全部标为已读
          </el-button>
        </div>
      </div>
      
      <div class="message-list">
        <el-empty v-if="messages.length === 0" description="暂无消息"></el-empty>
        
        <el-scrollbar height="400px" v-else>
          <div
            v-for="(msg, index) in messages"
            :key="msg.messageId"
            class="message-item"
            :class="{ 'is-unread': !msg.isRead }"
            @click="viewMessage(msg)"
          >
            <div class="message-dot" v-if="!msg.isRead"></div>
            <div class="message-content">
              <div class="message-title">
                <span>{{ msg.title }}</span>
                <span class="message-time">{{ formatTime(msg.createTime) }}</span>
              </div>
              <div class="message-brief">{{ msg.content }}</div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
    
    <!-- 消息详情弹窗 -->
    <el-dialog
      v-model="messageDetailVisible"
      title="消息详情"
      width="500px"
      class="message-detail-dialog"
      destroy-on-close
    >
      <div v-if="currentMessage" class="message-detail-content">
        <h3 class="message-detail-title">{{ currentMessage.title }}</h3>
        <div class="message-detail-meta">
          <span class="message-detail-time">{{ formatTime(currentMessage.createTime) }}</span>
        </div>
        <div class="message-detail-body">
          {{ currentMessage.content }}
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeMessageDetail">关闭</el-button>
          <el-button type="danger" @click="deleteMessage(currentMessage)" v-if="currentMessage">
            删除
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  DataBoard, Goods, Document, User, PieChart, Setting, 
  Fold, Expand, Bell, Moon, Sunny, ArrowDown, Search, Tickets, Reading, ChatDotRound, Coin, Monitor, Discount 
} from '@element-plus/icons-vue';
import { getAdminInfo, adminLogout } from '@/api/admin'; // 导入管理员API
import { getMessages, markMessageRead, markAllRead as markAllMessagesRead, deleteMessage as deleteAdminMessage } from '@/api/message'; // 导入消息API

const route = useRoute();
const router = useRouter();

const adminInfo = ref({
  admin_name: '管理员',
  admin_head: ''
});

const isCollapse = ref(false);
const isDarkTheme = ref(false);
const keepAliveComponents = ref(['Dashboard']);
const breadcrumbs = ref([]);

const activeMenu = computed(() => {
  return route.path;
});

// 生成面包屑导航数据
watch(() => route.path, (newPath) => {
  breadcrumbs.value = [];
  
  if (newPath.includes('/admin/dashboard')) {
    breadcrumbs.value.push({ title: '控制面板' });
  } else if (newPath.includes('/admin/products')) {
    breadcrumbs.value.push({ title: '商品管理' });
    if (newPath !== '/admin/products') {
      breadcrumbs.value.push({ title: '商品详情' });
    }
  } else if (newPath.includes('/admin/orders')) {
    breadcrumbs.value.push({ title: '订单管理' });
    if (newPath !== '/admin/orders') {
      breadcrumbs.value.push({ title: '订单详情' });
    }
  } else if (newPath.includes('/admin/users')) {
    breadcrumbs.value.push({ title: '用户管理' });
  } else if (newPath.includes('/admin/reviews')) {
    breadcrumbs.value.push({ title: '评价管理' });
  } else if (newPath.includes('/admin/parenting-tips')) {
    breadcrumbs.value.push({ title: '育儿知识管理' });
  } else if (newPath.includes('/admin/statistics')) {
    breadcrumbs.value.push({ title: '数据统计' });
  } else if (newPath.includes('/admin/settings')) {
    breadcrumbs.value.push({ title: '系统设置' });
  } else if (newPath.includes('/admin/points')) {
    breadcrumbs.value.push({ title: '积分管理' });
  } else if (newPath.includes('/admin/cache')) {
    breadcrumbs.value.push({ title: '缓存管理' });
  }
}, { immediate: true });

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value;
  localStorage.setItem('adminSidebarCollapsed', isCollapse.value ? 'true' : 'false');
};

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value;
  localStorage.setItem('adminDarkTheme', isDarkTheme.value ? 'true' : 'false');
  
  // 增强版主题切换 - 确保样式正确应用
  applyTheme(isDarkTheme.value);
  
  console.log('主题已切换为:', isDarkTheme.value ? 'dark' : 'light');
};

// 抽取主题应用函数，便于复用
const applyTheme = (isDark) => {
  // 主布局
  const adminLayoutElement = document.querySelector('.admin-layout');
  
  // 侧边栏
  const sidebarElement = document.querySelector('.main-sidebar');
  
  // 主内容区
  const mainContentElement = document.querySelector('.main-content');
  
  // 头部
  const headerElement = document.querySelector('.main-header');
  
  // 底部
  const footerElement = document.querySelector('.main-footer');
  
  if (adminLayoutElement) {
    console.log('应用主题到布局元素:', isDark ? 'dark' : 'light');
    
    if (isDark) {
      adminLayoutElement.classList.add('dark-theme');
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#141414';
      document.body.style.color = '#fff';
      
      // 添加主题特定类
      if (sidebarElement) sidebarElement.classList.remove('light-theme');
      if (mainContentElement) mainContentElement.style.backgroundColor = '#1f1f1f';
      if (headerElement) headerElement.style.backgroundColor = '#1f1f1f';
      if (headerElement) headerElement.style.color = '#fff';
      if (footerElement) footerElement.style.backgroundColor = '#1f1f1f';
      if (footerElement) footerElement.style.color = '#aaa';
    } else {
      adminLayoutElement.classList.remove('dark-theme');
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      
      // 恢复默认
      if (sidebarElement) sidebarElement.classList.add('light-theme');
      if (mainContentElement) mainContentElement.style.backgroundColor = '';
      if (headerElement) headerElement.style.backgroundColor = '';
      if (headerElement) headerElement.style.color = '';
      if (footerElement) footerElement.style.backgroundColor = '';
      if (footerElement) footerElement.style.color = '';
    }
  } else {
    console.error('未找到主布局元素，无法应用主题');
  }
};

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      try {
        // 调用退出登录接口
        await adminLogout();
        
        // 清除本地存储的管理员信息
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminInfo');
        
        router.push('/admin/login');
        ElMessage.success('已成功退出登录');
      } catch (error) {
        console.error('退出登录失败:', error);
        
        // 如果API退出失败，仍然清除本地信息并跳转
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminInfo');
        
        router.push('/admin/login');
        ElMessage.warning('退出登录时发生错误，已手动清除登录状态');
      }
    }).catch(() => {
      // 取消操作，不做任何处理
    });
  } else if (command === 'profile') {
    router.push('/admin/profile');
  } else if (command === 'password') {
    router.push('/admin/change-password');
  }
};

const handleAvatarError = (e, position) => {
  console.error(`头像加载失败(${position}):`, e);
  console.log('尝试加载的头像URL:', adminInfo.value.admin_head);
  
  // 检查当前头像是否为绝对路径的图片
  if (adminInfo.value.admin_head === '/images/admin.png') {
    console.log('默认头像也加载失败，切换到内联SVG');
  }
  
  // 使用一个内联SVG作为备用头像
  const backupAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23f56a00"/><text x="50%" y="50%" dy=".3em" fill="%23fff" font-size="16" text-anchor="middle">管理</text></svg>';
  
  adminInfo.value.admin_head = backupAvatar;
  
  // 更新localStorage
  localStorage.setItem('adminInfo', JSON.stringify(adminInfo.value));
  localStorage.setItem('adminAvatar', backupAvatar);
};

// 消息中心相关
const messageDialogVisible = ref(false);
const messageDetailVisible = ref(false);
const messages = ref([]);
const currentMessage = ref(null);
const messageType = ref('all');
const unreadCount = ref(0);

// 计算是否有未读消息
const hasUnreadMessages = computed(() => {
  return messages.value.some(msg => !msg.isRead);
});

// 显示消息中心
const showMessageCenter = () => {
  messageDialogVisible.value = true;
  fetchMessages();
};

// 获取消息列表
const fetchMessages = () => {
  const params = {
    page: 1,
    pageSize: 50
  };
  
  if (messageType.value !== 'all') {
    params.type = messageType.value;
  }
  
  getMessages(params).then(res => {
    if (res.code === 200 && res.data) {
      messages.value = res.data.records || [];
      
      // 更新未读消息数量
      unreadCount.value = messages.value.filter(msg => !msg.isRead).length;
      
      // 存储到本地，防止刷新后丢失
      localStorage.setItem('adminUnreadCount', unreadCount.value.toString());
    } else {
      messages.value = [];
      ElMessage.error('获取消息失败');
    }
  }).catch(error => {
    console.error('获取消息失败:', error);
    messages.value = [];
  });
};

// 处理消息类型切换
const handleMessageTypeChange = () => {
  fetchMessages();
};

// 查看消息详情
const viewMessage = (message) => {
  currentMessage.value = message;
  messageDetailVisible.value = true;
  
  // 如果消息未读，标记为已读
  if (message && !message.isRead) {
    markMessageRead(message.messageId).then(res => {
      if (res.code === 200) {
        // 更新消息已读状态
        message.isRead = true;
        
        // 更新未读消息数量
        unreadCount.value = messages.value.filter(msg => !msg.isRead).length;
      }
    });
  }
};

// 关闭消息详情
const closeMessageDetail = () => {
  messageDetailVisible.value = false;
  // 刷新消息列表
  fetchMessages();
};

// 全部标为已读
const markAllAsRead = () => {
  markAllMessagesRead().then(res => {
    if (res.code === 200) {
      ElMessage.success('已全部标为已读');
      
      // 更新所有消息为已读状态
      messages.value.forEach(msg => {
        msg.isRead = true;
      });
      
      // 更新未读消息数量
      unreadCount.value = 0;
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  }).catch(error => {
    console.error('标记全部已读失败:', error);
    ElMessage.error('操作失败');
  });
};

// 删除消息
const deleteMessage = (message) => {
  if (!message) return;
  
  ElMessageBox.confirm('确定要删除这条消息吗？', '删除消息', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteAdminMessage(message.messageId).then(res => {
      if (res.code === 200) {
        ElMessage.success('删除成功');
        messageDetailVisible.value = false;
        
        // 从列表中移除该消息
        const index = messages.value.findIndex(m => m.messageId === message.messageId);
        if (index !== -1) {
          messages.value.splice(index, 1);
        }
        
        // 更新未读消息数量
        unreadCount.value = messages.value.filter(msg => !msg.isRead).length;
      } else {
        ElMessage.error(res.message || '删除失败');
      }
    }).catch(error => {
      console.error('删除消息失败:', error);
      ElMessage.error('删除失败');
    });
  }).catch(() => {
    // 用户取消删除操作
  });
};

// 格式化时间
const formatTime = (time) => {
  if (!time) return '';
  
  const date = new Date(time);
  const now = new Date();
  const diff = now - date;
  
  // 一小时内
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes === 0 ? '刚刚' : `${minutes}分钟前`;
  }
  
  // 今天内
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 一周内
  if (diff < 604800000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${days[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  // 更早
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// 专门获取未读消息数量的函数
const fetchUnreadCount = () => {
  getMessages({ page: 1, pageSize: 1, onlyUnread: true }).then(res => {
    if (res.code === 200 && res.data) {
      unreadCount.value = res.data.total || 0;
      localStorage.setItem('adminUnreadCount', unreadCount.value.toString());
    }
  }).catch(error => {
    console.error('获取未读消息数量失败:', error);
  });
};

// 定时获取未读消息数量的计时器
let unreadCountTimer = null;

// 在组件挂载时，添加定时获取未读消息数量的功能
onMounted(() => {
  // 从本地存储读取侧边栏状态
  const savedCollapsed = localStorage.getItem('adminSidebarCollapsed');
  if (savedCollapsed === 'true') {
    isCollapse.value = true;
  }
  
  // 从本地存储读取主题设置
  const savedTheme = localStorage.getItem('adminDarkTheme');
  if (savedTheme === 'true') {
    isDarkTheme.value = true;
    document.body.classList.add('admin-dark-theme');
  }
  
  // 从API获取管理员信息
  getAdminInfo().then(response => {
    if (response.code === 200 && response.data) {
      adminInfo.value = {
        admin_name: response.data.adminName || response.data.admin_name || '管理员',
        admin_head: response.data.adminAvatar || response.data.admin_head || '',
        admin_id: response.data.adminId || response.data.admin_id || ''
      };
      
      // 保存到本地存储
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo.value));
      localStorage.setItem('adminAvatar', adminInfo.value.admin_head);
      
      console.log('从API加载的管理员信息:', adminInfo.value);
    }
  }).catch(error => {
    console.error('获取管理员信息失败:', error);
    // 使用本地存储的信息
    loadLocalAdminInfo();
  });
  
  // 加载主题设置
  const theme = localStorage.getItem('adminTheme');
  console.log('加载的主题设置:', theme);
  
  isDarkTheme.value = theme === 'dark';
  
  // 使用抽取的函数应用主题
  nextTick(() => {
    applyTheme(isDarkTheme.value);
  });
  
  // 显示后端状态
  const lastStatus = localStorage.getItem('backendStatus');
  backendStatus.value = lastStatus === 'online' ? '在线' : '离线';
  
  // 定期检查后端状态
  checkBackendStatus();
  const statusCheckInterval = setInterval(checkBackendStatus, 30000); // 每30秒检查一次
  
  // 组件卸载时清除定时器
  onBeforeUnmount(() => {
    clearInterval(statusCheckInterval);
  });
  
  // 从本地存储恢复未读消息数量
  const savedUnreadCount = localStorage.getItem('adminUnreadCount');
  if (savedUnreadCount) {
    unreadCount.value = parseInt(savedUnreadCount);
  }
  
  // 初始获取一次未读消息数量
  fetchUnreadCount();
  
  // 设置定时器，每分钟获取一次未读消息数量
  unreadCountTimer = setInterval(fetchUnreadCount, 60000);
  
  // 初始化面包屑
  updateBreadcrumbs();
  
  // 监听路由变化
  watch(() => route.path, updateBreadcrumbs);
});

// 加载本地管理员信息的辅助函数
const loadLocalAdminInfo = () => {
  console.log('开始加载本地管理员信息');
  
  // 加载管理员信息
  const storedAdminInfo = localStorage.getItem('adminInfo');
  console.log('存储的管理员信息:', storedAdminInfo);
  
  if (storedAdminInfo) {
    try {
      const parsedInfo = JSON.parse(storedAdminInfo);
      console.log('解析后的管理员信息:', parsedInfo);
      
      // 处理不同格式的管理员信息
      adminInfo.value = {
        admin_name: parsedInfo.adminName || parsedInfo.admin_name || '管理员',
        admin_head: parsedInfo.adminAvatar || parsedInfo.admin_head || '',
        admin_id: parsedInfo.adminId || parsedInfo.admin_id || parsedInfo.adminID || 1
      };
      
      console.log('处理后的管理员信息:', adminInfo.value);
    } catch (e) {
      console.error('解析管理员信息时出错:', e);
      // 使用默认信息
      adminInfo.value = {
        admin_name: '管理员',
        admin_head: '',
        admin_id: 1
      };
    }
    
    // 优先使用专门存储的头像
    const adminAvatar = localStorage.getItem('adminAvatar');
    if (adminAvatar) {
      console.log('从localStorage加载管理员头像:', adminAvatar);
      adminInfo.value.admin_head = adminAvatar;
    }
  } else {
    console.warn('没有找到存储的管理员信息，使用默认信息');
    
    // 单独尝试从localStorage中获取用户名和头像
    const adminName = localStorage.getItem('adminName');
    const adminAvatar = localStorage.getItem('adminAvatar');
    
    adminInfo.value = {
      admin_name: adminName || '管理员',
      admin_head: adminAvatar || '',
      admin_id: 1
    };
  }
  
  // 如果头像为空，使用默认的头像
  if (!adminInfo.value.admin_head) {
    const defaultAvatar = '/images/admin.png';
    console.log('使用默认头像:', defaultAvatar);
    adminInfo.value.admin_head = defaultAvatar;
    
    // 同时更新localStorage中的adminInfo
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo.value));
    localStorage.setItem('adminAvatar', defaultAvatar);
  }
  
  console.log('最终加载的管理员信息:', adminInfo.value);
};

// 在组件销毁前清除定时器
onBeforeUnmount(() => {
  if (unreadCountTimer) {
    clearInterval(unreadCountTimer);
    unreadCountTimer = null;
  }
});
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden; /* 防止出现滚动条 */
  position: fixed;
  top: 0;
  left: 0;
  background-color: #f0f2f5;
  color: #333;
  
  &.dark-theme {
    --sidebar-bg: #1f1f1f;
    --sidebar-text: rgba(255, 255, 255, 0.65);
    --sidebar-active: #1890ff;
    --header-bg: #141414;
    --header-text: #fff;
    --content-bg: #000;
    --card-bg: #141414;
    --border-color: #303030;
    background-color: #141414;
    color: #fff;
  }
}

.admin-container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin-top: 0;
  transition: margin-top 0.3s;
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.main-sidebar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: width 0.3s ease;
  z-index: 1000;
  overflow-x: hidden;
  position: relative;
  
  &.light-theme {
    --sidebar-bg: #ffffff;
    --sidebar-text: #595959;
    --sidebar-active: #1890ff;
    background-color: var(--sidebar-bg);
    
    .logo-text {
      color: #1890ff;
    }
    
    .admin-name {
      color: #262626;
    }
    
    .admin-role {
      color: #8c8c8c;
    }
  }
  
  &.is-collapse {
    width: 64px !important;
  }
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  overflow: hidden;
  border-bottom: 1px solid #f0f0f0;
  
  .logo-icon {
    width: 32px;
    height: 32px;
    margin-right: 10px;
  }
  
  .logo-text {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
  }
}

.admin-info {
  padding: 16px;
  margin-bottom: 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  
  .admin-name {
    display: block;
    margin-top: 6px;
    font-weight: 500;
    font-size: 14px;
  }
  
  .admin-role {
    font-size: 12px;
    margin-top: 2px;
  }
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
  
  :deep(.el-menu-item), :deep(.el-sub-menu__title) {
    color: var(--sidebar-text);
    height: 50px;
    line-height: 50px;
    
    &:hover {
      color: var(--sidebar-active);
      background-color: rgba(24, 144, 255, 0.1);
    }
  }
  
  :deep(.el-menu-item.is-active) {
    color: var(--sidebar-active);
    background-color: rgba(24, 144, 255, 0.1);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background-color: var(--sidebar-active);
    }
  }
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 12px;
  display: flex;
  justify-content: center;
  background-color: var(--sidebar-bg);
  border-top: 1px solid #f0f0f0;
  
  .collapse-btn {
    width: 100%;
  }
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 将蓝色导航栏改为灰色 */
  background-color: #f5f7fa;
  color: #333;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  z-index: 9;
  
  .header-left {
    display: flex;
    align-items: center;
    
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: #666;
        font-weight: normal;
        
        &.is-link:hover {
          color: #1890ff;
        }
      }
      
      &:last-child .el-breadcrumb__inner {
        color: #333;
        font-weight: 500;
      }
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .header-search {
      width: 240px;
      
      :deep(.el-input__wrapper) {
        background-color: #fff;
        box-shadow: 0 0 0 1px #e8e8e8 inset;
        border-radius: 4px;
        
        .el-input__inner {
          color: #333;
          
          &::placeholder {
            color: #999;
          }
        }
        
        .el-input__prefix {
          color: #999;
        }
      }
    }
    
    .el-button.is-circle {
      background-color: #fff;
      border: 1px solid #e8e8e8;
      color: #666;
      transition: all 0.3s;
      
      &:hover {
        color: #1890ff;
        border-color: #1890ff;
      }
    }
    
    .admin-dropdown {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 8px;
      border-radius: 4px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f0f0f0;
      }
      
      .admin-name {
        margin: 0 8px;
        color: #333;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  overflow-y: auto;
  padding: 16px;
  height: calc(100vh - 60px); /* 减去头部高度 */
  
  /* 优化滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.main-footer {
  background-color: #fff;
  color: #999;
  text-align: center;
  line-height: 40px;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
  padding: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.mock-data-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  
  :deep(.el-alert) {
    border-radius: 0;
  }
}

.mock-mode .admin-container {
  height: calc(100vh - 36px);
  margin-top: 36px;
}
</style>

<style>
.el-menu--popup {
  background-color: #ffffff !important;
}

html.dark .el-menu--popup {
  background-color: #1f1f1f !important;
}

.message-btn .el-badge__content {
  z-index: 9;
}

/* 移除商城前台导航栏 */
#app > .el-container {
  display: none;
}

/* 防止全局滚动 */
body {
  overflow: hidden;
}

/* 提示框浅色主题 */
.el-message-box {
  background-color: #fff !important;
  color: #333 !important;
  border-color: #e4e4e4 !important;
}

.el-message-box__title {
  color: #333 !important;
}

.el-message-box__message {
  color: #555 !important;
}

.el-message {
  background-color: #f0f2f5 !important;
  border-color: #e0e0e0 !important;
  color: #333 !important;
}

.el-message--success {
  background-color: #f0f9eb !important;
  border-color: #e1f3d8 !important;
}

.el-message--warning {
  background-color: #fdf6ec !important;
  border-color: #faecd8 !important;
}

.el-message--error {
  background-color: #fef0f0 !important;
  border-color: #fde2e2 !important;
}

.el-message--info {
  background-color: #f4f4f5 !important;
  border-color: #e9e9eb !important;
}

/* 对话框浅色主题 */
.el-dialog {
  background-color: #fff !important;
  color: #333 !important;
}

.el-dialog__title {
  color: #333 !important;
}

.el-dialog__body {
  color: #666 !important;
}

/* 消息中心相关样式 */
.message-center-dialog {
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .message-list {
    min-height: 200px;
    
    .message-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background-color: #f9f9f9;
      }
      
      &.is-unread {
        background-color: #f0f7ff;
        
        &:hover {
          background-color: #e6f1ff;
        }
      }
      
      .message-dot {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #f56c6c;
        left: 5px;
        top: 20px;
      }
      
      .message-content {
        flex: 1;
        margin-left: 10px;
        
        .message-title {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-weight: 500;
          
          .message-time {
            font-size: 12px;
            color: #999;
            font-weight: normal;
          }
        }
        
        .message-brief {
          color: #666;
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }
    }
  }
}

.message-detail-dialog {
  .message-detail-content {
    padding: 10px;
    
    .message-detail-title {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
    }
    
    .message-detail-meta {
      margin-bottom: 20px;
      color: #999;
      font-size: 13px;
    }
    
    .message-detail-body {
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
    }
  }
}
</style>