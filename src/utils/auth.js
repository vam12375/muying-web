/**
 * 认证工具类
 * 统一管理token和用户信息的存储与获取
 */

// Token的存储键名
const TOKEN_KEY = 'muying_token';
const OLD_TOKEN_KEY = 'token'; // 旧的token键名，用于向后兼容
const ADMIN_TOKEN_KEY = 'adminToken';
const USER_ID_KEY = 'userId';
const USER_NAME_KEY = 'username';
const USER_AVATAR_KEY = 'userAvatar';

/**
 * 从JWT token中提取信息
 * @param {string} token JWT token
 * @returns {Object|null} 解析后的token数据
 */
function parseJwt(token) {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    // 处理"Bearer "前缀
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
    
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('解析token失败:', e);
    return null;
  }
}

/**
 * 从token中提取用户ID
 * @returns {string|null} 用户ID
 */
function extractUserIdFromToken() {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  const parsed = parseJwt(token);
  // 尝试从不同的字段中获取用户ID
  if (parsed) {
    // JWT中可能包含的用户ID字段
    const possibleFields = ['userId', 'user_id', 'sub', 'id', 'uid'];
    for (const field of possibleFields) {
      if (parsed[field]) {
        console.log(`从token中提取到用户ID: ${parsed[field]}, 字段: ${field}`);
        return parsed[field].toString();
      }
    }
  }
  
  return null;
}

/**
 * 确保用户ID存在，如果不存在则尝试从token中提取
 */
export function ensureUserId() {
  const userId = localStorage.getItem(USER_ID_KEY);
  // 如果用户ID不存在，但token存在，尝试从token中提取
  if (!userId && getToken()) {
    const extractedId = extractUserIdFromToken();
    if (extractedId) {
      localStorage.setItem(USER_ID_KEY, extractedId);
      console.log('已从token中恢复用户ID:', extractedId);
      return extractedId;
    } else {
      // 如果无法从token中提取ID，设置一个默认ID
      // 注意：这是一个临时解决方案
      localStorage.setItem(USER_ID_KEY, '1');
      console.log('已设置默认用户ID: 1');
      return '1';
    }
  }
  return userId;
}

/**
 * 设置用户token
 * @param {string} token 用户token
 * @param {boolean} withBearer 是否自动添加Bearer前缀
 */
export function setToken(token, withBearer = true) {
  if (!token) {
    console.error('auth.js setToken: 尝试存储空token');
    return;
  }
  
  console.log('auth.js setToken: 存储token');
  
  // 确保token格式统一，添加Bearer前缀
  const formattedToken = withBearer && !token.startsWith('Bearer ') 
    ? `Bearer ${token}` 
    : token;
  
  // 存储到新的键名
  localStorage.setItem(TOKEN_KEY, formattedToken);
  
  // 同时移除旧的token键名
  localStorage.removeItem(OLD_TOKEN_KEY);
  
  // 尝试从token中提取用户ID并保存
  const userId = extractUserIdFromToken();
  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('从token中提取并保存了用户ID:', userId);
  }
}

/**
 * 获取用户token
 * @returns {string} 用户token
 */
export function getToken() {
  // 首先尝试从新的键名获取token
  let token = localStorage.getItem(TOKEN_KEY);
  
  // 如果新键名没有token，尝试从旧键名获取
  if (!token) {
    token = localStorage.getItem(OLD_TOKEN_KEY);
    
    // 如果从旧键名获取到了token，迁移到新键名
    if (token) {
      console.log('auth.js getToken: 从旧键名获取到token，正在迁移到新键名');
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(OLD_TOKEN_KEY);
    }
  }
  
  console.log('auth.js getToken:', token ? '获取到token' : '未获取到token');
  return token;
}

/**
 * 移除用户token
 * @returns {void}
 */
export function removeToken() {
  console.log('auth.js removeToken: 移除token');
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(OLD_TOKEN_KEY); // 同时移除旧键名
}

/**
 * 检查 token 是否存在
 * @returns {boolean} 是否存在 token
 */
export function hasToken() {
  const token = getToken();
  const exists = !!token;
  console.log('auth.js hasToken:', exists ? 'token存在' : 'token不存在');
  return exists;
}

/**
 * 设置管理员token
 * @param {string} token 管理员token
 * @param {boolean} withBearer 是否自动添加Bearer前缀
 */
export function setAdminToken(token, withBearer = true) {
  if (!token) return;
  
  // 确保token格式统一，添加Bearer前缀
  const formattedToken = withBearer && !token.startsWith('Bearer ') 
    ? `Bearer ${token}` 
    : token;
  
  localStorage.setItem(ADMIN_TOKEN_KEY, formattedToken);
}

/**
 * 获取管理员token
 * @returns {string} 管理员token
 */
export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * 设置用户基本信息
 * @param {Object} userInfo 用户信息对象
 */
export function setUserInfo(userInfo) {
  if (!userInfo) return;
  
  // 统一字段名称，处理后端可能返回的不同字段名
  const userId = userInfo.userId || userInfo.user_id || userInfo.id;
  const userName = userInfo.userName || userInfo.user_name || userInfo.username;
  const userAvatar = userInfo.userAvatar || userInfo.user_avatar || userInfo.avatar || userInfo.userHead;
  
  if (userId) localStorage.setItem(USER_ID_KEY, userId);
  if (userName) localStorage.setItem(USER_NAME_KEY, userName);
  if (userAvatar) localStorage.setItem(USER_AVATAR_KEY, userAvatar);
}

/**
 * 获取用户基本信息
 * @returns {Object} 用户基本信息
 */
export function getUserInfo() {
  return {
    userId: localStorage.getItem(USER_ID_KEY),
    userName: localStorage.getItem(USER_NAME_KEY),
    userAvatar: localStorage.getItem(USER_AVATAR_KEY)
  };
}

/**
 * 清除所有认证信息
 * @param {boolean} isAdmin 是否清除管理员信息
 */
export function clearAuth(isAdmin = false) {
  // 清除用户认证信息
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  localStorage.removeItem(USER_AVATAR_KEY);
  
  // 如果是管理员，同时清除管理员token
  if (isAdmin) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

/**
 * 判断用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAuthenticated() {
  const token = getToken();
  
  if (!token) {
    console.log('auth.js isAuthenticated: 无token，未登录');
    return false;
  }
  
  // 检查token是否有效格式
  if (token.startsWith('Bearer ')) {
    // 进一步验证token是否为有效JWT格式
    const tokenWithoutBearer = token.substring(7);
    const parts = tokenWithoutBearer.split('.');
    
    // JWT应该有3个部分，用.分隔
    if (parts.length !== 3) {
      console.warn('auth.js isAuthenticated: token格式无效，未登录');
      return false;
    }
    
    // 尝试解析token
    const parsed = parseJwt(token);
    if (!parsed) {
      console.warn('auth.js isAuthenticated: token无法解析，未登录');
      return false;
    }
    
    // 检查token是否过期
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      console.warn('auth.js isAuthenticated: token已过期，未登录');
      return false;
    }
    
    console.log('auth.js isAuthenticated: token有效，已登录');
    return true;
  }
  
  // 如果token不是Bearer格式，可能是旧格式或无效格式
  console.warn('auth.js isAuthenticated: token格式不正确，未登录');
  return false;
}

/**
 * 判断管理员是否已登录
 * @returns {boolean} 是否已登录
 */
export function isAdminAuthenticated() {
  return !!getAdminToken();
}

export default {
  setToken,
  getToken,
  removeToken,
  setAdminToken,
  getAdminToken,
  setUserInfo,
  getUserInfo,
  clearAuth,
  isAuthenticated,
  isAdminAuthenticated
}; 