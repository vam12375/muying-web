import request from '@/utils/request';

/**
 * 管理员登录
 * @param {Object} data - 登录信息
 * @returns {Promise}
 */
export function adminLogin(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}

/**
 * 获取管理员信息
 * @returns {Promise}
 */
export function getAdminInfo() {
  return request({
    url: '/admin/info',
    method: 'get'
  });
}

/**
 * 管理员退出登录
 * @returns {Promise}
 */
export function adminLogout() {
  return request({
    url: '/admin/logout',
    method: 'post'
  });
}

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  });
}

/**
 * 添加用户
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function addUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  });
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUser(data) {
  return request({
    url: `/admin/users/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 更新用户状态
 * @param {Object} data - 状态信息
 * @returns {Promise}
 */
export function updateUserStatus(data) {
  return request({
    url: `/admin/users/${data.id}/status`,
    method: 'put',
    data: { status: data.status }
  });
}

/**
 * 删除用户
 * @param {number} id - 用户ID
 * @returns {Promise}
 */
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  });
}

/**
 * 获取育儿知识列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getParentingTipsList(params) {
  return request({
    url: '/admin/parenting-tips',
    method: 'get',
    params
  });
}

/**
 * 添加育儿知识
 * @param {Object} data - 育儿知识信息
 * @returns {Promise}
 */
export function addParentingTip(data) {
  return request({
    url: '/admin/parenting-tips',
    method: 'post',
    data
  });
}

/**
 * 更新育儿知识
 * @param {Object} data - 育儿知识信息
 * @returns {Promise}
 */
export function updateParentingTip(data) {
  return request({
    url: `/admin/parenting-tips/${data.id}`,
    method: 'put',
    data
  });
}

/**
 * 更新育儿知识状态
 * @param {Object} data - 状态信息
 * @returns {Promise}
 */
export function updateParentingTipStatus(data) {
  return request({
    url: `/admin/parenting-tips/${data.id}/status`,
    method: 'put',
    data: { status: data.status }
  });
}

/**
 * 删除育儿知识
 * @param {number} id - 育儿知识ID
 * @returns {Promise}
 */
export function deleteParentingTip(id) {
  return request({
    url: `/admin/parenting-tips/${id}`,
    method: 'delete'
  });
} 