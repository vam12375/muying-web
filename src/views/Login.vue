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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, Message } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 状态变量
const isLogin = ref(true)
const loading = ref(false)
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  remember: true
})

// 注册表单
const registerForm = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  agreement: [
    { 
      validator: (rule, value, callback) => {
        if (value) {
          callback()
        } else {
          callback(new Error('请阅读并同意服务条款和隐私政策'))
        }
      }, 
      trigger: 'change' 
    }
  ]
}

// 切换登录/注册表单
const switchForm = () => {
  isLogin.value = !isLogin.value
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 使用用户store进行登录
      const result = await userStore.userLogin({
        username: loginForm.username,
        password: loginForm.password
      })
      
      if (result) {
        ElMessage.success('登录成功')
        router.push('/')
      }
    } catch (error) {
      ElMessage.error('登录失败，请检查用户名和密码')
      console.error('登录错误:', error)
    } finally {
      loading.value = false
    }
  })
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 使用用户store进行注册
      const result = await userStore.userRegister({
        username: registerForm.username,
        phone: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password
      })
      
      if (result) {
        ElMessage.success('注册成功，请登录')
        isLogin.value = true // 切换到登录表单
      }
    } catch (error) {
      ElMessage.error('注册失败，请稍后重试')
      console.error('注册错误:', error)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  width: 100%;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
}

.login-container {
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.logo-img {
  height: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #f27c8d;
}

.login-content {
  display: flex;
  min-height: 500px;
}

.login-left {
  flex: 1;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  .login-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 5px;
  }
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
}

.login-form-container {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.form-title {
  font-size: 24px;
  font-weight: 500;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.login-form, .register-form {
  margin-bottom: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .forgot-password {
    color: #f27c8d;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.login-button, .register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  margin-top: 10px;
}

.form-divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background-color: #e0e0e0;
  }
  
  span {
    position: relative;
    background-color: #fff;
    padding: 0 10px;
    color: #999;
    font-size: 14px;
  }
}

.social-login {
  display: flex;
  justify-content: space-between;
}

.social-button {
  flex: 1;
  margin: 0 5px;
  padding: 10px 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  i {
    margin-right: 5px;
  }
  
  &.wechat {
    &:hover {
      background-color: #07c160;
      border-color: #07c160;
      color: #fff;
    }
  }
  
  &.qq {
    &:hover {
      background-color: #12b7f5;
      border-color: #12b7f5;
      color: #fff;
    }
  }
}

.switch-form {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  
  a {
    color: #f27c8d;
    text-decoration: none;
    margin-left: 5px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.agreement-item {
  margin-top: 5px;
  
  a {
    color: #f27c8d;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

@media (max-width: 768px) {
  .login-content {
    flex-direction: column;
  }
  
  .login-left {
    display: none;
  }
  
  .login-right {
    padding: 30px 20px;
  }
}
</style> 