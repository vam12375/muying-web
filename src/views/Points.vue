<template>
  <div class="point-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <main-layout>
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
        
        <!-- 积分卡片 -->
        <div class="points-card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
            <div class="flex justify-between items-center">
              <div>
                <div class="text-sm font-medium opacity-90 mb-2">当前积分</div>
                <div class="text-4xl font-bold">{{ userPoints }}</div>
              </div>
              
              <div class="text-right">
                <div class="text-sm font-medium opacity-90 mb-2">会员等级</div>
                <div class="inline-block px-3 py-1 rounded-full bg-white/20 text-white font-medium">
                  <span v-if="userLevel === '银牌会员'">🥈</span>
                  <span v-else-if="userLevel === '金牌会员'">🥇</span>
                  <span v-else-if="userLevel === '钻石会员'">💎</span>
                  <span v-else-if="userLevel === '至尊会员'">🌟</span>
                  {{ userLevel }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="stat-card p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div class="text-sm text-gray-500 mb-2">本月获得</div>
                <div class="text-2xl font-bold text-primary-600">{{ pointsThisMonth }}</div>
              </div>
              
              <div class="stat-card p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div class="text-sm text-gray-500 mb-2">累计获得</div>
                <div class="text-2xl font-bold text-green-600">{{ totalPointsEarned }}</div>
              </div>
              
              <div class="stat-card p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div class="text-sm text-gray-500 mb-2">累计使用</div>
                <div class="text-2xl font-bold text-orange-500">{{ totalPointsUsed }}</div>
              </div>
            </div>
            
            <div class="mt-6 flex flex-wrap gap-4 justify-center">
              <el-button type="primary" @click="openPointsMall" class="action-btn">
                <i class="el-icon-shopping-bag mr-1"></i> 前往积分商城
              </el-button>
              
              <el-button @click="handleSignIn" :disabled="alreadySignedIn" class="action-btn">
                <i class="el-icon-calendar mr-1"></i> {{ alreadySignedIn ? '今日已签到' : '每日签到' }}
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
        
        <!-- 积分规则 -->
        <transition name="fade">
          <div v-if="expandRules" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
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
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            >
              <el-table-column prop="time" label="时间" min-width="160">
                <template #default="scope">
                  <span>{{ formatDate(scope.row.time) }}</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
              
              <el-table-column prop="points" label="积分变动" width="120">
                <template #default="scope">
                  <span :class="scope.row.type === 'earn' ? 'text-green-600' : 'text-red-500'">
                    {{ scope.row.type === 'earn' ? '+' : '-' }}{{ scope.row.points }}
                  </span>
                </template>
              </el-table-column>
              
              <el-table-column prop="balance" label="积分余额" width="120"></el-table-column>
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
    </main-layout>
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
      ElMessage.success(`签到成功，获得${res.data.points || 5}积分`);
      loadUserPoints(); // 重新加载积分信息
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

<style scoped>
.point-page {
  min-height: 100vh;
}

.action-btn {
  transition: transform 0.2s;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 