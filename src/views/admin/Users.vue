<template>
  <div class="users-container">
    <!-- 标题和数据统计卡片 -->
    <div class="page-header">
      <div class="title-area">
        <h2><i class="el-icon-user"></i> 用户管理</h2>
        <span class="subtitle">系统用户数据管理与维护</span>
      </div>
      <div class="stat-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ total }}</div>
          <div class="stat-title">全部用户</div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ getStatusCount(1) }}</div>
          <div class="stat-title">正常用户</div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-number">{{ getStatusCount(0) }}</div>
          <div class="stat-title">已冻结</div>
        </el-card>
      </div>
    </div>

    <!-- 操作区域 -->
    <el-card shadow="hover" class="main-card">
      <div class="action-bar">
        <div class="left-actions">
          <el-button type="primary" @click="handleAddUser" icon="Plus">新增用户</el-button>
          <el-button @click="getUsers" icon="Refresh">刷新</el-button>
        </div>
        <div class="search-area">
          <el-form :inline="true" :model="searchForm" class="search-form">
            <el-form-item>
              <el-input 
                v-model="searchForm.username" 
                placeholder="用户名" 
                prefix-icon="Search"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-select 
                v-model="searchForm.status" 
                placeholder="用户状态"
                clearable
              >
                <el-option label="全部" value="" />
                <el-option label="正常" :value="1" />
                <el-option label="冻结" :value="0" />
                <el-option label="存在风险" :value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch" icon="Search">搜索</el-button>
              <el-button @click="resetSearch" icon="Delete">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 用户表格 -->
      <el-table 
        :data="userList" 
        style="width: 100%" 
        v-loading="loading"
        border
        stripe
        highlight-current-row
        row-class-name="table-row"
        header-row-class-name="table-header"
      >
        <el-table-column prop="userId" label="用户ID" width="100" align="center" />
        <el-table-column prop="userName" label="用户名" width="120" align="center" />
        <el-table-column prop="email" label="邮箱" min-width="180" align="center" />
        <el-table-column prop="phone" label="手机号" width="140" align="center" />
        <el-table-column prop="createTime" label="注册时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" align="center">
          <template #default="scope">
            <span>{{ formatDate(scope.row.lastLoginTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)" 
              effect="light"
              size="large"
              class="status-tag"
            >
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200" align="center">
          <template #default="scope">
            <div class="operation-btns">
              <el-tooltip 
                content="查看详情" 
                placement="top"
                effect="light"
                popper-class="custom-tooltip"
              >
                <el-button 
                  circle 
                  size="small"
                  @click="handleView(scope.row)"
                  icon="View"
                ></el-button>
              </el-tooltip>
              <el-tooltip 
                content="编辑信息" 
                placement="top"
                effect="light"
                popper-class="custom-tooltip"
              >
                <el-button 
                  circle 
                  type="primary" 
                  size="small"
                  @click="handleEdit(scope.row)"
                  icon="Edit"
                ></el-button>
              </el-tooltip>
              <el-tooltip 
                :content="scope.row.status === 1 ? '冻结账户' : '解冻账户'" 
                placement="top"
                effect="light"
                popper-class="custom-tooltip"
              >
                <el-button
                  circle
                  :type="scope.row.status === 1 ? 'warning' : 'success'"
                  size="small"
                  @click="handleStatusChange(scope.row)"
                  :icon="scope.row.status === 1 ? 'Lock' : 'Unlock'"
                ></el-button>
              </el-tooltip>
              <el-tooltip 
                content="删除账户" 
                placement="top"
                effect="light"
                popper-class="custom-tooltip"
              >
                <el-button
                  circle
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                  icon="Delete"
                ></el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
      title="用户详情"
      v-model="dialogVisible"
      width="50%"
      center
      destroy-on-close>
      <div v-if="currentUser" class="user-detail-dialog">
        <div class="user-info">
          <div class="avatar-container">
            <el-avatar :size="120" :src="currentUser.userHead || '/src/assets/img/default-avatar.png'" />
            <div class="user-status">
              <el-tag :type="getStatusType(currentUser.status)">
                {{ getStatusText(currentUser.status) }}
              </el-tag>
            </div>
          </div>
          <div class="info-detail">
            <div class="info-section">
              <h4>基本信息</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="用户ID">{{ currentUser.userId }}</el-descriptions-item>
                <el-descriptions-item label="用户名">{{ currentUser.userName }}</el-descriptions-item>
                <el-descriptions-item label="邮箱地址">
                  <el-tag size="small" type="info">{{ currentUser.email || '未设置' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="手机号码">
                  <el-tag size="small" type="info">{{ currentUser.phone || '未设置' }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>
            </div>
            <div class="info-section">
              <h4>时间记录</h4>
              <el-descriptions :column="1" border>
                <el-descriptions-item label="注册时间">
                  {{ formatDate(currentUser.createTime) }}
                </el-descriptions-item>
                <el-descriptions-item label="最后登录">
                  {{ formatDate(currentUser.lastLoginTime) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEdit(currentUser)">编辑信息</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="userFormTitle"
      v-model="userFormVisible"
      width="40%"
      center
      destroy-on-close>
      <el-form 
        :model="userForm" 
        :rules="userFormRules" 
        ref="userFormRef" 
        label-width="100px"
        status-icon
        class="user-form">
        <el-form-item label="用户名" prop="userName">
          <el-input 
            v-model="userForm.userName" 
            placeholder="请输入用户名" 
            :disabled="userForm.isEdit"
            prefix-icon="User" 
          />
        </el-form-item>
        <el-form-item label="密码" prop="userPass" v-if="!userForm.isEdit">
          <el-input 
            v-model="userForm.userPass" 
            placeholder="请输入密码" 
            type="password"
            prefix-icon="Lock" 
            show-password
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="userForm.email" 
            placeholder="请输入邮箱"
            prefix-icon="Message" 
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="userForm.phone" 
            placeholder="请输入手机号"
            prefix-icon="Iphone" 
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">冻结</el-radio>
            <el-radio :label="2">存在风险</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitUserForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, changeUserStatus, addUser, updateUserByAdmin, deleteUser } from '@/api/user'
import { 
  Plus, Refresh, Search, Delete, 
  View, Edit, Lock, Unlock, User, 
  Message, Iphone
} from '@element-plus/icons-vue'

const searchForm = ref({
  username: '',
  status: ''
})

const userList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const dialogVisible = ref(false)
const currentUser = ref(null)
const loading = ref(false)
const submitting = ref(false)

// 用户表单相关
const userFormVisible = ref(false)
const userFormTitle = ref('新增用户')
const userFormRef = ref(null)
const userForm = reactive({
  userId: null,
  userName: '',
  userPass: '',
  email: '',
  phone: '',
  status: 1,
  isEdit: false
})

// 表单验证规则
const userFormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  userPass: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取指定状态的用户数量
const getStatusCount = (status) => {
  return userList.value.filter(user => user.status === status).length
}

// 重置表单
const resetUserForm = () => {
  if (userFormRef.value) {
    userFormRef.value.resetFields()
  }
  Object.assign(userForm, {
    userId: null,
    userName: '',
    userPass: '',
    email: '',
    phone: '',
    status: 1,
    isEdit: false
  })
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.value.username = ''
  searchForm.value.status = ''
  handleSearch()
}

// 获取用户列表
const getUsers = async () => {
  loading.value = true
  try {
    // 检查adminToken
    const adminToken = localStorage.getItem('adminToken')
    console.log('当前管理员token:', adminToken ? adminToken.substring(0, 20) + '...' : '无')
    
    console.log('正在发送请求参数:', {
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      status: searchForm.value.status
    });
    
    const res = await getUserList({
      page: currentPage.value,
      pageSize: pageSize.value,
      username: searchForm.value.username,
      status: searchForm.value.status
    });
    
    console.log('API响应完整数据:', res);
    
    if (res.code === 200 && res.data) {
      // 获取原始列表数据
      const list = res.data.list || [];
      total.value = res.data.total || 0;
      
      // 处理字段映射
      userList.value = list.map(user => {
        // 打印原始用户数据，帮助调试
        console.log('原始用户数据:', user);
        
        return {
          userId: user.id || user.user_id || user.userId,
          userName: user.username || user.userName,
          nickname: user.nickname,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          gender: user.gender,
          birthday: user.birthday,
          status: typeof user.status === 'boolean' ? (user.status ? 1 : 0) : user.status,
          role: user.role,
          createTime: user.createTime || user.create_time,
          lastLoginTime: user.lastLoginTime || user.update_time
        };
      });
      
      // 日志输出，便于调试
      console.log('获取用户列表成功，总数:', total.value, '条目:', userList.value.length);
      console.log('映射后的用户列表详情:', userList.value);
      
      // 计算状态统计
      console.log('正常用户数量:', getStatusCount(1));
      console.log('冻结用户数量:', getStatusCount(0));
    } else {
      ElMessage({
        message: res.message || '获取用户列表失败',
        type: 'error',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('获取用户列表失败详细错误信息:', error);
    console.error('错误堆栈:', error?.stack);
    ElMessage({
      message: '获取用户列表失败: ' + (error.message || '未知错误'),
      type: 'error',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
}

// 新增用户
const handleAddUser = () => {
  resetUserForm()
  userFormTitle.value = '新增用户'
  userForm.isEdit = false
  userFormVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  if (!row) return
  
  resetUserForm()
  userFormTitle.value = '编辑用户'
  userForm.isEdit = true
  userForm.userId = row.userId
  userForm.userName = row.userName
  userForm.email = row.email
  userForm.phone = row.phone
  userForm.status = row.status
  userFormVisible.value = true
  
  // 如果是从详情页点击编辑，关闭详情对话框
  if (dialogVisible.value) {
    dialogVisible.value = false
  }
}

// 提交用户表单
const submitUserForm = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 构建提交数据
        const userData = {
          userName: userForm.userName,
          email: userForm.email,
          phone: userForm.phone,
          status: userForm.status
        }
        
        // 如果是编辑，添加userId
        if (userForm.isEdit) {
          userData.userId = userForm.userId
        } else {
          // 如果是新增，添加密码
          userData.userPass = userForm.userPass
        }
        
        // 发送请求
        const res = userForm.isEdit 
          ? await updateUserByAdmin(userData)
          : await addUser(userData)
          
        if (res.code === 200) {
          ElMessage({
            message: userForm.isEdit ? '更新用户成功' : '添加用户成功',
            type: 'success',
            duration: 2000
          })
          userFormVisible.value = false
          getUsers() // 刷新列表
        } else {
          ElMessage({
            message: res.message || (userForm.isEdit ? '更新用户失败' : '添加用户失败'),
            type: 'error',
            duration: 2000
          })
        }
      } catch (error) {
        console.error(userForm.isEdit ? '更新用户失败:' : '添加用户失败:', error)
        ElMessage({
          message: userForm.isEdit ? '更新用户失败' : '添加用户失败',
          type: 'error',
          duration: 2000
        })
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除用户
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.userName}" 吗？此操作不可恢复！`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const res = await deleteUser(row.userId)
    
    if (res.code === 200) {
      ElMessage({
        message: '删除用户成功',
        type: 'success',
        duration: 2000
      })
      getUsers() // 重新加载用户列表
    } else {
      ElMessage({
        message: res.message || '删除用户失败',
        type: 'error',
        duration: 2000
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage({
        message: '删除用户失败',
        type: 'error',
        duration: 2000
      })
    }
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    case 2:
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1:
      return '正常'
    case 0:
      return '冻结'
    case 2:
      return '存在风险'
    default:
      return '未知'
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getUsers()
}

// 查看用户详情
const handleView = (row) => {
  currentUser.value = row
  dialogVisible.value = true
}

// 修改用户状态
const handleStatusChange = async (row) => {
  try {
    const currentStatus = getStatusText(row.status)
    const newStatusText = row.status === 1 ? '冻结' : '正常'
    const newStatusValue = row.status === 1 ? 0 : 1 // 将状态文本转换为数字：正常=1，冻结=0
    
    await ElMessageBox.confirm(`确定要将该用户状态从"${currentStatus}"改为"${newStatusText}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const res = await changeUserStatus(row.userId, newStatusValue) // 发送数字值
    
    if (res.code === 200) {
      ElMessage({
        message: `用户状态修改成功`,
        type: 'success',
        duration: 2000
      })
      getUsers() // 重新加载用户列表
    } else {
      ElMessage({
        message: res.message || '修改用户状态失败',
        type: 'error',
        duration: 2000
      })
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改用户状态失败:', error)
      ElMessage({
        message: '修改用户状态失败',
        type: 'error',
        duration: 2000
      })
    }
  } finally {
    loading.value = false
  }
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  getUsers()
}

// 当前页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getUsers()
}

onMounted(() => {
  getUsers()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  flex-direction: column;
}

.title-area h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
  display: flex;
  align-items: center;
}

.title-area h2 i {
  margin-right: 10px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin-top: 8px;
}

.stat-cards {
  display: flex;
  gap: 15px;
}

.stat-card {
  width: 150px;
  text-align: center;
  padding: 10px;
  cursor: default;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #606266;
}

.main-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.search-area {
  display: flex;
  align-items: center;
}

.search-form {
  display: flex;
  align-items: center;
}

.table-header {
  background-color: #f5f7fa !important;
  font-weight: bold;
  color: #303133;
}

.table-row {
  transition: all 0.3s;
}

.table-row:hover {
  background-color: #ecf5ff !important;
}

.status-tag {
  min-width: 60px;
  text-align: center;
}

.operation-btns {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

/* 详情对话框样式 */
.user-detail-dialog {
  padding: 10px;
}

.user-info {
  display: flex;
  gap: 30px;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.user-status {
  margin-top: 10px;
}

.info-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
}

/* 表单样式 */
.user-form .el-form-item {
  margin-bottom: 22px;
}

.user-form .el-input {
  width: 100%;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .stat-cards {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-area {
    width: 100%;
  }
  
  .search-form {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .user-info {
    flex-direction: column;
  }
  
  .avatar-container {
    margin-bottom: 20px;
  }
}
</style>

<style>
/* 自定义tooltip样式 */
.custom-tooltip {
  background-color: #ffffff !important;
  color: #303133 !important;
  font-size: 14px !important;
  font-weight: bold !important;
  padding: 8px 12px !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  border-radius: 4px !important;
  border: 1px solid #e4e7ed !important;
}

/* 箭头样式 */
.custom-tooltip .el-popper__arrow::before {
  background-color: #ffffff !important;
  border: 1px solid #e4e7ed !important;
}
</style> 