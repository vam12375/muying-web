<template>
  <div class="cache-management-container">
    <!-- 顶部横幅 -->
    <div class="cache-banner">
      <div class="banner-content container">
        <div class="banner-header">
          <h1 class="banner-title">缓存管理中心</h1>
          <p class="banner-description">监控和管理系统缓存，优化系统性能</p>
        </div>
        
        <!-- 搜索与操作区 -->
        <div class="action-area">
          <el-input
            v-model="searchQuery"
            placeholder="搜索缓存名称..."
            class="search-input"
            clearable
            @input="debounceSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          
          <div class="action-buttons">
            <el-tooltip content="刷新缓存数据" placement="top">
              <el-button type="primary" :icon="Refresh" circle @click="refreshCacheData" :loading="refreshing" />
            </el-tooltip>
            
            <el-tooltip content="清空所有缓存" placement="top">
              <el-button type="danger" :icon="Delete" circle @click="confirmClearAllCache" :disabled="refreshing" />
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cache-content container">
      <!-- 缓存概览 -->
      <section class="cache-overview">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="overview-card">
              <div class="overview-content">
                <div class="overview-icon memory">
                  <el-icon><Trophy /></el-icon>
                </div>
                <div class="overview-data">
                  <h3 class="overview-title">内存占用</h3>
                  <div class="overview-value">{{ formatMemorySize(overviewData.memoryUsage) }}</div>
                  <div class="overview-progress">
                    <el-progress 
                      :percentage="overviewData.memoryUsagePercentage" 
                      :color="getProgressColor(overviewData.memoryUsagePercentage)" 
                      :stroke-width="8" 
                      :show-text="false"
                    />
                    <span class="progress-text">{{ overviewData.memoryUsagePercentage }}%</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="overview-card">
              <div class="overview-content">
                <div class="overview-icon items">
                  <el-icon><Grid /></el-icon>
                </div>
                <div class="overview-data">
                  <h3 class="overview-title">缓存条目</h3>
                  <div class="overview-value">{{ formatNumber(overviewData.totalItems) }}</div>
                  <div class="overview-trend">
                    <span class="trend-value" :class="{'increase': overviewData.itemsChange > 0, 'decrease': overviewData.itemsChange < 0}">
                      <el-icon v-if="overviewData.itemsChange > 0"><Top /></el-icon>
                      <el-icon v-else-if="overviewData.itemsChange < 0"><Bottom /></el-icon>
                      {{ Math.abs(overviewData.itemsChange) }} 条
                    </span>
                    <span class="trend-period">较上次刷新</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="overview-card">
              <div class="overview-content">
                <div class="overview-icon hit-rate">
                  <el-icon><DataLine /></el-icon>
                </div>
                <div class="overview-data">
                  <h3 class="overview-title">命中率</h3>
                  <div class="overview-value">{{ overviewData.hitRate }}%</div>
                  <div class="overview-progress">
                    <el-progress 
                      :percentage="overviewData.hitRate" 
                      :color="getHitRateColor(overviewData.hitRate)" 
                      :stroke-width="8" 
                      :show-text="false"
                    />
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="overview-card">
              <div class="overview-content">
                <div class="overview-icon efficiency">
                  <el-icon><Timer /></el-icon>
                </div>
                <div class="overview-data">
                  <h3 class="overview-title">平均响应时间</h3>
                  <div class="overview-value">{{ overviewData.avgResponseTime }} ms</div>
                  <div class="overview-trend">
                    <span class="trend-value" :class="{'increase': overviewData.responseTimeChange > 0, 'decrease': overviewData.responseTimeChange < 0}">
                      <el-icon v-if="overviewData.responseTimeChange > 0"><Top /></el-icon>
                      <el-icon v-else-if="overviewData.responseTimeChange < 0"><Bottom /></el-icon>
                      {{ Math.abs(overviewData.responseTimeChange) }} ms
                    </span>
                    <span class="trend-period">较上次刷新</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </section>
      
      <!-- 缓存列表 -->
      <section class="cache-list-section">
        <div class="section-header">
          <div class="section-title-wrapper">
            <h2 class="section-title">缓存列表</h2>
            <p class="section-description">管理各个模块的缓存数据</p>
          </div>
          
          <div class="section-filter">
            <el-radio-group v-model="filterStatus" size="small" @change="handleFilterChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="active">活跃</el-radio-button>
              <el-radio-button label="expired">过期</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <el-card shadow="never" class="list-card">
          <el-alert
            v-if="filteredCacheList.length === 0 && !loading"
            title="未找到缓存数据"
            type="info"
            show-icon
            center
            :closable="false"
            style="margin-bottom: 20px;"
          />
          
          <el-skeleton :rows="5" animated v-if="loading" />
          
          <el-table
            v-else
            :data="pagedCacheList"
            style="width: 100%"
            border
            stripe
            highlight-current-row
            v-adaptive-height="{minHeight: 300, extraHeight: 120}"
            @sort-change="handleSortChange"
          >
            <el-table-column type="expand">
              <template #default="props">
                <div class="cache-detail">
                  <el-row :gutter="20">
                    <el-col :xs="24" :sm="12">
                      <div class="detail-item">
                        <span class="detail-label">创建时间:</span>
                        <span class="detail-value">{{ formatDateTime(props.row.createdAt) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">最后访问:</span>
                        <span class="detail-value">{{ formatDateTime(props.row.lastAccessed) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">过期时间:</span>
                        <span class="detail-value">{{ formatDateTime(props.row.expiresAt) }}</span>
                      </div>
                    </el-col>
                    
                    <el-col :xs="24" :sm="12">
                      <div class="detail-item">
                        <span class="detail-label">内存占用:</span>
                        <span class="detail-value">{{ formatMemorySize(props.row.size) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">命中次数:</span>
                        <span class="detail-value">{{ props.row.hits }} 次</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">状态:</span>
                        <el-tag :type="getCacheStatusType(props.row.status)" size="small">
                          {{ getCacheStatusText(props.row.status) }}
                        </el-tag>
                      </div>
                    </el-col>
                  </el-row>
                  
                  <!-- 值预览 -->
                  <div class="detail-preview">
                    <div class="preview-header">
                      <span>数据预览</span>
                      <el-button 
                        type="primary" 
                        size="small" 
                        link 
                        @click="viewCacheDetail(props.row)"
                      >
                        查看完整数据
                      </el-button>
                    </div>
                    <div class="preview-content">
                      <div class="preview-truncated">{{ getTruncatedValue(props.row.value) }}</div>
                    </div>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="detail-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      plain 
                      @click="refreshCacheItem(props.row.key)"
                      :disabled="props.row.status === 'expired'"
                    >
                      <el-icon><RefreshRight /></el-icon> 刷新缓存
                    </el-button>
                    
                    <el-button 
                      type="danger" 
                      size="small" 
                      plain 
                      @click="confirmDeleteCache(props.row.key)"
                    >
                      <el-icon><Delete /></el-icon> 删除缓存
                    </el-button>
                    
                    <el-button 
                      type="warning" 
                      size="small" 
                      plain 
                      @click="editCacheExpiration(props.row)"
                      :disabled="props.row.status === 'expired'"
                    >
                      <el-icon><Edit /></el-icon> 编辑过期时间
                    </el-button>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="key" label="缓存键" sortable min-width="200">
              <template #default="scope">
                <el-tooltip placement="top" :content="scope.row.key">
                  <span class="cache-key">{{ scope.row.key }}</span>
                </el-tooltip>
              </template>
            </el-table-column>
            
            <el-table-column prop="type" label="类型" min-width="100">
              <template #default="scope">
                <el-tag 
                  :type="getTypeColor(scope.row.type)" 
                  size="small" 
                  effect="plain"
                >
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="module" label="所属模块" min-width="120">
              <template #default="scope">
                <span class="module-name">{{ scope.row.module }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="size" label="大小" sortable min-width="100">
              <template #default="scope">
                <span>{{ formatMemorySize(scope.row.size) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" min-width="100">
              <template #default="scope">
                <div class="status-wrapper">
                  <el-tag :type="getCacheStatusType(scope.row.status)">
                    {{ getCacheStatusText(scope.row.status) }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="timeToLive" label="剩余有效期" sortable min-width="150">
              <template #default="scope">
                <div class="ttl-wrapper">
                  <span v-if="scope.row.status === 'expired'" class="expired-text">已过期</span>
                  <template v-else>
                    <el-progress 
                      :percentage="getTtlPercentage(scope.row.timeToLive, scope.row.maxAge)" 
                      :color="getTtlColor(scope.row.timeToLive, scope.row.maxAge)"
                      :show-text="false"
                      :stroke-width="5"
                    />
                    <span>{{ formatTTL(scope.row.timeToLive) }}</span>
                  </template>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" fixed="right" width="150">
              <template #default="scope">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="refreshCacheItem(scope.row.key)"
                  :disabled="scope.row.status === 'expired'"
                >
                  刷新
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="confirmDeleteCache(scope.row.key)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              background
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalItems"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </section>
    </div>
    
    <!-- 缓存详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="缓存详情"
      width="70%"
      class="cache-detail-dialog"
    >
      <div v-if="selectedCache" class="cache-detail-content">
        <div class="detail-header">
          <div class="detail-key">
            <span class="label">缓存键:</span>
            <span class="value">{{ selectedCache.key }}</span>
          </div>
          
          <div class="detail-info">
            <div class="info-item">
              <span class="label">类型:</span>
              <el-tag :type="getTypeColor(selectedCache.type)" size="small">
                {{ selectedCache.type }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="label">状态:</span>
              <el-tag :type="getCacheStatusType(selectedCache.status)">
                {{ getCacheStatusText(selectedCache.status) }}
              </el-tag>
            </div>
            
            <div class="info-item">
              <span class="label">大小:</span>
              <span class="value">{{ formatMemorySize(selectedCache.size) }}</span>
            </div>
          </div>
        </div>
        
        <el-divider />
        
        <div class="detail-value-container">
          <div class="value-header">
            <span>缓存值</span>
            <div class="value-actions">
              <el-button size="small" type="primary" plain @click="copyToClipboard(formatValueForDisplay(selectedCache.value))">
                <el-icon><CopyDocument /></el-icon> 复制
              </el-button>
              <el-button size="small" plain @click="toggleValueFormat">
                <el-icon><Operation /></el-icon> {{ isFormatted ? '显示原始值' : '格式化显示' }}
              </el-button>
            </div>
          </div>
          
          <div class="value-content">
            <pre class="value-code" :class="{ 'formatted': isFormatted }">{{ formatValueForDisplay(selectedCache.value) }}</pre>
          </div>
        </div>
      </div>
    </el-dialog>
    
    <!-- 编辑过期时间弹窗 -->
    <el-dialog
      v-model="expirationDialogVisible"
      title="编辑过期时间"
      width="500px"
      class="expiration-dialog"
    >
      <div v-if="selectedCache" class="expiration-content">
        <div class="expiration-info">
          <div class="info-item">
            <span class="label">缓存键:</span>
            <span class="value">{{ selectedCache.key }}</span>
          </div>
          
          <div class="info-item">
            <span class="label">当前过期时间:</span>
            <span class="value">{{ selectedCache.expiresAt ? formatDateTime(selectedCache.expiresAt) : '永不过期' }}</span>
          </div>
        </div>
        
        <el-form :model="expirationForm" label-width="120px" class="expiration-form">
          <el-form-item label="过期设置">
            <el-radio-group v-model="expirationForm.type">
              <el-radio label="duration">设置有效期</el-radio>
              <el-radio label="datetime">设置具体过期时间</el-radio>
              <el-radio label="never">永不过期</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="有效期时长" v-if="expirationForm.type === 'duration'">
            <el-input-number v-model="expirationForm.duration" :min="1" :step="1" controls-position="right" />
            <el-select v-model="expirationForm.unit" style="margin-left: 10px; width: 100px;">
              <el-option label="秒" value="seconds" />
              <el-option label="分钟" value="minutes" />
              <el-option label="小时" value="hours" />
              <el-option label="天" value="days" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="过期时间" v-if="expirationForm.type === 'datetime'">
            <el-date-picker
              v-model="expirationForm.expirationDate"
              type="datetime"
              placeholder="选择过期时间"
              format="YYYY-MM-DD HH:mm:ss"
              :disabledDate="disabledDate"
              style="width: 100%;"
            />
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="expirationDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveExpirationChanges" :loading="savingExpiration">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Refresh, 
  Delete, 
  Trophy, 
  Grid, 
  DataLine, 
  Timer, 
  RefreshRight,
  Edit,
  Top,
  Bottom,
  CopyDocument,
  Operation
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import debounce from 'lodash/debounce'

// 加载dayjs插件
dayjs.extend(duration)
dayjs.extend(relativeTime)

// 定义自定义指令用于表格高度自适应
const vAdaptiveHeight = {
  mounted(el, binding) {
    const { minHeight = 200, extraHeight = 60 } = binding.value || {}
    const resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        const container = el.closest('.cache-management-container')
        if (container) {
          const containerHeight = window.innerHeight
          const elTop = el.getBoundingClientRect().top
          const adaptiveHeight = Math.max(minHeight, containerHeight - elTop - extraHeight)
          el.querySelector('.el-table__body-wrapper').style.height = `${adaptiveHeight}px`
        }
      })
    })
    
    resizeObserver.observe(document.body)
    el._resizeObserver = resizeObserver
  },
  unmounted(el) {
    if (el._resizeObserver) {
      el._resizeObserver.disconnect()
    }
  }
}

export default {
  name: 'CacheManagement',
  directives: {
    adaptiveHeight: vAdaptiveHeight
  },
  setup() {
    // 数据
    const searchQuery = ref('')
    const refreshing = ref(false)
    const loading = ref(true)
    
    // 过滤和排序
    const filterStatus = ref('all')
    const sortBy = ref('key')
    const sortOrder = ref('asc')
    
    // 分页
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalItems = ref(0)
    
    // 缓存概览数据
    const overviewData = reactive({
      memoryUsage: 0,
      memoryUsagePercentage: 0,
      totalItems: 0,
      itemsChange: 0,
      hitRate: 0,
      avgResponseTime: 0,
      responseTimeChange: 0
    })
    
    // 缓存列表数据
    const cacheList = ref([])
    const previousCacheCount = ref(0)
    const previousResponseTime = ref(0)
    
    // 弹窗控制
    const detailDialogVisible = ref(false)
    const expirationDialogVisible = ref(false)
    const selectedCache = ref(null)
    const isFormatted = ref(true)
    const savingExpiration = ref(false)
    
    // 过期时间表单
    const expirationForm = reactive({
      type: 'duration',
      duration: 30,
      unit: 'minutes',
      expirationDate: null
    })
    
    // 计算属性 - 过滤后的缓存列表
    const filteredCacheList = computed(() => {
      if (!cacheList.value) return []
      
      let result = [...cacheList.value]
      
      // 搜索过滤
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(item => 
          item.key.toLowerCase().includes(query) || 
          item.module.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query)
        )
      }
      
      // 状态过滤
      if (filterStatus.value !== 'all') {
        result = result.filter(item => item.status === filterStatus.value)
      }
      
      // 排序
      result.sort((a, b) => {
        let aValue = a[sortBy.value]
        let bValue = b[sortBy.value]
        
        if (sortBy.value === 'size' || sortBy.value === 'timeToLive') {
          aValue = Number(aValue)
          bValue = Number(bValue)
        }
        
        if (sortOrder.value === 'asc') {
          return aValue > bValue ? 1 : -1
        } else {
          return aValue < bValue ? 1 : -1
        }
      })
      
      totalItems.value = result.length
      return result
    })
    
    // 计算属性 - 当前页面显示的缓存列表
    const pagedCacheList = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredCacheList.value.slice(start, end)
    })
    
    // 搜索防抖
    const debounceSearch = debounce(() => {
      currentPage.value = 1
    }, 300)
    
    // 刷新缓存数据
    const refreshCacheData = async () => {
      refreshing.value = true
      loading.value = true
      
      try {
        // 记录之前的值，用于计算变化趋势
        previousCacheCount.value = overviewData.totalItems
        previousResponseTime.value = overviewData.avgResponseTime
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟获取缓存概览数据
        fetchCacheOverview()
        
        // 模拟获取缓存列表数据
        fetchCacheList()
        
        ElMessage({
          type: 'success',
          message: '缓存数据已刷新',
          duration: 2000
        })
      } catch (error) {
        console.error('刷新缓存数据出错:', error)
        ElMessage.error('刷新缓存数据失败，请重试')
      } finally {
        refreshing.value = false
        loading.value = false
      }
    }
    
    // 模拟获取缓存概览数据
    const fetchCacheOverview = () => {
      // 模拟数据 - 实际应通过API获取
      const memoryUsage = Math.floor(Math.random() * 1024 * 1024 * 500) // 0-500MB
      const memoryTotal = 1024 * 1024 * 1024 // 1GB
      const hitRate = Math.floor(Math.random() * 30) + 70 // 70-100%
      const avgResponseTime = Math.floor(Math.random() * 100) + 5 // 5-105ms
      
      // 计算变化趋势
      const responseTimeChange = avgResponseTime - previousResponseTime.value
      const itemsChange = cacheList.value.length - previousCacheCount.value
      
      // 更新概览数据
      Object.assign(overviewData, {
        memoryUsage,
        memoryUsagePercentage: Math.floor((memoryUsage / memoryTotal) * 100),
        totalItems: cacheList.value.length,
        itemsChange,
        hitRate,
        avgResponseTime,
        responseTimeChange
      })
    }
    
    // 模拟获取缓存列表数据
    const fetchCacheList = () => {
      // 模拟数据 - 实际应通过API获取
      const modules = ['商品', '用户', '订单', '库存', '支付', '评论', '购物车', '优惠券']
      const types = ['string', 'hash', 'list', 'object', 'array']
      const statuses = ['active', 'expired']
      const now = new Date().getTime()
      
      // 生成20-100条随机缓存数据
      const count = Math.floor(Math.random() * 80) + 20
      const data = []
      
      for (let i = 0; i < count; i++) {
        const module = modules[Math.floor(Math.random() * modules.length)]
        const type = types[Math.floor(Math.random() * types.length)]
        const status = Math.random() > 0.8 ? 'expired' : 'active'
        const maxAge = Math.floor(Math.random() * 86400 * 7) // 0-7天的秒数
        const createdAt = now - Math.floor(Math.random() * 86400 * 30 * 1000) // 1-30天前
        const lastAccessed = createdAt + Math.floor(Math.random() * (now - createdAt))
        const ttl = status === 'expired' ? 0 : Math.floor(Math.random() * maxAge)
        const hits = Math.floor(Math.random() * 10000)
        const size = Math.floor(Math.random() * 1024 * 1024) // 0-1MB
        
        // 构造缓存键，格式如：module:submodule:id
        const key = `${module.toLowerCase()}:${['info', 'list', 'detail', 'config'][Math.floor(Math.random() * 4)]}:${Math.floor(Math.random() * 10000)}`
        
        // 构造示例缓存值
        let value
        if (type === 'string') {
          value = `这是一个示例字符串值，对应模块${module}的缓存数据`
        } else if (type === 'hash') {
          value = {
            id: Math.floor(Math.random() * 1000),
            name: `${module}数据${i}`,
            createTime: new Date(createdAt).toISOString(),
            status: Math.random() > 0.5 ? 'active' : 'inactive'
          }
        } else if (type === 'list' || type === 'array') {
          value = Array.from({ length: 5 }, (_, j) => ({
            id: j + 1,
            name: `项目${j+1}`,
            value: Math.random() * 100
          }))
        } else {
          value = {
            id: Math.floor(Math.random() * 1000),
            name: `${module}对象${i}`,
            properties: {
              prop1: Math.random() * 100,
              prop2: `属性值${i}`,
              prop3: Math.random() > 0.5
            },
            stats: {
              count: Math.floor(Math.random() * 1000),
              lastUpdate: new Date().toISOString()
            }
          }
        }
        
        // 计算过期时间
        const expiresAt = status === 'expired' 
          ? createdAt + Math.floor(Math.random() * (now - createdAt)) 
          : now + (ttl * 1000)
        
        data.push({
          key,
          type,
          module,
          size,
          status,
          timeToLive: ttl,
          maxAge,
          expiresAt,
          createdAt,
          lastAccessed,
          hits,
          value
        })
      }
      
      cacheList.value = data
    }
    
    // 查看缓存详情
    const viewCacheDetail = (cache) => {
      selectedCache.value = { ...cache }
      detailDialogVisible.value = true
      isFormatted.value = true
    }
    
    // 编辑缓存过期时间
    const editCacheExpiration = (cache) => {
      selectedCache.value = { ...cache }
      
      // 重置表单
      if (cache.expiresAt) {
        expirationForm.type = 'datetime'
        expirationForm.expirationDate = new Date(cache.expiresAt)
      } else {
        expirationForm.type = 'never'
      }
      
      expirationDialogVisible.value = true
    }
    
    // 保存过期时间变更
    const saveExpirationChanges = async () => {
      if (!selectedCache.value) return
      
      savingExpiration.value = true
      
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const cacheKey = selectedCache.value.key
        const cacheIndex = cacheList.value.findIndex(item => item.key === cacheKey)
        
        if (cacheIndex === -1) {
          throw new Error('缓存项不存在')
        }
        
        // 根据不同的过期设置类型计算新的过期时间
        let newExpiresAt = null
        let newTtl = 0
        
        if (expirationForm.type === 'duration') {
          // 计算基于时长的过期时间
          const now = new Date().getTime()
          const durationMs = calculateDurationMs(expirationForm.duration, expirationForm.unit)
          newExpiresAt = now + durationMs
          newTtl = durationMs / 1000
        } else if (expirationForm.type === 'datetime') {
          // 使用指定的具体过期时间
          if (!expirationForm.expirationDate) {
            ElMessage.warning('请选择具体的过期时间')
            savingExpiration.value = false
            return
          }
          
          newExpiresAt = new Date(expirationForm.expirationDate).getTime()
          const now = new Date().getTime()
          newTtl = Math.max(0, Math.floor((newExpiresAt - now) / 1000))
        }
        // 对于 'never' 类型，expiresAt 和 ttl 都保持为 null
        
        // 更新缓存列表中的项
        cacheList.value[cacheIndex] = {
          ...cacheList.value[cacheIndex],
          expiresAt: newExpiresAt,
          timeToLive: newTtl,
          status: newTtl === 0 ? 'expired' : 'active'
        }
        
        ElMessage.success('缓存过期时间已更新')
        expirationDialogVisible.value = false
      } catch (error) {
        console.error('更新过期时间失败:', error)
        ElMessage.error('更新过期时间失败，请重试')
      } finally {
        savingExpiration.value = false
      }
    }
    
    // 计算时长的毫秒数
    const calculateDurationMs = (value, unit) => {
      switch (unit) {
        case 'seconds':
          return value * 1000
        case 'minutes':
          return value * 60 * 1000
        case 'hours':
          return value * 60 * 60 * 1000
        case 'days':
          return value * 24 * 60 * 60 * 1000
        default:
          return value * 1000
      }
    }
    
    // 刷新单个缓存项
    const refreshCacheItem = async (key) => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const cacheIndex = cacheList.value.findIndex(item => item.key === key)
        
        if (cacheIndex === -1) {
          throw new Error('缓存项不存在')
        }
        
        // 刷新缓存TTL和过期时间
        const now = new Date().getTime()
        const maxAge = cacheList.value[cacheIndex].maxAge
        
        cacheList.value[cacheIndex] = {
          ...cacheList.value[cacheIndex],
          lastAccessed: now,
          timeToLive: maxAge,
          expiresAt: now + (maxAge * 1000),
          status: 'active',
          hits: cacheList.value[cacheIndex].hits + 1
        }
        
        ElMessage.success(`缓存 ${key} 已刷新`)
      } catch (error) {
        console.error('刷新缓存失败:', error)
        ElMessage.error('刷新缓存失败，请重试')
      }
    }
    
    // 确认删除缓存
    const confirmDeleteCache = (key) => {
      ElMessageBox.confirm(
        `确定要删除缓存 ${key} 吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        deleteCache(key)
      }).catch(() => {
        // 用户取消，不做任何操作
      })
    }
    
    // 删除缓存
    const deleteCache = async (key) => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 从列表中删除
        cacheList.value = cacheList.value.filter(item => item.key !== key)
        
        // 更新概览数据
        overviewData.totalItems = cacheList.value.length
        overviewData.itemsChange = -1
        
        ElMessage.success(`缓存 ${key} 已删除`)
      } catch (error) {
        console.error('删除缓存失败:', error)
        ElMessage.error('删除缓存失败，请重试')
      }
    }
    
    // 确认清空所有缓存
    const confirmClearAllCache = () => {
      ElMessageBox.confirm(
        '确定要清空所有缓存吗？此操作不可恢复。',
        '清空确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        clearAllCache()
      }).catch(() => {
        // 用户取消，不做任何操作
      })
    }
    
    // 清空所有缓存
    const clearAllCache = async () => {
      try {
        refreshing.value = true
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 清空缓存列表
        cacheList.value = []
        
        // 更新概览数据
        Object.assign(overviewData, {
          memoryUsage: 0,
          memoryUsagePercentage: 0,
          totalItems: 0,
          itemsChange: -previousCacheCount.value,
          hitRate: 0,
          avgResponseTime: 0,
          responseTimeChange: -previousResponseTime.value
        })
        
        ElMessage.success('所有缓存已清空')
      } catch (error) {
        console.error('清空缓存失败:', error)
        ElMessage.error('清空缓存失败，请重试')
      } finally {
        refreshing.value = false
      }
    }
    
    // 切换值格式化显示
    const toggleValueFormat = () => {
      isFormatted.value = !isFormatted.value
    }
    
    // 复制到剪贴板
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          ElMessage.success('已复制到剪贴板')
        })
        .catch(() => {
          ElMessage.error('复制失败，请手动复制')
        })
    }
    
    // 处理分页变更
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }
    
    const handleCurrentChange = (page) => {
      currentPage.value = page
    }
    
    // 处理排序变更
    const handleSortChange = ({ prop, order }) => {
      if (prop) {
        sortBy.value = prop
        sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
      }
    }
    
    // 处理过滤变更
    const handleFilterChange = () => {
      currentPage.value = 1
    }
    
    // 禁用过期时间选择器的日期（不允许选择过去的时间）
    const disabledDate = (time) => {
      return time.getTime() < Date.now() - 8.64e7 // 不能选择今天之前的日期
    }
    
    // 格式化内存大小
    const formatMemorySize = (bytes) => {
      if (bytes === 0) return '0 B'
      
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    }
    
    // 格式化数字（添加千分位逗号）
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    
    // 格式化日期时间
    const formatDateTime = (timestamp) => {
      if (!timestamp) return '永不过期'
      return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
    }
    
    // 格式化缓存TTL（剩余有效期）
    const formatTTL = (seconds) => {
      if (seconds <= 0) return '已过期'
      
      const duration = dayjs.duration(seconds, 'seconds')
      
      if (seconds < 60) {
        return `${seconds}秒`
      } else if (seconds < 3600) {
        return `${duration.minutes()}分${duration.seconds()}秒`
      } else if (seconds < 86400) {
        return `${duration.hours()}小时${duration.minutes()}分`
      } else {
        return `${duration.days()}天${duration.hours()}小时`
      }
    }
    
    // 截断显示的值
    const getTruncatedValue = (value) => {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
      if (stringValue.length <= 300) return stringValue
      return stringValue.substring(0, 300) + '...'
    }
    
    // 格式化值显示
    const formatValueForDisplay = (value) => {
      if (typeof value !== 'object') return String(value)
      
      return isFormatted.value
        ? JSON.stringify(value, null, 2)
        : JSON.stringify(value)
    }
    
    // 获取进度条颜色
    const getProgressColor = (percentage) => {
      if (percentage < 60) return '#67C23A'
      if (percentage < 80) return '#E6A23C'
      return '#F56C6C'
    }
    
    // 获取命中率颜色
    const getHitRateColor = (rate) => {
      if (rate < 50) return '#F56C6C'
      if (rate < 75) return '#E6A23C'
      return '#67C23A'
    }
    
    // 获取TTL百分比
    const getTtlPercentage = (ttl, maxAge) => {
      if (!maxAge || maxAge === 0) return 100
      return Math.min(100, Math.max(0, (ttl / maxAge) * 100))
    }
    
    // 获取TTL颜色
    const getTtlColor = (ttl, maxAge) => {
      const percentage = getTtlPercentage(ttl, maxAge)
      
      if (percentage < 20) return '#F56C6C'
      if (percentage < 50) return '#E6A23C'
      return '#67C23A'
    }
    
    // 获取状态文本
    const getCacheStatusText = (status) => {
      switch (status) {
        case 'active': return '活跃'
        case 'expired': return '已过期'
        default: return '未知'
      }
    }
    
    // 获取状态标签类型
    const getCacheStatusType = (status) => {
      switch (status) {
        case 'active': return 'success'
        case 'expired': return 'danger'
        default: return 'info'
      }
    }
    
    // 获取类型颜色
    const getTypeColor = (type) => {
      switch (type) {
        case 'string': return 'success'
        case 'hash': return 'warning'
        case 'list': return 'primary'
        case 'object': return 'info'
        case 'array': return 'danger'
        default: return ''
      }
    }
    
    // 监听搜索变化
    watch(searchQuery, () => {
      debounceSearch()
    })
    
    // 生命周期钩子
    onMounted(() => {
      refreshCacheData()
    })
    
    return {
      // 数据
      searchQuery,
      refreshing,
      loading,
      filterStatus,
      overviewData,
      cacheList,
      filteredCacheList,
      pagedCacheList,
      currentPage,
      pageSize,
      totalItems,
      selectedCache,
      detailDialogVisible,
      expirationDialogVisible,
      expirationForm,
      isFormatted,
      savingExpiration,
      
      // 方法
      debounceSearch,
      refreshCacheData,
      viewCacheDetail,
      editCacheExpiration,
      saveExpirationChanges,
      refreshCacheItem,
      confirmDeleteCache,
      confirmClearAllCache,
      handleSizeChange,
      handleCurrentChange,
      handleSortChange,
      handleFilterChange,
      toggleValueFormat,
      copyToClipboard,
      disabledDate,
      
      // 格式化方法
      formatMemorySize,
      formatNumber,
      formatDateTime,
      formatTTL,
      formatValueForDisplay,
      getTruncatedValue,
      getProgressColor,
      getHitRateColor,
      getTtlPercentage,
      getTtlColor,
      getCacheStatusText,
      getCacheStatusType,
      getTypeColor,
      
      // 图标
      Refresh,
      Delete,
      RefreshRight,
      Edit,
      CopyDocument,
      Operation
    }
  }
}
</script>

<style scoped>
.cache-management-container {
  min-height: 100vh;
  background-color: #fefafe;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 横幅区域 */
.cache-banner {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  padding: 40px 0;
  color: white;
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.cache-banner::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -5%;
  width: 35%;
  height: 150%;
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(30deg);
  z-index: 1;
}

.cache-banner::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: -5%;
  width: 30%;
  height: 200%;
  background: rgba(255, 255, 255, 0.05);
  transform: rotate(-20deg);
  z-index: 1;
}

.banner-header {
  position: relative;
  z-index: 2;
  margin-bottom: 30px;
}

.banner-title {
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.banner-description {
  font-size: 1.1rem;
  margin-bottom: 0;
  opacity: 0.9;
  font-weight: 300;
  letter-spacing: 0.5px;
}

.action-area {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  gap: 15px;
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.el-input__inner) {
  height: 50px;
  border-radius: 8px;
  padding-left: 45px;
  border: none;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.95);
}

.search-input :deep(.el-input__prefix) {
  left: 15px;
  font-size: 1.2rem;
  color: #3a7bd5;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons .el-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
}

.overview-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: none;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.overview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-bottom: 3px solid #3a7bd5;
}

.overview-icon.memory {
  background-color: rgba(58, 123, 213, 0.1);
  color: #3a7bd5;
}

.overview-icon.items {
  background-color: rgba(0, 210, 255, 0.1);
  color: #00d2ff;
}

.overview-icon.hit-rate {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.overview-icon.efficiency {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.overview-icon .el-icon {
  font-size: 2rem;
}

.overview-data {
  flex: 1;
}

.overview-title {
  font-size: 1rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.overview-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.overview-progress {
  position: relative;
}

.overview-progress .progress-text {
  position: absolute;
  right: 0;
  top: -2px;
  font-size: 0.8rem;
  color: #666;
}

.overview-trend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
}

.overview-trend .trend-value {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
}

.trend-value.increase {
  color: #2ecc71;
}

.trend-value.decrease {
  color: #e74c3c;
}

.trend-value .el-icon {
  margin-right: 4px;
}

.trend-period {
  color: #999;
  font-size: 0.8rem;
}

/* 缓存列表区域 */
.cache-list-section {
  margin-top: 30px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title-wrapper {
  position: relative;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #3a7bd5, #00d2ff);
  border-radius: 2px;
}

.section-description {
  color: #666;
  font-size: 1rem;
}

.list-card {
  border-radius: 12px;
  overflow: hidden;
  border: none;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
}

/* 表格样式 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.el-table :deep(th) {
  background-color: #f8fafd !important;
  color: #333;
  font-weight: 600;
  padding: 12px 0;
  border-bottom: 2px solid #edf2f7;
}

.el-table :deep(.el-table__row:hover > td) {
  background-color: #f0f7ff !important;
}

.el-table :deep(.el-table__expanded-cell) {
  padding: 25px;
  background-color: #f8fafd;
}

.cache-key {
  font-family: monospace;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  display: inline-block;
  max-width: 240px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-name {
  font-weight: 500;
  color: #3a7bd5;
}

.ttl-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.expired-text {
  color: #e74c3c;
}

.status-wrapper {
  display: flex;
  align-items: center;
}

/* 缓存详情 */
.cache-detail {
  padding: 10px 15px;
}

.detail-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-label {
  width: 100px;
  color: #666;
  font-weight: 500;
}

.detail-value {
  flex: 1;
  color: #333;
}

.detail-preview {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px dashed #edf2f7;
  padding-bottom: 10px;
  font-weight: 500;
  color: #333;
}

.preview-content {
  max-height: 200px;
  overflow: auto;
  font-family: monospace;
  background-color: #f8fafd;
  padding: 15px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.preview-truncated {
  word-break: break-all;
  white-space: pre-wrap;
}

.detail-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

/* 缓存详情弹窗 */
.cache-detail-dialog {
  --el-dialog-padding-primary: 20px;
}

.cache-detail-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #edf2f7;
  background: linear-gradient(to right, #f8fafd, #fff);
}

.cache-detail-content {
  padding: 10px 0;
}

.detail-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.detail-key {
  margin-bottom: 15px;
}

.detail-key .label {
  color: #666;
  margin-right: 10px;
  font-weight: 500;
}

.detail-key .value {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 500;
  color: #3a7bd5;
}

.detail-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  color: #666;
  margin-right: 8px;
}

.detail-value-container {
  margin-top: 15px;
}

.value-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #edf2f7;
  font-weight: 500;
}

.value-actions {
  display: flex;
  gap: 10px;
}

.value-content {
  background-color: #f8fafd;
  padding: 15px;
  border-radius: 8px;
  overflow: auto;
  max-height: 400px;
  border: 1px solid #edf2f7;
}

.value-code {
  font-family: monospace;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.95rem;
  line-height: 1.5;
}

.value-code.formatted {
  color: #333;
}

/* 过期时间弹窗 */
.expiration-dialog {
  --el-dialog-padding-primary: 20px;
}

.expiration-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.expiration-content {
  padding: 20px 0;
}

.expiration-info {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #f0f0f0;
}

.expiration-info .info-item {
  margin-bottom: 10px;
}

.expiration-info .label {
  color: #666;
  font-weight: 500;
  width: 120px;
  display: inline-block;
}

.expiration-info .value {
  color: #333;
  font-weight: 500;
}

.expiration-form {
  margin-top: 20px;
}

/* 分页 */
.pagination-container {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: center;
}

.pagination-container :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #fd79a8;
}

/* 表格自适应高度 */
.el-table__body-wrapper {
  overflow-y: auto;
  height: 450px;
  transition: height 0.3s;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner-title {
    font-size: 1.8rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .action-area {
    flex-direction: column;
    gap: 10px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .detail-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .value-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

<style>
/* 全局样式补充 */
.el-button.el-button--primary {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  border: none;
}

.el-button.el-button--primary:hover {
  background: linear-gradient(135deg, #3571c5, #00bfe6);
  box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
}

.el-button.el-button--primary.is-link {
  background: none;
}

.el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #3a7bd5, #00d2ff);
  border-color: #3a7bd5;
  box-shadow: -1px 0 0 0 #3a7bd5;
}

.el-tag.el-tag--success {
  background-color: rgba(46, 204, 113, 0.1);
  border-color: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.el-tag.el-tag--danger {
  background-color: rgba(231, 76, 60, 0.1);
  border-color: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.el-tag.el-tag--warning {
  background-color: rgba(241, 196, 15, 0.1);
  border-color: rgba(241, 196, 15, 0.2);
  color: #f1c40f;
}

.el-tag.el-tag--info {
  background-color: rgba(52, 152, 219, 0.1);
  border-color: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.el-progress-bar__inner {
  transition: all 0.5s ease;
}

.el-table {
  --el-table-border-color: #edf2f7;
  --el-table-border: 1px solid #edf2f7;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.refresh-animation {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cache-overview .el-col {
  animation: fadeIn 0.5s ease forwards;
}

.cache-overview .el-col:nth-child(1) { animation-delay: 0.1s; }
.cache-overview .el-col:nth-child(2) { animation-delay: 0.2s; }
.cache-overview .el-col:nth-child(3) { animation-delay: 0.3s; }
.cache-overview .el-col:nth-child(4) { animation-delay: 0.4s; }

.el-notification {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.el-message {
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  border: none;
}

.el-message.el-message--success {
  background-color: rgba(46, 204, 113, 0.9);
  color: white;
}

.el-message.el-message--error {
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
}

.el-message.el-message--warning {
  background-color: rgba(241, 196, 15, 0.9);
  color: white;
}

.el-message.el-message--info {
  background-color: rgba(52, 152, 219, 0.9);
  color: white;
}

.el-message .el-message__icon {
  color: white;
}

.el-message .el-message__closeBtn {
  color: white;
}
</style> 