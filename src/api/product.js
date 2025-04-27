import request from '@/utils/request';

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  });
}

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  });
}

/**
 * 获取商品分类
 * @returns {Promise}
 */
export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  });
}

/**
 * 获取热门商品
 * @param {number} limit - 数量限制
 * @returns {Promise}
 */
export function getHotProducts(limit = 6) {
  return request({
    url: '/products/hot',
    method: 'get',
    params: { limit }
  });
}

/**
 * 获取新品推荐
 * @param {number} limit - 数量限制
 * @returns {Promise}
 */
export function getNewProducts(limit = 8) {
  return request({
    url: '/products/new',
    method: 'get',
    params: { limit }
  });
}

/**
 * 获取商品评论
 * @param {number} productId - 商品ID
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export function getProductReviews(productId, params) {
  return request({
    url: `/products/${productId}/reviews`,
    method: 'get',
    params
  });
}

/**
 * 添加商品评论
 * @param {number} productId - 商品ID
 * @param {Object} data - 评论数据
 * @returns {Promise}
 */
export function addProductReview(productId, data) {
  return request({
    url: `/products/${productId}/reviews`,
    method: 'post',
    data
  });
} 