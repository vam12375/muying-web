import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { getShippingInfo } from '@/api/order'
import { getLogisticsByOrderId, queryLogisticsInfo, requestExpediteShipping } from '@/api/logistics'
import { formatDate as formatDateUtil } from '@/utils/date'
import { getStatusCode } from '@/utils/orderStatusMapper'

export function useOrderDetail() {
  const router = useRouter()
  const route = useRoute()
  const orderStore = useOrderStore()
  
  // 订单ID
  const orderId = computed(() => route.params.orderId || '')
  
  // 订单详情
  const orderDetail = ref(null)
  const loading = ref(true)
  
  // 物流信息
  const logisticsInfo = ref(null)
  const logisticsLoading = ref(false)
  const showLogistics = ref(false)
  const refreshInterval = ref(null)
  
  // 催发货弹窗
  const expediteDialogVisible = ref(false)
  const expediteForm = reactive({
    remark: ''
  })
  const expediteLoading = ref(false)
  
  // 计算实际运费 - 根据订单金额动态计算
  const calculatedShippingFee = computed(() => {
    if (!orderDetail.value) return 0;
    
    // 订单金额低于99元收取10元运费，否则免运费
    return orderDetail.value.totalAmount < 99 ? 10 : 0;
  });
  
  // 计算实际支付金额（包含运费）
  const calculatedActualAmount = computed(() => {
    if (!orderDetail.value) return 0;
    
    // 基础金额
    let amount = orderDetail.value.totalAmount;
    
    // 加上运费
    amount += calculatedShippingFee.value;
    
    // 减去优惠券金额
    if (orderDetail.value.couponAmount) {
      amount -= orderDetail.value.couponAmount;
    }
    
    // 减去积分抵扣
    if (orderDetail.value.pointsDiscount) {
      amount -= orderDetail.value.pointsDiscount;
    }
    
    // 减去其他优惠
    if (orderDetail.value.discountAmount) {
      amount -= orderDetail.value.discountAmount;
    }
    
    return amount > 0 ? amount : 0;
  });
  
  // 获取订单详情
  const fetchOrderDetail = async () => {
    if (!orderId.value) {
      ElMessage.error('订单ID不能为空')
      router.push('/orders')
      return
    }
    
    loading.value = true
    
    try {
      const result = await orderStore.fetchOrderDetail(orderId.value)
      
      if (result) {
        orderDetail.value = result
        
        // 如果订单状态为已发货或已完成，自动获取物流信息
        if (['shipped', 'completed', 'pending_receive'].includes(result.status)) {
          fetchLogisticsInfo()
        }
      } else {
        ElMessage.error('订单不存在或已被删除')
        router.push('/orders')
      }
    } catch (error) {
      console.error('获取订单详情失败:', error)
      ElMessage.error('获取订单详情失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }
  
  // 获取物流信息
  const fetchLogisticsInfo = async () => {
    if (!orderId.value) return
    
    logisticsLoading.value = true
    
    try {
      // 首先尝试通过订单ID获取物流信息
      const res = await getLogisticsByOrderId(orderId.value)
      
      if (res.code === 200 && res.data) {
        logisticsInfo.value = res.data
        showLogistics.value = true
        
        // 如果物流状态不是已送达，则设置自动刷新
        if (logisticsInfo.value.status !== 'DELIVERED') {
          setupAutoRefresh()
        } else {
          clearAutoRefresh()
        }
      } else {
        // 如果通过订单ID无法获取，尝试通过订单的物流信息获取
        const shippingRes = await getShippingInfo(orderId.value)
        
        if (shippingRes.code === 200 && shippingRes.data) {
          // 如果有物流单号和物流公司，通过物流单号查询
          if (shippingRes.data.trackingNo && shippingRes.data.companyCode) {
            const queryRes = await queryLogisticsInfo(
              shippingRes.data.trackingNo,
              shippingRes.data.companyCode
            )
            
            if (queryRes.code === 200 && queryRes.data) {
              logisticsInfo.value = queryRes.data
              showLogistics.value = true
            }
          }
        }
      }
    } catch (error) {
      console.error('获取物流信息失败:', error)
      ElMessage.warning('获取物流信息失败，请稍后重试')
    } finally {
      logisticsLoading.value = false
    }
  }
  
  // 设置自动刷新
  const setupAutoRefresh = () => {
    // 清除现有的定时器
    clearAutoRefresh()
    
    // 设置新的定时器，每10秒刷新一次物流信息
    refreshInterval.value = setInterval(() => {
      console.log('自动刷新物流信息...')
      fetchLogisticsInfo()
    }, 10000) // 10秒刷新一次
  }
  
  // 清除自动刷新
  const clearAutoRefresh = () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
  
  // 提交催发货请求
  const submitExpediteRequest = async () => {
    // 不再需要检查是否填写催发货原因
    
    expediteLoading.value = true
    ElMessage.info('正在提交催发货请求...')
    
    try {
      const res = await requestExpediteShipping(orderId.value, expediteForm.remark)
      
      if (res.code === 200) {
        ElMessage.success('催发货请求已提交，卖家将尽快为您处理')
        expediteDialogVisible.value = false
        // 不需要重置remark，因为每次都会自动设置
      } else {
        // 针对特定错误提供更友好的提示
        if (res.message === '当前订单状态不可催发货') {
          ElMessage.warning('只有待发货状态的订单才能催发货')
        } else {
          ElMessage.error(res.message || '催发货请求提交失败')
        }
      }
    } catch (error) {
      console.error('提交催发货请求失败:', error)
      
      // 针对特定错误提供更友好的提示
      if (error.message === '当前订单状态不可催发货') {
        ElMessage.warning('只有待发货状态的订单才能催发货')
      } else {
        ElMessage.error('催发货请求提交失败，请稍后重试')
      }
    } finally {
      expediteLoading.value = false
    }
  }
  
  // 打开催发货弹窗
  const openExpediteDialog = () => {
    // 检查订单状态是否允许催发货
    // 后端验证订单状态为"PENDING_SHIPMENT"，这对应前端的"pending_shipment"/"待发货"状态
    
    // 从状态映射中获取状态码
    const statusCode = getStatusCode(orderDetail.value.status);
    const isWaitingShipment = statusCode === 1; // 待发货状态码为1
    
    if (!orderDetail.value || !isWaitingShipment) {
      ElMessage.warning('当前订单状态不可催发货，只有待发货状态的订单才能催发货');
      return;
    }
    
    // 自动填充催发货原因并提交
    expediteForm.remark = `对订单 ORDER${orderDetail.value.orderNo} 的提醒发货请求已收到，商家将尽快处理。`
    submitExpediteRequest();
  }
  
  // 格式化日期
  const formatDate = (dateStr) => {
    return formatDateUtil(dateStr, 'YYYY-MM-DD HH:mm:ss')
  }
  
  // 格式化价格
  const formatPrice = (price) => {
    return Number(price).toFixed(2)
  }
  
  // 支付订单
  const payOrder = () => {
    if (!orderId.value) return
    router.push(`/payment/${orderId.value}`)
  }
  
  // 取消订单
  const cancelOrder = async () => {
    if (!orderId.value) return
    
    try {
      await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await orderStore.cancelOrder(orderId.value)
      ElMessage.success('订单已取消')
      fetchOrderDetail()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请稍后重试')
      }
    }
  }
  
  // 确认收货
  const confirmReceive = async () => {
    if (!orderId.value) return
    
    try {
      await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      })
      
      await orderStore.confirmReceive(orderId.value)
      ElMessage.success('已确认收货')
      
      // 清除自动刷新
      clearAutoRefresh()
      
      // 刷新订单详情
      fetchOrderDetail()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('确认收货失败:', error)
        ElMessage.error('确认收货失败，请稍后重试')
      }
    }
  }
  
  // 删除订单
  const deleteOrder = async () => {
    if (!orderId.value) return
    
    try {
      await ElMessageBox.confirm('确定要删除该订单吗？删除后将无法恢复。', '删除订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await orderStore.deleteOrder(orderId.value)
      ElMessage.success('订单已删除')
      router.push('/orders')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除订单失败:', error)
        ElMessage.error('删除订单失败，请稍后重试')
      }
    }
  }
  
  // 返回订单列表
  const goBack = () => {
    router.push('/orders')
  }
  
  // 获取订单状态文本
  const getOrderStatusText = (status) => {
    return orderStore.getOrderStatusText(status)
  }
  
  // 获取物流状态文本
  const getLogisticsStatusText = (status) => {
    return orderStore.getLogisticsStatusText(status)
  }
  
  // 获取状态颜色
  const getStatusColor = (status) => {
    return orderStore.getStatusColor(status)
  }
  
  // 监听订单ID变化
  watch(() => route.params.orderId, (newId) => {
    if (newId) {
      fetchOrderDetail()
    }
  })
  
  // 组件挂载时获取数据
  onMounted(() => {
    fetchOrderDetail()
  })
  
  // 组件卸载前清除定时器
  onBeforeUnmount(() => {
    clearAutoRefresh()
  })
  
  return {
    orderId,
    orderDetail,
    loading,
    logisticsInfo,
    logisticsLoading,
    showLogistics,
    expediteDialogVisible,
    expediteForm,
    expediteLoading,
    calculatedShippingFee,
    calculatedActualAmount,
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
    clearAutoRefresh
  }
} 