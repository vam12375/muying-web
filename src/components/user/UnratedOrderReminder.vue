<template>
  <div class="unrated-order-reminder">
    <div v-if="loading" class="reminder-loading">
      <el-skeleton :rows="2" animated />
    </div>
    <div v-else-if="error" class="reminder-error">
      <el-alert
        title="获取未评价订单失败"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
    <div v-else-if="unratedOrders.length === 0" class="reminder-empty">
      <!-- 无未评价订单时不显示任何内容 -->
    </div>
    <div v-else class="reminder-content">
      <el-card shadow="hover">
        <template #header>
          <div class="reminder-header">
            <h3 class="reminder-title">
              <el-icon><Bell /></el-icon>
              评价提醒
            </h3>
            <el-tag type="warning" size="small" effect="light">
              {{ unratedOrders.length }}个待评价订单
            </el-tag>
          </div>
        </template>
        <div class="reminder-body">
          <p class="reminder-text">您有{{ unratedOrders.length }}个订单尚未评价，完成评价可获得积分奖励！</p>
          <div class="reminder-orders">
            <el-scrollbar max-height="200px">
              <div
                v-for="order in unratedOrders"
                :key="order.orderId"
                class="reminder-order-item"
              >
                <div class="order-info">
                  <div class="order-no">订单号: {{ order.orderNo }}</div>
                  <div class="order-date">{{ formatDate(order.completionTime) }}</div>
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click="goToReview(order.orderId)"
                >
                  去评价
                </el-button>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getUnratedOrders } from '@/api/comment'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const error = ref(false)
const unratedOrders = ref([])

// 获取未评价订单
const fetchUnratedOrders = async () => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  loading.value = true
  error.value = false
  
  try {
    const res = await getUnratedOrders(userStore.id)
    if (res.code === 200 && res.data) {
      unratedOrders.value = res.data.slice(0, 5) // 最多显示5个
    } else {
      throw new Error(res.message || '获取未评价订单失败')
    }
  } catch (err) {
    console.error('获取未评价订单失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 跳转到评价页面
const goToReview = (orderId) => {
  router.push(`/review/order/${orderId}`)
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 组件挂载时获取未评价订单
onMounted(() => {
  fetchUnratedOrders()
})
</script>

<style lang="scss" scoped>
.unrated-order-reminder {
  margin-bottom: 20px;
  
  .reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .reminder-title {
      margin: 0;
      font-size: 16px;
      display: flex;
      align-items: center;
      
      .el-icon {
        margin-right: 8px;
        color: #e6a23c;
      }
    }
  }
  
  .reminder-body {
    .reminder-text {
      margin-top: 0;
      margin-bottom: 15px;
      color: #606266;
    }
    
    .reminder-orders {
      .reminder-order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #ebeef5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .order-info {
          .order-no {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .order-date {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style> 