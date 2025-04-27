<template>
  <div class="admin-login-container">
    <div class="login-animation-bg">
      <div class="animation-element baby-icon" v-for="n in 5" :key="n"></div>
      <div class="animation-element bottle-icon" v-for="n in 4" :key="`bottle-${n}`"></div>
      <div class="animation-element rattle-icon" v-for="n in 3" :key="`rattle-${n}`"></div>
    </div>
    
    <div class="login-wrapper">
      <div class="login-header" :class="{ 'animate-header': showAnimations }">
        <div class="logo-container">
          <svg class="logo-icon" width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆形 -->
            <defs>
              <linearGradient id="login-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF85A2" />
                <stop offset="100%" stop-color="#FFA751" />
              </linearGradient>
              <filter id="login-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
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
            <circle cx="42" cy="42" r="36" fill="url(#login-gradient)" filter="url(#login-shadow)" />
            
            <!-- 耳朵 -->
            <circle cx="24" cy="22" r="8" fill="#ffffff" />
            <circle cx="60" cy="22" r="8" fill="#ffffff" />
            
            <!-- 脸部特征 -->
            <circle cx="34" cy="34" r="7" fill="#ffffff" />
            <circle cx="50" cy="34" r="7" fill="#ffffff" />
            <circle cx="34" cy="34" r="3" fill="#444444" />
            <circle cx="50" cy="34" r="3" fill="#444444" />
            
            <!-- 可爱的笑容 -->
            <path d="M32 46c0 5.523 4.477 10 10 10s10-4.477 10-10H32z" fill="#ffffff" />
            <path d="M42 52c-2.5 0-4-1-4-1s1.5 2.5 4 2.5 4-2.5 4-2.5-1.5 1-4 1z" fill="#ff9999" />
            
            <!-- 腮红 -->
            <circle cx="28" cy="40" r="4" fill="#ff9999" opacity="0.7" />
            <circle cx="56" cy="40" r="4" fill="#ff9999" opacity="0.7" />
          </svg>
          <h2 class="title">母婴商城管理系统</h2>
        </div>
      </div>
      
      <el-card class="login-form-card" :class="{ 'animate-card': showAnimations }" :body-style="{ padding: '30px' }">
        <template #header>
          <div class="card-header">
            <h3>管理员登录</h3>
          </div>
        </template>
        
        <el-form 
          :model="loginForm" 
          :rules="rules" 
          ref="loginFormRef" 
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="admin_name" class="form-item-animated">
            <el-input 
              v-model="loginForm.admin_name" 
              placeholder="管理员账号" 
              :prefix-icon="User"
              size="large"
            ></el-input>
          </el-form-item>
          
          <el-form-item prop="admin_pass" class="form-item-animated">
            <el-input 
              v-model="loginForm.admin_pass" 
              type="password" 
              placeholder="密码" 
              :prefix-icon="Lock"
              size="large"
              show-password
            ></el-input>
          </el-form-item>
          
          <div class="form-options form-item-animated">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-link type="primary">忘记密码?</el-link>
          </div>
          
          <el-form-item class="form-item-animated">
            <el-button 
              type="primary" 
              :loading="loading" 
              @click="handleLogin" 
              class="login-button"
            >登录</el-button>
          </el-form-item>
        </el-form>
        
        <div class="server-status-area form-item-animated" v-if="serverStatus !== 'online'">
          <el-alert
            :title="getServerStatusMessage()"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>后端服务器未在线，点击下方按钮使用模拟数据登录</p>
              <el-button type="primary" size="small" @click="handleMockLogin">
                使用模拟数据
              </el-button>
            </template>
          </el-alert>
        </div>
      </el-card>
      
      <div class="login-footer" :class="{ 'animate-footer': showAnimations }">
        <p>© {{ new Date().getFullYear() }} 母婴商城管理系统 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import axios from 'axios';
import { adminLogin } from '@/api/admin'; // 导入管理员登录API

const router = useRouter();
const route = useRoute();
const loginFormRef = ref(null);
const loading = ref(false);
const rememberMe = ref(false);
const serverStatus = ref('checking'); // 'checking', 'online', 'offline'
const showAnimations = ref(false);

const loginForm = reactive({
  admin_name: localStorage.getItem('adminName') || '',
  admin_pass: ''
});

const rules = {
  admin_name: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  admin_pass: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
};

// 检查服务器状态
const isCheckingServer = ref(false); // 添加状态标志，避免重复请求
const maxRetryCount = 1; // 最大重试次数
let retryCount = 0; // 重试计数

const checkServerStatus = async () => {
  // 如果已经在检查中或者已经确认为离线状态，则不重复发送请求
  if (isCheckingServer.value || serverStatus.value === 'offline') {
    return serverStatus.value === 'online';
  }
  
  // 如果已经超过最大重试次数，不再尝试
  if (retryCount >= maxRetryCount) {
    console.log('已达到最大重试次数，停止检查服务器状态');
    serverStatus.value = 'offline';
    return false;
  }
  
  isCheckingServer.value = true;
  retryCount++;
  
  try {
    // 设置超时时间短一些，避免长时间等待
    // 使用fetch代替axios，与其他组件保持一致
    const response = await fetch('/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3秒超时
    });
    
    if (response.ok) {
      serverStatus.value = 'online';
      isCheckingServer.value = false;
      return true;
    }
  } catch (error) {
    console.log('服务器未启动或不可达:', error);
    serverStatus.value = 'offline';
    isCheckingServer.value = false;
    return false;
  }
  
  serverStatus.value = 'offline';
  isCheckingServer.value = false;
  return false;
};

const getServerStatusMessage = () => {
  if (serverStatus.value === 'checking') {
    return '正在检查服务器状态...';
  } else if (serverStatus.value === 'offline') {
    return '后端服务器未启动或不可访问';
  }
  return '';
};

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    loading.value = true;
    
    try {
      try {
        // 尝试连接后端API登录
        const response = await adminLogin(loginForm);
        console.log('登录响应数据:', response);
        
        if (response.code === 200) {
          // 成功登录
          ElMessage.success('登录成功');
          
          // 保存JWT令牌到localStorage
          if (response.data) {
            localStorage.setItem('adminToken', response.data);
            console.log('已保存管理员token:', response.data);
          }
          
          // 确保使用正确的路径格式，避免使用相对路径
          const redirect = route.query.redirect;
          // 强制使用绝对路径跳转到管理后台
          router.push(redirect || '/admin/dashboard');
          
          // 如果仍然无法跳转，尝试timeout后刷新
          setTimeout(() => {
            if (window.location.pathname !== '/admin/dashboard' && !redirect) {
              console.log('使用window.location强制跳转');
              window.location.href = '/admin/dashboard';
            }
          }, 100);
          
          return;
        } else {
          throw new Error(response.message || '账号或密码错误');
        }
      } catch (error) {
        console.warn('后端API登录失败:', error);
        
        // 提示用户后端可能不可用
        if (error.message && (
            error.message.includes('Network Error') || 
            error.message.includes('timeout') || 
            error.message.includes('404') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('401') ||
            error.message.includes('500')
          )) {
          
          // 询问用户是否要使用模拟数据模式登录
          ElMessageBox.confirm(
            '无法连接到后端服务器或认证失败。是否要使用模拟数据模式登录？', 
            '连接错误', 
            {
              confirmButtonText: '使用模拟数据',
              cancelButtonText: '取消',
              type: 'warning'
            }
          )
          .then(() => {
            // 使用模拟数据模式登录
            handleMockLogin();
          })
          .catch(() => {
            ElMessage.info('已取消登录');
          });
        } else {
          // 其他错误
          ElMessage.error(error.message || '登录失败，请重试');
        }
      }
    } finally {
      loading.value = false;
    }
  });
};

const handleMockLogin = () => {
  // 使用预设的模拟数据登录
  if (loginForm.admin_name === '') {
    loginForm.admin_name = 'admin';
  }
  
  // 设置模拟数据模式标志
  localStorage.setItem('mockDataMode', 'true');
  
  handleSuccessLogin();
  
  // 显示模拟数据模式提示
  ElMessage({
    message: '已启用模拟数据模式，部分功能可能受限',
    type: 'warning',
    duration: 5000
  });
};

const handleSuccessLogin = () => {
  // 存储认证信息
  const adminAvatar = '/images/admin.png';
  
  // 添加额外的备用头像（内联SVG）
  const backupAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="%23f56a00"/><text x="50%" y="50%" dy=".3em" fill="%23fff" font-size="16" text-anchor="middle">管理</text></svg>';
  
  // 事先检测图片是否可访问
  const img = new Image();
  img.onerror = () => {
    console.error('管理员头像加载失败，使用备用SVG');
    // 使用备用SVG头像
    localStorage.setItem('adminAvatar', backupAvatar);
  };
  img.onload = () => {
    console.log('管理员头像加载成功');
  };
  img.src = adminAvatar;
  
  // 记住用户名
  if (rememberMe.value) {
    localStorage.setItem('adminName', loginForm.admin_name);
  } else {
    localStorage.removeItem('adminName');
  }
  
  // 保存头像信息（如果是实际登录，可能已经从后端获取了）
  if (!localStorage.getItem('adminAvatar')) {
    localStorage.setItem('adminAvatar', adminAvatar);
  }
  localStorage.setItem('adminAvatarTimestamp', Date.now().toString());
  
  // 保存管理员基本信息
  const adminInfo = {
    admin_name: loginForm.admin_name,
    admin_id: 1,
    admin_head: adminAvatar
  };
  localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
  
  // 如果是模拟模式，生成一个模拟token
  if (localStorage.getItem('mockDataMode') === 'true' && !localStorage.getItem('adminToken')) {
    const mockToken = 'Bearer mock-admin-token-' + Math.random().toString(36).substring(2);
    localStorage.setItem('adminToken', mockToken);
    console.log('已设置模拟token:', mockToken);
  }
  
  // 确保有token存在
  if (!localStorage.getItem('adminToken')) {
    console.warn('警告：未找到管理员token，使用临时token');
    localStorage.setItem('adminToken', 'Bearer temp-admin-token-' + Date.now());
  }
  
  // 检查是否有重定向地址
  const redirect = route.query.redirect;
  
  // 使用绝对路径以避免路由问题
  console.log('准备跳转至:', redirect || '/admin/dashboard');
  router.push(redirect || '/admin/dashboard');
  
  // 如果路由跳转失败，尝试使用location强制跳转
  setTimeout(() => {
    if (window.location.pathname !== '/admin/dashboard' && !redirect) {
      console.log('使用window.location强制跳转到管理后台');
      window.location.href = '/admin/dashboard';
    }
  }, 100);
};

onMounted(() => {
  // 检查是否已处于模拟数据模式，如果是则不检查服务器状态
  if (localStorage.getItem('mockDataMode')) {
    ElMessage({
      message: '您当前处于模拟数据模式',
      type: 'info',
      duration: 5000
    });
  } else {
    // 检查服务器状态
    checkServerStatus();
  }
  
  // 检查URL中是否有错误参数
  if (route.query.error === 'backend_offline') {
    ElMessage({
      message: '后端服务未启动，请使用模拟数据登录',
      type: 'warning',
      duration: 5000
    });
  }
  
  // 添加进入动画效果
  setTimeout(() => {
    showAnimations.value = true;
  }, 100);
});
</script>

<style lang="scss" scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #fff9f9;
  position: relative;
  overflow: hidden; /* 确保容器不会出现滚动条 */
}

/* 添加全局样式，隐藏整个页面的滚动条 */
:global(html), :global(body) {
  overflow: hidden;
  margin: 0;
  padding: 0;
  height: 100%;
}

.login-animation-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.animation-element {
  position: absolute;
  opacity: 0.2;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  
  &.baby-icon {
    width: 80px;
    height: 80px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle fill="%23FF8A80" cx="18" cy="18" r="18"/><path fill="%23FFF" d="M21 17h-2c-.552 0-1-.448-1-1s.448-1 1-1h2c.552 0 1 .448 1 1s-.448 1-1 1zm-6-2h-2c-.552 0-1 .448-1 1s.448 1 1 1h2c.552 0 1-.448 1-1s-.448-1-1-1zm3 0c-4.464 0-7 2.535-7 7 0 1.189 1.518 2.3 3.6 2.285C15.6 24.271 16.838 24 18 24s2.4.271 3.4.285c2.082.015 3.6-1.096 3.6-2.285 0-4.465-2.536-7-7-7zm8.579-.308C23.274 10.835 16.539 9.679 10.421 12C9.335 18.055 10.491 24.791 14.692 29h6.964c4.201-4.209 5.357-10.945 4.923-14.308z"/></svg>');
    animation: floatAnimation 15s infinite linear;
    &:nth-child(1) { top: 10%; left: 15%; animation-delay: 0s; }
    &:nth-child(2) { top: 35%; left: 85%; animation-delay: -2s; }
    &:nth-child(3) { top: 65%; left: 25%; animation-delay: -5s; }
    &:nth-child(4) { top: 75%; left: 75%; animation-delay: -8s; }
    &:nth-child(5) { top: 85%; left: 40%; animation-delay: -12s; }
  }
  
  &.bottle-icon {
    width: 70px;
    height: 70px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><path fill="%23FFC0CB" d="M32 13.714L29.5 5 26 13.714v5.429L24.5 31h9l-1.5-11.857z"/><path fill="%23FFF" d="M26 16.857c.552 0 1-.448 1-1V8c0-.552-.448-1-1-1s-1 .448-1 1v7.857c0 .552.448 1 1 1z"/><path fill="%23FFC0CB" d="M26 6c1.104 0 2-.896 2-2V1h-4v3c0 1.104.896 2 2 2z"/><path fill="%23FFB6C1" d="M28 5v4.857c0 1.105-.895 2-2 2s-2-.895-2-2V5c0 1.105.895 2 2 2s2-.895 2-2z"/></svg>');
    animation: floatAnimation 12s infinite linear alternate;
    &:nth-child(1) { top: 20%; left: 10%; animation-delay: -3s; }
    &:nth-child(2) { top: 50%; left: 90%; animation-delay: -6s; }
    &:nth-child(3) { top: 15%; left: 60%; animation-delay: -9s; }
    &:nth-child(4) { top: 80%; left: 15%; animation-delay: -1s; }
  }
  
  &.rattle-icon {
    width: 60px;
    height: 60px;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="%2387CEEB" d="M271.5 155.3C229.8 120.8 189.6 84.1 155 41.1c-7.4-9.2-21.9-7-28.8 4.2-19.7 32-67.2 37-95.2 10.8-6.1-5.7-9.5-13.5-9.5-21.7 0-8.2 3.4-16 9.5-21.7l51.3 50c6 5.9 15.6 5.8 21.5-.1 5.9-6 5.8-15.6-.1-21.5l-51.3-50c25.2-24.1 65.8-22.7 89.4 3.7 29.5 33 74.8 44.2 122 30.3 23.5-6.9 47.9 7.4 54.6 31.6l-47.9-43.7z"/><path fill="%23FF9966" d="M457.4 290c-27.6-40-74.2-41.6-108.5-3.8l-85.5-110.7c-2.6-3.4-6.4-5.6-10.6-6.2l-21.1-3.3c-4.2-0.7-8.5 0.4-12 2.9l-25.5 16.3c-3.9 3.1-6.4 7.7-6.9 12.7l-2.3 21.2c-0.6 4.2 0.6 8.5 3.2 11.9l85.5 110.7c-21.6 58.7 3.6 102.4 50.1 108.9 46.5 6.5 90.3-29.6 100.5-88.1l9.8-29c9.9-29.1 33.4-38 23.3-43.5z"/></svg>');
    animation: floatAnimation 18s infinite linear alternate-reverse;
    &:nth-child(1) { top: 30%; left: 75%; animation-delay: -2s; }
    &:nth-child(2) { top: 60%; left: 45%; animation-delay: -8s; }
    &:nth-child(3) { top: 25%; left: 30%; animation-delay: -15s; }
  }
}

@keyframes floatAnimation {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(10px, 15px) rotate(5deg); }
  50% { transform: translate(-5px, 10px) rotate(-3deg); }
  75% { transform: translate(-15px, -8px) rotate(-8deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  
  &.animate-header {
    opacity: 1;
    transform: translateY(0);
  }
  
  .logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .logo-icon {
      width: 84px;
      height: 84px;
    }
    
    .title {
      margin-top: 16px;
      color: #ff6b93;
      font-size: 28px;
      font-weight: 600;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}

.login-form-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(255, 107, 147, 0.12);
  margin-bottom: 24px;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.6s ease;
  border: none;
  overflow: hidden;
  
  &.animate-card {
    opacity: 1;
    transform: scale(1);
  }
  
  :deep(.el-card__header) {
    padding: 20px;
    background: linear-gradient(135deg, #ff85a2 0%, #ffa751 100%);
    border-bottom: none;
    
    h3 {
      margin: 0;
      font-size: 20px;
      color: #ffffff;
      text-align: center;
      font-weight: 500;
    }
  }
}

.form-item-animated {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.5s ease;
  
  @for $i from 1 through 5 {
    &:nth-child(#{$i}) {
      transition-delay: #{0.1 * $i}s;
    }
  }
  
  .animate-card & {
    opacity: 1;
    transform: translateY(0);
  }
  
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px rgba(255, 107, 147, 0.1);
    transition: box-shadow 0.3s ease;
    
    &:focus-within {
      box-shadow: 0 0 0 1px rgba(255, 107, 147, 0.3);
    }
  }
  
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #ff6b93;
    border-color: #ff6b93;
  }
  
  :deep(.el-checkbox__inner:hover) {
    border-color: #ff6b93;
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  :deep(.el-link) {
    color: #ff6b93;
    
    &:hover {
      color: #ff85a2;
    }
  }
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  background: linear-gradient(135deg, #ff85a2 0%, #ffa751 100%);
  border: none;
  transition: all 0.3s ease;
  
  &:hover, &:focus {
    background: linear-gradient(135deg, #ff6b93 0%, #ff9c42 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 147, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  color: #ff85a2;
  font-size: 13px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.6s ease;
  transition-delay: 0.5s;
  
  &.animate-footer {
    opacity: 1;
    transform: translateY(0);
  }
}

.server-status-area {
  margin-top: 24px;
  
  :deep(.el-alert) {
    border-radius: 8px;
    
    .el-alert__content {
      p {
        margin: 8px 0;
      }
    }
    
    .el-button--primary {
      background-color: #ff6b93;
      border-color: #ff6b93;
      
      &:hover, &:focus {
        background-color: #ff85a2;
        border-color: #ff85a2;
      }
    }
  }
}

// 性能优化：使用硬件加速
.login-wrapper, 
.animation-element, 
.login-header, 
.login-form-card,
.form-item-animated,
.login-button,
.login-footer {
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@media (max-width: 576px) {
  .login-wrapper {
    padding: 12px;
  }
  
  .login-form-card {
    border-radius: 12px;
  }
  
  .login-header .logo-container .logo-icon {
    width: 70px;
    height: 70px;
  }
  
  .login-header .logo-container .title {
    font-size: 24px;
  }
  
  .animation-element {
    opacity: 0.15;
    &.baby-icon, &.bottle-icon, &.rattle-icon {
      width: 60px;
      height: 60px;
    }
  }
}
</style> 