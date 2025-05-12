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

/**
 * 切换商品收藏状态
 * @param {number} productId - 商品ID 
 * @returns {Promise}
 */
export function toggleProductFavorite(productId) {
  return request({
    url: `/products/${productId}/favorite`,
    method: 'post'
  });
}

/**
 * 获取相关推荐商品
 * @param {number} productId - 商品ID
 * @param {Object} params - 查询参数，如 limit 
 * @returns {Promise}
 */
export function getRelatedProducts(productId, params) {
  return request({
    url: `/products/${productId}/related`,
    method: 'get',
    params
  });
}

/**
 * 获取品牌列表
 * @param {Object} params - 查询参数，如 limit, page
 * @returns {Promise}
 */
export function getBrands(params) {
  return request({
    url: '/brands',
    method: 'get',
    params
  });
}

/**
 * 获取品牌详情
 * @param {number} id - 品牌ID
 * @returns {Promise}
 */
export function getBrandDetail(id) {
  return request({
    url: `/brands/${id}`,
    method: 'get'
  });
}

/**
 * 获取品牌相关产品
 * @param {number} brandId - 品牌ID
 * @param {Object} params - 查询参数，如 limit, page
 * @returns {Promise}
 */
export function getBrandProducts(brandId, params) {
  return request({
    url: `/brands/${brandId}/products`,
    method: 'get',
    params
  });
}

/**
 * 获取分类详情
 * @param {number} id - 分类ID
 * @returns {Promise}
 */
export function getCategoryDetail(id) {
  return request({
    url: `/categories/${id}`,
    method: 'get'
  });
}

/**
 * 获取分类相关产品
 * @param {number} categoryId - 分类ID
 * @param {Object} params - 查询参数，如 limit, page
 * @returns {Promise}
 */
export function getCategoryProducts(categoryId, params) {
  return request({
    url: `/categories/${categoryId}/products`,
    method: 'get',
    params
  });
}

/**
 * 获取子分类列表
 * @param {number} parentId - 父分类ID
 * @returns {Promise}
 */
export function getSubCategories(parentId) {
  return request({
    url: '/categories/sub',
    method: 'get',
    params: { parentId }
  });
}

/**
 * 获取商品详情和参数信息
 * @param {number} id - 商品ID
 * @returns {Promise}
 */
export function getProductDetailWithParams(id) {
  return request({
    url: `/products/${id}/details`,
    method: 'get'
  });
}

/**
 * 获取推荐商品
 * @param {Object} params - 查询参数，包含productId, limit, type等
 * @returns {Promise}
 */
export function getRecommendedProducts(params) {
  return request({
    url: '/products/recommended',
    method: 'get',
    params
  });
} 