/**
 * 图片URL处理工具
 * 提供不同类型图片的URL处理函数
 */
import { getImageUrl as getBaseImageUrl } from './imageUtils';

/**
 * 获取轮播图URL
 * @param {string} fileName - 文件名
 * @returns {string} 轮播图URL
 */
export function getCarouselImageUrl(fileName) {
  if (!fileName) {
    return '/products/banner1.jpg';
  }
  
  // 确保轮播图在carousel目录下
  const carouselPath = fileName.includes('carousel/') ? fileName : `carousel/${fileName}`;
  return `/products/${carouselPath}`;
}

/**
 * 获取商品图片URL
 * @param {string} fileName - 文件名
 * @returns {string} 商品图片URL
 */
export function getGoodsImageUrl(fileName) {
  if (!fileName) {
    return '/products/goods1.jpg';
  }
  
  // 如果是完整URL，直接返回
  if (fileName.startsWith('http')) {
    return fileName;
  }
  
  // 确保商品图片在正确的路径
  return `/products/${fileName}`;
}

/**
 * 获取品牌图片URL
 * @param {string} fileName - 文件名
 * @returns {string} 品牌图片URL
 */
export function getBrandImageUrl(fileName) {
  if (!fileName) {
    return '/brands/default-brand.png';
  }
  
  // 确保品牌图片在brands目录下
  return `/brands/${fileName}`;
}

/**
 * 获取分类图标URL
 * @param {string} fileName - 文件名
 * @returns {string} 分类图标URL
 */
export function getCategoryIconUrl(fileName) {
  if (!fileName) {
    return '/categorys/default-icon.png';
  }
  
  // 确保分类图标在categorys目录下
  return `/categorys/${fileName}`;
}

/**
 * 通用图片URL处理
 * @param {string} path - 图片路径
 * @param {string} type - 图片类型，可选值: 'carousel', 'goods', 'brand', 'category'
 * @returns {string} 处理后的图片URL
 */
export function getImageUrl(path, type = 'goods') {
  if (!path) {
    return getDefaultImage(type);
  }
  
  switch (type) {
    case 'carousel':
      return getCarouselImageUrl(path);
    case 'brand':
      return getBrandImageUrl(path);
    case 'category':
      return getCategoryIconUrl(path);
    case 'goods':
    default:
      return getGoodsImageUrl(path);
  }
}

/**
 * 获取默认图片
 * @param {string} type - 图片类型
 * @returns {string} 默认图片URL
 */
function getDefaultImage(type) {
  switch (type) {
    case 'carousel':
      return '/products/banner1.jpg';
    case 'brand':
      return '/brands/default-brand.png';
    case 'category':
      return '/categorys/default-icon.png';
    case 'goods':
    default:
      return '/products/goods1.jpg';
  }
}

export default {
  getCarouselImageUrl,
  getGoodsImageUrl,
  getBrandImageUrl,
  getCategoryIconUrl,
  getImageUrl
}; 