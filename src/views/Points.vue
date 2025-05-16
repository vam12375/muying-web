<template>
  <div class="points-mall-page">
    <!-- 页面加载状态 -->
    <div v-if="loading" class="page-loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <template v-else>
      <!-- 顶部积分信息卡片 -->
      <motion-div
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
      >
        <div class="points-info-card">
          <div class="points-info-bg"></div>
          <div class="points-info-content">
            <div class="user-points-wrapper">
              <div class="points-label">我的积分</div>
              <div class="points-amount" ref="pointsValueRef">{{ animatedPoints }}</div>
              <div class="points-trend" v-if="pointsThisMonth > 0">
                本月 <span>+{{ pointsThisMonth }}</span>
              </div>
            </div>
            
            <div class="membership-info">
              <div class="member-badge" :class="userLevel">
                <div class="member-icon">
                  <i :class="getMemberIcon"></i>
                </div>
                <div class="member-details">
                  <div class="member-level">{{ userLevel }}</div>
                  <div class="member-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{width: `${levelProgress}%`}"></div>
                    </div>
                    <div class="progress-text">
                      距离 {{ getNextLevel }} 还需 {{ pointsToNextLevel }} 积分
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="points-actions">
            <el-button type="primary" @click="showSection('mall')">
              <i class="el-icon-shopping-cart"></i> 积分商城
            </el-button>
            <el-button @click="showSection('records')">
              <i class="el-icon-document"></i> 积分明细
            </el-button>
            <el-button @click="showSection('rules')">
              <i class="el-icon-info"></i> 积分规则
            </el-button>
          </div>
        </div>
      </motion-div>
      
      <!-- 积分概览卡片 -->
      <motion-div
        :initial="{ opacity: 0, scale: 0.9 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.5, delay: 0.2 }"
      >
        <div class="points-overview">
          <div class="overview-item">
            <div class="overview-icon earn">
              <i class="el-icon-plus"></i>
            </div>
            <div class="overview-data">
              <div class="overview-value">{{ totalPointsEarned }}</div>
              <div class="overview-label">累计获得</div>
            </div>
          </div>
          
          <div class="overview-item">
            <div class="overview-icon spend">
              <i class="el-icon-shopping-cart"></i>
            </div>
            <div class="overview-data">
              <div class="overview-value">{{ totalPointsUsed }}</div>
              <div class="overview-label">已使用</div>
            </div>
          </div>
          
          <div class="overview-item">
            <div class="overview-icon sign">
              <i class="el-icon-date"></i>
            </div>
            <div class="overview-data">
              <div class="overview-value">{{ consecutiveDays }}</div>
              <div class="overview-label">连续签到</div>
            </div>
          </div>
          
          <div class="sign-in-action">
            <el-button 
              type="success" 
              :disabled="alreadySignedIn"
              :loading="signInLoading"
              @click="handleSignIn"
            >
              {{ alreadySignedIn ? '今日已签到' : '每日签到' }}
            </el-button>
          </div>
        </div>
      </motion-div>
      
      <!-- 内容区域 -->
      <div class="content-section">
        <!-- 积分商城部分 -->
        <div v-show="activeSection === 'mall'" class="points-mall-section">
          <motion-div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-header">
              <h2><i class="el-icon-shopping-cart"></i> 积分商城</h2>
              <div class="filter-actions">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索商品"
                  prefix-icon="el-icon-search"
                  clearable
                  @input="filterProducts"
                />
                <el-select v-model="selectedCategory" @change="filterProducts" placeholder="全部分类">
                  <el-option label="全部分类" value="all" />
                  <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
                </el-select>
                <el-select v-model="sortOrder" @change="filterProducts" placeholder="排序方式">
                  <el-option v-for="option in sortOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
              </div>
            </div>
            
            <!-- 商品列表 -->
            <el-tabs v-model="viewMode" class="view-mode-tabs">
              <el-tab-pane label="网格视图" name="grid">
                <div class="products-grid">
                  <transition-group name="product-item">
                    <div 
                      v-for="product in displayProducts" 
                      :key="product.id"
                      class="product-card"
                      :class="{ 'disabled': product.points > userPoints || product.stock <= 0 }"
                    >
                      <div class="product-image">
                        <img :src="product.image" :alt="product.name">
                        <div class="product-badges">
                          <span v-if="product.isNew" class="badge new">新品</span>
                          <span v-if="product.isHot" class="badge hot">热门</span>
                          <span v-if="product.stock <= 0" class="badge sold-out">已售罄</span>
                        </div>
                      </div>
                      <div class="product-info">
                        <h3 class="product-name">{{ product.name }}</h3>
                        <div class="product-meta">
                          <div class="product-stock" v-if="product.stock > 0">库存: {{ product.stock }}</div>
                          <div class="product-rating">
                            <i class="el-icon-star-on" v-for="i in Math.floor(product.rating || 5)" :key="i"></i>
                            <i class="el-icon-star-off" v-for="i in (5 - Math.floor(product.rating || 5))" :key="i+5"></i>
                          </div>
                        </div>
                        <div class="product-footer">
                          <div class="product-points">{{ product.points }} <span>积分</span></div>
                          <el-button 
                            type="primary" 
                            size="small"
                            :disabled="product.points > userPoints || product.stock <= 0"
                            @click="exchangeProduct(product)"
                          >
                            {{ product.points > userPoints ? '积分不足' : (product.stock <= 0 ? '已售罄' : '立即兑换') }}
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </el-tab-pane>
              
              <el-tab-pane label="列表视图" name="list">
                <div class="products-list">
                  <transition-group name="product-item">
                    <div 
                      v-for="product in displayProducts" 
                      :key="product.id"
                      class="product-list-item"
                      :class="{ 'disabled': product.points > userPoints || product.stock <= 0 }"
                    >
                      <div class="product-list-image">
                        <img :src="product.image" :alt="product.name">
                        <div class="product-badges">
                          <span v-if="product.isNew" class="badge new">新品</span>
                          <span v-if="product.isHot" class="badge hot">热门</span>
                        </div>
                      </div>
                      <div class="product-list-info">
                        <h3 class="product-name">{{ product.name }}</h3>
                        <div class="product-description">{{ product.description }}</div>
                        <div class="product-meta">
                          <div class="product-stock" v-if="product.stock > 0">库存: {{ product.stock }}</div>
                          <div class="product-stock out" v-else>已售罄</div>
                          <div class="product-rating">
                            <i class="el-icon-star-on" v-for="i in Math.floor(product.rating || 5)" :key="i"></i>
                            <i class="el-icon-star-off" v-for="i in (5 - Math.floor(product.rating || 5))" :key="i+5"></i>
                          </div>
                        </div>
                      </div>
                      <div class="product-list-action">
                        <div class="product-points">{{ product.points }} <span>积分</span></div>
                        <el-button 
                          type="primary"
                          :disabled="product.points > userPoints || product.stock <= 0"
                          @click="exchangeProduct(product)"
                        >
                          {{ product.points > userPoints ? '积分不足' : (product.stock <= 0 ? '已售罄' : '立即兑换') }}
                        </el-button>
                      </div>
                    </div>
                  </transition-group>
                </div>
              </el-tab-pane>
            </el-tabs>
            
            <!-- 分页 -->
            <div class="pagination-container" v-show="filteredProducts.length > pageSize">
              <el-pagination
                v-model:currentPage="currentPage"
                :page-size="pageSize"
                layout="prev, pager, next"
                :total="filteredProducts.length"
                @current-change="handlePageChange"
              />
            </div>
          </motion-div>
        </div>
        
        <!-- 积分记录部分 -->
        <div v-show="activeSection === 'records'" class="points-records-section">
          <motion-div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-header">
              <h2><i class="el-icon-document"></i> 积分明细</h2>
              <div class="filter-actions">
                <el-select v-model="recordType" placeholder="记录类型">
                  <el-option label="全部" value="all" />
                  <el-option label="获得" value="earn" />
                  <el-option label="使用" value="use" />
                </el-select>
                
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                ></el-date-picker>
                
                <el-button type="primary" @click="searchRecords">
                  <i class="el-icon-search"></i> 查询
                </el-button>
              </div>
            </div>
            
            <el-table
              :data="pointsRecords"
              style="width: 100%"
              :empty-text="recordsLoading ? '加载中...' : '暂无积分记录'"
              v-loading="recordsLoading"
              class="points-table"
            >
              <el-table-column prop="createTime" label="时间" min-width="180">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="type" label="类型" width="100">
                <template #default="scope">
                  <div class="record-type" :class="scope.row.type">
                    {{ scope.row.type === 'earn' ? '获得' : '使用' }}
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="description" label="描述" min-width="220">
                <template #default="scope">
                  <div class="record-description">{{ scope.row.description }}</div>
                </template>
              </el-table-column>
              
              <el-table-column prop="points" label="积分变动" width="120" align="right">
                <template #default="scope">
                  <div class="record-points" :class="scope.row.type">
                    {{ scope.row.type === 'earn' ? '+' : '-' }}{{ Math.abs(scope.row.points) }}
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column prop="balance" label="积分余额" width="120" align="right">
                <template #default="scope">
                  <div class="record-balance">{{ scope.row.balance }}</div>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination-container">
              <el-pagination
                v-model:currentPage="recordsPage"
                :page-size="recordsPageSize"
                layout="total, prev, pager, next, jumper"
                :total="recordsTotal"
                @current-change="handleRecordsPageChange"
              />
            </div>
          </motion-div>
        </div>
        
        <!-- 积分规则部分 -->
        <div v-show="activeSection === 'rules'" class="points-rules-section">
          <motion-div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ duration: 0.5 }"
          >
            <div class="section-header">
              <h2><i class="el-icon-info"></i> 积分规则</h2>
            </div>
            
            <div class="rules-container">
              <el-collapse accordion>
                <el-collapse-item title="如何获得积分" name="1">
                  <div class="rule-content">
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-date"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">每日签到</div>
                        <div class="rule-description">每日签到可获得5积分，连续签到额外奖励</div>
                      </div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-shopping-cart"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">购物消费</div>
                        <div class="rule-description">购物消费金额的10%转化为积分（1元=1积分）</div>
                      </div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-chat-line-square"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">评价商品</div>
                        <div class="rule-description">评价商品奖励10积分，带图评价奖励20积分</div>
                      </div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-trophy"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">活动奖励</div>
                        <div class="rule-description">参与平台活动可获得相应积分奖励</div>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="积分使用方式" name="2">
                  <div class="rule-content">
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-shopping-bag"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">积分商城兑换</div>
                        <div class="rule-description">在积分商城兑换各类商品和优惠券</div>
                      </div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-money"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">下单抵现</div>
                        <div class="rule-description">结算时可使用积分抵扣部分金额（100积分=1元）</div>
                      </div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="rule-icon"><i class="el-icon-rank"></i></div>
                      <div class="rule-detail">
                        <div class="rule-title">会员等级提升</div>
                        <div class="rule-description">积分累计可提升会员等级，享受更多特权</div>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="积分有效期" name="3">
                  <div class="rule-content">
                    <div class="rule-text">
                      <p>积分有效期为获得之日起1年，过期积分将自动清零。</p>
                      <p>系统会在积分过期前一个月发送提醒通知。</p>
                      <p>建议您及时使用即将过期的积分。</p>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </motion-div>
        </div>
      </div>
    </template>
    
    <!-- 积分兑换确认对话框 -->
    <el-dialog
      v-model="exchangeDialogVisible"
      title="积分兑换确认"
      width="400px"
    >
      <div class="exchange-dialog-content" v-if="selectedProduct">
        <div class="product-preview">
          <img :src="selectedProduct.image" :alt="selectedProduct.name">
        </div>
        <div class="product-info">
          <h3>{{ selectedProduct.name }}</h3>
          <div class="exchange-points">所需积分: <span>{{ selectedProduct.points }}</span></div>
          <div class="user-points">您的积分: <span>{{ userPoints }}</span></div>
          <div class="balance-points">兑换后剩余: <span>{{ userPoints - selectedProduct.points }}</span></div>
        </div>
        <div class="exchange-warning" v-if="selectedProduct.category === 'physical'">
          实物商品需要填写收货地址
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exchangeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExchange" :loading="exchangeLoading">
            确认兑换
          </el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 兑换成功动画 -->
    <div class="exchange-success-animation" v-if="showExchangeSuccess">
      <div class="success-content">
        <div class="success-icon">
          <i class="el-icon-check"></i>
        </div>
        <div class="success-text">兑换成功</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatDate } from '@/utils/date';
import { 
  getUserPoints, 
  getPointsRecords, 
  signIn, 
  checkSignIn, 
  getPointsProducts,
  exchangeProduct as apiExchangeProduct,
  getGiftList,
  checkPointsAvailable
} from '@/api/points';

const router = useRouter();

// 页面状态
const loading = ref(true);
const activeSection = ref('mall'); // mall, records, rules

// 用户积分数据
const userPoints = ref(0);
const animatedPoints = ref(0);
const userLevel = ref('普通会员');
const pointsThisMonth = ref(0);
const totalPointsEarned = ref(0);
const totalPointsUsed = ref(0);
const expiringPoints = ref(0);
const expiringDate = ref('');
const consecutiveDays = ref(0);
const pointsValueRef = ref(null);

// 会员等级相关数据
const levelPoints = {
  '普通会员': 0,
  '银牌会员': 1000,
  '金牌会员': 5000,
  '钻石会员': 20000,
  '至尊会员': 50000
};

// 会员图标
const getMemberIcon = computed(() => {
  const icons = {
    '普通会员': 'el-icon-user',
    '银牌会员': 'el-icon-medal',
    '金牌会员': 'el-icon-medal-1',
    '钻石会员': 'el-icon-trophy',
    '至尊会员': 'el-icon-trophy-1'
  };
  return icons[userLevel.value] || 'el-icon-user';
});

// 积分商城数据
const products = ref([]);
const filteredProducts = ref([]);
const displayProducts = ref([]);
const viewMode = ref('grid');
const selectedCategory = ref('all');
const searchQuery = ref('');
const sortOrder = ref('popular');
const currentPage = ref(1);
const pageSize = ref(8);

// 兑换相关
const selectedProduct = ref(null);
const exchangeDialogVisible = ref(false);
const exchangeLoading = ref(false);
const showExchangeSuccess = ref(false);

// 积分记录数据
const pointsRecords = ref([]);
const recordType = ref('all');
const dateRange = ref([]);
const recordsPage = ref(1);
const recordsPageSize = ref(10);
const recordsTotal = ref(0);
const recordsLoading = ref(false);

// 签到状态
const alreadySignedIn = ref(false);
const signInLoading = ref(false);

// 分类和排序选项
const categories = [
  { value: 'digital', label: '数码产品' },
  { value: 'vouchers', label: '代金券' },
  { value: 'physical', label: '实物商品' },
  { value: 'vip', label: '会员特权' }
];

const sortOptions = [
  { value: 'popular', label: '热门优先' },
  { value: 'points-low', label: '积分从低到高' },
  { value: 'points-high', label: '积分从高到高' },
  { value: 'newest', label: '最新上架' }
];

// 计算下一个等级
const getNextLevel = computed(() => {
  const levels = ['普通会员', '银牌会员', '金牌会员', '钻石会员', '至尊会员'];
  const currentIndex = levels.indexOf(userLevel.value);
  
  if (currentIndex === levels.length - 1) {
    return '已达最高等级';
  }
  
  return levels[currentIndex + 1];
});

// 计算距离下一等级所需积分
const pointsToNextLevel = computed(() => {
  const nextLevel = getNextLevel.value;
  
  if (nextLevel === '已达最高等级') {
    return 0;
  }
  
  return levelPoints[nextLevel] - userPoints.value > 0 
    ? levelPoints[nextLevel] - userPoints.value 
    : 0;
});

// 计算等级进度百分比
const levelProgress = computed(() => {
  const currentLevelPoints = levelPoints[userLevel.value] || 0;
  const nextLevelPoints = levelPoints[getNextLevel.value] || levelPoints['至尊会员'];
  
  if (currentLevelPoints === nextLevelPoints) {
    return 100;
  }
  
  const progress = ((userPoints.value - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
  return Math.min(Math.max(progress, 0), 100);
});

// 计算会员等级进度
const calculateLevelProgress = () => {
  // 获取当前等级所需积分和下一等级所需积分
  const currentLevelPoints = levelPoints[userLevel.value] || 0;
  const nextLevel = getNextLevel.value;
  const nextLevelPoints = levelPoints[nextLevel] || Infinity;
  
  // 如果已经是最高等级
  if (nextLevelPoints === Infinity) {
    levelProgress.value = 100;
    pointsToNextLevel.value = 0;
    return;
  }
  
  // 计算到下一等级还需要的积分
  const pointsNeeded = nextLevelPoints - currentLevelPoints;
  const pointsAchieved = userPoints.value - currentLevelPoints;
  
  pointsToNextLevel.value = Math.max(0, nextLevelPoints - userPoints.value);
  
  // 计算进度百分比
  levelProgress.value = Math.min(100, Math.max(0, Math.floor((pointsAchieved / pointsNeeded) * 100)));
};

// 显示指定板块
const showSection = (section) => {
  activeSection.value = section;
  
  // 如果切换到积分记录部分，加载数据
  if (section === 'records' && pointsRecords.value.length === 0) {
    loadPointsRecords();
  }
};

// 动画显示积分数字
const animatePointsValue = () => {
  const start = 0;
  const end = userPoints.value;
  const duration = 1000; // 动画持续时间（毫秒）
  const frameDuration = 1000 / 60; // 每帧持续时间（假设60fps）
  const totalFrames = Math.round(duration / frameDuration);
  const valueIncrement = (end - start) / totalFrames;
  
  let currentFrame = 0;
  
  const animate = () => {
    currentFrame++;
    const newValue = Math.round(Math.min(start + (valueIncrement * currentFrame), end));
    animatedPoints.value = newValue;
    
    if (currentFrame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      animatedPoints.value = end;
    }
  };
  
  animate();
};

// 获取用户积分信息和签到状态
const loadUserPointsInfo = async () => {
  try {
    loading.value = true;
    const res = await getUserPoints();
    if (res.code === 200 && res.data) {
      // 确保正确提取所有需要的数据
      userPoints.value = res.data.totalPoints || res.data.points || 0;
      alreadySignedIn.value = res.data.todaySigned || false;
      consecutiveDays.value = res.data.continuousDays || 0;
      userLevel.value = res.data.userLevel || '普通会员';
      
      // 计算等级信息
      calculateLevelProgress();
      
      // 积分数字动画
      animatePointsValue();
      
      // 获取其他信息，如果API未返回，则使用默认值
      pointsThisMonth.value = res.data.pointsThisMonth || 0;
      totalPointsEarned.value = res.data.totalEarned || 0;
      totalPointsUsed.value = res.data.totalUsed || 0;
      expiringPoints.value = res.data.expiringPoints || 0;
      expiringDate.value = res.data.expiringDate || '';
      
      console.log('积分信息加载成功:', res.data);
    } else {
      ElMessage.error(res.message || '获取积分信息失败');
    }
  } catch (error) {
    console.error('获取积分信息失败:', error);
    ElMessage.error('获取积分信息失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 加载积分商城商品
const loadProducts = async () => {
  try {
    const res = await getPointsProducts();
    if (res.code === 200 && res.data) {
      // 处理并格式化商品数据
      products.value = res.data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '暂无描述',
        image: item.image || 'https://via.placeholder.com/200',
        points: item.points,
        stock: item.stock,
        category: item.category,
        isNew: item.isNew || false,
        isHot: item.isHot || false,
        rating: item.rating || (Math.random() * 2 + 3).toFixed(1), // 随机生成3-5的评分
        needAddress: item.needAddress,
        needPhone: item.needPhone
      }));
      
      // 初始化筛选
      filterProducts();
    }
  } catch (error) {
    console.error('获取积分商品失败:', error);
    ElMessage.error('获取积分商品失败，请稍后再试');
  }
};

// 筛选和排序商品
const filterProducts = () => {
  // 首先按类别和搜索词筛选
  let result = [...products.value];
  
  // 按类别筛选
  if (selectedCategory.value !== 'all') {
    result = result.filter(item => item.category === selectedCategory.value);
  }
  
  // 按搜索词筛选
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.description.toLowerCase().includes(keyword)
    );
  }
  
  // 然后排序
  switch (sortOrder.value) {
    case 'points-low':
      result.sort((a, b) => a.points - b.points);
      break;
    case 'points-high':
      result.sort((a, b) => b.points - a.points);
      break;
    case 'newest':
      result.sort((a, b) => (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1));
      break;
    case 'popular':
    default:
      result.sort((a, b) => (a.isHot ? -1 : 1) - (b.isHot ? -1 : 1));
      break;
  }
  
  filteredProducts.value = result;
  handlePageChange(1); // 重置到第一页
};

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  const start = (page - 1) * pageSize.value;
  const end = start + pageSize.value;
  displayProducts.value = filteredProducts.value.slice(start, end);
};

// 获取签到状态
const checkSignInStatus = async () => {
  try {
    const res = await checkSignIn();
    if (res.code === 200 && res.data) {
      alreadySignedIn.value = res.data.todaySigned || false;
      consecutiveDays.value = res.data.continuousDays || consecutiveDays.value;
      
      console.log('签到状态检查:', res.data);
    }
  } catch (error) {
    console.error('检查签到状态失败:', error);
  }
};

// 执行签到
const handleSignIn = async () => {
  if (alreadySignedIn.value || signInLoading.value) {
    ElMessage.info('今日已签到');
    return;
  }
  
  signInLoading.value = true;
  try {
    const res = await signIn();
    if (res.code === 200) {
      alreadySignedIn.value = true;
      // 增加连续签到天数
      consecutiveDays.value += 1;
      
      // 更新积分
      const earnedPoints = res.data.points || 5;
      userPoints.value += earnedPoints;
      totalPointsEarned.value += earnedPoints;
      
      // 动画展示
      animatePointsValue();
      
      // 显示签到成功动画和提示
      ElMessage({
        message: `签到成功，获得${earnedPoints}积分`,
        type: 'success',
        duration: 3000
      });
    } else {
      ElMessage.error(res.message || '签到失败');
    }
  } catch (error) {
    console.error('签到失败:', error);
    ElMessage.error('签到失败，请稍后再试');
  } finally {
    signInLoading.value = false;
  }
};

// 获取积分记录
const loadPointsRecords = async () => {
  recordsLoading.value = true;
  try {
    const params = {
      page: recordsPage.value,
      pageSize: recordsPageSize.value,
      type: recordType.value !== 'all' ? recordType.value : undefined,
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    };
    
    const res = await getPointsRecords(params);
    if (res.code === 200 && res.data) {
      pointsRecords.value = res.data.records || [];
      recordsTotal.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取积分记录失败:', error);
    ElMessage.error('获取积分记录失败，请稍后再试');
  } finally {
    recordsLoading.value = false;
  }
};

// 搜索积分记录
const searchRecords = () => {
  recordsPage.value = 1;
  loadPointsRecords();
};

// 处理积分记录分页变化
const handleRecordsPageChange = (page) => {
  recordsPage.value = page;
  loadPointsRecords();
};

// 兑换商品
const exchangeProduct = (product) => {
  // 检查积分是否足够
  if (userPoints.value < product.points) {
    ElMessage.warning('积分不足，无法兑换该商品');
    return;
  }
  
  // 检查库存是否足够
  if (product.stock <= 0) {
    ElMessage.warning('该商品已售罄');
    return;
  }
  
  // 设置选中的商品
  selectedProduct.value = product;
  
  // 显示兑换确认对话框
  exchangeDialogVisible.value = true;
};

// 确认兑换
const confirmExchange = async () => {
  if (!selectedProduct.value) return;
  
  exchangeLoading.value = true;
  try {
    // 调用兑换API
    const res = await apiExchangeProduct(selectedProduct.value.id);
    
    if (res.code === 200) {
      // 关闭对话框
      exchangeDialogVisible.value = false;
      
      // 更新积分
      const productPoints = selectedProduct.value.points;
      userPoints.value -= productPoints;
      totalPointsUsed.value += productPoints;
      
      // 更新商品库存
      const productIndex = products.value.findIndex(p => p.id === selectedProduct.value.id);
      if (productIndex !== -1) {
        products.value[productIndex].stock -= 1;
      }
      
      // 重新筛选商品
      filterProducts();
      
      // 显示兑换成功动画
      showExchangeSuccess.value = true;
      setTimeout(() => {
        showExchangeSuccess.value = false;
      }, 2000);
      
      // 提示成功
      ElMessage.success('商品兑换成功');
    } else {
      ElMessage.error(res.message || '兑换失败');
    }
  } catch (error) {
    console.error('兑换商品失败:', error);
    ElMessage.error('兑换失败，请稍后再试');
  } finally {
    exchangeLoading.value = false;
  }
};

// 监听筛选条件变化
watch([selectedCategory, sortOrder], () => {
  filterProducts();
});

// 初始化
onMounted(async () => {
  await loadUserPointsInfo(); // 先加载用户积分信息
  await loadProducts(); // 然后加载商品
  checkSignInStatus(); // 检查签到状态
  
  // 模拟数据，如果API不可用
  if (products.value.length === 0) {
    products.value = [
      {
        id: '1',
        name: '婴儿奶瓶保温套装',
        description: '高品质婴儿奶瓶保温套装，保持奶温，给宝宝最贴心的呵护',
        points: 2000,
        stock: 15,
        category: 'physical',
        isHot: true,
        rating: 4.8,
        image: 'https://img.freepik.com/free-photo/collection-baby-care-items_23-2148615543.jpg?size=626&ext=jpg'
      },
      {
        id: '2',
        name: '婴儿安抚玩具',
        description: '柔软舒适的婴儿安抚玩具，帮助宝宝安稳入睡',
        points: 1500,
        stock: 20,
        category: 'physical',
        isNew: true,
        rating: 4.5,
        image: 'https://img.freepik.com/free-photo/cute-plush-toys-arrangement_23-2150312242.jpg?size=626&ext=jpg'
      },
      {
        id: '3',
        name: '儿童益智拼图',
        description: '培养孩子逻辑思维的益智拼图，多种难度可选',
        points: 1200,
        stock: 30,
        category: 'physical',
        rating: 4.3,
        image: 'https://img.freepik.com/free-photo/closeup-child-playing-with-wooden-toys_23-2148518376.jpg?size=626&ext=jpg'
      },
      {
        id: '4',
        name: '优惠券礼包',
        description: '包含多种商品优惠券的礼包，总价值超过200元',
        points: 800,
        stock: 100,
        category: 'vouchers',
        isHot: true,
        rating: 4.0,
        image: 'https://img.freepik.com/free-photo/arrangement-black-friday-shopping-bags_23-2149047261.jpg?size=626&ext=jpg'
      },
      {
        id: '5',
        name: '母婴店消费券',
        description: '价值100元的母婴店通用消费券',
        points: 900,
        stock: 50,
        category: 'vouchers',
        rating: 4.2,
        image: 'https://img.freepik.com/free-photo/mother-with-her-little-daughter-shopping_23-2148924915.jpg?size=626&ext=jpg'
      },
      {
        id: '6',
        name: 'VIP会员1个月',
        description: '享受1个月VIP会员特权，包括免运费、专属客服等',
        points: 1800,
        stock: 999,
        category: 'vip',
        isNew: true,
        rating: 4.7,
        image: 'https://img.freepik.com/free-photo/3d-render-golden-badge-customer-service_107791-16607.jpg?size=626&ext=jpg'
      },
      {
        id: '7',
        name: '儿童智能手表',
        description: '支持定位功能的儿童智能手表，让父母随时掌握孩子位置',
        points: 3500,
        stock: 5,
        category: 'digital',
        isHot: true,
        rating: 4.9,
        image: 'https://img.freepik.com/free-photo/smart-watch-with-pink-color-flat-lay_23-2149458581.jpg?size=626&ext=jpg'
      },
      {
        id: '8',
        name: '婴儿监控器',
        description: '高清婴儿监控器，随时随地关注宝宝状况',
        points: 3000,
        stock: 8,
        category: 'digital',
        rating: 4.6,
        image: 'https://img.freepik.com/free-photo/baby-sleeping-sweet-dreams_23-2149342089.jpg?size=626&ext=jpg'
      }
    ];
    filterProducts();
  }
});
</script>

<style lang="scss" src="../styles/Points.scss"></style> 