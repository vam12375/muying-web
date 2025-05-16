import request from '@/utils/request';

/**
 * 获取用户消息列表
 * @param {Object} params 查询参数 {type, isRead, page, size}
 * @returns {Promise}
 */
export function getUserMessages(params) {
  return request({
    url: '/user/message/list',
    method: 'get',
    params
  });
}

/**
 * 获取未读消息数量
 * @returns {Promise}
 */
export function getUnreadCount() {
  return request({
    url: '/user/message/unread/count',
    method: 'get'
  });
}

/**
 * 获取各类型未读消息数量
 * @returns {Promise}
 */
export function getUnreadCountByType() {
  return request({
    url: '/user/message/unread/count/type',
    method: 'get'
  });
}

/**
 * 标记消息为已读
 * @param {string} messageId 消息ID
 * @returns {Promise}
 */
export function markMessageRead(messageId) {
  return request({
    url: `/user/message/read/${messageId}`,
    method: 'put'
  });
}

/**
 * 标记所有消息为已读
 * @returns {Promise}
 */
export function markAllAsRead() {
  return request({
    url: '/user/message/read/all',
    method: 'put'
  });
}

/**
 * 标记指定类型的所有消息为已读
 * @param {string} type 消息类型
 * @returns {Promise}
 */
export function markTypeAsRead(type) {
  return request({
    url: `/user/message/read/type/${type}`,
    method: 'put'
  });
}

/**
 * 删除消息
 * @param {string} messageId 消息ID
 * @returns {Promise}
 */
export function deleteMessage(messageId) {
  return request({
    url: `/user/message/${messageId}`,
    method: 'delete'
  });
}

/**
 * 发送催发货提醒
 * @param {Object} data {orderId, message}
 * @returns {Promise}
 */
export function sendShippingReminder(data) {
  return request({
    url: '/user/message/shippingReminder',
    method: 'post',
    params: data
  });
} 