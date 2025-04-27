<template>
  <div class="test-container">
    <el-card class="test-card">
      <template #header>
        <div class="card-header">
          <h2>API连接测试</h2>
        </div>
      </template>
      <div class="test-content">
        <el-button type="primary" @click="testConnection" :loading="loading">
          测试连接
        </el-button>
        
        <div v-if="result" class="result-container">
          <el-alert
            :title="result.message"
            :type="result.code === 200 ? 'success' : 'error'"
            :description="result.data"
            show-icon
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { test } from '@/api';
import { ElMessage } from 'element-plus';

const loading = ref(false);
const result = ref(null);

const testConnection = async () => {
  loading.value = true;
  try {
    const response = await test.testConnection();
    result.value = response;
    ElMessage.success('请求成功');
  } catch (error) {
    console.error('连接测试失败:', error);
    result.value = {
      code: error.response?.status || 500,
      message: '连接失败',
      data: error.message
    };
    ElMessage.error('请求失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.test-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.test-content {
  padding: 20px 0;
}

.result-container {
  margin-top: 20px;
}
</style> 