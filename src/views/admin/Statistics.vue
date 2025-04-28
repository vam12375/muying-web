<template>
  <div class="statistics-container">
    <!-- 顶部筛选器 -->
    <div class="filter-section">
      <div class="date-range">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :shortcuts="dateShortcuts"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- 仪表盘概览 -->
    <div class="dashboard-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in overviewData" :key="item.title">
          <el-card class="overview-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon" :class="item.icon"></div>
              <div class="card-info">
                <div class="card-title">{{ item.title }}</div>
                <div class="card-value">{{ item.value }}</div>
                <div class="card-change" :class="{ 'positive': item.change > 0, 'negative': item.change < 0 }">
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 销售趋势图表 -->
    <div class="chart-section">
      <el-card class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>销售趋势</span>
            <el-radio-group v-model="salesTimeRange" size="small" @change="handleSalesRangeChange">
              <el-radio-button label="week">近7天</el-radio-button>
              <el-radio-button label="month">近30天</el-radio-button>
              <el-radio-button label="quarter">本季度</el-radio-button>
              <el-radio-button label="year">本年度</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div class="chart-container">
          <div ref="salesTrendChart" style="width: 100%; height: 400px;"></div>
        </div>
      </el-card>
    </div>

    <!-- 销售分布和热门商品 -->
    <el-row :gutter="20" class="data-section">
      <el-col :span="12">
        <el-card class="distribution-card">
          <template #header>
            <div class="card-header">
              <span>销售分布</span>
              <el-select v-model="distributionDimension" size="small" @change="handleDistributionChange">
                <el-option label="按品类" value="category" />
                <el-option label="按区域" value="region" />
                <el-option label="按年龄段" value="age" />
              </el-select>
            </div>
          </template>
          <div ref="salesDistributionChart" style="width: 100%; height: 300px;"></div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="hot-products-card">
          <template #header>
            <div class="card-header">
              <span>热门商品</span>
              <el-select v-model="hotProductsLimit" size="small" @change="loadHotProducts">
                <el-option label="TOP 5" :value="5" />
                <el-option label="TOP 10" :value="10" />
                <el-option label="TOP 20" :value="20" />
              </el-select>
            </div>
          </template>
          <el-table :data="hotProducts" style="width: 100%">
            <el-table-column prop="rank" label="排名" width="80" />
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="sales" label="销量" width="100" />
            <el-table-column prop="amount" label="销售额" width="120" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户分析 -->
    <div class="user-analysis-section">
      <el-card class="user-card">
        <template #header>
          <div class="card-header">
            <span>用户分析</span>
            <el-tabs v-model="userAnalysisTab" @tab-click="handleUserAnalysisTabChange">
              <el-tab-pane label="用户增长" name="growth" />
              <el-tab-pane label="用户行为" name="behavior" />
              <el-tab-pane label="用户画像" name="portrait" />
            </el-tabs>
          </div>
        </template>
        <div class="user-analysis-content">
          <div v-if="userAnalysisTab === 'growth'" ref="userGrowthChart" style="width: 100%; height: 300px;"></div>
          <div v-else-if="userAnalysisTab === 'behavior'" ref="userBehaviorChart" style="width: 100%; height: 300px;"></div>
          <div v-else class="user-portrait">
            <!-- 用户画像内容 -->
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最新订单 -->
    <div class="latest-orders-section">
      <el-card class="orders-card">
        <template #header>
          <div class="card-header">
            <span>最新订单</span>
            <el-button link @click="viewAllOrders">查看全部</el-button>
          </div>
        </template>
        <el-table :data="latestOrders" style="width: 100%">
          <el-table-column prop="orderNo" label="订单号" width="180" />
          <el-table-column prop="createTime" label="下单时间" width="160" />
          <el-table-column prop="userName" label="用户" width="120" />
          <el-table-column prop="amount" label="金额" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getOrderStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button link @click="viewOrderDetail(scope.row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import {
  getDashboardOverview,
  getSalesTrend,
  getSalesDistribution,
  getHotProducts,
  getUserGrowth,
  getUserBehaviorAnalysis,
  getLatestOrders
} from '@/api/statistics';

export default {
  name: 'Statistics',
  
  setup() {
    const router = useRouter();
    
    // 图表实例
    const salesTrendChart = ref(null);
    const salesDistributionChart = ref(null);
    const userGrowthChart = ref(null);
    const userBehaviorChart = ref(null);
    let chartInstances = {};
    
    // 日期范围
    const dateRange = ref([]);
    const dateShortcuts = [
      {
        text: '最近一周',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          return [start, end];
        },
      },
      {
        text: '最近一月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          return [start, end];
        },
      },
      {
        text: '最近三月',
        value: () => {
          const end = new Date();
          const start = new Date();
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
          return [start, end];
        },
      },
    ];
    
    // 概览数据
    const overviewData = ref([
      { title: '总销售额', value: '¥0', change: 0, icon: 'sales-icon' },
      { title: '总订单数', value: '0', change: 0, icon: 'orders-icon' },
      { title: '用户数量', value: '0', change: 0, icon: 'users-icon' },
      { title: '商品数量', value: '0', change: 0, icon: 'products-icon' },
    ]);
    
    // 销售趋势
    const salesTimeRange = ref('week');
    
    // 销售分布
    const distributionDimension = ref('category');
    
    // 热门商品
    const hotProductsLimit = ref(10);
    const hotProducts = ref([]);
    
    // 用户分析
    const userAnalysisTab = ref('growth');
    
    // 最新订单
    const latestOrders = ref([]);
    
    // 初始化图表
    const initCharts = () => {
      // 销售趋势图表
      chartInstances.salesTrend = echarts.init(salesTrendChart.value);
      
      // 销售分布图表
      chartInstances.salesDistribution = echarts.init(salesDistributionChart.value);
      
      // 用户增长图表
      chartInstances.userGrowth = echarts.init(userGrowthChart.value);
      
      // 用户行为图表
      chartInstances.userBehavior = echarts.init(userBehaviorChart.value);
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
    };
    
    // 加载数据
    const loadData = async () => {
      try {
        // 加载概览数据
        const overviewResult = await getDashboardOverview();
        if (overviewResult.code === 200) {
          overviewData.value = overviewResult.data;
        }
        
        // 加载销售趋势
        await loadSalesTrend();
        
        // 加载销售分布
        await loadSalesDistribution();
        
        // 加载热门商品
        await loadHotProducts();
        
        // 加载用户分析数据
        await loadUserAnalysis();
        
        // 加载最新订单
        await loadLatestOrders();
        
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    };
    
    // 加载销售趋势数据
    const loadSalesTrend = async () => {
      try {
        const result = await getSalesTrend({
          timeRange: salesTimeRange.value,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        });
        
        if (result.code === 200) {
          updateSalesTrendChart(result.data);
        }
      } catch (error) {
        console.error('加载销售趋势数据失败:', error);
      }
    };
    
    // 更新销售趋势图表
    const updateSalesTrendChart = (data) => {
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['销售额', '订单数']
        },
        xAxis: {
          type: 'category',
          data: data.xAxis
        },
        yAxis: [
          {
            type: 'value',
            name: '销售额',
            axisLabel: {
              formatter: '¥{value}'
            }
          },
          {
            type: 'value',
            name: '订单数',
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '销售额',
            type: 'line',
            data: data.salesData
          },
          {
            name: '订单数',
            type: 'bar',
            yAxisIndex: 1,
            data: data.orderData
          }
        ]
      };
      
      chartInstances.salesTrend.setOption(option);
    };
    
    // 加载销售分布数据
    const loadSalesDistribution = async () => {
      try {
        const result = await getSalesDistribution({
          dimension: distributionDimension.value,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        });
        
        if (result.code === 200) {
          updateSalesDistributionChart(result.data);
        }
      } catch (error) {
        console.error('加载销售分布数据失败:', error);
      }
    };
    
    // 更新销售分布图表
    const updateSalesDistributionChart = (data) => {
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          data: data.legend
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data.series
          }
        ]
      };
      
      chartInstances.salesDistribution.setOption(option);
    };
    
    // 加载热门商品数据
    const loadHotProducts = async () => {
      try {
        const result = await getHotProducts({
          limit: hotProductsLimit.value,
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        });
        
        if (result.code === 200) {
          hotProducts.value = result.data;
        }
      } catch (error) {
        console.error('加载热门商品数据失败:', error);
      }
    };
    
    // 加载用户分析数据
    const loadUserAnalysis = async () => {
      if (userAnalysisTab.value === 'growth') {
        await loadUserGrowth();
      } else if (userAnalysisTab.value === 'behavior') {
        await loadUserBehavior();
      }
    };
    
    // 加载用户增长数据
    const loadUserGrowth = async () => {
      try {
        const result = await getUserGrowth({
          timeRange: 'month',
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        });
        
        if (result.code === 200) {
          updateUserGrowthChart(result.data);
        }
      } catch (error) {
        console.error('加载用户增长数据失败:', error);
      }
    };
    
    // 更新用户增长图表
    const updateUserGrowthChart = (data) => {
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['新增用户', '活跃用户']
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
            type: 'line',
            data: data.newUsers
          },
          {
            name: '活跃用户',
            type: 'line',
            data: data.activeUsers
          }
        ]
      };
      
      chartInstances.userGrowth.setOption(option);
    };
    
    // 加载用户行为数据
    const loadUserBehavior = async () => {
      try {
        const result = await getUserBehaviorAnalysis({
          type: 'all',
          startDate: dateRange.value[0],
          endDate: dateRange.value[1]
        });
        
        if (result.code === 200) {
          updateUserBehaviorChart(result.data);
        }
      } catch (error) {
        console.error('加载用户行为数据失败:', error);
      }
    };
    
    // 更新用户行为图表
    const updateUserBehaviorChart = (data) => {
      const option = {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            name: '用户行为',
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
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: data.behaviors
          }
        ]
      };
      
      chartInstances.userBehavior.setOption(option);
    };
    
    // 加载最新订单数据
    const loadLatestOrders = async () => {
      try {
        const result = await getLatestOrders({ limit: 10 });
        if (result.code === 200) {
          latestOrders.value = result.data;
        }
      } catch (error) {
        console.error('加载最新订单数据失败:', error);
      }
    };
    
    // 处理窗口大小变化
    const handleResize = () => {
      Object.values(chartInstances).forEach(chart => {
        chart && chart.resize();
      });
    };
    
    // 日期变化处理
    const handleDateChange = () => {
      loadData();
    };
    
    // 销售时间范围变化处理
    const handleSalesRangeChange = () => {
      loadSalesTrend();
    };
    
    // 销售分布维度变化处理
    const handleDistributionChange = () => {
      loadSalesDistribution();
    };
    
    // 用户分析标签页变化处理
    const handleUserAnalysisTabChange = () => {
      loadUserAnalysis();
    };
    
    // 查看订单详情
    const viewOrderDetail = (order) => {
      router.push({
        path: '/orders/detail',
        query: { orderId: order.orderNo }
      });
    };
    
    // 查看全部订单
    const viewAllOrders = () => {
      router.push('/orders');
    };
    
    // 获取订单状态样式
    const getOrderStatusType = (status) => {
      const statusMap = {
        'pending': 'warning',
        'processing': 'primary',
        'completed': 'success',
        'cancelled': 'info',
        'refunded': 'danger'
      };
      return statusMap[status] || 'info';
    };
    
    onMounted(() => {
      initCharts();
      loadData();
    });
    
    onUnmounted(() => {
      // 销毁图表实例
      Object.values(chartInstances).forEach(chart => {
        chart && chart.dispose();
      });
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      dateRange,
      dateShortcuts,
      overviewData,
      salesTimeRange,
      distributionDimension,
      hotProductsLimit,
      hotProducts,
      userAnalysisTab,
      latestOrders,
      salesTrendChart,
      salesDistributionChart,
      userGrowthChart,
      userBehaviorChart,
      handleDateChange,
      handleSalesRangeChange,
      handleDistributionChange,
      handleUserAnalysisTabChange,
      viewOrderDetail,
      viewAllOrders,
      getOrderStatusType
    };
  }
};
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
}

.dashboard-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 120px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-icon {
  width: 48px;
  height: 48px;
  margin-right: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.sales-icon {
  background-color: #e6f7ff;
  color: #1890ff;
}

.orders-icon {
  background-color: #fff7e6;
  color: #fa8c16;
}

.users-icon {
  background-color: #f6ffed;
  color: #52c41a;
}

.products-icon {
  background-color: #fff1f0;
  color: #f5222d;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-change {
  font-size: 12px;
}

.positive {
  color: #52c41a;
}

.negative {
  color: #f5222d;
}

.chart-section {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-section {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-analysis-section {
  margin-bottom: 20px;
}

.user-analysis-content {
  min-height: 300px;
}

.latest-orders-section {
  margin-bottom: 20px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .el-col-6 {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .el-col-6 {
    width: 100%;
  }
  
  .data-section .el-col-12 {
    width: 100%;
  }
}
</style> 