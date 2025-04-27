<template>
  <div class="user-info-container">
    <div class="section-header">
      <h2 class="section-title">个人信息</h2>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else>
      <div class="user-info-wrapper">
        <div class="avatar-section">
          <div class="avatar-container">
            <img :src="userStore.avatar || defaultAvatar" :alt="userStore.username" class="user-avatar" />
            <div class="avatar-upload">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="handleAvatarUpload"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button size="small" type="primary" circle>
                  <i class="el-icon-camera"></i>
                </el-button>
              </el-upload>
            </div>
          </div>
          <p class="upload-hint">点击更换头像</p>
        </div>
        
        <div class="info-section">
          <template v-if="isEditing">
            <el-form :model="editForm" :rules="rules" ref="formRef" label-width="100px" class="user-form">
              <el-form-item label="用户名" prop="nickname">
                <el-input v-model="editForm.nickname" placeholder="请输入用户名" />
              </el-form-item>
              
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="editForm.gender">
                  <el-radio :value="1" label="男" />
                  <el-radio :value="2" label="女" />
                  <el-radio :value="0" label="保密" />
                </el-radio-group>
              </el-form-item>
              
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="editForm.phone" placeholder="请输入手机号码" />
              </el-form-item>
              
              <el-form-item label="生日" prop="birthday">
                <el-date-picker 
                  v-model="editForm.birthday" 
                  type="date" 
                  placeholder="选择出生日期"
                  :disabled-date="disabledDate"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" placeholder="请输入邮箱地址" />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="saveUserInfo" :loading="saving">保存</el-button>
                <el-button @click="cancelEdit">取消</el-button>
              </el-form-item>
            </el-form>
          </template>
          
          <template v-else>
            <div class="info-item">
              <span class="info-label">用户名：</span>
              <span class="info-value">{{ userStore.username }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">昵称：</span>
              <span class="info-value">{{ userStore.nickname }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">性别：</span>
              <span class="info-value">{{ formatGender(userStore.gender) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">手机号码：</span>
              <span class="info-value">{{ formatPhone(userStore.phone) || '-' }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">生日：</span>
              <span class="info-value">{{ userStore.birthday || '-' }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">邮箱：</span>
              <span class="info-value">{{ userStore.email || '-' }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">注册时间：</span>
              <span class="info-value">{{ userStore.createTime || '-' }}</span>
            </div>
            
            <div class="action-buttons">
              <el-button type="primary" @click="startEdit">编辑资料</el-button>
              <el-button @click="showPasswordDialog">修改密码</el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      title="修改密码"
      v-model="passwordDialogVisible"
      width="500px"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="changingPassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserInfo'
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadAvatar as uploadUserAvatar, updatePassword as changeUserPassword } from '@/api/user'
import defaultAvatarImg from '@/assets/default-avatar.png'

const userStore = useUserStore()
const loading = ref(false)
const saving = ref(false)
const changingPassword = ref(false)
const isEditing = ref(false)
const passwordDialogVisible = ref(false)
const formRef = ref(null)
const passwordFormRef = ref(null)

// 默认头像
const defaultAvatar = defaultAvatarImg

// 编辑表单
const editForm = ref({
  nickname: '',
  gender: 0,
  phone: '',
  birthday: '',
  email: ''
})

// 密码表单
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码表单规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 日期选择器禁用日期（今天之后的日期）
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

// 格式化性别
const formatGender = (gender) => {
  // 处理数字格式
  if (gender === 1 || gender === '1') return '男'
  if (gender === 2 || gender === '2') return '女'
  
  // 处理字符串格式
  if (typeof gender === 'string') {
    const lowerGender = gender.toLowerCase()
    if (lowerGender === 'male') return '男'
    if (lowerGender === 'female') return '女'
  }
  
  return '保密'
}

// 格式化手机号码
const formatPhone = (phone) => {
  if (!phone) return ''
  return phone // 直接返回完整手机号，不再隐藏中间4位
}

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    if (!userStore.id && userStore.token) {
      await userStore.fetchUserInfo()
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  editForm.value.nickname = userStore.nickname || ''
  editForm.value.gender = userStore.gender || 0
  editForm.value.phone = userStore.phone || ''
  editForm.value.birthday = userStore.birthday || ''
  editForm.value.email = userStore.email || ''
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    saving.value = true
    const updateData = {
      nickname: editForm.value.nickname,
      gender: editForm.value.gender,
      phone: editForm.value.phone,
      birthday: editForm.value.birthday,
      email: editForm.value.email
    }
    
    console.log('提交的用户信息数据:', updateData) // 添加日志，便于调试
    const success = await userStore.updateProfile(updateData)
    
    if (success) {
      ElMessage.success('保存成功')
      isEditing.value = false
    }
  } catch (error) {
    console.error('保存用户信息失败:', error)
    ElMessage.error('保存用户信息失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 显示修改密码对话框
const showPasswordDialog = () => {
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  passwordDialogVisible.value = true
  
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    changingPassword.value = true
    const data = {
      oldPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    }
    
    const res = await changeUserPassword(data)
    
    if (res.code === 200) {
      ElMessage.success('密码修改成功')
      passwordDialogVisible.value = false
    } else {
      ElMessage.error(res.message || '密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error('密码修改失败，请稍后重试')
  } finally {
    changingPassword.value = false
  }
}

// 处理头像上传
const handleAvatarUpload = async (options) => {
  const file = options.file
  
  // 检查文件类型和大小
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('头像必须是图片格式')
    return
  }
  
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB')
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await uploadUserAvatar(formData)
    
    if (res.code === 200 && res.data && res.data.avatarUrl) {
      // 更新store中的头像
      userStore.avatar = res.data.avatarUrl
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请稍后重试')
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss" scoped>
.user-info-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}

.loading-container {
  padding: 40px 0;
  display: flex;
  justify-content: center;
}

.user-info-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 10px;
  
  .user-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #ebeef5;
  }
  
  .avatar-upload {
    position: absolute;
    right: 0;
    bottom: 0;
  }
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.info-section {
  flex: 1;
  min-width: 300px;
}

.info-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  
  .info-label {
    width: 100px;
    color: #606266;
    flex-shrink: 0;
  }
  
  .info-value {
    color: #303133;
    flex: 1;
  }
}

.action-buttons {
  margin-top: 30px;
}

.user-form {
  max-width: 500px;
}

@media (max-width: 768px) {
  .user-info-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .info-section {
    width: 100%;
  }
}
</style>