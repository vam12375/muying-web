/**
 * 图片工具函数
 */

/**
 * 获取产品图片的完整URL，支持多种图片格式
 * @param {string} imagePath 图片路径
 * @param {string} defaultImage 默认图片路径
 * @returns {string} 图片URL
 */
export function getImageUrl(imagePath, defaultImage) {
  // 检查图片路径是否为undefined、null或空字符串
  if (!imagePath || imagePath === 'undefined' || imagePath === 'null') {
    console.log('图片路径无效，使用默认图片');
    return defaultImage || getDefaultImagePath();
  }
  
  // 修复错误的URL路径
  if (imagePath.includes('/undefined') || imagePath.includes('/null')) {
    console.warn('检测到无效的图片URL路径:', imagePath);
    return defaultImage || getDefaultImagePath();
  }
  
  try {
    // 如果是完整URL（以http开头）
    if (imagePath.startsWith('http')) {
      // 如果URL包含"http://localhost:5173/src/utils/"或其他明显错误的路径，返回默认图片
      if (imagePath.includes('/src/utils/') || imagePath.includes('/undefined') || imagePath.includes('/null')) {
        console.warn('检测到错误的图片URL:', imagePath);
        return defaultImage || getDefaultImagePath();
      }
      return imagePath;
    }
    
    // 处理相对路径
    // 移除路径中可能的前导斜杠
    let path = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // 确保products/目录结构
    if (!path.includes('/')) {
      // 如果是单个文件名，添加products/前缀
      path = `products/${path}`;
    } else if (!path.startsWith('products/') && !path.includes('/products/')) {
      // 如果路径不包含products目录，添加前缀
      path = `products/${path}`;
    }
    
    // 提取不含扩展名的基本路径
    const lastDotIndex = path.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      // 分离路径和扩展名
      const basePath = path.substring(0, lastDotIndex);
      const extension = path.substring(lastDotIndex).toLowerCase();
      
      // 检查是否为图片扩展名
      if (['.jpg', '.jpeg', '.png', '.gif'].includes(extension)) {
        // 优先使用webp格式
        path = `${basePath}.webp`;
        // 添加原始格式作为备用
        console.log('优先使用WebP格式:', path);
      }
    }
    
    // 直接使用相对路径
    console.log('构建图片URL, 处理后路径:', path);
    const baseUrl = '/src/assets/img/';
    const imageUrl = `${baseUrl}${path}`;
    console.log('构建后的完整URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('图片URL处理错误:', error, '原始路径:', imagePath);
    return defaultImage || getDefaultImagePath();
  }
}

/**
 * 获取默认图片路径
 * @returns {string} 默认图片URL
 */
function getDefaultImagePath() {
  return '/src/assets/img/product-thumbnail-placeholder.svg';
}

/**
 * 处理图片加载错误，尝试不同的图片格式
 * @param {Event} event 事件对象
 * @param {string} defaultImage 默认图片路径
 */
export function handleImageError(event, defaultImage) {
  const imgSrc = event.target.src;
  
  try {
    const imgUrl = new URL(imgSrc);
    const pathName = imgUrl.pathname;
    
    // 提取不含扩展名的基本路径
    const lastDotIndex = pathName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      // 如果没有扩展名，直接使用默认占位图
      console.log('图片路径没有扩展名，使用占位图');
      event.target.src = defaultImage || getDefaultImagePath();
      return;
    }
    
    const basePath = pathName.substring(0, lastDotIndex);
    const currentExt = pathName.substring(lastDotIndex);
    
    // 支持的图片格式数组（按优先级排序）
    const supportedFormats = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];
    
    // 找到当前格式在数组中的索引
    const currentIndex = supportedFormats.indexOf(currentExt.toLowerCase());
    
    // 如果当前格式在数组中且不是最后一个格式，尝试下一个格式
    if (currentIndex !== -1 && currentIndex < supportedFormats.length - 1) {
      const nextFormat = supportedFormats[currentIndex + 1];
      const newSrc = `${imgUrl.origin}${basePath}${nextFormat}`;
      console.log(`尝试加载其他格式: ${newSrc}`);
      event.target.src = newSrc;
      return;
    }
  } catch (error) {
    console.error('处理图片错误失败', error);
  }
  
  // 如果所有尝试都失败，或者出现错误，使用默认占位图
  console.log('所有格式均加载失败，使用占位图');
  event.target.src = defaultImage || getDefaultImagePath();
}

/**
 * 将图片路径转换为首选WebP格式
 * @param {string} imagePath 原始图片路径
 * @returns {string} 优先使用WebP的图片路径
 */
export function preferWebpFormat(imagePath) {
  // 检查无效路径
  if (!imagePath || 
      imagePath === 'undefined' || 
      imagePath === 'null' || 
      imagePath.includes('/undefined') || 
      imagePath.includes('/null')) {
    return null;
  }
  
  // 完整URL不处理
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  try {
    // 提取不含扩展名的基本路径
    const lastDotIndex = imagePath.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      const basePath = imagePath.substring(0, lastDotIndex);
      // 优先尝试webp格式
      return `${basePath}.webp`;
    }
  } catch (error) {
    console.error('处理WebP格式失败:', error);
  }
  
  return imagePath;
} 