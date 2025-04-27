<template>
  <div class="review-management">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-cards">
      <el-col :span="6" v-for="(stat, index) in statistics" :key="index">
        <el-card shadow="hover" :body-style="{ padding: '20px' }">
          <div class="statistic-item">
            <div class="statistic-title">{{ stat.title }}</div>
            <div class="statistic-value">{{ stat.value }}</div>
            <div class="statistic-subtitle">{{ stat.subtitle }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评分分布图表 -->
    <el-row :gutter="20" class="chart-section">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>评分分布</span>
            </div>
          </template>
          <div ref="ratingChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>月度评价趋势</span>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 评价列表 -->
    <el-card shadow="hover" class="review-list-card">
      <template #header>
        <div class="card-header">
          <span>评价列表</span>
          <div class="header-actions">
            <el-select v-model="filterStatus" placeholder="评价状态" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="待审核" :value="0"></el-option>
              <el-option label="已通过" :value="1"></el-option>
              <el-option label="已拒绝" :value="2"></el-option>
            </el-select>
            <el-select v-model="filterRating" placeholder="评分筛选" clearable>
              <el-option label="全部" value=""></el-option>
              <el-option label="5星" value="5"></el-option>
              <el-option label="4星" value="4"></el-option>
              <el-option label="3星" value="3"></el-option>
              <el-option label="2星" value="2"></el-option>
              <el-option label="1星" value="1"></el-option>
            </el-select>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索评价内容"
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

      <el-table 
        :data="reviews" 
        style="width: 100%" 
        v-loading="loading"
        @row-click="row => console.log('点击了行:', row)"
      >
        <el-table-column prop="date" label="评价时间" width="120" sortable></el-table-column>
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="scope">
            <div class="user-info">
              <el-avatar :size="24" :src="scope.row.userAvatar"></el-avatar>
              <span>{{ scope.row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="商品" width="180"></el-table-column>
        <el-table-column prop="rating" label="评分" width="120">
          <template #default="scope">
            <el-rate
              v-model="scope.row.rating"
              disabled
              show-score
              text-color="#ff9900"
            ></el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容">
          <template #default="scope">
            <div class="review-content">
              <p>{{ scope.row.content }}</p>
              <div v-if="scope.row.images && scope.row.images.length" class="review-images">
                <el-image
                  v-for="(img, index) in scope.row.images"
                  :key="index"
                  :src="img"
                  :preview-src-list="scope.row.images"
                  fit="cover"
                  class="review-image"
                ></el-image>
              </div>
              <el-tag
                v-for="tag in scope.row.tags"
                :key="tag"
                size="small"
                class="review-tag"
              >{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="getStatusType(scope.row.status)"
              size="small"
            >{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-tooltip v-if="scope.row.status === 0 || scope.row.status === 'pending'" content="通过评价" placement="top">
                <el-button
                  type="success"
                  circle
                  size="small"
                  @click="handleApprove(scope.row)"
                >
                  <el-icon><Check /></el-icon>
                </el-button>
              </el-tooltip>
              
              <el-tooltip v-if="scope.row.status === 0 || scope.row.status === 'pending'" content="拒绝评价" placement="top">
                <el-button
                  type="danger"
                  circle
                  size="small"
                  @click="handleReject(scope.row)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </el-tooltip>
              
              <el-tooltip content="删除评价" placement="top">
                <el-button
                  type="danger"
                  circle
                  plain
                  size="small"
                  @click="handleDelete(scope.row)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { Search, Check, Close, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
  getAllReviews,
  reviewApproval,
  deleteReview,
  getReviewStatistics
} from '@/api/review'

// 状态变量
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const reviews = ref([])
const filterStatus = ref('')
const filterRating = ref('')
const searchKeyword = ref('')
const statistics = ref([
  { title: '总评价数', value: 0, subtitle: '全部评价' },
  { title: '待审核', value: 0, subtitle: '需要审核的评价' },
  { title: '平均评分', value: 0, subtitle: '所有商品平均分' },
  { title: '本月新增', value: 0, subtitle: '本月新增评价' }
])

// 图表实例
const ratingChart = ref(null)
const trendChart = ref(null)
const chartInstances = {
  rating: null,
  trend: null
}

// 获取评价列表
const fetchReviews = async () => {
  loading.value = true
  try {
    const res = await getAllReviews({
      page: currentPage.value,
      pageSize: pageSize.value,
      status: filterStatus.value,
      rating: filterRating.value,
      keyword: searchKeyword.value
    })
    if (res.code === 200) {
      console.log('获取到的评论数据:', res.data);
      console.log('分页信息 - 总条数:', res.data.total, '页码:', res.data.page, '每页条数:', res.data.pageSize);
      console.log('当前列表长度:', res.data.list ? res.data.list.length : 0);
      
      // 强制使用后端返回的分页结果（而不是客户端过滤）
      reviews.value = res.data.list || [];
      total.value = res.data.total || 0;
      
      // 确保页面和每页大小与请求一致
      currentPage.value = res.data.page || currentPage.value;
      pageSize.value = res.data.pageSize || pageSize.value;
    } else {
      ElMessage.error(res.message || '获取评价列表失败')
    }
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败')
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    console.log('开始请求评价统计数据...')
    const res = await getReviewStatistics()
    console.log('获取到评价统计数据响应:', res)
    
    if (res.code === 200 && res.data) {
      console.log('成功获取评价统计数据:', res.data)
      // 更新统计卡片数据
      statistics.value[0].value = res.data.totalCount || 0
      statistics.value[1].value = res.data.pendingCount || 0
      statistics.value[2].value = res.data.averageRating || 0
      statistics.value[3].value = res.data.monthlyCount || 0
      
      // 绘制评分分布图表
      if (chartInstances.rating) {
        // 暂时使用模拟数据
        const mockRatingDistribution = {
          '1': 5,
          '2': 10,
          '3': 25,
          '4': 40,
          '5': 20
        }
        drawRatingChart(mockRatingDistribution)
      }
      
      // 绘制月度评价趋势图表
      if (chartInstances.trend) {
        // 暂时使用模拟数据
        const mockMonthlyData = [
          { month: '1月', count: 10, avgRating: 4.2 },
          { month: '2月', count: 15, avgRating: 4.0 },
          { month: '3月', count: 20, avgRating: 4.5 },
          { month: '4月', count: 25, avgRating: 4.3 },
          { month: '5月', count: 30, avgRating: 4.1 },
          { month: '6月', count: 20, avgRating: 4.4 }
        ]
        drawTrendChart(mockMonthlyData)
      }
    }
  } catch (error) {
    console.error('获取评价统计数据失败:', error)
    ElMessage.error('获取评价统计数据失败: ' + error.message)
    
    // 使用模拟数据保证UI显示
    statistics.value[0].value = 100
    statistics.value[1].value = 15
    statistics.value[2].value = 4.2
    statistics.value[3].value = 25
    
    // 绘制图表使用模拟数据
    if (chartInstances.rating) {
      const mockRatingDistribution = {
        '1': 5,
        '2': 10,
        '3': 25,
        '4': 40,
        '5': 20
      }
      drawRatingChart(mockRatingDistribution)
    }
    
    if (chartInstances.trend) {
      const mockMonthlyData = [
        { month: '1月', count: 10, avgRating: 4.2 },
        { month: '2月', count: 15, avgRating: 4.0 },
        { month: '3月', count: 20, avgRating: 4.5 },
        { month: '4月', count: 25, avgRating: 4.3 },
        { month: '5月', count: 30, avgRating: 4.1 },
        { month: '6月', count: 20, avgRating: 4.4 }
      ]
      drawTrendChart(mockMonthlyData)
    }
  }
}

// 绘制评分分布图表
const drawRatingChart = (ratingData) => {
  if (!ratingData) return
  
  const chartData = {
    labels: ['1星', '2星', '3星', '4星', '5星'],
    values: [
      ratingData['1'] || 0,
      ratingData['2'] || 0,
      ratingData['3'] || 0,
      ratingData['4'] || 0,
      ratingData['5'] || 0
    ]
  }
  
  chartInstances.rating.setOption({
    color: ['#f56c6c', '#e6a23c', '#5daf34', '#1989fa', '#67c23a'],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: chartData.labels
    },
    series: [
      {
        name: '评分分布',
        type: 'pie',
        radius: ['45%', '70%'],
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
        data: chartData.labels.map((label, index) => ({
          value: chartData.values[index],
          name: label
        }))
      }
    ]
  })
}

// 绘制月度评价趋势图表
const drawTrendChart = (monthlyData) => {
  if (!monthlyData || !monthlyData.length) return
  
  const months = monthlyData.map(item => item.month)
  const counts = monthlyData.map(item => item.count)
  const ratings = monthlyData.map(item => item.avgRating)
  
  chartInstances.trend.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['评价数量', '平均评分']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: months
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '评价数量',
        min: 0,
        position: 'left'
      },
      {
        type: 'value',
        name: '平均评分',
        min: 0,
        max: 5,
        position: 'right'
      }
    ],
    series: [
      {
        name: '评价数量',
        type: 'bar',
        data: counts
      },
      {
        name: '平均评分',
        type: 'line',
        yAxisIndex: 1,
        data: ratings,
        smooth: true
      }
    ]
  })
}

// 初始化图表
const initCharts = () => {
  nextTick(() => {
    if (ratingChart.value && !chartInstances.rating) {
      chartInstances.rating = echarts.init(ratingChart.value)
    }
    
    if (trendChart.value && !chartInstances.trend) {
      chartInstances.trend = echarts.init(trendChart.value)
    }
    
    // 获取统计数据并绘制图表
    fetchStatistics()
  })
}

// 状态类型转换
const getStatusType = (status) => {
  // 根据数字或字符串状态返回对应的类型
  const statusMap = {
    0: 'warning',   // 待审核
    1: 'success',   // 已通过
    2: 'danger',    // 已拒绝
    'pending': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  };
  return statusMap[status] || 'info';
}

// 状态文本转换
const getStatusText = (status) => {
  // 根据数字或字符串状态返回对应的文本
  const textMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    'pending': '待审核',
    'approved': '已通过',
    'rejected': '已拒绝'
  };
  return textMap[status] || '未知';
}

// 审核通过
const handleApprove = async (review) => {
  try {
    console.log(`开始审核评价 ID: ${review.id}, 状态: approved`)
    const res = await reviewApproval(review.id, 1) // 1表示通过
    console.log('审核结果:', res)
    
    if (res.code === 200) {
      ElMessage.success('审核通过成功')
      review.status = 1 // 使用数字状态
      fetchStatistics()
      fetchReviews() // 重新加载列表
    } else {
      ElMessage.error(res.message || '审核操作失败')
    }
  } catch (error) {
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败: ' + error.message)
  }
}

// 审核拒绝
const handleReject = async (review) => {
  try {
    console.log(`开始拒绝评价 ID: ${review.id}, 状态: rejected`)
    const res = await reviewApproval(review.id, 2) // 2表示拒绝
    console.log('拒绝结果:', res)
    
    if (res.code === 200) {
      ElMessage.success('拒绝评价成功')
      review.status = 2 // 使用数字状态
      fetchStatistics()
      fetchReviews() // 重新加载列表
    } else {
      ElMessage.error(res.message || '审核操作失败')
    }
  } catch (error) {
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败: ' + error.message)
  }
}

// 删除评价
const handleDelete = async (review) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteReview(review.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchReviews()
      fetchStatistics()
    } else {
      ElMessage.error(res.message || '删除评价失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除评价失败')
    }
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchReviews()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchReviews()
}

// 监听筛选条件变化
watch([filterStatus, filterRating, searchKeyword], () => {
  currentPage.value = 1
  fetchReviews()
})

// 组件挂载时获取数据
onMounted(() => {
  fetchReviews()
  initCharts()
  
  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    chartInstances.rating?.resize()
    chartInstances.trend?.resize()
  })
})
</script>

<style lang="scss" scoped>
.review-management {
  padding: 20px;
  
  .statistics-cards {
    margin-bottom: 20px;
    
    .statistic-item {
      text-align: center;
      
      .statistic-title {
        color: #666;
        font-size: 14px;
      }
      
      .statistic-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin: 10px 0;
      }
      
      .statistic-subtitle {
        color: #999;
        font-size: 12px;
      }
    }
  }
  
  .chart-section {
    margin-bottom: 20px;
    
    .chart-card {
      .chart-container {
        height: 300px;
      }
    }
  }
  
  .review-list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .review-content {
      p {
        margin: 0 0 8px;
      }
      
      .review-images {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        
        .review-image {
          width: 60px;
          height: 60px;
          border-radius: 4px;
        }
      }
      
      .review-tag {
        margin-right: 8px;
      }
    }
    
    .operation-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      
      .el-button {
        margin: 0;
        padding: 6px;
        
        &.is-plain {
          opacity: 0.8;
          
          &:hover {
            opacity: 1;
          }
        }
      }
    }
    
    .pagination-container {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style> 