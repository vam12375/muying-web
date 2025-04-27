<template>
  <div class="admin-order-management">
    <h1 class="page-title">订单管理</h1>
    
    <div class="order-stats">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-value">{{ orderStats.total || 0 }}</div>
            <div class="stat-label">全部订单</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card pending">
            <div class="stat-value">{{ orderStats.pending || 0 }}</div>
            <div class="stat-label">待发货</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card shipping">
            <div class="stat-value">{{ orderStats.shipping || 0 }}</div>
            <div class="stat-label">已发货</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card completed">
            <div class="stat-value">{{ orderStats.completed || 0 }}</div>
            <div class="stat-label">已完成</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="order-controls">
      <div class="search-filters">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="订单编号">
            <el-input v-model="searchForm.orderNo" placeholder="订单编号" clearable></el-input>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select v-model="searchForm.status" placeholder="订单状态" clearable>
              <el-option label="待付款" value="待付款"></el-option>
              <el-option label="待发货" value="待发货"></el-option>
              <el-option label="待收货" value="待收货"></el-option>
              <el-option label="已完成" value="已完成"></el-option>
              <el-option label="已取消" value="已取消"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="下单时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchOrders">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="batch-operations">
        <el-button type="success" @click="exportOrdersData">导出订单</el-button>
        <el-button type="primary" @click="batchShip" :disabled="selectedOrders.length === 0">批量发货</el-button>
      </div>
    </div>
    
    <el-table
      v-loading="loading"
      :data="orderList"
      @selection-change="handleSelectionChange"
      border
      style="width: 100%"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="orderNo" label="订单编号" width="180"></el-table-column>
      <el-table-column label="订单信息" min-width="300">
        <template #default="scope">
          <div class="order-products">
            <div v-for="(product, index) in scope.row.products || []" :key="index" class="product-item">
              <el-image
                :src="product.goodsImg || product.imgUrl"
                fit="cover"
                class="product-image"
              ></el-image>
              <div class="product-info">
                <div class="product-name">{{ product.goodsName || product.name }}</div>
                <div class="product-price">
                  ¥{{ product.price }} × {{ product.quantity }}
                </div>
              </div>
            </div>
          </div>
          <div class="order-customer">
            <span class="customer-info">
              <strong>收货人：</strong>{{ scope.row.receiverName }}
            </span>
            <span class="customer-info">
              <strong>电话：</strong>{{ scope.row.receiverPhone }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          ¥{{ parseFloat(scope.row.totalAmount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="actualAmount" label="实付金额" width="120">
        <template #default="scope">
          ¥{{ parseFloat(scope.row.actualAmount || scope.row.totalAmount).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="100">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.status)">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="160"></el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button
            v-if="scope.row.status === '待发货'"
            type="primary"
            size="small"
            @click="handleShipOrder(scope.row)"
          >
            发货
          </el-button>
          <el-button
            type="info"
            size="small"
            @click="viewOrderDetail(scope.row)"
          >
            详情
          </el-button>
          <el-dropdown trigger="click">
            <el-button size="small">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="printOrder(scope.row)">打印订单</el-dropdown-item>
                <el-dropdown-item
                  v-if="scope.row.status === '待付款'"
                  @click="cancelOrder(scope.row)"
                >
                  取消订单
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="['待收货', '已完成'].includes(scope.row.status)"
                  @click="viewShippingInfo(scope.row)"
                >
                  物流信息
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
      ></el-pagination>
    </div>
    
    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="500px"
    >
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="shipForm.orderNo" disabled></el-input>
        </el-form-item>
        <el-form-item label="快递公司">
          <el-select v-model="shipForm.courierName" placeholder="请选择快递公司">
            <el-option label="顺丰速运" value="顺丰速运"></el-option>
            <el-option label="中通快递" value="中通快递"></el-option>
            <el-option label="圆通速递" value="圆通速递"></el-option>
            <el-option label="韵达快递" value="韵达快递"></el-option>
            <el-option label="申通快递" value="申通快递"></el-option>
            <el-option label="邮政EMS" value="邮政EMS"></el-option>
            <el-option label="京东物流" value="京东物流"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号">
          <el-input v-model="shipForm.trackingNo" placeholder="手动输入或留空自动生成"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip" :loading="shipLoading">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量发货对话框 -->
    <el-dialog
      v-model="batchShipDialogVisible"
      title="批量发货"
      width="700px"
    >
      <p>您已选择 {{ selectedOrders.length }} 个订单进行发货操作</p>
      <el-table :data="selectedOrders" style="width: 100%" max-height="400px">
        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
        <el-table-column label="快递公司" width="180">
          <template #default="scope">
            <el-select v-model="scope.row.courierName" placeholder="请选择">
              <el-option label="顺丰速运" value="顺丰速运"></el-option>
              <el-option label="中通快递" value="中通快递"></el-option>
              <el-option label="圆通速递" value="圆通速递"></el-option>
              <el-option label="韵达快递" value="韵达快递"></el-option>
              <el-option label="申通快递" value="申通快递"></el-option>
              <el-option label="邮政EMS" value="邮政EMS"></el-option>
              <el-option label="京东物流" value="京东物流"></el-option>
            </el-select>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchShipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchShip" :loading="batchShipLoading">确认批量发货</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="订单详情"
      width="70%"
      align-center
    >
      <template v-if="currentOrder">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getOrderStatusType(currentOrder.status)">{{ getOrderStatusText(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPaymentMethod(currentOrder.paymentMethod) }}</el-descriptions-item>
          <el-descriptions-item label="总金额">¥ {{ currentOrder.totalAmount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">¥ {{ currentOrder.actualAmount?.toFixed(2) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 支付信息 -->
        <div v-if="currentOrder.payment" class="payment-detail">
          <h3>支付信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付ID">{{ currentOrder.payment.id }}</el-descriptions-item>
            <el-descriptions-item label="支付单号">{{ currentOrder.payment.paymentNo }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ getPaymentMethod(currentOrder.payment.paymentMethod) }}</el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag :type="getPaymentStatusType(getAdjustedPaymentStatus())">
                {{ getPaymentStatusText(getAdjustedPaymentStatus()) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付金额">¥ {{ (currentOrder.actualAmount || currentOrder.payment?.amount || 0).toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ getPaymentDisplayTime() }}</el-descriptions-item>
            <el-descriptions-item label="交易号">{{ currentOrder.payment?.transactionId || '暂无' }}</el-descriptions-item>
            <el-descriptions-item label="支付过期时间" v-if="shouldShowPaymentExpireTime()">
              {{ currentOrder.payment?.expireTime || '暂无' }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" v-else>
              {{ currentOrder.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="order-customer-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="收货人" :span="2">
              {{ currentOrder.receiverName }} {{ currentOrder.receiverPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">
              {{ currentOrder.receiverAddress }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- 物流信息 -->
        <div class="logistics-detail">
          <h3>物流信息</h3>
          <div v-if="logistics" class="logistics-info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="物流公司">{{ logistics.company }}</el-descriptions-item>
              <el-descriptions-item label="物流单号">{{ logistics.trackingNo }}</el-descriptions-item>
              <el-descriptions-item label="物流状态">
                <el-tag :type="getLogisticsStatusType(logistics.status)">
                  {{ getLogisticsStatusText(logistics.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="发货时间">{{ logistics.shipTime }}</el-descriptions-item>
              <el-descriptions-item label="收货人">{{ logistics.receiver }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ logistics.receiverPhone }}</el-descriptions-item>
              <el-descriptions-item label="收货地址" :span="2">{{ logistics.receiverAddress }}</el-descriptions-item>
            </el-descriptions>
            
            <!-- 物流轨迹 -->
            <div class="logistics-trace">
              <h4>物流轨迹</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(trace, index) in logisticsTraces"
                  :key="index"
                  :timestamp="trace.traceTime"
                  :type="index === 0 ? 'primary' : ''"
                >
                  <h5>{{ trace.traceContent }}</h5>
                  <p v-if="trace.traceLocation">{{ trace.traceLocation }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
            
            <!-- 物流操作 -->
            <div class="logistics-actions">
              <el-button type="primary" @click="syncLogisticsHandler">同步物流信息</el-button>
              <el-button type="success" @click="addTraceDialogVisible = true">添加物流轨迹</el-button>
              <el-button @click="viewLogisticsTracking(currentOrder.orderNo)">查看物流跟踪页面</el-button>
            </div>
          </div>
          
          <!-- 无物流信息时显示创建物流表单 -->
          <div v-else class="no-logistics">
            <p>该订单暂无物流信息</p>
            <el-button 
              v-if="isOrderPaid(currentOrder.status)" 
              type="primary" 
              @click="createLogisticsDialogVisible = true"
            >
              创建物流信息
            </el-button>
          </div>
        </div>
        
        <div class="order-products-detail">
          <h3>商品信息</h3>
          <div v-if="!currentOrder.products || currentOrder.products.length === 0" class="no-products-info">
            <el-empty description="暂无商品信息" :image-size="100">
              <template #description>
                <p>暂无商品信息或商品信息加载失败</p>
              </template>
            </el-empty>
          </div>
          <el-table v-else :data="currentOrder.products || []" style="width: 100%">
            <el-table-column label="商品" min-width="300">
              <template #default="scope">
                <div class="product-item-detail">
                  <el-image
                    :src="scope.row.goodsImg || scope.row.imgUrl"
                    fit="cover"
                    class="product-image-detail"
                    :preview-src-list="[scope.row.goodsImg || scope.row.imgUrl]"
                  ></el-image>
                  <div class="product-info-detail">
                    <div class="product-name-detail">{{ scope.row.goodsName || scope.row.name }}</div>
                    <div v-if="scope.row.specs || scope.row.skuName" class="product-specs">
                      规格: {{ scope.row.specs || scope.row.skuName }}
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="120">
              <template #default="scope">
                ¥{{ parseFloat(scope.row.price).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="scope">
                ¥{{ (parseFloat(scope.row.price) * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="order-timeline" v-if="currentOrder.orderNo">
          <h3>订单动态</h3>
          <el-timeline>
            <el-timeline-item
              v-if="currentOrder.confirmTime"
              :timestamp="currentOrder.confirmTime"
              type="success"
            >
              订单已完成，用户确认收货
            </el-timeline-item>
            <el-timeline-item
              v-if="currentOrder.shipTime"
              :timestamp="currentOrder.shipTime"
              type="primary"
            >
              商品已发货，物流单号: {{ currentOrder.trackingNo }}
            </el-timeline-item>
            <el-timeline-item
              v-if="currentOrder.payTime"
              :timestamp="currentOrder.payTime"
              type="warning"
            >
              订单已支付
            </el-timeline-item>
            <el-timeline-item
              :timestamp="currentOrder.createTime"
              type="info"
            >
              订单已创建
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>
    </el-dialog>

    <!-- 添加物流信息对话框 -->
    <el-dialog
      v-model="createLogisticsDialogVisible"
      title="创建物流信息"
      width="500px"
    >
      <el-form :model="logisticsForm" label-width="100px" ref="logisticsFormRef">
        <el-form-item label="物流公司" prop="company" required>
          <el-select v-model="logisticsForm.company" placeholder="选择物流公司">
            <el-option label="顺丰速运" value="SF" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="圆通速递" value="YTO" />
            <el-option label="韵达快递" value="YD" />
            <el-option label="申通快递" value="STO" />
            <el-option label="京东物流" value="JD" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="trackingNo" required>
          <el-input v-model="logisticsForm.trackingNo" placeholder="输入物流单号" />
        </el-form-item>
        <el-form-item label="收货人" prop="receiver" required>
          <el-input v-model="logisticsForm.receiver" :disabled="true" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiverPhone" required>
          <el-input v-model="logisticsForm.receiverPhone" :disabled="true" />
        </el-form-item>
        <el-form-item label="收货地址" prop="receiverAddress" required>
          <el-input v-model="logisticsForm.receiverAddress" type="textarea" :disabled="true" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createLogisticsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitLogistics" :loading="logisticsSubmitting">
            确认创建
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加物流轨迹对话框 -->
    <el-dialog
      v-model="addTraceDialogVisible"
      title="添加物流轨迹"
      width="500px"
    >
      <el-form :model="traceForm" label-width="100px" ref="traceFormRef">
        <el-form-item label="轨迹内容" prop="traceContent" required>
          <el-input v-model="traceForm.traceContent" type="textarea" placeholder="输入轨迹内容" />
        </el-form-item>
        <el-form-item label="当前位置" prop="traceLocation">
          <el-input v-model="traceForm.traceLocation" placeholder="输入当前位置" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addTraceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTrace" :loading="traceSubmitting">
            确认添加
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAdminOrders, getOrderDetail, shipOrder, cancelOrderAdmin, getOrderPaymentDetail, exportOrders, getOrderStats } from '@/api/admin';
import { getStatusText, getStatusType } from '@/utils/orderStatusMapper';
import { syncLogistics, getLogistics, getLogisticsTraces, createLogistics, addLogisticsTrace } from '@/api/logistics'; 
import { ArrowDown } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 数据
const loading = ref(false);
const orderList = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const orderStats = ref({
  total: 0,
  pending: 0,
  shipping: 0,
  completed: 0
});

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  status: '',
  dateRange: []
});

// 发货相关
const shipDialogVisible = ref(false);
const shipLoading = ref(false);
const shipForm = reactive({
  orderNo: '',
  courierName: '',
  trackingNo: ''
});

// 批量发货相关
const selectedOrders = ref([]);
const batchShipDialogVisible = ref(false);
const batchShipLoading = ref(false);

// 详情相关
const detailDialogVisible = ref(false);
const currentOrder = ref({});

// 物流相关
const logistics = ref(null);
const logisticsTraces = ref([]);
const createLogisticsDialogVisible = ref(false);
const addTraceDialogVisible = ref(false);
const logisticsSubmitting = ref(false);
const traceSubmitting = ref(false);
const logisticsForm = reactive({
  company: '',
  trackingNo: '',
  receiver: '',
  receiverPhone: '',
  receiverAddress: ''
});
const traceForm = reactive({
  traceContent: '',
  traceLocation: ''
});

// 在这里添加onMounted钩子
onMounted(() => {
  // 页面加载时自动查询订单列表
  searchOrders();
  // 页面加载时自动查询订单统计数据
  fetchOrderStats();
});

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined
    };
    
    console.log('获取订单列表参数:', params);
    
    const res = await getAdminOrders(params);
    console.log('订单列表响应:', res);
    
    // 添加更详细的调试信息
    console.log('响应数据结构:', {
      hasData: !!res.data,
      dataType: typeof res.data,
      hasRecords: res.data && (!!res.data.records || !!res.data.list),
      recordsType: res.data ? (res.data.records ? typeof res.data.records : (res.data.list ? typeof res.data.list : 'undefined')) : 'undefined',
      recordsLength: res.data ? (res.data.records ? res.data.records.length : (res.data.list ? res.data.list.length : 0)) : 0,
      recordsIsArray: res.data ? (res.data.records ? Array.isArray(res.data.records) : (res.data.list ? Array.isArray(res.data.list) : false)) : false,
      total: res.data && (res.data.total || res.data.totalCount || res.data.count),
      current: res.data && (res.data.current || res.data.currentPage || res.data.page),
      pages: res.data && (res.data.pages || res.data.totalPages),
      size: res.data && (res.data.size || res.data.pageSize),
      rawData: res.data ? JSON.stringify(res.data).substring(0, 200) + '...' : 'undefined',
      // 检查原始数据是否为数组
      isResDataArray: Array.isArray(res.data)
    });
    
    if (res.code === 200) {
      // 处理获取到的数据，确保格式一致
      let orderRecords = [];
      
      // 支持多种可能的响应数据结构
      if (res.data) {
        if (res.data.records && Array.isArray(res.data.records)) {
          // 标准分页格式 data.records
          orderRecords = res.data.records;
          total.value = res.data.total || 0;
        } else if (res.data.list && Array.isArray(res.data.list)) {
          // 另一种常见分页格式 data.list
          orderRecords = res.data.list;
          total.value = res.data.total || res.data.totalCount || res.data.count || 0;
        } else if (Array.isArray(res.data)) {
          // data直接是数组的情况
          orderRecords = res.data;
          total.value = res.data.length;
        } else if (typeof res.data === 'object') {
          // 尝试遍历data的所有属性，查找可能的数组
          console.log('尝试检查对象的所有属性寻找订单数组');
          for (const key in res.data) {
            if (Array.isArray(res.data[key])) {
              console.log(`找到可能的订单数组属性: ${key}，长度: ${res.data[key].length}`);
              // 如果找到数组，并且数组元素看起来像订单（具有orderNo或id属性）
              if (res.data[key].length > 0 && (
                res.data[key][0].orderNo || 
                res.data[key][0].id || 
                res.data[key][0].order_no || 
                res.data[key][0].order_id
              )) {
                orderRecords = res.data[key];
                total.value = res.data.total || res.data.totalCount || orderRecords.length;
                break;
              }
            }
          }
          
          // 如果还是没找到，尝试在data对象中查找常见的订单属性
          if (orderRecords.length === 0) {
            console.log('尝试从整个数据对象中构建订单列表');
            // 检查是否是单个订单对象
            if (res.data.orderNo || res.data.id || res.data.order_no || res.data.order_id) {
              orderRecords = [res.data];
              total.value = 1;
            }
          }
        }
      }
      
      if (orderRecords.length > 0) {
        console.log('成功解析到订单数据，长度:', orderRecords.length);
        orderList.value = orderRecords.map(order => {
          // 记录原始状态值以便调试
          const rawStatus = order.status || order.orderStatus || order.order_status;
          
          // 确保数据格式统一
          const processedOrder = {
            ...order,
            // 保存原始状态
            rawStatus: rawStatus,
            // 确保状态文本格式一致
            status: formatOrderStatus(rawStatus),
            // 确保金额以数字格式存储
            totalAmount: parseFloat(order.totalAmount || order.amount || order.total || order.order_price || 0),
            actualAmount: parseFloat(order.actualAmount || order.payAmount || order.paidAmount || order.actual_amount || 0),
            // 确保日期格式一致
            createTime: order.createTime || order.orderTime || order.createDate || order.order_time || order.create_time || new Date().toISOString(),
            // 其他可能的字段映射
            receiverName: order.receiverName || order.consignee || order.userName || order.receiver_name || order.user_name || '',
            receiverPhone: order.receiverPhone || order.consigneePhone || order.userPhone || order.receiver_phone || order.user_phone || '',
            receiverAddress: order.receiverAddress || order.address || order.receiver_address || (
              [order.province, order.city, order.district, order.detail].filter(Boolean).join(' ')
            ) || ''
          };
          
          // 确保订单号格式一致
          processedOrder.orderNo = order.orderNo || order.orderId || order.orderSn || order.id || order.order_no || order.order_id || '未知订单号';
          
          // 确保产品信息是数组格式并标准化字段名称
          if (order.products && Array.isArray(order.products)) {
            processedOrder.products = order.products.map(product => ({
              ...product,
              goodsId: product.goodsId || product.productId || product.itemId || product.id || product.goods_id || product.product_id,
              goodsName: product.goodsName || product.productName || product.name || product.title || product.goods_name || product.product_name || '未知商品',
              goodsImg: product.goodsImg || product.productImage || product.imgUrl || product.image || product.goods_img || product.product_image || 'https://via.placeholder.com/80',
              price: parseFloat(product.price || product.unitPrice || product.unit_price || 0),
              quantity: parseInt(product.quantity || product.count || product.num || 1)
            }));
          } else if (order.orderItems && Array.isArray(order.orderItems)) {
            // 如果使用orderItems字段存储产品信息
            processedOrder.products = order.orderItems.map(item => ({
              goodsId: item.goodsId || item.productId || item.itemId || item.id || item.goods_id || item.product_id,
              goodsName: item.goodsName || item.productName || item.name || item.title || item.goods_name || item.product_name || '未知商品',
              goodsImg: item.goodsImg || item.productImage || item.imgUrl || item.image || item.goods_img || item.product_image || 'https://via.placeholder.com/80',
              price: parseFloat(item.price || item.unitPrice || item.unit_price || 0),
              quantity: parseInt(item.quantity || item.count || item.num || 1)
            }));
          } else if (order.items && Array.isArray(order.items)) {
            // 如果使用items字段存储产品信息
            processedOrder.products = order.items.map(item => ({
              goodsId: item.goodsId || item.productId || item.itemId || item.id || item.goods_id || item.product_id,
              goodsName: item.goodsName || item.productName || item.name || item.title || item.goods_name || item.product_name || '未知商品',
              goodsImg: item.goodsImg || item.productImage || item.imgUrl || item.image || item.goods_img || item.product_image || 'https://via.placeholder.com/80',
              price: parseFloat(item.price || item.unitPrice || item.unit_price || 0),
              quantity: parseInt(item.quantity || item.count || item.num || 1)
            }));
          } else if (order.order_items && Array.isArray(order.order_items)) {
            // 处理snake_case命名的订单项
            processedOrder.products = order.order_items.map(item => ({
              goodsId: item.goods_id || item.product_id || item.item_id || item.id,
              goodsName: item.goods_name || item.product_name || item.name || item.title || '未知商品',
              goodsImg: item.goods_img || item.product_image || item.img_url || item.image || 'https://via.placeholder.com/80',
              price: parseFloat(item.price || item.unit_price || 0),
              quantity: parseInt(item.quantity || item.count || item.num || 1)
            }));
          } else {
            // 如果没有产品信息，设置为空数组
            processedOrder.products = [];
          }
          
          return processedOrder;
        });
        
        // 记录所有处理后的订单状态，用于调试
        logOrderStatuses();
        
        // 更新分页信息
        if (res.data) {
          if (res.data.current) {
            currentPage.value = res.data.current;
          } else if (res.data.currentPage) {
            currentPage.value = res.data.currentPage;
          } else if (res.data.page) {
            currentPage.value = res.data.page;
          }
        }
        
        // 如果当前页没有数据，但总页数不为0，尝试返回第一页
        if (orderList.value.length === 0 && total.value > 0 && currentPage.value > 1) {
          console.log('当前页无数据，自动返回第一页');
          currentPage.value = 1;
          fetchOrders();
          return;
        }
      } else {
        console.warn('没有找到订单数据或数据为空');
        // 尝试使用模拟数据
        useMockOrders();
        
        // 如果当前页大于1，并且没有获取到数据，尝试返回第一页
        if (currentPage.value > 1) {
          console.log('当前页没有数据，尝试返回第一页');
          currentPage.value = 1;
          fetchOrders();
          return;
        }
      }
    } else {
      console.error(`API返回错误，错误代码: ${res.code}, 错误信息: ${res.message}`);
      ElMessage.error(res.message || '获取订单列表失败');
      // 如果API失败，暂时使用模拟数据以便测试界面
      useMockOrders();
    }
  } catch (error) {
    console.error('获取订单列表出错:', error);
    ElMessage.error('获取订单列表出错: ' + (error.message || '未知错误'));
    // 如果出现异常，暂时使用模拟数据以便测试界面
    useMockOrders();
  } finally {
    loading.value = false;
  }
};

// 格式化订单状态，确保状态文本一致
const formatOrderStatus = (status) => {
  // 记录原始状态值以便调试
  console.log('格式化订单状态，原始值:', status, '类型:', typeof status);
  
  // 处理不同格式的状态值，转换为统一的文本格式
  if (typeof status === 'number') {
    const statusMap = {
      0: '待付款',
      1: '待发货',  // 通常1是待发货
      2: '待收货',  // 通常2是待收货
      3: '已完成',
      4: '已取消'
    };
    return statusMap[status] || '未知状态';
  } else if (typeof status === 'string') {
    // 支持不同的状态表示方式
    const statusMap = {
      'UNPAID': '待付款',
      'PAID': '待发货',
      'SHIPPED': '待收货',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消',
      'REFUNDING': '退款中',
      'REFUNDED': '已退款',
      'PENDING_PAYMENT': '待付款',
      'PENDING_SHIPMENT': '待发货',
      'PENDING_RECEIPT': '待收货',
      'pending_payment': '待付款',
      'pending_shipment': '待发货',
      'shipped': '待收货',
      'paid': '待发货',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    
    // 如果是大写的状态码，尝试映射
    if (statusMap[status]) {
      return statusMap[status];
    }
    
    // 尝试转换为大写后映射
    if (statusMap[status.toUpperCase()]) {
      return statusMap[status.toUpperCase()];
    }
    
    // 如果已经是中文状态，直接返回
    if (['待付款', '待发货', '待收货', '已完成', '已取消', '退款中', '已退款'].includes(status)) {
      return status;
    }
    
    return '未知状态';
  }
  
  return '未知状态';
};

// 使用模拟订单数据
const useMockOrders = () => {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString();
  
  orderList.value = [
    {
      id: 1001,
      orderNo: 'MD20240325001',
      status: '待付款',
      totalAmount: 299.50,
      actualAmount: 299.50,
      createTime: now,
      payTime: null,
      receiverName: '张三',
      receiverPhone: '13800138001',
      receiverAddress: '北京市朝阳区某某街道1号',
      paymentMethod: 'alipay',
      products: [
        {
          goodsId: 101,
          goodsName: '母婴产品A',
          goodsImg: 'https://via.placeholder.com/80',
          price: 199.50,
          quantity: 1
        },
        {
          goodsId: 102,
          goodsName: '母婴产品B',
          goodsImg: 'https://via.placeholder.com/80',
          price: 100.00,
          quantity: 1
        }
      ]
    },
    {
      id: 1002,
      orderNo: 'MD20240324001',
      status: '待发货',
      totalAmount: 199.00,
      actualAmount: 199.00,
      createTime: yesterday,
      payTime: yesterday,
      receiverName: '李四',
      receiverPhone: '13800138002',
      receiverAddress: '上海市浦东新区某某路2号',
      paymentMethod: 'wechat',
      products: [
        {
          goodsId: 103,
          goodsName: '母婴产品C',
          goodsImg: 'https://via.placeholder.com/80',
          price: 199.00,
          quantity: 1
        }
      ]
    },
    {
      id: 1003,
      orderNo: 'MD20240323001',
      status: '待收货',
      totalAmount: 99.00,
      actualAmount: 99.00, 
      createTime: twoDaysAgo,
      payTime: twoDaysAgo,
      shipTime: yesterday,
      trackingNo: 'SF1234567890',
      receiverName: '王五',
      receiverPhone: '13800138003',
      receiverAddress: '广州市天河区某某大道3号',
      paymentMethod: 'alipay',
      products: [
        {
          goodsId: 104,
          goodsName: '母婴产品D',
          goodsImg: 'https://via.placeholder.com/80',
          price: 99.00,
          quantity: 1
        }
      ]
    },
    {
      id: 1004,
      orderNo: 'MD20240322001',
      status: '已完成',
      totalAmount: 359.00,
      actualAmount: 359.00, 
      createTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      payTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      shipTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      confirmTime: yesterday,
      trackingNo: 'YT9876543210',
      receiverName: '赵六',
      receiverPhone: '13800138004',
      receiverAddress: '深圳市南山区某某路4号',
      paymentMethod: 'alipay',
      products: [
        {
          goodsId: 105,
          goodsName: '母婴产品E',
          goodsImg: 'https://via.placeholder.com/80',
          price: 159.00,
          quantity: 1
        },
        {
          goodsId: 106,
          goodsName: '母婴产品F',
          goodsImg: 'https://via.placeholder.com/80',
          price: 200.00,
          quantity: 1
        }
      ]
    }
  ];
  
  total.value = orderList.value.length;
  
  // 更新订单统计
  orderStats.value = {
    total: orderList.value.length,
    pending: orderList.value.filter(o => o.status === '待发货').length,
    shipping: orderList.value.filter(o => o.status === '待收货').length,
    completed: orderList.value.filter(o => o.status === '已完成').length
  };
  
  console.log('使用模拟订单数据:', orderList.value);
  
  ElMessage({
    type: 'info',
    message: '无法获取实际订单，显示测试数据',
    duration: 3000
  });
};

// 获取订单统计数据
const fetchOrderStats = async () => {
  try {
    console.log('获取订单统计数据...');
    const res = await getOrderStats();
    console.log('订单统计响应:', res);
    
    if (res && res.code === 200 && res.data) {
      // 处理可能的不同数据结构
      if (typeof res.data === 'object') {
        // 标准结构
        orderStats.value = {
          total: res.data.total || res.data.totalCount || 0,
          pending: res.data.pending || res.data.waitShip || res.data.pendingShipment || 0,
          shipping: res.data.shipping || res.data.shipped || res.data.waitReceive || 0,
          completed: res.data.completed || res.data.done || res.data.finished || 0
        };
      } else if (typeof res.data === 'string') {
        // 尝试解析JSON字符串
        try {
          const parsedData = JSON.parse(res.data);
          orderStats.value = {
            total: parsedData.total || parsedData.totalCount || 0,
            pending: parsedData.pending || parsedData.waitShip || parsedData.pendingShipment || 0,
            shipping: parsedData.shipping || parsedData.shipped || parsedData.waitReceive || 0,
            completed: parsedData.completed || parsedData.done || parsedData.finished || 0
          };
        } catch (parseError) {
          console.error('解析订单统计数据失败:', parseError);
          // 使用当前订单列表计算统计数据
          syncOrderStatsFromList();
        }
      }
      console.log('处理后的订单统计:', orderStats.value);
    } else {
      console.warn('获取订单统计失败或返回数据格式不正确:', res);
      // 使用当前订单列表计算统计数据
      syncOrderStatsFromList();
    }
  } catch (error) {
    console.error('获取订单统计出错:', error);
    // 不显示错误消息，而是静默降级
    // ElMessage.error('获取订单统计出错: ' + (error.message || '未知错误'));
    
    // 使用当前订单列表计算统计数据
    syncOrderStatsFromList();
  }
};

// 从当前订单列表同步统计数据
const syncOrderStatsFromList = () => {
  if (orderList.value && orderList.value.length > 0) {
    console.log('从订单列表同步统计数据');
    orderStats.value = {
      total: orderList.value.length,
      pending: orderList.value.filter(o => o.status === '待发货').length,
      shipping: orderList.value.filter(o => o.status === '待收货').length,
      completed: orderList.value.filter(o => o.status === '已完成').length
    };
  } else {
    console.log('订单列表为空，使用模拟统计数据');
    // 使用默认值
    orderStats.value = {
      total: 0,
      pending: 0,
      shipping: 0,
      completed: 0
    };
    
    // 如果界面上显示无数据但统计显示有数据，可以尝试调用一次useMockOrders
    if (total.value === 0 && orderList.value.length === 0) {
      useMockOrders();
    }
  }
  console.log('同步后的订单统计:', orderStats.value);
};

// 使用模拟的订单统计数据
const useMockOrderStats = () => {
  orderStats.value = {
    total: 4,
    pending: 1,
    shipping: 1,
    completed: 1,
    totalCount: 4,
    pendingPayment: 1,
    pendingShipment: 1,
    shipped: 1,
    completed: 1,
    cancelled: 0
  };
  
  console.log('使用模拟订单统计数据:', orderStats.value);
  
  ElMessage({
    type: 'info',
    message: '订单统计数据已加载',
    duration: 3000
  });
};

// 搜索订单
const searchOrders = () => {
  currentPage.value = 1;
  fetchOrders();
  // 同时更新订单统计数据
  fetchOrderStats();
};

// 重置搜索
const resetSearch = () => {
  searchForm.orderNo = '';
  searchForm.status = '';
  searchForm.dateRange = [];
  currentPage.value = 1;
  fetchOrders();
};

// 处理发货
const handleShipOrder = (order) => {
  // 重置发货表单
  shipForm.orderNo = order.orderNo;
  shipForm.courierName = '';
  shipForm.trackingNo = '';  // 确保清空之前的物流单号
  
  // 显示发货对话框
  shipDialogVisible.value = true;
};

// 确认发货
const confirmShip = async () => {
  if (!shipForm.courierName) {
    ElMessage.warning('请选择快递公司');
    return;
  }
  
  if (!shipForm.trackingNo) {
    // 生成物流单号：时间戳+随机数
    const timestamp = new Date().getTime().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    shipForm.trackingNo = timestamp + randomNum;
  }
  
  // 确保订单号正确
  if (!shipForm.orderNo) {
    ElMessage.error('订单号为空，无法执行发货操作');
    return;
  }
  
  // 记录关键参数
  console.log('订单发货参数:', JSON.stringify({
    orderNo: shipForm.orderNo,
    trackingNo: shipForm.trackingNo,
    courierName: shipForm.courierName
  }));
  
  shipLoading.value = true;
  let retryCount = 0;
  const maxRetries = 2;
  
  const attemptShip = async () => {
    try {
      console.log('开始执行发货操作:', {
        orderNo: shipForm.orderNo,
        trackingNo: shipForm.trackingNo,
        courierName: shipForm.courierName
      });
      
      // 处理订单号格式，移除可能的ORDER前缀
      let processedOrderNo = shipForm.orderNo;
      if (processedOrderNo && processedOrderNo.toUpperCase().startsWith('ORDER')) {
        processedOrderNo = processedOrderNo.substring(5);
        console.log('处理后的订单号:', processedOrderNo);
      }
      
      // 先确保订单状态为待发货
      try {
        const orderDetail = await getOrderDetail(processedOrderNo);
        console.log('获取订单详情响应:', orderDetail);
        
        if (orderDetail.code === 200 && orderDetail.data) {
          console.log('检查发货前订单状态:', orderDetail.data.status);
          const statusValue = orderDetail.data.status;
          const statusText = formatOrderStatus(statusValue);
          
          // 明确检查订单状态，确保只有待发货状态才能操作
          // 通过状态值和文本双重检查
          const isReadyToShip = 
            (statusValue === 1 || statusValue === '1' || statusValue === 'PAID' || statusValue === 'paid') || 
            statusText === '待发货' || 
            statusText.includes('待发货');
            
          if (!isReadyToShip) {
            ElMessage.error(`当前订单状态(${statusText})不允许发货，只有待发货状态才能操作`);
            shipLoading.value = false;
            return false;
          } else {
            console.log('订单状态检查通过，可以发货');
          }
        } else {
          console.warn('获取订单详情返回异常，但将继续尝试发货:', orderDetail);
          ElMessage.warning('订单详情获取异常，但将继续尝试发货');
        }
      } catch (detailError) {
        console.error('获取订单详情出错:', detailError);
        // 如果是401错误（未授权），不继续尝试发货
        if (detailError.message && detailError.message.includes('登录')) {
          ElMessage.error('管理员登录已过期，请重新登录后再试');
          shipLoading.value = false;
          return false;
        }
        
        ElMessage.warning('无法获取订单详情，但将继续尝试发货');
        // 继续执行发货流程，不中断
      }
      
      // 执行发货操作前再次检查参数
      if (!processedOrderNo || !shipForm.trackingNo || !shipForm.courierName) {
        throw new Error('发货参数不完整');
      }
      
      // 执行发货操作
      const res = await shipOrder(
        processedOrderNo,
        shipForm.trackingNo,
        shipForm.courierName
      );
      
      if (res.code === 200) {
        ElMessage.success('发货成功');
        shipDialogVisible.value = false;
        fetchOrders();
        fetchOrderStats();
        return true;
      } else {
        throw new Error(res.message || '发货失败，请重试');
      }
    } catch (error) {
      console.error('发货操作出错:', error);
      
      // 如果是授权问题，不重试
      if (error.message && error.message.includes('登录')) {
        ElMessage.error('管理员登录已过期，请重新登录后再试');
        return false;
      }
      
      // 如果是网络问题且未达到最大重试次数，则重试
      if (retryCount < maxRetries && 
          (error.message.includes('timeout') || 
           error.message.includes('Network Error') ||
           error.message.includes('连接失败'))) {
        retryCount++;
        ElMessage.warning(`发货请求失败，正在进行第${retryCount}次重试...`);
        return await attemptShip();
      }
      
      ElMessage.error('发货操作出错: ' + (error.message || '未知错误'));
      return false;
    }
  };
  
  try {
    await attemptShip();
  } finally {
    shipLoading.value = false;
  }
};

// 查看订单详情
const viewOrderDetail = async (order) => {
  // 使用processOrderData处理订单数据
  const processedOrder = processOrderData(order);
  
  // 设置当前选中的订单
  currentOrder.value = processedOrder;
  
  // 显示订单详情对话框
  detailDialogVisible.value = true;

  // 获取订单支付详情
  try {
    console.log('获取订单支付详情，订单号:', processedOrder.orderNo);
    const res = await getOrderPaymentDetail(processedOrder.orderNo);
    console.log('支付详情响应:', res);
    
    if (res.code === 200 && res.data) {
      // 处理支付信息，确保数据格式统一
      currentOrder.value.payment = formatPaymentData(res.data);
      console.log('获取到支付详情:', currentOrder.value.payment);
      
      // 关联支付信息和订单信息
      if (currentOrder.value.payment) {
        // 如果订单状态和支付状态不一致，尝试协调
        const paymentStatus = getPaymentStatusText(currentOrder.value.payment.status);
        
        // 如果支付成功但订单状态是待付款，更新订单状态
        if (paymentStatus === '支付成功' && currentOrder.value.status === '待付款') {
          console.log('检测到支付状态与订单状态不一致，更新订单状态');
          currentOrder.value.status = '待发货';
        }
        
        // 确保支付时间和订单支付时间一致
        if (currentOrder.value.payment.payTime && !currentOrder.value.payTime) {
          currentOrder.value.payTime = currentOrder.value.payment.payTime;
        }
      }
    } else {
      console.warn('获取支付详情失败或为空:', res.message);
      ElMessage.warning('获取支付详情失败: ' + (res.message || '未知错误'));
      
      // 创建一个空的支付记录，避免界面报错
      currentOrder.value.payment = {
        id: '',
        paymentNo: '',
        orderNo: processedOrder.orderNo,
        amount: processedOrder.totalAmount || 0,
        paymentMethod: processedOrder.paymentMethod || '',
        status: 0,
        createTime: processedOrder.createTime || new Date().toISOString(),
        payTime: null,
        transactionId: ''
      };
    }
  } catch (error) {
    console.error('获取订单支付详情失败:', error);
    ElMessage.error('获取订单支付详情失败: ' + (error.message || '未知错误'));
    
    // 创建一个空的支付记录，避免界面报错
    currentOrder.value.payment = {
      id: '',
      paymentNo: '',
      orderNo: processedOrder.orderNo,
      amount: processedOrder.totalAmount || 0,
      paymentMethod: processedOrder.paymentMethod || '',
      status: 0,
      createTime: processedOrder.createTime || new Date().toISOString(),
      payTime: null,
      transactionId: ''
    };
  }

  // 获取物流信息
  if (['待收货', '已完成'].includes(processedOrder.status)) {
    await fetchLogisticsInfo(processedOrder.orderNo);
  }
};

// 格式化支付数据
const formatPaymentData = (paymentData) => {
  if (!paymentData) return null;
  
  return {
    ...paymentData,
    // 确保金额格式正确
    amount: parseFloat(paymentData.amount || 0),
    // 确保支付方式正确
    paymentMethod: paymentData.paymentMethod || paymentData.payType || 'unknown',
    // 处理支付状态
    status: typeof paymentData.status === 'number' ? paymentData.status : 
           formatPaymentStatus(paymentData.status),
    // 确保时间格式统一
    createTime: paymentData.createTime || paymentData.gmtCreate || new Date().toISOString(),
    payTime: paymentData.payTime || paymentData.gmtPayment || null,
    expireTime: paymentData.expireTime || null,
    // 处理交易号字段，兼容不同命名格式
    transactionId: paymentData.transactionId || paymentData.transaction_id || paymentData.tradeNo || paymentData.trade_no || paymentData.outTradeNo || paymentData.out_trade_no || null,
  };
};

// 格式化支付状态
const formatPaymentStatus = (status) => {
  if (typeof status === 'number') {
    return status;
  }
  
  const statusMap = {
    'UNPAID': 0,
    'PROCESSING': 1,
    'SUCCESS': 2,
    'FAILED': 3,
    'CLOSED': 4,
    '待支付': 0,
    '支付中': 1,
    '支付成功': 2,
    '支付失败': 3,
    '已关闭': 4
  };
  
  return statusMap[status] !== undefined ? statusMap[status] : 0;
};

// 使用模拟支付数据
const useMockPaymentDetail = (orderNo) => {
  const orderMap = {
    'MD20240325001': {
      id: 'PAY1001',
      paymentNo: 'PAY' + Date.now(),
      orderNo: 'MD20240325001',
      amount: 299.50,
      paymentMethod: 'alipay',
      status: 0, // 待支付
      createTime: new Date().toISOString(),
      expireTime: new Date(Date.now() + 3600000).toISOString(),
      payTime: null,
      transactionId: null
    },
    'MD20240324001': {
      id: 'PAY1002',
      paymentNo: 'PAY' + (Date.now() - 1000),
      orderNo: 'MD20240324001',
      amount: 199.00,
      paymentMethod: 'wechat',
      status: 2, // 支付成功
      createTime: new Date(Date.now() - 86400000).toISOString(),
      expireTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      payTime: new Date(Date.now() - 86400000 + 600000).toISOString(),
      transactionId: 'TXN' + (Date.now() - 1000)
    },
    'MD20240323001': {
      id: 'PAY1003',
      paymentNo: 'PAY' + (Date.now() - 2000),
      orderNo: 'MD20240323001',
      amount: 99.00,
      paymentMethod: 'alipay',
      status: 2, // 支付成功
      createTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      expireTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
      payTime: new Date(Date.now() - 86400000 * 2 + 600000).toISOString(),
      transactionId: 'TXN' + (Date.now() - 2000)
    },
    'MD20240322001': {
      id: 'PAY1004',
      paymentNo: 'PAY' + (Date.now() - 3000),
      orderNo: 'MD20240322001',
      amount: 359.00,
      paymentMethod: 'alipay',
      status: 2, // 支付成功
      createTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      expireTime: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(),
      payTime: new Date(Date.now() - 86400000 * 3 + 600000).toISOString(),
      transactionId: 'TXN' + (Date.now() - 3000)
    }
  };
  
  if (orderMap[orderNo]) {
    currentOrder.value.payment = orderMap[orderNo];
    console.log('使用模拟支付数据:', orderMap[orderNo]);
  } else {
    // 如果找不到匹配的订单编号，创建一个通用的模拟数据
    const mockPayment = {
      id: 'PAY' + Date.now(),
      paymentNo: 'PAY' + Date.now(),
      orderNo: orderNo,
      amount: currentOrder.value.totalAmount || 0,
      paymentMethod: currentOrder.value.paymentMethod || 'alipay',
      status: currentOrder.value.payTime ? 2 : 0, // 如果有支付时间则支付成功，否则待支付
      createTime: currentOrder.value.createTime || new Date().toISOString(),
      expireTime: new Date(Date.now() + 3600000).toISOString(),
      payTime: currentOrder.value.payTime || null,
      transactionId: currentOrder.value.payTime ? 'TXN' + Date.now() : null
    };
    currentOrder.value.payment = mockPayment;
    console.log('使用通用模拟支付数据:', mockPayment);
  }
};

// 导出订单
const exportOrdersData = async () => {
  try {
    const params = {
      orderNo: searchForm.orderNo || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined
    };
    
    const res = await exportOrders(params);
    
    // 创建Blob对象并下载
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `订单数据_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    ElMessage.success('订单数据导出成功');
  } catch (error) {
    console.error('导出订单数据出错:', error);
    ElMessage.error('导出订单数据出错');
  }
};

// 打印订单
const printOrder = (order) => {
  // 实现打印功能
  ElMessage.info('打印功能开发中...');
};

// 取消订单
const cancelOrder = (order) => {
  ElMessageBox.prompt('请输入取消原因', '取消订单', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPlaceholder: '请输入取消原因'
  }).then(({ value }) => {
    if (!value) {
      ElMessage.warning('请输入取消原因');
      return;
    }
    
    cancelOrderAdmin(order.orderNo, value).then(res => {
      if (res.code === 200) {
        ElMessage.success('订单已取消');
        fetchOrders();
        fetchOrderStats();
      } else {
        ElMessage.error(res.message || '取消订单失败');
      }
    }).catch(error => {
      console.error('取消订单出错:', error);
      ElMessage.error('取消订单出错');
    });
  }).catch(() => {});
};

// 查看物流信息
const viewShippingInfo = (order) => {
  router.push({
    path: `/admin/logistics/${order.orderNo}`,
    query: { orderNo: order.orderNo }
  });
};

// 批量发货
const batchShip = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请选择要发货的订单');
    return;
  }
  
  // 过滤只保留待发货的订单
  const pendingOrders = selectedOrders.value.filter(order => order.status === '待发货');
  
  if (pendingOrders.length === 0) {
    ElMessage.warning('所选订单中没有待发货的订单');
    return;
  }
  
  // 准备批量发货数据
  selectedOrders.value = pendingOrders.map(order => ({
    ...order,
    courierName: ''
  }));
  
  batchShipDialogVisible.value = true;
};

// 确认批量发货
const confirmBatchShip = async () => {
  // 验证发货信息完整性
  const invalidOrders = selectedOrders.value.filter(order => !order.courierName);
  
  if (invalidOrders.length > 0) {
    ElMessage.warning('请为所有订单选择快递公司');
    return;
  }
  
  batchShipLoading.value = true;
  try {
    // 逐个处理发货
    const promises = selectedOrders.value.map(order => {
      // 为每个订单生成唯一的物流单号
      const timestamp = new Date().getTime().toString();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const trackingNo = timestamp + randomNum;
      
      return shipOrder(order.orderNo, trackingNo, order.courierName);
    });
    
    const results = await Promise.allSettled(promises);
    
    // 统计成功和失败数量
    const successCount = results.filter(result => result.status === 'fulfilled' && result.value.code === 200).length;
    const failCount = results.length - successCount;
    
    if (successCount > 0) {
      ElMessage.success(`成功发货 ${successCount} 个订单${failCount > 0 ? `，失败 ${failCount} 个订单` : ''}`);
      batchShipDialogVisible.value = false;
      fetchOrders();
      fetchOrderStats();
    } else {
      ElMessage.error('所有订单发货失败');
    }
  } catch (error) {
    console.error('批量发货操作出错:', error);
    ElMessage.error('批量发货操作出错');
  } finally {
    batchShipLoading.value = false;
  }
};

// 获取状态标签类型
const getOrderStatusType = (status) => {
  return getStatusType(status);
};

// 获取支付方式显示文本
const getPaymentMethod = (method) => {
  const methodMap = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'unionpay': '银联支付',
    'cod': '货到付款',
    'online': '在线支付'
  };
  return methodMap[method] || method;
};

// 获取支付状态类型
const getPaymentStatusType = (status) => {
  const statusMap = {
    0: 'warning',  // 待支付
    1: 'primary',  // 支付中
    2: 'success',  // 支付成功
    3: 'danger',   // 支付失败
    4: 'info',     // 已关闭
    '待支付': 'warning',
    '支付中': 'primary',
    '支付成功': 'success',
    '支付失败': 'danger',
    '已关闭': 'info'
  };
  return statusMap[status] || 'info';
};

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '支付中',
    2: '支付成功',
    3: '支付失败',
    4: '已关闭',
    '待支付': '待支付',
    '支付中': '支付中',
    '支付成功': '支付成功',
    '支付失败': '支付失败',
    '已关闭': '已关闭'
  };
  return statusMap[status] || `未知状态(${status})`;
};

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  console.log('选择的订单:', selection);
  selectedOrders.value = selection.filter(order => order.status === '待发货');
  
  // 如果选择了非待发货的订单，提示用户
  if (selection.length > selectedOrders.value.length) {
    ElMessage.warning('只有状态为"待发货"的订单才能进行发货操作');
  }
  
  // 为选中的订单添加发货所需的字段
  selectedOrders.value = selectedOrders.value.map(order => ({
    ...order,
    courierName: '',
    trackingNo: ''
  }));
};

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  console.log('每页显示数量变化:', val);
  pageSize.value = val;
  fetchOrders();
};

// 处理当前页变化
const handleCurrentChange = (val) => {
  console.log('当前页变化:', val);
  currentPage.value = val;
  fetchOrders();
};

// 获取物流信息
const fetchLogisticsInfo = async (orderNo) => {
  try {
    const res = await getLogistics(orderNo);
    if (res.code === 200 && res.data) {
      logistics.value = res.data.logistics;
      logisticsTraces.value = res.data.traces;
    } else {
      logistics.value = null;
      logisticsTraces.value = [];
      
      // 如果有订单且待发货，初始化物流表单
      if (currentOrder.value && isOrderPaid(currentOrder.value.status)) {
        logisticsForm.receiver = currentOrder.value.receiverName;
        logisticsForm.receiverPhone = currentOrder.value.receiverPhone;
        logisticsForm.receiverAddress = `${currentOrder.value.receiverProvince || ''} ${currentOrder.value.receiverCity || ''} ${currentOrder.value.receiverDistrict || ''} ${currentOrder.value.receiverAddress || ''}`;
      }
    }
  } catch (error) {
    console.error('获取物流信息失败:', error);
    ElMessage.error('获取物流信息失败');
  }
};

// 创建物流信息
const submitLogistics = async () => {
  if (!logisticsForm.company || !logisticsForm.trackingNo) {
    ElMessage.warning('请填写完整的物流信息');
    return;
  }
  
  logisticsSubmitting.value = true;
  try {
    const res = await createLogistics({
      orderId: currentOrder.value.orderId,
      orderNo: currentOrder.value.orderNo,
      company: logisticsForm.company,
      trackingNo: logisticsForm.trackingNo,
      receiver: logisticsForm.receiver,
      receiverPhone: logisticsForm.receiverPhone,
      receiverAddress: logisticsForm.receiverAddress
    });
    
    if (res.code === 200) {
      ElMessage.success('物流信息创建成功');
      createLogisticsDialogVisible.value = false;
      
      // 更新订单状态为待收货
      await shipOrder(currentOrder.value.orderId);
      
      // 刷新物流信息
      await fetchLogisticsInfo(currentOrder.value.orderNo);
    } else {
      ElMessage.error(res.message || '物流信息创建失败');
    }
  } catch (error) {
    console.error('创建物流信息失败:', error);
    ElMessage.error('创建物流信息失败');
  } finally {
    logisticsSubmitting.value = false;
  }
};

// 添加物流轨迹
const submitTrace = async () => {
  if (!traceForm.traceContent) {
    ElMessage.warning('请填写轨迹内容');
    return;
  }
  
  traceSubmitting.value = true;
  try {
    const res = await addLogisticsTrace({
      logisticsId: logistics.value.logisticsId,
      trackingNo: logistics.value.trackingNo,
      traceContent: traceForm.traceContent,
      traceLocation: traceForm.traceLocation
    });
    
    if (res.code === 200) {
      ElMessage.success('物流轨迹添加成功');
      addTraceDialogVisible.value = false;
      traceForm.traceContent = '';
      traceForm.traceLocation = '';
      
      // 刷新物流轨迹
      await fetchLogisticsInfo(currentOrder.value.orderNo);
    } else {
      ElMessage.error(res.message || '物流轨迹添加失败');
    }
  } catch (error) {
    console.error('添加物流轨迹失败:', error);
    ElMessage.error('添加物流轨迹失败');
  } finally {
    traceSubmitting.value = false;
  }
};

// 同步物流信息
const syncLogisticsHandler = async () => {
  try {
    const res = await syncLogistics(
      logistics.value.trackingNo,
      logistics.value.company
    );
    
    if (res.code === 200) {
      ElMessage.success('物流信息同步成功');
      
      // 刷新物流信息
      await fetchLogisticsInfo(currentOrder.value.orderNo);
    } else {
      ElMessage.error(res.message || '物流信息同步失败');
    }
  } catch (error) {
    console.error('同步物流信息失败:', error);
    ElMessage.error('同步物流信息失败');
  }
};

// 查看物流跟踪页面
const viewLogisticsTracking = (orderNo) => {
  // 使用 router 导航而非 window.open
  router.push({
    path: '/logistics/tracking',
    query: { 
      orderNo: orderNo || currentOrder.value.orderNo,
      trackingNo: logistics.value?.trackingNo,
      company: logistics.value?.company
    }
  });
};

// 判断订单是否已支付
const isOrderPaid = (status) => {
  return status === '待发货' || status === '待收货' || status === '已完成';
};

// 获取物流状态显示文本
const getLogisticsStatusText = (status) => {
  const statusMap = {
    0: '未发货',
    1: '已发货',
    2: '运输中',
    3: '已送达',
    4: '已签收',
    5: '异常'
  };
  return statusMap[status] || '未知状态';
};

// 获取物流状态显示类型
const getLogisticsStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'warning',
    3: 'success',
    4: 'success',
    5: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  return getStatusText(status);
};

// 用于调试的函数 - 记录所有订单状态
const logOrderStatuses = () => {
  if (orderList.value && orderList.value.length > 0) {
    console.log('当前所有订单状态:');
    orderList.value.forEach((order, index) => {
      console.log(`订单[${index}] ${order.orderNo} - 原始状态: ${order.rawStatus || '未记录'}, 显示状态: ${order.status}`);
    });
  } else {
    console.log('订单列表为空，无法记录状态');
  }
};

// 获取调整后的支付状态
const getAdjustedPaymentStatus = () => {
  if (currentOrder.value.status === '待发货') {
    return 2; // 已支付
  } else if (currentOrder.value.status === '待付款') {
    return 0; // 待支付
  } else if (currentOrder.value.status === '待收货') {
    return 2; // 已支付（不是待支付）
  } else if (currentOrder.value.status === '已完成') {
    return 2; // 已支付
  } else if (currentOrder.value.status === '已取消') {
    return 4; // 已关闭
  } else if (currentOrder.value.status === '退款中') {
    return 3; // 支付失败
  } else if (currentOrder.value.status === '已退款') {
    return 4; // 已关闭
  } else {
    // 如果无法从订单状态判断，尝试使用支付记录中的状态
    return currentOrder.value.payment?.status || 0;
  }
};

// 判断是否应该显示支付过期时间
const shouldShowPaymentExpireTime = () => {
  // 只有已取消的订单才显示支付过期时间
  return currentOrder.value.status === '已取消';
};

// 获取支付时间显示
const getPaymentDisplayTime = () => {
  // 判断订单是否已支付
  const isPaid = 
    currentOrder.value.payStatus === 'PAID' || 
    currentOrder.value.status === 'PAID' || 
    currentOrder.value.status === '待发货' || 
    currentOrder.value.status === '待收货' || 
    currentOrder.value.status === '已完成';

  // 如果支付状态为已支付但没有支付时间，显示订单创建时间
  if (isPaid && !currentOrder.value.payment?.payTime && !currentOrder.value.payTime) {
    return new Date(currentOrder.value.createTime).toLocaleString() + ' (订单创建时间)';
  }
  
  if (currentOrder.value.payment?.payTime) {
    return new Date(currentOrder.value.payment.payTime).toLocaleString();
  } else if (currentOrder.value.payTime) {
    return new Date(currentOrder.value.payTime).toLocaleString();
  } else {
    // 根据支付状态显示信息
    return isPaid ? '已支付(无具体时间)' : '未支付';
  }
};

// 从本地存储获取订单的商品信息
const getOrderProductsFromLocal = (orderNo) => {
  try {
    const orderProductsMap = JSON.parse(localStorage.getItem('orderProductsMap') || '{}');
    if (orderProductsMap[orderNo]) {
      console.log(`管理界面：从本地存储获取到订单${orderNo}的商品信息:`, orderProductsMap[orderNo]);
      return orderProductsMap[orderNo];
    }
  } catch (e) {
    console.error('管理界面：从本地存储获取订单商品信息失败:', e);
  }
  return null;
};

// 处理订单数据，确保显示正确的商品信息
const processOrderData = (order) => {
  if (!order) return order;
  
  // 深度克隆避免修改原始数据
  const processedOrder = JSON.parse(JSON.stringify(order));
  
  // 尝试从本地存储获取商品信息
  const localProducts = getOrderProductsFromLocal(order.orderNo);
  if (localProducts && localProducts.length > 0) {
    processedOrder.products = localProducts;
  }
  
  // 确保订单包含products数组
  if (!processedOrder.products || !Array.isArray(processedOrder.products)) {
    processedOrder.products = processedOrder.orderItems || [];
  }
  
  // 确保每个商品都有必要的信息
  if (processedOrder.products && processedOrder.products.length > 0) {
    processedOrder.products = processedOrder.products.map(product => ({
      ...product,
      goodsId: product.goodsId || product.id || '',
      goodsName: product.goodsName || product.name || '商品信息',
      goodsImg: product.goodsImg || product.image || '/img/default-product.png',
      price: parseFloat(product.price || 0),
      quantity: parseInt(product.quantity || 1)
    }));
  }
  
  return processedOrder;
};
</script>

<style scoped>
.admin-order-management {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #303133;
}

.order-stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-card.pending .stat-value {
  color: #E6A23C;
}

.stat-card.shipping .stat-value {
  color: #409EFF;
}

.stat-card.completed .stat-value {
  color: #67C23A;
}

.order-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-filters {
  flex: 1;
  min-width: 300px;
}

.batch-operations {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-left: 10px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.product-item {
  display: flex;
  margin-bottom: 10px;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #EBEEF5;
  margin-right: 10px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 12px;
  color: #909399;
}

.order-customer {
  margin-top: 10px;
  font-size: 13px;
}

.customer-info {
  margin-right: 15px;
}

.order-products-detail,
.payment-detail,
.order-customer-detail,
.order-timeline {
  margin-top: 20px;
}

.order-products-detail h3,
.payment-detail h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.product-item-detail {
  display: flex;
  align-items: center;
}

.product-image-detail {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 10px;
}

.no-products-info {
  text-align: center;
  padding: 20px;
}

.product-info-detail {
  flex: 1;
}

.product-name-detail {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-specs {
  font-size: 12px;
  color: #909399;
}

@media (max-width: 768px) {
  .order-controls {
    flex-direction: column;
  }
  
  .batch-operations {
    margin-top: 10px;
    margin-left: 0;
  }
}
</style>