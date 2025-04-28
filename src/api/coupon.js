import request from '@/utils/request';

/**
 * 获取用户优惠券列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 优惠券状态：可用(available)、已使用(used)、已过期(expired)
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回优惠券列表
 */
export function getUserCoupons(params) {
  return request({
    url: '/user/coupons',
    method: 'get',
    params
  });
}

/**
 * 获取可领取的优惠券列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回可领取优惠券列表
 */
export function getAvailableCoupons(params) {
  return request({
    url: '/coupons/available',
    method: 'get',
    params
  });
}

/**
 * 领取优惠券
 * @param {string} couponId - 优惠券ID
 * @returns {Promise} 返回领取结果
 */
export function receiveCoupon(couponId) {
  return request({
    url: `/coupons/${couponId}/receive`,
    method: 'post'
  });
}

/**
 * 根据优惠券码领取优惠券
 * @param {string} code - 优惠券码
 * @returns {Promise} 返回领取结果
 */
export function receiveCouponByCode(code) {
  return request({
    url: '/coupons/receive-by-code',
    method: 'post',
    data: { code }
  });
}

/**
 * 获取订单可用优惠券
 * @param {Object} params - 订单参数
 * @param {number} params.totalAmount - 订单总金额
 * @param {Array} params.productIds - 商品ID列表
 * @returns {Promise} 返回可用优惠券列表
 */
export function getAvailableCouponsForOrder(params) {
  return request({
    url: '/coupons/available-for-order',
    method: 'get',
    params
  });
}

/**
 * 验证优惠券是否可用
 * @param {string} couponId - 优惠券ID
 * @param {Object} orderInfo - 订单信息
 * @returns {Promise} 返回验证结果
 */
export function validateCoupon(couponId, orderInfo) {
  return request({
    url: `/coupons/${couponId}/validate`,
    method: 'post',
    data: orderInfo
  });
} 