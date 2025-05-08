import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export default function useLogin() {
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
          password: loginForm.password,
          rememberMe: loginForm.remember
        })
        
        if (result) {
          // 登录成功后启动会话刷新机制
          import('@/utils/request').then(({ startSessionRefresh }) => {
            startSessionRefresh();
            console.log('已启动会话自动刷新');
          });
          
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

  return {
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
  }
} 