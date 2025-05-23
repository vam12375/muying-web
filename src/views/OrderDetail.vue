<template>
  <div class="order-detail-page container mx-auto px-4">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">订单详情</h1>
      <div class="back-link" @click="goBack">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
        <span>返回订单列表</span>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <div v-else>
      <!-- 订单状态卡片 -->
      <div class="status-card">
        <div class="card-header">
          <span>订单状态</span>
          <div class="status-tag" :class="'status-' + orderDetail.status">
            {{ getOrderStatusText(orderDetail.status) }}
          </div>
        </div>
        
        <!-- 订单进度条 -->
        <div v-if="!['cancelled', 'closed'].includes(orderDetail.status)" class="order-progress">
          <div class="progress-track">
            <div 
              class="progress-steps"
              :class="getProgressClass(orderDetail.status)"
            ></div>
            
            <div class="progress-milestones">
              <div class="milestone" :class="{ active: true }">
                <div class="milestone-dot"></div>
                <div class="milestone-label">下单</div>
              </div>
              
              <div class="milestone" :class="{ active: !['pending_payment', '待支付'].includes(orderDetail.status) }">
                <div class="milestone-dot"></div>
                <div class="milestone-label">付款</div>
              </div>
              
              <div class="milestone" :class="{ active: ['pending_receive', 'shipped', 'completed'].includes(orderDetail.status) }">
                <div class="milestone-dot"></div>
                <div class="milestone-label">发货</div>
              </div>
              
              <div class="milestone" :class="{ active: orderDetail.status === 'completed' }">
                <div class="milestone-dot"></div>
                <div class="milestone-label">收货</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单基本信息 -->
      <div class="detail-section">
        <div class="section-header">订单信息</div>
        <div class="section-content">
          <div class="order-info">
            <div class="info-item">
              <div class="info-label">订单编号</div>
              <div class="info-value">{{ orderDetail.orderNo }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">下单时间</div>
              <div class="info-value">{{ formatDate(orderDetail.createTime) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">支付方式</div>
              <div class="info-value">{{ getPaymentMethodText(orderDetail.paymentMethod) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">支付时间</div>
              <div class="info-value">{{ orderDetail.payTime ? formatDate(orderDetail.payTime) : '-' }}</div>
            </div>
            <div class="info-item" v-if="orderDetail.shippingTime">
              <div class="info-label">发货时间</div>
              <div class="info-value">{{ formatDate(orderDetail.shippingTime) }}</div>
            </div>
            <div class="info-item" v-if="orderDetail.completionTime">
              <div class="info-label">完成时间</div>
              <div class="info-value">{{ formatDate(orderDetail.completionTime) }}</div>
            </div>
            <div class="info-item" v-if="orderDetail.cancelTime">
              <div class="info-label">取消时间</div>
              <div class="info-value">{{ formatDate(orderDetail.cancelTime) }}</div>
            </div>
            <div class="info-item" v-if="orderDetail.remark">
              <div class="info-label">订单备注</div>
              <div class="info-value">{{ orderDetail.remark }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 收货信息 -->
      <div class="detail-section">
        <div class="section-header">收货信息</div>
        <div class="section-content">
          <div class="order-info">
            <div class="info-item">
              <div class="info-label">收货人</div>
              <div class="info-value">{{ orderDetail.receiverName }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">联系电话</div>
              <div class="info-value">{{ orderDetail.receiverPhone }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">收货地址</div>
              <div class="info-value">
                {{ `${orderDetail.receiverProvince} ${orderDetail.receiverCity} ${orderDetail.receiverDistrict} ${orderDetail.receiverAddress}` }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品信息 -->
      <div class="detail-section">
        <div class="section-header">商品信息</div>
        <div class="section-content">
          <div class="product-list">
            <div 
              v-for="(product, index) in orderDetail.products" 
              :key="`${orderDetail.orderNo}-${index}`"
              class="product-item"
            >
              <div class="product-image">
                <img :src="'/products/' + product.productImg" :alt="product.productName" />
              </div>
              <div class="product-info">
                <h4 class="product-name">{{ product.productName }}</h4>
                <p class="product-specs">{{ Array.isArray(product.specs) ? product.specs.join(' · ') : '' }}</p>
              </div>
              <div class="product-price">
                <span class="price">¥{{ formatPrice(product.price) }}</span>
                <span class="quantity">x{{ product.quantity }}</span>
              </div>
            </div>
          </div>
          
          <!-- 订单金额信息 -->
          <div class="order-amount">
            <div class="amount-item">
              <span class="amount-label">商品总价：</span>
              <span class="amount-value">¥{{ formatPrice(orderDetail.totalAmount) }}</span>
            </div>
            <div class="amount-item">
              <span class="amount-label">运费：</span>
              <span class="amount-value">¥{{ formatPrice(calculatedShippingFee) }}</span>
              <el-tooltip content="订单金额满99元免运费，否则收取10元运费" placement="top">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="amount-item" v-if="orderDetail.couponAmount">
              <span class="amount-label">优惠券：</span>
              <span class="amount-value">-¥{{ formatPrice(orderDetail.couponAmount) }}</span>
            </div>
            <div class="amount-item" v-if="orderDetail.pointsDiscount">
              <span class="amount-label">积分抵扣：</span>
              <span class="amount-value">-¥{{ formatPrice(orderDetail.pointsDiscount) }}</span>
            </div>
            <div class="amount-item" v-if="orderDetail.discountAmount">
              <span class="amount-label">其他优惠：</span>
              <span class="amount-value">-¥{{ formatPrice(orderDetail.discountAmount) }}</span>
            </div>
            <div class="amount-item total">
              <span class="amount-label">实付金额：</span>
              <span class="amount-value">¥{{ formatPrice(calculatedActualAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 物流信息 (仅当订单已发货或已完成时显示) -->
      <div 
        v-if="['shipped', 'completed', 'pending_receive'].includes(orderDetail.status) || showLogistics"
        class="detail-section logistics-section"
      >
        <div class="section-header">
          <div class="logistics-header">
            <span>物流信息</span>
            <div class="refresh-controls">
              <span v-if="isAutoRefreshing" class="auto-refresh-indicator">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>每5分钟自动刷新</span>
              </span>
              <el-button 
                type="primary" 
                size="small" 
                @click="fetchLogisticsInfo" 
                :loading="logisticsLoading"
                class="refresh-button"
              >
                手动刷新
              </el-button>
            </div>
          </div>
        </div>
        <div class="section-content">
          <!-- 物流信息加载中 -->
          <div v-if="logisticsLoading" class="logistics-loading">
            <el-skeleton :rows="3" animated />
          </div>
          
          <!-- 无物流信息 -->
          <div v-else-if="!logisticsInfo" class="logistics-empty">
            <el-empty description="暂无物流信息" :image-size="100" />
          </div>
          
          <!-- 物流信息内容 -->
          <div v-else>
            <div class="logistics-info">
              <div class="info-item">
                <div class="info-label">物流公司</div>
                <div class="info-value">{{ logisticsInfo.company?.name || orderDetail.shippingCompany || '-' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">物流单号</div>
                <div class="info-value">{{ logisticsInfo.trackingNo || orderDetail.trackingNo || '-' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">发货时间</div>
                <div class="info-value">{{ formatDate(logisticsInfo.shippingTime || orderDetail.shippingTime) }}</div>
              </div>
              <div class="info-item" v-if="logisticsInfo.deliveryTime">
                <div class="info-label">送达时间</div>
                <div class="info-value">{{ formatDate(logisticsInfo.deliveryTime) }}</div>
              </div>
            </div>
            
            <div v-if="logisticsInfo.status" class="logistics-status">
              <div class="status-text">
                <div class="status-dot" :style="{backgroundColor: getStatusColor(logisticsInfo.status)}"></div>
                <div class="status-info">
                  {{ getLogisticsStatusText(logisticsInfo.status) }}
                </div>
              </div>
            </div>
            
            <div class="logistics-tracks">
              <div class="track-title">
                物流轨迹
                <el-button 
                  v-if="['shipped', 'pending_receive'].includes(orderDetail.status)" 
                  type="primary" 
                  size="small" 
                  circle 
                  icon="RefreshRight" 
                  @click="fetchLogisticsInfo" 
                  :loading="logisticsLoading" 
                  class="refresh-btn"
                ></el-button>
              </div>
              <logistics-track-timeline :tracks="logisticsInfo.tracks || []" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 订单操作按钮 -->
      <div class="order-actions">
        <el-button 
          v-if="['pending_payment', '待支付'].includes(orderDetail.status)"
          type="primary" 
          @click="payOrder"
        >
          立即付款
        </el-button>
        
        <el-button 
          v-if="['pending_payment', '待支付', 'pending_shipment'].includes(orderDetail.status)"
          @click="cancelOrder"
        >
          取消订单
        </el-button>
        
        <el-button 
          v-if="orderDetail.status === 'pending_shipment'"
          type="warning" 
          @click="openExpediteDialog"
        >
          催发货
        </el-button>
        
        <el-button 
          v-if="['pending_receive', 'shipped'].includes(orderDetail.status)"
          type="success" 
          @click="confirmReceive"
        >
          确认收货
        </el-button>
        
        <el-button 
          v-if="canRefund(orderDetail.status) && !hasActiveRefund"
          type="warning" 
          @click="openRefundDialog"
        >
          申请退款
        </el-button>
        
        <el-button 
          v-if="hasActiveRefund"
          type="info" 
          @click="viewRefundStatus"
        >
          查看退款
        </el-button>
        
        <el-button 
          v-if="orderDetail.status === 'completed' && !orderDetail.isCommented"
          type="primary" 
          @click="goToReview"
        >
          评价订单
        </el-button>
        
        <el-button 
          v-if="orderDetail.status === 'completed' && orderDetail.isCommented"
          @click="viewComments"
        >
          查看评价
        </el-button>
        
        <el-button 
          v-if="['completed', 'cancelled', 'closed'].includes(orderDetail.status)"
          @click="deleteOrder"
        >
          删除订单
        </el-button>
      </div>
      
      <!-- 评价区域 (仅当订单已完成时显示) -->
      <div 
        v-if="orderDetail.status === 'completed'"
        class="detail-section review-section"
      >
        <div class="section-header">
          <span>订单评价</span>
        </div>
        <div class="section-content">
          <!-- 未评价状态 -->
          <div v-if="!orderDetail.isCommented" class="review-empty">
            <el-empty description="您还未评价此订单" :image-size="100">
              <template #description>
                <p>评价订单可获得积分奖励，分享您的购物体验吧！</p>
              </template>
              <el-button type="primary" @click="goToReview">去评价</el-button>
            </el-empty>
          </div>
          
          <!-- 已评价状态 -->
          <div v-else class="review-completed">
            <el-result
              icon="success"
              title="已完成评价"
              sub-title="感谢您的评价，您的反馈对我们非常重要"
            >
              <template #extra>
                <el-button type="primary" @click="viewComments">查看评价</el-button>
              </template>
            </el-result>
          </div>
        </div>
      </div>
    </div>
  
    <!-- 添加退款申请弹窗 -->
    <el-dialog
      v-model="refundDialogVisible"
      title="申请退款"
      width="500px"
      destroy-on-close
    >
      <el-form :model="refundForm" :rules="refundRules" ref="refundFormRef" label-width="100px">
        <el-form-item label="退款金额" prop="amount">
          <el-input-number 
            v-model="refundForm.amount" 
            :min="0.01" 
            :max="orderDetail.actualAmount" 
            :precision="2" 
            :step="0.01"
            style="width: 100%;"
          />
          <div class="form-tip">最多可退 ¥{{ formatPrice(orderDetail.actualAmount) }}</div>
        </el-form-item>
        
        <el-form-item label="退款原因" prop="reason">
          <el-select v-model="refundForm.reason" placeholder="请选择退款原因" style="width: 100%;">
            <el-option label="商品质量问题" value="商品质量问题" />
            <el-option label="商品不符合描述" value="商品不符合描述" />
            <el-option label="发货太慢" value="发货太慢" />
            <el-option label="不想要了" value="不想要了" />
            <el-option label="其他原因" value="其他原因" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="详细说明" prop="reasonDetail">
          <el-input 
            v-model="refundForm.reasonDetail" 
            type="textarea" 
            :rows="3" 
            placeholder="请详细描述您的退款原因"
          />
        </el-form-item>
        
        <el-form-item label="上传凭证">
          <el-upload
            action=""
            list-type="picture-card"
            :auto-upload="false"
            :file-list="refundForm.evidenceFiles"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">最多上传3张凭证图片（选填）</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="refundDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRefund" :loading="refundSubmitting">提交申请</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 退款状态弹窗 -->
    <el-dialog
      v-model="refundStatusDialogVisible"
      title="退款申请状态"
      width="500px"
      destroy-on-close
    >
      <div v-if="refundDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="退款单号">{{ refundDetail.refundNo }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ formatDate(refundDetail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="退款金额">¥{{ formatPrice(refundDetail.amount) }}</el-descriptions-item>
          <el-descriptions-item label="退款原因">{{ refundDetail.refundReason }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getRefundStatusType(refundDetail.status)">
              {{ getRefundStatusText(refundDetail.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="refund-actions" v-if="refundDetail.status === 'PENDING'">
          <el-button type="danger" @click="handleCancelRefund" :loading="cancellingRefund">取消申请</el-button>
        </div>
      </div>
      <div v-else class="loading-container">
        <div class="error-message" v-if="refundLoadError">
          <el-alert
            :title="refundLoadError"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>如果您确实已申请了退款，请尝试：</p>
              <ol>
                <li>点击"申请退款"按钮创建退款申请</li>
                <li>稍后再试</li>
                <li>联系客服获取帮助</li>
              </ol>
            </template>
          </el-alert>
        </div>
        <el-skeleton v-else :rows="5" animated />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ArrowLeft, RefreshRight, InfoFilled, Plus, Loading } from '@element-plus/icons-vue'
import { useOrderDetail } from '@/scripts/OrderDetail'
import LogisticsTrackTimeline from '@/components/LogisticsTrackTimeline.vue'
import { useRouter } from 'vue-router'
import { getOrderComments } from '@/api/comment'
import { ElMessage } from 'element-plus'

// 定义props接收从路由中传递的orderId
const props = defineProps({
  orderId: {
    type: [String, Number],
    default: null
  }
})

const router = useRouter()

// 使用订单详情相关逻辑
const {
  orderId,
  orderDetail,
  loading,
  logisticsInfo,
  logisticsLoading,
  showLogistics,
  expediteDialogVisible,
  expediteForm,
  expediteLoading,
  calculatedShippingFee,  // 从useOrderDetail中获取计算得到的运费
  calculatedActualAmount, // 从useOrderDetail中获取计算得到的实际支付金额
  fetchOrderDetail,
  fetchLogisticsInfo,
  submitExpediteRequest,
  openExpediteDialog,
  formatDate,
  formatPrice,
  payOrder,
  cancelOrder,
  confirmReceive,
  deleteOrder,
  goBack,
  getOrderStatusText,
  getLogisticsStatusText,
  getStatusColor,
  clearAutoRefresh,  // 添加clearAutoRefresh函数
  canRefund,
  hasActiveRefund,
  openRefundDialog,
  viewRefundStatus,
  refundDialogVisible,
  refundStatusDialogVisible,
  refundDetail,
  refundSubmitting,
  getRefundStatusType,
  getRefundStatusText,
  cancellingRefund,
  isAutoRefreshing,
  refundForm,
  refundRules,
  refundLoadError,
  submitRefund,  // 添加submitRefund函数
  cancelRefund   // 添加cancelRefund函数
} = useOrderDetail()

// 前往评价页面
const goToReview = () => {
  router.push(`/review/order/${orderId.value}`)
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

// 组件挂载时获取订单详情
onMounted(() => {
  fetchOrderDetail()
})

// 组件卸载前清除自动刷新
onBeforeUnmount(() => {
  clearAutoRefresh()
})

// 获取支付方式文本
const getPaymentMethodText = (paymentMethod) => {
  // 如果是对象，尝试获取对象中的名称属性
  if (paymentMethod && typeof paymentMethod === 'object') {
    return paymentMethod.name || paymentMethod.type || JSON.stringify(paymentMethod);
  }
  
  // 如果是字符串，映射到对应的中文名称
  const methodMap = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'bank_transfer': '银行转账',
    'cash': '货到付款',
    'points': '积分支付'
  };
  
  return methodMap[paymentMethod] || paymentMethod || '未知';
};

// 获取订单进度条类
const getProgressClass = (status) => {
  const classMap = {
    'pending_payment': 'progress-step-1',
    'pending_shipment': 'progress-step-2',
    'pending_receive': 'progress-step-3',
    'completed': 'progress-step-4'
  }
  return classMap[status] || ''
}

// 退款表单引用
const refundFormRef = ref(null)

// 处理文件上传和移除
const handleFileChange = (file) => {
  // 确保文件是图片
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 确保文件大小小于2MB
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  
  return true
}

const handleFileRemove = (file) => {
  // 从文件列表中移除
  const index = refundForm.evidenceFiles.indexOf(file)
  if (index !== -1) {
    refundForm.evidenceFiles.splice(index, 1)
  }
}

// 提交退款申请
const handleSubmitRefund = () => {
  refundFormRef.value.validate((valid) => {
    if (valid) {
      submitRefund(refundFormRef.value)
    } else {
      return false
    }
  })
}

// 取消退款申请
const handleCancelRefund = () => {
  cancelRefund()
}
</script>

<style lang="scss">
@import '@/styles/OrderDetail.scss';

.logistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.refresh-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auto-refresh-indicator {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #409EFF;
}

.auto-refresh-indicator .el-icon {
  margin-right: 5px;
}
</style> 