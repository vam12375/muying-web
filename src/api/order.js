import request from '@/utils/request';

/**
 * 获取订单列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {string} params.status - 订单状态
 * @param {string} params.orderNumber - 订单号
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise} 返回订单列表
 */
export function getOrderList(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  });
}

/**
 * 获取订单详情
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回订单详情
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  });
}

/**
 * 创建订单
 * @param {Object} data - 订单数据
 * @returns {Promise} 返回创建结果
 */
export function createOrder(data) {
  return request({
    url: '/order/create',
    method: 'post',
    data
  });
}

/**
 * 取消订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 取消原因
 * @returns {Promise} 返回取消结果
 */
export function cancelOrder(orderId, data) {
  return request({
    url: `/order/${orderId}/cancel`,
    method: 'put',
    data
  });
}

/**
 * 删除订单（逻辑删除）
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回删除结果
 */
export function deleteOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'delete'
  });
}

/**
 * 确认收货
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回确认结果
 */
export function confirmReceive(orderId) {
  return request({
    url: `/order/${orderId}/receive`,
    method: 'put'
  });
}

/**
 * 支付订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 支付数据
 * @returns {Promise} 返回支付结果
 */
export function payOrder(orderId, data) {
  return request({
    url: `/order/${orderId}/pay`,
    method: 'post',
    data
  });
}

/**
 * 获取订单统计信息
 * @returns {Promise} 返回订单统计
 */
export function getOrderStats() {
  return request({
    url: '/order/stats',
    method: 'get'
  });
}

/**
 * 评价订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 评价数据
 * @returns {Promise} 返回评价结果
 */
export function reviewOrder(orderId, data) {
  return request({
    url: `/order/${orderId}/review`,
    method: 'post',
    data
  });
}

/**
 * 申请退款
 * @param {string} orderId - 订单ID
 * @param {Object} data - 退款数据
 * @returns {Promise} 返回申请结果
 */
export function applyRefund(orderId, data) {
  // 获取当前登录用户ID
  const userId = localStorage.getItem('userId');
  
  // 创建请求参数对象
  const params = {
    orderId: orderId,
    userId: userId,
    amount: data.amount,
    reason: data.reason,
    reasonDetail: data.reasonDetail || '',
    // 确保evidenceImages是有效的JSON字符串格式，对于空数组使用'[]'
    evidenceImages: data.evidenceImages ? JSON.stringify(data.evidenceImages) : '[]'
  };
  
  return request({
    url: '/api/refund/apply',
    method: 'post',
    params  // 使用params发送查询参数
  });
}

/**
 * 获取物流信息
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回物流信息
 */
export function getShippingInfo(orderId) {
  return request({
    url: `/order/${orderId}/shipping`,
    method: 'get'
  });
}

/**
 * 直接购买商品（不添加到购物车）
 * @param {Object} data - 直接购买数据
 * @returns {Promise} 返回创建结果
 */
export function directPurchase(data) {
  return request({
    url: '/order/direct-purchase',
    method: 'post',
    data
  });
}