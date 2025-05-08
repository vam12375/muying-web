<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <router-link to="/" class="logo-link">
          <img src="@/assets/logo.png" alt="母婴商城" class="logo-img" />
          <h1 class="logo-text">母婴商城</h1>
        </router-link>
      </div>
      
      <div class="login-content">
        <div class="login-left">
          <img src="https://img.freepik.com/free-photo/mother-holding-her-baby-arms_23-2148955135.jpg" alt="欢迎登录" class="login-image">
        </div>
        
        <div class="login-right">
          <div class="login-form-container">
            <h2 class="form-title">{{ isLogin ? '欢迎登录' : '用户注册' }}</h2>
            
            <!-- 登录表单 -->
            <el-form v-if="isLogin" ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="用户名/手机号/邮箱" prefix-icon="User" />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
              </el-form-item>
              
              <div class="login-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <router-link to="/forgot-password" class="forgot-password">忘记密码?</router-link>
              </div>
              
              <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
                登录
              </el-button>
              
              <div class="form-divider">
                <span>或</span>
              </div>
              
              <div class="social-login">
                <button type="button" class="social-button wechat">
                  <i class="icon-wechat"></i>
                  微信登录
                </button>
                <button type="button" class="social-button qq">
                  <i class="icon-qq"></i>
                  QQ登录
                </button>
              </div>
            </el-form>
            
            <!-- 注册表单 -->
            <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
              </el-form-item>
              
              <el-form-item prop="phone">
                <el-input v-model="registerForm.phone" placeholder="手机号" prefix-icon="Phone" />
              </el-form-item>
              
              <el-form-item prop="email">
                <el-input v-model="registerForm.email" placeholder="邮箱" prefix-icon="Message" />
              </el-form-item>
              
              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
              </el-form-item>
              
              <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" show-password />
              </el-form-item>
              
              <el-form-item prop="agreement" class="agreement-item">
                <el-checkbox v-model="registerForm.agreement">
                  我已阅读并同意 <a href="/terms" target="_blank">《服务条款》</a> 和 <a href="/privacy" target="_blank">《隐私政策》</a>
                </el-checkbox>
              </el-form-item>
              
              <el-button type="primary" class="register-button" @click="handleRegister" :loading="loading">
                注册
              </el-button>
            </el-form>
            
            <div class="switch-form">
              <span v-if="isLogin">还没有账号？</span>
              <span v-else>已有账号？</span>
              <a href="javascript:;" @click="switchForm">{{ isLogin ? '立即注册' : '立即登录' }}</a>
            </div>
          </div>
        </div>
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
import useLogin from '@/scripts/Login'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'

const {
  isLogin,
  loading,
  loginFormRef,
  registerFormRef,
  loginForm,
  registerForm,
  loginRules,
  registerRules,
  switchForm,
  handleLogin,
  handleRegister
} = useLogin()
</script>

<style src="@/styles/Login.scss" scoped></style> 