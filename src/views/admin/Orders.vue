<template>
  <div class="orders-container">
    <div class="header">
      <h2>订单管理</h2>
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input v-model="searchForm.orderNo" placeholder="订单号" />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="订单状态">
            <el-option label="全部" value="" />
            <el-option label="待付款" value="UNPAID" />
            <el-option label="待发货" value="PAID" />
            <el-option label="已发货" value="SHIPPED" />
            <el-option label="已完成" value="COMPLETED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="orderList" style="width: 100%">
      <el-table-column prop="orderID" label="订单号" width="180" />
      <el-table-column prop="userID" label="用户ID" width="120" />
      <el-table-column prop="order_price" label="订单金额" width="120" />
      <el-table-column prop="order_time" label="下单时间" width="180" />
      <el-table-column prop="order_status" label="订单状态" width="120" />
      <el-table-column prop="order_address" label="收货地址" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button 
            size="small"
            @click="handleView(scope.row)">查看</el-button>
          <el-button
            size="small"
            type="primary"
            @click="handleShip(scope.row)"
            v-if="scope.row.order_status === 'PAID'">发货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="70%"
    >
      <div v-if="orderDetail" class="order-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <p><strong>订单编号：</strong>{{ orderDetail.orderNo }}</p>
          <p><strong>创建时间：</strong>{{ orderDetail.createTime }}</p>
          <p><strong>订单状态：</strong>{{ orderDetail.status }}</p>
          <p><strong>支付方式：</strong>{{ orderDetail.payType || '未支付' }}</p>
          <p><strong>支付时间：</strong>{{ orderDetail.payTime || '未支付' }}</p>
        </div>
        
        <div class="detail-section">
          <h3>收货信息</h3>
          <p><strong>收货人：</strong>{{ orderDetail.receiverName }}</p>
          <p><strong>联系电话：</strong>{{ orderDetail.receiverPhone }}</p>
          <p><strong>收货地址：</strong>{{ orderDetail.receiverAddress }}</p>
        </div>
        
        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="orderDetail.orderItems || []" stripe>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="productImage" label="商品图片">
              <template #default="scope">
                <img :src="scope.row.productImage" style="width: 50px; height: 50px;" />
              </template>
            </el-table-column>
            <el-table-column prop="productPrice" label="单价" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column prop="totalAmount" label="小计" />
          </el-table>
        </div>
        
        <div class="detail-section">
          <h3>金额信息</h3>
          <p><strong>商品总额：</strong>¥{{ orderDetail.totalAmount }}</p>
          <p><strong>运费：</strong>¥{{ orderDetail.freightAmount || 0 }}</p>
          <p><strong>优惠金额：</strong>¥{{ orderDetail.discountAmount || 0 }}</p>
          <p><strong>实付金额：</strong>¥{{ orderDetail.payAmount }}</p>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="orderDetail && orderDetail.status === '待发货'"
            type="primary" 
            @click="handleShip(orderDetail)"
          >
            发货
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, shipOrder, getOrderDetail } from '@/api/admin' // 导入相关API

const searchForm = ref({
  orderNo: '',
  status: ''
})

const orderList = ref([])
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)

// 订单详情数据
const orderDetail = ref(null)
const detailDialogVisible = ref(false)

// 获取订单列表
const getOrders = async () => {
  try {
    // TODO: 调用获取订单列表API
    const res = await getOrderList({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm.value
    })
    
    if (res && res.code === 200) {
      orderList.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res?.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  getOrders()
}

// 查看订单详情
const handleView = async (row) => {
  // TODO: 实现查看订单详情逻辑
  try {
    const res = await getOrderDetail(row.orderNo)
    if (res && res.code === 200) {
      orderDetail.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res?.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 发货
const handleShip = async (row) => {
  try {
    // TODO: 调用发货API
    const confirmed = await ElMessageBox.confirm(`确认为订单 ${row.orderNo} 发货?`, '确认发货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    if (confirmed) {
      const res = await shipOrder(row.orderNo)
      if (res && res.code === 200) {
        ElMessage.success('发货成功')
        getOrders() // 刷新订单列表
      } else {
        ElMessage.error(res?.message || '发货失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发货失败:', error)
      ElMessage.error('发货失败')
    }
  }
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  getOrders()
}

onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style> 