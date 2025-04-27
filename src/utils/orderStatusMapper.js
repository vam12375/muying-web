/**
 * 订单状态映射工具函数
 * 用于统一管理订单状态的显示文本、颜色类型和操作权限
 */

// 订单状态对应的文本描述
export const getStatusText = (status) => {
  // 处理数字状态
  if (!isNaN(status)) {
    const statusNumber = parseInt(status);
    const statusMap = {
      0: '待付款',
      1: '待发货',
      2: '待收货',
      3: '已完成',
      4: '已取消',
      5: '退款中',
      6: '已关闭'
    };
    return statusMap[statusNumber] || '未知状态';
  }
  
  // 处理字符串状态
  const statusMap = {
    'unpaid': '待付款',
    'PENDING_PAYMENT': '待付款',
    'unshipped': '待发货',
    'PAID': '待发货',
    'PENDING_SHIPMENT': '待发货',
    'shipped': '待收货',
    'SHIPPED': '待收货',
    'completed': '已完成',
    'COMPLETED': '已完成',
    'cancelled': '已取消',
    'CANCELLED': '已取消',
    'refunding': '退款中',
    'REFUNDING': '退款中',
    'closed': '已关闭',
    'CLOSED': '已关闭',
    // 直接支持中文状态 - 前后端保持一致
    '待付款': '待付款',
    '待发货': '待发货',
    '待收货': '待收货',
    '已完成': '已完成',
    '已取消': '已取消',
    '退款中': '退款中',
    '已关闭': '已关闭'
  };
  
  return statusMap[status] || '未知状态';
};

// 获取状态对应的Element UI标签类型
export const getStatusType = (status) => {
  const statusText = getStatusText(status);
  
  const typeMap = {
    '待付款': 'warning',
    '待发货': 'primary',
    '待收货': 'success',
    '已完成': 'info',
    '已取消': 'danger',
    '退款中': 'danger',
    '已关闭': 'info'
  };
  
  return typeMap[statusText] || 'info';
};

// 判断是否可以支付订单
export const canPay = (status) => {
  const statusText = getStatusText(status);
  return statusText === '待付款';
};

// 判断是否可以取消订单
export const canCancel = (status) => {
  const statusText = getStatusText(status);
  return statusText === '待付款' || statusText === '待发货';
};

// 判断是否可以确认收货
export const canConfirm = (status) => {
  const statusText = getStatusText(status);
  return statusText === '待收货';
};

// 判断是否可以评价订单
export const canReview = (status) => {
  const statusText = getStatusText(status);
  return statusText === '已完成';
};

// 判断是否可以申请退款
export const canRefund = (status) => {
  const statusText = getStatusText(status);
  return statusText === '待发货' || statusText === '待收货' || statusText === '已完成';
};

// 获取状态对应的数字码（用于后端API）
export const getStatusCode = (status) => {
  if (!isNaN(status)) {
    return parseInt(status);
  }
  
  const codeMap = {
    '待付款': 0,
    '待发货': 1,
    '待收货': 2,
    '已完成': 3,
    '已取消': 4,
    '退款中': 5,
    '已关闭': 6,
    'unpaid': 0,
    'unshipped': 1,
    'shipped': 2,
    'completed': 3,
    'cancelled': 4,
    'refunding': 5,
    'closed': 6
  };
  
  return codeMap[status] !== undefined ? codeMap[status] : '';
};

export default {
  getStatusText,
  getStatusType,
  canPay,
  canCancel,
  canConfirm,
  canReview,
  canRefund,
  getStatusCode
}; 