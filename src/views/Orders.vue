<template>
  <div class="orders-page">
    <main-layout>
      <div class="container mx-auto py-8 px-4 animate__animated animate__fadeIn">
        <!-- 标题和刷新按钮 -->
        <div class="flex justify-between items-center mb-6" data-aos="fade-down">
          <h1 class="text-2xl font-bold">我的订单</h1>
          <el-button 
            :loading="loading" 
            @click="fetchOrders" 
            class="refresh-btn"
          >
            <el-icon><RefreshRight /></el-icon>
            刷新
          </el-button>
        </div>
        
        <!-- 搜索和标签筛选 -->
        <div class="order-filter bg-white rounded-lg shadow-md p-6 mb-6" data-aos="fade-up">
          <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="order-tabs flex-grow">
              <el-tab-pane label="全部订单" name="all"></el-tab-pane>
              <el-tab-pane label="待付款" name="unpaid"></el-tab-pane>
              <el-tab-pane label="待发货" name="unshipped"></el-tab-pane>
              <el-tab-pane label="待收货" name="shipped"></el-tab-pane>
              <el-tab-pane label="已完成" name="completed"></el-tab-pane>
              <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
            </el-tabs>
            
            <div class="search-filter-group flex gap-3 flex-wrap md:flex-nowrap">
              <div class="search-box relative flex-grow">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索订单商品"
                  class="w-full"
                  clearable
                  @clear="handleSearch"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon class="text-gray-400"><Search /></el-icon>
                  </template>
                </el-input>
              </div>
              
              <el-select v-model="sortOrder" placeholder="排序方式" @change="handleSearch" class="w-36">
                <el-option label="最新订单" value="newest"></el-option>
                <el-option label="最早订单" value="oldest"></el-option>
                <el-option label="金额从高到低" value="price-high"></el-option>
                <el-option label="金额从低到高" value="price-low"></el-option>
              </el-select>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container py-12 flex justify-center">
          <el-skeleton :rows="3" animated />
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="orders.length === 0" 
             class="empty-state py-12 text-center bg-white rounded-lg shadow-md p-6" 
             data-aos="fade-up">
          <el-empty :description="emptyDescription">
            <el-button type="primary" @click="goToShop" class="mt-4">去购物</el-button>
          </el-empty>
        </div>
        
        <!-- 订单列表 -->
        <div v-else class="orders-list space-y-6">
          <transition-group
            name="order-item"
            tag="div"
            class="space-y-6"
          >
            <div
              v-for="order in orders"
              :key="order.id"
              class="order-card bg-white rounded-lg shadow-md overflow-hidden transform hover:translate-y-[-2px] transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <!-- 订单头部 -->
              <div 
                class="order-header p-4 md:p-6 border-b border-gray-100 cursor-pointer" 
                @click="toggleOrderExpand(order.id)"
              >
                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div class="order-info space-y-1">
                    <div class="flex items-center flex-wrap gap-2">
                      <h3 class="text-lg font-semibold">订单号：{{ order.orderNumber }}</h3>
                      <el-tag :type="getStatusType(order.status)" effect="light" class="ml-2">
                        {{ getStatusText(order.status) }}
                      </el-tag>
                    </div>
                    <p class="text-sm text-gray-500">
                      下单时间：{{ formatDate(order.createTime) }}
                    </p>
                  </div>
                  
                  <div class="flex items-center gap-4">
                    <div class="order-price text-right">
                      <p class="font-bold text-lg text-pink-gradient-text">¥{{ formatPrice(order.totalAmount) }}</p>
                      <p class="text-sm text-gray-500">{{ getTotalItems(order) }}件商品</p>
                    </div>
                    <el-button circle @click.stop="toggleOrderExpand(order.id)">
                      <el-icon>
                        <component :is="expandedOrderIds.includes(order.id) ? 'ArrowUp' : 'ArrowDown'" />
                      </el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              
              <!-- 订单展开内容 -->
              <div v-if="expandedOrderIds.includes(order.id)" 
                   class="order-details animate__animated animate__fadeIn animate__faster">
                <!-- 订单商品列表 -->
                <div class="order-items p-4 md:p-6 border-b border-gray-100">
                  <h4 class="font-medium mb-4">订单商品</h4>
                  <div class="space-y-4">
                    <div 
                      v-for="(item, index) in order.items" 
                      :key="index"
                      class="order-item flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div class="product-img w-20 h-20 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                        <el-image 
                          :src="item.image" 
                          :alt="item.title" 
                          class="w-full h-full object-cover"
                          fit="cover"
                        ></el-image>
                      </div>
                      
                      <div class="product-info flex-1 min-w-0">
                        <h5 class="text-base font-medium text-gray-800 mb-1 line-clamp-1">
                          {{ item.title }}
                        </h5>
                        
                        <div class="text-xs text-gray-500 mb-2">
                          <span v-if="item.specs">{{ item.specs.join(' / ') }}</span>
                        </div>
                        
                        <div class="flex items-center">
                          <div class="text-pink font-medium">¥{{ formatPrice(item.price) }}</div>
                          <div class="text-gray-500 mx-2">×</div>
                          <div>{{ item.quantity }}</div>
                        </div>
                      </div>
                      
                      <div class="item-actions flex gap-2 mt-3 sm:mt-0">
                        <el-button 
                          v-if="canReview(order, item)" 
                          size="small"
                          @click="goToReview(order.id, item.id)"
                        >
                          评价
                        </el-button>
                        
                        <el-button 
                          v-if="canViewReview(order, item)" 
                          size="small"
                          type="info"
                          plain
                          @click="viewReview(order.id, item.id)"
                        >
                          查看评价
                        </el-button>
                        
                        <el-button 
                          size="small"
                          @click="viewProduct(item.productId)"
                        >
                          再次购买
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 物流追踪 (如果已发货) -->
                <div v-if="['shipped', 'completed'].includes(order.status)" class="order-tracking p-4 md:p-6 border-b border-gray-100">
                  <h4 class="font-medium mb-4">物流状态</h4>
                  <div class="tracking-steps">
                    <el-steps :active="getTrackingActiveStep(order)" simple>
                      <el-step title="订单已下单" description=""></el-step>
                      <el-step title="订单已确认" description=""></el-step>
                      <el-step title="包裹已发出" description=""></el-step>
                      <el-step title="派送中" description=""></el-step>
                      <el-step title="已签收" description=""></el-step>
                    </el-steps>
                  </div>
                </div>
                
                <!-- 订单操作和总价 -->
                <div class="order-actions p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div class="order-total">
                    <div class="text-base">
                      共 <span class="font-medium">{{ getTotalItems(order) }}</span> 件商品，
                      合计: <span class="text-xl text-pink font-bold">¥{{ formatPrice(order.totalAmount) }}</span>
                      <span class="text-gray-500 text-sm">(含运费 ¥{{ formatPrice(order.shippingFee) }})</span>
                    </div>
                  </div>
                  
                  <div class="action-buttons flex flex-wrap gap-2">
                    <el-button 
                      v-if="order.status === 'unpaid'" 
                      type="primary"
                      @click="payOrder(order)"
                    >
                      去支付
                    </el-button>
                    
                    <el-button 
                      v-if="order.status === 'unpaid'" 
                      @click="cancelOrder(order)"
                    >
                      取消订单
                    </el-button>
                    
                    <el-button 
                      v-if="order.status === 'shipped'" 
                      type="success"
                      @click="confirmReceipt(order)"
                    >
                      确认收货
                    </el-button>
                    
                    <el-button 
                      v-if="['completed', 'cancelled'].includes(order.status)" 
                      type="danger"
                      plain
                      @click="deleteOrder(order)"
                    >
                      删除订单
                    </el-button>
                    
                    <el-button 
                      @click="viewOrderDetail(order)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
        
        <!-- 分页 -->
        <div v-if="orders.length > 0" class="pagination flex justify-center mt-8" data-aos="fade-up">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalOrders"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            background
          />
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Search, 
  ArrowDown, 
  ArrowUp, 
  RefreshRight
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import 'animate.css';

const router = useRouter();

// 状态变量
const loading = ref(false);
const searchQuery = ref('');
const activeTab = ref('all');
const currentPage = ref(1);
const pageSize = ref(10);
const totalOrders = ref(0);
const expandedOrderIds = ref([]);
const sortOrder = ref('newest');

// 模拟订单数据
const orders = ref([
  {
    id: 1,
    orderNumber: 'MU20240501001',
    createTime: '2024-05-01 14:32:11',
    status: 'unpaid',
    totalAmount: 469.8,
    shippingFee: 10,
    items: [
      {
        id: 1001,
        productId: 101,
        title: '婴儿纯棉连体衣秋冬装加厚保暖新生儿衣服',
        image: '/images/product1.jpg',
        specs: ['粉色', '73cm'],
        price: 89.9,
        quantity: 2
      },
      {
        id: 1002,
        productId: 102,
        title: '儿童宝宝牙刷婴幼儿软毛护齿训练牙刷',
        image: '/images/product2.jpg',
        specs: ['蓝色', '2-4岁'],
        price: 29.9,
        quantity: 3
      },
      {
        id: 1003,
        productId: 103,
        title: '婴儿奶瓶宽口径防胀气宝宝防摔硅胶奶瓶',
        image: '/images/product3.jpg',
        specs: ['240ml'],
        price: 69.9,
        quantity: 2
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'MU20240428002',
    createTime: '2024-04-28 09:17:05',
    status: 'shipped',
    totalAmount: 908.9,
    shippingFee: 0,
    items: [
      {
        id: 2001,
        productId: 201,
        title: '儿童餐椅多功能可折叠便携式宝宝吃饭椅子',
        image: '/images/product5.jpg',
        specs: ['米色'],
        price: 299,
        quantity: 1
      },
      {
        id: 2002,
        productId: 202,
        title: '婴儿推车轻便折叠可坐可躺高景观婴儿车',
        image: '/images/product6.jpg',
        specs: ['香槟金', '标准版'],
        price: 599,
        quantity: 1
      }
    ]
  },
  {
    id: 3,
    orderNumber: 'MU20240415003',
    createTime: '2024-04-15 16:42:33',
    status: 'completed',
    totalAmount: 388.9,
    shippingFee: 10,
    items: [
      {
        id: 3001,
        productId: 301,
        title: '婴儿洗发沐浴露二合一宝宝洗护用品新生儿沐浴露',
        image: '/images/product4.jpg',
        specs: ['300ml'],
        price: 59.9,
        quantity: 2,
        reviewed: true
      },
      {
        id: 3002,
        productId: 302,
        title: '宝宝辅食机多功能料理机婴儿研磨器',
        image: '/images/product7.jpg',
        specs: ['白色'],
        price: 259,
        quantity: 1,
        reviewed: false
      }
    ]
  },
  {
    id: 4,
    orderNumber: 'MU20240410004',
    createTime: '2024-04-10 11:08:52',
    status: 'cancelled',
    totalAmount: 599,
    shippingFee: 0,
    items: [
      {
        id: 4001,
        productId: 401,
        title: '婴儿床实木多功能可折叠新生儿摇篮床',
        image: '/images/product9.jpg',
        specs: ['原木色'],
        price: 599,
        quantity: 1
      }
    ]
  }
]);

// 空状态描述
const emptyDescription = computed(() => {
  switch (activeTab.value) {
    case 'unpaid':
      return '暂无待付款订单';
    case 'unshipped':
      return '暂无待发货订单';
    case 'shipped':
      return '暂无待收货订单';
    case 'completed':
      return '暂无已完成订单';
    case 'cancelled':
      return '暂无已取消订单';
    default:
      return '暂无订单';
  }
});

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    'unpaid': '待付款',
    'unshipped': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  
  return statusMap[status] || '未知状态';
};

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    'unpaid': 'warning',
    'unshipped': 'info',
    'shipped': 'primary',
    'completed': 'success',
    'cancelled': 'info'
  };
  
  return typeMap[status] || '';
};

// 计算订单总商品数
const getTotalItems = (order) => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

// 判断商品是否可以评价
const canReview = (order, item) => {
  return order.status === 'completed' && !item.reviewed;
};

// 判断是否可以查看评价
const canViewReview = (order, item) => {
  return order.status === 'completed' && item.reviewed;
};

// 获取物流追踪的当前步骤
const getTrackingActiveStep = (order) => {
  switch (order.status) {
    case 'unpaid':
      return 0;
    case 'unshipped':
      return 1;
    case 'shipped':
      return 3;
    case 'completed':
      return 4;
    case 'cancelled':
      return 0;
    default:
      return 0;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 切换订单展开状态
const toggleOrderExpand = (orderId) => {
  const index = expandedOrderIds.value.indexOf(orderId);
  if (index > -1) {
    expandedOrderIds.value.splice(index, 1);
  } else {
    expandedOrderIds.value.push(orderId);
  }
};

// 处理标签切换
const handleTabChange = (tab) => {
  currentPage.value = 1;
  fetchOrders();
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchOrders();
};

// 处理页码变化
const handleCurrentChange = (page) => {
  fetchOrders();
};

// 处理每页条数变化
const handleSizeChange = (size) => {
  currentPage.value = 1;
  fetchOrders();
};

// 获取订单数据
const fetchOrders = () => {
  loading.value = true;
  
  // 模拟 API 请求
  setTimeout(() => {
    // 根据选中的标签筛选数据
    const filteredOrders = activeTab.value === 'all' 
      ? orders.value 
      : orders.value.filter(order => order.status === activeTab.value);
    
    // 根据搜索词过滤
    const searchResult = searchQuery.value
      ? filteredOrders.filter(order => {
          return order.items.some(item => 
            item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
          );
        })
      : filteredOrders;
    
    // 排序
    const sortedResult = [...searchResult].sort((a, b) => {
      const dateA = new Date(a.createTime).getTime();
      const dateB = new Date(b.createTime).getTime();
      
      switch (sortOrder.value) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'price-high':
          return b.totalAmount - a.totalAmount;
        case 'price-low':
          return a.totalAmount - b.totalAmount;
        default:
          return dateB - dateA;
      }
    });
    
    // 更新总订单数
    totalOrders.value = sortedResult.length;
    
    // 分页
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    
    // 应用过滤和分页后的订单数据
    // 实际应用中，应该通过 API 获取已经分页的数据
    // 这里仅作演示，在前端进行分页处理
    orders.value = sortedResult.slice(start, end);
    
    loading.value = false;
  }, 500);
};

// 支付订单
const payOrder = (order) => {
  router.push(`/payment/${order.id}`);
};

// 取消订单
const cancelOrder = (order) => {
  ElMessageBox.confirm('确定要取消此订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟 API 请求
    setTimeout(() => {
      order.status = 'cancelled';
      ElMessage.success('订单已取消');
      
      // 刷新订单列表
      fetchOrders();
    }, 300);
  }).catch(() => {
    // 用户取消操作
  });
};

// 确认收货
const confirmReceipt = (order) => {
  ElMessageBox.confirm('确认已收到商品吗？', '提示', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 模拟 API 请求
    setTimeout(() => {
      order.status = 'completed';
      ElMessage.success('已确认收货');
      
      // 刷新订单列表
      fetchOrders();
    }, 300);
  }).catch(() => {
    // 用户取消操作
  });
};

// 删除订单
const deleteOrder = (order) => {
  ElMessageBox.confirm('确定要删除此订单吗？删除后不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟 API 请求
    setTimeout(() => {
      orders.value = orders.value.filter(item => item.id !== order.id);
      ElMessage.success('订单已删除');
      
      // 更新总订单数
      totalOrders.value -= 1;
    }, 300);
  }).catch(() => {
    // 用户取消操作
  });
};

// 查看订单详情
const viewOrderDetail = (order) => {
  router.push(`/order/${order.id}`);
};

// 去评价
const goToReview = (orderId, itemId) => {
  router.push(`/review?orderId=${orderId}&itemId=${itemId}`);
};

// 查看评价
const viewReview = (orderId, itemId) => {
  router.push(`/review/${itemId}`);
};

// 查看商品详情
const viewProduct = (productId) => {
  router.push(`/product/${productId}`);
};

// 前往商城
const goToShop = () => {
  router.push('/products');
};

// 初始化
onMounted(() => {
  fetchOrders();
});

// 监听标签和搜索条件变化
watch([activeTab, searchQuery, sortOrder], () => {
  fetchOrders();
}, { deep: true });
</script>

<style lang="scss" scoped>
.orders-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  
  .order-filter {
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    
    .order-tabs {
      .el-tabs__nav-wrap::after {
        height: 1px;
      }
      
      .el-tabs__active-bar {
        height: 3px;
        border-radius: 3px;
        background-color: var(--pink-color);
      }
      
      :deep(.el-tabs__item) {
        font-size: 16px;
        transition: all 0.3s ease;
        
        &.is-active {
          color: var(--pink-color);
          font-weight: 600;
        }
        
        &:hover {
          color: var(--pink-color);
        }
      }
    }
  }
  
  .order-card {
    transition: all 0.3s ease;
    
    .order-header {
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: #f9f9f9;
      }
    }
    
    .text-pink {
      color: var(--pink-color);
    }
    
    .text-pink-gradient-text {
      background: linear-gradient(45deg, var(--pink-color), var(--pink-light));
      -webkit-background-clip: text;
      color: transparent;
    }
  }
  
  .order-item-enter-active,
  .order-item-leave-active {
    transition: all 0.3s ease;
  }
  
  .order-item-enter-from,
  .order-item-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  .order-item-move {
    transition: transform 0.5s ease;
  }
  
  .refresh-btn {
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: all 0.6s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
  }
  
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .tracking-steps {
    margin: 20px 0;
    
    :deep(.el-step__title) {
      font-size: 14px;
    }
    
    :deep(.el-step__head.is-process) {
      color: var(--pink-color);
      border-color: var(--pink-color);
    }
    
    :deep(.el-step__head.is-finish) {
      color: var(--pink-color);
      border-color: var(--pink-color);
    }
    
    :deep(.el-step__title.is-process) {
      color: var(--pink-color);
    }
    
    :deep(.el-step__title.is-finish) {
      color: var(--pink-color);
    }
  }
  
  .empty-state {
    animation: fadeInUp 0.5s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@media (max-width: 768px) {
  .orders-page {
    .order-card {
      .order-header {
        padding: 16px;
      }
    }
  }
}
</style> 
