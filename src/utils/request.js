import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from '@/utils/auth';
import router from '@/router';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 修改默认API基础URL，移除localhost指定
  timeout: 15000 // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前做些什么
    const token = getToken();
    console.log('请求拦截器获取的token:', token);
    
    if (token) {
      // 将token添加到请求头，确保格式正确
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('设置Authorization头:', config.headers['Authorization']);
    }
    
    // 开发环境下打印请求信息
    if (import.meta.env.DEV) {
      console.log('请求配置:', config.url, config.method, config.headers);
    }
    
    return config;
  },
  error => {
    // 请求错误处理
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 处理服务器返回的数据
    const res = response.data;
    
    // 开发环境下打印响应信息
    if (import.meta.env.DEV) {
      console.log('响应数据:', response.config.url, res);
    }
    
    // 服务器返回非200状态码
    if (res.code !== 200) {
      // 显示错误消息
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      });
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 弹出确认对话框
        ElMessageBox.confirm(
          '登录状态已过期，请重新登录',
          '系统提示',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          // 清除本地token
          removeToken();
          // 跳转到登录页
          router.push(`/login?redirect=${router.currentRoute.value.fullPath}`);
        });
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    } else {
      return res;
    }
  },
  error => {
    console.error('响应错误详情:', error);
    
    // 处理HTTP错误状态码
    if (error.response) {
      const status = error.response.status;
      console.error('错误状态码:', status);
      console.error('错误数据:', error.response.data);
      
      switch (status) {
        case 401:
          // 未授权
          ElMessage.error('用户未登录或登录状态已过期，请重新登录');
          router.push('/login');
          break;
        case 403:
          // 没有权限
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          // 资源不存在
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          ElMessage.error('服务器错误，请稍后重试');
          break;
        default:
          // 其他错误
          ElMessage.error(error.response.data.message || '请求失败，请稍后重试');
      }
    } else if (error.request) {
      // 请求发送但没有收到响应
      ElMessage.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default service; 