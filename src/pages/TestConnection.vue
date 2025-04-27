<!-- src/pages/TestConnection.vue -->
<template>
  <div class="test-container">
    <h1>前后端连接测试</h1>
    
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>基础连接测试</span>
          <el-button type="primary" @click="testConnection" :loading="connectionLoading">
            测试连接
          </el-button>
        </div>
      </template>
      <div v-if="connectionStatus === 'success'" class="result-container success">
        <h3>✅ 连接成功</h3>
        <pre>{{ connectionResult }}</pre>
      </div>
      <div v-else-if="connectionStatus === 'error'" class="result-container error">
        <h3>❌ 连接失败</h3>
        <pre>{{ connectionResult }}</pre>
        <div class="error-tips">
          <h4>常见原因和解决方案：</h4>
          <ul>
            <li>后端服务未启动：请确保Spring Boot应用正常运行</li>
            <li>路径配置错误：检查前端API路径和后端Controller路径是否一致</li>
            <li>CORS配置问题：检查后端CORS配置，是否允许localhost:5173访问</li>
            <li>安全配置问题：检查SecurityConfig是否允许/test/connection路径的匿名访问</li>
          </ul>
        </div>
      </div>
      <div v-else class="empty-result">
        点击按钮测试与后端的连接
      </div>
    </el-card>
    
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>认证测试</span>
          <el-button type="primary" @click="testAuth" :loading="authLoading">
            测试认证
          </el-button>
        </div>
      </template>
      <div v-if="authStatus === 'success'" class="result-container success">
        <h3>✅ 认证成功</h3>
        <pre>{{ authResult }}</pre>
      </div>
      <div v-else-if="authStatus === 'error'" class="result-container error">
        <h3>❌ 认证失败</h3>
        <pre>{{ authResult }}</pre>
        <div class="error-tips" v-if="authResult && authResult.includes('401')">
          <h4>认证错误：</h4>
          <p>您尚未登录或Token无效。请先登录后再进行认证测试。</p>
        </div>
      </div>
      <div v-else class="empty-result">
        点击按钮测试用户认证
      </div>
    </el-card>
    
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <span>JWT测试</span>
          <el-button type="primary" @click="testJwt" :loading="jwtLoading">
            生成测试JWT
          </el-button>
        </div>
      </template>
      <div v-if="jwtStatus === 'success'" class="result-container success">
        <h3>✅ JWT生成成功</h3>
        <pre>{{ jwtResult }}</pre>
        <div class="jwt-actions" v-if="jwtToken">
          <el-button type="success" size="small" @click="saveJwtToken">
            保存为用户Token
          </el-button>
          <el-button type="warning" size="small" @click="saveAdminJwtToken">
            保存为管理员Token
          </el-button>
        </div>
      </div>
      <div v-else-if="jwtStatus === 'error'" class="result-container error">
        <h3>❌ JWT生成失败</h3>
        <pre>{{ jwtResult }}</pre>
      </div>
      <div v-else class="empty-result">
        点击按钮生成测试JWT令牌
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import api from '@/api';

const connectionResult = ref(null);
const authResult = ref(null);
const jwtResult = ref(null);
const connectionLoading = ref(false);
const authLoading = ref(false);
const jwtLoading = ref(false);
const connectionStatus = ref(null); // 'success' 或 'error'
const authStatus = ref(null); // 'success' 或 'error'
const jwtStatus = ref(null); // 'success' 或 'error'
const jwtToken = ref(null);

// 测试基础连接
async function testConnection() {
  connectionLoading.value = true;
  connectionResult.value = null;
  connectionStatus.value = null;
  
  try {
    const res = await api.test.testConnection();
    console.log('连接测试成功:', res);
    connectionResult.value = JSON.stringify(res, null, 2);
    connectionStatus.value = 'success';
    ElMessage.success('连接成功');
  } catch (error) {
    console.error('连接测试失败:', error);
    connectionStatus.value = 'error';
    
    // 详细的错误信息
    const errorData = {
      error: error.message,
      status: error.response?.status,
      details: error.response?.data || '无详细信息',
      requestURL: error.config?.url ? `${error.config.baseURL || ''}${error.config.url}` : '未知',
    };
    
    connectionResult.value = JSON.stringify(errorData, null, 2);
    ElMessage.error('连接失败，请查看详细信息');
  } finally {
    connectionLoading.value = false;
  }
}

// 测试认证
async function testAuth() {
  authLoading.value = true;
  authResult.value = null;
  authStatus.value = null;
  
  try {
    const res = await api.test.testAuth();
    console.log('认证测试成功:', res);
    authResult.value = JSON.stringify(res, null, 2);
    authStatus.value = 'success';
    ElMessage.success('认证成功');
  } catch (error) {
    console.error('认证测试失败:', error);
    authStatus.value = 'error';
    
    // 详细的错误信息
    const errorData = {
      error: error.message,
      status: error.response?.status,
      details: error.response?.data || '无详细信息',
      requestURL: error.config?.url ? `${error.config.baseURL || ''}${error.config.url}` : '未知',
    };
    
    authResult.value = JSON.stringify(errorData, null, 2);
    
    if (error.response?.status === 401) {
      ElMessage.warning('未登录或认证失败，请先登录');
    } else {
      ElMessage.error('认证测试失败，请查看详细信息');
    }
  } finally {
    authLoading.value = false;
  }
}

// 测试JWT生成
async function testJwt() {
  jwtLoading.value = true;
  jwtResult.value = null;
  jwtStatus.value = null;
  jwtToken.value = null;
  
  try {
    const res = await api.test.testJwtDemo();
    console.log('JWT测试成功:', res);
    jwtResult.value = JSON.stringify(res, null, 2);
    jwtStatus.value = 'success';
    
    // 提取JWT令牌
    if (res.data && res.data.demoToken) {
      jwtToken.value = res.data.demoToken;
    }
    
    ElMessage.success('JWT生成成功');
  } catch (error) {
    console.error('JWT测试失败:', error);
    jwtStatus.value = 'error';
    
    // 详细的错误信息
    const errorData = {
      error: error.message,
      status: error.response?.status,
      details: error.response?.data || '无详细信息',
      requestURL: error.config?.url ? `${error.config.baseURL || ''}${error.config.url}` : '未知',
    };
    
    jwtResult.value = JSON.stringify(errorData, null, 2);
    ElMessage.error('JWT生成失败，请查看详细信息');
  } finally {
    jwtLoading.value = false;
  }
}

// 保存为用户Token
function saveJwtToken() {
  if (!jwtToken.value) return;
  
  localStorage.setItem('token', `Bearer ${jwtToken.value}`);
  ElMessage.success('已保存为用户令牌，您现在可以进行认证测试');
}

// 保存为管理员Token
function saveAdminJwtToken() {
  if (!jwtToken.value) return;
  
  localStorage.setItem('adminToken', `Bearer ${jwtToken.value}`);
  ElMessage.success('已保存为管理员令牌，您现在可以访问管理界面');
}
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  overflow-y: auto;
  height: 100%;
  min-height: 100vh;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-container {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
  max-height: 400px;
}

.result-container.success {
  background-color: #f0f9eb;
  border-left: 4px solid #67c23a;
}

.result-container.error {
  background-color: #fef0f0;
  border-left: 4px solid #f56c6c;
}

.error-tips {
  margin-top: 15px;
  padding: 10px;
  background-color: #fff;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.error-tips h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #f56c6c;
}

.error-tips ul {
  padding-left: 20px;
  margin: 0;
}

.error-tips li {
  margin-bottom: 5px;
}

.empty-result {
  color: #909399;
  text-align: center;
  padding: 30px 0;
}

.jwt-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
}
</style> 