<template>
  <div class="user-points-container">
    <!-- 会话失效错误提示 -->
    <el-alert
      v-if="sessionError"
      title="登录会话已失效"
      type="error"
      description="您的登录状态已过期，请重新登录以继续操作。"
      show-icon
      :closable="false"
      class="session-error-alert">
      <template #default>
        <div class="error-actions">
          <el-button type="primary" @click="handleRelogin">重新登录</el-button>
          <el-button @click="handleRetry">重试</el-button>
        </div>
      </template>
    </el-alert>

    <!-- 普通API错误提示 -->
    <el-alert
      v-if="apiError && !sessionError"
      :title="errorMessage || '请求失败'"
      type="error"
      description="获取数据失败，请稍后再试。"
      show-icon
      class="api-error-alert">
      <template #default>
        <div class="error-actions">
          <el-button @click="handleRetry">重试</el-button>
        </div>
      </template>
    </el-alert>

    <h2 class="section-title">我的积分</h2>
    
    <el-card class="points-summary">
      <div class="points-value">
        <span class="points-label">当前积分</span>
        <span class="points-amount">{{ userPoints }}</span>
      </div>
      <div class="points-info">
        <p>积分可用于商城购物抵扣或兑换礼品</p>
        <div class="points-actions">
          <el-button type="primary" size="small" @click="showExchangeDialog">兑换礼品</el-button>
          <el-button type="success" size="small" @click="handleSignIn" :disabled="isSignedIn">
            {{ isSignedIn ? '今日已签到' : '每日签到' }}
          </el-button>
        </div>
      </div>
    </el-card>

    <div class="records-header">
      <h3>积分记录</h3>
      <el-radio-group v-model="timeRange" size="small">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="month">最近一个月</el-radio-button>
        <el-radio-button label="threeMonths">最近三个月</el-radio-button>
      </el-radio-group>
    </div>

    <el-table 
      v-loading="loading" 
      :data="pointsRecords" 
      style="width: 100%"
      :empty-text="emptyText">
      <el-table-column prop="createTime" label="日期" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="积分来源" />
      <el-table-column prop="points" label="积分变动">
        <template #default="scope">
          <span :class="scope.row.points > 0 ? 'text-success' : 'text-danger'">
            {{ scope.row.points > 0 ? '+' : '' }}{{ scope.row.points }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="来源类型">
        <template #default="scope">
          {{ getSourceTypeText(scope.row.source) }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="totalRecords > 0"
      class="pagination"
      layout="prev, pager, next"
      :total="totalRecords"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />

    <!-- 积分兑换对话框 -->
    <el-dialog
      v-model="exchangeDialogVisible"
      title="积分兑换"
      width="600px">
      <div class="exchange-content" v-loading="loadingGifts">
        <p class="exchange-info">您当前可用积分：{{ userPoints }}</p>
        <div class="gift-list" v-if="giftList.length > 0">
          <el-card v-for="(gift, index) in giftList" :key="index" class="gift-item">
            <img :src="gift.image" class="gift-image" alt="礼品图片">
            <div class="gift-details">
              <h4>{{ gift.name }}</h4>
              <p class="points-required">{{ gift.points }} 积分</p>
              <el-button 
                type="primary" 
                size="small" 
                :disabled="userPoints < gift.points"
                @click="exchangeGift(gift)">
                立即兑换
              </el-button>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无可兑换礼品" />
      </div>
    </el-dialog>

    <!-- 积分规则对话框 -->
    <el-dialog
      v-model="rulesDialogVisible"
      title="积分规则"
      width="500px">
      <div class="rules-content" v-loading="loadingRules">
        <div v-if="pointsRules.length > 0">
          <el-card v-for="(rule, index) in pointsRules" :key="index" class="rule-item">
            <h4>{{ rule.title }}</h4>
            <p>{{ rule.description }}</p>
            <p v-if="rule.value" class="rule-value">
              可获得积分：<span class="points-value">{{ rule.value }}</span>
            </p>
          </el-card>
        </div>
        <el-empty v-else description="暂无积分规则" />
      </div>
    </el-dialog>

    <!-- 签到成功对话框 -->
    <el-dialog
      v-model="signInSuccessVisible"
      title="签到成功"
      width="400px">
      <div class="sign-in-result">
        <div class="success-icon">
          <i class="el-icon-check"></i>
        </div>
        <h3>恭喜您，签到成功！</h3>
        <p>获得 <span class="points-earned">{{ signInPoints }}</span> 积分</p>
        <p class="sign-in-tips">连续签到可获得更多积分哦~</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getUserPoints, 
  getPointsRecords, 
  getGiftList, 
  exchangePointsGift,
  getUserSignInStatus,
  userSignIn,
  getPointsRules
} from '@/api/points';
import router from '@/router';

// 用户积分
const userPoints = ref(0);

// 签到相关
const isSignedIn = ref(false);
const signInSuccessVisible = ref(false);
const signInPoints = ref(0);

// 积分记录
const loading = ref(false);
const pointsRecords = ref([]);
const totalRecords = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);
const timeRange = ref('all');
const emptyText = ref('暂无积分记录');

// 礼品相关
const exchangeDialogVisible = ref(false);
const giftList = ref([]);
const loadingGifts = ref(false);

// 积分规则
const rulesDialogVisible = ref(false);
const pointsRules = ref([]);
const loadingRules = ref(false);

// 会话状态和错误处理
const sessionError = ref(false);
const apiError = ref(false);
const errorMessage = ref('');
const hasLoadedData = ref(false);

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  // 改为显示完整日期和时间
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
};

// 加载用户积分总数
const loadUserPoints = async () => {
  try {
    const res = await getUserPoints();
    if (res.code === 200) {
      // 检查返回的数据格式，并正确提取积分值
      if (typeof res.data === 'object') {
        // 如果返回的是对象，从totalPoints属性获取积分
        userPoints.value = res.data.totalPoints || 0;
        // 更新签到状态
        isSignedIn.value = res.data.todaySigned || false;
        // 输出调试信息
        console.log('积分信息：', res.data);
      } else {
        // 如果是直接返回数字
        userPoints.value = res.data || 0;
      }
      
      // 标记数据已加载成功
      hasLoadedData.value = true;
      // 重置错误状态
      sessionError.value = false;
      apiError.value = false;
    } else {
      ElMessage.error(res.message || '获取积分失败');
      apiError.value = true;
      errorMessage.value = res.message || '获取积分失败';
    }
  } catch (error) {
    console.error('获取积分失败:', error);
    
    // 特殊处理会话失效问题
    if (error.response && error.response.status === 500) {
      const errorData = error.response.data;
      if (errorData && errorData.includes('Session was invalidated')) {
        sessionError.value = true;
        errorMessage.value = '登录会话已失效，请重新登录';
      } else {
        apiError.value = true;
        errorMessage.value = '获取积分失败，请稍后重试';
      }
    } else {
      apiError.value = true;
      errorMessage.value = '获取积分失败，请稍后重试';
    }
  }
};

// 检查今日是否已签到
const checkSignInStatus = async () => {
  try {
    const res = await getUserSignInStatus();
    if (res.code === 200) {
      isSignedIn.value = res.data.isSignedIn || false;
    }
  } catch (error) {
    console.error('获取签到状态失败:', error);
    
    // 特殊处理会话失效问题
    if (error.response && error.response.status === 500) {
      const errorData = error.response.data;
      if (errorData && errorData.includes('Session was invalidated')) {
        sessionError.value = true;
        errorMessage.value = '登录会话已失效，请重新登录';
      }
    }
    // 签到状态获取失败不弹出全局错误提示，避免多个错误提示重复出现
  }
};

// 处理签到
const handleSignIn = async () => {
  if (isSignedIn.value) return;
  
  try {
    const res = await userSignIn();
    if (res.code === 200) {
      isSignedIn.value = true;
      signInPoints.value = res.data.points || 0;
      signInSuccessVisible.value = true;
      
      // 更新用户积分
      userPoints.value += signInPoints.value;
      
      // 重新加载积分记录
      fetchPointsRecords();
    } else {
      ElMessage.error(res.message || '签到失败');
    }
  } catch (error) {
    console.error('签到失败:', error);
    ElMessage.error('签到失败，请稍后重试');
  }
};

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchPointsRecords();
};

// 积分兑换对话框
const showExchangeDialog = async () => {
  exchangeDialogVisible.value = true;
  if (giftList.value.length === 0) {
    await loadGiftList();
  }
};

// 加载礼品列表
const loadGiftList = async () => {
  loadingGifts.value = true;
  try {
    const res = await getGiftList();
    if (res.code === 200) {
      giftList.value = res.data || [];
    } else {
      ElMessage.error(res.message || '获取礼品列表失败');
    }
  } catch (error) {
    console.error('获取礼品列表失败:', error);
    ElMessage.error('获取礼品列表失败，请稍后重试');
  } finally {
    loadingGifts.value = false;
  }
};

// 加载积分规则
const loadPointsRules = async () => {
  loadingRules.value = true;
  try {
    const res = await getPointsRules();
    if (res.code === 200) {
      pointsRules.value = res.data || [];
    } else {
      ElMessage.error(res.message || '获取积分规则失败');
    }
  } catch (error) {
    console.error('获取积分规则失败:', error);
    ElMessage.error('获取积分规则失败，请稍后重试');
  } finally {
    loadingRules.value = false;
  }
};

// 兑换礼品
const exchangeGift = async (gift) => {
  ElMessageBox.confirm(
    `确定要使用 ${gift.points} 积分兑换 ${gift.name} 吗？`,
    '兑换确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true;
    try {
      const res = await exchangePointsGift(gift.id);
      if (res.code === 200) {
        userPoints.value -= gift.points;
        ElMessage.success('兑换成功！');
        exchangeDialogVisible.value = false;
        
        // 重新加载积分记录
        await fetchPointsRecords();
      } else {
        ElMessage.error(res.message || '兑换失败');
      }
    } catch (error) {
      console.error('兑换礼品失败:', error);
      ElMessage.error('兑换礼品失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    // 取消兑换
  });
};

// 显示积分规则
const showPointsRules = async () => {
  rulesDialogVisible.value = true;
  if (pointsRules.value.length === 0) {
    await loadPointsRules();
  }
};

// 获取积分记录
const fetchPointsRecords = async () => {
  loading.value = true;
  emptyText.value = '加载中...';
  
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      timeRange: timeRange.value
    };
    
    const res = await getPointsRecords(params);
    
    if (res.code === 200) {
      pointsRecords.value = res.data.records || [];
      totalRecords.value = res.data.total || 0;
      
      // 调试信息，帮助排查问题
      console.log('积分记录数据:', res.data);
      
      // 重置错误状态
      apiError.value = false;
    } else {
      ElMessage.error(res.message || '获取积分记录失败');
      apiError.value = true;
      errorMessage.value = res.message || '获取积分记录失败';
    }
  } catch (error) {
    console.error('获取积分记录失败:', error);
    
    // 特殊处理会话失效问题
    if (error.response && error.response.status === 500) {
      const errorData = error.response.data;
      if (errorData && errorData.includes('Session was invalidated')) {
        sessionError.value = true;
        errorMessage.value = '登录会话已失效，请重新登录';
      } else {
        apiError.value = true;
        errorMessage.value = '获取积分记录失败，请稍后重试';
      }
    } else {
      apiError.value = true;
      errorMessage.value = '获取积分记录失败，请稍后重试';
    }
  } finally {
    loading.value = false;
    emptyText.value = '暂无积分记录';
  }
};

// 监听时间范围变化
watch(timeRange, () => {
  currentPage.value = 1; // 重置页码
  fetchPointsRecords();
});

// 获取积分来源类型的用户友好文本
const getSourceTypeText = (source) => {
  const sourceMap = {
    'signin': '每日签到',
    'order': '购物消费',
    'review': '评价奖励',
    'register': '注册奖励',
    'exchange': '积分兑换',
    'promotion': '促销活动',
    'ORDER_COMPLETED': '订单完成'
  };
  return sourceMap[source] || source;
};

// 重新登录处理
const handleRelogin = () => {
  // 清除本地的token和会话相关信息
  // 假设auth.js中有removeToken方法
  import('@/utils/auth').then(({ removeToken }) => {
    removeToken();
    // 跳转到登录页，并带上当前页面作为重定向目标
    router.push(`/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`);
  });
};

// 重试功能
const handleRetry = () => {
  // 重置错误状态
  sessionError.value = false;
  apiError.value = false;
  errorMessage.value = '';
  
  // 重新加载所有数据
  loadUserPoints();
  fetchPointsRecords();
  checkSignInStatus();
};

onMounted(() => {
  loadUserPoints();
  fetchPointsRecords();
  checkSignInStatus();
});
</script>

<style src="@/styles/user/UserPoints.scss" scoped></style>
