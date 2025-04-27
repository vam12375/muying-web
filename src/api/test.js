import request from '@/utils/request';

/**
 * 测试后端连接
 * @returns {Promise}
 */
export function testConnection() {
  return request({
    url: '/test/connection',
    method: 'get'
  });
}

/**
 * 测试认证状态
 * @returns {Promise}
 */
export function testAuth() {
  return request({
    url: '/test/auth',
    method: 'get'
  });
}

/**
 * 测试JWT生成
 * @returns {Promise}
 */
export function testJwtDemo() {
  return request({
    url: '/test/jwt-demo',
    method: 'get'
  });
} 