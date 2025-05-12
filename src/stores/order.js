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
      return utilGetStatusText(status);
    },
    
    // 获取订单状态类型
    getOrderStatusType: () => (status) => {
      return utilGetStatusType(status);
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