/**
 * 日期格式化工具函数
 * 
 * @param {string|Date} date 需要格式化的日期，可以是日期对象或日期字符串
 * @param {string} format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    return '';
  }
  
  // 将字符串转换为日期对象
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  // 补零函数
  const padZero = (num) => (num < 10 ? '0' + num : num);
  
  // 替换格式化模板中的占位符
  return format
    .replace('YYYY', year)
    .replace('MM', padZero(month))
    .replace('DD', padZero(day))
    .replace('HH', padZero(hours))
    .replace('mm', padZero(minutes))
    .replace('ss', padZero(seconds));
}

/**
 * 获取相对时间（多久之前）
 * 
 * @param {string|Date} date 日期
 * @returns {string} 相对时间
 */
export function getRelativeTime(date) {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return '';
  }
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  
  // 毫秒转换
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前';
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前';
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前';
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前';
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前';
  } else {
    return Math.floor(diff / year) + '年前';
  }
}

/**
 * 日期比较函数
 * 
 * @param {string|Date} date1 第一个日期
 * @param {string|Date} date2 第二个日期
 * @returns {number} 如果date1晚于date2，返回1；如果相等，返回0；如果date1早于date2，返回-1
 */
export function compareDate(date1, date2) {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  // 检查日期是否有效
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    console.error('Invalid date in comparison:', date1, date2);
    return 0;
  }
  
  const time1 = d1.getTime();
  const time2 = d2.getTime();
  
  if (time1 > time2) {
    return 1;
  } else if (time1 === time2) {
    return 0;
  } else {
    return -1;
  }
} 