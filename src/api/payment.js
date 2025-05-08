import request from '@/utils/request';

/**
 * 创建支付宝支付订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 支付数据，包含支付方式等
 * @returns {Promise} 返回支付信息，包含支付链接或表单
 */
export function createAlipayOrder(orderId, data) {
  return request({
    url: `/payment/alipay/create/${orderId}`,
    method: 'post',
    data
  });
}

/**
 * 查询支付状态
 * @param {string} paymentId - 支付ID
 * @returns {Promise} 返回支付状态信息
 */
export function queryPaymentStatus(paymentId) {
  return request({
    url: `/payment/status/${paymentId}`,
    method: 'get'
  });
}

/**
 * 关闭支付订单
 * @param {string} paymentId - 支付ID
 * @returns {Promise} 返回关闭结果
 */
export function closePayment(paymentId) {
  return request({
    url: `/payment/close/${paymentId}`,
    method: 'post'
  });
}

/**
 * 获取支付详情
 * @param {string} paymentId - 支付ID
 * @returns {Promise} 返回支付详情
 */
export function getPaymentDetail(paymentId) {
  return request({
    url: `/payment/${paymentId}`,
    method: 'get'
  });
}

/**
 * 获取订单支付信息
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回订单支付信息
 */
export function getOrderPaymentInfo(orderId) {
  return request({
    url: `/payment/order/${orderId}`,
    method: 'get'
  });
}

/**
 * 创建微信沙箱模拟支付订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 支付数据 (可选)
 * @returns {Promise}
 */
export function createWechatSandboxPayment(orderId, data = {}) {
  return request({
    url: `/payment/wechat/sandbox/create/${orderId}`,
    method: 'post',
    data
  });
}

/**
 * 创建钱包支付订单
 * @param {string} orderId - 订单ID
 * @param {Object} data - 支付数据 (可选)
 * @returns {Promise}
 */
export function createWalletPayment(orderId, data = {}) {
  return request({
    url: `/payment/wallet/create/${orderId}`,
    method: 'post',
    data
  });
} 