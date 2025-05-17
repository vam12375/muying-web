<template>
  <div class="comment-sentiment">
    <div v-if="loading" class="sentiment-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="sentiment-error">
      <el-alert
        title="获取评价情感分析失败"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
    <div v-else-if="!hasSentimentData" class="sentiment-empty">
      <el-empty description="暂无评价情感分析数据" :image-size="100" />
    </div>
    <div v-else class="sentiment-content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="sentiment-card">
            <template #header>
              <div class="sentiment-header">
                <span>评价情感分析</span>
                <el-select v-model="daysPeriod" placeholder="时间范围" size="small" @change="fetchSentimentData">
                  <el-option label="最近7天" :value="7" />
                  <el-option label="最近30天" :value="30" />
                  <el-option label="最近90天" :value="90" />
                </el-select>
              </div>
            </template>
            <div class="sentiment-overview">
              <div class="sentiment-item positive">
                <div class="sentiment-title">正面评价</div>
                <div class="sentiment-value">{{ sentimentData.positiveRate ? sentimentData.positiveRate.toFixed(1) : '0.0' }}%</div>
                <div class="sentiment-count">{{ sentimentData.positiveCount || 0 }}条</div>
              </div>
              <div class="sentiment-item neutral">
                <div class="sentiment-title">中性评价</div>
                <div class="sentiment-value">{{ sentimentData.neutralRate ? sentimentData.neutralRate.toFixed(1) : '0.0' }}%</div>
                <div class="sentiment-count">{{ sentimentData.neutralCount || 0 }}条</div>
              </div>
              <div class="sentiment-item negative">
                <div class="sentiment-title">负面评价</div>
                <div class="sentiment-value">{{ sentimentData.negativeRate ? sentimentData.negativeRate.toFixed(1) : '0.0' }}%</div>
                <div class="sentiment-count">{{ sentimentData.negativeCount || 0 }}条</div>
              </div>
            </div>
            <div ref="sentimentChartRef" class="sentiment-chart"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { getCommentSentimentAnalysis } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
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
  LineChart,
  BarChart,
  CanvasRenderer
])

const userStore = useUserStore()

const loading = ref(false)
const error = ref(false)
const sentimentData = ref({
  totalCount: 0,
  positiveCount: 0,
  neutralCount: 0,
  negativeCount: 0,
  positiveRate: 0,
  neutralRate: 0,
  negativeRate: 0,
  dateLabels: [],
  positiveData: [],
  neutralData: [],
  negativeData: []
})
const daysPeriod = ref(30)

// 图表DOM引用
const sentimentChartRef = ref(null)

// 图表实例
let sentimentChart = null

// 是否有情感分析数据
const hasSentimentData = computed(() => sentimentData.value.totalCount > 0)

// 获取评价情感分析数据
const fetchSentimentData = async () => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  loading.value = true
  error.value = false
  
  try {
    const params = {
      productId: null, // 可以传入特定商品ID，这里查询用户所有评价
      days: daysPeriod.value
    }
    
    const res = await getCommentSentimentAnalysis(params)
    if (res.code === 200 && res.data) {
      sentimentData.value = res.data
      
      // 更新图表
      if (hasSentimentData.value) {
        setTimeout(() => {
          if (!sentimentChart) {
            initSentimentChart()
          } else {
            updateSentimentChart()
          }
        }, 100)
      }
    } else {
      throw new Error(res.message || '获取评价情感分析失败')
    }
  } catch (err) {
    console.error('获取评价情感分析失败:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 初始化情感分析图表
const initSentimentChart = () => {
  if (!sentimentChartRef.value) return
  
  sentimentChart = echarts.init(sentimentChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正面评价', '中性评价', '负面评价'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sentimentData.value.dateLabels,
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
        name: '正面评价',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#67C23A'
        },
        data: sentimentData.value.positiveData
      },
      {
        name: '中性评价',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#E6A23C'
        },
        data: sentimentData.value.neutralData
      },
      {
        name: '负面评价',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: '#F56C6C'
        },
        data: sentimentData.value.negativeData
      }
    ]
  }
  
  sentimentChart.setOption(option)
}

// 更新情感分析图表
const updateSentimentChart = () => {
  if (!sentimentChart) return
  
  sentimentChart.setOption({
    xAxis: {
      data: sentimentData.value.dateLabels
    },
    series: [
      {
        data: sentimentData.value.positiveData
      },
      {
        data: sentimentData.value.neutralData
      },
      {
        data: sentimentData.value.negativeData
      }
    ]
  })
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (sentimentChart) {
    sentimentChart.resize()
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchSentimentData()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  if (sentimentChart) {
    sentimentChart.dispose()
    sentimentChart = null
  }
})
</script>

<style lang="scss" scoped>
.comment-sentiment {
  margin-bottom: 20px;
  
  .sentiment-content {
    .sentiment-card {
      .sentiment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          font-size: 16px;
          color: #606266;
        }
      }
      
      .sentiment-overview {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        
        .sentiment-item {
          text-align: center;
          padding: 10px;
          border-radius: 4px;
          width: 30%;
          
          &.positive {
            background-color: rgba(103, 194, 58, 0.1);
            border-left: 4px solid #67C23A;
          }
          
          &.neutral {
            background-color: rgba(230, 162, 60, 0.1);
            border-left: 4px solid #E6A23C;
          }
          
          &.negative {
            background-color: rgba(245, 108, 108, 0.1);
            border-left: 4px solid #F56C6C;
          }
          
          .sentiment-title {
            font-size: 14px;
            color: #606266;
            margin-bottom: 5px;
          }
          
          .sentiment-value {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .sentiment-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }
      
      .sentiment-chart {
        height: 300px;
      }
    }
  }
}
</style> 