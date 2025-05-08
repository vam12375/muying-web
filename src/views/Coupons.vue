<template>
  <div class="coupons-page">
    <!-- 添加母婴装饰元素 -->
    <div class="baby-decoration baby-bottle"></div>
    <div class="baby-decoration baby-rattle"></div>
    <div class="baby-decoration baby-pacifier"></div>
    
    <div class="container mx-auto py-8 px-4">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="text-3xl font-bold text-center mb-8 relative">
          <span class="relative z-10">优惠券中心</span>
          <span class="header-decoration"></span>
        </h1>
      </div>
      
      <!-- 优惠券状态切换-->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <el-tabs v-model="couponStatus" @tab-change="handleStatusChange" class="coupon-tabs">
            <el-tab-pane label="可领取优惠券" name="available">
              <template #label>
                <div class="tab-label">
                  <i class="el-icon-gift mr-1"></i>
                  可领取优惠券
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="我的优惠券" name="mine">
              <template #label>
                <div class="tab-label">
                  <i class="el-icon-tickets mr-1"></i>
                  我的优惠券
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="已使用" name="used">
              <template #label>
                <div class="tab-label">
                  <i class="el-icon-circle-check mr-1"></i>
                  已使用
                </div>
              </template>
            </el-tab-pane>
            <el-tab-pane label="已过期" name="expired">
              <template #label>
                <div class="tab-label">
                  <i class="el-icon-time mr-1"></i>
                  已过期
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
          
          <div v-if="couponStatus === 'mine'" class="search-filter-group">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索优惠券"
              prefix-icon="Search"
              clearable
              class="w-60"
              @keyup.enter="handleSearch"
            />
            <el-button type="primary" class="ml-2" @click="handleSearch">搜索</el-button>
          </div>
        </div>
        
        <!-- 筛选区域 -->
        <div v-if="couponStatus === 'available' || couponStatus === 'mine'" class="filter-container mt-4 pt-4 border-t border-dashed border-gray-200">
          <div class="flex flex-wrap gap-4 items-center">
            <span class="text-gray-500">筛选:</span>
            <el-select v-model="filterType" placeholder="优惠券类型" size="small" class="w-32">
              <el-option label="全部类型" value=""></el-option>
              <el-option label="满减券" value="FIXED"></el-option>
              <el-option label="折扣券" value="PERCENTAGE"></el-option>
            </el-select>
            
            <el-select v-model="filterMinAmount" placeholder="使用门槛" size="small" class="w-32">
              <el-option label="全部门槛" value=""></el-option>
              <el-option label="无门槛" value="0"></el-option>
              <el-option label="满100可用" value="100"></el-option>
              <el-option label="满200可用" value="200"></el-option>
              <el-option label="满300可用" value="300"></el-option>
            </el-select>
            
            <el-select v-model="sortBy" placeholder="排序方式" size="small" class="w-32">
              <el-option label="默认排序" value=""></el-option>
              <el-option label="面值从高到低" value="valueDesc"></el-option>
              <el-option label="面值从低到高" value="valueAsc"></el-option>
              <el-option label="到期时间最近" value="expireSoon"></el-option>
            </el-select>
            
            <div class="flex-grow"></div>
            
            <!-- 优惠码兑换 -->
            <el-popover
              placement="bottom"
              :width="300"
              trigger="click"
              v-model:visible="showRedeemPopover"
            >
            <template #reference>
                <el-button type="primary" plain size="small" class="redeem-btn">
                  <i class="el-icon-plus mr-1"></i>兑换优惠码
                </el-button>
              </template>
              <div class="p-2">
                <h4 class="text-center mb-3 font-semibold">输入优惠码</h4>
                <el-input v-model="couponCode" placeholder="请输入优惠码" class="mb-3"></el-input>
                <el-button type="primary" @click="handleRedeemCode" :loading="redeeming" block>立即兑换</el-button>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
      
      <!-- 优惠券列表 -->
      <div class="mb-6">
        <div v-if="loading" class="loading-skeleton">
          <!-- 骨架屏加载状态 -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <el-skeleton-item v-for="i in 6" :key="i" class="coupon-skeleton" animated />
          </div>
        </div>
        
        <el-empty 
          v-else-if="coupons.length === 0" 
          description="暂无优惠券"
          :image="notFoundImage"
        ></el-empty>
        
        <div v-else class="coupon-list">
          <!-- 可领取优惠券 -->
          <div v-if="couponStatus === 'available'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <coupon-card
              v-for="coupon in coupons" 
              :key="coupon.id"
              :coupon="coupon"
              status="available"
              @receive="handleReceiveCoupon"
              @click="handleCouponClick"
            />
          </div>
          
          <!-- 我的优惠券/已使用/已过期 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <coupon-card
              v-for="coupon in coupons" 
              :key="coupon.id"
              :coupon="coupon"
              :status="couponStatus"
              @use="handleUseCoupon"
              @click="handleCouponClick"
            />
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container mt-8 flex justify-center">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[9, 18, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </div>
      
      <!-- 领取成功消息 -->
      <el-dialog
        v-model="receiveDialogVisible"
        width="400px"
        center
        :show-close="false"
        custom-class="coupon-success-dialog"
      >
        <div class="receive-success-animation">
          <div class="success-icon">
            <i class="el-icon-circle-check"></i>
          </div>
          <div class="success-confetti"></div>
        </div>
        <h3 class="mt-4 mb-2 text-lg font-semibold text-center">优惠券领取成功</h3>
        <p class="mb-6 text-gray-600 text-center">已添加到您的账户</p>
        <div class="flex justify-center gap-4">
          <el-button @click="receiveDialogVisible = false">继续浏览</el-button>
          <el-button type="primary" @click="handleGoToMyCoupons">查看我的优惠券</el-button>
        </div>
      </el-dialog>
      
      <!-- 优惠券详情弹窗 -->
      <el-dialog
        v-model="couponDetailVisible"
        title="优惠券详情"
        width="500px"
        custom-class="coupon-detail-dialog"
      >
        <div v-if="selectedCoupon" class="coupon-detail-content">
          <!-- 优惠券详情内容 -->
          <div class="detail-header" :class="{'discount-type': selectedCoupon.type === 'PERCENTAGE'}">
            <div class="detail-amount">
              <span v-if="selectedCoupon.type === 'FIXED'" class="currency">¥</span>
              <span class="amount">{{ formatCouponValue(selectedCoupon) }}</span>
              <span v-if="selectedCoupon.type === 'PERCENTAGE'" class="unit">折</span>
            </div>
            <div class="detail-name">{{ selectedCoupon.name }}</div>
            <div class="detail-threshold" v-if="selectedCoupon.minAmount > 0">
              满{{ selectedCoupon.minAmount }}元可用
            </div>
          </div>
          
          <div class="detail-body">
            <div class="detail-item">
              <span class="item-label">有效期</span>
              <span class="item-value">{{ formatDate(selectedCoupon.startDate) }} 至 {{ formatDate(selectedCoupon.endDate) }}</span>
            </div>
            
            <div class="detail-item">
              <span class="item-label">使用范围</span>
              <span class="item-value">{{ selectedCoupon.useScope || '全场通用' }}</span>
            </div>
            
            <div class="detail-item">
              <span class="item-label">使用说明</span>
              <span class="item-value">{{ selectedCoupon.description || '无特殊说明' }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedCoupon.code">
              <span class="item-label">优惠码</span>
              <span class="item-value code-value">{{ selectedCoupon.code }}</span>
            </div>
          </div>
          
          <div class="detail-footer">
            <el-button 
              v-if="couponStatus === 'available'" 
              type="primary" 
              @click="handleReceiveCoupon(selectedCoupon)"
            >
              立即领取
            </el-button>
            
            <el-button 
              v-else-if="couponStatus === 'mine'" 
              type="primary" 
              @click="handleUseCoupon(selectedCoupon)"
            >
              立即使用
            </el-button>
          </div>
        </div>
      </el-dialog>
      
      <!-- 使用规则 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-6 coupon-rules">
        <h3 class="text-lg font-semibold mb-4 relative">
          <span class="rule-icon"></span>
          优惠券使用说明
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="rule-section">
            <h4 class="text-base font-medium mb-3">使用规则</h4>
            <ol class="list-decimal pl-5 space-y-2 text-gray-700">
              <li>优惠券仅限在有效期内使用，过期后将自动失效</li>
              <li>部分优惠券有使用门槛，请查看优惠券详情</li>
              <li>优惠券不可兑换现金，不可与其他优惠叠加使用</li>
              <li>部分商品不支持使用优惠券，以商品详情页标注为准</li>
            </ol>
          </div>
          <div class="rule-section">
            <h4 class="text-base font-medium mb-3">注意事项</h4>
            <ol class="list-decimal pl-5 space-y-2 text-gray-700">
              <li>如订单取消或退款，已使用的优惠券不予退还</li>
              <li>新用户专享券仅限新注册用户使用</li>
              <li>每张优惠券仅限使用一次</li>
              <li>最终解释权归母婴商城所有</li>
            </ol>
          </div>
        </div>
      </div>
      
      <!-- 推荐商品 -->
      <div v-if="couponStatus === 'available'" class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold mb-4 text-center relative">
          <span class="relative z-10">推荐商品</span>
          <span class="section-decoration"></span>
        </h3>
        <div class="recommended-products">
          <div v-for="(product, index) in recommendedProducts" :key="index" class="product-card">
            <div class="product-image">
              <img :src="product.image" :alt="product.title">
            </div>
            <div class="product-info">
              <div class="product-title">{{ product.title }}</div>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <span class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice }}</span>
              </div>
            </div>
            <div class="product-tags">
              <span v-if="product.isNew" class="tag new-tag">新品</span>
              <span v-if="product.discount" class="tag discount-tag">{{ product.discount }}折</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style src="@/styles/Coupons.scss" scoped></style>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAvailableCoupons, getUserCoupons, receiveCoupon, receiveCouponByCode } from '@/api/coupon';
import CouponCard from '@/components/coupon/CouponCard.vue';
import CouponBadge from '@/components/coupon/CouponBadge.vue';
// 导入404图片
import notFoundImage from '@/assets/images/404.png';

const router = useRouter();

// 状态变量
const loading = ref(false);
const coupons = ref([]);
const couponStatus = ref('available');
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(9);
const total = ref(0);
const receiveDialogVisible = ref(false);
const showRedeemPopover = ref(false);
const couponCode = ref('');
const redeeming = ref(false);
const filterType = ref('');
const filterMinAmount = ref('');
const sortBy = ref('');
const couponDetailVisible = ref(false);
const selectedCoupon = ref(null);

// 推荐商品数据
const recommendedProducts = ref([
  {
    title: '惠氏启赋有机婴儿配方奶粉1段900g',
    price: '339.00',
    originalPrice: '398.00',
    image: '/images/products/milk1.jpg',
    isNew: true,
    discount: null
  },
  {
    title: '花王妙而舒纸尿裤L码54片',
    price: '128.00',
    originalPrice: '158.00',
    image: '/images/products/diaper1.jpg',
    isNew: false,
    discount: 8
  },
  {
    title: '贝亲宽口径玻璃奶瓶240ml',
    price: '79.00',
    originalPrice: '99.00',
    image: '/images/products/bottle1.jpg',
    isNew: false,
    discount: 8
  },
  {
    title: '好孩子婴儿推车轻便折叠',
    price: '699.00',
    originalPrice: '899.00',
    image: '/images/products/stroller1.jpg',
    isNew: true,
    discount: null
  },
  {
    title: '花王婴儿湿巾80抽*6包',
    price: '89.00',
    originalPrice: '109.00',
    image: '/images/products/wipes1.jpg',
    isNew: false,
    discount: 8
  }
]);

// 获取优惠券列表
const fetchCoupons = async () => {
  loading.value = true;
  try {
    // 定义API调用参数
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      status: couponStatus.value,
      keyword: searchKeyword.value || undefined,
      type: filterType.value || undefined,
      minSpend: filterMinAmount.value || undefined,
      sortBy: sortBy.value || undefined
    };
    
    let response;
    
    // 根据状态选择相应的API
    if (couponStatus.value === 'available') {
      console.log('获取可领取优惠券，参数:', params);
      response = await getAvailableCoupons(params);
    } else {
      // 将前端状态映射到API状态
      params.status = couponStatus.value === 'mine' ? 'UNUSED' : 
                      couponStatus.value === 'used' ? 'USED' : 'EXPIRED';
      console.log('获取用户优惠券，参数:', params);
      response = await getUserCoupons(params);
    }
    
    // 处理响应数据
    console.log('优惠券API响应:', response);
    if (response && response.code === 200) {
      // 格式化优惠券数据
      const responseData = response.data;
      // 检查数据结构：可能是{items:[...], total:n}或直接是数组[...]
      if (Array.isArray(responseData)) {
        // 数据直接是数组形式
        coupons.value = formatCoupons(responseData);
        total.value = responseData.length; // 使用数组长度作为总数
      } else if (responseData && responseData.items) {
        // 数据是{items:[...], total:n}形式
        coupons.value = formatCoupons(responseData.items);
        total.value = responseData.total || responseData.items.length;
      } else {
        // 其他情况，尝试处理可能的数据结构
        coupons.value = formatCoupons(responseData || []);
        total.value = Array.isArray(responseData) ? responseData.length : 0;
      }
      console.log('格式化后的优惠券数据:', coupons.value);
    } else {
      ElMessage.error(response?.message || '获取优惠券列表失败');
      coupons.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取优惠券列表失败', error);
    ElMessage.error('获取优惠券列表失败，请稍后重试');
    coupons.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 格式化优惠券数据
const formatCoupons = (couponsData) => {
  console.log('原始优惠券数据:', couponsData);
  if (!Array.isArray(couponsData)) {
    console.warn('优惠券数据不是数组格式');
    return [];
  }
  
  return couponsData.map(coupon => {
    try {
      // 处理不同的API返回结构
      if (coupon.coupon) {
        // 用户优惠券结构：包含coupon字段
        const couponData = coupon.coupon;
        return {
          id: coupon.id,
          name: couponData.name,
          description: couponData.description,
          type: couponData.type,
          value: couponData.value,
          minAmount: couponData.minSpend || 0,
          maxDiscount: couponData.maxDiscount,
          startDate: couponData.startTime,
          endDate: couponData.endTime,
          useTime: coupon.useTime,
          useScope: getCouponScope(couponData.categoryIds, couponData.productIds),
          isNewUser: couponData.isNewUser || false,
          code: couponData.code
        };
      } else {
        // 可领取优惠券结构：直接是优惠券对象
        return {
          id: coupon.id,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: coupon.value,
          minAmount: coupon.minSpend || 0,
          maxDiscount: coupon.maxDiscount,
          startDate: coupon.startTime,
          endDate: coupon.endTime,
          useTime: coupon.useTime,
          useScope: getCouponScope(coupon.categoryIds, coupon.productIds),
          isNewUser: coupon.isNewUser || false,
          code: coupon.code
        };
      }
    } catch (error) {
      console.error('格式化优惠券数据时出错:', error, coupon);
      return null;
    }
  }).filter(item => item !== null); // 过滤掉转换失败的项
};

// 获取优惠券使用范围文本
const getCouponScope = (categoryIds, productIds) => {
  if (!categoryIds && !productIds) return '全场通用';
  if (categoryIds) {
    // 这里可以根据实际业务逻辑返回不同分类
    const categories = categoryIds.split(',');
    if (categories.includes('1')) return '奶粉专享';
    if (categories.includes('2')) return '尿裤专享';
    return '部分商品可用';
  }
  return '部分商品可用';
};

// 格式化优惠券值
const formatCouponValue = (coupon) => {
  if (!coupon) return '';
  
  if (coupon.type === 'FIXED') {
    return coupon.value;
  } else if (coupon.type === 'PERCENTAGE') {
    // 将小数转为折扣数，例如0.9 -> 9，0.85 -> 8.5
    return (coupon.value * 10).toFixed(coupon.value % 0.1 === 0 ? 0 : 1);
  }
  return coupon.value;
};

// 判断优惠券是否即将过期（7天内）
const isExpireSoon = (coupon) => {
  const now = new Date();
  const expireDate = new Date(coupon.endDate);
  const daysUntilExpire = Math.floor((expireDate - now) / (1000 * 60 * 60 * 24));
  return daysUntilExpire >= 0 && daysUntilExpire <= 7;
};

// 获取优惠券剩余有效天数
const getDaysUntilExpire = (coupon) => {
  const now = new Date();
  const expireDate = new Date(coupon.endDate);
  return Math.max(0, Math.floor((expireDate - now) / (1000 * 60 * 60 * 24)));
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return `${formatDate(dateTimeStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 事件处理函数
const handleStatusChange = () => {
  currentPage.value = 1;
  fetchCoupons();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchCoupons();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchCoupons();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchCoupons();
};

// 领取优惠券
const handleReceiveCoupon = async (coupon) => {
  try {
    // 关闭详情弹窗（如果打开）
    couponDetailVisible.value = false;
    
    // 调用领取优惠券API
    const response = await receiveCoupon(coupon.id);
    
    if (response && response.code === 200) {
      ElMessage.success('优惠券领取成功');
      receiveDialogVisible.value = true;
      
      // 刷新优惠券列表
      if (couponStatus.value === 'available') {
        fetchCoupons();
      }
    } else {
      ElMessage.error(response?.message || '领取优惠券失败');
    }
  } catch (error) {
    console.error('领取优惠券失败', error);
    ElMessage.error('领取优惠券失败，请稍后重试');
  }
};

// 兑换优惠码
const handleRedeemCode = async () => {
  if (!couponCode.value) {
    ElMessage.warning('请输入优惠码');
    return;
  }
  
  redeeming.value = true;
  try {
    // 调用兑换优惠码API
    const response = await receiveCouponByCode(couponCode.value);
    
    if (response && response.code === 200) {
      ElMessage.success('优惠码兑换成功');
      showRedeemPopover.value = false;
      couponCode.value = '';
      
      // 如果当前在"我的优惠券"页面，则刷新列表
      if (couponStatus.value === 'mine') {
        fetchCoupons();
      } else {
        // 显示领取成功弹窗
        receiveDialogVisible.value = true;
      }
    } else {
      ElMessage.error(response?.message || '兑换优惠码失败，请检查优惠码是否正确');
    }
  } catch (error) {
    console.error('兑换优惠码失败', error);
    ElMessage.error('兑换优惠码失败，请检查优惠码是否正确');
  } finally {
    redeeming.value = false;
  }
};

// 使用优惠券
const handleUseCoupon = (coupon) => {
  // 关闭详情弹窗（如果打开）
  couponDetailVisible.value = false;
  
  // 跳转到商品列表页面，并带上优惠券参数
  router.push({
    path: '/products',
    query: { coupon: coupon.id }
  });
};

// 查看我的优惠券
const handleGoToMyCoupons = () => {
  receiveDialogVisible.value = false;
  couponStatus.value = 'mine';
  fetchCoupons();
};

// 显示优惠券详情
const handleCouponClick = (coupon) => {
  selectedCoupon.value = coupon;
  couponDetailVisible.value = true;
};

// 监听状态变化
watch([couponStatus, filterType, filterMinAmount, sortBy], () => {
  fetchCoupons();
});

// 初始化
onMounted(() => {
  fetchCoupons();
});
</script>

