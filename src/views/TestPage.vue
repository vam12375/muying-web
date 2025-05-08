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
import useTestPage from '@/scripts/TestPage';

const { loading, result, testConnection } = useTestPage();
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