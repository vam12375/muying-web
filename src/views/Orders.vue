<template>
  <div class="orders-page min-h-screen">
    <!-- 页面头部区域 -->
    <motion-div
      :initial="{ opacity: 0, y: -20 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
      class="page-header container mx-auto px-4 py-6"
    >
      <div class="header-content">
        <h1 class="page-title">我的订单</h1>
        <p class="page-subtitle">轻松管理您的所有订单，追踪发货状态和查看订单历史</p>
      </div>

      <!-- 订单统计卡片 -->
      <div class="order-stats-cards">
        <motion-div
          v-for="(stat, index) in orderStatsItems"
          :key="index"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: 0.1 * index }"
          class="stat-card"
          :class="stat.colorClass"
          @click="filterByStatus(stat.status)"
        >
          <div class="stat-icon">
            <component :is="stat.icon" />
          </div>
          <div class="stat-content">
            <h3 class="stat-title">{{ stat.title }}</h3>
            <p class="stat-value">{{ orderStats[stat.key] || 0 }}</p>
          </div>
          <div class="stat-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </motion-div>
      </div>
    </motion-div>

    <!-- 筛选面板 -->
    <motion-div
      :initial="{ opacity: 0, y: -10 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.5, delay: 0.3 }"
      class="filter-panel container mx-auto px-4 mb-6"
    >
      <div class="filter-tabs">
        <div
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="handleTabChange(tab.value)"
          class="filter-tab"
          :class="{ active: filters.status === tab.value }"
        >
          <span class="tab-text">{{ tab.label }}</span>
          <div class="tab-indicator"></div>
        </div>
      </div>

      <div class="advanced-filters">
        <el-input
          v-model="filters.orderNumber"
          placeholder="订单号搜索"
          prefix-icon="el-icon-search"
          clearable
          @keyup.enter="handleSearch"
          class="order-search"
        />

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="handleDateChange"
          class="date-range"
        />

        <el-button type="primary" @click="handleSearch" class="search-btn">
          <el-icon><Search /></el-icon>
          <span>搜索</span>
        </el-button>

        <el-button @click="resetFilters" class="reset-btn">
          <el-icon><RefreshRight /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </motion-div>

    <!-- 订单列表主体 -->
    <motion-div
      :initial="{ opacity: 0 }"
      :animate="{ opacity: 1 }"
      :transition="{ duration: 0.6, delay: 0.4 }"
      class="orders-container container mx-auto px-4"
    >
      <!-- 加载中状态 -->
      <div v-if="listLoading" class="loading-container">
        <div class="loading-animation">
          <div class="baby-cart">
            <svg class="baby-cart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
            </svg>
          </div>
        </div>
        <p class="loading-text">正在加载订单数据...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="orderList.length === 0" class="empty-state">
        <div class="empty-illustration">
          <img src="@/assets/baby-empty-state.svg" alt="暂无订单" class="empty-img" @error="handleEmptyImageError" />
        </div>
        <h3 class="empty-title">{{ getEmptyStateText() }}</h3>
        <p class="empty-desc">{{ getEmptyStateDesc() }}</p>
        <el-button type="primary" @click="goShopping" class="shop-btn">
          去逛逛
        </el-button>
      </div>

      <!-- 订单列表 -->
      <transition-group 
        name="order-list" 
        tag="div" 
        class="order-list"
      >
        <div
          v-for="(order, index) in orderList"
          :key="order.orderNo"
          class="order-card"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-date">{{ formatDate(order.createTime) }}</span>
              <span class="order-number">订单号: {{ order.orderNo }}</span>
            </div>
            <div class="order-status">
              <div class="status-tag" :class="getOrderStatusClass(order.status)">
                {{ getOrderStatusText(order.status) }}
              </div>
            </div>
          </div>

          <!-- 订单商品信息 -->
          <div class="order-products">
            <div 
              v-for="(item, itemIndex) in order.products" 
              :key="`${order.orderNo}-${itemIndex}`"
              class="product-item"
            >
              <div class="product-image">
                <el-image 
                  :src="'/products/' + item.productImg" 
                  fit="cover"
                  lazy
                  :preview-src-list="['/products/' + item.productImg]"
                  :initial-index="0"
                  class="product-img" 
                />
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ item.productName }}</h4>
                <p class="product-specs">{{ Array.isArray(item.specs) ? item.specs.join(' · ') : '' }}</p>
              </div>
              <div class="product-price">
                <span class="price">¥{{ formatPrice(item.price) }}</span>
                <span class="quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <!-- 订单信息汇总 -->
          <div class="order-summary">
            <div class="order-total">
              <span>共 {{ getOrderItemsCount(order) }} 件商品</span>
              <span class="total-price">
                实付款: <strong>¥{{ formatPrice(order.actualAmount) }}</strong>
                <span v-if="order.couponAmount && order.couponAmount > 0" class="coupon-discount">
                  (含优惠券: -¥{{ formatPrice(order.couponAmount) }})
                </span>
              </span>
            </div>
            
            <!-- 订单操作按钮 -->
            <div class="order-actions">
              <el-button 
                v-if="['pending_payment', '待支付'].includes(order.status)"
                type="primary" 
                @click="payOrder(order.orderId)"
                class="action-btn primary-btn"
              >
                立即付款
              </el-button>
              
              <el-button 
                v-if="['pending_payment', '待支付', 'pending_shipment'].includes(order.status)"
                @click="cancelOrder(order.orderId)"
                class="action-btn"
              >
                取消订单
              </el-button>
              
              <el-button 
                v-if="order.status === 'pending_receive'"
                type="primary" 
                @click="confirmReceive(order.orderId)"
                class="action-btn primary-btn"
              >
                确认收货
              </el-button>
              
              <el-button 
                v-if="['completed', 'cancelled', 'closed'].includes(order.status)"
                @click="deleteOrder(order.orderId)"
                class="action-btn"
              >
                删除订单
              </el-button>
              
              <el-button 
                @click="viewOrderDetail(order.orderId)"
                class="action-btn detail-btn"
              >
                订单详情
              </el-button>
              
              <el-button 
                v-if="order.status === 'completed'"
                @click="reviewOrder(order)"
                class="action-btn"
              >
                评价订单
              </el-button>
              
              <el-button 
                v-if="order.status === 'completed'"
                @click="rebuyOrder(order)"
                class="action-btn"
              >
                再次购买
              </el-button>
            </div>
          </div>
          
          <!-- 订单进度条 -->
          <div v-if="!['cancelled', 'closed'].includes(order.status)" class="order-progress">
            <div class="progress-track">
              <div 
                class="progress-steps"
                :class="getProgressClass(order.status)"
              ></div>
              
              <div class="progress-milestones">
                <div class="milestone" :class="{ active: true }">
                  <div class="milestone-dot"></div>
                  <div class="milestone-label">下单</div>
                </div>
                
                <div class="milestone" :class="{ active: !['pending_payment', '待支付'].includes(order.status) }">
                  <div class="milestone-dot"></div>
                  <div class="milestone-label">付款</div>
                </div>
                
                <div class="milestone" :class="{ active: ['pending_receive', 'completed'].includes(order.status) }">
                  <div class="milestone-dot"></div>
                  <div class="milestone-label">发货</div>
                </div>
                
                <div class="milestone" :class="{ active: order.status === 'completed' }">
                  <div class="milestone-dot"></div>
                  <div class="milestone-label">收货</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition-group>

      <!-- 分页 -->
      <div class="pagination-container" v-if="orderList.length > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </motion-div>
  </div>
</template>

<script>
export default {
  name: 'OrdersPage'
}
</script>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import MotionDiv from '@/components/MotionDiv.vue'
import { formatDate as formatDateUtil } from '@/utils/date'
import { useOrders } from '@/scripts/Orders.js'
import { 
  ArrowRight, Search, RefreshRight, Delete, View, 
  ShoppingCart, Document, Plus, StarFilled,
  SuccessFilled, GoodsFilled 
} from '@element-plus/icons-vue'

const router = useRouter()
const orderStore = useOrderStore()

const {
  orderList,
  total,
  pageSize,
  currentPage,
  dateRange,
  listLoading,
  orderStats,
  filters,
  orderStatsItems,
  handleTabChange,
  handlePageChange,
  handleDateChange,
  handleSearch,
  resetFilters,
  filterByStatus,
  payOrder,
  cancelOrder,
  confirmReceive,
  deleteOrder,
  viewOrderDetail,
  reviewOrder,
  rebuyOrder,
  goShopping,
  getOrderStatusText,
  getOrderStatusClass,
  getProgressClass,
  formatDate,
  formatPrice,
  getOrderItemsCount,
  getEmptyStateText,
  getEmptyStateDesc,
  handleEmptyImageError,
} = useOrders();

// 从 useOrders 获取 filterTabs
const { filterTabs: resolvedFilterTabs } = useOrders();

// 获取订单数据
const fetchOrders = async () => {
  listLoading.value = true
  
  try {
    console.log('开始获取订单列表，筛选条件:', {
      status: filters.value.status,
      orderNumber: filters.value.orderNumber,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    })
    
    // 获取订单列表
    const result = await orderStore.fetchOrderList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filters.value.status,
      orderNumber: filters.value.orderNumber,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    })
    
    console.log('订单列表返回结果:', {
      count: result.list.length,
      total: result.total
    })
    
    orderList.value = result.list
    total.value = result.total
    
    // 获取订单统计数据
    await fetchOrderStats()
    
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单数据失败，请稍后重试')
  } finally {
    listLoading.value = false
  }
}

// 获取订单统计
const fetchOrderStats = async () => {
  try {
    const stats = await orderStore.fetchOrderStats()
    // 确保返回的stats是一个有效对象，并包含所有必要的属性
    orderStats.value = {
      pendingPayment: stats?.pendingPayment || 0,
      pendingShipment: stats?.pendingShipment || 0,
      pendingReceive: stats?.pendingReceive || 0,
      completed: stats?.completed || 0
    }
  } catch (error) {
    console.error('获取订单统计失败:', error)
    // 确保错误时orderStats保持默认值
    orderStats.value = {
      pendingPayment: 0,
      pendingShipment: 0,
      pendingReceive: 0,
      completed: 0
    }
  }
}

// 生命周期钩子
onMounted(() => {
  fetchOrders()
})
</script>

<style lang="scss">
@import '@/styles/Orders.scss';
</style>
