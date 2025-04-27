<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="(item, index) in statCards" :key="index">
        <el-card shadow="hover" class="data-card" :style="{ 'border-top': `3px solid ${item.color}` }">
          <div class="card-content">
            <div class="icon-container" :style="{ 'background-color': item.bgColor }">
              <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-change" :class="{'is-increase': item.change > 0, 'is-decrease': item.change < 0}">
                <el-icon v-if="item.change > 0"><ArrowUp /></el-icon>
                <el-icon v-else-if="item.change < 0"><ArrowDown /></el-icon>
                <span>{{ Math.abs(item.change) }}% </span>
                <span class="change-text">较昨日</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主要图表区域 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>销售趋势分析</span>
                <el-tag size="small" effect="plain" type="info">实时数据</el-tag>
              </div>
              <div class="header-action">
                <el-radio-group v-model="saleChartTimeRange" size="small">
                  <el-radio-button label="week">7天</el-radio-button>
                  <el-radio-button label="month">30天</el-radio-button>
                  <el-radio-button label="quarter">季度</el-radio-button>
                </el-radio-group>
                <el-button type="primary" link @click="viewSalesReport">查看详细报表</el-button>
              </div>
            </div>
          </template>
          <div ref="salesTrendChart" class="echarts-container"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>销售分布</span>
              </div>
              <div class="header-action">
                <el-select v-model="pieChartType" size="small">
                  <el-option label="商品分类" value="category"></el-option>
                  <el-option label="用户地区" value="region"></el-option>
                </el-select>
              </div>
            </div>
          </template>
          <div ref="distributionChart" class="echarts-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热销商品和用户统计 -->
    <el-row :gutter="20" class="dashboard-row">
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="data-list-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>热销商品排行</span>
              </div>
              <div class="header-action">
                <el-button type="primary" link @click="viewAllProducts">查看全部</el-button>
              </div>
            </div>
          </template>
          <div class="product-list">
            <div v-for="(item, index) in hotProducts" :key="item.id" class="product-item">
              <div class="product-rank" :class="{ 'top-three': index < 3 }">{{ index + 1 }}</div>
              <el-image :src="item.image" :alt="item.name" class="product-image"></el-image>
              <div class="product-info">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
              </div>
              <div class="product-stats">
                <div class="sales-count">
                  <el-icon><Shop /></el-icon>
                  <span>{{ item.sales }}</span>
                </div>
                <div class="rating">
                  <el-rate v-model="item.rating" disabled text-color="#ff9900" size="small"></el-rate>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card shadow="hover" class="data-list-card">
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <span>用户增长统计</span>
              </div>
              <div class="header-action">
                <el-button type="primary" link @click="refreshUserChart">刷新数据</el-button>
                <el-button type="primary" link @click="viewUserBehavior">查看详细分析</el-button>
              </div>
            </div>
          </template>
          <div ref="userGrowthChart" class="echarts-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新订单 -->
    <el-card shadow="hover" class="dashboard-row order-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <span>最新订单</span>
            <el-tag size="small" effect="plain" type="success">{{ orders.length }} 条</el-tag>
          </div>
          <div class="header-action">
            <el-button type="primary" link @click="viewAllOrders">查看全部</el-button>
          </div>
        </div>
      </template>
      <el-table :data="orders" style="width: 100%" size="large">
        <el-table-column prop="order_no" label="订单号" min-width="180"></el-table-column>
        <el-table-column prop="user_name" label="用户" min-width="120"></el-table-column>
        <el-table-column prop="total_amount" label="金额" min-width="120">
          <template #default="scope">
            <span class="price-text">¥{{ scope.row.total_amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="120">
          <template #default="scope">
            <el-tag :type="getOrderStatusType(scope.row.status)" effect="light">
              {{ getOrderStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="下单时间" min-width="180"></el-table-column>
        <el-table-column label="操作" min-width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewOrderDetail(scope.row)">详情</el-button>
            <el-button type="success" link v-if="scope.row.status === 'paid'" @click="shipOrder(scope.row)">发货</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, reactive } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts/core';
import { 
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, DataZoomComponent 
} from 'echarts/components';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  ShoppingCart, ShoppingBag, Shop, User, Goods, ArrowUp, ArrowDown, Money, 
  DataAnalysis, PieChart as PieChartIcon, TrendCharts, Box
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { 
  getDashboardOverview, 
  getSalesTrend, 
  getSalesDistribution, 
  getHotProducts, 
  getUserGrowth, 
  getLatestOrders 
} from '@/api/statistics';

// 注册必需的组件
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, DataZoomComponent, BarChart, LineChart, PieChart,
  CanvasRenderer, UniversalTransition
]);

const router = useRouter();
const salesTrendChart = ref(null);
const distributionChart = ref(null);
const userGrowthChart = ref(null);
const saleChartTimeRange = ref('week');
const pieChartType = ref('category');

// 图表实例
const chartInstances = reactive({
  salesTrend: null,
  distribution: null,
  userGrowth: null
});

// 统计卡片数据
const statCards = ref([
  {
    title: '总订单数',
    value: 1234,
    change: 5.2,
    icon: 'ShoppingCart',
    color: '#1890ff',
    bgColor: 'rgba(24, 144, 255, 0.1)'
  },
  {
    title: '总销售额',
    value: '¥45,678',
    change: 3.8,
    icon: 'Money',
    color: '#52c41a',
    bgColor: 'rgba(82, 196, 26, 0.1)'
  },
  {
    title: '用户数量',
    value: 3456,
    change: 2.5,
    icon: 'User',
    color: '#faad14',
    bgColor: 'rgba(250, 173, 20, 0.1)'
  },
  {
    title: '商品数量',
    value: 789,
    change: -1.2,
    icon: 'Goods',
    color: '#f5222d',
    bgColor: 'rgba(245, 34, 45, 0.1)'
  }
]);

// 热销商品数据
const hotProducts = ref([
  {
    id: 1,
    name: '益生菌原味冲剂',
    image: '../assets/img/goods/goods1.jpg',
    price: 258,
    sales: 256,
    rating: 4.8
  },
  {
    id: 2,
    name: '液体钙+维生素D3营养液',
    image: '../assets/img/goods/goods2.jpg',
    price: 99,
    sales: 198,
    rating: 4.6
  },
  {
    id: 3,
    name: 'DHA藻油软胶囊',
    image: '../assets/img/goods/goods3.jpg',
    price: 79,
    sales: 167,
    rating: 4.5
  },
  {
    id: 4,
    name: '新安怡奶瓶',
    image: '../assets/img/goods/goods4.jpg',
    price: 69,
    sales: 145,
    rating: 4.9
  },
  {
    id: 5,
    name: '花王纸尿裤L码',
    image: '../assets/img/goods/goods5.jpg',
    price: 139,
    sales: 123,
    rating: 4.7
  }
]);

// 订单数据
const orders = ref([
  {
    order_no: 'DD20231001001',
    user_name: '张三',
    total_amount: 299,
    status: 'pending',
    create_time: '2023-10-01 10:23:45'
  },
  {
    order_no: 'DD20231001002',
    user_name: '李四',
    total_amount: 599,
    status: 'paid',
    create_time: '2023-10-01 11:12:33'
  },
  {
    order_no: 'DD20231002001',
    user_name: '王五',
    total_amount: 899,
    status: 'shipped',
    create_time: '2023-10-02 09:45:12'
  },
  {
    order_no: 'DD20231002002',
    user_name: '赵六',
    total_amount: 499,
    status: 'completed',
    create_time: '2023-10-02 15:36:21'
  },
  {
    order_no: 'DD20231003001',
    user_name: '周七',
    total_amount: 199,
    status: 'cancelled',
    create_time: '2023-10-03 08:22:18'
  }
]);

// 订单状态
const getOrderStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'success',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'info'
  };
  return typeMap[status] || 'info';
};

const getOrderStatusText = (status) => {
  const textMap = {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || '未知状态';
};

// 初始化销售趋势图表
const initSalesTrendChart = () => {
  const chartDom = salesTrendChart.value;
  if (!chartDom) return;
  
  chartInstances.salesTrend = echarts.init(chartDom);
  updateSalesTrendChart();
  
  window.addEventListener('resize', () => {
    chartInstances.salesTrend && chartInstances.salesTrend.resize();
  });
};

// 更新销售趋势图表数据
const updateSalesTrendChart = () => {
  if (!chartInstances.salesTrend) return;
  
  let xAxisData = [];
  let salesData = [];
  let orderCountData = [];
  
  if (saleChartTimeRange.value === 'week') {
    xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    salesData = [4200, 5800, 5000, 6500, 7900, 8500, 9000];
    orderCountData = [42, 58, 50, 65, 79, 85, 90];
  } else if (saleChartTimeRange.value === 'month') {
    xAxisData = Array.from({length: 30}, (_, i) => `${i+1}日`);
    salesData = Array.from({length: 30}, () => Math.floor(Math.random() * 5000) + 3000);
    orderCountData = Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 30);
  } else {
    xAxisData = ['1月', '2月', '3月'];
    salesData = [120000, 132000, 145000];
    orderCountData = [1200, 1320, 1450];
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['销售额', '订单量'],
      right: 10,
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#1890ff'
          }
        },
        axisLabel: {
          formatter: '{value} 元'
        }
      },
      {
        type: 'value',
        name: '订单量',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#f5222d'
          }
        },
        axisLabel: {
          formatter: '{value} 单'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        barWidth: '40%',
        data: salesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#36cfc9' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#069eff' },
              { offset: 1, color: '#12bdb8' }
            ])
          }
        }
      },
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: orderCountData,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#f5222d'
        },
        lineStyle: {
          width: 3,
          color: '#f5222d',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
            { offset: 1, color: 'rgba(245, 34, 45, 0.1)' }
          ])
        }
      }
    ]
  };
  
  chartInstances.salesTrend.setOption(option);
};

// 初始化分布图表
const initDistributionChart = () => {
  const chartDom = distributionChart.value;
  if (!chartDom) return;
  
  chartInstances.distribution = echarts.init(chartDom);
  updateDistributionChart();
  
  window.addEventListener('resize', () => {
    chartInstances.distribution && chartInstances.distribution.resize();
  });
};

// 更新分布图表数据
const updateDistributionChart = () => {
  if (!chartInstances.distribution) return;
  
  let pieData = [];
  
  if (pieChartType.value === 'category') {
    pieData = [
      { value: 38, name: '奶粉辅食' },
      { value: 25, name: '尿裤湿巾' },
      { value: 15, name: '喂养用品' },
      { value: 12, name: '洗护用品' },
      { value: 10, name: '其他' }
    ];
  } else {
    pieData = [
      { value: 45, name: '华东' },
      { value: 20, name: '华南' },
      { value: 18, name: '华北' },
      { value: 12, name: '西南' },
      { value: 5, name: '其他' }
    ];
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: pieChartType.value === 'category' ? '商品分类' : '用户地区',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
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
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };
  
  chartInstances.distribution.setOption(option);
};

// 初始化用户增长图表
const initUserGrowthChart = () => {
  const chartDom = userGrowthChart.value;
  if (!chartDom) return;
  
  chartInstances.userGrowth = echarts.init(chartDom);
  
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const newUsers = [120, 132, 101, 134, 90, 130];
  const activeUsers = [220, 182, 191, 234, 290, 330];
  
  const option = {
    title: {
      text: '用户数据统计',
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['新增用户', '活跃用户'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        stack: 'total',
        barWidth: '30%',
        emphasis: {
          focus: 'series'
        },
        data: newUsers,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '活跃用户',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: activeUsers,
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  };
  
  chartInstances.userGrowth.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.userGrowth && chartInstances.userGrowth.resize();
  });
};

// 刷新用户图表数据
const refreshUserChart = () => {
  if (!chartInstances.userGrowth) return;
  
  const newUsers = Array.from({length: 6}, () => Math.floor(Math.random() * 50) + 100);
  const activeUsers = Array.from({length: 6}, () => Math.floor(Math.random() * 100) + 200);
  
  chartInstances.userGrowth.setOption({
    series: [
      {
        data: newUsers
      },
      {
        data: activeUsers
      }
    ]
  });
};

// 页面跳转
const viewAllOrders = () => {
  router.push('/admin/orders');
};

const viewOrderDetail = (order) => {
  router.push(`/admin/orders/${order.order_no}`);
};

const viewAllProducts = () => {
  router.push('/admin/products');
};

const shipOrder = (order) => {
  order.status = 'shipped';
  ElMessage.success(`订单 ${order.order_no} 已发货`);
};

// 添加数据获取方法
const fetchDashboardData = async () => {
  try {
    // 获取概览数据
    const overviewRes = await getDashboardOverview();
    if (overviewRes.code === 200) {
      statCards.value = [
        {
          title: '总订单数',
          value: overviewRes.data.totalOrders,
          change: overviewRes.data.orderChange,
          icon: 'ShoppingCart',
          color: '#1890ff',
          bgColor: 'rgba(24, 144, 255, 0.1)'
        },
        {
          title: '总销售额',
          value: `¥${overviewRes.data.totalSales}`,
          change: overviewRes.data.salesChange,
          icon: 'Money',
          color: '#52c41a',
          bgColor: 'rgba(82, 196, 26, 0.1)'
        },
        {
          title: '用户数量',
          value: overviewRes.data.totalUsers,
          change: overviewRes.data.userChange,
          icon: 'User',
          color: '#faad14',
          bgColor: 'rgba(250, 173, 20, 0.1)'
        },
        {
          title: '商品数量',
          value: overviewRes.data.totalProducts,
          change: overviewRes.data.productChange,
          icon: 'Goods',
          color: '#f5222d',
          bgColor: 'rgba(245, 34, 45, 0.1)'
        }
      ];
    }

    // 获取销售趋势数据
    const trendRes = await getSalesTrend({ timeRange: saleChartTimeRange.value });
    if (trendRes.code === 200) {
      updateSalesTrendChartWithData(trendRes.data);
    } else {
      initSalesTrendChart();
    }

    // 获取销售分布数据
    const distributionRes = await getSalesDistribution({ type: pieChartType.value });
    if (distributionRes.code === 200) {
      updateDistributionChartWithData(distributionRes.data);
    } else {
      initDistributionChart();
    }

    // 获取热销商品数据
    const hotProductsRes = await getHotProducts({ limit: 5 });
    if (hotProductsRes.code === 200) {
      hotProducts.value = hotProductsRes.data;
    }

    // 获取用户增长数据
    const userGrowthRes = await getUserGrowth();
    if (userGrowthRes.code === 200) {
      updateUserGrowthChartWithData(userGrowthRes.data);
    } else {
      initUserGrowthChart();
    }

    // 获取最新订单数据
    const ordersRes = await getLatestOrders({ limit: 5 });
    if (ordersRes.code === 200) {
      orders.value = ordersRes.data;
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error);
    // 初始化默认图表
    initSalesTrendChart();
    initDistributionChart();
    initUserGrowthChart();
  }
};

// 添加更新图表的方法
const updateSalesTrendChartWithData = (data) => {
  if (!chartInstances.salesTrend) {
    chartInstances.salesTrend = echarts.init(salesTrendChart.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['销售额', '订单量'],
      right: 10,
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#1890ff'
          }
        },
        axisLabel: {
          formatter: '{value} 元'
        }
      },
      {
        type: 'value',
        name: '订单量',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#f5222d'
          }
        },
        axisLabel: {
          formatter: '{value} 单'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'bar',
        barWidth: '40%',
        data: data.series[0].data,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1890ff' },
            { offset: 1, color: '#36cfc9' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#069eff' },
              { offset: 1, color: '#12bdb8' }
            ])
          }
        }
      },
      {
        name: '订单量',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.series[1].data,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#f5222d'
        },
        lineStyle: {
          width: 3,
          color: '#f5222d',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
            { offset: 1, color: 'rgba(245, 34, 45, 0.1)' }
          ])
        }
      }
    ]
  };
  
  chartInstances.salesTrend.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.salesTrend && chartInstances.salesTrend.resize();
  });
};

const updateDistributionChartWithData = (data) => {
  if (!chartInstances.distribution) {
    chartInstances.distribution = echarts.init(distributionChart.value);
  }
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: pieChartType.value === 'category' ? '商品分类' : '用户地区',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['65%', '50%'],
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
            fontSize: '16',
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
  
  chartInstances.distribution.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.distribution && chartInstances.distribution.resize();
  });
};

const updateUserGrowthChartWithData = (data) => {
  if (!chartInstances.userGrowth) {
    chartInstances.userGrowth = echarts.init(userGrowthChart.value);
  }
  
  const option = {
    title: {
      text: '用户数据统计',
      left: 'center',
      top: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['新增用户', '活跃用户'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        stack: 'total',
        barWidth: '30%',
        emphasis: {
          focus: 'series'
        },
        data: data.series[0].data,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '活跃用户',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: data.series[1].data,
        itemStyle: {
          color: '#52c41a'
        }
      }
    ]
  };
  
  chartInstances.userGrowth.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.userGrowth && chartInstances.userGrowth.resize();
  });
};

// 监听图表数据变化
watch(saleChartTimeRange, async () => {
  try {
    const res = await getSalesTrend({ timeRange: saleChartTimeRange.value });
    if (res.code === 200) {
      updateSalesTrendChartWithData(res.data);
    }
  } catch (error) {
    console.error('获取销售趋势数据失败', error);
  }
});

watch(pieChartType, async () => {
  try {
    const res = await getSalesDistribution({ type: pieChartType.value });
    if (res.code === 200) {
      updateDistributionChartWithData(res.data);
    }
  } catch (error) {
    console.error('获取销售分布数据失败', error);
  }
});

// 添加跳转到详细报表的方法
const viewSalesReport = () => {
  router.push('/admin/sales-report');
};

const viewUserBehavior = () => {
  router.push('/admin/user-behavior');
};

// 在template中添加跳转按钮
// 在销售趋势分析卡片的header-action中添加
// <div class="header-action">
//   <el-radio-group v-model="saleChartTimeRange" size="small">
//     <el-radio-button label="week">7天</el-radio-button>
//     <el-radio-button label="month">30天</el-radio-button>
//     <el-radio-button label="quarter">季度</el-radio-button>
//   </el-radio-group>
//   <el-button type="primary" link @click="viewSalesReport">查看详细报表</el-button>
// </div>

// 在用户增长统计卡片的header-action中添加
// <div class="header-action">
//   <el-button type="primary" link @click="refreshUserChart">刷新数据</el-button>
//   <el-button type="primary" link @click="viewUserBehavior">查看详细分析</el-button>
// </div>

// 替换原有的数据获取方法
// 在onMounted函数中添加数据获取
onMounted(() => {
  fetchDashboardData();
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 16px;
}

.dashboard-row {
  margin-bottom: 20px;
}

.echarts-container {
  height: 350px;
  width: 100%;
}

.data-card {
  height: 100%;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
  
  .card-content {
    display: flex;
    align-items: center;
    
    .icon-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 12px;
      margin-right: 16px;
    }
    
    .stat-content {
      flex: 1;
      
      .stat-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .stat-change {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #999;
        
        &.is-increase {
          color: #52c41a;
        }
        
        &.is-decrease {
          color: #f5222d;
        }
        
        .change-text {
          color: #999;
        }
      }
    }
  }
}

.chart-card {
  height: 100%;
}

.data-list-card {
  height: 100%;
  
  .product-list {
    height: 350px;
    overflow-y: auto;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    font-size: 16px;
  }
}

.product-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .product-rank {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-right: 12px;
    font-weight: 600;
    font-size: 14px;
    
    &.top-three {
      color: #fff;
      
      &:nth-of-type(1) {
        background-color: #f5222d;
      }
      
      &:nth-of-type(2) {
        background-color: #fa8c16;
      }
      
      &:nth-of-type(3) {
        background-color: #faad14;
      }
    }
  }
  
  .product-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 12px;
    border: 1px solid #f0f0f0;
  }
  
  .product-info {
    flex: 1;
    
    .product-name {
      font-size: 14px;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .product-price {
      font-size: 14px;
      color: #f5222d;
      font-weight: 500;
    }
  }
  
  .product-stats {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    
    .sales-count {
      display: flex;
      align-items: center;
      color: #999;
      font-size: 13px;
      margin-bottom: 4px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

.price-text {
  color: #f5222d;
  font-weight: 500;
}

.order-card {
  .el-table {
    --el-table-row-hover-bg-color: #f5f7fa;
  }
}
</style> 