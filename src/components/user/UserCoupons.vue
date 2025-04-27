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
import { ref, onMounted, computed, reactive } from 'vue';
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

// 根据状态筛选优惠券
const unusedCoupons = computed(() => {
  return allCoupons.value.filter(coupon => coupon.status === 'unused');
});

const usedCoupons = computed(() => {
  return allCoupons.value.filter(coupon => coupon.status === 'used');
});

const expiredCoupons = computed(() => {
  return allCoupons.value.filter(coupon => coupon.status === 'expired');
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString();
};

// 处理标签页切换
const handleTabClick = () => {
  fetchCoupons();
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
      status: activeTab.value
    };
    
    const res = await getUserCoupons(params);
    
    if (res.code === 200) {
      allCoupons.value = res.data || [];
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

onMounted(() => {
  fetchCoupons();
});
</script>

<style lang="scss" scoped>
.user-coupons-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.loading-container {
  padding: 20px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.empty-state .el-button {
  margin-top: 20px;
}

.coupon-list {
  padding: 10px 0;
}

.coupon-item {
  display: flex;
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.coupon-item::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 10px;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 0 10px 10px 0;
}

.coupon-item::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 10px;
  height: 20px;
  background-color: #f5f5f5;
  border-radius: 10px 0 0 10px;
}

.coupon-left {
  width: 120px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-right: 1px dashed #ddd;
}

.coupon-right {
  flex: 1;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.coupon-amount {
  display: flex;
  align-items: baseline;
  color: #ff6700;
}

.currency {
  font-size: 18px;
  font-weight: bold;
}

.amount {
  font-size: 32px;
  font-weight: bold;
}

.coupon-condition {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.coupon-type {
  font-size: 12px;
  color: #ff6700;
  background-color: rgba(255, 103, 0, 0.1);
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.coupon-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.coupon-validity, .coupon-order {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.coupon-actions {
  margin-top: 10px;
}

.coupon-status {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 15px;
  font-size: 12px;
  color: #fff;
  background-color: #999;
}

/* 未使用的优惠券样式 */
.coupon-item.available {
  background-color: #fff;
  border: 1px solid #ff6700;
}

.coupon-item.available .coupon-left {
  background-color: rgba(255, 103, 0, 0.05);
}

/* 已使用的优惠券样式 */
.coupon-item.used {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  opacity: 0.8;
}

.coupon-item.used .coupon-amount {
  color: #999;
}

.coupon-item.used .coupon-type {
  color: #999;
  background-color: rgba(153, 153, 153, 0.1);
}

.coupon-item.used .coupon-status {
  background-color: #999;
}

/* 已过期的优惠券样式 */
.coupon-item.expired {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  opacity: 0.7;
}

.coupon-item.expired .coupon-amount {
  color: #999;
}

.coupon-item.expired .coupon-type {
  color: #999;
  background-color: rgba(153, 153, 153, 0.1);
}

.coupon-item.expired .coupon-status {
  background-color: #f56c6c;
}

/* 优惠券详情对话框 */
.coupon-info {
  padding: 0 20px;
}

.coupon-info h3 {
  margin-top: 0;
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.coupon-info p {
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.coupon-rules {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.coupon-rules h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.coupon-rules ul {
  padding-left: 20px;
}

.coupon-rules li {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  margin-top: 20px;
  text-align: right;
}

/* 可领取优惠券列表样式 */
.available-coupons {
  max-height: 500px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .coupon-item {
    flex-direction: column;
  }
  
  .coupon-left {
    width: 100%;
    padding: 15px;
    border-right: none;
    border-bottom: 1px dashed #ddd;
  }
  
  .coupon-amount {
    flex-direction: row;
  }
}
</style>
