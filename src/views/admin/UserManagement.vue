<template>
    <div class="user-management">
      <div class="page-header">
        <h2>用户管理</h2>
        <el-button type="primary" @click="handleAddUser">添加用户</el-button>
      </div>
  
      <!-- 用户列表 -->
      <el-table v-loading="loading" :data="userList" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="createTime" label="注册时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEditUser(scope.row)">编辑</el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleStatusChange(scope.row)"
            >
              {{ scope.row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
  
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
  
      <!-- 用户表单对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="formType === 'add' ? '添加用户' : '编辑用户'"
        width="500px"
      >
        <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" :disabled="formType === 'edit'" />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="userForm.nickname" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          <el-form-item v-if="formType === 'add'" label="密码" prop="password">
            <el-input v-model="userForm.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="userForm.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted } from 'vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getUserList, addUser, updateUser, updateUserStatus } from '@/api/admin';
  
  // 状态变量
  const loading = ref(false);
  const dialogVisible = ref(false);
  const formType = ref('add'); // 'add' 或 'edit'
  const submitLoading = ref(false);
  const userList = ref([]);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const userFormRef = ref(null);
  
  // 表单数据
  const userForm = reactive({
    id: null,
    username: '',
    nickname: '',
    phone: '',
    email: '',
    password: '',
    status: 1
  });
  
  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    nickname: [
      { required: true, message: '请输入昵称', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
    ]
  };
  
  // 生命周期钩子
  onMounted(() => {
    fetchUserList();
  });
  
  // 获取用户列表
  const fetchUserList = async () => {
    loading.value = true;
    try {
      const res = await getUserList({
        page: currentPage.value,
        pageSize: pageSize.value
      });
      
      if (res.code === 200 && res.data) {
        userList.value = res.data.records || [];
        total.value = res.data.total || 0;
      } else {
        ElMessage.error(res.message || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      ElMessage.error('获取用户列表失败');
    } finally {
      loading.value = false;
    }
  };
  
  // 添加用户
  const handleAddUser = () => {
    formType.value = 'add';
    resetForm();
    dialogVisible.value = true;
  };
  
  // 编辑用户
  const handleEditUser = (row) => {
    formType.value = 'edit';
    resetForm();
    Object.assign(userForm, {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      phone: row.phone,
      email: row.email,
      status: row.status
    });
    dialogVisible.value = true;
  };
  
  // 更改用户状态
  const handleStatusChange = (row) => {
    const newStatus = row.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? '启用' : '禁用';
    
    ElMessageBox.confirm(
      `确定要${statusText}用户 "${row.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        try {
          const res = await updateUserStatus({
            id: row.id,
            status: newStatus
          });
          
          if (res.code === 200) {
            ElMessage.success(`${statusText}成功`);
            // 刷新列表
            fetchUserList();
          } else {
            ElMessage.error(res.message || `${statusText}失败`);
          }
        } catch (error) {
          console.error(`${statusText}用户失败:`, error);
          ElMessage.error(`${statusText}用户失败`);
        }
      })
      .catch(() => {});
  };
  
  // 提交表单
  const submitForm = async () => {
    if (!userFormRef.value) return;
    
    await userFormRef.value.validate(async (valid) => {
      if (!valid) return;
      
      submitLoading.value = true;
      try {
        let res;
        
        if (formType.value === 'add') {
          res = await addUser(userForm);
        } else {
          res = await updateUser(userForm);
        }
        
        if (res.code === 200) {
          ElMessage.success(formType.value === 'add' ? '添加用户成功' : '编辑用户成功');
          dialogVisible.value = false;
          // 刷新列表
          fetchUserList();
        } else {
          ElMessage.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('保存用户失败:', error);
        ElMessage.error('保存用户失败');
      } finally {
        submitLoading.value = false;
      }
    });
  };
  
  // 重置表单
  const resetForm = () => {
    if (userFormRef.value) {
      userFormRef.value.resetFields();
    }
    Object.assign(userForm, {
      id: null,
      username: '',
      nickname: '',
      phone: '',
      email: '',
      password: '',
      status: 1
    });
  };
  
  // 分页相关
  const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    fetchUserList();
  };
  
  const handleCurrentChange = (val) => {
    currentPage.value = val;
    fetchUserList();
  };
  </script>
  
  <style scoped>
  .user-management {
    padding: 20px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  </style>