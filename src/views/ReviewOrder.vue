<template>
  <div class="review-order-page">
    <div class="container mx-auto px-4 py-6">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">订单评价</h1>
        <p class="page-subtitle">感谢您的购买，请对订单商品进行评价</p>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-empty description="加载订单信息失败" :image-size="200">
          <template #description>
            <p>{{ errorMessage || '该订单可能不存在或已被删除' }}</p>
          </template>
          <el-button type="primary" @click="goBack">返回订单列表</el-button>
        </el-empty>
      </div>

      <!-- 已评价状态 -->
      <div v-else-if="isCommented" class="commented-container">
        <el-result
          icon="success"
          title="订单已评价"
          sub-title="感谢您的评价，您的反馈对我们非常重要"
        >
          <template #extra>
            <el-button type="primary" @click="goBack">返回订单列表</el-button>
            <el-button @click="viewComments">查看评价</el-button>
          </template>
        </el-result>
      </div>

      <!-- 评价表单 -->
      <div v-else-if="order" class="review-content">
        <!-- 订单信息 -->
        <div class="order-info">
          <el-descriptions title="订单信息" :column="1" border>
            <el-descriptions-item label="订单编号">{{ order.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(order.createTime) }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">¥{{ formatPrice(order.actualAmount) }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 商品列表 -->
        <div class="order-products">
          <h2 class="section-title">商品信息</h2>
          <el-table :data="order.products" stripe style="width: 100%">
            <el-table-column label="商品图片" width="120">
              <template #default="scope">
                <el-image 
                  :src="getImageUrl(scope.row.productImg)" 
                  fit="cover"
                  style="width: 80px; height: 80px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ formatPrice(scope.row.price) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="showReviewForm(scope.row)"
                >
                  评价
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 评价表单对话框 -->
        <el-dialog
          v-model="dialogVisible"
          title="商品评价"
          width="600px"
          :before-close="handleDialogClose"
        >
          <div v-if="selectedProduct" class="selected-product">
            <div class="product-info">
              <el-image 
                :src="getImageUrl(selectedProduct.productImg)" 
                fit="cover"
                style="width: 80px; height: 80px"
              />
              <div class="product-details">
                <h3>{{ selectedProduct.productName }}</h3>
                <p>¥{{ formatPrice(selectedProduct.price) }} x {{ selectedProduct.quantity }}</p>
              </div>
            </div>
          </div>
          
          <comment-form 
            v-if="selectedProduct"
            :product-id="selectedProduct.productId"
            :order-id="orderId"
            :user-id="userId"
            @success="handleReviewSuccess"
            @cancel="handleDialogClose"
          />
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommentForm from '@/components/comment/CommentForm.vue'
import { getOrderDetail } from '@/api/order'
import { checkOrderCommentStatus, getOrderComments } from '@/api/comment'
import { getUserInfo } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

// 获取订单ID
const orderId = computed(() => Number(route.params.orderId))
// 从auth.js中获取当前登录用户的ID
const userId = ref(Number(getUserInfo().userId || 0))

// 状态变量
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const order = ref(null)
const isCommented = ref(false)
const dialogVisible = ref(false)
const selectedProduct = ref(null)

// 获取订单详情
const fetchOrderDetail = async () => {
  loading.value = true
  error.value = false
  
  try {
    // 检查订单是否已评价
    const commentStatusRes = await checkOrderCommentStatus(orderId.value)
    if (commentStatusRes.data) {
      isCommented.value = true
      loading.value = false
      return
    }
    
    // 获取订单详情
    const orderRes = await getOrderDetail(orderId.value)
    if (orderRes.code === 200 && orderRes.data) {
      order.value = orderRes.data
    } else {
      throw new Error(orderRes.message || '获取订单详情失败')
    }
  } catch (err) {
    console.error('获取订单详情失败:', err)
    error.value = true
    errorMessage.value = err.message || '获取订单详情失败'
  } finally {
    loading.value = false
  }
}

// 显示评价表单
const showReviewForm = (product) => {
  selectedProduct.value = product
  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  selectedProduct.value = null
}

// 评价成功处理
const handleReviewSuccess = () => {
  dialogVisible.value = false
  ElMessage.success('评价提交成功')
  // 重新检查订单评价状态
  checkOrderCommentStatus(orderId.value).then(res => {
    if (res.data) {
      isCommented.value = true
    }
  })
}

// 返回订单列表
const goBack = () => {
  router.push('/orders')
}

// 查看评价
const viewComments = async () => {
  try {
    const res = await getOrderComments(orderId.value)
    if (res.code === 200 && res.data && res.data.length > 0) {
      // 跳转到商品详情页的评价区域
      const productId = res.data[0].productId
      router.push(`/product/${productId}#product-comments`)
    } else {
      ElMessage.info('暂无评价信息')
    }
  } catch (err) {
    console.error('获取评价失败:', err)
    ElMessage.error('获取评价信息失败')
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 格式化价格
const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

// 获取图片URL
const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `/products/${path}`
}

// 生命周期钩子
onMounted(() => {
  if (orderId.value) {
    fetchOrderDetail()
  } else {
    error.value = true
    errorMessage.value = '订单ID无效'
    loading.value = false
  }
})
</script>

<style scoped>
.review-order-page {
  min-height: 80vh;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.page-subtitle {
  font-size: 1rem;
  color: #666;
}

.loading-container,
.error-container,
.commented-container {
  margin: 2rem 0;
  padding: 2rem;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.review-content {
  margin: 2rem 0;
}

.order-info {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.order-products {
  margin-bottom: 2rem;
}

.selected-product {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-details {
  margin-left: 1rem;
}

.product-details h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.product-details p {
  font-size: 0.9rem;
  color: #666;
}
</style> 