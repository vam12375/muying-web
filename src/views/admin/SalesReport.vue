<template>
  <div class="sales-report-container">
    <div class="page-header">
      <h2>销售报表</h2>
      <div class="header-actions">
        <el-select v-model="reportType" placeholder="报表类型" @change="fetchReportData">
          <el-option label="日报表" value="daily"></el-option>
          <el-option label="周报表" value="weekly"></el-option>
          <el-option label="月报表" value="monthly"></el-option>
        </el-select>
        
        <el-date-picker
          v-if="reportType === 'daily'"
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="fetchReportData"
        ></el-date-picker>
        
        <el-date-picker
          v-else
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          @change="fetchReportData"
        ></el-date-picker>
        
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else>
      <!-- 概览卡片 -->
      <el-row :gutter="20" class="overview-cards">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>总订单数</span>
                <el-tag size="small" effect="plain" type="info">{{ reportType === 'daily' ? '当日' : '周期内' }}</el-tag>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ reportType === 'daily' ? reportData.orderCount : getTotalOrders() }}</span>
              <span class="unit">单</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>总销售额</span>
                <el-tag size="small" effect="plain" type="info">{{ reportType === 'daily' ? '当日' : '周期内' }}</el-tag>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ formatCurrency(reportType === 'daily' ? reportData.totalSales : getTotalSales()) }}</span>
              <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>平均订单金额</span>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ formatCurrency(reportType === 'daily' ? reportData.avgOrderValue : getAvgOrderValue()) }}</span>
              <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>日均销售额</span>
                <el-tag size="small" effect="plain" type="info" v-if="reportType !== 'daily'">{{ reportType === 'weekly' ? '7天' : '30天' }}</el-tag>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ formatCurrency(getDailyAvgSales()) }}</span>
              <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 销售趋势图表 -->
      <el-card shadow="hover" class="chart-card" v-if="reportType !== 'daily'">
        <template #header>
          <div class="card-header">
            <span>销售趋势</span>
          </div>
        </template>
        <div ref="salesTrendChart" class="chart-container"></div>
      </el-card>
      
      <!-- 分类销售占比 -->
      <el-row :gutter="20" class="category-section">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>分类销售占比</span>
              </div>
            </template>
            <div ref="categoryPieChart" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>分类销售详情</span>
              </div>
            </template>
            <el-table :data="getCategoryTableData()" style="width: 100%">
              <el-table-column prop="category" label="商品分类"></el-table-column>
              <el-table-column prop="sales" label="销售额">
                <template #default="scope">
                  <span>{{ formatCurrency(scope.row.sales) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="percentage" label="占比">
                <template #default="scope">
                  <el-progress :percentage="scope.row.percentage" :color="scope.row.color"></el-progress>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 详细数据表格 -->
      <el-card shadow="hover" class="data-table-card" v-if="reportType !== 'daily'">
        <template #header>
          <div class="card-header">
            <span>详细销售数据</span>
            <div class="header-actions">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索日期"
                clearable
                style="width: 200px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>
        </template>
        <el-table :data="filteredReportData" style="width: 100%" border stripe>
          <el-table-column prop="date" label="日期" sortable></el-table-column>
          <el-table-column prop="orderCount" label="订单数" sortable>
            <template #default="scope">
              <span>{{ scope.row.orderCount }} 单</span>
            </template>
          </el-table-column>
          <el-table-column prop="totalSales" label="销售额" sortable>
            <template #default="scope">
              <span class="price-text">{{ formatCurrency(scope.row.totalSales) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgOrderValue" label="平均订单金额" sortable>
            <template #default="scope">
              <span>{{ formatCurrency(scope.row.avgOrderValue) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="分类占比">
            <template #default="scope">
              <el-tooltip effect="dark" placement="top">
                <template #content>
                  <div v-for="(value, key) in scope.row.categories" :key="key">
                    {{ key }}: {{ formatCurrency(value) }}
                  </div>
                </template>
                <el-button link type="primary">查看详情</el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="filteredReportData.length"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue';
import { getSalesReport } from '@/api/statistics';
import * as echarts from 'echarts/core';
import { 
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, DataZoomComponent 
} from 'echarts/components';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { Download, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 注册必需的组件
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, DataZoomComponent, BarChart, LineChart, PieChart,
  CanvasRenderer, UniversalTransition
]);

// 状态
const loading = ref(true);
const reportType = ref('weekly');
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const dateRange = ref([
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  new Date().toISOString().split('T')[0]
]);
const reportData = ref(reportType.value === 'daily' ? {} : []);
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// 图表实例
const salesTrendChart = ref(null);
const categoryPieChart = ref(null);
const chartInstances = reactive({
  salesTrend: null,
  categoryPie: null
});

// 颜色配置
const categoryColors = {
  '奶粉辅食': '#1890ff',
  '尿裤湿巾': '#52c41a',
  '喂养用品': '#faad14',
  '洗护用品': '#f5222d',
  '其他': '#722ed1'
};

// 计算属性
const filteredReportData = computed(() => {
  if (reportType.value === 'daily' || !Array.isArray(reportData.value)) {
    return [];
  }
  
  let data = [...reportData.value];
  
  if (searchKeyword.value) {
    data = data.filter(item => 
      item.date.includes(searchKeyword.value)
    );
  }
  
  return data;
});

// 方法
const fetchReportData = async () => {
  loading.value = true;
  
  try {
    const params = {
      type: reportType.value
    };
    
    if (reportType.value === 'daily') {
      params.date = selectedDate.value;
    } else {
      if (dateRange.value && dateRange.value.length === 2) {
        params.startDate = dateRange.value[0];
        params.endDate = dateRange.value[1];
      }
    }
    
    const res = await getSalesReport(params);
    
    if (res.code === 200) {
      reportData.value = res.data;
      
      nextTick(() => {
        if (reportType.value !== 'daily') {
          initSalesTrendChart();
        }
        initCategoryPieChart();
      });
    }
  } catch (error) {
    console.error('获取销售报表数据失败', error);
    ElMessage.error('获取销售报表数据失败');
  } finally {
    loading.value = false;
  }
};

const getTotalOrders = () => {
  if (!Array.isArray(reportData.value)) return 0;
  return reportData.value.reduce((sum, item) => sum + item.orderCount, 0);
};

const getTotalSales = () => {
  if (!Array.isArray(reportData.value)) return 0;
  return reportData.value.reduce((sum, item) => sum + item.totalSales, 0);
};

const getAvgOrderValue = () => {
  const totalOrders = getTotalOrders();
  const totalSales = getTotalSales();
  return totalOrders ? totalSales / totalOrders : 0;
};

const getDailyAvgSales = () => {
  if (reportType.value === 'daily') {
    return reportData.value.totalSales || 0;
  }
  
  if (!Array.isArray(reportData.value) || reportData.value.length === 0) {
    return 0;
  }
  
  const totalSales = getTotalSales();
  return totalSales / reportData.value.length;
};

const getCategoryData = () => {
  if (reportType.value === 'daily') {
    if (!reportData.value || !reportData.value.categories) {
      return [];
    }
    
    return Object.entries(reportData.value.categories).map(([name, value]) => ({
      name,
      value,
      itemStyle: {
        color: categoryColors[name] || '#999'
      }
    }));
  } else {
    if (!Array.isArray(reportData.value) || reportData.value.length === 0) {
      return [];
    }
    
    // 合并所有日期的分类数据
    const categoryTotals = {};
    
    reportData.value.forEach(item => {
      if (item.categories) {
        Object.entries(item.categories).forEach(([category, value]) => {
          categoryTotals[category] = (categoryTotals[category] || 0) + value;
        });
      }
    });
    
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      itemStyle: {
        color: categoryColors[name] || '#999'
      }
    }));
  }
};

const getCategoryTableData = () => {
  const categoryData = getCategoryData();
  const totalSales = categoryData.reduce((sum, item) => sum + item.value, 0);
  
  return categoryData.map(item => ({
    category: item.name,
    sales: item.value,
    percentage: Math.round((item.value / totalSales) * 100),
    color: categoryColors[item.name] || '#999'
  }));
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const initSalesTrendChart = () => {
  if (!salesTrendChart.value || !Array.isArray(reportData.value) || reportData.value.length === 0) {
    return;
  }
  
  if (chartInstances.salesTrend) {
    chartInstances.salesTrend.dispose();
  }
  
  chartInstances.salesTrend = echarts.init(salesTrendChart.value);
  
  const dates = reportData.value.map(item => item.date);
  const salesData = reportData.value.map(item => item.totalSales);
  const orderData = reportData.value.map(item => item.orderCount);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['销售额', '订单数'],
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
      data: dates,
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
        name: '订单数',
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
        }
      },
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: orderData,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#f5222d'
        },
        lineStyle: {
          width: 3,
          color: '#f5222d',
        }
      }
    ]
  };
  
  chartInstances.salesTrend.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.salesTrend && chartInstances.salesTrend.resize();
  });
};

const initCategoryPieChart = () => {
  if (!categoryPieChart.value) {
    return;
  }
  
  if (chartInstances.categoryPie) {
    chartInstances.categoryPie.dispose();
  }
  
  chartInstances.categoryPie = echarts.init(categoryPieChart.value);
  
  const categoryData = getCategoryData();
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '分类销售额',
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
        data: categoryData
      }
    ]
  };
  
  chartInstances.categoryPie.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.categoryPie && chartInstances.categoryPie.resize();
  });
};

const exportReport = () => {
  ElMessage.success('报表导出成功');
};

// 监听报表类型变化
watch(reportType, () => {
  fetchReportData();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchReportData();
});
</script>

<style lang="scss" scoped>
.sales-report-container {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    font-size: 24px;
  }
  
  .header-actions {
    display: flex;
    gap: 16px;
  }
}

.loading-container {
  padding: 20px;
}

.overview-cards {
  margin-bottom: 20px;
}

.overview-card {
  height: 100%;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .card-value {
    text-align: center;
    padding: 10px 0;
    
    .number {
      font-size: 28px;
      font-weight: 600;
      color: #333;
    }
    
    .unit {
      font-size: 14px;
      color: #666;
      margin-left: 5px;
    }
  }
}

.chart-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.chart-container {
  height: 350px;
  width: 100%;
}

.category-section {
  margin-bottom: 20px;
}

.data-table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.price-text {
  color: #f5222d;
  font-weight: 500;
}
</style> 