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
  getOrderStats,
  directPurchase,
  applyRefund
} from '@/api/order';
import { getStatusText as utilGetStatusText, getStatusType as utilGetStatusType } from '@/utils/orderStatusMapper';

export const useOrderStore = defineStore('order', {
  state: () => ({
    // 订单列表
    orderList: [],
    // 当前订单详情
    currentOrder: null,
    // 临时订单项（立即购买使用）
    tempOrderItems: [],
    // 订单统计数据
    orderStats: {
      pendingPayment: 0,
      pendingShipment: 0,
      pendingReceive: 0,
      completed: 0,
      cancelled: 0
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
    },
    error: null
  }),

  getters: {
    // 获取订单状态文本
    getOrderStatusText: () => (status) => {
      return utilGetStatusText(status);
    },
    
    // 获取订单状态类型
    getOrderStatusType: () => (status) => {
      return utilGetStatusType(status);
    },
    
    // 获取状态颜色（用于样式）
    getStatusColor: () => (status) => {
      // 根据状态返回对应的颜色
      const colorMap = {
        'CREATED': '#ff9800', // 橙色
        'SHIPPING': '#2196f3', // 蓝色
        'DELIVERED': '#4caf50', // 绿色
        'EXCEPTION': '#f44336', // 红色
        'pending_payment': '#ff9800', // 橙色 - 待付款
        'pending_shipment': '#2196f3', // 蓝色 - 待发货
        'pending_receive': '#9c27b0', // 紫色 - 待收货
        'completed': '#4caf50', // 绿色 - 已完成
        'cancelled': '#f44336', // 红色 - 已取消
        '待付款': '#ff9800',
        '待发货': '#2196f3',
        '待收货': '#9c27b0',
        '已完成': '#4caf50',
        '已取消': '#f44336',
        '退款中': '#e91e63'
      };
      return colorMap[status] || '#909399'; // 默认灰色
    },
    
    // 获取物流状态文本
    getLogisticsStatusText: () => (status) => {
      // 物流状态映射
      const statusMap = {
        'CREATED': '已创建',
        'SHIPPING': '运输中',
        'DELIVERED': '已送达',
        'EXCEPTION': '异常',
        'created': '已创建',
        'shipping': '运输中',
        'delivered': '已送达',
        'exception': '异常'
      };
      return statusMap[status] || status;
    },
    
    // 检查是否有待处理的订单
    hasPendingOrders: (state) => {
      return state.orderStats.pendingPayment > 0 || 
             state.orderStats.pendingShipment > 0 || 
             state.orderStats.pendingReceive > 0;
    },
    
    // 获取临时订单项总数
    tempOrderItemsCount: (state) => {
      return state.tempOrderItems.length;
    },
    
    // 计算临时订单总价
    tempOrderTotalPrice: (state) => {
      return state.tempOrderItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },

    getOrderDetail: (state) => (id) => {
      return state.currentOrder && state.currentOrder.id === id ? state.currentOrder : null;
    }
  },

  actions: {
    // 设置临时订单项（用于立即购买功能）
    setTempOrderItems(items) {
      this.tempOrderItems = Array.isArray(items) ? items : [items];
    },
    
    // 清空临时订单项
    clearTempOrderItems() {
      this.tempOrderItems = [];
    },
    
    // 获取临时订单项
    getTempOrderItems() {
      return this.tempOrderItems;
    },
    
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
        console.log('发送订单列表请求，参数:', params);
        const res = await getOrderList(params);
        console.log('订单列表API响应:', res);
        
        if (res.code === 200) {
          // 确保数据结构完整
          if (!res.data) {
            console.warn('订单列表API响应中没有data字段');
            res.data = { list: [], total: 0 };
          }
          
          if (!res.data.list) {
            console.warn('订单列表API响应中没有list字段');
            res.data.list = [];
          }
          
          // 添加orderNumber字段，兼容前端展示
          const processedList = res.data.list.map(order => {
            // 确保每个订单都有orderNumber字段，与orderNo保持一致
            if (order.orderNo && !order.orderNumber) {
              order.orderNumber = order.orderNo;
            }
            return order;
          });
          
          this.orderList = processedList || [];
          this.total = res.data.total || 0;
          
          // 打印每个订单的关键信息，方便调试
          if (this.orderList.length > 0) {
            console.log(`获取到 ${this.orderList.length} 条订单数据`);
            this.orderList.forEach((order, index) => {
              console.log(`订单 ${index+1}/${this.orderList.length}:`, {
                orderId: order.orderId,
                orderNo: order.orderNo,
                orderNumber: order.orderNumber,
                status: order.status,
                totalAmount: order.totalAmount,
                products: order.products ? order.products.length : 0
              });
            });
          } else {
            console.warn('订单列表为空，检查当前筛选条件:', params);
          }
          
          return {
            list: this.orderList,
            total: this.total
          };
        } else {
          console.error('订单列表API响应错误:', res.message || '未知错误');
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
          // 确保订单数据包含orderNumber字段
          if (res.data && res.data.orderNo && !res.data.orderNumber) {
            res.data.orderNumber = res.data.orderNo;
          }
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
      this.error = null;
      
      try {
        // 准备订单数据，确保与后端API要求一致
        const requestData = {
          addressId: orderData.addressId,
          cartIds: orderData.cartIds,
          paymentMethod: orderData.paymentMethod,
          remark: orderData.remark || '',
          couponId: orderData.couponId,
          shippingFee: orderData.shippingFee || 0,
          pointsUsed: orderData.pointsUsed || 0  // 添加积分抵扣参数
        };
        
        // 增加详细日志，确保积分参数被正确传递
        console.log('创建订单请求数据 (详细):', {
          原始数据: orderData,
          处理后数据: requestData,
          积分使用: {
            原始积分值: orderData.pointsUsed,
            传递积分值: requestData.pointsUsed
          }
        });
        
        const res = await createOrder(requestData);
        
        // 详细记录API返回结果，特别关注积分抵扣部分
        console.log('创建订单API返回 (详细):', {
          code: res.code,
          message: res.message,
          data: res.data,
          积分抵扣信息: res.data ? {
            pointsUsed: res.data.pointsUsed,
            pointsDiscount: res.data.pointsDiscount,
            actualAmount: res.data.actualAmount,
            totalAmount: res.data.totalAmount
          } : '无数据'
        });
        
        if (res.code === 200) {
          ElMessage.success('订单创建成功');
          // 打印完整的返回数据，包括积分抵扣信息
          console.log('订单创建成功，返回数据:', res.data);
          return res.data;
        } else {
          throw new Error(res.message || '订单创建失败');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        this.error = error.message || '创建订单失败，请稍后重试';
        throw error;
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
          
          // 直接更新订单统计数据中的已取消订单数量
          if (this.orderStats) {
            // 查找当前订单，确定它的原始状态
            const origStatus = this.currentOrder?.status || null;
            
            // 增加已取消订单数量
            this.orderStats.cancelled = (this.orderStats.cancelled || 0) + 1;
            
            // 根据原始状态减少相应的计数
            if (origStatus === 'pending_payment') {
              this.orderStats.pendingPayment = Math.max(0, (this.orderStats.pendingPayment || 0) - 1);
            } else if (origStatus === 'pending_shipment') {
              this.orderStats.pendingShipment = Math.max(0, (this.orderStats.pendingShipment || 0) - 1);
            } else if (origStatus === 'pending_receive' || origStatus === 'shipped') {
              this.orderStats.pendingReceive = Math.max(0, (this.orderStats.pendingReceive || 0) - 1);
            }
            
            console.log('已更新订单统计数据，已取消订单数量:', this.orderStats.cancelled);
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
        console.log('order.js: 开始从服务器获取订单统计数据');
        const res = await getOrderStats();
        
        if (res.code === 200) {
          console.log('order.js: 成功获取订单统计数据:', res.data);
          // 记录旧的统计值用于调试
          const oldCancelled = this.orderStats?.cancelled || 0;
          
          this.orderStats = {
            pendingPayment: res.data.pendingPayment || 0,
            pendingShipment: res.data.pendingShipment || 0,
            pendingReceive: res.data.pendingReceive || 0,
            completed: res.data.completed || 0,
            cancelled: res.data.cancelled || 0
          };
          
          // 检查并输出已取消订单数量变化
          if (oldCancelled !== this.orderStats.cancelled) {
            console.log(`order.js: 已取消订单数量已更新: ${oldCancelled} -> ${this.orderStats.cancelled}`);
          } else {
            console.log(`order.js: 已取消订单数量未变化: ${this.orderStats.cancelled}`);
          }
          
          return this.orderStats;
        } else {
          console.error('order.js: 获取订单统计失败:', res.message);
          ElMessage.error(res.message || '获取订单统计失败');
          return null;
        }
      } catch (error) {
        console.error('order.js: 获取订单统计异常:', error);
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
    },

    /**
     * 直接购买商品（不添加到购物车）
     * @param {Object} purchaseData - 直接购买数据
     * @returns {Promise} - 返回创建结果
     */
    async directPurchase(purchaseData) {
      this.loading = true;
      this.error = null;
      try {
        console.log('调用directPurchase API，参数:', purchaseData);
        const response = await directPurchase(purchaseData);
        if (response.code === 200 && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || '直接购买失败');
        }
      } catch (error) {
        console.error('直接购买失败:', error);
        this.error = error.message || '直接购买失败，请稍后重试';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // 获取订单的退款信息
    async fetchRefundByOrderId(orderId) {
      if (!orderId) {
        ElMessage.error('订单ID不能为空');
        return null;
      }
      
      try {
        console.log('开始获取订单退款信息，订单ID:', orderId);
        
        // 添加授权头，确保发送当前用户凭证
        const headers = new Headers();
        const token = localStorage.getItem('token');
        if (token) {
          headers.append('Authorization', `Bearer ${token}`);
        }
        
        // 调用获取订单退款信息的API
        const res = await fetch(`/api/refund/order/${orderId}?page=1&size=1`, {
          headers: headers
        });
        
        // 检查HTTP状态
        if (!res.ok) {
          // 如果是403错误，静默处理，不显示错误提示
          if (res.status === 403) {
            console.warn('无权限访问退款API，用户已登录但可能权限不足');
            // 构建统一的错误对象
            const error = {
              status: 403,
              message: '无权限访问退款API',
              response: { status: 403 }
            };
            throw error;
          }
          
          // 其他HTTP错误
          console.error(`获取订单退款信息失败: HTTP ${res.status}`);
          throw new Error(`获取退款信息失败: HTTP ${res.status}`);
        }
        
        // 检查响应是否为空
        const text = await res.text();
        if (!text || text.trim() === '') {
          console.warn('退款API返回空响应');
          return { code: 204, message: '退款API返回空响应', data: null };
        }
        
        // 解析JSON
        try {
          const data = JSON.parse(text);
          return data;
        } catch (jsonError) {
          console.error('解析退款信息JSON失败:', jsonError);
          throw new Error('解析退款信息失败');
        }
      } catch (error) {
        console.error('获取订单退款信息失败:', error);
        
        // 统一错误对象结构
        if (error && error.status === 403) {
          // 已经是统一结构，直接抛出
          throw error;
        } else if (error.response && error.response.status === 403) {
          // 已经是统一结构，直接抛出
          throw error;
        } else {
          // 其他错误，包装为统一结构
          throw {
            status: error.status || 500,
            message: error.message || '获取订单退款信息失败',
            response: error.response || { status: error.status || 500 }
          };
        }
      }
    },
    
    // 取消退款申请
    async cancelRefund(refundId, reason) {
      if (!refundId) {
        ElMessage.error('退款ID不能为空');
        return null;
      }
      
      try {
        // 调用取消退款申请的API
        const res = await fetch(`/api/refund/cancel/${refundId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            userId: localStorage.getItem('userId') || '',
            reason: reason || '用户取消申请'
          })
        });
        
        const data = await res.json();
        
        if (data.code === 200) {
          return {
            code: 200,
            data: true
          };
        } else {
          return {
            code: data.code || 500,
            message: data.message || '取消退款申请失败',
            data: null
          };
        }
      } catch (error) {
        console.error('取消退款申请失败:', error);
        return {
          code: 500,
          message: '取消退款申请失败，请稍后重试',
          data: null
        };
      }
    }
  }
}); 