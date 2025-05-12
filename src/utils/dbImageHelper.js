/**
 * 数据库图片路径处理工具类
 * 用于在数据库修改图片路径后，前后端都能正常加载图片
 */
import { getCarouselImageUrl, getGoodsImageUrl, getBrandImageUrl, getCategoryIconUrl } from './image';

/**
 * 处理数据库中的轮播图路径
 * @param {string} dbPath - 数据库中存储的路径
 * @returns {string} 处理后的图片URL
 */
export function processDbCarouselImage(dbPath) {
  if (!dbPath) {
    // 如果为空，返回默认图片
    return getCarouselImageUrl('banner1.jpg');
  }
  
  try {
    // 提取文件名
    let fileName = dbPath;
    
    // 如果路径包含/或\，提取最后一部分作为文件名
    if (dbPath.includes('/') || dbPath.includes('\\')) {
      const parts = dbPath.split(/[/\\]/);
      fileName = parts[parts.length - 1];
    }
    
    // 清除可能的查询参数
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // 清除可能的锚点
    if (fileName.includes('#')) {
      fileName = fileName.split('#')[0];
    }
    
    return getCarouselImageUrl(fileName);
  } catch (error) {
    console.error('处理数据库轮播图路径失败:', error);
    return getCarouselImageUrl('banner1.jpg');
  }
}

/**
 * 判断数据库中图片路径是否已经包含文件扩展名
 * @param {string} path - 图片路径
 * @returns {boolean} 是否包含扩展名
 */
export function hasFileExtension(path) {
  if (!path) return false;
  
  // 获取文件名
  const fileName = path.split(/[/\\]/).pop();
  
  // 检查是否包含扩展名
  return /\.[a-zA-Z0-9]{2,4}$/.test(fileName);
}

/**
 * 为数据库中没有扩展名的轮播图路径添加默认扩展名
 * @param {string} path - 图片路径
 * @param {string} defaultExt - 默认扩展名(不包含点，例如'jpg')
 * @returns {string} 处理后的路径
 */
export function ensureImageExtension(path, defaultExt = 'jpg') {
  if (!path) return '';
  
  if (hasFileExtension(path)) {
    return path;
  }
  
  return `${path}.${defaultExt}`;
}

/**
 * 处理数据库中的商品图片路径
 * @param {string} dbPath - 数据库中存储的路径 
 * @returns {string} 处理后的图片URL
 */
export function processDbGoodsImage(dbPath) {
  if (!dbPath) {
    // 如果为空，返回默认图片
    return getGoodsImageUrl('goods1.jpg');
  }
  
  try {
    // 如果是完整URL，直接返回
    if (dbPath.startsWith('http')) {
      return dbPath;
    }
    
    // 提取文件名
    let fileName = dbPath;
    
    // 如果路径包含/或\，提取最后一部分作为文件名
    if (dbPath.includes('/') || dbPath.includes('\\')) {
      const parts = dbPath.split(/[/\\]/);
      fileName = parts[parts.length - 1];
    }
    
    // 清除可能的查询参数
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // 清除可能的锚点
    if (fileName.includes('#')) {
      fileName = fileName.split('#')[0];
    }
    
    // 检查是否已经是"goodsXX.jpg"格式
    if (fileName.match(/^goods\d+\.jpg$/i)) {
      console.log('文件已经是正确格式:', fileName);
      return `/products/${fileName}`;
    }
    
    // 从文件名中提取商品ID (如果存在)
    const goodsIdMatch = fileName.match(/(\d+)/);
    if (goodsIdMatch && goodsIdMatch[1]) {
      const goodsId = goodsIdMatch[1];
      console.log('从文件名提取商品ID:', goodsId);
      return `/products/goods${goodsId}.jpg`;
    }
    
    // 添加图片服务器前缀（如果原始路径不是完整URL）
    if (dbPath.startsWith('/')) {
      // 如果是以/开头的绝对路径，直接返回（适用于后端API返回的相对于服务器根目录的路径）
      return dbPath;
    }
    
    // 确保添加了文件扩展名
    if (!hasFileExtension(fileName)) {
      fileName = ensureImageExtension(fileName, 'jpg');
    }
    
    // 使用图片资源路径
    return getGoodsImageUrl(fileName);
  } catch (error) {
    console.error('处理数据库商品图片路径失败:', error, '原路径:', dbPath);
    // 构建一个安全的路径，确保不会出错
    try {
      // 尝试从路径中提取数字作为商品ID
      const numericPart = dbPath.replace(/\D/g, '');
      if (numericPart) {
        return `/products/goods${numericPart}.jpg`;
      }
    } catch (e) {
      console.error('无法提取商品ID:', e);
    }
    
    // 最后的兜底方案
    return `/products/goods1.jpg`;
  }
}

/**
 * 处理数据库中的品牌图片路径
 * @param {string} dbPath - 数据库中存储的路径 
 * @returns {string} 处理后的图片URL
 */
export function processDbBrandImage(dbPath) {
  if (!dbPath) {
    // 如果为空，返回默认图片
    return getBrandImageUrl('default-brand.png');
  }
  
  try {
    // 如果是完整URL，直接返回
    if (dbPath.startsWith('http')) {
      return dbPath;
    }
    
    // 提取文件名
    let fileName = dbPath;
    
    // 如果路径包含/或\，提取最后一部分作为文件名
    if (dbPath.includes('/') || dbPath.includes('\\')) {
      const parts = dbPath.split(/[/\\]/);
      fileName = parts[parts.length - 1];
    }
    
    // 清除可能的查询参数
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // 清除可能的锚点
    if (fileName.includes('#')) {
      fileName = fileName.split('#')[0];
    }
    
    // 确保添加了文件扩展名
    if (!hasFileExtension(fileName)) {
      fileName = ensureImageExtension(fileName, 'png');
    }
    
    // 使用品牌图片资源路径
    return getBrandImageUrl(fileName);
  } catch (error) {
    console.error('处理数据库品牌图片路径失败:', error, '原路径:', dbPath);
    // 返回默认品牌图片
    return getBrandImageUrl('default-brand.png');
  }
}

/**
 * 处理数据库中的分类图标路径
 * @param {string} dbPath - 数据库中存储的路径 
 * @returns {string} 处理后的图片URL
 */
export function processDbCategoryIcon(dbPath) {
  if (!dbPath) {
    // 如果为空，返回默认图标
    return getCategoryIconUrl('default-icon.png');
  }
  
  try {
    // 如果是完整URL，直接返回
    if (dbPath.startsWith('http')) {
      return dbPath;
    }
    
    // 提取文件名
    let fileName = dbPath;
    
    // 如果路径包含/或\，提取最后一部分作为文件名
    if (dbPath.includes('/') || dbPath.includes('\\')) {
      const parts = dbPath.split(/[/\\]/);
      fileName = parts[parts.length - 1];
    }
    
    // 清除可能的查询参数
    if (fileName.includes('?')) {
      fileName = fileName.split('?')[0];
    }
    
    // 清除可能的锚点
    if (fileName.includes('#')) {
      fileName = fileName.split('#')[0];
    }
    
    // 确保添加了文件扩展名
    if (!hasFileExtension(fileName)) {
      fileName = ensureImageExtension(fileName, 'png');
    }
    
    // 使用分类图标资源路径
    return getCategoryIconUrl(fileName);
  } catch (error) {
    console.error('处理数据库分类图标路径失败:', error, '原路径:', dbPath);
    // 返回默认分类图标
    return getCategoryIconUrl('default-icon.png');
  }
}

/**
 * 处理后端返回的图片URL
 * @param {Object|string} picture - 图片对象或图片URL字符串
 * @returns {string} 处理后的图片URL
 */
export function processPictureUrl(picture) {
  if (!picture) return getGoodsImageUrl('goods1.jpg');
  
  // 如果传入的是字符串，直接当作URL处理
  if (typeof picture === 'string') {
    const url = picture;
    
    // 如果是完整URL，直接返回
    if (url.startsWith('http')) return url;
    
    // 处理相对路径
    return processDbGoodsImage(url);
  }
  
  // 如果是对象，获取图片URL
  const url = picture.pictureUrl;
  
  if (!url) return getGoodsImageUrl('goods1.jpg');
  
  // 如果是完整URL，直接返回
  if (url.startsWith('http')) return url;
  
  // 处理相对路径
  return processDbGoodsImage(url);
}

export default {
  processDbCarouselImage,
  processDbGoodsImage,
  processDbBrandImage,
  processDbCategoryIcon,
  hasFileExtension,
  ensureImageExtension,
  processPictureUrl
}; 