import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { getShippingInfo, applyRefund } from '@/api/order'
import { getLogisticsByOrderId, queryLogisticsInfo, requestExpediteShipping } from '@/api/logistics'
import { formatDate as formatDateUtil } from '@/utils/date'
import { getStatusCode, canRefund } from '@/utils/orderStatusMapper'

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
  const isAutoRefreshing = ref(false)
  const retryCount = ref(0)
  
  // 催发货弹窗
  const expediteDialogVisible = ref(false)
  const expediteForm = reactive({
    remark: ''
  })
  const expediteLoading = ref(false)
  
  // 退款相关变量
  const refundDialogVisible = ref(false)
  const refundStatusDialogVisible = ref(false)
  const refundDetail = ref(null)
  const refundSubmitting = ref(false)
  const cancellingRefund = ref(false)
  const hasActiveRefund = ref(false)
  const refundLoadError = ref('')
  
  // 退款表单
  const refundForm = reactive({
    amount: 0,
    reason: '',
    reasonDetail: '',
    evidenceFiles: []
  })
  
  // 退款表单验证规则
  const refundRules = {
    amount: [
      { required: true, message: '请输入退款金额', trigger: 'blur' },
      { type: 'number', min: 0.01, message: '退款金额必须大于0', trigger: 'blur' }
    ],
    reason: [
      { required: true, message: '请选择退款原因', trigger: 'change' }
    ]
  }
  
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
        
        // 根据订单数据判断是否有退款申请，而不是直接调用API
        if (result.hasRefundRequest) {
          // 如果订单数据中标记有退款申请，则设置标志位
          hasActiveRefund.value = true
        } else {
          hasActiveRefund.value = false
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
  const fetchLogisticsInfo = async (isRetry = false) => {
    if (!orderId.value) return
    
    // 如果不是重试，则显示加载状态；重试时保持UI状态不变
    if (!isRetry) {
      logisticsLoading.value = true
      // 重置重试计数
      retryCount.value = 0
    }
    
    try {
      console.log('获取物流信息，订单ID:', orderId.value, isRetry ? '(重试)' : '')
      
      // 首先尝试通过订单ID获取物流信息
      const res = await getLogisticsByOrderId(orderId.value)
      
      if (res.code === 200 && res.data) {
        console.log('成功获取物流信息:', res.data)
        // 显示最新数据前检查与当前数据是否相同
        const hasChanged = !logisticsInfo.value || 
                           JSON.stringify(logisticsInfo.value) !== JSON.stringify(res.data)
        
        if (hasChanged) {
          console.log('物流信息已更新')
          logisticsInfo.value = res.data
          showLogistics.value = true
        } else {
          console.log('物流信息未变化')
        }
        
        // 如果物流状态不是已送达，则设置自动刷新
        if (logisticsInfo.value.status !== 'DELIVERED') {
          isAutoRefreshing.value = true
          setupAutoRefresh()
        } else {
          isAutoRefreshing.value = false
          clearAutoRefresh()
        }
      } else {
        console.log('通过订单ID获取物流信息失败，尝试备用方法')
        // 如果通过订单ID无法获取，尝试通过订单的物流信息获取
        const shippingRes = await getShippingInfo(orderId.value)
        
        if (shippingRes.code === 200 && shippingRes.data) {
          // 如果有物流单号和物流公司，通过物流单号查询
          if (shippingRes.data.trackingNo && shippingRes.data.companyCode) {
            console.log('尝试通过物流单号查询:', shippingRes.data.trackingNo)
            const queryRes = await queryLogisticsInfo(
              shippingRes.data.trackingNo,
              shippingRes.data.companyCode
            )
            
            if (queryRes.code === 200 && queryRes.data) {
              console.log('成功通过物流单号获取物流信息')
              logisticsInfo.value = queryRes.data
              showLogistics.value = true
              
              // 检查是否需要自动刷新
              if (queryRes.data.status !== 'DELIVERED') {
                isAutoRefreshing.value = true
                setupAutoRefresh()
              } else {
                isAutoRefreshing.value = false
                clearAutoRefresh()
              }
            } else {
              handleLogisticsError('通过物流单号查询失败')
            }
          } else {
            handleLogisticsError('缺少物流单号或物流公司代码')
          }
        } else {
          handleLogisticsError('获取物流信息失败')
        }
      }
    } catch (error) {
      handleLogisticsError(error)
    } finally {
      // 如果不是重试，则结束加载状态
      if (!isRetry) {
        logisticsLoading.value = false
      }
    }
  }
  
  // 处理物流信息获取错误
  const handleLogisticsError = (error) => {
    console.error('获取物流信息失败:', error)
    
    // 尝试重试逻辑
    if (retryCount.value < 3) { // 最多重试3次
      retryCount.value++
      console.log(`将在3秒后进行第${retryCount.value}次重试...`)
      
      // 3秒后重试
      setTimeout(() => {
        fetchLogisticsInfo(true) // 以重试模式调用
      }, 3000)
    } else {
      ElMessage.warning('获取物流信息失败，请手动刷新重试')
      isAutoRefreshing.value = false
    }
  }
  
  // 设置自动刷新
  const setupAutoRefresh = () => {
    // 清除现有的定时器
    clearAutoRefresh()
    
    console.log('设置物流信息自动刷新...')
    
    // 设置新的定时器，每5分钟刷新一次物流信息
    refreshInterval.value = setInterval(() => {
      console.log('执行自动刷新物流信息...')
      fetchLogisticsInfo().catch(error => {
        console.error('自动刷新物流信息失败:', error)
        // 失败后不中断刷新循环，继续保持定时器运行
      })
    }, 300000) // 5分钟刷新一次 (5 * 60 * 1000)
    
    // 为防止某些环境下setInterval不可靠，添加备用刷新机制
    // 这是一个额外的安全措施
    setTimeout(() => {
      if (refreshInterval.value) {
        console.log('执行备用物流信息刷新...')
        fetchLogisticsInfo().catch(error => {
          console.error('备用刷新物流信息失败:', error)
        })
      }
    }, 330000) // 5分30秒后执行一次备用刷新
  }
  
  // 清除自动刷新
  const clearAutoRefresh = () => {
    if (refreshInterval.value) {
      console.log('清除物流信息自动刷新定时器')
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
      isAutoRefreshing.value = false
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
  
  // 打开退款申请对话框
  const openRefundDialog = () => {
    if (!orderDetail.value) return
    
    // 检查订单状态是否允许申请退款
    if (!canRefund(orderDetail.value.status)) {
      ElMessage.warning('当前订单状态不允许申请退款')
      return
    }
    
    // 重置表单
    refundForm.amount = orderDetail.value.actualAmount
    refundForm.reason = ''
    refundForm.reasonDetail = ''
    refundForm.evidenceFiles = []
    
    refundDialogVisible.value = true
  }
  
  // 查看退款状态
  const viewRefundStatus = async () => {
    refundStatusDialogVisible.value = true;
    refundLoadError.value = '';
    
    // 强制检查退款状态
    await checkActiveRefund(true);
    
    try {
      // 获取退款详情
      const res = await orderStore.fetchRefundByOrderId(orderId.value);
      
      if (res.code === 200 && res.data) {
        refundDetail.value = res.data;
      } else {
        refundDetail.value = null;
        refundLoadError.value = '获取退款信息失败';
        ElMessage.error('获取退款信息失败');
      }
    } catch (error) {
      console.error('获取退款信息失败:', error);
      refundDetail.value = null;
      
      // 针对403错误提供友好提示
      if (error && (
          (error.response && error.response.status === 403) || 
          (error.status === 403) || 
          (typeof error === 'object' && error.message && error.message.includes('403')) ||
          (typeof error === 'object' && error.message && error.message.includes('权限'))
      )) {
        console.warn('权限错误，用户已登录但可能权限不足:', error);
        refundLoadError.value = '您当前无权查看退款信息';
        ElMessage.warning('您当前无权查看退款信息，请确认您有查看该订单退款的权限');
      } else {
        refundLoadError.value = '获取退款信息失败，请稍后重试';
        ElMessage.error('获取退款信息失败，请稍后重试');
      }
    }
  };
  
  // 取消退款申请
  const cancelRefund = async () => {
    if (!refundDetail.value) return
    
    try {
      await ElMessageBox.confirm('确定要取消该退款申请吗？', '取消退款申请', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      cancellingRefund.value = true
      
      // 调用取消退款接口
      const res = await orderStore.cancelRefund(refundDetail.value.refundId, '用户取消申请')
      
      if (res.code === 200) {
        ElMessage.success('退款申请已取消')
        refundStatusDialogVisible.value = false
        
        // 刷新订单详情
        fetchOrderDetail()
        
        // 设置没有活跃退款
        hasActiveRefund.value = false
      } else {
        ElMessage.error(res.message || '取消退款申请失败')
      }
    } catch (error) {
      if (error === 'cancel') return
      
      console.error('取消退款申请失败:', error)
      ElMessage.error('取消退款申请失败，请稍后重试')
    } finally {
      cancellingRefund.value = false
    }
  }
  
  // 获取退款状态文本
  const getRefundStatusText = (status) => {
    const statusMap = {
      'PENDING': '待审核',
      'APPROVED': '已批准',
      'REJECTED': '已拒绝',
      'PROCESSING': '处理中',
      'COMPLETED': '已完成',
      'FAILED': '已失败'
    }
    return statusMap[status] || status
  }
  
  // 获取退款状态类型
  const getRefundStatusType = (status) => {
    const typeMap = {
      'PENDING': 'warning',
      'APPROVED': 'primary',
      'REJECTED': 'danger',
      'PROCESSING': 'info',
      'COMPLETED': 'success',
      'FAILED': 'danger'
    }
    return typeMap[status] || ''
  }

  // 检查订单是否有活跃的退款申请
  const checkActiveRefund = async (forceCheck = false) => {
    if (!orderId.value) return
    
    // 只有在以下情况下才调用退款API:
    // 1. 强制检查模式(用户手动触发)
    // 2. 订单数据中标记有退款申请
    if (!forceCheck && !orderDetail.value?.hasRefundRequest) {
      console.log('跳过退款状态检查，因为订单未标记为有退款申请且不是强制检查模式');
      return;
    }
    
    try {
      // 尝试获取退款信息
      try {
        console.log('检查订单是否有活跃退款申请，订单ID:', orderId.value);
        const res = await orderStore.fetchRefundByOrderId(orderId.value);
        
        // 只有在返回成功且有数据时才处理
        if (res && res.code === 200 && res.data) {
          const activeStatuses = ['PENDING', 'APPROVED', 'PROCESSING'];
          hasActiveRefund.value = activeStatuses.includes(res.data.status);
          console.log('退款状态检查结果:', res.data.status, '是否有活跃退款:', hasActiveRefund.value);
        } else {
          console.log('未检测到活跃退款申请');
          hasActiveRefund.value = false;
        }
      } catch (error) {
        // 403错误或其他API错误，直接设置为无活跃退款
        if ((error.response && error.response.status === 403) || 
            (error.status === 403) ||
            (typeof error === 'object' && error.message && 
             (error.message.includes('403') || error.message.includes('权限')))) {
          console.warn('检查退款状态时遇到权限问题，可能需要额外授权:', error);
          // 设置为false，但不显示错误信息，避免在初始加载时打扰用户
          hasActiveRefund.value = false;
        } else {
          console.warn('获取退款信息失败，假设无活跃退款:', error);
          hasActiveRefund.value = false;
        }
      }
    } catch (outerError) {
      // 确保即使外层出错也不影响页面加载
      console.error('检查活跃退款失败:', outerError);
      hasActiveRefund.value = false;
    }
  }
  
  // 提交退款申请
  const submitRefund = async (formEl) => {
    if (!formEl) return
    
    await formEl.validate(async (valid) => {
      if (!valid) return
      
      refundSubmitting.value = true
      
      try {
        // 准备图片数据 - 将文件转为base64字符串
        let evidenceImages = ''
        if (refundForm.evidenceFiles.length > 0) {
          const imagePromises = refundForm.evidenceFiles.map(file => {
            return new Promise((resolve) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target.result)
              reader.readAsDataURL(file.raw)
            })
          })
          
          const images = await Promise.all(imagePromises)
          evidenceImages = images.join('|')
        }
        
        // 提交退款申请
        const refundData = {
          amount: refundForm.amount,
          reason: refundForm.reason,
          reasonDetail: refundForm.reasonDetail,
          evidenceImages
        }
        
        const res = await applyRefund(orderId.value, refundData)
        
        if (res.code === 200) {
          ElMessage.success('退款申请提交成功')
          refundDialogVisible.value = false
          
          // 设置有活跃退款
          hasActiveRefund.value = true
          
          // 用户已申请退款，强制检查退款状态
          await checkActiveRefund(true)
          
          // 刷新订单详情
          fetchOrderDetail()
        } else {
          ElMessage.error(res.message || '退款申请提交失败')
        }
      } catch (error) {
        console.error('提交退款申请失败:', error)
        ElMessage.error('退款申请提交失败，请稍后重试')
      } finally {
        refundSubmitting.value = false
      }
    })
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
    clearAutoRefresh,
    refundDialogVisible,
    refundStatusDialogVisible,
    refundDetail,
    refundSubmitting,
    cancellingRefund,
    hasActiveRefund,
    refundForm,
    refundRules,
    openRefundDialog,
    submitRefund,
    viewRefundStatus,
    cancelRefund,
    getRefundStatusText,
    getRefundStatusType,
    checkActiveRefund,
    canRefund,
    isAutoRefreshing,
    refundLoadError
  }
} 