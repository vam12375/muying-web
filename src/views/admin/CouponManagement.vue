<template>
  <div class="coupon-management">
    <div class="page-header">
      <h2 class="page-title">优惠券管理</h2>
      <div class="page-actions">
        <el-button type="primary" @click="showCreateDialog">
          <el-icon><Plus /></el-icon>
          创建优惠券
        </el-button>
      </div>
    </div>

    <el-card class="filter-card">
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="优惠券名称">
            <el-input v-model="filterForm.name" placeholder="搜索优惠券名称" clearable />
          </el-form-item>
          <el-form-item label="优惠券类型">
            <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
              <el-option label="固定金额" value="FIXED" />
              <el-option label="百分比折扣" value="PERCENTAGE" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option label="可用" value="ACTIVE" />
              <el-option label="不可用" value="INACTIVE" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">筛选</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="couponList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="优惠券名称" min-width="150" />
        <el-table-column label="优惠类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'FIXED' ? 'primary' : 'success'">
              {{ scope.row.type === 'FIXED' ? '固定金额' : '百分比折扣' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠值" width="120">
          <template #default="scope">
            <span v-if="scope.row.type === 'FIXED'">¥{{ scope.row.value }}</span>
            <span v-else>{{ scope.row.value * 10 }}折</span>
          </template>
        </el-table-column>
        <el-table-column prop="minSpend" label="最低消费" width="120">
          <template #default="scope">
            ¥{{ scope.row.minSpend }}
          </template>
        </el-table-column>
        <el-table-column label="发行/领取/使用" width="150">
          <template #default="scope">
            {{ scope.row.totalQuantity === 0 ? '不限' : scope.row.totalQuantity }} / 
            {{ scope.row.receivedQuantity }} / 
            {{ scope.row.usedQuantity }}
          </template>
        </el-table-column>
        <el-table-column label="剩余数量" width="120">
          <template #default="scope">
            <span v-if="scope.row.totalQuantity === 0">不限</span>
            <span v-else>{{ scope.row.totalQuantity - scope.row.receivedQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户领取限制" width="120">
          <template #default="scope">
            <span v-if="!scope.row.userLimit || scope.row.userLimit === 1">1次/人</span>
            <span v-else-if="scope.row.userLimit === 0">不限次数</span>
            <span v-else>{{ scope.row.userLimit }}次/人</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ scope.row.status === 'ACTIVE' ? '可用' : '不可用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="有效期" min-width="220">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }} 至 {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDeleteCoupon(scope.row)"
              :disabled="scope.row.receivedQuantity > 0"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑优惠券对话框 -->
    <el-dialog 
      :title="dialogType === 'create' ? '创建优惠券' : '编辑优惠券'" 
      v-model="dialogVisible"
      width="650px"
    >
      <el-form 
        ref="couponFormRef"
        :model="couponForm"
        :rules="couponRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="优惠券名称" prop="name">
          <el-input v-model="couponForm.name" placeholder="请输入优惠券名称" />
        </el-form-item>
        
        <el-form-item label="优惠类型" prop="type">
          <el-radio-group v-model="couponForm.type">
            <el-radio label="FIXED">固定金额</el-radio>
            <el-radio label="PERCENTAGE">百分比折扣</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          :label="couponForm.type === 'FIXED' ? '优惠金额' : '折扣比例'" 
          prop="value"
        >
          <el-input-number 
            v-model="couponForm.value" 
            :min="couponForm.type === 'FIXED' ? 0.01 : 0.1"
            :max="couponForm.type === 'FIXED' ? 1000 : 1"
            :step="couponForm.type === 'FIXED' ? 1 : 0.01"
            :precision="2"
          />
          <span class="form-tip">
            {{ couponForm.type === 'FIXED' ? '元' : '(0.9 = 9折)' }}
          </span>
        </el-form-item>
        
        <el-form-item label="最低消费金额" prop="minSpend">
          <el-input-number 
            v-model="couponForm.minSpend" 
            :min="0"
            :step="1"
            :precision="2"
          />
          <span class="form-tip">元 (0表示无门槛)</span>
        </el-form-item>
        
        <el-form-item label="最大折扣金额" v-if="couponForm.type === 'PERCENTAGE'">
          <el-input-number 
            v-model="couponForm.maxDiscount" 
            :min="0"
            :step="1"
            :precision="2"
          />
          <span class="form-tip">元 (0或留空表示不限制)</span>
        </el-form-item>
        
        <el-form-item label="优惠券状态" prop="status">
          <el-radio-group v-model="couponForm.status">
            <el-radio label="ACTIVE">可用</el-radio>
            <el-radio label="INACTIVE">不可用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="发行数量" prop="totalQuantity">
          <el-input-number 
            v-model="couponForm.totalQuantity" 
            :min="0"
            :step="10"
            :precision="0"
          />
          <span class="form-tip">(0表示不限量)</span>
        </el-form-item>
        
        <el-form-item label="用户领取次数" prop="userLimit">
          <el-input-number 
            v-model="couponForm.userLimit" 
            :min="0"
            :step="1"
            :precision="0"
          />
          <span class="form-tip">(默认1次，0表示不限制)</span>
        </el-form-item>
        
        <el-form-item label="有效期" prop="dateRange">
          <el-date-picker
            v-model="couponForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        
        <el-form-item label="适用商品分类">
          <el-select
            v-model="couponForm.categoryIds"
            multiple
            clearable
            placeholder="不选表示适用全部分类"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <div class="dialog-footer">
            <el-button @click="cancelDialog">取消</el-button>
            <el-button type="primary" @click="submitCouponForm" :loading="submitLoading">
              确定
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminRequest } from '@/utils/request'

// 状态变量
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('create') // create 或 edit
const couponList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const categoryOptions = ref([]) // 商品分类选项

// 表单相关
const couponFormRef = ref(null)
const couponForm = reactive({
  id: null,
  name: '',
  type: 'FIXED',
  value: 10,
  minSpend: 100,
  maxDiscount: 0,
  status: 'ACTIVE',
  categoryIds: [],
  brandIds: [],
  productIds: [],
  isStackable: false,
  totalQuantity: 100,
  userLimit: 1, // 默认每用户只能领取1次
  dateRange: [],
  startTime: '',
  endTime: ''
})

// 筛选表单
const filterForm = reactive({
  name: '',
  type: '',
  status: ''
})

// 表单验证规则
const couponRules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在2-50个字符之间', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入优惠值', trigger: 'blur' }],
  status: [{ required: true, message: '请选择优惠券状态', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择有效期范围', trigger: 'change' }]
}

// 初始化
onMounted(() => {
  fetchCouponList()
  fetchCategories()
})

// 获取优惠券列表
const fetchCouponList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...filterForm
    }
    
    const res = await adminRequest.get('/api/admin/coupons', { params })
    if (res.data.code === 200) {
      couponList.value = res.data.data.list
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.message || '获取优惠券列表失败')
    }
  } catch (error) {
    console.error('获取优惠券列表失败', error)
    ElMessage.error('获取优惠券列表失败')
  } finally {
    loading.value = false
  }
}

// 获取商品分类选项
const fetchCategories = async () => {
  try {
    const res = await adminRequest.get('/api/admin/categories')
    if (res.data.code === 200) {
      categoryOptions.value = res.data.data.map(item => ({
        label: item.name,
        value: item.category_id.toString()
      }))
    }
  } catch (error) {
    console.error('获取商品分类失败', error)
  }
}

// 筛选
const handleFilter = () => {
  currentPage.value = 1
  fetchCouponList()
}

// 重置筛选
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  currentPage.value = 1
  fetchCouponList()
}

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size
  fetchCouponList()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchCouponList()
}

// 显示创建对话框
const showCreateDialog = () => {
  dialogType.value = 'create'
  resetCouponForm()
  dialogVisible.value = true
}

// 显示编辑对话框
const showEditDialog = (row) => {
  dialogType.value = 'edit'
  resetCouponForm()
  
  // 填充表单数据
  Object.keys(couponForm).forEach(key => {
    if (key in row) {
      couponForm[key] = row[key]
    }
  })
  
  // 设置日期范围
  couponForm.dateRange = [row.startTime, row.endTime]
  
  // 设置分类IDs（如果有）
  if (row.categoryIds) {
    couponForm.categoryIds = row.categoryIds.split(',')
  }
  
  dialogVisible.value = true
}

// 重置表单
const resetCouponForm = () => {
  if (couponFormRef.value) {
    couponFormRef.value.resetFields()
  }
  
  couponForm.id = null
  couponForm.name = ''
  couponForm.type = 'FIXED'
  couponForm.value = 10
  couponForm.minSpend = 100
  couponForm.maxDiscount = 0
  couponForm.status = 'ACTIVE'
  couponForm.categoryIds = []
  couponForm.brandIds = []
  couponForm.productIds = []
  couponForm.isStackable = false
  couponForm.totalQuantity = 100
  couponForm.dateRange = []
  couponForm.startTime = ''
  couponForm.endTime = ''
}

// 取消对话框
const cancelDialog = () => {
  dialogVisible.value = false
}

// 提交表单
const submitCouponForm = async () => {
  if (!couponFormRef.value) return
  
  await couponFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    // 处理日期
    if (couponForm.dateRange && couponForm.dateRange.length === 2) {
      couponForm.startTime = couponForm.dateRange[0]
      couponForm.endTime = couponForm.dateRange[1]
    }
    
    submitLoading.value = true
    try {
      const formData = { ...couponForm }
      delete formData.dateRange
      
      // 处理分类IDs
      if (formData.categoryIds && formData.categoryIds.length > 0) {
        formData.categoryIds = formData.categoryIds.join(',')
      } else {
        formData.categoryIds = null
      }
      
      let res
      if (dialogType.value === 'create') {
        res = await adminRequest.post('/api/admin/coupons', formData)
      } else {
        res = await adminRequest.put(`/api/admin/coupons/${formData.id}`, formData)
      }
      
      if (res.data.code === 200) {
        ElMessage.success(dialogType.value === 'create' ? '创建成功' : '更新成功')
        dialogVisible.value = false
        fetchCouponList()
      } else {
        ElMessage.error(res.data.message || (dialogType.value === 'create' ? '创建失败' : '更新失败'))
      }
    } catch (error) {
      console.error(dialogType.value === 'create' ? '创建优惠券失败' : '更新优惠券失败', error)
      ElMessage.error(dialogType.value === 'create' ? '创建优惠券失败' : '更新优惠券失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 删除优惠券
const handleDeleteCoupon = (row) => {
  // 如果已有用户领取，不允许删除
  if (row.receivedQuantity > 0) {
    ElMessage.warning('已有用户领取此优惠券，不能删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除此优惠券吗？此操作不可恢复', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adminRequest.delete(`/api/admin/coupons/${row.id}`)
      if (res.data.code === 200) {
        ElMessage.success('删除成功')
        fetchCouponList()
      } else {
        ElMessage.error(res.data.message || '删除失败')
      }
    } catch (error) {
      console.error('删除优惠券失败', error)
      ElMessage.error('删除优惠券失败')
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.coupon-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 