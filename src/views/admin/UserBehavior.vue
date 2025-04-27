<template>
  <div class="user-behavior-container">
    <div class="page-header">
      <h2>用户行为分析</h2>
      <div class="header-actions">
        <el-select v-model="timeRange" placeholder="时间范围" @change="fetchBehaviorData">
          <el-option label="最近7天" value="week"></el-option>
          <el-option label="最近30天" value="month"></el-option>
          <el-option label="最近季度" value="quarter"></el-option>
          <el-option label="最近一年" value="year"></el-option>
        </el-select>
        
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
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
                <span>总浏览量</span>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ behaviorData.pageViews?.total || 0 }}</span>
              <span class="unit">次</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>平均停留时间</span>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ formatDuration(behaviorData.pageViews?.avgDuration || 0) }}</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>跳出率</span>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ behaviorData.pageViews?.bounceRate || 0 }}%</span>
            </div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" class="overview-card">
            <template #header>
              <div class="card-header">
                <span>转化率</span>
              </div>
            </template>
            <div class="card-value">
              <span class="number">{{ behaviorData.userEngagement?.conversionRate || 0 }}%</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 用户漏斗分析 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户转化漏斗</span>
          </div>
        </template>
        <div ref="funnelChart" class="chart-container"></div>
      </el-card>
      
      <!-- 页面访问和设备分析 -->
      <el-row :gutter="20" class="analysis-section">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>热门页面</span>
              </div>
            </template>
            <el-table :data="behaviorData.pageViews?.topPages || []" style="width: 100%">
              <el-table-column prop="page" label="页面"></el-table-column>
              <el-table-column prop="views" label="浏览量" sortable></el-table-column>
              <el-table-column prop="avgDuration" label="平均停留时间">
                <template #default="scope">
                  <span>{{ formatDuration(scope.row.avgDuration) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>设备分布</span>
              </div>
            </template>
            <div ref="deviceChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 搜索分析 -->
      <el-row :gutter="20" class="analysis-section">
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>热门搜索词</span>
              </div>
            </template>
            <div ref="keywordChart" class="chart-container"></div>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span>无结果搜索词</span>
                <el-tooltip content="这些搜索词没有返回任何结果，可能需要添加相关商品或优化搜索算法" placement="top">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            <el-table :data="behaviorData.searchAnalysis?.noResultsKeywords || []" style="width: 100%">
              <el-table-column prop="keyword" label="搜索词"></el-table-column>
              <el-table-column prop="count" label="搜索次数" sortable></el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button type="primary" link @click="handleAddProduct(scope.row)">添加商品</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 用户参与度 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户参与度</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <div class="engagement-item">
              <div class="item-title">平均会话时长</div>
              <div class="item-value">{{ formatDuration(behaviorData.userEngagement?.avgSessionDuration || 0) }}</div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <div class="engagement-item">
              <div class="item-title">人均会话数</div>
              <div class="item-value">{{ behaviorData.userEngagement?.avgSessionsPerUser || 0 }}</div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <div class="engagement-item">
              <div class="item-title">回访率</div>
              <div class="item-value">{{ behaviorData.userEngagement?.returnRate || 0 }}%</div>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <div class="engagement-item">
              <div class="item-title">人均搜索次数</div>
              <div class="item-value">{{ behaviorData.searchAnalysis?.avgSearchesPerUser || 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 浏览器分布 -->
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>浏览器分布</span>
          </div>
        </template>
        <div ref="browserChart" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { getUserBehaviorAnalysis } from '@/api/statistics';
import * as echarts from 'echarts/core';
import { 
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent 
} from 'echarts/components';
import { BarChart, PieChart, FunnelChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { Download, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 注册必需的组件
echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent,
  ToolboxComponent, BarChart, PieChart, FunnelChart,
  CanvasRenderer, UniversalTransition
]);

// 状态
const loading = ref(true);
const timeRange = ref('month');
const behaviorData = ref({});

// 图表实例
const funnelChart = ref(null);
const deviceChart = ref(null);
const keywordChart = ref(null);
const browserChart = ref(null);
const chartInstances = reactive({
  funnel: null,
  device: null,
  keyword: null,
  browser: null
});

// 方法
const fetchBehaviorData = async () => {
  loading.value = true;
  
  try {
    const res = await getUserBehaviorAnalysis({
      timeRange: timeRange.value
    });
    
    if (res.code === 200) {
      behaviorData.value = res.data;
      
      nextTick(() => {
        initFunnelChart();
        initDeviceChart();
        initKeywordChart();
        initBrowserChart();
      });
    }
  } catch (error) {
    console.error('获取用户行为分析数据失败', error);
    ElMessage.error('获取用户行为分析数据失败');
  } finally {
    loading.value = false;
  }
};

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes}分`;
  }
};

const initFunnelChart = () => {
  if (!funnelChart.value || !behaviorData.value.funnelAnalysis) {
    return;
  }
  
  if (chartInstances.funnel) {
    chartInstances.funnel.dispose();
  }
  
  chartInstances.funnel = echarts.init(funnelChart.value);
  
  const funnelData = behaviorData.value.funnelAnalysis.steps.map(item => ({
    value: item.value,
    name: `${item.name} (${item.conversionRate}%)`
  }));
  
  const option = {
    title: {
      text: '用户行为漏斗',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c}'
    },
    legend: {
      data: funnelData.map(item => item.name),
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '转化漏斗',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: funnelData[0].value,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: funnelData
      }
    ]
  };
  
  chartInstances.funnel.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.funnel && chartInstances.funnel.resize();
  });
};

const initDeviceChart = () => {
  if (!deviceChart.value || !behaviorData.value.deviceAnalysis) {
    return;
  }
  
  if (chartInstances.device) {
    chartInstances.device.dispose();
  }
  
  chartInstances.device = echarts.init(deviceChart.value);
  
  const deviceData = behaviorData.value.deviceAnalysis.devices;
  
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
        name: '设备分布',
        type: 'pie',
        radius: '55%',
        center: ['60%', '50%'],
        data: deviceData,
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
  
  chartInstances.device.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.device && chartInstances.device.resize();
  });
};

const initKeywordChart = () => {
  if (!keywordChart.value || !behaviorData.value.searchAnalysis) {
    return;
  }
  
  if (chartInstances.keyword) {
    chartInstances.keyword.dispose();
  }
  
  chartInstances.keyword = echarts.init(keywordChart.value);
  
  const keywordData = behaviorData.value.searchAnalysis.topKeywords.map(item => ({
    name: item.keyword,
    value: item.count
  }));
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c}次'
    },
    series: [
      {
        type: 'wordCloud',
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '90%',
        height: '90%',
        right: null,
        bottom: null,
        sizeRange: [12, 30],
        rotationRange: [-90, 90],
        rotationStep: 45,
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          color: function () {
            return 'rgb(' + [
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160),
              Math.round(Math.random() * 160)
            ].join(',') + ')';
          }
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: '#333'
          }
        },
        data: keywordData
      }
    ]
  };
  
  // 如果没有词云图，使用柱状图代替
  if (!echarts.getMap('wordCloud')) {
    const barOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: keywordData.map(item => item.name),
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '搜索次数',
          type: 'bar',
          data: keywordData.map(item => item.value),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          }
        }
      ]
    };
    
    chartInstances.keyword.setOption(barOption);
  } else {
    chartInstances.keyword.setOption(option);
  }
  
  window.addEventListener('resize', () => {
    chartInstances.keyword && chartInstances.keyword.resize();
  });
};

const initBrowserChart = () => {
  if (!browserChart.value || !behaviorData.value.deviceAnalysis) {
    return;
  }
  
  if (chartInstances.browser) {
    chartInstances.browser.dispose();
  }
  
  chartInstances.browser = echarts.init(browserChart.value);
  
  const browserData = behaviorData.value.deviceAnalysis.browsers;
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom'
    },
    series: [
      {
        name: '浏览器分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
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
        data: browserData
      }
    ]
  };
  
  chartInstances.browser.setOption(option);
  
  window.addEventListener('resize', () => {
    chartInstances.browser && chartInstances.browser.resize();
  });
};

const handleAddProduct = (keyword) => {
  ElMessageBox.confirm(
    `是否要为搜索词 "${keyword.keyword}" 添加相关商品？`,
    '添加商品',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: '已创建添加商品任务'
      });
    })
    .catch(() => {});
};

const exportData = () => {
  ElMessage.success('数据导出成功');
};

// 组件挂载时获取数据
onMounted(() => {
  fetchBehaviorData();
});
</script>

<style lang="scss" scoped>
.user-behavior-container {
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
    align-items: center;
    gap: 10px;
  }
}

.chart-container {
  height: 350px;
  width: 100%;
}

.analysis-section {
  margin-bottom: 20px;
}

.engagement-item {
  text-align: center;
  padding: 20px 0;
  
  .item-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
  }
  
  .item-value {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
}
</style> 