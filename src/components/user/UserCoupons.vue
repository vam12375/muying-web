<template>
  <div class="user-coupons-container">
    <div class="section-header">
      <h2 class="section-title">我的优惠券</h2>
      <el-button type="primary" size="small" @click="goToGetCoupons">
        领取优惠券
      </el-button>
    </div>
    
    <div class="coupon-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="未使用" name="unused">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="unusedCoupons.length === 0" class="empty-state">
            <el-empty description="暂无未使用的优惠券" />
            <el-button type="primary" @click="showAvailableCoupons">去领取优惠券</el-button>
          </div>
          <div v-else class="coupon-list">
            <div v-for="(coupon, index) in unusedCoupons" :key="index" class="coupon-item available">
              <div class="coupon-left">
                <div class="coupon-amount">
                  <span class="currency">¥</span>
                  <span class="amount">{{ coupon.amount }}</span>
                </div>
                <div class="coupon-condition">满{{ coupon.minSpend }}元可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-type">{{ coupon.type }}</div>
                <div class="coupon-name">{{ coupon.name }}</div>
                <div class="coupon-validity">
                  有效期至: {{ formatDate(coupon.expireDate) }}
                </div>
                <div class="coupon-actions">
                  <el-button type="primary" size="small" @click="useCoupon(coupon)">立即使用</el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已使用" name="used">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="usedCoupons.length === 0" class="empty-state">
            <el-empty description="暂无已使用的优惠券" />
          </div>
          <div v-else class="coupon-list">
            <div v-for="(coupon, index) in usedCoupons" :key="index" class="coupon-item used">
              <div class="coupon-left">
                <div class="coupon-amount">
                  <span class="currency">¥</span>
                  <span class="amount">{{ coupon.amount }}</span>
                </div>
                <div class="coupon-condition">满{{ coupon.minSpend }}元可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-type">{{ coupon.type }}</div>
                <div class="coupon-name">{{ coupon.name }}</div>
                <div class="coupon-validity">
                  使用时间: {{ formatDate(coupon.usedDate) }}
                </div>
                <div class="coupon-order" v-if="coupon.orderId">
                  订单号: {{ coupon.orderId }}
                </div>
              </div>
              <div class="coupon-status">已使用</div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="已过期" name="expired">
          <div v-if="loading" class="loading-container">
            <el-skeleton :rows="3" animated />
          </div>
          <div v-else-if="expiredCoupons.length === 0" class="empty-state">
            <el-empty description="暂无已过期的优惠券" />
          </div>
          <div v-else class="coupon-list">
            <div v-for="(coupon, index) in expiredCoupons" :key="index" class="coupon-item expired">
              <div class="coupon-left">
                <div class="coupon-amount">
                  <span class="currency">¥</span>
                  <span class="amount">{{ coupon.amount }}</span>
                </div>
                <div class="coupon-condition">满{{ coupon.minSpend }}元可用</div>
              </div>
              <div class="coupon-right">
                <div class="coupon-type">{{ coupon.type }}</div>
                <div class="coupon-name">{{ coupon.name }}</div>
                <div class="coupon-validity">
                  过期时间: {{ formatDate(coupon.expireDate) }}
                </div>
              </div>
              <div class="coupon-status">已过期</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 优惠券详情对话框 -->
    <el-dialog
      v-model="couponInfoVisible"
      title="优惠券使用规则"
      width="500px">
      <div v-if="selectedCoupon" class="coupon-info">
        <h3>{{ selectedCoupon.name }}</h3>
        <p><strong>优惠券类型：</strong>{{ selectedCoupon.type }}</p>
        <p><strong>优惠金额：</strong>{{ selectedCoupon.amount }}元</p>
        <p><strong>使用条件：</strong>订单满{{ selectedCoupon.minSpend }}元可用</p>
        <p><strong>有效期至：</strong>{{ formatDate(selectedCoupon.expireDate) }}</p>
        <p><strong>使用范围：</strong>{{ selectedCoupon.scope || '全场商品' }}</p>
        <div class="coupon-rules">
          <h4>使用规则：</h4>
          <ul>
            <li>每个订单限用一张优惠券</li>
            <li>优惠券不可叠加使用</li>
            <li>优惠券不可兑换现金</li>
            <li>特价商品可能不支持使用优惠券</li>
            <li>如有疑问，请联系客服</li>
          </ul>
        </div>
        <div class="dialog-footer">
          <el-button @click="couponInfoVisible = false">关闭</el-button>
          <el-button type="primary" @click="goToShopping">去购物</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 可领取优惠券对话框 -->
    <el-dialog
      v-model="availableCouponsVisible"
      title="可领取优惠券"
      width="650px">
      <div class="available-coupons" v-loading="loadingAvailable">
        <div v-if="availableCoupons.length === 0" class="empty-state">
          <el-empty description="暂无可领取的优惠券" />
        </div>
        <div v-else class="coupon-list">
          <div v-for="(coupon, index) in availableCoupons" :key="index" class="coupon-item available">
            <div class="coupon-left">
              <div class="coupon-amount">
                <span class="currency">¥</span>
                <span class="amount">{{ coupon.amount }}</span>
              </div>
              <div class="coupon-condition">满{{ coupon.minSpend }}元可用</div>
            </div>
            <div class="coupon-right">
              <div class="coupon-type">{{ coupon.type }}</div>
              <div class="coupon-name">{{ coupon.name }}</div>
              <div class="coupon-validity">
                有效期: {{ formatDate(coupon.startTime) }} 至 {{ formatDate(coupon.endTime) }}
              </div>
              <div class="coupon-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  :loading="coupon.receiving"
                  :disabled="coupon.received"
                  @click="receiveCoupon(coupon, index)">
                  {{ coupon.received ? '已领取' : '立即领取' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getUserCoupons, getAvailableCoupons, receiveCoupon as apiReceiveCoupon } from '@/api/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(true);
const activeTab = ref('unused');
const allCoupons = ref([]);
const couponInfoVisible = ref(false);
const selectedCoupon = ref(null);

// 可领取优惠券
const availableCouponsVisible = ref(false);
const availableCoupons = ref([]);
const loadingAvailable = ref(false);

// 监听activeTab变化，自动加载对应数据
watch(activeTab, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    console.log(`标签页从 ${oldValue} 切换到 ${newValue}，自动加载数据`);
    fetchCoupons();
  }
});

// 根据状态筛选优惠券
const unusedCoupons = computed(() => {
  console.log('筛选未使用优惠券，当前数据:', allCoupons.value);
  return allCoupons.value.filter(coupon => 
    coupon.status === 'unused' || coupon.status === 'UNUSED' || coupon.status.toLowerCase() === 'unused');
});

const usedCoupons = computed(() => {
  return allCoupons.value.filter(coupon => 
    coupon.status === 'used' || coupon.status === 'USED' || coupon.status.toLowerCase() === 'used');
});

const expiredCoupons = computed(() => {
  return allCoupons.value.filter(coupon => 
    coupon.status === 'expired' || coupon.status === 'EXPIRED' || coupon.status.toLowerCase() === 'expired');
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString();
};

// 处理标签页切换
const handleTabClick = (tab) => {
  console.log('标签页点击事件触发，tab名称:', tab.props.name);
  // 不再需要在这里调用fetchCoupons，watch会自动处理
};

// 使用优惠券
const useCoupon = (coupon) => {
  selectedCoupon.value = coupon;
  couponInfoVisible.value = true;
};

// 去领取优惠券
const goToGetCoupons = () => {
  showAvailableCoupons();
};

// 显示可领取优惠券
const showAvailableCoupons = async () => {
  availableCouponsVisible.value = true;
  await fetchAvailableCoupons();
};

// 获取可领取优惠券
const fetchAvailableCoupons = async () => {
  loadingAvailable.value = true;
  try {
    const res = await getAvailableCoupons();
    
    if (res.code === 200) {
      // 添加received和receiving字段用于UI状态控制
      availableCoupons.value = (res.data || []).map(coupon => ({
        ...coupon,
        received: false,
        receiving: false
      }));
    } else {
      ElMessage.error(res.message || '获取可领取优惠券列表失败');
    }
  } catch (error) {
    console.error('获取可领取优惠券失败:', error);
    ElMessage.error('获取可领取优惠券失败，请稍后重试');
  } finally {
    loadingAvailable.value = false;
  }
};

// 领取优惠券
const receiveCoupon = async (coupon, index) => {
  if (coupon.received || coupon.receiving) return;
  
  // 设置领取中状态
  availableCoupons.value[index].receiving = true;
  
  try {
    const res = await apiReceiveCoupon(coupon.id);
    
    if (res.code === 200) {
      ElMessage.success('优惠券领取成功');
      availableCoupons.value[index].received = true;
      
      // 刷新优惠券列表
      fetchCoupons();
    } else {
      ElMessage.error(res.message || '优惠券领取失败');
    }
  } catch (error) {
    console.error('领取优惠券失败:', error);
    ElMessage.error('领取优惠券失败，请稍后重试');
  } finally {
    availableCoupons.value[index].receiving = false;
  }
};

// 去购物
const goToShopping = () => {
  router.push('/products');
  couponInfoVisible.value = false;
};

// 获取优惠券数据
const fetchCoupons = async () => {
  loading.value = true;
  
  try {
    const params = {
      status: activeTab.value === 'unused' ? 'UNUSED' : 
              activeTab.value === 'used' ? 'USED' : 'EXPIRED'
    };
    
    console.log('获取用户优惠券，参数:', params);
    const res = await getUserCoupons(params);
    console.log('优惠券API响应:', res);
    
    if (res.code === 200) {
      // 检查数据结构：可能是数组或是带有items属性的对象
      let couponsData = [];
      
      if (Array.isArray(res.data)) {
        console.log('API返回数组格式数据');
        couponsData = res.data;
      } else if (res.data && res.data.items && Array.isArray(res.data.items)) {
        console.log('API返回对象格式数据，包含items属性');
        couponsData = res.data.items;
      } else if (res.data) {
        console.log('API返回其他格式数据');
        couponsData = Array.isArray(res.data) ? res.data : [res.data];
      } else {
        console.log('API返回数据为空');
        couponsData = [];
      }
      
      // 格式化优惠券数据
      allCoupons.value = formatCouponData(couponsData);
      console.log('格式化后的优惠券数据:', allCoupons.value);
    } else {
      ElMessage.error(res.message || '获取优惠券列表失败');
    }
  } catch (error) {
    console.error('获取优惠券失败:', error);
    ElMessage.error('获取优惠券失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 将后端数据格式化为组件所需格式
const formatCouponData = (couponsData) => {
  console.log('格式化前的原始数据:', couponsData);
  if (!Array.isArray(couponsData)) {
    console.warn('优惠券数据不是数组格式');
    return [];
  }
  
  return couponsData.map(item => {
    try {
      // 处理不同的数据结构
      const coupon = item.coupon || item;
      const status = item.status ? item.status.toLowerCase() : activeTab.value;

      return {
        id: item.id,
        amount: coupon.value || 0,
        name: coupon.name || '优惠券',
        type: getCouponTypeText(coupon.type),
        minSpend: coupon.minSpend || 0,
        startDate: coupon.startTime || item.receiveTime || new Date(),
        expireDate: item.expireTime || coupon.endTime || new Date(),
        usedDate: item.useTime,
        orderId: item.orderId,
        scope: coupon.categoryIds ? getCouponScope(coupon.categoryIds, coupon.productIds) : '全场通用',
        status: status,
        description: coupon.description || '',
        // 其他需要的属性...
      };
    } catch (error) {
      console.error('格式化优惠券数据时出错:', error, item);
      return null;
    }
  }).filter(Boolean); // 过滤掉null值
};

// 获取优惠券类型文本
const getCouponTypeText = (type) => {
  if (!type) return '满减券';
  
  switch(type) {
    case 'FIXED':
      return '满减券';
    case 'PERCENTAGE':
      return '折扣券';
    default:
      return type;
  }
};

onMounted(() => {
  fetchCoupons();
});
</script>

<style src="@/styles/user/UserCoupons.scss" scoped></style>
