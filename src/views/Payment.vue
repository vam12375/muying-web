<template>
  <div class="payment-page">
    <!-- 主内容区域 -->
    <div class="container mx-auto py-10 px-4">
      <!-- 标题和步骤条 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">
          <span class="text-primary-500">订单支付</span>
        </h1>
        <div class="mb-8">
          <el-steps :active="2" finish-status="success" simple>
            <el-step title="购物车" :icon="ShoppingCart"></el-step>
            <el-step title="确认订单" :icon="Document"></el-step>
            <el-step title="支付" :icon="Wallet"></el-step>
            <el-step title="完成" :icon="CheckIcon"></el-step>
          </el-steps>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="card-container animate__animated animate__fadeIn animate__faster">
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
          </div>
          
          <div class="card-container animate__animated animate__fadeIn animate__faster" style="animation-delay: 0.2s">
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
          </div>
        </div>
        
        <div class="lg:col-span-1">
          <el-skeleton animated class="loading-skeleton animate__animated animate__fadeIn animate__faster" style="animation-delay: 0.4s">
            <template #template>
              <div class="card-container p-6">
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
            </template>
          </el-skeleton>
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
          <!-- 订单信息 -->
          <div class="card-container animate__animated animate__fadeInUp">
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
          </div>
          
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
          <div v-if="paymentStatus === 'pending'" class="card-container animate__animated animate__fadeInUp" style="animation-delay: 0.1s">
            <div class="card-header">
              <h2 class="text-xl font-bold text-gray-800">
                <i class="el-icon-wallet"></i>
                选择支付方式
              </h2>
            </div>
            <div class="card-content">
              <div class="payment-methods-container">
                <div 
                  v-for="(method, index) in paymentMethods" 
                  :key="method.id"
                  class="payment-method animate__animated animate__fadeIn"
                  :class="{
                    ['selected-' + method.id]: method.id === selectedPaymentMethod
                  }"
                  :style="{'animation-delay': 0.2 + index * 0.1 + 's'}"
                  @click="selectPaymentMethod(method.id)"
                >
                  <div class="flex items-center">
                    <el-radio v-model="selectedPaymentMethod" :label="method.id" class="mr-2"></el-radio>
                    <div class="method-icon" :style="{ color: method.color }">
                      <img :src="method.image" alt="支付图标" class="w-6 h-6">
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
          
          <!-- 钱包支付表单 (仅在选择钱包且待支付时显示) -->
          <div v-if="selectedPaymentMethod === 'wallet' && showPaymentForm && paymentStatus === 'pending'" class="card-container animate__animated animate__fadeIn">
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
                  <p class="mb-4 text-gray-600">本次支付将从您的钱包余额中扣除 <span class="text-primary-500 font-bold">¥{{ formatPrice(orderAmount) }}</span></p>
                  <el-button 
                    type="primary" 
                    size="large" 
                    class="w-60"
                    @click="simulateWalletPayment"
                    :loading="paymentStatus === 'processing'"
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
          
          <!-- 支付二维码 (仅在选择扫码且待支付时显示) -->
          <div v-if="(selectedPaymentMethod === 'alipay' || selectedPaymentMethod === 'wechat') && showQRCode && paymentStatus === 'pending'" class="card-container animate__animated animate__fadeIn">
            <div class="card-header">
              <h2 class="text-xl font-bold text-gray-800">
                <i class="el-icon-mobile"></i>
                扫码支付
              </h2>
            </div>
            <div class="card-content">
              <div class="qrcode-container">
                <div class="qrcode-wrapper">
                  <div v-if="qrcodeLoading" class="flex justify-center items-center h-60 w-60">
                    <el-skeleton-item variant="image" style="width: 240px; height: 240px" />
                  </div>
                  <img v-else :src="getQRCodeForPayment()" alt="支付二维码" class="w-60 h-60">
                  
                  <transition name="fade">
                    <div v-if="paymentStatus === 'success'" class="success-overlay">
                      <div class="text-center">
                        <div class="success-icon">
                          <i class="el-icon-check text-3xl"></i>
                        </div>
                        <div class="text-green-500 font-bold text-lg">支付成功</div>
                      </div>
                    </div>
                  </transition>
                </div>
                
                <p class="text-center text-gray-500 mb-4">请使用{{ getSelectedPaymentMethodName() }}扫描二维码完成支付</p>
                
                <div class="sandbox-notice">
                  <p><strong>沙箱环境提示：</strong> 这是测试环境，请使用{{ selectedPaymentMethod === 'alipay' ? '支付宝' : '微信' }}沙箱app扫码，无需真实支付</p>
                </div>
                
                <div class="countdown-wrapper">
                  <div class="text-gray-500 mb-2">支付二维码有效期</div>
                  <div class="countdown-timer">{{ formatCountdown() }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 支付宝表单容器 (仅在有alipayForm且待支付时显示) -->
          <div v-if="alipayForm && paymentStatus === 'pending'" class="card-container animate__animated animate__fadeIn">
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
        </div>
        
        <!-- 右侧状态区域 -->
        <div class="lg:col-span-1">
          <!-- 支付状态和操作卡片 -->
          <div class="payment-status-card animate__animated animate__fadeInRight" style="animation-delay: 0.3s">
            <h2 class="text-xl font-bold text-gray-800 mb-4">订单状态</h2>
            
            <!-- Status display -->
            <div class="flex items-center mb-6">
              <div 
                class="status-icon"
                :class="{
                  'pending': paymentStatus === 'pending' || paymentStatus === 'processing',
                  'success': paymentStatus === 'success',
                  'failed': paymentStatus === 'failed'
                }"
              >
                <i 
                  class="text-3xl"
                  :class="{
                    'el-icon-loading': paymentStatus === 'pending' || paymentStatus === 'processing',
                    'el-icon-check': paymentStatus === 'success',
                    'el-icon-close': paymentStatus === 'failed'
                  }"
                ></i>
              </div>
              
              <div>
                <div class="font-bold text-lg" :class="{
                  'text-blue-500': paymentStatus === 'pending' || paymentStatus === 'processing',
                  'text-green-500': paymentStatus === 'success',
                  'text-red-500': paymentStatus === 'failed'
                }">
                  {{ getPaymentStatusText() }}
                </div>
                <div class="text-gray-500 text-sm">{{ getPaymentStatusDescription() }}</div>
              </div>
            </div>
            
            <!-- Amount display -->
            <div class="space-y-4 mb-6">
              <div class="flex justify-between">
                <span class="text-gray-500">应付金额</span>
                <span class="font-medium text-red-500">¥{{ formatPrice(orderAmount) }}</span>
              </div>
            </div>
            
            <!-- Action buttons -->
            <el-button 
              v-if="paymentStatus === 'pending' && !showQRCode && !showPaymentForm && !alipayForm"
              type="primary" 
              class="action-button primary"
              @click="simulatePayment"
              :loading="loading"
            >
             立即支付
            </el-button>

            <el-button 
              v-if="paymentStatus === 'pending' && showQRCode"
              type="primary" 
              class="action-button primary"
              @click="simulatePayment"
            >
             已完成支付
            </el-button>
            
            <el-button 
              v-if="paymentStatus === 'success'"
              type="success" 
              class="action-button success"
              @click="goToOrderDetail"
            >
              查看订单 <i class="el-icon-right ml-1"></i>
            </el-button>
            
            <el-button 
              v-if="paymentStatus === 'failed'"
              type="danger" 
              class="action-button danger"
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
          
          <!-- 支付帮助卡片 -->
          <div class="payment-help animate__animated animate__fadeInRight" style="animation-delay: 0.5s">
            <h3 class="font-bold text-gray-800">
              <i class="el-icon-question"></i>
              支付遇到问题?
            </h3>
            
            <div class="mt-4">
              <div class="help-item">
                <i class="el-icon-warning-outline"></i>
                <span>订单支付后，可在"我的订单"中查看</span>
              </div>
              <div class="help-item">
                <i class="el-icon-warning-outline"></i>
                <span>如遇到支付问题，可联系在线客服</span>
              </div>
              <div class="help-item">
                <i class="el-icon-warning-outline"></i>
                <span>支付成功后未跳转，请刷新页面</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Search, ShoppingCart, Document, Wallet, Check as CheckIcon } from '@element-plus/icons-vue';
import usePayment from '@/scripts/Payment';
import 'animate.css';

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
</style> 