/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {string|Date} dateString - 日期字符串或日期对象
 * @returns {string} - 格式化后的日期字符串
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:MM:SS 格式
 * @param {string|Date} dateString - 日期字符串或日期对象
 * @returns {string} - 格式化后的日期时间字符串
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

/**
 * 格式化金额为带千位分隔符和小数点后两位的字符串
 * @param {number} amount - 金额数值
 * @param {number} decimals - 小数位数，默认为2
 * @param {boolean} showSymbol - 是否显示货币符号，默认为true
 * @returns {string} - 格式化后的金额字符串
 */
export function formatCurrency(amount, decimals = 2, showSymbol = true) {
  if (amount === undefined || amount === null) return '';
  
  const symbol = showSymbol ? '¥' : '';
  return symbol + amount.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

/**
 * 格式化数字为带千位分隔符的字符串
 * @param {number} num - 数值
 * @returns {string} - 格式化后的数字字符串
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '';
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数，默认为2
 * @returns {string} - 格式化后的文件大小字符串
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 