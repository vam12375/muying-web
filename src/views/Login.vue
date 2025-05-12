<template>
  <div class="maternal-login-page">
    <div class="background-decorations">
      <!-- Background elements like floating icons -->
      <span v-for="i in 5" :key="`bg-icon-${i}`" class="deco-icon" :style="randomIconStyle()">
        <el-icon><Sugar /></el-icon> <!-- Placeholder, replace with Baby/Heart icons -->
      </span>
    </div>

    <el-button class="back-button" type="text" @click="goBack">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <div class="login-form-wrapper">
      <div
        class="login-card animate-fade-in"
      >
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="母婴商城 Logo" class="logo-image" />
          <h1 class="logo-title">母婴商城</h1>
        </div>

        <h2 class="form-main-title">{{ isLogin ? '欢迎回来' : '加入我们' }}</h2>
        <p class="form-subtitle">{{ isLogin ? '登录您的账户继续' : '创建账户享受专属服务' }}</p>

        <!-- 登录表单 -->
        <el-form
          v-if="isLogin"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="main-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input v-model="loginForm.username" placeholder="用户名/手机号/邮箱" size="large">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              show-password
              size="large"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <router-link to="/forgot-password" class="link">忘记密码?</router-link>
          </div>
          <el-form-item>
            <el-button
              type="primary"
              class="submit-button primary-glow"
              native-type="submit"
              :loading="loading"
              size="large"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-else
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="main-form"
          @submit.prevent="handleRegister"
        >
          <el-form-item prop="username">
            <el-input v-model="registerForm.username" placeholder="设置用户名" size="large">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="phone">
            <el-input v-model="registerForm.phone" placeholder="手机号" size="large">
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input v-model="registerForm.email" placeholder="邮箱 (可选)" size="large">
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="设置密码"
              show-password
              size="large"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              show-password
              size="large"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="agreement" class="agreement-text">
            <el-checkbox v-model="registerForm.agreement">
              我已阅读并同意
              <a href="/terms" target="_blank" class="link">《服务条款》</a> 和
              <a href="/privacy" target="_blank" class="link">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="submit-button primary-glow"
              native-type="submit"
              :loading="loading"
              size="large"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-separator">
          <span class="separator-text">或</span>
        </div>

        <div class="social-login-buttons">
          <el-button class="social-button wechat-button" size="large">
            <img src="@/assets/images/icons/wechat.png" alt="微信登录" class="social-icon" />
            微信登录
          </el-button>
          <el-button class="social-button qq-button" size="large">
            <img src="@/assets/images/icons/qq.png" alt="QQ登录" class="social-icon" />
            QQ登录
          </el-button>
        </div>

        <div class="switch-form-text">
          <span v-if="isLogin">还没有账户？</span>
          <span v-else>已经有账户了？</span>
          <a href="javascript:;" @click="switchForm" class="link highlight-link">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </a>
        </div>
         <p class="terms-text">
            登录或注册即代表您同意我们的
            <a href="/terms" target="_blank" class="link">服务条款</a> 与
            <a href="/privacy" target="_blank" class="link">隐私政策</a>.
          </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView'
}
</script>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message, ArrowLeft, Sugar, Lollipop, IceCream } from '@element-plus/icons-vue'
import useLogin from '@/scripts/Login'

const router = useRouter()

const {
  isLogin,
  loading,
  loginFormRef,
  registerFormRef,
  loginForm,
  registerForm,
  loginRules,
  registerRules,
  switchForm: originalSwitchForm,
  handleLogin: originalHandleLogin,
  handleRegister: originalHandleRegister
} = useLogin()

const switchForm = () => {
  originalSwitchForm()
}

const handleLogin = async () => {
  await originalHandleLogin();
}

const handleRegister = async () => {
  await originalHandleRegister();
}

const goBack = () => {
  router.back()
}

const maternalIcons = [Sugar, Lollipop, IceCream];
const randomIconStyle = () => {
  const size = Math.random() * 20 + 20;
  const Ctor = maternalIcons[Math.floor(Math.random() * maternalIcons.length)];
  return {
    fontSize: `${size}px`,
    left: `${Math.random() * 100}vw`,
    top: `${Math.random() * 100}vh`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    animationDelay: `${Math.random() * 5}s`,
    color: `hsla(${Math.random() * 60 + 180}, 70%, 70%, 0.5)`
  };
};

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap');

$primary-color: #ff8c94;
$secondary-color: #a0e7e5;
$background-color: #fff9f9;
$text-color: #5f5f5f;
$form-background: #ffffff;
$border-color: #f0f0f0;
$link-color: #f77f89;
$button-hover-brightness: 1.1;

.maternal-login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, lighten($primary-color, 25%), lighten($secondary-color, 20%));
  font-family: 'Nunito', sans-serif;
  overflow: hidden;
  position: relative;
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;

  .deco-icon {
    position: absolute;
    opacity: 0;
    animation: float 20s infinite linear;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
    }
  }
}

@keyframes float {
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(0deg);
  }
  10%, 90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) rotate(360deg);
  }
}

.back-button {
  position: absolute;
  top: 25px;
  left: 25px;
  color: $text-color;
  font-size: 16px;
  z-index: 2;
  &:hover {
    color: $primary-color;
  }
}

.login-form-wrapper {
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.login-card {
  background-color: $form-background;
  padding: 35px 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 450px;
  text-align: center;
  animation: fadeInScale 0.7s ease-out;
}

.animate-fade-in {
  animation: fadeInScale 0.8s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(25px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  animation: slideDownFade 0.5s ease-out 0.2s backwards;

  .logo-image {
    width: 50px;
    height: 50px;
    margin-right: 12px;
  }
  .logo-title {
    font-size: 28px;
    font-weight: 700;
    color: $primary-color;
  }
}

.form-main-title {
  font-size: 26px;
  font-weight: 700;
  color: $text-color;
  margin-bottom: 8px;
   animation: slideDownFade 0.5s ease-out 0.3s backwards;
}

.form-subtitle {
  font-size: 15px;
  color: darken($text-color, 10%);
  margin-bottom: 30px;
   animation: slideDownFade 0.5s ease-out 0.4s backwards;
}

@keyframes slideDownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-form {
  .el-form-item {
    margin-bottom: 22px;
  }

  .el-input {
    :deep(.el-input__wrapper) {
      border-radius: 10px;
      padding: 0 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      transition: box-shadow 0.3s ease;
       &:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
    }
     :deep(.el-input__prefix .el-icon) {
      color: $primary-color;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.link {
  color: $link-color;
  text-decoration: none;
  transition: color 0.3s ease;
  &:hover {
    color: darken($link-color, 10%);
    text-decoration: underline;
  }
}

.highlight-link {
  font-weight: 600;
}

.submit-button {
  width: 100%;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 12px 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &.primary-glow {
    background: linear-gradient(90deg, $primary-color, lighten($primary-color, 10%));
    border: none;
    box-shadow: 0 4px 15px rgba($primary-color, 0.4);
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba($primary-color, 0.5);
      background: linear-gradient(90deg, darken($primary-color,5%), lighten($primary-color, 5%));
    }
  }
}

.form-separator {
  margin: 30px 0;
  display: flex;
  align-items: center;
  text-align: center;
  color: darken($border-color, 20%);
  font-size: 13px;

  &::before,
  &::after {
    content: '';
    flex-grow: 1;
    background-color: $border-color;
    height: 1px;
    margin: 0 10px;
  }
}

.social-login-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;

  .social-button {
    flex: 1;
    border-radius: 10px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: 1px solid $border-color;
    background-color: #fff;
    color: $text-color;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    }

    .social-icon {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }
  .wechat-button:hover {
    border-color: #4caf50;
    color: #4caf50;
  }
  .qq-button:hover {
    border-color: #50a0ff;
    color: #50a0ff;
  }
}

.switch-form-text {
  font-size: 15px;
  color: $text-color;
  margin-bottom: 20px;
  a {
    margin-left: 5px;
  }
}

.agreement-text {
  :deep(.el-checkbox__label) {
    font-size: 13px;
    color: darken($text-color, 5%);
    line-height: 1.5;
  }
  a {
    font-size: 13px;
  }
}

.terms-text {
  font-size: 12px;
  color: darken($text-color, 20%);
  line-height: 1.6;
  padding-top: 15px;
  border-top: 1px solid $border-color;
  margin-top: 20px;
}

.main-form .el-form-item {
  animation: fadeInUp 0.5s ease-out backwards;
}

.main-form .el-form-item:nth-child(1) { animation-delay: 0.1s; }
.main-form .el-form-item:nth-child(2) { animation-delay: 0.2s; }
.main-form .el-form-item:nth-child(3) { animation-delay: 0.3s; }
.main-form .el-form-item:nth-child(4) { animation-delay: 0.4s; }
.main-form .el-form-item:nth-child(5) { animation-delay: 0.5s; }
.main-form .el-form-item:nth-child(6) { animation-delay: 0.6s; }

.form-options { animation: fadeInUp 0.5s ease-out 0.5s backwards; }
.submit-button { animation: fadeInUp 0.5s ease-out 0.6s backwards; }
.form-separator { animation: fadeInUp 0.5s ease-out 0.7s backwards; }
.social-login-buttons { animation: fadeInUp 0.5s ease-out 0.8s backwards; }
.switch-form-text { animation: fadeInUp 0.5s ease-out 0.9s backwards; }
.terms-text { animation: fadeInUp 0.5s ease-out 1.0s backwards; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style> 