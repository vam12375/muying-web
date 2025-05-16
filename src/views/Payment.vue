<template>
  <div class="payment-page">
    <!-- 背景效果 -->
    <BackgroundEffect :theme="backgroundTheme" :intensity="1.0" />
    
    <!-- 滚动指示器 -->
    <div class="scroll-indicator" :style="{ width: `${pageScrollProgress}%` }"></div>
    
    <!-- 主内容区域 -->
    <div class="container mx-auto py-10 px-4 page-content" ref="pageContent">
      <!-- 标题和步骤条 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
          <span class="text-primary-500">订单支付</span>
        </h1>
        <div class="mb-10 steps-container">
          <el-steps :active="2" finish-status="success" simple>
            <el-step>
              <template #icon>
                <div class="step-icon bg-gray-300">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
              </template>
              <template #title>
                <span class="step-title">购物车</span>
              </template>
            </el-step>
            
            <el-step>
              <template #icon>
                <div class="step-icon bg-gray-300">
                  <el-icon><Document /></el-icon>
                </div>
              </template>
              <template #title>
                <span class="step-title">确认订单</span>
              </template>
            </el-step>
            
            <el-step>
              <template #icon>
                <div class="step-icon bg-primary-500" style="animation: pulse 2s infinite;">
                  <el-icon><Wallet /></el-icon>
                </div>
              </template>
              <template #title>
                <span class="step-title font-bold text-primary-500">支付</span>
              </template>
            </el-step>
            
            <el-step>
              <template #icon>
                <div class="step-icon bg-gray-300">
                  <el-icon><CheckIcon /></el-icon>
                </div>
              </template>
              <template #title>
                <span class="step-title">完成</span>
              </template>
            </el-step>
          </el-steps>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-6">
            <!-- 订单信息骨架屏 -->
            <AnimatedCard :elevation="2" :interactive="false">
              <div class="card-header">
                <h2 class="text-xl font-bold text-gray-800">
                  <i class="el-icon-document"></i>
                  订单信息
                </h2>
              </div>
              <div class="card-content">
                <div class="space-y-4">
                  <el-skeleton animated class="loading-skeleton">
                    <template #template>
                      <div class="flex justify-between mb-4">
                        <el-skeleton-item variant="text" style="width: 30%" />
                        <el-skeleton-item variant="text" style="width: 30%" />
                      </div>
                      <div class="flex justify-between mb-4">
                        <el-skeleton-item variant="text" style="width: 30%" />
                        <el-skeleton-item variant="text" style="width: 30%" />
                      </div>
                      <div class="flex justify-between mb-4">
                        <el-skeleton-item variant="text" style="width: 30%" />
                        <el-skeleton-item variant="text" style="width: 30%" />
                      </div>
                      <div class="flex justify-between">
                        <el-skeleton-item variant="text" style="width: 30%" />
                        <el-skeleton-item variant="text" style="width: 30%" />
                      </div>
                    </template>
                  </el-skeleton>
                </div>
              </div>
            </AnimatedCard>
            
            <!-- 支付方式骨架屏 -->
            <AnimatedCard :elevation="2" :interactive="false">
              <div class="card-header">
                <h2 class="text-xl font-bold text-gray-800">
                  <i class="el-icon-wallet"></i>
                  支付方式
                </h2>
              </div>
              <div class="card-content">
                <el-skeleton animated class="loading-skeleton">
                  <template #template>
                    <div class="space-y-4">
                      <el-skeleton-item variant="p" style="width: 100%; height: 60px" />
                      <el-skeleton-item variant="p" style="width: 100%; height: 60px" />
                      <el-skeleton-item variant="p" style="width: 100%; height: 60px" />
                    </div>
                  </template>
                </el-skeleton>
              </div>
            </AnimatedCard>
          </div>
          
          <!-- 状态卡片骨架屏 -->
          <div class="lg:col-span-1">
            <AnimatedCard :elevation="3" :interactive="false">
              <div class="p-6">
                <el-skeleton-item variant="h1" style="width: 50%" />
                <div class="flex mt-6 mb-6">
                  <el-skeleton-item variant="circle" style="width: 60px; height: 60px; margin-right: 16px" />
                  <div>
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 70%" />
                  </div>
                </div>
                <el-skeleton-item variant="p" style="width: 100%" />
                <el-skeleton-item variant="p" style="width: 100%; height: 40px; margin-top: 20px" />
              </div>
            </AnimatedCard>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 animate__animated animate__fadeIn">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="el-icon-warning text-red-500"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- 主内容区域 -->
      <div v-show="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左侧内容区域 -->
        <div class="lg:col-span-2">
          <!-- 订单信息卡片 -->
          <AnimatedCard 
            :elevation="2" 
            :interactive="false" 
            class="mb-6"
            ref="orderInfoCard"
          >
            <div class="card-header">
              <h2 class="text-xl font-bold text-gray-800">
                <i class="el-icon-document"></i>
                订单信息
              </h2>
            </div>
            <div class="card-content">
              <div class="order-info-container">
                <div class="info-row">
                  <div class="label"><i class="el-icon-document"></i>订单编号</div>
                  <div class="value">{{ orderNo || orderId }}</div>
                </div>
                
                <div class="info-row">
                  <div class="label"><i class="el-icon-time"></i>创建时间</div>
                  <div class="value">{{ orderTime }}</div>
                </div>
                
                <div class="info-row">
                  <div class="label"><i class="el-icon-user"></i>收货人</div>
                  <div class="value">{{ receiverInfo }}</div>
                </div>
                
                <div class="info-row">
                  <div class="label"><i class="el-icon-price-tag"></i>订单金额</div>
                  <div class="value highlight">¥{{ formatPrice(orderAmount) }}</div>
                </div>
              </div>
            </div>
          </AnimatedCard>
          
          <!-- 支付状态 (显示在支付方式上方，如果支付已开始) -->
          <div v-if="paymentStatus !== 'pending'" class="card-container animate__animated animate__fadeInUp status-card" style="animation-delay: 0.1s">
            <div class="card-content status-content">
              <div :class="['payment-status', paymentStatus]">
                <div class="status-icon">
                  <i v-if="paymentStatus === 'processing'" class="el-icon-loading"></i>
                  <i v-else-if="paymentStatus === 'success'" class="el-icon-check"></i>
                  <i v-else-if="paymentStatus === 'failed'" class="el-icon-close"></i>
                </div>
                <div class="status-info">
                  <h3 class="status-title">{{ getPaymentStatusText() }}</h3>
                  <p class="status-description">{{ getPaymentStatusDescription() }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 支付方式选择 (仅在待支付状态显示) -->
          <AnimatedCard 
            :elevation="2" 
            :interactive="false" 
            class="mb-6 relative min-h-[300px]"
            ref="paymentMethodsCard"
          >
            <transition name="payment-card" mode="out-in">
              <div :key="getActiveCardType">
                <!-- 支付方式选择 (仅在待支付状态显示) -->
                <div v-if="getActiveCardType === 'method'" class="payment-selection-card">
                  <div class="card-header">
                    <h2 class="text-xl font-bold text-gray-800">
                      <i class="el-icon-wallet"></i>
                      选择支付方式
                    </h2>
                  </div>
                  <div class="card-content">
                    <PaymentMethodSelector
                      :methods="paymentMethods"
                      v-model="selectedPaymentMethod"
                      @update:model-value="handlePaymentMethodChange"
                    />
                    
                    <div class="mt-6 text-center">
                      <el-button 
                        type="primary" 
                        size="large" 
                        class="payment-button"
                        @click="simulatePayment"
                      >
                        立即支付 ¥{{ formatPrice(orderAmount) }}
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <!-- 钱包支付表单 -->
                <div v-else-if="getActiveCardType === 'wallet'" class="wallet-payment-card">
                  <div class="card-header">
                    <h2 class="text-xl font-bold text-gray-800">
                      <i class="el-icon-money"></i>
                      钱包支付
                    </h2>
                  </div>
                  <div class="card-content">
                    <div class="wallet-payment-form">
                      <div class="balance-display">
                        <div class="text-gray-700">账户余额</div>
                        <div class="balance-amount">{{ formatPrice(walletBalance) }}</div>
                      </div>
                      
                      <div v-if="walletBalance >= orderAmount" class="text-center">
                        <p class="mb-4 text-gray-600">本次支付将从您的钱包余额中扣除 
                          <span class="text-primary-500 font-bold">¥{{ formatPrice(orderAmount) }}</span>
                        </p>
                        <el-button 
                          type="primary" 
                          size="large" 
                          class="w-60 payment-button"
                          @click="simulateWalletPayment"
                          :loading="paymentStatus === 'processing'"
                        >
                          确认支付
                        </el-button>
                      </div>
                      
                      <div v-else class="text-center">
                        <p class="mb-4 text-red-500">您的钱包余额不足，请先充值或选择其他支付方式</p>
                        <div class="flex justify-center gap-4">
                          <el-button type="primary" class="payment-button">去充值</el-button>
                          <el-button @click="selectedPaymentMethod = 'alipay'">选择其他支付方式</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 二维码支付 -->
                <div v-else-if="getActiveCardType === 'qrcode'" class="qrcode-payment-card">
                  <div class="card-header">
                    <h2 class="text-xl font-bold text-gray-800">
                      <i class="el-icon-mobile"></i>
                      扫码支付
                    </h2>
                  </div>
                  <div class="card-content">
                    <QRCodeAnimated
                      :qrcode-url="getQRCodeForPayment()"
                      :loading="qrcodeLoading"
                      :payment-type="selectedPaymentMethod"
                      :success="paymentStatus === 'success'"
                      :countdown="countdownTime"
                      :show-countdown="true"
                      @countdown-end="paymentStatus = 'failed'"
                    />
                    
                    <div class="sandbox-notice">
                      <p><strong>沙箱环境提示：</strong> 这是测试环境，请使用
                        {{ selectedPaymentMethod === 'alipay' ? '支付宝' : '微信' }}沙箱app扫码，无需真实支付
                      </p>
                    </div>
                  </div>
                </div>
                
                <!-- 支付处理中 -->
                <div v-else-if="getActiveCardType === 'processing'" class="processing-payment-card">
                  <ProcessingAnimation
                    status="processing"
                    :progress="35"
                    estimated-time="约1-2分钟"
                  />
                </div>
                
                <!-- 支付成功 -->
                <div v-else-if="getActiveCardType === 'success'" class="success-payment-card">
                  <SuccessAnimation
                    :completed="paymentSuccessCompleted"
                    :order-no="orderNo || orderId"
                    :amount="orderAmount"
                    main-action-text="查看订单"
                    secondary-action-text="继续购物"
                    @main-action="goToOrderDetail"
                    @secondary-action="goBack"
                  />
                </div>
                
                <!-- 支付宝表单容器 (仅在有alipayForm时显示) -->
                <div v-else-if="alipayForm" class="alipay-form-card">
                  <div class="card-header">
                    <h2 class="text-xl font-bold text-gray-800">
                      <i class="el-icon-loading"></i>
                      正在跳转到支付宝...
                    </h2>
                  </div>
                  <div class="card-content">
                    <div class="alipay-form-container">
                      <p class="text-center text-gray-600 mb-4">如果没有自动跳转，请检查浏览器设置或手动点击提交按钮。</p>
                      <div class="text-center" v-html="alipayForm"></div>
                    </div>
                  </div>
                </div>
                
                <!-- 默认占位符（如果需要） -->
                <div v-else class="empty-payment-card">
                  <div class="card-content">
                    <p class="text-center text-gray-400">加载中...</p>
                  </div>
                </div>
              </div>
            </transition>
          </AnimatedCard>
        </div>
        
        <!-- 右侧状态区域 -->
        <div class="lg:col-span-1">
          <!-- 支付状态和操作卡片 -->
          <AnimatedCard
            :elevation="3"
            :active="true"
            :interactive="false"
            ref="orderStatusCard"
          >
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">订单状态</h2>
              
              <!-- Status display -->
              <div class="flex items-center mb-6">
                <div 
                  class="status-icon"
                  :class="{
                    'pending': paymentStatus === 'pending',
                    'processing': paymentStatus === 'processing',
                    'success': paymentStatus === 'success',
                    'failed': paymentStatus === 'failed'
                  }"
                >
                  <i 
                    class="text-3xl"
                    :class="{
                      'el-icon-time': paymentStatus === 'pending',
                      'el-icon-loading': paymentStatus === 'processing',
                      'el-icon-check': paymentStatus === 'success',
                      'el-icon-close': paymentStatus === 'failed'
                    }"
                  ></i>
                </div>
                
                <div>
                  <div class="font-bold text-lg" :class="{
                    'text-orange-500': paymentStatus === 'pending',
                    'text-blue-500': paymentStatus === 'processing',
                    'text-green-500': paymentStatus === 'success',
                    'text-red-500': paymentStatus === 'failed'
                  }">
                    {{ getPaymentStatusText() }}
                  </div>
                  <div class="text-gray-500 text-sm">{{ getPaymentStatusDescription() }}</div>
                </div>
              </div>
              
              <!-- Amount display -->
              <div class="mb-6">
                <div class="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">应付金额</span>
                    <span class="font-bold text-xl text-primary-500">¥{{ formatPrice(orderAmount) }}</span>
                  </div>
                </div>
              </div>
              
              <!-- 倒计时显示 -->
              <div v-if="showQRCode && countdownTime > 0" class="mb-6">
                <div class="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">二维码有效期</span>
                    <span class="font-bold text-lg" :class="{
                      'text-orange-500': countdownTime < 60,
                      'text-red-500': countdownTime < 30,
                      'text-blue-500': countdownTime >= 60
                    }">{{ formatCountdown() }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="space-y-4">
                <el-button 
                  v-if="paymentStatus === 'pending' && !showQRCode && !showPaymentForm && !alipayForm"
                  type="primary" 
                  class="action-button primary w-full"
                  size="large"
                  @click="simulatePayment"
                  :loading="loading"
                >
                 立即支付
                </el-button>
  
                <el-button 
                  v-if="paymentStatus === 'pending' && showQRCode"
                  type="success" 
                  class="action-button success w-full"
                  size="large"
                  @click="simulatePayment"
                >
                 已完成支付
                </el-button>
                
                <el-button 
                  v-if="paymentStatus === 'success'"
                  type="success" 
                  class="action-button success w-full"
                  size="large"
                  @click="goToOrderDetail"
                >
                  查看订单 <i class="el-icon-right ml-1"></i>
                </el-button>
                
                <el-button 
                  v-if="paymentStatus === 'failed'"
                  type="danger" 
                  class="action-button danger w-full"
                  size="large"
                  @click="retryPayment"
                >
                  重新支付
                </el-button>
                
                <!-- Go back button -->
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
            </div>
          </AnimatedCard>
          
          <!-- 支付帮助卡片 -->
          <AnimatedCard
            :elevation="2"
            :interactive="false"
            class="mt-6"
          >
            <div class="p-6">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <i class="el-icon-question mr-2 text-primary-500"></i>
                支付遇到问题?
              </h3>
              
              <div class="space-y-4">
                <div class="flex items-start">
                  <div class="help-icon">
                    <i class="el-icon-warning-outline text-orange-400"></i>
                  </div>
                  <span class="text-gray-600 text-sm">订单支付后，可在"我的订单"中查看</span>
                </div>
                
                <div class="flex items-start">
                  <div class="help-icon">
                    <i class="el-icon-warning-outline text-orange-400"></i>
                  </div>
                  <span class="text-gray-600 text-sm">如遇到支付问题，可联系在线客服</span>
                </div>
                
                <div class="flex items-start">
                  <div class="help-icon">
                    <i class="el-icon-warning-outline text-orange-400"></i>
                  </div>
                  <span class="text-gray-600 text-sm">支付成功后未跳转，请刷新页面</span>
                </div>
              </div>
              
              <div class="mt-6 border-t border-gray-100 pt-4">
                <div class="flex justify-between items-center">
                  <span class="text-gray-500 text-xs">客服热线</span>
                  <span class="text-primary-500 font-bold">400-000-0000</span>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, defineAsyncComponent } from 'vue';
import { Search, ShoppingCart, Document, Wallet, Check as CheckIcon } from '@element-plus/icons-vue';
import usePayment from '@/scripts/Payment';
import { gsap } from 'gsap';
import { useMotion } from '@vueuse/motion';

// 异步加载组件以提高性能
const AnimatedCard = defineAsyncComponent(() => import('@/components/payment/AnimatedCard.vue'));
const PaymentMethodSelector = defineAsyncComponent(() => import('@/components/payment/PaymentMethodSelector.vue'));
const QRCodeAnimated = defineAsyncComponent(() => import('@/components/payment/QRCodeAnimated.vue'));
const ProcessingAnimation = defineAsyncComponent(() => import('@/components/payment/ProcessingAnimation.vue'));
const SuccessAnimation = defineAsyncComponent(() => import('@/components/payment/SuccessAnimation.vue'));
const BackgroundEffect = defineAsyncComponent(() => import('@/components/payment/BackgroundEffect.vue'));

// 从usePayment钩子获取状态和方法
const {
  // 状态
  loading,
  error,
  orderId,
  orderNo,
  orderAmount,
  orderTime,
  receiverInfo,
  orderData,
  paymentStatus,
  selectedPaymentMethod,
  paymentMethods,
  walletBalance,
  showQRCode,
  qrcodeLoading,
  countdownTime,
  showPaymentForm,
  alipayForm,
  
  // 方法
  selectPaymentMethod,
  getSelectedPaymentMethodName,
  getPaymentStatusText,
  getPaymentStatusDescription,
  formatPrice,
  formatCountdown,
  getQRCodeForPayment,
  startCountdown,
  simulatePayment,
  retryPayment,
  goBack,
  simulateWalletPayment,
  goToOrderDetail,
  fetchOrderDetail,
  createAlipayPayment,
  createWechatPayment
} = usePayment();

// 背景主题根据支付状态变化
const backgroundTheme = computed(() => {
  if (paymentStatus.value === 'success') return 'success';
  if (paymentStatus.value === 'failed') return 'error';
  if (paymentStatus.value === 'processing') return 'processing';
  return 'primary';
});

// 支付成功完成状态
const paymentSuccessCompleted = ref(false);

// 页面滚动进度
const pageScrollProgress = ref(0);

// 处理滚动事件
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;
  const scrollableHeight = fullHeight - windowHeight;
  
  if (scrollableHeight > 0) {
    pageScrollProgress.value = (scrollTop / scrollableHeight) * 100;
  } else {
    pageScrollProgress.value = 0;
  }
};

// 监听支付状态变化
watch(() => paymentStatus.value, (newStatus) => {
  if (newStatus === 'success') {
    // 延迟显示支付成功动画，给过渡效果留出时间
    setTimeout(() => {
      paymentSuccessCompleted.value = true;
    }, 500);
  }
});

// 页面元素引用
const orderInfoCard = ref(null);
const paymentMethodsCard = ref(null);
const orderStatusCard = ref(null);
const pageContent = ref(null);

// 订单信息动画配置
const orderInfoMotion = useMotion(orderInfoCard, {
  initial: { opacity: 0, y: 40 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 600, delay: 200, ease: [0.175, 0.885, 0.32, 1.275] }
  }
});

// 支付方式动画配置
const paymentMethodsMotion = useMotion(paymentMethodsCard, {
  initial: { opacity: 0, y: 40 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 600, delay: 400, ease: [0.175, 0.885, 0.32, 1.275] }
  }
});

// 订单状态动画配置
const orderStatusMotion = useMotion(orderStatusCard, {
  initial: { opacity: 0, x: 40 },
  enter: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 600, delay: 600, ease: [0.175, 0.885, 0.32, 1.275] }
  }
});

// 页面入场动画
const animatePageElements = () => {
  gsap.fromTo(pageContent.value, 
    { opacity: 0 },
    { opacity: 1, duration: 0.5, ease: 'power2.out' }
  );
};

// 组件挂载
onMounted(async () => {
  // 获取订单详情
  await fetchOrderDetail();
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
  
  // 初始化页面动画
  nextTick(() => {
    animatePageElements();
  });
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});

// 处理支付方法选择
const handlePaymentMethodChange = (method) => {
  selectPaymentMethod(method);
};

// 获取当前活动卡片
const getActiveCardType = computed(() => {
  if (paymentStatus.value === 'success') {
    return 'success';
  }
  if (paymentStatus.value === 'processing') {
    return 'processing';
  }
  if (showQRCode.value) {
    return 'qrcode';
  }
  if (showPaymentForm.value) {
    return 'wallet';
  }
  
  return 'method';
});
</script>

<style src="@/styles/Payment.scss" scoped>
/* 支付宝表单样式 */
.alipay-form-container {
  padding: 20px;
  text-align: center;
  
  form {
    display: none; /* 隐藏原始表单，因为我们会自动提交 */
  }

  p {
    font-size: 14px;
  }
}

/* 页面滚动指示器 */
.scroll-indicator {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  width: 0%;
  z-index: 1000;
  transition: width 0.2s ease-out;
}

/* 支付流程图标 */
.step-icon {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  margin-bottom: 0.5rem;
}

/* 步骤指示器动画 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

/* 页面渐入动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-content {
  position: relative;
  z-index: 5;
  min-height: 100vh;
}

/* 支付卡片切换动画 */
.payment-card-enter-active,
.payment-card-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: absolute;
  width: 100%;
}

.payment-card-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.payment-card-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style> 