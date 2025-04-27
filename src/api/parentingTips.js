import request from '@/utils/request';

/**
 * 获取育儿知识列表
 * @param {Object} params - 查询参数 
 * @returns {Promise}
 */
export function getParentingTipsList(params) {
  return request({
    url: '/parenting-tips',
    method: 'get',
    params
  });
}

/**
 * 获取育儿知识详情
 * @param {number|string} id - 育儿知识ID
 * @returns {Promise}
 */
export function getParentingTipDetail(id) {
  return request({
    url: `/parenting-tips/${id}`,
    method: 'get'
  });
}

/**
 * 获取育儿知识分类
 * @returns {Promise}
 */
export function getParentingTipCategories() {
  return request({
    url: '/parenting-tips/categories',
    method: 'get'
  });
}

/**
 * 增加育儿知识浏览量
 * @param {number|string} id - 育儿知识ID
 * @returns {Promise}
 */
export function increaseViewCount(id) {
  return request({
    url: `/parenting-tips/${id}/view`,
    method: 'post'
  });
}

/**
 * 获取育儿知识评论
 * @param {number|string} id - 育儿知识ID
 * @param {Object} params - 分页参数
 * @returns {Promise}
 */
export function getParentingTipComments(id, params) {
  return request({
    url: `/parenting-tips/${id}/comments`,
    method: 'get',
    params
  });
}

/**
 * 提交育儿知识评论
 * @param {number|string} id - 育儿知识ID
 * @param {Object} data - 评论数据
 * @returns {Promise}
 */
export function addParentingTipComment(id, data) {
  return request({
    url: `/parenting-tips/${id}/comments`,
    method: 'post',
    data
  });
} 