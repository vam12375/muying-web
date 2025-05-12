import request from '@/utils/request';

/**
 * 根据订单ID获取物流信息
 * @param {string} orderId - 订单ID
 * @returns {Promise} 返回物流信息
 */
export function getLogisticsByOrderId(orderId) {
  return request({
    url: `/logistics/order/${orderId}`,
    method: 'get'
  });
}

/**
 * 根据物流单号和物流公司查询物流信息
 * @param {string} trackingNo - 物流单号
 * @param {string} companyCode - 物流公司代码
 * @returns {Promise} 返回物流信息
 */
export function queryLogisticsInfo(trackingNo, companyCode) {
  return request({
    url: '/logistics/query',
    method: 'get',
    params: {
      trackingNo,
      companyCode
    }
  });
}

/**
 * 根据物流ID获取物流轨迹
 * @param {string} logisticsId - 物流ID
 * @returns {Promise} 返回物流轨迹
 */
export function getLogisticsTrackById(logisticsId) {
  return request({
    url: `/logistics/${logisticsId}/tracks`,
    method: 'get'
  });
}

/**
 * 请求催发货
 * @param {string} orderId - 订单ID
 * @param {string} remark - 备注信息
 * @returns {Promise} 返回请求结果
 */
export function requestExpediteShipping(orderId, remark) {
  return request({
    url: `/order/${orderId}/expedite`,
    method: 'post',
    data: { remark }
  });
} 