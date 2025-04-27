import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { 
  createOrder, 
  getOrderList, 
  getOrderDetail, 
  cancelOrder, 
  deleteOrder, 
  confirmReceive, 
  payOrder,
  getOrderStats
} from '@/api/order';

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 订单列表
    orderList: [],
    // 当前订单详情
    currentOrder: null,
    // 订单统计数据
    orderStats: {
      pendingPayment: 0,
      pendingShipment: 0,
      pendingReceive: 0,
      completed: 0
    },
    // 加载状态
    loading: false,
    detailLoading: false,
    listLoading: false,
    statsLoading: false,
    // 分页相关
    total: 0,
    pageSize: 10,
    currentPage: 1,
    // 筛选条件
    filters: {
      status: '',
      orderNumber: '',
      startDate: null,
      endDate: null
    }
  }),

  getters: {
    // 获取订单状态文本
    getOrderStatusText: () => (status) => {
      const statusMap = {
        'pending_payment': '待付款',
        'pending_shipment': '待发货',
        'pending_receive': '待收货',
        'completed': '已完成',
        'cancelled': '已取消',
        'closed': '已关闭'
      };
      return statusMap[status] || '未知状态';
    },
    
    // 获取订单状态类型
    getOrderStatusType: () => (status) => {
      const typeMap = {
        'pending_payment': 'warning',
        'pending_shipment': 'primary',
        'pending_receive': 'success',
        'completed': 'success',
        'cancelled': 'info',
        'closed': 'info'
      };
      return typeMap[status] || 'info';
    },
    
    // 检查是否有待处理的订单
    hasPendingOrders: (state) => {
      return state.orderStats.pendingPayment > 0 || 
             state.orderStats.pendingShipment > 0 || 
             state.orderStats.pendingReceive > 0;
    }
  },

  actions: {
    // 获取订单列表
    async fetchOrderList(options = {}) {
      const params = {
        page: options.page || this.currentPage,
        pageSize: options.pageSize || this.pageSize,
        status: options.status !== undefined ? options.status : this.filters.status,
        orderNumber: options.orderNumber !== undefined ? options.orderNumber : this.filters.orderNumber,
        startDate: options.startDate !== undefined ? options.startDate : this.filters.startDate,
        endDate: options.endDate !== undefined ? options.endDate : this.filters.endDate
      };
      
      // 更新筛选条件
      this.filters = {
        status: params.status,
        orderNumber: params.orderNumber,
        startDate: params.startDate,
        endDate: params.endDate
      };
      
      this.currentPage = params.page;
      this.pageSize = params.pageSize;
      this.listLoading = true;
      
      try {
        const res = await getOrderList(params);
        
        if (res.code === 200) {
          this.orderList = res.data.list || [];
          this.total = res.data.total || 0;
          return {
            list: this.orderList,
            total: this.total
          };
        } else {
          ElMessage.error(res.message || '获取订单列表失败');
          return {
            list: [],
            total: 0
          };
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        ElMessage.error('获取订单列表失败，请稍后重试');
        return {
          list: [],
          total: 0
        };
      } finally {
        this.listLoading = false;
      }
    },
    
    // 获取订单详情
    async fetchOrderDetail(orderId) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return null;
      }
      
      this.detailLoading = true;
      
      try {
        const res = await getOrderDetail(orderId);
        
        if (res.code === 200) {
          this.currentOrder = res.data;
          return res.data;
        } else {
          ElMessage.error(res.message || '获取订单详情失败');
          return null;
        }
      } catch (error) {
        console.error('获取订单详情失败:', error);
        ElMessage.error('获取订单详情失败，请稍后重试');
        return null;
      } finally {
        this.detailLoading = false;
      }
    },
    
    // 创建订单
    async createOrder(orderData) {
      this.loading = true;
      
      try {
        const res = await createOrder(orderData);
        
        if (res.code === 200) {
          ElMessage.success('订单创建成功');
          return res.data;
        } else {
          ElMessage.error(res.message || '订单创建失败');
          return null;
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        ElMessage.error('创建订单失败，请稍后重试');
        return null;
      } finally {
        this.loading = false;
      }
    },
    
    // 支付订单
    async payOrder(orderId, paymentData) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await payOrder(orderId, paymentData);
        
        if (res.code === 200) {
          ElMessage.success('订单支付成功');
          return true;
        } else {
          ElMessage.error(res.message || '订单支付失败');
          return false;
        }
      } catch (error) {
        console.error('支付订单失败:', error);
        ElMessage.error('支付订单失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 取消订单
    async cancelOrder(orderId, reason) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await cancelOrder(orderId, { reason });
        
        if (res.code === 200) {
          ElMessage.success('订单取消成功');
          
          // 更新当前订单状态（如果正在查看该订单详情）
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 'cancelled';
            this.currentOrder.statusText = this.getOrderStatusText('cancelled');
          }
          
          return true;
        } else {
          ElMessage.error(res.message || '订单取消失败');
          return false;
        }
      } catch (error) {
        console.error('取消订单失败:', error);
        ElMessage.error('取消订单失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 确认收货
    async confirmReceive(orderId) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await confirmReceive(orderId);
        
        if (res.code === 200) {
          ElMessage.success('确认收货成功');
          
          // 更新当前订单状态（如果正在查看该订单详情）
          if (this.currentOrder && this.currentOrder.id === orderId) {
            this.currentOrder.status = 'completed';
            this.currentOrder.statusText = this.getOrderStatusText('completed');
          }
          
          return true;
        } else {
          ElMessage.error(res.message || '确认收货失败');
          return false;
        }
      } catch (error) {
        console.error('确认收货失败:', error);
        ElMessage.error('确认收货失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 删除订单
    async deleteOrder(orderId) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await deleteOrder(orderId);
        
        if (res.code === 200) {
          ElMessage.success('订单删除成功');
          return true;
        } else {
          ElMessage.error(res.message || '订单删除失败');
          return false;
        }
      } catch (error) {
        console.error('删除订单失败:', error);
        ElMessage.error('删除订单失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取订单统计数据
    async fetchOrderStats() {
      this.statsLoading = true;
      
      try {
        const res = await getOrderStats();
        
        if (res.code === 200) {
          this.orderStats = {
            pendingPayment: res.data.pendingPayment || 0,
            pendingShipment: res.data.pendingShipment || 0,
            pendingReceive: res.data.pendingReceive || 0,
            completed: res.data.completed || 0
          };
          return this.orderStats;
        } else {
          ElMessage.error(res.message || '获取订单统计失败');
          return null;
        }
      } catch (error) {
        console.error('获取订单统计失败:', error);
        ElMessage.error('获取订单统计失败，请稍后重试');
        return null;
      } finally {
        this.statsLoading = false;
      }
    },
    
    // 清除当前订单
    clearCurrentOrder() {
      this.currentOrder = null;
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        status: '',
        orderNumber: '',
        startDate: null,
        endDate: null
      };
    }
  }
}); 