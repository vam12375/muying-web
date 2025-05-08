<template>
  <div class="point-page min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <div class="container mx-auto py-10 px-4">
      <motion-div
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5 }"
        class="mb-8"
      >
        <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <div class="text-primary-600">
            <i class="el-icon-medal text-2xl"></i>
          </div>
          我的积分
        </h1>
        <p class="text-gray-500 mt-2">
          查看您的积分明细和使用记录
        </p>
      </motion-div>
      
      <!-- 积分卡片 - 全新设计 -->
      <div class="points-card bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-lg">
        <div class="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white relative overflow-hidden">
          <!-- 背景装饰 -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div class="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
            <!-- 积分展示 -->
            <div class="mb-6 md:mb-0">
              <div class="text-white/80 font-medium mb-2">当前积分</div>
              <div class="flex items-baseline">
                <div class="text-5xl font-bold mr-2">{{ userPoints }}</div>
                <div v-if="pointsThisMonth > 0" class="text-white/80 text-sm">
                  本月 <span class="text-white">+{{ pointsThisMonth }}</span>
                </div>
              </div>
            </div>
            
            <!-- 会员等级 - 全新设计 -->
            <div class="membership-badge">
              <div class="text-white/80 font-medium mb-2">会员等级</div>
              <div class="relative">
                <div class="membership-card px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center">
                  <div class="membership-icon mr-3">
                    <div v-if="userLevel === '银牌会员'" class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-300 to-gray-100 flex items-center justify-center text-2xl shadow-inner">
                      🥈
                    </div>
                    <div v-else-if="userLevel === '金牌会员'" class="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 flex items-center justify-center text-2xl shadow-inner">
                      🥇
                    </div>
                    <div v-else-if="userLevel === '钻石会员'" class="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-300 flex items-center justify-center text-2xl shadow-inner">
                      💎
                    </div>
                    <div v-else-if="userLevel === '至尊会员'" class="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-400 flex items-center justify-center text-2xl shadow-inner">
                      🌟
                    </div>
                    <div v-else class="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 flex items-center justify-center text-2xl shadow-inner">
                      😊
                    </div>
                  </div>
                  <div class="membership-info">
                    <div class="text-lg font-bold">{{ userLevel }}</div>
                    <div class="text-xs text-white/70">尊享会员专属特权</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 会员等级进度条 -->
          <div class="level-progress mt-8 relative z-10">
            <div class="flex justify-between text-sm mb-2">
              <span>当前等级</span>
              <span>{{ getNextLevel }}</span>
            </div>
            <div class="w-full bg-white/20 rounded-full h-2.5 mb-1">
              <div class="bg-white h-2.5 rounded-full" :style="{ width: `${levelProgress}%` }"></div>
            </div>
            <div class="text-xs text-white/80">
              再累计 <span class="font-bold">{{ pointsToNextLevel }}</span> 积分升级为 {{ getNextLevel }}
            </div>
          </div>
        </div>
        
        <!-- 积分统计信息 -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="stat-card p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-md">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <i class="el-icon-medal text-blue-500"></i>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">本月获得</div>
                  <div class="text-2xl font-bold text-blue-600">{{ pointsThisMonth }}</div>
                </div>
              </div>
            </div>
            
            <div class="stat-card p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100 transition-all duration-300 hover:shadow-md">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <i class="el-icon-plus text-green-500"></i>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">累计获得</div>
                  <div class="text-2xl font-bold text-green-600">{{ totalPointsEarned }}</div>
                </div>
              </div>
            </div>
            
            <div class="stat-card p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100 transition-all duration-300 hover:shadow-md">
              <div class="flex items-center">
                <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <i class="el-icon-shopping-cart text-orange-500"></i>
                </div>
                <div>
                  <div class="text-sm text-gray-500 mb-1">累计使用</div>
                  <div class="text-2xl font-bold text-orange-500">{{ totalPointsUsed }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 签到日历组件 -->
          <div class="mt-8 border-t pt-6">
            <h3 class="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <i class="el-icon-calendar mr-2 text-primary-500"></i>
              连续签到
            </h3>
            
            <div class="sign-in-calendar bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <div class="text-sm text-gray-600">
                  <span v-if="consecutiveDays > 0">已连续签到 <span class="font-bold text-primary-600">{{ consecutiveDays }}</span> 天</span>
                  <span v-else>今日尚未签到</span>
                </div>
                <el-button 
                  @click="handleSignIn" 
                  :loading="signInLoading" 
                  :disabled="alreadySignedIn" 
                  type="primary" 
                  size="small"
                  class="sign-in-btn"
                >
                  <i class="el-icon-check mr-1"></i> {{ alreadySignedIn ? '今日已签到' : '立即签到' }}
                </el-button>
              </div>
              
              <div class="flex justify-between">
                <div 
                  v-for="day in 7" 
                  :key="day" 
                  class="sign-day-item flex flex-col items-center"
                  :class="{ 'signed': day <= consecutiveDays || (day === 1 && alreadySignedIn) }"
                >
                  <div class="sign-day-circle mb-1">
                    <i v-if="day <= consecutiveDays || (day === 1 && alreadySignedIn)" class="el-icon-check"></i>
                    <template v-else>{{ day }}</template>
                  </div>
                  <div class="text-xs">{{ getSignReward(day) }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 积分应用按钮组 -->
          <div class="mt-6 flex flex-wrap gap-4 justify-center">
            <el-button type="primary" @click="openPointsMall" class="action-btn">
              <i class="el-icon-shopping-bag mr-1"></i> 前往积分商城
            </el-button>
            
            <el-button @click="expandRules = !expandRules" class="action-btn">
              <i class="el-icon-info mr-1"></i> 积分规则
            </el-button>
          </div>
        </div>
        
        <!-- 积分即将过期提醒 -->
        <div v-if="expiringPoints > 0" class="px-6 pb-6">
          <el-alert
            title="积分即将过期提醒"
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              您有 <strong class="text-red-500">{{ expiringPoints }}</strong> 积分将在 <strong class="text-red-500">{{ expiringDate }}</strong> 过期，请尽快使用
            </template>
          </el-alert>
        </div>
      </div>
      
      <!-- 推荐兑换商品 -->
      <div v-if="recommendProducts.length > 0" class="mb-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <i class="el-icon-shopping-bag mr-2 text-primary-500"></i>
            推荐兑换
          </h2>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              v-for="(product, index) in recommendProducts" 
              :key="index" 
              class="product-card rounded-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <div class="product-img aspect-w-1 aspect-h-1 bg-gray-100">
                <img :src="product.image" alt="商品图片" class="object-cover w-full h-full">
              </div>
              <div class="p-3">
                <div class="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{{ product.name }}</div>
                <div class="flex justify-between items-center">
                  <div class="text-primary-600 font-bold">{{ product.points }}积分</div>
                  <el-button type="primary" size="small" plain>兑换</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 积分规则 -->
      <transition name="fade">
        <div v-if="expandRules" class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-8">
          <div class="p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <i class="el-icon-info-filled mr-2 text-gray-500"></i>
              积分规则
            </h2>
            
            <div class="rules-content">
              <el-collapse accordion>
                <el-collapse-item title="如何获得积分" name="1">
                  <div class="p-3">
                    <div class="rule-item mb-2">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-primary-500 font-bold">1</div>
                        <div class="font-medium">每日签到</div>
                      </div>
                      <div class="ml-8 text-gray-500">每日签到可获得5积分，连续签到额外奖励</div>
                    </div>
                    
                    <div class="rule-item mb-2">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-primary-500 font-bold">2</div>
                        <div class="font-medium">购物消费</div>
                      </div>
                      <div class="ml-8 text-gray-500">购物消费金额的10%转化为积分（1元=1积分）</div>
                    </div>
                    
                    <div class="rule-item mb-2">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-primary-500 font-bold">3</div>
                        <div class="font-medium">评价商品</div>
                      </div>
                      <div class="ml-8 text-gray-500">评价商品奖励10积分，带图评价奖励20积分</div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-primary-500 font-bold">4</div>
                        <div class="font-medium">活动奖励</div>
                      </div>
                      <div class="ml-8 text-gray-500">参与平台活动可获得相应积分奖励</div>
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="积分使用方式" name="2">
                  <div class="p-3">
                    <div class="rule-item mb-2">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 text-green-500 font-bold">1</div>
                        <div class="font-medium">积分商城兑换</div>
                      </div>
                      <div class="ml-8 text-gray-500">在积分商城兑换各类商品和优惠券</div>
                    </div>
                    
                    <div class="rule-item mb-2">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 text-green-500 font-bold">2</div>
                        <div class="font-medium">下单抵现</div>
                      </div>
                      <div class="ml-8 text-gray-500">结算时可使用积分抵扣部分金额（100积分=1元）</div>
                    </div>
                    
                    <div class="rule-item">
                      <div class="flex items-center text-gray-700">
                        <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2 text-green-500 font-bold">3</div>
                        <div class="font-medium">会员等级提升</div>
                      </div>
                      <div class="ml-8 text-gray-500">积分累计可提升会员等级，享受更多特权</div>
                    </div>
                  </div>
                </el-collapse-item>
                
                <el-collapse-item title="积分有效期" name="3">
                  <div class="p-3">
                    <p class="text-gray-700 mb-2">积分有效期为获得之日起1年，过期积分将自动清零。</p>
                    <p class="text-gray-700 mb-2">系统会在积分过期前一个月发送提醒通知。</p>
                    <p class="text-gray-700">建议您及时使用即将过期的积分。</p>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </div>
      </transition>
      
      <!-- 积分记录 -->
      <div class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <i class="el-icon-document mr-2 text-gray-500"></i>
            积分明细
          </h2>
          
          <div class="filter-row mb-4 flex flex-wrap gap-4 items-center">
            <el-select v-model="recordType" placeholder="记录类型" class="w-32">
              <el-option label="全部" value="all"></el-option>
              <el-option label="获得" value="earn"></el-option>
              <el-option label="使用" value="use"></el-option>
            </el-select>
            
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            ></el-date-picker>
            
            <el-button type="primary" @click="searchRecords" class="ml-auto">
              <i class="el-icon-search mr-1"></i> 查询
            </el-button>
          </div>
          
          <!-- 积分记录表格 -->
          <el-table
            :data="pointsRecords"
            style="width: 100%"
            :empty-text="loading ? '加载中...' : '暂无积分记录'"
            v-loading="loading"
            row-class-name="points-record-row"
          >
            <el-table-column prop="time" label="时间" min-width="160">
              <template #default="scope">
                <span class="text-gray-600">{{ formatDate(scope.row.time) }}</span>
              </template>
            </el-table-column>
            
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <div 
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                  :class="scope.row.type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'"
                >
                  {{ scope.row.type === 'earn' ? '获得' : '使用' }}
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="description" label="描述" min-width="200">
              <template #default="scope">
                <div class="text-gray-700">{{ scope.row.description }}</div>
              </template>
            </el-table-column>
            
            <el-table-column prop="points" label="积分变动" width="120">
              <template #default="scope">
                <span 
                  class="font-medium" 
                  :class="scope.row.type === 'earn' ? 'text-green-600' : 'text-red-500'"
                >
                  {{ scope.row.type === 'earn' ? '+' : '-' }}{{ scope.row.points }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column prop="balance" label="积分余额" width="120">
              <template #default="scope">
                <span class="text-gray-700 font-medium">{{ scope.row.balance }}</span>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 分页 -->
          <div class="pagination-container mt-4 flex justify-center">
            <el-pagination
              v-model:current-page="currentPage"
              :page-sizes="[10, 20, 30, 50]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { formatDate } from '@/utils/date';
import { getUserPoints, getPointsRecords, signIn, checkSignIn } from '@/api/points';

const router = useRouter();

// 用户积分数据
const userPoints = ref(0);
const userLevel = ref('普通会员');
const pointsThisMonth = ref(0);
const totalPointsEarned = ref(0);
const totalPointsUsed = ref(0);
const expiringPoints = ref(0);
const expiringDate = ref('');

// 会员等级相关数据
const levelPoints = {
  '普通会员': 0,
  '银牌会员': 1000,
  '金牌会员': 5000,
  '钻石会员': 20000,
  '至尊会员': 50000
};

// 连续签到天数
const consecutiveDays = ref(0);

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

// 获取签到奖励
const getSignReward = (day) => {
  const rewards = {
    1: '+5积分',
    2: '+5积分',
    3: '+8积分',
    4: '+8积分',
    5: '+10积分',
    6: '+15积分',
    7: '+20积分'
  };
  
  return rewards[day] || '+5积分';
};

// 推荐兑换商品数据
const recommendProducts = ref([
  {
    name: '婴儿奶瓶保温套装',
    points: 2000,
    image: 'https://img.freepik.com/free-photo/collection-baby-care-items_23-2148615543.jpg?size=626&ext=jpg'
  },
  {
    name: '婴儿安抚玩具',
    points: 1500,
    image: 'https://img.freepik.com/free-photo/cute-plush-toys-arrangement_23-2150312242.jpg?size=626&ext=jpg'
  },
  {
    name: '儿童益智拼图',
    points: 1200,
    image: 'https://img.freepik.com/free-photo/closeup-child-playing-with-wooden-toys_23-2148518376.jpg?size=626&ext=jpg'
  },
  {
    name: '优惠券礼包',
    points: 800,
    image: 'https://img.freepik.com/free-photo/arrangement-black-friday-shopping-bags_23-2149047261.jpg?size=626&ext=jpg'
  }
]);

// 积分规则展开状态
const expandRules = ref(false);

// 签到状态
const alreadySignedIn = ref(false);
const signInLoading = ref(false);

// 积分记录筛选条件
const recordType = ref('all');
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);

// 积分记录数据
const pointsRecords = ref([]);

// 获取用户积分信息
const loadUserPoints = async () => {
  try {
    const res = await getUserPoints();
    if (res.code === 200 && res.data) {
      userPoints.value = res.data.points || 0;
      userLevel.value = res.data.userLevel || '普通会员';
      pointsThisMonth.value = res.data.pointsThisMonth || 0;
      totalPointsEarned.value = res.data.totalPointsEarned || 0;
      totalPointsUsed.value = res.data.totalPointsUsed || 0;
      expiringPoints.value = res.data.expiringPoints || 0;
      expiringDate.value = res.data.expiringDate || '';
      consecutiveDays.value = res.data.consecutiveDays || 0;
    }
  } catch (error) {
    console.error('获取用户积分信息失败:', error);
    ElMessage.error('获取积分信息失败，请稍后再试');
  }
};

// 获取签到状态
const checkSignInStatus = async () => {
  try {
    const res = await checkSignIn();
    if (res.code === 200) {
      alreadySignedIn.value = res.data.hasSignedToday || false;
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
      
      // 显示签到成功动画和提示
      ElMessage({
        message: `签到成功，获得${res.data.points || 5}积分`,
        type: 'success',
        duration: 3000
      });
      
      // 重新加载积分信息
      loadUserPoints();
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
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      type: recordType.value !== 'all' ? recordType.value : undefined,
      startDate: dateRange.value && dateRange.value[0] ? dateRange.value[0] : undefined,
      endDate: dateRange.value && dateRange.value[1] ? dateRange.value[1] : undefined
    };
    
    const res = await getPointsRecords(params);
    if (res.code === 200 && res.data) {
      pointsRecords.value = res.data.records || [];
      total.value = res.data.total || 0;
    }
  } catch (error) {
    console.error('获取积分记录失败:', error);
    ElMessage.error('获取积分记录失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 搜索积分记录
const searchRecords = () => {
  currentPage.value = 1;
  loadPointsRecords();
};

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadPointsRecords();
};

// 处理每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  loadPointsRecords();
};

// 前往积分商城
const openPointsMall = () => {
  router.push('/points-mall');
};

onMounted(() => {
  loadUserPoints();
  checkSignInStatus();
  loadPointsRecords();
});
</script>

<style src="../styles/Points.scss" scoped></style> 