/**
 * 区域数据工具
 * 从regions.js导出省市区数据，供Cascader组件使用
 */

import regions from './regions';

// 导出区域数据
export const regionData = regions;

// 根据区域编码获取区域名称的工具函数
export const getRegionNameByCode = (province, city, district) => {
  if (!province) return '';
  
  const provinceObj = regions.find(p => p.value === province);
  if (!provinceObj) return province;
  
  if (!city) return provinceObj.label;
  
  const cityObj = provinceObj.children?.find(c => c.value === city);
  if (!cityObj) return `${provinceObj.label} ${city}`;
  
  if (!district) return `${provinceObj.label} ${cityObj.label}`;
  
  const districtObj = cityObj.children?.find(d => d.value === district);
  if (!districtObj) return `${provinceObj.label} ${cityObj.label} ${district}`;
  
  return `${provinceObj.label} ${cityObj.label} ${districtObj.label}`;
};

// 格式化完整地址
export const formatFullAddress = (address) => {
  if (!address) return '';
  
  const { province, city, district, detailAddress } = address;
  const regionStr = getRegionNameByCode(province, city, district);
  
  return `${regionStr} ${detailAddress || ''}`.trim();
};

export default regions; 