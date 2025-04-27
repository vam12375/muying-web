<template>
  <div class="logistics-info-page">
    <!-- 返回按钮 -->
    <div class="back-button">
      <el-button type="primary" plain @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回订单列表
      </el-button>
    </div>

    <!-- 页面标题 -->
    <div class="page-title">
      <h2>物流详情</h2>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <!-- 订单信息卡片 -->
        <el-card class="order-info-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">订单信息</span>
              <el-tag 
                :type="getStatusType(logisticsData.status)" 
                effect="dark"
              >{{ getStatusText(logisticsData.status) }}</el-tag>
            </div>
          </template>
          <div class="order-info-content">
            <div class="info-section">
              <div class="info-item">
                <span class="label">订单编号:</span>
                <span class="value">{{ logisticsData.orderNo }}</span>
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="copyOrderNo(logisticsData.orderNo)"
                >复制</el-button>
              </div>
              <div class="info-item">
                <span class="label">下单时间:</span>
                <span class="value">{{ formatDate(orderData.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="label">物流公司:</span>
                <span class="value">{{ logisticsData.company }}</span>
              </div>
              <div class="info-item">
                <span class="label">物流单号:</span>
                <span class="value">{{ logisticsData.trackingNo }}</span>
                <el-button 
                  type="primary" 
                  link 
                  size="small" 
                  @click="copyTrackingNo(logisticsData.trackingNo)"
                >复制</el-button>
              </div>
              <div class="info-item">
                <span class="label">发货时间:</span>
                <span class="value">{{ formatDate(logisticsData.shippingTime) }}</span>
              </div>
              <div class="info-item" v-if="logisticsData.estimatedDelivery">
                <span class="label">预计送达:</span>
                <span class="value">{{ formatDate(logisticsData.estimatedDelivery) }}</span>
              </div>
            </div>
            
            <el-divider />
            
            <div class="info-section">
              <h4 class="section-title">收件人信息</h4>
              <div class="info-item">
                <span class="label">收件人:</span>
                <span class="value">{{ logisticsData.receiver }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话:</span>
                <span class="value">{{ logisticsData.receiverPhone }}</span>
              </div>
              <div class="info-item">
                <span class="label">收货地址:</span>
                <span class="value">{{ logisticsData.receiverAddress }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 物流轨迹卡片 -->
        <el-card class="logistics-trace-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">物流轨迹</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="refreshLogistics" 
                :loading="refreshing"
                :disabled="isRefreshDisabled"
              >
                <el-icon><Refresh /></el-icon>
                刷新物流
              </el-button>
            </div>
          </template>
          <div class="logistics-trace-content">
            <el-timeline v-if="parsedTraces && parsedTraces.length > 0">
              <el-timeline-item
                v-for="(trace, index) in parsedTraces"
                :key="index"
                :timestamp="formatDate(trace.time)"
                :type="index === 0 ? 'primary' : ''"
                :hollow="index !== 0"
              >
                <div class="trace-content">
                  <p class="trace-text">{{ trace.content }}</p>
                  <p class="trace-location" v-if="trace.location">{{ trace.location }}</p>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无物流轨迹信息" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 订单商品卡片 -->
        <el-card class="order-goods-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">订单商品</span>
              <el-tag type="info">{{ logisticsData.goodsList?.length || 0 }}件商品</el-tag>
            </div>
          </template>
          <div class="order-goods-content">
            <div v-if="logisticsData.goodsList && logisticsData.goodsList.length > 0" class="goods-list">
              <div v-for="(item, index) in logisticsData.goodsList" :key="index" class="goods-item">
                <div class="goods-image">
                  <el-image
                    :src="item.productImage"
                    fit="cover"
                    :preview-src-list="[item.productImage]"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div class="goods-info">
                  <p class="goods-name">{{ item.productName }}</p>
                  <div class="goods-price-qty">
                    <span class="goods-price">¥{{ formatPrice(item.price) }}</span>
                    <span class="goods-qty">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无商品信息" />
            
            <el-divider v-if="logisticsData.goodsList && logisticsData.goodsList.length > 0" />
            
            <div class="order-price">
              <div class="price-item">
                <span>订单总额:</span>
                <span class="price">¥{{ formatPrice(logisticsData.totalPrice) }}</span>
              </div>
              <div class="price-item">
                <span>运费:</span>
                <span class="price">¥{{ formatPrice(logisticsData.freight) }}</span>
              </div>
              <div class="price-item total">
                <span>实付金额:</span>
                <span class="price total-price">¥{{ formatPrice(logisticsData.payAmount) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 物流操作卡片 -->
        <el-card class="logistics-actions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="header-title">物流操作</span>
            </div>
          </template>
          <div class="logistics-actions-content">
            <div class="actions-list">
              <el-button type="primary" @click="openLogisticsMap">查看物流位置</el-button>
              <el-button type="success" @click="printLogistics" >打印物流单</el-button>
              <el-button v-if="isAdmin" type="warning" @click="openAddTraceDialog">添加物流节点</el-button>
              <el-button v-if="isAdmin" @click="exportLogisticsPDF">导出PDF</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加物流轨迹对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加物流轨迹"
      width="500px"
    >
      <el-form :model="traceForm" label-width="100px" :rules="traceRules" ref="traceFormRef">
        <el-form-item label="轨迹内容" prop="traceContent">
          <el-input
            v-model="traceForm.traceContent"
            type="textarea"
            :rows="3"
            placeholder="请输入物流轨迹内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="所在位置" prop="traceLocation">
          <el-input
            v-model="traceForm.traceLocation"
            placeholder="请输入物流当前位置"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTraceForm" :loading="submitting">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getLogistics, getLogisticsTraces, syncLogistics, addLogisticsTrace, updateLogisticsStatus } from '@/api/logistics'
import { ArrowLeft, Refresh, Picture } from '@element-plus/icons-vue'
import { useUserStore } from '@/store'
import { copy as copyToClipboard } from '@/utils/clipboard'
import { formatPrice } from '@/utils/dataConverter'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 状态变量
const loading = ref(false)
const refreshing = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const orderNo = ref('')
const logisticsData = ref({
  id: null,
  orderNo: '',
  trackingNo: '',
  company: '',
  status: 0,
  shippingTime: null,
  deliveryTime: null,
  estimatedDelivery: null,
  receiver: '',
  receiverPhone: '',
  receiverAddress: '',
  totalPrice: 0,
  freight: 0,
  payAmount: 0,
  traces: [],
  goodsList: []
})
const orderData = ref({
  createTime: null
})
const refreshCount = ref(0) // 记录刷新次数

// 表单数据
const traceFormRef = ref(null)
const traceForm = reactive({
  traceContent: '',
  traceLocation: ''
})
const traceRules = {
  traceContent: [
    { required: true, message: '请输入物流轨迹内容', trigger: 'blur' }
  ],
  traceLocation: [
    { required: true, message: '请输入物流当前位置', trigger: 'blur' }
  ]
}

// 计算属性
const isAdmin = userStore.isAdmin

// 添加计算属性，修改禁用按钮的判断逻辑
const isRefreshDisabled = computed(() => {
  // 正在刷新时禁用按钮
  if (refreshing.value) {
    return true;
  }
  
  // 只有在确实检测到已签收文本时才禁用按钮
  let hasSignedText = false;
  
  // 只检查轨迹中是否包含已签收信息
  if (logisticsData.value?.traces && logisticsData.value.traces.length > 0) {
    console.log('计算是否禁用刷新按钮...');
    
    for (const trace of logisticsData.value.traces) {
      if (!trace.traceContent) continue;
      
      const content = trace.traceContent;
      
      // 直接检查文本内容
      if (content.includes('已签收') || content.includes('签收人')) {
        console.log('检测到已签收文本:', content);
        hasSignedText = true;
        break;
      }
      
      // 检查JSON格式的内容
      if (content.startsWith('[') || content.startsWith('{')) {
        try {
          const parsedContent = JSON.parse(content);
          console.log('解析JSON内容:', parsedContent);
          
          // 检查数组格式
          if (Array.isArray(parsedContent)) {
            for (const item of parsedContent) {
              if (item.content && (
                item.content.includes('已签收') || 
                item.content.includes('签收人')
              )) {
                console.log('在JSON数组中检测到已签收文本:', item.content);
                hasSignedText = true;
                break;
              }
            }
          } 
          // 检查单个对象格式
          else if (parsedContent.content) {
            if (parsedContent.content.includes('已签收') || 
                parsedContent.content.includes('签收人')) {
              console.log('在JSON对象中检测到已签收文本:', parsedContent.content);
              hasSignedText = true;
            }
          }
        } catch (e) {
          console.error('解析JSON失败:', e);
        }
      }
      
      if (hasSignedText) break;
    }
  }
  
  return hasSignedText;
})

// 解析物流轨迹JSON内容
const parsedTraces = computed(() => {
  if (!logisticsData.value.traces || logisticsData.value.traces.length === 0) {
    return [];
  }
  
  try {
    // 处理第一条轨迹记录
    const firstTrace = logisticsData.value.traces[0];
    let traces = [];
    
    // 检查第一条记录是否包含JSON数组或对象
    if (firstTrace.traceContent && typeof firstTrace.traceContent === 'string') {
      // 如果看起来像是JSON字符串
      if (firstTrace.traceContent.startsWith('[') || firstTrace.traceContent.startsWith('{')) {
        try {
          const parsedContent = JSON.parse(firstTrace.traceContent);
          
          if (Array.isArray(parsedContent)) {
            // 如果是数组，直接使用
            traces = parsedContent;
          } else if (typeof parsedContent === 'object') {
            // 如果是单个对象，包装成数组
            traces = [parsedContent];
          }
        } catch (e) {
          console.error('JSON解析失败', e);
          // 如果JSON解析失败，使用原始格式
          traces = logisticsData.value.traces.map(trace => ({
            content: trace.traceContent,
            time: trace.traceTime,
            location: trace.traceLocation
          }));
        }
      } else {
        // 普通字符串，直接使用原始格式
        traces = logisticsData.value.traces.map(trace => ({
          content: trace.traceContent,
          time: trace.traceTime,
          location: trace.traceLocation
        }));
      }
    } else {
      // 使用原始格式
      traces = logisticsData.value.traces.map(trace => ({
        content: trace.traceContent,
        time: trace.traceTime,
        location: trace.traceLocation
      }));
    }
    
    // 检查轨迹内容中是否包含"已签收"，如果包含但物流状态不是已签收，则更新状态
    if (traces.some(trace => 
      trace.content && 
      (trace.content.includes('已签收') || trace.content.includes('签收人'))
    ) && logisticsData.value.status !== 4) {
      console.log('轨迹内容中包含"已签收"，但状态不是已签收，自动更新状态')
      logisticsData.value.status = 4
      // 同步更新到后端
      updateLogisticsStatus(logisticsData.value.id, 4)
        .then(() => console.log('物流状态已更新为已签收'))
        .catch(err => console.error('更新状态失败', err))
    }
    
    return traces;
  } catch (error) {
    console.error('解析物流轨迹数据失败:', error);
    // 降级处理，直接使用原始格式
    return logisticsData.value.traces.map(trace => ({
      content: typeof trace.traceContent === 'string' ? trace.traceContent : JSON.stringify(trace.traceContent),
      time: trace.traceTime,
      location: trace.traceLocation
    }));
  }
});

// 初始化
onMounted(() => {
  orderNo.value = route.params.orderNo || route.query.orderNo
  
  if (!orderNo.value) {
    ElMessage.error('订单编号不能为空')
    goBack()
    return
  }
  
  fetchLogisticsData()
})

// 获取物流数据
const fetchLogisticsData = async () => {
  try {
    loading.value = true
    const res = await getLogistics(orderNo.value)
    
    if (res && res.code === 200 && res.data) {
      logisticsData.value = res.data
      orderData.value.createTime = res.data.createTime
      
      console.log('获取到的物流状态:', logisticsData.value.status, getStatusText(logisticsData.value.status))
      console.log('获取到的物流轨迹:', logisticsData.value.traces?.length || 0, '条')
      
      // 如果有物流单号但是没有物流轨迹，尝试获取最新轨迹
      if (logisticsData.value.trackingNo && (!logisticsData.value.traces || logisticsData.value.traces.length === 0)) {
        refreshLogistics()
      }
    } else {
      ElMessage.warning('未找到该订单的物流信息')
    }
  } catch (error) {
    console.error('获取物流信息失败:', error)
    ElMessage.error('获取物流信息失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 刷新物流信息
const refreshLogistics = async () => {
  if (!logisticsData.value?.trackingNo) {
    ElMessage.warning('没有运单号，无法刷新物流')
    return
  }
  
  try {
    refreshing.value = true
    console.log('开始刷新物流，运单号:', logisticsData.value.trackingNo)
    
    // 检查现有轨迹
    if (logisticsData.value.traces && logisticsData.value.traces.length > 0) {
      console.log('现有轨迹:', logisticsData.value.traces)
      
      // 检查轨迹内容中是否包含已签收信息
      let hasSignedTrace = false
      for (const trace of logisticsData.value.traces) {
        console.log('检查轨迹:', trace.traceContent)
        if (trace.traceContent && (
             trace.traceContent.includes('已签收') || 
             trace.traceContent.includes('签收人')
           )) {
          console.log('轨迹内容直接包含已签收:', trace.traceContent)
          hasSignedTrace = true
          break
        }
        
        // 检查JSON格式
        if (trace.traceContent && (
             trace.traceContent.startsWith('[') || 
             trace.traceContent.startsWith('{')
           )) {
          console.log('尝试解析JSON:', trace.traceContent)
          try {
            const content = JSON.parse(trace.traceContent)
            console.log('解析结果:', content)
            
            if (Array.isArray(content)) {
              // 检查数组中的每一项
              for (const item of content) {
                if (item.content && (
                     item.content.includes('已签收') || 
                     item.content.includes('签收人')
                   )) {
                  console.log('JSON数组中包含已签收:', item.content)
                  hasSignedTrace = true
                  break
                }
              }
            } else if (content.content) {
              // 检查单个对象
              if (content.content.includes('已签收') || 
                  content.content.includes('签收人')) {
                console.log('JSON对象中包含已签收:', content.content)
                hasSignedTrace = true
              }
            }
          } catch (e) {
            console.error('JSON解析失败:', e)
          }
        }
      }
      
      if (hasSignedTrace) {
        console.log('轨迹中包含已签收信息，不允许刷新')
        ElMessage.warning('物流轨迹中已包含签收信息，无需再次刷新')
        
        // 强制更新状态为已签收
        if (logisticsData.value.status !== 4) {
          logisticsData.value.status = 4
          // 更新到后端
          try {
            await updateLogisticsStatus(logisticsData.value.id, 4)
            console.log('物流状态已更新为已签收')
          } catch (err) {
            console.error('更新状态失败:', err)
          }
        }
        
        refreshing.value = false
        return
      }
    }
    
    const res = await syncLogistics(
      logisticsData.value.trackingNo,
      logisticsData.value.company || '申通快递'
    )
    
    if (res.data === false) {
      ElMessage.warning('物流轨迹中包含已签收信息，无需再次刷新')
      
      // 重新获取物流数据，确保显示最新状态
      setTimeout(async () => {
        console.log('重新获取物流数据...')
        await fetchLogisticsData()
        refreshing.value = false
      }, 1000)
      return
    } else {
      ElMessage.success('物流信息已更新')
      // 延迟2秒，确保后端数据已更新
      setTimeout(async () => {
        console.log('重新获取物流数据...')
        await fetchLogisticsData()
        refreshing.value = false
      }, 2000)
      return // 提前返回，避免执行finally块
    }
  } catch (error) {
    console.error('刷新物流信息失败:', error)
    ElMessage.error('刷新物流信息失败: ' + (error.message || '未知错误'))
  } finally {
    // 仅在未提前返回的情况下执行
    setTimeout(() => {
      refreshing.value = false
    }, 1000)
  }
}

// 添加物流轨迹
const openAddTraceDialog = () => {
  dialogVisible.value = true
  traceForm.traceContent = ''
  traceForm.traceLocation = ''
}

// 提交添加轨迹表单
const submitTraceForm = async () => {
  if (!traceFormRef.value) return
  
  traceFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitting.value = true
      const res = await addLogisticsTrace(
        logisticsData.value.id,
        logisticsData.value.trackingNo,
        traceForm.traceContent,
        traceForm.traceLocation
      )
      
      if (res && res.code === 200) {
        ElMessage.success('物流轨迹添加成功')
        dialogVisible.value = false
        fetchLogisticsData() // 重新获取物流数据
      } else {
        ElMessage.error(res?.message || '物流轨迹添加失败')
      }
    } catch (error) {
      console.error('添加物流轨迹失败:', error)
      ElMessage.error('添加物流轨迹失败: ' + error.message)
    } finally {
      submitting.value = false
    }
  })
}

// 复制订单号
const copyOrderNo = (orderNo) => {
  copyToClipboard(orderNo)
  ElMessage.success('订单号已复制到剪贴板')
}

// 复制物流单号
const copyTrackingNo = (trackingNo) => {
  copyToClipboard(trackingNo)
  ElMessage.success('物流单号已复制到剪贴板')
}

// 查看物流位置
const openLogisticsMap = () => {
  ElMessageBox.alert('物流地图功能正在开发中', '提示', {
    confirmButtonText: '确定',
    type: 'info'
  })
}

// 打印物流单
const printLogistics = () => {
  ElMessageBox.alert('物流单打印功能正在开发中', '提示', {
    confirmButtonText: '确定',
    type: 'info'
  })
}

// 导出PDF
const exportLogisticsPDF = () => {
  ElMessageBox.alert('导出PDF功能正在开发中', '提示', {
    confirmButtonText: '确定',
    type: 'info'
  })
}

// 返回订单列表
const goBack = () => {
  router.push('/admin/orders')
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '暂无'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

// 获取物流状态文本
const getStatusText = (status) => {
  // 确保status是数字
  const numStatus = Number(status)
  
  switch (numStatus) {
    case 0: return '待发货'
    case 1: return '已发货'
    case 2: return '运输中'
    case 3: return '派送中'
    case 4: return '已签收'
    default: return '未知状态'
  }
}

// 获取状态对应的类型（用于标签颜色）
const getStatusType = (status) => {
  switch (status) {
    case 0: return 'info'
    case 1: return 'primary'
    case 2: return 'warning'
    case 3: return 'success'
    case 4: return 'success'
    default: return 'info'
  }
}
</script>

<style scoped>
/* 覆盖Element Plus的默认按钮间距 */
.actions-list :deep(.el-button + .el-button) {
  margin-left: 0;
}
.logistics-info-page {
  padding: 20px;
}

.back-button {
  margin-bottom: 16px;
}

.page-title {
  margin-bottom: 24px;
}

.page-title h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.info-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  font-size: 14px;
}

.label {
  color: #606266;
  min-width: 90px;
  font-weight: 500;
}

.value {
  color: #303133;
  word-break: break-all;
}

.order-info-card,
.logistics-trace-card {
  margin-bottom: 20px;
}

.trace-content {
  line-height: 1.6;
}

.trace-text {
  margin: 0;
  color: #303133;
}

.trace-location {
  margin: 4px 0 0;
  color: #909399;
  font-size: 13px;
}

.goods-list {
  margin-bottom: 16px;
}

.goods-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 80px;
  height: 80px;
  margin-right: 12px;
  flex-shrink: 0;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.4;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.goods-price-qty {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  color: #f56c6c;
  font-weight: 500;
}

.goods-qty {
  color: #909399;
  font-size: 13px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.price-item.total {
  margin-top: 12px;
  font-weight: 600;
  font-size: 16px;
}

.total-price {
  color: #f56c6c;
}

.logistics-actions-content {
  padding: 8px 0;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions-list .el-button {
  width: 100%;
}
</style>
