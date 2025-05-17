<template>
  <div class="comment-keywords">
    <div v-if="loading" class="keywords-loading">
      <el-skeleton :rows="5" animated />
    </div>
    <div v-else-if="error" class="keywords-error">
      <el-alert
        title="获取评价关键词失败"
        type="error"
        :closable="false"
        show-icon
      />
    </div>
    <div v-else-if="!hasKeywords" class="keywords-empty">
      <el-empty description="暂无评价关键词数据" :image-size="100" />
    </div>
    <div v-else class="keywords-content">
      <el-card shadow="hover" class="keywords-card">
        <template #header>
          <div class="keywords-header">
            <span>评价关键词</span>
            <el-select v-model="ratingFilter" placeholder="评分筛选" size="small" @change="fetchKeywords">
              <el-option label="全部评分" :value="null" />
              <el-option label="好评 (4-5星)" :value="{ min: 4, max: 5 }" />
              <el-option label="中评 (3星)" :value="{ min: 3, max: 3 }" />
              <el-option label="差评 (1-2星)" :value="{ min: 1, max: 2 }" />
            </el-select>
          </div>
        </template>
        <div ref="keywordsChartRef" class="keywords-chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { getCommentKeywords } from '@/api/comment'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts/core'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import 'echarts-wordcloud'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
])

const userStore = useUserStore()

const loading = ref(false)
const error = ref(false)
const keywords = ref([])
const ratingFilter = ref(null)

// 图表DOM引用
const keywordsChartRef = ref(null)

// 图表实例
let keywordsChart = null

// 是否有关键词数据
const hasKeywords = computed(() => keywords.value && keywords.value.length > 0)

// 获取评价关键词
const fetchKeywords = async () => {
  if (!userStore.isLoggedIn) {
    return
  }
  
  loading.value = true
  error.value = false
  
  try {
    const params = {
      productId: null, // 可以传入特定商品ID，这里查询用户所有评价
      limit: 50
    }
    
    // 添加评分筛选
    if (ratingFilter.value) {
      params.minRating = ratingFilter.value.min
      params.maxRating = ratingFilter.value.max
    }
    
    const res = await getCommentKeywords(params)
    if (res.code === 200 && res.data) {
      keywords.value = res.data.keywords || []
      
      // 更新图表
      if (hasKeywords.value) {
        setTimeout(() => {
          if (!keywordsChart) {
            initKeywordsChart()
          } else {
            updateKeywordsChart()
          }
        }, 100)
      }
    } else {
      throw new Error(res.message || '获取评价关键词失败')
    }
  } catch (err) {
    console.error('获取评价关键词失败:', err)
    error.value = true
    keywords.value = []
  } finally {
    loading.value = false
  }
}

// 初始化关键词云图表
const initKeywordsChart = () => {
  if (!keywordsChartRef.value) return
  
  keywordsChart = echarts.init(keywordsChartRef.value)
  
  const option = {
    tooltip: {
      show: true,
      formatter: function(params) {
        return params.data.name + ': ' + params.data.value
      }
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      right: null,
      bottom: null,
      sizeRange: [12, 60],
      rotationRange: [-90, 90],
      rotationStep: 45,
      gridSize: 8,
      drawOutOfBound: false,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: function() {
          return 'rgb(' + [
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160),
            Math.round(Math.random() * 160)
          ].join(',') + ')'
        }
      },
      emphasis: {
        textStyle: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: keywords.value
    }]
  }
  
  keywordsChart.setOption(option)
}

// 更新关键词云图表
const updateKeywordsChart = () => {
  if (!keywordsChart) return
  
  keywordsChart.setOption({
    series: [{
      data: keywords.value
    }]
  })
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  if (keywordsChart) {
    keywordsChart.resize()
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchKeywords()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁图表实例
  if (keywordsChart) {
    keywordsChart.dispose()
    keywordsChart = null
  }
})
</script>

<style lang="scss" scoped>
.comment-keywords {
  margin-bottom: 20px;
  
  .keywords-content {
    .keywords-card {
      .keywords-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        span {
          font-size: 16px;
          color: #606266;
        }
      }
      
      .keywords-chart {
        height: 300px;
      }
    }
  }
}
</style> 