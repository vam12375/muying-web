/**
 * 订单状态更新工具
 * 提供订单状态更新和同步相关功能
 */
import request from '@/utils/request'
import { ElMessage } from 'element-plus'
import { getStatusText } from '@/utils/orderStatusMapper'
import { updatePaymentStatus } from '@/api/payment'

/**
 * 支付完成后更新订单状态
 * @param {Object} params 更新参数
 * @param {string} params.orderNo 订单编号
 * @param {string} params.tradeNo 第三方支付交易号
 * @param {string} params.paymentMethod 支付方式
 * @param {number} params.amount 支付金额
 * @returns {Promise} 更新结果的Promise
 */
export function updateOrderStatusAfterPayment(params) {
  console.log('正在更新订单状态为已支付:', params);
  
  // 支持传入字符串或对象形式的参数
  const orderNo = typeof params === 'string' ? params : params.orderNo;
  const tradeNo = typeof params === 'object' ? params.tradeNo : '';
  const paymentMethod = typeof params === 'object' ? params.paymentMethod : 'alipay';
  
  if (!orderNo) {
    console.error('订单编号不能为空');
    return Promise.reject(new Error('订单编号不能为空'));
  }
  
  // 显示状态更新中的提示
  ElMessage({
    message: '订单支付成功，正在更新订单状态...',
    type: 'success',
    duration: 3000
  });
  
  // 构建支付更新参数
  const updateData = {
    orderNo,
    status: 'pending_shipment'
  };
  
  // 如果有支付宝交易号，添加到更新参数中
  if (tradeNo) {
    updateData.tradeNo = tradeNo;
    updateData.paymentMethod = paymentMethod;
  }
  
  // 第一种方法：使用payment API更新状态
  return updatePaymentStatus(updateData)
    .then(result => {
      if (result.success) {
        console.log('订单状态更新成功:', orderNo);
        ElMessage.success('订单状态已更新为待发货');
        
        // 添加系统跳转逻辑
        notifyPaymentSuccess(orderNo);
        
        return {
          success: true,
          message: '订单状态更新成功'
        };
      } else {
        console.error('订单状态更新失败:', result.message);
        // 尝试备用方法更新
        return updateOrderStatusFallback(orderNo, tradeNo, paymentMethod);
      }
    })
    .catch(error => {
      console.error('更新订单状态请求失败:', error);
      // 尝试备用方法更新
      return updateOrderStatusFallback(orderNo, tradeNo, paymentMethod);
    });
}

/**
 * 备用的订单状态更新方法
 * 当主要方法失败时调用
 */
function updateOrderStatusFallback(orderNo, tradeNo, paymentMethod) {
  console.log('尝试使用备用方法更新订单状态:', orderNo, tradeNo);
  
  // 改用获取订单详情接口代替状态查询
  return request({
    url: `/api/order/no/${orderNo}`,
    method: 'get',
    headers: {
      'Authorization': localStorage.getItem('token') || '',
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.code === 200) {
      console.log('查询订单状态成功，尝试其他方式更新状态');
      
      // 构建确认支付参数
      const confirmData = {
        orderNo,
        paymentMethod: paymentMethod || 'alipay'
      };
      
      // 添加交易号参数
      if (tradeNo) {
        confirmData.tradeNo = tradeNo;
      }
      
      // 使用确认支付API
      return request({
        url: `/api/order/confirmPayment`,
        method: 'post',
        data: confirmData,
        headers: {
          'Authorization': localStorage.getItem('token') || '',
          'Content-Type': 'application/json'
        }
      }).then(confirmResponse => {
        if (confirmResponse.code === 200) {
          console.log('确认支付成功');
          ElMessage.success('订单状态已更新为待发货');
          
          // 添加系统跳转逻辑
          notifyPaymentSuccess(orderNo);
          
          return {
            success: true,
            message: '订单状态更新成功'
          };
        } else {
          console.error('确认支付失败:', confirmResponse.message);
          return updateOrderStatusLastResort(orderNo, tradeNo);
        }
      }).catch(error => {
        console.error('确认支付请求失败:', error);
        return updateOrderStatusLastResort(orderNo, tradeNo);
      });
    } else {
      console.error('查询订单状态失败:', response.message);
      return updateOrderStatusLastResort(orderNo, tradeNo);
    }
  }).catch(error => {
    console.error('备用方法请求失败:', error);
    return updateOrderStatusLastResort(orderNo, tradeNo);
  });
}

/**
 * 最后一种尝试方法 - 直接更新订单状态
 */
function updateOrderStatusLastResort(orderNo, tradeNo) {
  console.log('尝试最后的状态更新方法:', orderNo, tradeNo);
  
  let url = `/api/order/confirmPaidStatus?orderNo=${orderNo}`;
  
  // 如果有交易号，添加到URL参数
  if (tradeNo) {
    url += `&tradeNo=${tradeNo}`;
  }
  
  return request({
    url: url,
    method: 'post',
    headers: {
      'Authorization': localStorage.getItem('token') || '',
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.code === 200) {
      console.log('最后方法更新订单状态成功');
      ElMessage.success('订单状态已更新为待发货');
      
      // 添加系统跳转逻辑
      notifyPaymentSuccess(orderNo);
      
      return {
        success: true,
        message: '订单状态更新成功'
      };
    } else {
      console.error('最后方法更新订单状态失败:', response.message);
      // 所有方法都失败，但仍返回成功以允许用户继续，同时提醒刷新
      ElMessage({
        message: '订单支付成功，请稍后刷新查看最新状态',
        type: 'info',
        duration: 5000
      });
      
      // 仍然尝试执行跳转
      notifyPaymentSuccess(orderNo);
      
      return {
        success: false,
        message: '订单状态更新失败，请稍后刷新查看'
      };
    }
  }).catch(error => {
    console.error('最后方法请求失败:', error);
    ElMessage({
      message: '订单支付成功，请稍后刷新查看最新状态',
      type: 'info',
      duration: 5000
    });
    
    // 仍然尝试执行跳转
    notifyPaymentSuccess(orderNo);
    
    return {
      success: false,
      message: '更新请求失败，请稍后刷新查看'
    };
  });
}

/**
 * 支付成功通知及后续处理
 */
function notifyPaymentSuccess(orderNo) {
  // 支付成功后延迟1秒跳转到订单列表页
  setTimeout(() => {
    // 如果当前不在订单列表页，则跳转
    if (!window.location.pathname.includes('/user/orders')) {
      window.location.href = `/user/orders?refresh=true&orderNo=${orderNo}`;
    } else {
      // 如果已经在订单列表页，则直接刷新
      window.location.reload();
    }
  }, 1000);
}

/**
 * 验证订单当前状态
 * @param {string} orderNo 订单编号
 * @returns {Promise<string>} 订单状态
 */
export function verifyOrderStatus(orderNo) {
  return request({
    url: `/api/order/no/${orderNo}`,
    method: 'get'
  }).then(response => {
    if (response.code === 200 && response.data) {
      const status = response.data.status;
      console.log('当前订单状态:', status, getStatusText(status));
      return status;
    } else {
      console.error('获取订单状态失败:', response.message);
      return null;
    }
  }).catch(error => {
    console.error('验证订单状态请求失败:', error);
    return null;
  });
}

/**
 * 轮询检查订单状态，直到状态变更或达到最大尝试次数
 * @param {string} orderNo 订单编号
 * @param {string} targetStatus 目标状态
 * @param {number} maxAttempts 最大尝试次数
 * @param {number} interval 间隔时间(毫秒)
 */
export function pollOrderStatus(orderNo, targetStatus = '待发货', maxAttempts = 5, interval = 1000) {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const check = () => {
      verifyOrderStatus(orderNo).then(status => {
        const statusText = getStatusText(status);
        
        if (statusText === targetStatus) {
          resolve(true);
        } else if (++attempts >= maxAttempts) {
          // 达到最大尝试次数，尝试手动更新状态
          updateOrderStatusAfterPayment(orderNo)
            .then(() => resolve(true))
            .catch(() => reject(new Error('更新订单状态失败')));
        } else {
          setTimeout(check, interval);
        }
      }).catch(error => {
        if (attempts >= maxAttempts) {
          reject(error);
        } else {
          attempts++;
          setTimeout(check, interval);
        }
      });
    };
    
    check();
  });
}

export default {
  updateOrderStatusAfterPayment,
  verifyOrderStatus,
  pollOrderStatus
}; 