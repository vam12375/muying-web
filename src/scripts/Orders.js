import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { formatDate as formatDateUtil } from '@/utils/date'
import { 
  ArrowRight, Search, RefreshRight, Delete, View, 
  ShoppingCart, Document, Plus, StarFilled,
  SuccessFilled, GoodsFilled 
} from '@element-plus/icons-vue'

export function useOrders() {
  const router = useRouter()
  const orderStore = useOrderStore()

  // 状态变量
  const orderList = ref([])
  const total = ref(0)
  const pageSize = ref(10)
  const currentPage = ref(1)
  const dateRange = ref([])
  const listLoading = ref(true)

  // 订单状态统计
  const orderStats = ref({
    pendingPayment: 0,
    pendingShipment: 0,
    pendingReceive: 0,
    completed: 0
  })

  // 筛选条件
  const filters = ref({
    status: '',
    orderNumber: '',
    startDate: null,
    endDate: null
  })

  // 订单统计项
  const orderStatsItems = [
    { 
      title: '待付款', 
      key: 'pendingPayment', 
      status: 'pending_payment',
      icon: Document,
      colorClass: 'status-pending-payment' 
    },
    { 
      title: '待发货', 
      key: 'pendingShipment', 
      status: 'pending_shipment',
      icon: GoodsFilled,
      colorClass: 'status-pending-shipment' 
    },
    { 
      title: '待收货', 
      key: 'pendingReceive', 
      status: 'pending_receive',
      icon: ShoppingCart,
      colorClass: 'status-pending-receive' 
    },
    { 
      title: '已完成', 
      key: 'completed', 
      status: 'completed',
      icon: SuccessFilled,
      colorClass: 'status-completed' 
    }
  ]

  // 筛选标签页
  const filterTabs = [
    { label: '全部订单', value: '' },
    { label: '待付款', value: 'pending_payment' },
    { label: '待发货', value: 'pending_shipment' },
    { label: '待收货', value: 'pending_receive' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' }
  ]

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

  // 处理筛选标签切换
  const handleTabChange = (status) => {
    filters.value.status = status
    currentPage.value = 1
    fetchOrders()
  }

  // 处理页码变化
  const handlePageChange = (page) => {
    currentPage.value = page
    fetchOrders()
  }

  // 处理日期范围变化
  const handleDateChange = (dateValues) => {
    if (dateValues) {
      filters.value.startDate = dateValues[0]
      filters.value.endDate = dateValues[1]
    } else {
      filters.value.startDate = null
      filters.value.endDate = null
    }
  }

  // 搜索
  const handleSearch = () => {
    currentPage.value = 1
    fetchOrders()
  }

  // 重置筛选条件
  const resetFilters = () => {
    filters.value = {
      status: '',
      orderNumber: '',
      startDate: null,
      endDate: null
    }
    dateRange.value = []
    currentPage.value = 1
    fetchOrders()
  }

  // 按订单状态筛选
  const filterByStatus = (status) => {
    filters.value.status = status
    currentPage.value = 1
    fetchOrders()
  }

  // 支付订单
  const payOrder = (orderId) => {
    router.push(`/payment/${orderId}`)
  }

  // 取消订单
  const cancelOrder = async (orderId) => {
    try {
      await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await orderStore.cancelOrder(orderId)
      ElMessage.success('订单已取消')
      fetchOrders()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('取消订单失败:', error)
        ElMessage.error('取消订单失败，请稍后重试')
      }
    }
  }

  // 确认收货
  const confirmReceive = async (orderId) => {
    try {
      await ElMessageBox.confirm('确认已收到商品吗？', '确认收货', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      })
      
      await orderStore.confirmReceive(orderId)
      ElMessage.success('已确认收货')
      fetchOrders()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('确认收货失败:', error)
        ElMessage.error('确认收货失败，请稍后重试')
      }
    }
  }

  // 删除订单
  const deleteOrder = async (orderId) => {
    try {
      await ElMessageBox.confirm('确定要删除该订单吗？删除后将无法恢复。', '删除订单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      await orderStore.deleteOrder(orderId)
      ElMessage.success('订单已删除')
      fetchOrders()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除订单失败:', error)
        ElMessage.error('删除订单失败，请稍后重试')
      }
    }
  }

  // 查看订单详情
  const viewOrderDetail = (orderId) => {
    router.push(`/order/${orderId}`)
  }

  // 评价订单
  const reviewOrder = (order) => {
    router.push(`/review/order/${order.orderId}`)
  }

  // 再次购买
  const rebuyOrder = async (order) => {
    // 处理再次购买逻辑，可能需要添加到购物车
    // 或者跳转到相关商品页面
    ElMessage.success('商品已添加到购物车')
  }

  // 去购物
  const goShopping = () => {
    router.push('/products')
  }

  // 获取订单状态文本
  const getOrderStatusText = (status) => {
    return orderStore.getOrderStatusText(status)
  }

  // 获取订单状态样式类
  const getOrderStatusClass = (status) => {
    const classMap = {
      'pending_payment': 'status-pending-payment',
      '待支付': 'status-pending-payment',
      'pending_shipment': 'status-pending-shipment',
      'pending_receive': 'status-pending-receive',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'closed': 'status-closed'
    }
    return classMap[status] || ''
  }

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

  // 格式化日期
  const formatDate = (dateStr) => {
    return formatDateUtil(dateStr, 'YYYY-MM-DD HH:mm')
  }

  // 格式化价格
  const formatPrice = (price) => {
    return Number(price).toFixed(2)
  }

  // 获取订单商品总数
  const getOrderItemsCount = (order) => {
    // 检查order.products是否存在并且是数组
    if (!order || !order.products || !Array.isArray(order.products)) {
      return 0;
    }
    return order.products.reduce((total, item) => total + item.quantity, 0);
  }

  // 获取空状态文本
  const getEmptyStateText = () => {
    const statusTexts = {
      'pending_payment': '暂无待付款订单',
      'pending_shipment': '暂无待发货订单',
      'pending_receive': '暂无待收货订单',
      'completed': '暂无已完成订单',
      'cancelled': '暂无已取消订单'
    }
    
    return statusTexts[filters.value.status] || '暂无订单'
  }

  // 获取空状态描述
  const getEmptyStateDesc = () => {
    const statusDescs = {
      'pending_payment': '您目前没有需要付款的订单',
      'pending_shipment': '您的所有订单都已发货',
      'pending_receive': '您目前没有待收货的订单',
      'completed': '您目前没有已完成的订单',
      'cancelled': '您目前没有已取消的订单'
    }
    
    return statusDescs[filters.value.status] || '开始您的购物之旅吧'
  }

  // 监听筛选条件变化
  watch(() => filters.value.status, (newVal) => {
    console.log('订单状态筛选条件变更为:', newVal)
  })

  // 生命周期钩子
  onMounted(() => {
    fetchOrders()
  })

  // 处理空状态图片加载错误
  const handleEmptyImageError = (e) => {
    console.warn('Empty state image failed to load:', e)
    // 移除src属性，触发CSS的备用样式
    e.target.removeAttribute('src')
  }

  // 返回所有需要在模板中使用的数据和方法
  return {
    orderList,
    total,
    pageSize,
    currentPage,
    dateRange,
    listLoading,
    orderStats,
    filters,
    orderStatsItems,
    filterTabs,
    fetchOrders,
    fetchOrderStats,
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
    // 暴露图标以便在模板中使用
    ArrowRight, Search, RefreshRight, Delete, View, 
    ShoppingCart, Document, Plus, StarFilled,
    SuccessFilled, GoodsFilled 
  }
}
