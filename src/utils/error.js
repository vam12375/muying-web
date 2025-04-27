/**
 * 错误处理工具类
 * 统一处理API错误，提供友好的错误提示
 */
import { ElMessage } from 'element-plus'

// 错误消息防抖：记录最近显示过的错误消息
const displayedErrors = new Set();
const ERROR_EXPIRY_TIME = 60 * 1000; // 一分钟内不重复显示相同错误

/**
 * 通用API错误处理函数
 * @param {Error} error 错误对象
 * @param {string} defaultMessage 默认错误消息
 * @param {boolean} showMessage 是否显示错误提示，默认true
 * @returns {object} 处理后的错误信息
 */
export function handleApiError(error, defaultMessage = '操作失败，请稍后重试', showMessage = true) {
  // 提取错误信息
  let errorMessage = defaultMessage;
  let statusCode = null;
  let errorCode = null;
  let isAuthError = false;
  
  // 格式化错误信息
  if (error) {
    // 优先处理Axios错误
    if (error.response) {
      // 服务器返回错误状态码
      statusCode = error.response.status;
      
      // 尝试从响应中获取错误信息
      if (error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
        
        if (error.response.data.code) {
          errorCode = error.response.data.code;
        }
      }
      
      // 处理认证错误
      if (statusCode === 401) {
        isAuthError = true;
        errorMessage = errorMessage || '用户未登录或登录已过期';
      } else if (statusCode === 403) {
        errorMessage = errorMessage || '没有操作权限';
      } else if (statusCode === 404) {
        errorMessage = errorMessage || '请求的资源不存在';
      } else if (statusCode >= 500) {
        errorMessage = errorMessage || '服务器内部错误，请稍后重试';
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络连接异常，请检查您的网络';
    } else if (error.message) {
      // 请求设置时发生错误
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // 直接传入的字符串错误信息
      errorMessage = error;
    }
    
    // 检查是否包含认证相关信息
    if (errorMessage.includes('登录') || errorMessage.includes('认证') || 
        errorMessage.includes('token') || errorMessage.includes('授权')) {
      isAuthError = true;
    }
  }
  
  // 显示错误消息（防止重复显示）
  if (showMessage && errorMessage) {
    showErrorMessage(errorMessage);
  }
  
  // 返回格式化的错误信息
  return {
    message: errorMessage,
    statusCode,
    errorCode,
    isAuthError,
    originalError: error
  };
}

/**
 * 防抖显示错误消息
 * @param {string} message 错误消息
 * @param {number} duration 显示时长，默认3000毫秒
 */
export function showErrorMessage(message, duration = 3000) {
  if (!message) return;
  
  // 如果最近显示过相同的错误，不再显示
  if (displayedErrors.has(message)) {
    console.log('已忽略重复错误消息:', message);
    return;
  }
  
  // 显示错误消息
  ElMessage({
    message,
    type: 'error',
    duration,
    showClose: true
  });
  
  // 记录已显示的错误消息
  displayedErrors.add(message);
  
  // 一定时间后从集合中移除
  setTimeout(() => {
    displayedErrors.delete(message);
  }, ERROR_EXPIRY_TIME);
}

/**
 * 业务错误类
 * 用于抛出业务逻辑相关的错误
 */
export class BusinessError extends Error {
  constructor(message, code = 'BUSINESS_ERROR', data = null) {
    super(message);
    this.name = 'BusinessError';
    this.code = code;
    this.data = data;
  }
}

/**
 * 验证错误类
 * 用于表单验证失败等场景
 */
export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields; // 存储验证失败的字段
  }
}

/**
 * 处理业务错误
 * @param {BusinessError} error 业务错误对象
 * @param {boolean} showMessage 是否显示错误提示
 * @returns {object} 处理后的错误信息
 */
export function handleBusinessError(error, showMessage = true) {
  if (!(error instanceof BusinessError)) {
    return handleApiError(error, '业务处理失败', showMessage);
  }
  
  if (showMessage) {
    showErrorMessage(error.message);
  }
  
  return {
    message: error.message,
    code: error.code,
    data: error.data,
    originalError: error
  };
}

export default {
  handleApiError,
  showErrorMessage,
  handleBusinessError,
  BusinessError,
  ValidationError
}; 