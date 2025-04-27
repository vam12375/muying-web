import request from '@/utils/request';

/**
 * 获取消息列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getMessages(params) {
  return request({
    url: '/admin/message/list',
    method: 'get',
    params
  });
}

/**
 * 标记消息为已读
 * @param {number} id 消息ID
 * @returns {Promise}
 */
export function markMessageRead(id) {
  return request({
    url: '/admin/message/read',
    method: 'put',
    data: { id }
  });
}

/**
 * 标记所有消息为已读
 * @returns {Promise}
 */
export function markAllRead() {
  return request({
    url: '/admin/message/readAll',
    method: 'put'
  });
}

/**
 * 删除消息
 * @param {number} id 消息ID
 * @returns {Promise}
 */
export function deleteMessage(id) {
  return request({
    url: `/admin/message/${id}`,
    method: 'delete'
  });
}

/**
 * 获取未读消息数量
 * @returns {Promise}
 */
export function getUnreadCount() {
  return request({
    url: '/admin/message/unreadCount',
    method: 'get'
  });
} 