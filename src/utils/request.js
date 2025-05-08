import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from '@/utils/auth';
import router from '@/router';

// 标记是否正在进行会话同步
let isSyncingSession = false;
// 保存需要在会话同步后重试的请求
const requestsToRetry = [];
// 添加请求重试计数器
const retryCountMap = new Map();
// 最大重试次数
const MAX_RETRY_ATTEMPTS = 2;
// 已显示的错误消息哈希集合，用于去重
const shownErrorMessages = new Set();

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 修改默认API基础URL，移除localhost指定
  timeout: 15000, // 请求超时时间
  withCredentials: true // 确保请求发送cookies，支持跨域session
});

// 生成请求唯一标识
function getRequestId(config) {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;
}

// 显示错误消息，确保相同消息只显示一次
function showUniqueErrorMessage(message, type = 'error', duration = 5000) {
  const messageKey = `${type}:${message}`;
  if (!shownErrorMessages.has(messageKey)) {
    shownErrorMessages.add(messageKey);
    ElMessage({
      message,
      type,
      duration,
      onClose: () => {
        // 消息关闭后从集合中移除，允许将来再次显示
        setTimeout(() => {
          shownErrorMessages.delete(messageKey);
        }, 5000);
      }
    });
  }
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在请求发送前做些什么
    const token = getToken();
    
    if (token) {
      // 将token添加到请求头，确保格式正确
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // 如果是会话同步请求，标记一下
    if (config.url === '/session/sync') {
      config._isSessionSyncRequest = true;
    }
    
    // 开发环境下打印请求信息
    if (import.meta.env.DEV) {
      console.log('请求配置:', config.url, config.method);
    }
    
    return config;
  },
  error => {
    // 请求错误处理
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 会话同步函数
async function syncSession() {
  if (isSyncingSession) {
    // 如果已经在同步，等待其完成
    return new Promise(resolve => {
      setTimeout(() => resolve(syncSession()), 100);
    });
  }
  
  isSyncingSession = true;
  
  try {
    console.log('开始同步会话...');
    const token = getToken();
    if (!token) {
      console.error('没有可用的token，无法同步会话');
      return false;
    }
    
    const response = await service({
      url: '/session/sync',
      method: 'post',
      _isSessionSyncRequest: true
    });
    
    return response.code === 200;
  } catch (error) {
    console.error('会话同步失败:', error);
    return false;
  } finally {
    isSyncingSession = false;
  }
}

// 启动定时会话刷新
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000; // 30分钟刷新一次会话
let sessionRefreshTimer = null;

// 开始定时刷新会话
export function startSessionRefresh() {
  if (sessionRefreshTimer) {
    clearInterval(sessionRefreshTimer);
  }
  
  // 避免重复的初始同步
  if (!isSyncingSession) {
    syncSession();
  }
  
  // 设置定时器，定期刷新会话
  sessionRefreshTimer = setInterval(() => {
    const token = getToken();
    if (token) {
      console.log('定时刷新会话...');
      syncSession();
    } else {
      stopSessionRefresh();
    }
  }, SESSION_REFRESH_INTERVAL);
}

// 停止定时刷新会话
export function stopSessionRefresh() {
  if (sessionRefreshTimer) {
    clearInterval(sessionRefreshTimer);
    sessionRefreshTimer = null;
    console.log('已停止会话刷新');
  }
}

// 重试之前失败的请求
async function retryFailedRequests() {
  if (requestsToRetry.length === 0) return;
  
  console.log(`准备重试 ${requestsToRetry.length} 个失败的请求`);
  
  const requests = [...requestsToRetry];
  requestsToRetry.length = 0;
  
  for (const config of requests) {
    const requestId = getRequestId(config);
    const retryCount = retryCountMap.get(requestId) || 0;
    
    // 检查是否达到最大重试次数
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      console.log(`请求 ${config.url} 已达到最大重试次数 ${MAX_RETRY_ATTEMPTS}，放弃重试`);
      // 显示一条友好的提示消息
      showUniqueErrorMessage('部分请求无法完成，请刷新页面重试');
      retryCountMap.delete(requestId); // 清理计数器
      continue;
    }
    
    try {
      console.log(`重试请求 (${retryCount + 1}/${MAX_RETRY_ATTEMPTS}): ${config.url}`);
      
      // 更新重试计数
      retryCountMap.set(requestId, retryCount + 1);
      
      await service(config);
    } catch (error) {
      console.error('重试请求失败:', error);
      
      // 如果重试失败但未达到最大次数，则再次加入重试队列
      if (retryCount + 1 < MAX_RETRY_ATTEMPTS) {
        console.log(`请求 ${config.url} 将在下次会话同步后再次尝试`);
        requestsToRetry.push(config);
      } else {
        console.log(`请求 ${config.url} 已达到最大重试次数，放弃重试`);
        retryCountMap.delete(requestId); // 清理计数器
      }
    }
  }
}

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    
    if (import.meta.env.DEV && res) {
      console.log('响应数据:', response.config.url, res.code);
    }
    
    // 服务器返回非200状态码
    if (res.code !== 200) {
      // 重新启用会话同步和重试逻辑
      if (res.code === 400 && res.message === '未登录' && !response.config._isSessionSyncRequest) {
        console.log('检测到未登录错误，尝试同步会话');
        const requestId = getRequestId(response.config);
        const retryCount = retryCountMap.get(requestId) || 0;
        
        if (retryCount >= MAX_RETRY_ATTEMPTS) {
          console.log(`请求 ${response.config.url} 已达到最大重试次数，放弃重试`);
          showUniqueErrorMessage('登录状态异常，请尝试重新登录');
          retryCountMap.delete(requestId);
          return Promise.reject(new Error(res.message || '请求失败'));
        }
        
        const retryConfig = { ...response.config };
        retryConfig.headers = { ...response.config.headers };
        retryCountMap.set(requestId, retryCount + 1);
        requestsToRetry.push(retryConfig);
        
        syncSession().then(success => {
          if (success) {
            console.log('会话同步成功，准备重试请求');
            retryFailedRequests();
          } else {
            console.log('会话同步失败，放弃重试');
            requestsToRetry.length = 0;
            showUniqueErrorMessage('登录状态异常，请尝试重新登录');
          }
        });
        
        return new Promise((resolve, reject) => {});
      }
      
      // 对其他非200错误进行统一提示
      const errorMessage = res.message || '请求处理失败';
      console.error(`请求失败 [${response.config.method.toUpperCase()} ${response.config.url}]: Code=${res.code}, Message=${errorMessage}`);
      
      // 避免显示会话同步本身的错误消息
      if (!response.config._isSessionSyncRequest) {
          showUniqueErrorMessage(errorMessage);
      }
      
      // 返回一个拒绝的Promise，包含错误信息
      return Promise.reject(new Error(errorMessage));
    } else {
      // 如果code是200，表示成功
      const requestId = getRequestId(response.config);
      retryCountMap.delete(requestId); // 清除成功请求的重试计数
      return res; // 返回data部分
    }
  },
  error => {
    // 处理网络错误等其他错误
    console.error('响应错误:', error);
    let message = '网络错误，请检查您的连接或稍后重试';
    
    if (error.response) {
      // 请求已发出，服务器用状态码响应
      switch (error.response.status) {
        case 401:
          message = '认证失败或登录已过期，请重新登录';
          // 可以在这里触发重新登录逻辑
          // 例如: clearAuth(); router.push('/login');
          break;
        case 403:
          message = '您没有权限执行此操作';
          break;
        case 404:
          message = '请求的资源未找到';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          message = '服务器繁忙或发生内部错误，请稍后重试';
          break;
        default:
          message = `请求失败，状态码：${error.response.status}`;
      }
      // 如果后端在错误响应中提供了message字段
      if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '服务器无响应，请检查网络或稍后重试';
    } else if (error.code === 'ECONNABORTED') {
      // 请求超时
      message = '请求超时，请稍后重试';
    }
    
    showUniqueErrorMessage(message);
    return Promise.reject(error);
  }
);

// 清理函数，在页面卸载时调用
export function cleanupRequests() {
  // 清空重试队列和计数器
  requestsToRetry.length = 0;
  retryCountMap.clear();
  shownErrorMessages.clear();
}

export default service; 