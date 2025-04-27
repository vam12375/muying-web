import request from '@/utils/request';

/**
 * 获取用户积分信息
 * @returns {Promise} 返回积分信息
 */
export function getUserPoints() {
  return request({
    url: '/points/info',
    method: 'get'
  });
}

/**
 * 获取积分记录列表
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页条数
 * @param {string} params.type 记录类型：earn(获得)、use(使用)
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期
 * @returns {Promise} 返回积分记录列表
 */
export function getPointsRecords(params) {
  return request({
    url: '/points/records',
    method: 'get',
    params
  });
}

/**
 * 每日签到
 * @returns {Promise} 返回签到结果
 */
export function signIn() {
  return request({
    url: '/points/sign-in',
    method: 'post'
  });
}

/**
 * 检查今日是否已签到
 * @returns {Promise} 返回签到状态
 */
export function checkSignIn() {
  return request({
    url: '/points/check-sign-in',
    method: 'get'
  });
}

/**
 * 获取积分商城商品列表
 * @returns {Promise} 返回商品列表
 */
export function getPointsProducts() {
  return request({
    url: '/points/products',
    method: 'get'
  });
}

/**
 * 积分兑换商品
 * @param {Object} data 兑换信息
 * @param {number} data.productId 商品ID
 * @param {number} data.quantity 兑换数量
 * @param {number} data.addressId 收货地址ID（实物商品必填）
 * @param {string} data.phone 手机号码（虚拟商品可能需要）
 * @param {string} data.remark 备注信息
 * @returns {Promise} 返回兑换结果
 */
export function exchangeProduct(data) {
  return request({
    url: '/points/exchange',
    method: 'post',
    data
  });
}

/**
 * 获取用户收货地址列表
 * @returns {Promise} 返回地址列表
 */
export function getUserAddresses() {
  return request({
    url: '/user/addresses',
    method: 'get'
  });
}

/**
 * 积分转赠
 * @param {Object} data 转赠信息
 * @param {string} data.targetUser 目标用户（手机号或用户名）
 * @param {number} data.points 转赠积分数
 * @param {string} data.message 留言
 * @returns {Promise} 返回转赠结果
 */
export function transferPoints(data) {
  return request({
    url: '/points/transfer',
    method: 'post',
    data
  });
}

/**
 * 检查积分是否足够
 * @param {number} points 所需积分
 * @returns {Promise} 返回检查结果
 */
export function checkPointsAvailable(points) {
  return request({
    url: '/points/check-available',
    method: 'get',
    params: { points }
  });
}

/**
 * 获取签到日历
 * @param {string} month YYYY-MM格式的月份
 * @returns {Promise} 返回签到日历数据
 */
export function getSignInCalendar(month) {
  return request({
    url: '/points/sign-in-calendar',
    method: 'get',
    params: { month }
  });
}

/**
 * 获取积分礼品列表
 * @returns {Promise} 返回礼品列表
 */
export function getGiftList() {
  return request({
    url: '/points/gifts',
    method: 'get'
  });
}

/**
 * 兑换积分礼品
 * @param {number} giftId - 礼品ID 
 * @returns {Promise} 返回兑换结果
 */
export function exchangePointsGift(giftId) {
  return request({
    url: `/points/exchange-gift/${giftId}`,
    method: 'post'
  });
}

/**
 * 获取用户的签到状态
 * @returns {Promise} 返回签到状态
 */
export function getUserSignInStatus() {
  return request({
    url: '/points/sign-in-status',
    method: 'get'
  });
}

/**
 * 用户签到
 * @returns {Promise} 返回签到结果
 */
export function userSignIn() {
  return request({
    url: '/points/sign-in',
    method: 'post'
  });
}

/**
 * 获取积分规则
 * @returns {Promise} 返回积分规则
 */
export function getPointsRules() {
  return request({
    url: '/points/rules',
    method: 'get'
  });
} 