<template>
  <div class="comment-stats">
    <div v-if="loading" class="stats-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="stats-error">
      <el-alert
        title="获取评价统计数据失败"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
    <div v-else-if="!hasComments" class="stats-empty">
      <el-empty description="暂无评价数据" :image-size="100" />
    </div>
    <div v-else class="stats-content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-card-header">
              <div class="stats-card-title">评价总数</div>
              <el-icon><Comment /></el-icon>
            </div>
            <div class="stats-card-value">{{ stats.totalCount }}</div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-card-header">
              <div class="stats-card-title">平均评分</div>
              <el-icon><Star /></el-icon>
            </div>
            <div class="stats-card-value">
              {{ stats.averageRating ? stats.averageRating.toFixed(1) : '0.0' }}
              <el-rate
                v-model="stats.averageRating"
                disabled
                text-color="#ff9900"
                score-template="{value}"
                size="small"
              />
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="stats-card">
            <div class="stats-card-header">
              <div class="stats-card-title">好评率</div>
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-card-value">
              {{ stats.goodRatingPercentage ? stats.goodRatingPercentage.toFixed(1) : '0.0' }}%
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="stats-charts">
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>评分分布</span>
              </div>
            </template>
            <div ref="ratingChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>评价趋势 (近30天)</span>
              </div>
            </template>
            <div ref="trendChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { Comment, Star, Check } from '@element-plus/icons-vue'
import { getUserCommentStats, getUserCommentTrend } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
])

const userStore = useUserStore()

const loading = ref(false)
const error = ref(false)
const stats = ref({
  totalCount: 0,
  averageRating: 0,
  goodRatingPercentage: 0,
  ratingDistribution: {}
})
const trend = ref({
  dates: [],
  counts: []
})

// 图表DOM引用
const ratingChartRef = ref(null)
const trendChartRef = ref(null)

// 图表实例
let ratingChart = null
let trendChart = null

// 是否有评价数据
const hasComments = computed(() => stats.value.totalCount > 0)

// 获取评价统计数据
const fetchStats = async () => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  loading.value = true
  error.value = false
  
  try {
    const res = await getUserCommentStats(userStore.id)
    if (res.code === 200 && res.data) {
      stats.value = res.data
    } else {
      throw new Error(res.message || '获取评价统计数据失败')
    }
  } catch (err) {
    console.error('获取评价统计数据失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 获取评价趋势数据
const fetchTrend = async () => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  try {
    const res = await getUserCommentTrend(userStore.id, 30)
    if (res.code === 200 && res.data) {
      trend.value = res.data
    } else {
      throw new Error(res.message || '获取评价趋势数据失败')
    }
  } catch (err) {
    console.error('获取评价趋势数据失败:', err)
  }
}

// 初始化评分分布图表
const initRatingChart = () => {
  if (!ratingChartRef.value) return
  
  ratingChart = echarts.init(ratingChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: ['5星', '4星', '3星', '2星', '1星']
    },
    series: [
      {
        name: '评分分布',
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
        data: [
          { value: stats.value.ratingDistribution[5] || 0, name: '5星' },
          { value: stats.value.ratingDistribution[4] || 0, name: '4星' },
          { value: stats.value.ratingDistribution[3] || 0, name: '3星' },
          { value: stats.value.ratingDistribution[2] || 0, name: '2星' },
          { value: stats.value.ratingDistribution[1] || 0, name: '1星' }
        ]
      }
    ]
  }
  
  ratingChart.setOption(option)
}

// 初始化评价趋势图表
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option = {
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
      data: trend.value.dates,
      axisLabel: {
        interval: 'auto',
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '评价数量',
        type: 'line',
        smooth: true,
        data: trend.value.counts,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(64, 158, 255, 0.7)'
              },
              {
                offset: 1,
                color: 'rgba(64, 158, 255, 0.1)'
              }
            ]
          }
        }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 更新图表
const updateCharts = () => {
  if (ratingChart) {
    ratingChart.setOption({
      series: [
        {
          data: [
            { value: stats.value.ratingDistribution[5] || 0, name: '5星' },
            { value: stats.value.ratingDistribution[4] || 0, name: '4星' },
            { value: stats.value.ratingDistribution[3] || 0, name: '3星' },
            { value: stats.value.ratingDistribution[2] || 0, name: '2星' },
            { value: stats.value.ratingDistribution[1] || 0, name: '1星' }
          ]
        }
      ]
    })
  }
  
  if (trendChart) {
    trendChart.setOption({
      xAxis: {
        data: trend.value.dates
      },
      series: [
        {
          data: trend.value.counts
        }
      ]
    })
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (ratingChart) {
    ratingChart.resize()
  }
  if (trendChart) {
    trendChart.resize()
  }
}

// 监听统计数据变化，更新图表
watch(
  [() => stats.value, () => trend.value],
  () => {
    if (hasComments.value) {
      // 延迟执行，确保DOM已经渲染
      setTimeout(() => {
        if (!ratingChart) {
          initRatingChart()
        } else {
          updateCharts()
        }
        
        if (!trendChart) {
          initTrendChart()
        } else {
          updateCharts()
        }
      }, 100)
    }
  },
  { deep: true }
)

// 组件挂载时获取数据
onMounted(async () => {
  await fetchStats()
  if (hasComments.value) {
    await fetchTrend()
    
    // 初始化图表
    setTimeout(() => {
      initRatingChart()
      initTrendChart()
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    }, 100)
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  if (ratingChart) {
    ratingChart.dispose()
    ratingChart = null
  }
  
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
})
</script>

<style lang="scss" scoped>
.comment-stats {
  margin-bottom: 20px;
  
  .stats-content {
    .stats-card {
      height: 120px;
      margin-bottom: 20px;
      
      .stats-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        
        .stats-card-title {
          font-size: 16px;
          color: #606266;
        }
        
        .el-icon {
          font-size: 20px;
          color: #409EFF;
        }
      }
      
      .stats-card-value {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        display: flex;
        align-items: center;
        
        .el-rate {
          margin-left: 10px;
        }
      }
    }
    
    .stats-charts {
      .chart-card {
        margin-bottom: 20px;
        
        .chart-header {
          font-size: 16px;
          color: #606266;
        }
        
        .chart-container {
          height: 300px;
        }
      }
    }
  }
}
</style> 