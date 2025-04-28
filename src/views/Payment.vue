<template>
  <div class="payment-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              <i class="el-icon-wallet text-2xl"></i>
            </div>
            订单支付
          </h1>
          <p class="text-gray-500 mt-2">
            请选择支付方式完成订单
          </p>
        </motion-div>
        
        <!-- 订单流程步骤 -->
        <div class="mb-8">
          <el-steps :active="2" finish-status="success" simple>
            <el-step title="购物车" icon="el-icon-shopping-cart"></el-step>
            <el-step title="确认订单" icon="el-icon-tickets"></el-step>
            <el-step title="支付" icon="el-icon-wallet"></el-step>
            <el-step title="完成" icon="el-icon-circle-check"></el-step>
          </el-steps>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <!-- 订单信息 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-document mr-2 text-gray-500"></i>
                  订单信息
                </h2>
                
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">订单编号</span>
                    <span class="font-medium">{{ orderId }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">创建时间</span>
                    <span class="font-medium">{{ orderTime }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">收货人</span>
                    <span class="font-medium">{{ receiverInfo }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">订单金额</span>
                    <span class="font-bold text-red-500">¥{{ formatPrice(orderAmount) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 支付方式 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-wallet mr-2 text-gray-500"></i>
                  支付方式
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    v-for="method in paymentMethods" 
                    :key="method.id"
                    class="payment-method p-4 border rounded-lg cursor-pointer transition-all"
                    :class="{'border-primary-500 bg-primary-50': method.id === selectedPaymentMethod, 'border-gray-200 hover:border-primary-300': method.id !== selectedPaymentMethod}"
                    @click="selectPaymentMethod(method.id)"
                  >
                    <div class="flex items-center">
                      <el-radio v-model="selectedPaymentMethod" :label="method.id" class="mr-2"></el-radio>
                      <div class="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-50 mr-3">
                        <i :class="method.icon" class="text-2xl" :style="{ color: method.color }"></i>
                      </div>
                      <div>
                        <div class="font-medium">{{ method.name }}</div>
                        <div class="text-gray-500 text-xs">{{ method.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 钱包支付 -->
            <div v-if="selectedPaymentMethod === 'wallet' && showPaymentForm" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-money mr-2 text-gray-500"></i>
                  钱包支付
                </h2>
                
                <div class="wallet-payment-form">
                  <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-4">
                    <div class="text-gray-700">账户余额</div>
                    <div class="text-xl font-bold text-primary-500">¥{{ formatPrice(walletBalance) }}</div>
                  </div>
                  
                  <div v-if="walletBalance >= orderAmount" class="text-center">
                    <p class="mb-4 text-gray-600">本次支付将从您的钱包余额中扣除 <span class="text-primary-500 font-bold">¥{{ formatPrice(orderAmount) }}</span></p>
                    <el-button 
                      type="primary" 
                      size="large" 
                      class="w-60"
                      @click="simulateWalletPayment"
                    >
                      确认支付
                    </el-button>
                  </div>
                  
                  <div v-else class="text-center">
                    <p class="mb-4 text-red-500">您的钱包余额不足，请先充值或选择其他支付方式</p>
                    <div class="flex justify-center gap-4">
                      <el-button type="primary">去充值</el-button>
                      <el-button @click="selectedPaymentMethod = 'alipay'">选择其他支付方式</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 支付二维码 -->
            <div v-if="(selectedPaymentMethod === 'alipay' || selectedPaymentMethod === 'wechat') && showQRCode" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-mobile mr-2 text-gray-500"></i>
                  扫码支付
                </h2>
                
                <div class="flex flex-col items-center justify-center">
                  <div class="qrcode-wrapper p-4 border rounded-lg bg-white mb-4 relative">
                    <div v-if="qrcodeLoading" class="flex justify-center items-center h-60 w-60">
                      <el-skeleton-item variant="image" style="width: 240px; height: 240px" />
                    </div>
                    <img v-else :src="getQRCodeForPayment()" alt="支付二维码" class="w-60 h-60">
                    
                    <transition name="fade">
                      <div v-if="paymentStatus === 'success'" class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                        <div class="text-center">
                          <div class="success-icon w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="el-icon-check text-3xl text-white"></i>
                          </div>
                          <div class="text-green-500 font-bold text-lg">支付成功</div>
                        </div>
                      </div>
                    </transition>
                  </div>
                  
                  <p class="text-center text-gray-500 mb-4">请使用{{ getSelectedPaymentMethodName() }}扫描二维码完成支付</p>
                  
                  <div class="text-center text-xs bg-primary-50 text-primary-700 p-2 rounded-lg mb-4 max-w-sm">
                    <p><strong>沙箱环境提示：</strong> 这是测试环境，请使用{{ selectedPaymentMethod === 'alipay' ? '支付宝' : '微信' }}沙箱app扫码，无需真实支付</p>
                  </div>
                  
                  <div class="countdown text-center">
                    <div class="text-gray-500 mb-2">支付二维码有效期</div>
                    <div class="text-2xl font-bold text-red-500">{{ formatCountdown() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 支付状态和操作 -->
          <div class="lg:col-span-1">
            <motion-div
              :initial="{ opacity: 0, x: 20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.5, delay: 0.2 }"
            >
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <h2 class="text-xl font-bold text-gray-800 mb-4">支付状态</h2>
                
                <div class="flex items-center mb-6">
                  <div 
                    class="w-16 h-16 rounded-full flex items-center justify-center mr-4"
                    :class="{
                      'bg-blue-100': paymentStatus === 'pending',
                      'bg-green-100': paymentStatus === 'success',
                      'bg-red-100': paymentStatus === 'failed'
                    }"
                  >
                    <i 
                      class="text-3xl"
                      :class="{
                        'el-icon-loading text-blue-500': paymentStatus === 'pending',
                        'el-icon-check text-green-500': paymentStatus === 'success',
                        'el-icon-close text-red-500': paymentStatus === 'failed'
                      }"
                    ></i>
                  </div>
                  
                  <div>
                    <div class="font-bold text-lg" :class="{
                      'text-blue-500': paymentStatus === 'pending',
                      'text-green-500': paymentStatus === 'success',
                      'text-red-500': paymentStatus === 'failed'
                    }">
                      {{ getPaymentStatusText() }}
                    </div>
                    <div class="text-gray-500 text-sm">{{ getPaymentStatusDescription() }}</div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-gray-500">应付金额</span>
                    <span class="font-medium text-red-500">¥{{ formatPrice(orderAmount) }}</span>
                  </div>
                </div>
                
                <el-button 
                  v-if="paymentStatus === 'pending'"
                  type="primary" 
                  class="w-full mt-6 h-12 text-base rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                  @click="simulatePayment"
                >
                  {{ showQRCode ? '已完成支付' : '立即支付' }}
                </el-button>
                
                <el-button 
                  v-if="paymentStatus === 'success'"
                  type="success" 
                  class="w-full mt-6 h-12 text-base rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                  @click="goToOrderDetail"
                >
                  查看订单 <i class="el-icon-right ml-1"></i>
                </el-button>
                
                <el-button 
                  v-if="paymentStatus === 'failed'"
                  type="danger" 
                  class="w-full mt-6 h-12 text-base rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                  @click="retryPayment"
                >
                  重新支付
                </el-button>
                
                <div class="mt-4 text-center">
                  <el-button 
                    link 
                    class="text-sm text-gray-500"
                    @click="goBack"
                  >
                    返回订单页面
                    <i class="el-icon-back ml-1"></i>
                  </el-button>
                </div>
              </div>
            </motion-div>
            
            <!-- 支付帮助 -->
            <div class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="el-icon-question mr-2 text-gray-500"></i>
                支付遇到问题?
              </h3>
              
              <div class="text-sm text-gray-600 space-y-2">
                <p><i class="el-icon-warning-outline mr-1 text-yellow-500"></i> 订单支付后，可在"我的订单"中查看</p>
                <p><i class="el-icon-warning-outline mr-1 text-yellow-500"></i> 如遇到支付问题，可联系在线客服</p>
                <p><i class="el-icon-warning-outline mr-1 text-yellow-500"></i> 支付成功后未跳转，请刷新页面</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useOrderStore } from '@/stores/order';

const router = useRouter();
const route = useRoute();
const orderStore = useOrderStore();

// 订单ID
const orderId = ref(route.query.order_id || 'ORD123456789');

// 订单金额
const orderAmount = ref(parseFloat(route.query.amount) || 149.70);

// 创建时间
const orderTime = ref(new Date().toLocaleString());

// 收货人信息
const receiverInfo = ref('张三 (13800138000)');

// 支付相关状态
const paymentStatus = ref('pending'); // pending, success, failed
const selectedPaymentMethod = ref('alipay'); // alipay, wechat, wallet
const paymentMethods = ref([
  { 
    id: 'alipay', 
    name: '支付宝支付', 
    icon: 'el-icon-wallet', 
    color: '#1677FF',
    description: '使用支付宝扫码支付(沙箱环境)' 
  },
  { 
    id: 'wechat', 
    name: '微信支付', 
    icon: 'el-icon-chat-dot-round', 
    color: '#07C160',
    description: '使用微信扫码支付(沙箱环境)' 
  },
  { 
    id: 'wallet', 
    name: '钱包支付', 
    icon: 'el-icon-money', 
    color: '#FF9900',
    description: '使用账户余额支付' 
  }
]);

// 钱包余额
const walletBalance = ref(500.00);

// 二维码相关
const showQRCode = ref(false);
const qrcodeLoading = ref(false);
const countdownTime = ref(900); // 15分钟倒计时（秒）
let countdownTimer = null;

// 钱包支付表单
const showPaymentForm = ref(false);

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId;
  showQRCode.value = false;
  showPaymentForm.value = false;
};

// 获取选中的支付方式名称
const getSelectedPaymentMethodName = () => {
  const method = paymentMethods.value.find(m => m.id === selectedPaymentMethod.value);
  return method ? method.name : '';
};

// 获取支付状态文本
const getPaymentStatusText = () => {
  switch (paymentStatus.value) {
    case 'pending':
      return '等待支付';
    case 'success':
      return '支付成功';
    case 'failed':
      return '支付失败';
    default:
      return '未知状态';
  }
};

// 获取支付状态描述
const getPaymentStatusDescription = () => {
  switch (paymentStatus.value) {
    case 'pending':
      return '请选择支付方式完成支付';
    case 'success':
      return '您的订单已支付成功，感谢您的购买';
    case 'failed':
      return '支付失败，请重新尝试或选择其他支付方式';
    default:
      return '';
  }
};

// 格式化价格
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// 格式化倒计时
const formatCountdown = () => {
  const minutes = Math.floor(countdownTime.value / 60);
  const seconds = countdownTime.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 获取支付二维码
const getQRCodeForPayment = () => {
  // 根据支付方式返回不同的二维码
  if (selectedPaymentMethod.value === 'alipay') {
    return '/images/alipay_sandbox_qrcode.png';
  } else if (selectedPaymentMethod.value === 'wechat') {
    return '/images/wechat_sandbox_qrcode.png';
  }
  return '';
};

// 开始倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value -= 1;
    } else {
      // 二维码过期
      clearInterval(countdownTimer);
      // 这里可以处理二维码过期逻辑
      ElMessage.warning('支付二维码已过期，请重新获取');
      showQRCode.value = false;
    }
  }, 1000);
};

// 模拟支付
const simulatePayment = async () => {
  if (selectedPaymentMethod.value === 'wallet') {
    // 钱包支付
    showPaymentForm.value = true;
  } else {
    // 二维码支付（支付宝或微信）
    qrcodeLoading.value = true;
    showQRCode.value = true;
    
    // 模拟加载二维码
    setTimeout(() => {
      qrcodeLoading.value = false;
      // 重新开始倒计时
      countdownTime.value = 900;
      startCountdown();
    }, 1000);
  }
};

// 模拟钱包支付
const simulateWalletPayment = async () => {
  try {
    // 模拟支付API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新钱包余额
    walletBalance.value -= orderAmount.value;
    
    // 更新支付状态
    paymentStatus.value = 'success';
    
    // 提示用户
    ElMessage.success('钱包支付成功！');
    
    // 更新订单状态
    // 在实际应用中，这里应该调用 orderStore.payOrder() 来更新订单状态
    
    // 3秒后跳转到订单详情页
    setTimeout(() => {
      goToOrderDetail();
    }, 3000);
  } catch (error) {
    console.error('钱包支付失败:', error);
    paymentStatus.value = 'failed';
    ElMessage.error('支付失败，请稍后重试');
  }
};

// 跳转到订单详情
const goToOrderDetail = () => {
  router.push(`/orders?id=${orderId.value}`);
};

// 生命周期
onMounted(() => {
  // 如果URL中有order_id参数，获取该订单详情
  if (route.query.order_id) {
    // 在实际应用中，应该调用 orderStore.fetchOrderDetail(route.query.order_id)
    // 这里使用模拟数据
  }
});

onBeforeUnmount(() => {
  // 清除倒计时
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
.payment-page {
  padding-bottom: 2rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.countdown {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style> 