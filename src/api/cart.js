import request from '@/utils/request';

/**
 * 获取购物车列表
 * @returns {Promise}
 */
export function getCartList() {
  return request({
    url: '/cart/list',
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
    url: '/cart/add',
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
    url: `/cart/update`,
    method: 'put',
    data: {
      ...data,
      cartId: cartItemId
    }
  });
}

/**
 * 删除购物车项
 * @param {number} cartItemId - 购物车项ID
 * @returns {Promise}
 */
export function removeFromCart(cartItemId) {
  return request({
    url: `/cart/delete/${cartItemId}`,
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
 * @param {Object} params - 参数对象
 * @param {number} params.cartId - 购物车项ID
 * @param {number} params.selected - 是否选中 (1 或 0)
 * @returns {Promise}
 */
export function selectCartItem({ cartId, selected }) {
  return request({
    url: `/cart/select/${cartId}/${selected}`,
    method: 'put',
  });
}

/**
 * 全选/取消全选购物车
 * @param {boolean} selected - 是否全选
 * @returns {Promise}
 */
export function selectAllCartItems(selected) {
  return request({
    url: `/cart/select/${selected ? 1 : 0}`,
    method: 'put'
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

/**
 * 验证购物车选中状态
 * 在结算前调用此接口确认服务器端有选中的商品
 * @returns {Promise}
 */
export function validateCartSelections() {
  return request({
    url: '/cart/validate',
    method: 'get'
  });
} 