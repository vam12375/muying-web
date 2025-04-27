<template>
  <div class="coupons-page">
    <main-layout>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold mb-6">优惠券中心</h1>
        
        <!-- 优惠券状态切换-->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <el-tabs v-model="couponStatus" @tab-change="handleStatusChange">
              <el-tab-pane label="可领取优惠券" name="available"></el-tab-pane>
              <el-tab-pane label="我的优惠券" name="mine"></el-tab-pane>
              <el-tab-pane label="已使用" name="used"></el-tab-pane>
              <el-tab-pane label="已过期" name="expired"></el-tab-pane>
            </el-tabs>
            
            <div v-if="couponStatus === 'mine'" class="flex items-center">
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
        </div>
        
        <!-- 优惠券列表-->
        <div class="mb-6">
          <el-empty v-if="!loading && coupons.length === 0" description="暂无优惠券"></el-empty>
          
          <div v-if="loading" class="loading-skeleton">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else class="coupon-list">
            <!-- 可领取优惠券 -->
            <div v-if="couponStatus === 'available'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="coupon in coupons" :key="coupon.id" class="coupon-card bg-white rounded-lg overflow-hidden shadow-md relative">
                <div class="flex">
                  <!-- 优惠券左侧金额-->
                  <div class="coupon-amount bg-blue-500 text-white flex flex-col items-center justify-center p-4 w-32">
                    <div class="text-3xl font-bold">{{ coupon.amount }}</div>
                    <div class="text-sm">{{ getCouponTypeText(coupon.type) }}</div>
                    <div class="text-xs mt-2">{{ coupon.minAmount > 0 ? `满${coupon.minAmount}可用` : '无门槛' }}</div>
                  </div>
                  
                  <!-- 优惠券信息-->
                  <div class="coupon-info flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div class="font-semibold text-lg mb-1">{{ coupon.name }}</div>
                      <div class="text-sm text-gray-500 mb-2">{{ coupon.description }}</div>
                      <div class="text-xs text-gray-500">有效期：{{ formatDate(coupon.startDate) }} 至 {{ formatDate(coupon.endDate) }}</div>
                      <div class="text-xs text-gray-500" v-if="coupon.code">兑换码：{{ coupon.code }}</div>
                    </div>
                    
                    <div class="mt-2">
                      <el-button type="primary" size="small" @click="handleReceiveCoupon(coupon)">立即领取</el-button>
                    </div>
                  </div>
                  
                  <!-- 优惠券花边-->
                  <div class="coupon-edge"></div>
                </div>
              </div>
            </div>
            
            <!-- 我的优惠券/已使用/已过期-->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="coupon in coupons" 
                :key="coupon.id" 
                class="coupon-card bg-white rounded-lg overflow-hidden shadow-md relative"
                :class="{
                  'coupon-used': couponStatus === 'used',
                  'coupon-expired': couponStatus === 'expired'
                }"
              >
                <div class="flex">
                  <!-- 优惠券左侧金额-->
                  <div 
                    class="coupon-amount flex flex-col items-center justify-center p-4 w-32 text-white"
                    :class="{
                      'bg-primary': couponStatus === 'mine',
                      'bg-gray-400': couponStatus === 'used' || couponStatus === 'expired'
                    }"
                  >
                    <div class="text-3xl font-bold">{{ coupon.amount }}</div>
                    <div class="text-sm">{{ getCouponTypeText(coupon.type) }}</div>
                    <div class="text-xs mt-2">{{ coupon.minAmount > 0 ? `满${coupon.minAmount}可用` : '无门槛' }}</div>
                  </div>
                  
                  <!-- 优惠券信息-->
                  <div class="coupon-info flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div class="font-semibold text-lg mb-1">{{ coupon.name }}</div>
                      <div class="text-sm text-gray-500 mb-2">{{ coupon.description }}</div>
                      <div class="text-xs text-gray-500">有效期：{{ formatDate(coupon.startDate) }} 至 {{ formatDate(coupon.endDate) }}</div>
                      <div class="text-xs text-gray-500 mt-1" v-if="coupon.useScope">使用范围：{{ coupon.useScope }}</div>
                    </div>
                    
                    <div class="mt-2">
                      <el-button 
                        v-if="couponStatus === 'mine'" 
                        type="primary" 
                        size="small" 
                        @click="handleUseCoupon(coupon)"
                      >
                        立即使用
                      </el-button>
                      
                      <div v-else-if="couponStatus === 'used'" class="text-gray-500 text-sm">
                        使用时间：{{ formatDateTime(coupon.useTime) }}
                      </div>
                      
                      <div 
                        v-else-if="couponStatus === 'expired'" 
                        class="text-gray-500 text-sm"
                      >
                        已过期
                      </div>
                    </div>
                  </div>
                  
                  <!-- 状态标记-->
                  <div 
                    v-if="couponStatus === 'used' || couponStatus === 'expired'" 
                    class="absolute right-0 top-0 w-20 h-20"
                  >
                    <div 
                      class="absolute transform rotate-45 bg-gray-400 text-white text-center font-semibold py-1 px-10"
                      style="width: 150px; top: 30px; right: -40px;"
                    >
                      {{ couponStatus === 'used' ? '已使用' : '已过期' }}
                    </div>
                  </div>
                  
                  <!-- 优惠券花边-->
                  <div class="coupon-edge"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container mt-6 flex justify-center">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[9, 18, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        
        <!-- 领取成功消息 -->
        <el-dialog
          v-model="receiveDialogVisible"
          title="领取成功"
          width="400px"
          center
        >
          <div class="text-center">
            <i class="el-icon-success text-green-500 text-5xl"></i>
            <p class="mt-4 mb-6">优惠券已成功领取到您的账户</p>
            <div class="flex justify-center gap-4">
              <el-button @click="receiveDialogVisible = false">继续浏览</el-button>
              <el-button type="primary" @click="handleGoToMyCoupons">查看我的优惠券</el-button>
            </div>
          </div>
        </el-dialog>
        
        <!-- 使用规则 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold mb-4">优惠券使用说明</h3>
          <ol class="list-decimal pl-5 space-y-2 text-gray-700">
            <li>优惠券仅限在有效期内使用，过期后将自动失效</li>
            <li>部分优惠券有使用门槛，请查看优惠券详情中的"满X元可用"说明</li>
            <li>优惠券不可兑换现金，不可与其他优惠叠加使用</li>
            <li>部分商品不支持使用优惠券，以商品详情页标注为准</li>
            <li>如订单取消或退款，已使用的优惠券不予退还</li>
            <li>最终解释权归母婴商城所有</li>
          </ol>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

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

// 获取优惠券列表
const fetchCoupons = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟优惠券数据
    const availableCoupons = [
      {
        id: 101,
        name: '新用户优惠券',
        type: 'discount',
        amount: '¥10',
        minAmount: 50,
        description: '新人专享优惠，全场通用',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'NEW10',
        useScope: '全场通用'
      },
      {
        id: 102,
        name: '满100减15',
        type: 'discount',
        amount: '¥15',
        minAmount: 100,
        description: '全场通用满减券',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'DIS15',
        useScope: '全场通用'
      },
      {
        id: 103,
        name: '满200减30',
        type: 'discount',
        amount: '¥30',
        minAmount: 200,
        description: '全场通用满减券',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'DIS30',
        useScope: '全场通用'
      },
      {
        id: 104,
        name: '满300减50',
        type: 'discount',
        amount: '¥50',
        minAmount: 300,
        description: '全场通用满减券',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'DIS50',
        useScope: '全场通用'
      },
      {
        id: 105,
        name: '奶粉尿片95折',
        type: 'percent',
        amount: '95折',
        minAmount: 0,
        description: '奶粉尿片类商品专享折扣',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'PER95',
        useScope: '奶粉、尿片类商品'
      },
      {
        id: 106,
        name: '玩具图书9折',
        type: 'percent',
        amount: '9折',
        minAmount: 0,
        description: '玩具图书类商品专享折扣',
        startDate: '2023-05-01',
        endDate: '2023-06-01',
        code: 'PER90',
        useScope: '玩具、图书类商品'
      }
    ];
    
    const myCoupons = [
      {
        id: 201,
        name: '新用户专享券',
        type: 'discount',
        amount: '¥20',
        minAmount: 100,
        description: '新用户首单专享',
        startDate: '2023-05-01',
        endDate: '2023-06-30',
        useScope: '全场通用'
      },
      {
        id: 202,
        name: '满200减30',
        type: 'discount',
        amount: '¥30',
        minAmount: 200,
        description: '全场通用满减券',
        startDate: '2023-05-01',
        endDate: '2023-06-30',
        useScope: '全场通用'
      },
      {
        id: 203,
        name: '奶粉专享8折',
        type: 'percent',
        amount: '8折',
        minAmount: 0,
        description: '奶粉类商品专享折扣',
        startDate: '2023-05-01',
        endDate: '2023-06-30',
        useScope: '奶粉类商品'
      }
    ];
    
    const usedCoupons = [
      {
        id: 301,
        name: '满100减20',
        type: 'discount',
        amount: '¥20',
        minAmount: 100,
        description: '全场通用满减券',
        startDate: '2023-04-01',
        endDate: '2023-05-15',
        useTime: '2023-05-10 14:30:00',
        useScope: '全场通用'
      },
      {
        id: 302,
        name: '尿片专享8.5折',
        type: 'percent',
        amount: '8.5折',
        minAmount: 0,
        description: '尿片类商品专享折扣',
        startDate: '2023-04-01',
        endDate: '2023-05-15',
        useTime: '2023-05-05 09:15:00',
        useScope: '尿片类商品'
      }
    ];
    
    const expiredCoupons = [
      {
        id: 401,
        name: '生日专享券',
        type: 'discount',
        amount: '¥50',
        minAmount: 300,
        description: '生日当月专享优惠',
        startDate: '2023-03-01',
        endDate: '2023-04-01',
        useScope: '全场通用'
      },
      {
        id: 402,
        name: '辅食9折',
        type: 'percent',
        amount: '9折',
        minAmount: 0,
        description: '婴儿辅食专享折扣',
        startDate: '2023-03-01',
        endDate: '2023-04-01',
        useScope: '婴儿辅食类商品'
      }
    ];
    
    // 根据状态选择相应的优惠券列表
    let couponData = [];
    switch (couponStatus.value) {
      case 'available':
        couponData = availableCoupons;
        break;
      case 'mine':
        couponData = myCoupons;
        break;
      case 'used':
        couponData = usedCoupons;
        break;
      case 'expired':
        couponData = expiredCoupons;
        break;
    }
    
    // 搜索关键词过滤（仅对我的优惠券有效）
    if (couponStatus.value === 'mine' && searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      couponData = couponData.filter(coupon => 
        coupon.name.toLowerCase().includes(keyword) || 
        coupon.description.toLowerCase().includes(keyword) ||
        (coupon.useScope && coupon.useScope.toLowerCase().includes(keyword))
      );
    }
    
    total.value = couponData.length;
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    coupons.value = couponData.slice(start, end);
    
  } catch (error) {
    console.error('获取优惠券列表失败', error);
    ElMessage.error('获取优惠券列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取优惠券类型文本
const getCouponTypeText = (type) => {
  switch (type) {
    case 'discount':
      return '优惠券';
    case 'percent':
      return '折扣券';
    default:
      return '优惠券';
  }
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
const handleReceiveCoupon = (coupon) => {
  // 模拟领取请求
  setTimeout(() => {
    ElMessage.success('优惠券领取成功');
    receiveDialogVisible.value = true;
  }, 500);
};

// 使用优惠券
const handleUseCoupon = (coupon) => {
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

// 监听状态变化
watch(couponStatus, () => {
  fetchCoupons();
});

// 初始化
onMounted(() => {
  fetchCoupons();
});
</script>

<style scoped>
.coupons-page {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 优惠券卡片样式*/
.coupon-card {
  position: relative;
  transition: all 0.3s ease;
}

.coupon-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.coupon-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 32%;
  width: 20px;
  background-image: radial-gradient(
    circle at 10px 10px,
    #f5f7fa 6px,
    transparent 6px
  );
  background-size: 20px 20px;
  background-position: -10px;
}

.coupon-used::after,
.coupon-expired::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

/* 自定义主题色 */
.text-primary {
  color: #f27c8d;
}

.bg-primary {
  background-color: #f27c8d;
}

/* 响应式调整*/
@media (max-width: 768px) {
  .coupon-amount {
    width: 100px;
  }
  
  .coupon-edge {
    left: 100px;
  }
}
</style> 
