/**
 * 支付工具类
 * 处理支付状态检查、支付超时等功能
 */
import { ElMessage } from 'element-plus';
import { queryPaymentStatus, closePayment } from '@/api/payment';
import router from '@/router';

/**
 * 支付状态枚举
 */
export const PaymentStatus = {
  PENDING: 'PENDING', // 待支付
  PROCESSING: 'PROCESSING', // 处理中
  SUCCESS: 'SUCCESS', // 支付成功
  FAILED: 'FAILED', // 支付失败
  CLOSED: 'CLOSED', // 已关闭
  REFUNDING: 'REFUNDING', // 退款中
  REFUNDED: 'REFUNDED', // 已退款
  EXPIRED: 'EXPIRED' // 已过期
};

/**
 * 支付状态码映射
 */
const statusCodeMap = {
  '0': PaymentStatus.PENDING,
  '1': PaymentStatus.PROCESSING,
  '2': PaymentStatus.SUCCESS,
  '3': PaymentStatus.FAILED,
  '4': PaymentStatus.CLOSED,
  '5': PaymentStatus.REFUNDING,
  '6': PaymentStatus.REFUNDED,
  '7': PaymentStatus.EXPIRED
};

/**
 * 获取标准化的支付状态
 * @param {string|number} statusCode 状态码
 * @returns {string} 标准化的状态
 */
export function getPaymentStatus(statusCode) {
  if (statusCode === undefined || statusCode === null) return PaymentStatus.PENDING;
  
  // 将数字转为字符串
  const code = String(statusCode);
  
  // 尝试从映射中获取状态
  if (statusCodeMap[code]) {
    return statusCodeMap[code];
  }
  
  // 处理字符串状态
  const status = String(statusCode).toUpperCase();
  
  // 检查是否是已知的状态名称
  for (const key in PaymentStatus) {
    if (status === PaymentStatus[key]) {
      return PaymentStatus[key];
    }
  }
  
  // 默认返回待支付
  return PaymentStatus.PENDING;
}

/**
 * 启动支付状态检查
 * @param {string} paymentId 支付ID
 * @param {function} onStatusChange 状态变化回调
 * @param {number} interval 检查间隔(毫秒)，默认3000ms
 * @param {number} maxTries 最大尝试次数，默认60次(3分钟)
 * @returns {object} 包含stop方法的控制器
 */
export function startPaymentStatusCheck(paymentId, onStatusChange, interval = 3000, maxTries = 60) {
  if (!paymentId) {
    console.error('支付ID不能为空');
    return { stop: () => {} };
  }
  
  let tries = 0;
  let timerId = null;
  let stopped = false;
  
  // 执行状态检查
  const checkStatus = async () => {
    if (stopped || tries >= maxTries) {
      stopChecking();
      return;
    }
    
    tries++;
    
    try {
      const result = await queryPaymentStatus(paymentId);
      
      if (result && result.code === 200 && result.data) {
        const status = getPaymentStatus(result.data.status);
        const statusDetail = {
          status,
          paymentId,
          data: result.data,
          message: getStatusMessage(status),
          isTerminal: isTerminalStatus(status)
        };
        
        // 调用状态变化回调
        if (typeof onStatusChange === 'function') {
          onStatusChange(statusDetail);
        }
        
        // 如果是终态，停止检查
        if (isTerminalStatus(status)) {
          stopChecking();
          return;
        }
      }
    } catch (error) {
      console.error('检查支付状态出错:', error);
    }
    
    // 如果未停止，继续下一次检查
    if (!stopped) {
      timerId = setTimeout(checkStatus, interval);
    }
  };
  
  // 停止检查
  const stopChecking = () => {
    stopped = true;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  
  // 立即开始第一次检查
  checkStatus();
  
  // 返回控制器
  return {
    stop: stopChecking
  };
}

/**
 * 判断支付状态是否为终态（不再变化）
 * @param {string} status 支付状态
 * @returns {boolean} 是否是终态
 */
export function isTerminalStatus(status) {
  return [
    PaymentStatus.SUCCESS,
    PaymentStatus.FAILED,
    PaymentStatus.CLOSED,
    PaymentStatus.REFUNDED,
    PaymentStatus.EXPIRED
  ].includes(status);
}

/**
 * 获取状态对应的提示信息
 * @param {string} status 支付状态
 * @returns {string} 提示信息
 */
export function getStatusMessage(status) {
  const messages = {
    [PaymentStatus.PENDING]: '等待支付',
    [PaymentStatus.PROCESSING]: '支付处理中',
    [PaymentStatus.SUCCESS]: '支付成功',
    [PaymentStatus.FAILED]: '支付失败',
    [PaymentStatus.CLOSED]: '支付已关闭',
    [PaymentStatus.REFUNDING]: '退款处理中',
    [PaymentStatus.REFUNDED]: '已退款',
    [PaymentStatus.EXPIRED]: '支付已超时'
  };
  
  return messages[status] || '未知状态';
}

/**
 * 处理支付超时
 * @param {string} paymentId 支付ID
 * @param {string} orderNo 订单号
 * @param {function} onTimeout 超时回调
 */
export async function handlePaymentTimeout(paymentId, orderNo, onTimeout) {
  try {
    // 尝试关闭支付
    if (paymentId) {
      await closePayment(paymentId);
    }
    
    // 显示超时提示
    ElMessage.warning('支付已超时，订单已自动取消');
    
    // 执行回调
    if (typeof onTimeout === 'function') {
      onTimeout();
    } else {
      // 默认跳转到订单列表
      router.push('/orders');
    }
  } catch (error) {
    console.error('处理支付超时失败:', error);
    ElMessage.error('关闭支付失败，请稍后重试');
  }
}

/**
 * 开始支付倒计时
 * @param {number} seconds 倒计时秒数，默认1800秒(30分钟)
 * @param {function} onTick 每次倒计时回调
 * @param {function} onTimeout 倒计时结束回调
 * @returns {object} 包含stop方法的控制器
 */
export function startPaymentCountdown(seconds = 1800, onTick, onTimeout) {
  let timeLeft = seconds;
  let timerId = null;
  let stopped = false;
  
  // 执行倒计时
  const tick = () => {
    if (stopped) return;
    
    // 剩余时间递减
    timeLeft--;
    
    // 调用tick回调
    if (typeof onTick === 'function') {
      onTick(timeLeft);
    }
    
    // 检查是否结束
    if (timeLeft <= 0) {
      stopCountdown();
      
      // 调用超时回调
      if (typeof onTimeout === 'function') {
        onTimeout();
      }
      
      return;
    }
    
    // 继续下一秒
    timerId = setTimeout(tick, 1000);
  };
  
  // 停止倒计时
  const stopCountdown = () => {
    stopped = true;
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };
  
  // 立即开始倒计时
  tick();
  
  // 返回控制器
  return {
    stop: stopCountdown,
    getTimeLeft: () => timeLeft
  };
}

/**
 * 格式化倒计时显示
 * @param {number} seconds 剩余秒数
 * @returns {object} 格式化后的分钟和秒钟
 */
export function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return {
    minutes,
    seconds: remainingSeconds,
    formatted: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  };
}

/**
 * 获取支付方式显示名称
 * @param {string} method 支付方式代码
 * @returns {string} 支付方式名称
 */
export function getPaymentMethodName(method) {
  if (!method) return '未支付';
  
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    '微信支付': '微信支付',
    '支付宝': '支付宝',
    'wallet': '钱包支付',
    'cod': '货到付款'
  };
  
  return methodMap[method] || method;
}

export default {
  PaymentStatus,
  getPaymentStatus,
  startPaymentStatusCheck,
  isTerminalStatus,
  getStatusMessage,
  handlePaymentTimeout,
  startPaymentCountdown,
  formatCountdown,
  getPaymentMethodName
}; 