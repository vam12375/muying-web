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
            
            <!-- 支付二维码 -->
            <div v-if="showQRCode" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-mobile mr-2 text-gray-500"></i>
                  扫码支付
                </h2>
                
                <div class="flex flex-col items-center justify-center">
                  <div class="qrcode-wrapper p-4 border rounded-lg bg-white mb-4 relative">
                    <img :src="getQRCodeForPayment()" alt="支付二维码" class="w-60 h-60">
                    
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
                    type="text" 
                    class="text-sm text-gray-500"
                    @click="cancelPayment"
                  >
                    取消支付
                    <i class="el-icon-close ml-1"></i>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();

// 订单ID
const orderId = ref(route.query.order_id || '123456789');

// 订单信息
const orderAmount = ref(149.8);
const orderTime = ref('2023-12-01 12:30:45');
const receiverInfo = ref('张三 (13800138000)');

// 支付方式列表
const paymentMethods = ref([
  {
    id: 1,
    name: '微信支付',
    description: '使用微信扫码支付',
    icon: 'el-icon-chat-dot-round',
    color: '#09BB07'
  },
  {
    id: 2,
    name: '支付宝',
    description: '使用支付宝扫码支付',
    icon: 'el-icon-wallet',
    color: '#1677FF'
  },
  {
    id: 3,
    name: '银联支付',
    description: '使用银联卡支付',
    icon: 'el-icon-credit-card',
    color: '#E8242C'
  },
  {
    id: 4,
    name: '货到付款',
    description: '收到商品后现金支付',
    icon: 'el-icon-box',
    color: '#FF9900'
  }
]);

// 选中的支付方式
const selectedPaymentMethod = ref(1);

// 支付状态：pending(待支付)，success(支付成功)，failed(支付失败)
const paymentStatus = ref('pending');

// 是否显示支付二维码
const showQRCode = ref(false);

// 支付倒计时（15分钟）
const countdownSeconds = ref(15 * 60);
let countdownTimer = null;

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId;
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
      return showQRCode.value ? '请扫描二维码完成支付' : '请选择支付方式';
    case 'success':
      return '您的订单已支付成功，感谢购买！';
    case 'failed':
      return '支付遇到问题，请重试或选择其他支付方式';
    default:
      return '';
  }
};

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 根据选择的支付方式获取对应的二维码
const getQRCodeForPayment = () => {
  // 在实际应用中，这里应该根据选择的支付方式和订单信息从后端获取真实的支付二维码
  // 这里使用假图片URL作为示例
  switch (selectedPaymentMethod.value) {
    case 1: // 微信支付
      return 'https://example.com/wechat_qrcode.png';
    case 2: // 支付宝
      return 'https://example.com/alipay_qrcode.png';
    default:
      return 'https://example.com/payment_qrcode.png';
  }
};

// 格式化倒计时显示
const formatCountdown = () => {
  const minutes = Math.floor(countdownSeconds.value / 60);
  const seconds = countdownSeconds.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 开始倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      clearInterval(countdownTimer);
      // 支付超时
      if (paymentStatus.value === 'pending') {
        paymentStatus.value = 'failed';
        ElMessage.error('支付超时，请重新支付');
      }
    }
  }, 1000);
};

// 显示支付二维码
const showPaymentQRCode = () => {
  showQRCode.value = true;
  startCountdown();
};

// 模拟支付流程
const simulatePayment = () => {
  if (showQRCode.value) {
    // 如果已经显示二维码，则模拟支付成功
    ElMessage.success('支付处理中...');
    
    setTimeout(() => {
      paymentStatus.value = 'success';
      clearInterval(countdownTimer);
      
      setTimeout(() => {
        ElMessageBox.confirm('支付成功，是否查看订单详情？', '支付完成', {
          confirmButtonText: '查看订单',
          cancelButtonText: '继续购物',
          type: 'success'
        }).then(() => {
          goToOrderDetail();
        }).catch(() => {
          router.push('/');
        });
      }, 1500);
    }, 2000);
  } else {
    // 如果还没显示二维码，则显示二维码
    showPaymentQRCode();
  }
};

// 重试支付
const retryPayment = () => {
  paymentStatus.value = 'pending';
  showQRCode.value = false;
  countdownSeconds.value = 15 * 60;
};

// 取消支付
const cancelPayment = () => {
  ElMessageBox.confirm('确定要取消支付吗？未支付的订单将在24小时后自动关闭', '取消支付', {
    confirmButtonText: '确定',
    cancelButtonText: '继续支付',
    type: 'warning'
  }).then(() => {
    ElMessage.info('您已取消支付');
    router.push('/orders');
  }).catch(() => {
    // 用户选择继续支付，不做任何操作
  });
};

// 跳转到订单详情
const goToOrderDetail = () => {
  router.push(`/orders?id=${orderId.value}`);
};

// 组件挂载时初始化
onMounted(() => {
  // 获取URL中的订单ID参数
  if (route.query.order_id) {
    orderId.value = route.query.order_id;
  }
  
  // 在实际应用中，这里应该根据订单ID从后端获取订单详情
});

// 组件卸载前清理定时器
onBeforeUnmount(() => {
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