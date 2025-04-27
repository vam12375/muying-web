<template>
  <div class="sales-dashboard">
    <h1 class="page-title">销售统计</h1>
    
    <div class="dashboard-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(item, index) in salesStats" :key="index">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-icon">
              <el-icon :size="36" :color="item.color">
                <component :is="item.icon"></component>
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatStatValue(item.value, item.type) }}</div>
              <div class="stat-label">{{ item.label }}</div>
            </div>
            <div class="stat-trend" :class="item.trend > 0 ? 'up' : 'down'" v-if="item.trend !== undefined">
              {{ Math.abs(item.trend) }}% <el-icon><component :is="item.trend > 0 ? 'ArrowUp' : 'ArrowDown'"></component></el-icon>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-chart-wrapper">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>销售趋势</h3>
                <el-radio-group v-model="saleTimeRange" size="small" @change="fetchSalesData">
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">全年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div id="sales-trend-chart" style="width: 100%; height: 350px;"></div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>订单状态分布</h3>
              </div>
            </template>
            <div id="order-status-chart" style="width: 100%; height: 350px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-bottom">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>热销商品排行</h3>
              </div>
            </template>
            <el-table :data="topProducts" style="width: 100%" :max-height="400">
              <el-table-column type="index" width="50" label="排名"></el-table-column>
              <el-table-column label="商品" min-width="250">
                <template #default="scope">
                  <div class="product-item">
                    <el-image :src="scope.row.image" fit="cover" class="product-image"></el-image>
                    <span class="product-name">{{ scope.row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sales" label="销量" width="80"></el-table-column>
              <el-table-column prop="amount" label="销售额" width="120">
                <template #default="scope">
                  ¥{{ scope.row.amount.toFixed(2) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3>销售渠道分析</h3>
              </div>
            </template>
            <div id="sales-channel-chart" style="width: 100%; height: 350px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="dashboard-bottom">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="chart-header">
            <h3>最近订单</h3>
            <el-button type="primary" size="small" link @click="goToOrderManagement">
              查看全部订单
            </el-button>
          </div>
        </template>
        <el-table :data="recentOrders" style="width: 100%">
          <el-table-column prop="orderNo" label="订单编号" width="180"></el-table-column>
          <el-table-column prop="receiverName" label="客户" width="120"></el-table-column>
          <el-table-column prop="totalAmount" label="金额" width="120">
            <template #default="scope">
              ¥{{ parseFloat(scope.row.totalAmount).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="时间" width="160"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === '待发货'"
                type="primary"
                size="small"
                @click="handleShipOrder(scope.row)"
              >
                发货
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="viewOrderDetail(scope.row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Money, ShoppingCart, GoodsFilled, UserFilled, ArrowUp, ArrowDown } from '@element-plus/icons-vue';
import { getSalesStats, getAdminOrders, getRecentOrderActivities, shipOrder } from '@/api/admin';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { 
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必需的组件
echarts.use([
  TitleComponent, 
  TooltipComponent, 
  GridComponent, 
  LegendComponent,
  DataZoomComponent,
  LineChart,
  BarChart,
  PieChart,
  CanvasRenderer
]);

const router = useRouter();

// 图表实例对象
const charts = {
  salesTrend: null,
  orderStatus: null,
  salesChannel: null
};

// 数据
const loading = ref(false);
const saleTimeRange = ref('month');
const salesStats = ref([
  { label: '今日销售额', value: 0, icon: Money, color: '#ff6b6b', type: 'money', trend: 5.2 },
  { label: '今日订单量', value: 0, icon: ShoppingCart, color: '#4ecdc4', type: 'count', trend: 10.5 },
  { label: '本月销售额', value: 0, icon: Money, color: '#1a535c', type: 'money', trend: -2.1 },
  { label: '累计商品', value: 0, icon: GoodsFilled, color: '#ff9f1c', type: 'count' }
]);
const topProducts = ref([]);
const recentOrders = ref([]);

// 格式化统计值
const formatStatValue = (value, type) => {
  if (type === 'money') {
    return '¥' + value.toFixed(2);
  }
  return value;
};

// 获取销售统计数据
const fetchSalesData = async () => {
  loading.value = true;
  try {
    // 获取销售统计数据
    const res = await getSalesStats({ timeRange: saleTimeRange.value });
    if (res.code === 200) {
      // 更新统计卡片数据
      salesStats.value[0].value = res.data.todaySales || 0;
      salesStats.value[1].value = res.data.todayOrders || 0;
      salesStats.value[2].value = res.data.monthSales || 0;
      salesStats.value[3].value = res.data.totalProducts || 0;
      
      // 更新热销商品
      topProducts.value = res.data.topProducts || [];
      
      // 渲染图表
      renderSalesTrendChart(res.data.salesTrend);
      renderOrderStatusChart(res.data.orderStatusDistribution);
      renderSalesChannelChart(res.data.salesChannels);
    } else {
      ElMessage.error(res.message || '获取销售数据失败');
    }
  } catch (error) {
    console.error('获取销售数据错误:', error);
    ElMessage.error('获取销售数据出错');
    
    // 使用模拟数据进行展示
    useMockData();
  } finally {
    loading.value = false;
  }
};

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    const res = await getAdminOrders({ page: 1, pageSize: 5 });
    if (res.code === 200) {
      recentOrders.value = res.data.records || [];
    }
  } catch (error) {
    console.error('获取最近订单出错:', error);
    // 使用模拟数据
    recentOrders.value = generateMockOrders(5);
  }
};

// 处理发货
const handleShipOrder = (order) => {
  router.push({
    path: '/admin/orders',
    query: { orderNo: order.orderNo }
  });
};

// 查看订单详情
const viewOrderDetail = (order) => {
  router.push({
    path: '/admin/orders',
    query: { orderNo: order.orderNo, view: 'detail' }
  });
};

// 前往订单管理页面
const goToOrderManagement = () => {
  router.push('/admin/orders');
};

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '待付款': 'warning',
    '待发货': 'danger',
    '待收货': 'primary',
    '已完成': 'success',
    '已取消': 'info'
  };
  return statusMap[status] || '';
};

// 渲染销售趋势图表
const renderSalesTrendChart = (data) => {
  if (!data || !data.dates || !data.sales || !data.orders) {
    // 使用模拟数据
    data = generateMockSalesTrend();
  }
  
  const chartDom = document.getElementById('sales-trend-chart');
  if (!chartDom) return;
  
  // 销毁旧图表
  if (charts.salesTrend) {
    charts.salesTrend.dispose();
  }
  
  charts.salesTrend = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    legend: {
      data: ['销售额', '订单量']
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        min: 0,
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单量',
        min: 0,
        axisLabel: {
          formatter: '{value}单'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: data.sales,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#ff6b6b'
        },
        itemStyle: {
          color: '#ff6b6b'
        }
      },
      {
        name: '订单量',
        type: 'bar',
        yAxisIndex: 1,
        data: data.orders,
        itemStyle: {
          color: '#4ecdc4'
        }
      }
    ]
  };
  
  charts.salesTrend.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', () => {
    charts.salesTrend && charts.salesTrend.resize();
  });
};

// 渲染订单状态分布图表
const renderOrderStatusChart = (data) => {
  if (!data) {
    // 使用模拟数据
    data = [
      { value: 35, name: '待付款' },
      { value: 20, name: '待发货' },
      { value: 30, name: '待收货' },
      { value: 15, name: '已完成' }
    ];
  }
  
  const chartDom = document.getElementById('order-status-chart');
  if (!chartDom) return;
  
  // 销毁旧图表
  if (charts.orderStatus) {
    charts.orderStatus.dispose();
  }
  
  charts.orderStatus = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: data.map(item => item.name)
    },
    color: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#073b4c'],
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  };
  
  charts.orderStatus.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', () => {
    charts.orderStatus && charts.orderStatus.resize();
  });
};

// 渲染销售渠道图表
const renderSalesChannelChart = (data) => {
  if (!data) {
    // 使用模拟数据
    data = [
      { value: 50, name: '网站直接销售' },
      { value: 25, name: '微信小程序' },
      { value: 15, name: 'APP购买' },
      { value: 10, name: '三方平台' }
    ];
  }
  
  const chartDom = document.getElementById('sales-channel-chart');
  if (!chartDom) return;
  
  // 销毁旧图表
  if (charts.salesChannel) {
    charts.salesChannel.dispose();
  }
  
  charts.salesChannel = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '0%',
      left: 'center',
      data: data.map(item => item.name)
    },
    color: ['#3a86ff', '#8338ec', '#ff006e', '#fb5607'],
    series: [
      {
        name: '销售渠道',
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  charts.salesChannel.setOption(option);
  
  // 响应式调整
  window.addEventListener('resize', () => {
    charts.salesChannel && charts.salesChannel.resize();
  });
};

// 使用模拟数据
const useMockData = () => {
  // 模拟卡片数据
  salesStats.value[0].value = 8526.75;
  salesStats.value[1].value = 58;
  salesStats.value[2].value = 128900.50;
  salesStats.value[3].value = 286;
  
  // 模拟热销商品
  topProducts.value = generateMockProducts(10);
  
  // 渲染图表
  renderSalesTrendChart();
  renderOrderStatusChart();
  renderSalesChannelChart();
  
  // 获取模拟订单
  recentOrders.value = generateMockOrders(5);
};

// 生成模拟销售趋势数据
const generateMockSalesTrend = () => {
  const dates = [];
  const sales = [];
  const orders = [];
  
  // 根据时间范围生成不同的数据点
  let days = 30;
  if (saleTimeRange.value === 'week') {
    days = 7;
  } else if (saleTimeRange.value === 'year') {
    days = 12; // 月份
  }
  
  for (let i = 0; i < days; i++) {
    if (saleTimeRange.value === 'year') {
      dates.push(`${i+1}月`);
      sales.push(Math.floor(Math.random() * 100000) + 50000);
      orders.push(Math.floor(Math.random() * 300) + 150);
    } else {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
      sales.push(Math.floor(Math.random() * 10000) + 5000);
      orders.push(Math.floor(Math.random() * 30) + 15);
    }
  }
  
  return { dates, sales, orders };
};

// 生成模拟商品数据
const generateMockProducts = (count) => {
  const products = [];
  const productNames = [
    '婴儿奶粉', '尿不湿纸尿裤', '婴儿洗护套装', '婴儿推车', '儿童玩具套装',
    '宝宝辅食机', '婴儿床', '儿童安全座椅', '母乳喂养用品', '儿童衣服'
  ];
  
  for (let i = 0; i < count; i++) {
    products.push({
      id: i + 1,
      name: productNames[i] || `商品${i+1}`,
      image: `https://picsum.photos/id/${i+10}/100/100`,
      sales: Math.floor(Math.random() * 100) + 50,
      amount: Math.floor(Math.random() * 10000) + 5000
    });
  }
  
  return products;
};

// 生成模拟订单数据
const generateMockOrders = (count) => {
  const orders = [];
  const statuses = ['待付款', '待发货', '待收货', '已完成'];
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setHours(date.getHours() - i * 2);
    
    orders.push({
      orderNo: 'MO' + (1740000000000 + i),
      receiverName: names[Math.floor(Math.random() * names.length)],
      totalAmount: Math.floor(Math.random() * 1000) + 100,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createTime: date.toISOString().replace('T', ' ').substring(0, 19)
    });
  }
  
  return orders;
};

onMounted(() => {
  fetchSalesData();
  fetchRecentOrders();
});

onUnmounted(() => {
  // 销毁所有图表
  Object.values(charts).forEach(chart => {
    chart && chart.dispose();
  });
  
  // 移除事件监听
  window.removeEventListener('resize', () => {
    charts.salesTrend && charts.salesTrend.resize();
    charts.orderStatus && charts.orderStatus.resize();
    charts.salesChannel && charts.salesChannel.resize();
  });
});
</script>

<style lang="scss" scoped>
.sales-dashboard {
  padding: 20px;
  
  .page-title {
    margin-bottom: 20px;
    font-size: 24px;
    color: #303133;
  }
  
  .dashboard-cards {
    margin-bottom: 20px;
  }
  
  .stat-card {
    height: 120px;
    padding: 20px;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    
    .stat-icon {
      margin-right: 15px;
      border-radius: 8px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .stat-content {
      flex: 1;
      
      .stat-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
        color: #303133;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
    
    .stat-trend {
      position: absolute;
      right: 20px;
      bottom: 10px;
      font-size: 12px;
      display: flex;
      align-items: center;
      
      &.up {
        color: #67c23a;
      }
      
      &.down {
        color: #f56c6c;
      }
    }
  }
  
  .dashboard-chart-wrapper, .dashboard-bottom {
    margin-bottom: 20px;
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .product-item {
    display: flex;
    align-items: center;
    
    .product-image {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 10px;
      object-fit: cover;
    }
    
    .product-name {
      font-size: 14px;
      color: #303133;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}
</style> 