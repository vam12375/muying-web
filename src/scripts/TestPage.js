import { ref } from 'vue';
import { test } from '@/api';
import { ElMessage } from 'element-plus';

export default function useTestPage() {
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

  return {
    loading,
    result,
    testConnection
  };
} 