import request from '@/utils/request';

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export function getCartList() {
  return request({
    url: '/cart',
    method: 'get'
  });
}

/**
 * 添加商品到购物车
 * @param {Object} data - 商品信息
 * @returns {Promise}
 */
export function addToCart(data) {
  return request({
    url: '/cart',
    method: 'post',
    data
  });
}

/**
 * 更新购物车商品数量
 * @param {number} cartItemId - 购物车项ID
 * @param {number} quantity - 新数量
 * @returns {Promise}
 */
export function updateCartItem(cartItemId, data) {
  return request({
    url: `/cart/${cartItemId}`,
    method: 'put',
    data
  });
}

/**
 * 删除购物车项
 * @param {number} cartItemId - 购物车项ID
 * @returns {Promise}
 */
export function removeFromCart(cartItemId) {
  return request({
    url: `/cart/${cartItemId}`,
    method: 'delete'
  });
}

/**
 * 清空购物车
 * @returns {Promise}
 */
export function clearCart() {
  return request({
    url: '/cart/clear',
    method: 'delete'
  });
}

/**
 * 选择/取消选择购物车项
 * @param {number} cartItemId - 购物车项ID
 * @param {boolean} selected - 是否选中
 * @returns {Promise}
 */
export function selectCartItem(cartItemId, selected) {
  return request({
    url: `/cart/${cartItemId}/select`,
    method: 'put',
    data: { selected }
  });
}

/**
 * 全选/取消全选购物车
 * @param {boolean} selected - 是否全选
 * @returns {Promise}
 */
export function selectAllCartItems(selected) {
  return request({
    url: '/cart/select-all',
    method: 'put',
    data: { selected }
  });
}

/**
 * 获取购物车商品数量
 * @returns {Promise}
 */
export function getCartCount() {
  return request({
    url: '/cart/count',
    method: 'get'
  });
}

/**
 * 获取购物车总计信息
 * @returns {Promise}
 */
export function getCartTotal() {
  return request({
    url: '/cart/total',
    method: 'get'
  });
}

/**
 * 批量删除购物车商品
 * @param {Array} itemIds - 购物车项ID数组
 * @returns {Promise}
 */
export function batchRemoveCartItems(itemIds) {
  return request({
    url: '/cart/batch-remove',
    method: 'delete',
    data: { itemIds }
  });
} 