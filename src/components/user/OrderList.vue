<template>
  <div class="order-list-container">
    <div class="section-header">
      <h2 class="section-title">我的订单</h2>
    </div>
    
    <div class="order-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部订单" name="all"></el-tab-pane>
        <el-tab-pane label="待付款" name="pending_payment"></el-tab-pane>
        <el-tab-pane label="待发货" name="pending_shipment"></el-tab-pane>
        <el-tab-pane label="待收货" name="pending_receive"></el-tab-pane>
        <el-tab-pane label="已完成" name="completed"></el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="订单号/商品名称"
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="searchOrders">搜索</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-container">
      <el-empty description="暂无订单"></el-empty>
    </div>
    
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.orderId" class="order-item">
        <div class="order-header">
          <div class="order-info">
            <span class="order-date">{{ order.createTime }}</span>
            <span class="order-number">订单号：{{ order.orderNo }}</span>
          </div>
          <div class="order-status" :class="getStatusClass(order.status)">
            {{ getStatusText(order.status) }}
          </div>
        </div>
        
        <div class="order-products">
          <div v-for="(product, index) in order.products" :key="index" class="product-item">
            <div class="product-image">
              <img :src="product.productImg ? `/products/${product.productImg.replace(/^.*[\\\/]/, '')}` : ''" :alt="product.productName">
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.productName }}</div>
              <div class="product-attrs" v-if="product.specs">{{ formatSpecs(product.specs) }}</div>
            </div>
            <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
            <div class="product-quantity">x{{ product.quantity }}</div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            共 {{ getTotalQuantity(order) }} 件商品，总计：
            <span class="price">¥{{ getTotalAmount(order).toFixed(2) }}</span>
            （含运费 ¥{{ order.shippingFee ? order.shippingFee.toFixed(2) : '0.00' }}）
          </div>
          
          <div class="order-actions">
            <el-button 
              v-if="['pending_payment', '待支付'].includes(order.status)"
              type="primary" 
              size="small"
              @click="payOrder(order)"
            >
              立即付款
            </el-button>
            <el-button 
              v-if="order.status === 'pending_receive' || order.status === 'shipped'" 
              type="success" 
              size="small"
              @click="confirmReceipt(order)"
            >
              确认收货
            </el-button>
            <el-button 
              v-if="order.status === 'completed'" 
              type="primary" 
              size="small"
              @click="reviewOrder(order)"
            >
              评价
            </el-button>
            <el-button 
              v-if="['pending_payment', '待支付', 'pending_shipment'].includes(order.status)"
              size="small"
              @click="cancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button 
              size="small"
              @click="viewOrderDetail(order)"
            >
              订单详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination-container">
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderList'
}
</script>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const orderStore = useOrderStore()

// 状态
const activeTab = ref('all')
const searchKeyword = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const orders = ref([])
const total = computed(() => orderStore.total)

// 监听标签页变化，重新加载订单
watch(activeTab, () => {
  currentPage.value = 1
  loadOrders()
})

onMounted(() => {
  loadOrders()
})

// 加载订单数据
const loadOrders = async () => {
  loading.value = true
  try {
    const status = activeTab.value === 'all' ? '' : activeTab.value
    const result = await orderStore.fetchOrderList({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: status,
      orderNumber: searchKeyword.value.trim()
    })
    
    orders.value = result.list
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1
  loadOrders()
}

// 获取订单状态文本
const getStatusText = (status) => {
  return orderStore.getOrderStatusText(status)
}

// 获取订单状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'pending_payment': 'status-pending',
    '待支付': 'status-pending',
    'pending_shipment': 'status-processing',
    'shipped': 'status-shipped',
    'pending_receive': 'status-shipped',
    'completed': 'status-delivered',
    'cancelled': 'status-cancelled'
  }
  return classMap[status] || ''
}

// 格式化规格信息
const formatSpecs = (specs) => {
  if (!specs) return ''
  try {
    if (typeof specs === 'string') {
      specs = JSON.parse(specs)
    }
    return Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')
  } catch (e) {
    return JSON.stringify(specs)
  }
}

// 获取订单商品总数量
const getTotalQuantity = (order) => {
  if (!order.products || !Array.isArray(order.products)) return 0
  return order.products.reduce((sum, product) => sum + (product.quantity || 0), 0)
}

// 获取订单总金额
const getTotalAmount = (order) => {
  return parseFloat(order.actualAmount || order.totalAmount || 0)
}

// 付款
const payOrder = async (order) => {
  ElMessageBox.confirm(
    `确认支付订单 ${order.orderNo}?`,
    '支付确认',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const success = await orderStore.payOrder(order.orderId, {})
      if (success) {
        await loadOrders()
      }
    })
    .catch(() => {})
}

// 确认收货
const confirmReceipt = async (order) => {
  ElMessageBox.confirm(
    '确认已收到货物吗？',
    '确认收货',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(async () => {
      const success = await orderStore.confirmReceive(order.orderId)
      if (success) {
        await loadOrders()
      }
    })
    .catch(() => {})
}

// 评价订单
const reviewOrder = (order) => {
  router.push(`/order/${order.orderId}/review`)
}

// 取消订单
const cancelOrder = async (order) => {
  ElMessageBox.prompt(
    '请输入取消原因：',
    '取消订单',
    {
      confirmButtonText: '确认',
      cancelButtonText: '返回',
      inputPattern: /\S+/,
      inputErrorMessage: '取消原因不能为空',
      type: 'warning',
    }
  )
    .then(async ({ value: reason }) => {
      const success = await orderStore.cancelOrder(order.orderId, reason)
      if (success) {
        await loadOrders()
      }
    })
    .catch(() => {})
}

// 查看订单详情
const viewOrderDetail = (order) => {
  router.push(`/order/${order.orderId}`)
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  loadOrders()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadOrders()
}
</script>

<style src="@/styles/user/OrderList.scss" scoped></style>