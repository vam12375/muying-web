import request from '@/utils/request'

/**
 * 创建商品评价
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export function createComment(data) {
  return request({
    url: '/comment/create',
    method: 'post',
    data
  })
}

/**
 * 创建订单商品评价
 * @param {number} orderId - 订单ID
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export function createOrderComment(orderId, data) {
  return request({
    url: `/comment/order/${orderId}`,
    method: 'post',
    data
  })
}

/**
 * 根据订单ID获取评价
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function getOrderComments(orderId) {
  return request({
    url: `/comment/order/${orderId}`,
    method: 'get'
  })
}

/**
 * 检查订单是否已评价
 * @param {number} orderId - 订单ID
 * @returns {Promise}
 */
export function checkOrderCommentStatus(orderId) {
  return request({
    url: `/comment/order/${orderId}/status`,
    method: 'get'
  })
}

/**
 * 获取商品评价列表
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getProductComments(productId) {
  return request({
    url: `/comment/product/${productId}`,
    method: 'get'
  })
}

/**
 * 分页获取商品评价
 * @param {number} productId - 商品ID
 * @param {number} page - 页码
 * @param {number} size - 每页大小
 * @returns {Promise}
 */
export function getProductCommentPage(productId, page = 1, size = 10) {
  return request({
    url: `/comment/product/${productId}/page`,
    method: 'get',
    params: { page, size }
  })
}

/**
 * 获取用户评价列表
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserComments(userId) {
  return request({
    url: `/comment/user/${userId}`,
    method: 'get'
  })
}

/**
 * 分页获取用户评价列表
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @param {string} sort - 排序字段
 * @param {string} order - 排序方式(asc/desc)
 * @returns {Promise}
 */
export function getUserCommentPage(userId, page = 1, size = 10, sort = 'createTime', order = 'desc') {
  return request({
    url: `/comment/user/${userId}/page`,
    method: 'get',
    params: { page, size, sort, order }
  })
}

/**
 * 搜索用户评价列表
 * @param {number} userId - 用户ID
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @param {string} sort - 排序字段
 * @param {string} order - 排序方式(asc/desc)
 * @param {string} keyword - 搜索关键词
 * @param {string} ratingFilter - 评分筛选(good/neutral/bad)
 * @returns {Promise}
 */
export function searchUserComments(userId, page = 1, size = 10, sort = 'createTime', order = 'desc', keyword = '', ratingFilter = '') {
  return request({
    url: `/comment/user/${userId}/page/search`,
    method: 'get',
    params: { page, size, sort, order, keyword, ratingFilter }
  })
}

/**
 * 获取商品评分统计
 * @param {number} productId - 商品ID
 * @returns {Promise}
 */
export function getProductRatingStats(productId) {
  return request({
    url: `/comment/product/${productId}/stats`,
    method: 'get'
  })
}

/**
 * 删除评价（仅允许用户删除自己的评价）
 * @param {number} commentId - 评价ID
 * @returns {Promise}
 */
export function deleteComment(commentId) {
  return request({
    url: `/comment/${commentId}`,
    method: 'delete'
  })
}

/**
 * 更新评价
 * @param {number} commentId - 评价ID
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export function updateComment(commentId, data) {
  return request({
    url: `/comment/${commentId}`,
    method: 'put',
    data
  })
}

/**
 * 后台管理 - 分页获取评价列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function adminGetCommentPage(params) {
  return request({
    url: '/admin/comments/page',
    method: 'get',
    params
  })
}

/**
 * 后台管理 - 获取评价详情
 * @param {number} id - 评价ID
 * @returns {Promise}
 */
export function adminGetCommentDetail(id) {
  return request({
    url: `/admin/comments/${id}`,
    method: 'get'
  })
}

/**
 * 后台管理 - 更新评价状态
 * @param {number} id - 评价ID
 * @param {number} status - 状态：0-隐藏，1-显示
 * @returns {Promise}
 */
export function adminUpdateCommentStatus(id, status) {
  return request({
    url: `/admin/comments/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 后台管理 - 删除评价
 * @param {number} id - 评价ID
 * @returns {Promise}
 */
export function adminDeleteComment(id) {
  return request({
    url: `/admin/comments/${id}`,
    method: 'delete'
  })
}

/**
 * 后台管理 - 获取评价统计数据
 * @param {number} days - 统计天数
 * @returns {Promise}
 */
export function adminGetCommentStats(days = 7) {
  return request({
    url: '/admin/comments/stats',
    method: 'get',
    params: { days }
  })
}

/**
 * 创建评价回复
 * @param {Object} data - 回复数据
 * @returns {Promise}
 */
export function createCommentReply(data) {
  return request({
    url: '/comment/reply',
    method: 'post',
    data
  })
}

/**
 * 获取评价回复列表
 * @param {number} commentId - 评价ID
 * @returns {Promise}
 */
export function getCommentReplies(commentId) {
  return request({
    url: `/comment/${commentId}/replies`,
    method: 'get'
  })
}

/**
 * 删除评价回复
 * @param {number} replyId - 回复ID
 * @returns {Promise}
 */
export function deleteCommentReply(replyId) {
  return request({
    url: `/comment/reply/${replyId}`,
    method: 'delete'
  })
}

/**
 * 更新评价回复
 * @param {number} replyId - 回复ID
 * @param {Object} data - 回复数据
 * @returns {Promise}
 */
export function updateCommentReply(replyId, data) {
  return request({
    url: `/comment/reply/${replyId}`,
    method: 'put',
    data
  })
}

/**
 * 获取用户评价的回复列表
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserCommentReplies(userId) {
  return request({
    url: `/comment/user/${userId}/replies`,
    method: 'get'
  })
}

/**
 * 创建商品评价（带标签）
 * @param {Object} data - 评价数据（包含标签）
 * @returns {Promise}
 */
export function createCommentWithTags(data) {
  return request({
    url: '/comment/create/with-tags',
    method: 'post',
    data
  })
}

/**
 * 获取评价的标签
 * @param {number} commentId - 评价ID
 * @returns {Promise}
 */
export function getCommentTags(commentId) {
  return request({
    url: `/comment/${commentId}/tags`,
    method: 'get'
  })
}

/**
 * 为评价添加标签
 * @param {number} commentId - 评价ID
 * @param {Array<number>} tagIds - 标签ID列表
 * @returns {Promise}
 */
export function addCommentTags(commentId, tagIds) {
  return request({
    url: `/comment/${commentId}/tags`,
    method: 'post',
    data: tagIds
  })
}

/**
 * 更新评价标签
 * @param {number} commentId - 评价ID
 * @param {Array<number>} tagIds - 标签ID列表
 * @returns {Promise}
 */
export function updateCommentTags(commentId, tagIds) {
  return request({
    url: `/comment/${commentId}/tags`,
    method: 'put',
    data: tagIds
  })
}

/**
 * 删除评价标签
 * @param {number} commentId - 评价ID
 * @param {number} tagId - 标签ID
 * @returns {Promise}
 */
export function removeCommentTag(commentId, tagId) {
  return request({
    url: `/comment/${commentId}/tags/${tagId}`,
    method: 'delete'
  })
}

/**
 * 删除评价的所有标签
 * @param {number} commentId - 评价ID
 * @returns {Promise}
 */
export function removeAllCommentTags(commentId) {
  return request({
    url: `/comment/${commentId}/tags`,
    method: 'delete'
  })
}

/**
 * 获取热门标签列表
 * @param {number} limit - 限制数量
 * @returns {Promise}
 */
export function getHotTags(limit = 10) {
  return request({
    url: '/comment/tags/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 根据商品分类获取标签列表
 * @param {number} categoryId - 分类ID
 * @returns {Promise}
 */
export function getTagsByCategory(categoryId) {
  return request({
    url: `/comment/tags/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 搜索标签
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 限制数量
 * @returns {Promise}
 */
export function searchTags(keyword, limit = 10) {
  return request({
    url: '/comment/tags/search',
    method: 'get',
    params: { keyword, limit }
  })
}

/**
 * 获取评价推荐标签
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getRecommendedTags(params) {
  return request({
    url: '/comment/tags/recommended',
    method: 'get',
    params
  })
}

/**
 * 根据标签筛选用户评价
 * @param {number} userId - 用户ID
 * @param {number} tagId - 标签ID
 * @param {number} page - 页码
 * @param {number} size - 每页数量
 * @param {string} sort - 排序字段
 * @param {string} order - 排序方式(asc/desc)
 * @returns {Promise}
 */
export function getUserCommentsByTag(userId, tagId, page = 1, size = 10, sort = 'createTime', order = 'desc') {
  return request({
    url: `/comment/user/${userId}/tag/${tagId}`,
    method: 'get',
    params: { page, size, sort, order }
  })
}

/**
 * 获取系统预设评价模板
 * @param {Object} params - 查询参数
 * @param {number} [params.rating] - 评分
 * @param {number} [params.categoryId] - 商品分类ID
 * @returns {Promise}
 */
export function getSystemTemplates(params) {
  return request({
    url: '/comment/templates/system',
    method: 'get',
    params
  })
}

/**
 * 获取用户自定义评价模板
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserTemplates(userId) {
  return request({
    url: `/comment/templates/user/${userId}`,
    method: 'get'
  })
}

/**
 * 创建用户自定义评价模板
 * @param {Object} data - 模板数据
 * @returns {Promise}
 */
export function createUserTemplate(data) {
  return request({
    url: '/comment/templates',
    method: 'post',
    data
  })
}

/**
 * 更新评价模板
 * @param {number} templateId - 模板ID
 * @param {Object} data - 模板数据
 * @returns {Promise}
 */
export function updateTemplate(templateId, data) {
  return request({
    url: `/comment/templates/${templateId}`,
    method: 'put',
    data
  })
}

/**
 * 删除评价模板
 * @param {number} templateId - 模板ID
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function deleteTemplate(templateId, userId) {
  return request({
    url: `/comment/templates/${templateId}`,
    method: 'delete',
    params: { userId }
  })
}

/**
 * 增加模板使用次数
 * @param {number} templateId - 模板ID
 * @returns {Promise}
 */
export function incrementTemplateUseCount(templateId) {
  return request({
    url: `/comment/templates/${templateId}/use`,
    method: 'post'
  })
}

/**
 * 获取评价奖励配置
 * @returns {Promise}
 */
export function getRewardConfig() {
  return request({
    url: '/comment/reward/config',
    method: 'get'
  })
}

/**
 * 计算评价可获得的奖励
 * @param {Object} data - 评价数据
 * @returns {Promise}
 */
export function calculateReward(data) {
  return request({
    url: '/comment/reward/calculate',
    method: 'post',
    data
  })
}

/**
 * 获取未评价订单列表
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUnratedOrders(userId) {
  return request({
    url: `/comment/user/${userId}/unrated`,
    method: 'get'
  })
}

/**
 * 获取用户评价统计数据
 * @param {number} userId - 用户ID
 * @returns {Promise}
 */
export function getUserCommentStats(userId) {
  return request({
    url: `/comment/user/${userId}/stats`,
    method: 'get'
  })
}

/**
 * 获取用户评价趋势数据
 * @param {number} userId - 用户ID
 * @param {number} [days=30] - 天数
 * @returns {Promise}
 */
export function getUserCommentTrend(userId, days = 30) {
  return request({
    url: `/comment/user/${userId}/trend`,
    method: 'get',
    params: { days }
  })
}

/**
 * 获取评价关键词
 * @param {Object} params - 查询参数
 * @param {number} [params.productId] - 商品ID
 * @param {number} [params.minRating] - 最低评分
 * @param {number} [params.maxRating] - 最高评分
 * @param {number} [params.limit=20] - 关键词数量
 * @returns {Promise}
 */
export function getCommentKeywords(params) {
  return request({
    url: '/comment/keywords',
    method: 'get',
    params
  })
}

/**
 * 获取评价情感分析数据
 * @param {Object} params - 查询参数
 * @param {number} [params.productId] - 商品ID
 * @param {number} [params.days=30] - 天数
 * @returns {Promise}
 */
export function getCommentSentimentAnalysis(params) {
  return request({
    url: '/comment/sentiment-analysis',
    method: 'get',
    params
  })
} 