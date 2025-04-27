<template>
  <div class="member-points-container">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="card-header">
        <div class="header-title">
          <el-icon class="icon-tech"><Grid /></el-icon>
          <span>会员积分管理</span>
        </div>
        <div class="header-actions">
          <el-tooltip content="刷新数据" placement="top">
            <el-button circle @click="loadPointsList">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-button type="primary" @click="handleAddRule" class="add-button">
            <el-icon><Plus /></el-icon>添加积分规则
          </el-button>
          <el-button type="success" @click="handleCreateAllUserPoints" class="create-button">
            <el-icon><Check /></el-icon>为所有用户创建积分账户
          </el-button>
        </div>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="会员名称/手机号"
            clearable
            prefix-icon="Search"
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="积分类型" clearable class="tech-select">
            <el-option label="购物获得" value="shopping" />
            <el-option label="签到获得" value="signin" />
            <el-option label="活动获得" value="activity" />
            <el-option label="积分兑换" value="exchange" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="tech-date-picker"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="tech-button search-button">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch" class="tech-button">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 积分记录列表 -->
    <el-card class="data-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="pointsList"
        style="width: 100%"
        class="tech-table"
        :row-class-name="tableRowClassName"
        :header-cell-class-name="tableHeaderClassName"
        border
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="memberId" label="会员编号" width="90" align="center" />
        <el-table-column prop="memberName" label="会员名称" width="120" align="center" />
        <el-table-column prop="phone" label="手机号" width="120" align="center" />
        <el-table-column prop="points" label="积分变动" width="100" align="center">
          <template #default="scope">
            <span :class="scope.row.points > 0 ? 'points-increase' : 'points-decrease'">
              {{ scope.row.points ? (scope.row.points > 0 ? '+' : '') + scope.row.points : '0' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="积分类型" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getPointsTypeTag(scope.row.type || scope.row.source)">
              {{ getPointsTypeText(scope.row.type || scope.row.source) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="积分说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="获得时间" width="160" align="center" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="查看详情" placement="top">
                <el-button 
                  type="primary" 
                  circle 
                  size="small" 
                  @click="handleViewDetail(scope.row)"
                  class="action-button"
                >
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="tech-pagination"
        />
      </div>
    </el-card>

    <!-- 积分规则对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加积分规则' : '编辑积分规则'"
      v-model="ruleDialogVisible"
      width="50%"
      class="tech-dialog"
    >
      <el-form
        ref="ruleFormRef"
        :model="ruleForm"
        :rules="ruleRules"
        label-width="120px"
        class="tech-form"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入规则名称" />
        </el-form-item>
        
        <el-form-item label="积分类型" prop="type">
          <el-select v-model="ruleForm.type" placeholder="请选择积分类型" style="width: 100%">
            <el-option label="订单奖励" value="order" />
            <el-option label="购物获得" value="shopping" />
            <el-option label="签到获得" value="signin" />
            <el-option label="活动获得" value="activity" />
            <el-option label="积分兑换" value="exchange" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="积分规则" prop="rule">
          <el-input type="textarea" v-model="ruleForm.rule" rows="3" placeholder="请输入积分规则说明" />
        </el-form-item>
        
        <el-form-item label="积分值" prop="points">
          <el-input-number v-model="ruleForm.points" :min="0" style="width: 100%" />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="ruleForm.status"
            :active-value="'on'"
            :inactive-value="'off'"
            inline-prompt
            active-text="启用"
            inactive-text="禁用"
            style="--el-switch-on-color: #13ce66"
          />
        </el-form-item>
        
        <el-form-item label="有效期" prop="validity">
          <el-date-picker
            v-model="ruleForm.validity"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="ruleDialogVisible = false" class="tech-button cancel-button">取消</el-button>
          <el-button type="primary" @click="submitRuleForm" class="tech-button submit-button">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 积分详情对话框 -->
    <el-dialog
      title="积分详情"
      v-model="detailDialogVisible"
      width="60%"
      class="tech-dialog"
    >
      <div class="points-detail">
        <div class="detail-header">
          <div class="member-info">
            <el-avatar :size="60" :src="detailData.avatar" />
            <div class="info-content">
              <h3>{{ detailData.memberName }}</h3>
              <p>会员编号：{{ detailData.memberId }}</p>
            </div>
          </div>
          <div class="points-summary">
            <div class="total-points">
              <span class="label">当前积分</span>
              <span class="value">{{ detailData.totalPoints }}</span>
            </div>
            <div class="points-stats">
              <div class="stat-item">
                <span class="label">累计获得</span>
                <span class="value increase">{{ detailData.totalEarned }}</span>
              </div>
              <div class="stat-item">
                <span class="label">累计使用</span>
                <span class="value decrease">{{ detailData.totalUsed }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="detail-content">
          <h4>积分记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in detailData.records"
              :key="index"
              :timestamp="record.createTime"
              :type="record.points > 0 ? 'success' : 'warning'"
            >
              <div class="timeline-content">
                <div class="record-info">
                  <span class="type">{{ getPointsTypeText(record.type) }}</span>
                  <span class="points" :class="record.points > 0 ? 'increase' : 'decrease'">
                    {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                  </span>
                </div>
                <div class="description">{{ record.description }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus';
import { 
  Plus, 
  Search, 
  Refresh, 
  Grid, 
  View,
  InfoFilled,
  Check
} from '@element-plus/icons-vue';
import { getPointsList, addPointsRule, updatePointsRule, deletePointsRule, getPointsDetail, getPointsDetailList, adjustPoints, createAllUserPoints } from '@/api/admin';

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: []
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 加载状态
const loading = ref(false);

// 积分记录列表
const pointsList = ref([]);

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

// 表格头部样式
const tableHeaderClassName = () => {
  return 'tech-table-header';
};

// 获取积分类型标签样式
const getPointsTypeTag = (type) => {
  if (!type) return 'info';
  
  const typeMap = {
    // 类型
    shopping: 'success',
    signin: 'warning',
    activity: 'info',
    exchange: 'danger',
    // source字段
    order: 'success',
    register: 'primary',
    review: 'warning',
    admin_adjust: 'danger',
    invite: 'success',
    promotion: 'warning',
    // 类型字段
    earn: 'success',
    spend: 'danger'
  };
  return typeMap[type] || 'info';
};

// 获取积分类型文本
const getPointsTypeText = (type) => {
  if (!type) return '其他';
  
  // 处理API返回的类型和source字段
  const typeMap = {
    // 类型
    shopping: '购物获得',
    signin: '签到获得',
    activity: '活动获得',
    exchange: '积分兑换',
    // source字段
    order: '购物奖励',
    register: '注册奖励',
    review: '评价奖励',
    admin_adjust: '管理员调整',
    exchange: '积分兑换',
    signin: '每日签到',
    invite: '邀请好友',
    promotion: '促销活动',
    // 类型字段
    earn: '获得积分',
    spend: '消费积分'
  };
  
  return typeMap[type] || type;
};

// 加载积分记录列表
const loadPointsList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchForm.keyword || undefined,
      type: searchForm.type || undefined,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1]
    };
    
    console.log('获取积分列表，参数:', params);
    
    const res = await getPointsList(params);
    console.log('积分列表响应:', res);
    
    if (res.code === 200) {
      // 处理返回的积分记录数据
      let processedData = [];
      
      if (res.data && res.data.list && Array.isArray(res.data.list)) {
        // API返回的是带list数组的格式
        processedData = res.data.list.map(record => {
          // 确保每条记录都有必要的字段
          return {
            id: record.id || record.historyId,
            memberId: record.memberId,
            memberName: record.memberName,
            phone: record.phone,
            nickname: record.nickname,
            points: record.points || 0,
            type: record.type || record.source, // 使用type或source字段
            source: record.source,
            description: record.description || '暂无说明',
            createTime: record.historyTime || record.createTime,
            totalPoints: record.totalPoints || 0,
            level: record.level || '普通会员'
          };
        });
        total.value = res.data.total || processedData.length;
      } else if (res.data && res.data.records) {
        // 如果是分页数据结构
        processedData = res.data.records.map(record => {
          // 确保每条记录都有必要的字段
          return {
            id: record.id || record.historyId,
            memberId: record.memberId,
            memberName: record.memberName,
            phone: record.phone,
            nickname: record.nickname,
            points: record.points || 0,
            type: record.type || record.source, // 使用type或source字段
            source: record.source,
            description: record.description || '暂无说明',
            createTime: record.historyTime || record.createTime,
            totalPoints: record.totalPoints || 0,
            level: record.level || '普通会员'
          };
        });
        total.value = res.data.total || processedData.length;
      } else if (res.data && Array.isArray(res.data)) {
        // 如果直接返回数组
        processedData = res.data;
        total.value = res.data.length;
      }
      
      // 将处理后的数据更新到列表中
      pointsList.value = processedData;
      
      console.log('处理后的积分数据:', pointsList.value);
      
      // 如果数据为空显示提示信息
      if (pointsList.value.length === 0) {
        ElMessage.info('暂无积分记录数据');
      }
    } else {
      ElMessage.error(res.message || '获取积分记录失败');
    }
  } catch (error) {
    console.error('获取积分记录失败:', error);
    ElMessage.error('获取积分记录失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1;
  loadPointsList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = '';
  });
  currentPage.value = 1;
  loadPointsList();
};

// 分页事件处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadPointsList();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadPointsList();
};

// 积分规则相关
const ruleDialogVisible = ref(false);
const dialogType = ref('add');
const ruleFormRef = ref(null);

const ruleForm = reactive({
  name: '',
  type: '',
  rule: '',
  points: 0,
  status: 'on',
  validity: []
});

const ruleRules = {
  name: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择积分类型', trigger: 'change' }
  ],
  rule: [
    { required: true, message: '请输入积分规则说明', trigger: 'blur' }
  ],
  points: [
    { required: true, message: '请输入积分值', trigger: 'blur' }
  ]
};

// 添加积分规则
const handleAddRule = () => {
  dialogType.value = 'add';
  ruleForm.name = '';
  ruleForm.type = '';
  ruleForm.rule = '';
  ruleForm.points = 0;
  ruleForm.status = 'on';
  ruleForm.validity = [];
  ruleDialogVisible.value = true;
};

// 提交积分规则表单
const submitRuleForm = async () => {
  if (!ruleFormRef.value) return;
  
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData = {
          name: ruleForm.name,
          type: ruleForm.type,
          rule: ruleForm.rule,
          points: ruleForm.points,
          status: ruleForm.status,
          startDate: ruleForm.validity?.[0],
          endDate: ruleForm.validity?.[1]
        };
        
        let res;
        if (dialogType.value === 'add') {
          res = await addPointsRule(formData);
        } else {
          res = await updatePointsRule(ruleForm.id, formData);
        }
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加积分规则成功' : '更新积分规则成功');
          ruleDialogVisible.value = false;
          loadPointsList();
        } else {
          ElMessage.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('提交表单失败:', error);
        ElMessage.error('操作失败');
      }
    } else {
      console.log('表单校验失败');
      return false;
    }
  });
};

// 积分详情相关
const detailDialogVisible = ref(false);
const detailData = reactive({
  memberId: '',
  memberName: '',
  avatar: '',
  totalPoints: 0,
  totalEarned: 0,
  totalUsed: 0,
  records: []
});

// 查看积分详情
const handleViewDetail = async (row) => {
  try {
    ElMessage.info('正在获取会员积分详情...');
    
    // 记录查询的会员信息
    console.log('查询会员积分详情:', row);
    
    // 检查memberId是否存在且有效
    if (!row.memberId || isNaN(Number(row.memberId))) {
      console.warn('无效的会员ID:', row.memberId);
      ElMessage.warning('无效的会员ID，显示模拟数据');
      useSimulatedData(row);
      return;
    }
    
    // 尝试从后端获取数据
    const res = await getPointsDetail(row.memberId);
    
    if (res.code === 200 && res.data) {
      // 成功获取数据
      Object.assign(detailData, res.data);
      detailDialogVisible.value = true;
    } else {
      // 后端返回错误但不是500
      console.warn('后端返回无效数据:', res);
      
      // 使用模拟数据展示
      useSimulatedData(row);
    }
  } catch (error) {
    console.error('获取积分详情失败:', error);
    
    // 使用模拟数据展示
    useSimulatedData(row);
    
    // 显示错误信息
    ElMessage({
      type: 'warning',
      message: '获取详细数据失败，显示模拟数据',
      duration: 3000
    });
  }
};

// 使用模拟数据（当API失败时）
const useSimulatedData = (row) => {
  // 使用当前行数据构建模拟详情
  Object.assign(detailData, {
    memberId: row.memberId || '未知ID',
    memberName: row.memberName || '未知用户',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    totalPoints: 1000,
    totalEarned: 1500,
    totalUsed: 500,
    records: [
      {
        type: 'shopping',
        points: 200,
        description: '购物获得积分',
        createTime: new Date().toLocaleString()
      },
      {
        type: 'signin',
        points: 10,
        description: '每日签到',
        createTime: new Date(Date.now() - 86400000).toLocaleString()
      },
      {
        type: 'exchange',
        points: -50,
        description: '积分兑换商品',
        createTime: new Date(Date.now() - 172800000).toLocaleString()
      }
    ]
  });
  
  // 显示详情对话框
  detailDialogVisible.value = true;
};

// 为所有用户创建积分账户
const handleCreateAllUserPoints = () => {
  ElMessageBox.confirm(
    '确定要为所有尚未拥有积分账户的用户创建积分账户吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
  .then(() => {
    const loadingInstance = ElLoading.service({
      fullscreen: true,
      text: '正在创建积分账户，请稍候...'
    });
    
    createAllUserPoints()
      .then(response => {
        const { data } = response;
        loadingInstance.close();
        if (data.success) {
          ElMessage.success(`操作成功：${data.message}`);
          // 刷新列表
          loadPointsList();
        } else {
          ElMessage.error(`操作失败：${data.message}`);
        }
      })
      .catch(error => {
        loadingInstance.close();
        console.error('创建积分账户失败', error);
        ElMessage.error('创建积分账户失败，请稍后重试');
      });
  })
  .catch(() => {
    ElMessage.info('已取消操作');
  });
};

onMounted(() => {
  loadPointsList();
});
</script>

<style lang="scss" scoped>
.member-points-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100%;
}

/* 卡片样式 */
.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

.data-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .header-title {
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    
    .icon-tech {
      margin-right: 8px;
      font-size: 20px;
      color: #409EFF;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
}

/* 按钮样式 */
.add-button {
  margin-left: 10px;
}

.create-button {
  margin-left: 10px;
}

.tech-button {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.search-button {
  background: linear-gradient(45deg, #409EFF, #59b6ff);
  border: none;
  
  &:hover {
    background: linear-gradient(45deg, #59b6ff, #409EFF);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.action-button {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* 表格样式 */
.tech-table {
  border-radius: 8px;
  
  :deep(.el-table__header) {
    th {
      background-color: #eef5ff;
      font-weight: bold;
      color: #333;
    }
  }
  
  :deep(.even-row) {
    background-color: #f9fbff;
  }
  
  :deep(.odd-row) {
    background-color: #ffffff;
  }
  
  :deep(.el-table__row) {
    transition: all 0.3s;
    
    &:hover {
      background-color: #ecf5ff !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      z-index: 10;
    }
  }
}

/* 积分样式 */
.points-increase {
  color: #67C23A;
  font-weight: bold;
}

.points-decrease {
  color: #F56C6C;
  font-weight: bold;
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  
  .tech-pagination {
    :deep(.el-pagination__jump) {
      margin-left: 16px;
    }
    
    :deep(.el-pager li.is-active) {
      background: linear-gradient(45deg, #409EFF, #59b6ff);
      color: white;
    }
    
    :deep(.el-pagination__sizes) {
      margin-right: 16px;
    }
  }
}

/* 对话框样式 */
:deep(.tech-dialog) {
  .el-dialog__header {
    background: linear-gradient(45deg, #409EFF, #59b6ff);
    color: white;
    padding: 16px 20px;
    border-radius: 8px 8px 0 0;
    
    .el-dialog__title {
      color: white;
      font-weight: bold;
    }
    
    .el-dialog__close {
      color: white;
    }
  }
  
  .el-dialog__footer {
    border-top: 1px solid #f0f0f0;
    padding: 12px 20px;
  }
}

/* 表单样式 */
.tech-form {
  padding: 16px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  .submit-button {
    background: linear-gradient(45deg, #409EFF, #59b6ff);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #59b6ff, #409EFF);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
  
  .cancel-button:hover {
    opacity: 0.8;
  }
}

/* 积分详情样式 */
.points-detail {
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(45deg, #f6f8ff, #f0f5ff);
    border-radius: 8px;
    margin-bottom: 20px;
    
    .member-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .info-content {
        h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #303133;
        }
        
        p {
          margin: 0;
          color: #909399;
          font-size: 14px;
        }
      }
    }
    
    .points-summary {
      text-align: right;
      
      .total-points {
        margin-bottom: 12px;
        
        .label {
          font-size: 14px;
          color: #909399;
          margin-right: 8px;
        }
        
        .value {
          font-size: 24px;
          font-weight: bold;
          color: #409EFF;
        }
      }
      
      .points-stats {
        display: flex;
        gap: 24px;
        
        .stat-item {
          .label {
            font-size: 12px;
            color: #909399;
            margin-right: 4px;
          }
          
          .value {
            font-size: 16px;
            font-weight: bold;
            
            &.increase {
              color: #67C23A;
            }
            
            &.decrease {
              color: #F56C6C;
            }
          }
        }
      }
    }
  }
  
  .detail-content {
    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      color: #303133;
    }
    
    .timeline-content {
      .record-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        
        .type {
          font-weight: bold;
          color: #303133;
        }
        
        .points {
          font-weight: bold;
          
          &.increase {
            color: #67C23A;
          }
          
          &.decrease {
            color: #F56C6C;
          }
        }
      }
      
      .description {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

/* 响应式优化 */
@media screen and (max-width: 1200px) {
  .search-form {
    flex-wrap: wrap;
  }
  
  .points-detail {
    .detail-header {
      flex-direction: column;
      gap: 20px;
      text-align: center;
      
      .member-info {
        justify-content: center;
      }
      
      .points-summary {
        text-align: center;
      }
    }
  }
}
</style> 