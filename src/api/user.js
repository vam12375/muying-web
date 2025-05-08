import request from '@/utils/request';

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise}
 */
export function login(username, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: { 
      username, 
      password 
    }
  });
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  });
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  });
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 * @returns {Promise}
 */
export function updateUserInfo(data) {
  console.log('API调用 - 更新用户信息，请求数据:', data);
  return request({
    url: '/user/info',
    method: 'put',
    data
  }).then(response => {
    console.log('API调用 - 更新用户信息，响应数据:', response);
    return response;
  }).catch(error => {
    console.error('API调用 - 更新用户信息失败:', error);
    throw error;
  });
}

/**
 * 修改密码
 * @param {Object} data - 密码信息
 * @returns {Promise}
 */
export function updatePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  });
}

/**
 * 上传用户头像
 * @param {File} file - 头像文件
 * @returns {Promise}
 */
export function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return request({
    url: '/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 退出登录
 * @returns {Promise}
 */
export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  });
}

/**
 * 获取用户收货地址列表
 * @returns {Promise}
 */
export function getUserAddresses() {
  return new Promise((resolve, reject) => {
    request({
      url: '/user/addresses',
      method: 'get'
    }).then(response => {
      resolve(response);
    }).catch(error => {
      console.error('获取地址列表失败:', error);
      
      // 网络错误时使用默认空地址列表
      if (error.message === 'Network Error') {
        console.warn('地址API网络错误，返回默认空地址列表');
        resolve({
          code: 200,
          message: '操作成功',
          success: true,
          data: []  // 空数组表示没有地址
        });
      } else {
        reject(error);
      }
    });
  });
}

/**
 * 添加用户收货地址
 * @param {Object} data - 地址信息
 * @returns {Promise}
 */
export function addUserAddress(data) {
  return request({
    url: '/user/addresses',
    method: 'post',
    data
  });
}

/**
 * 更新用户收货地址
 * @param {number|string} addressId - 地址ID
 * @param {Object} data - 地址信息
 * @returns {Promise}
 */
export function updateUserAddress(addressId, data) {
  return request({
    url: `/user/addresses/${addressId}`,
    method: 'put',
    data
  });
}

/**
 * 删除用户收货地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise}
 */
export function deleteUserAddress(addressId) {
  return request({
    url: `/user/addresses/${addressId}`,
    method: 'delete'
  });
}

/**
 * 设置默认地址
 * @param {number|string} addressId - 地址ID
 * @returns {Promise}
 */
export function setDefaultUserAddress(addressId) {
  return request({
    url: `/user/addresses/${addressId}/default`,
    method: 'put'
  });
}

/**
 * 获取用户优惠券
 * @param {Object} params - 查询参数
 * @param {string} params.status - 状态：unused-未使用，used-已使用，expired-已过期
 * @returns {Promise}
 */
export function getUserCoupons(params) {
  return request({
    url: '/user/coupons',
    method: 'get',
    params
  });
}

/**
 * 获取可领取的优惠券列表
 * @returns {Promise}
 */
export function getAvailableCoupons() {
  return request({
    url: '/coupons/available',
    method: 'get'
  });
}

/**
 * 领取优惠券
 * @param {number|string} couponId - 优惠券ID
 * @returns {Promise}
 */
export function receiveCoupon(couponId) {
  return request({
    url: `/coupons/${couponId}/receive`,
    method: 'post'
  });
}

/**
 * 获取收藏列表
 * @param {Object} params - 查询参数 
 * @returns {Promise}
 */
export function getFavorites(params) {
  return request({
    url: '/user/favorites',
    method: 'get',
    params
  });
}

/**
 * 添加收藏
 * @param {number|string} productId - 商品ID
 * @returns {Promise}
 */
export function addFavorite(productId) {
  return request({
    url: '/user/favorites',
    method: 'post',
    params: { productId }
  });
}

/**
 * 移除收藏
 * @param {number|string} favoriteId - 收藏ID
 * @returns {Promise}
 */
export function removeFavorite(favoriteId) {
  return request({
    url: `/user/favorites/${favoriteId}`,
    method: 'delete'
  });
}

/**
 * 清空收藏夹
 * @returns {Promise}
 */
export function clearFavorites() {
  return request({
    url: '/user/favorites/clear',
    method: 'delete'
  });
}

/**
 * 同步会话
 * 从JWT提取用户信息并同步到后端HttpSession
 * @returns {Promise}
 */
export function syncSession() {
  return request({
    url: '/session/sync',
    method: 'post'
  });
} 