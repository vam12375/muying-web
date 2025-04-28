<template>
  <div class="checkout-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              <i class="el-icon-sold-out text-2xl"></i>
            </div>
            订单结算
          </h1>
          <p class="text-gray-500 mt-2">
            确认订单信息并提交
          </p>
        </motion-div>
        
        <!-- 订单流程步骤 -->
        <div class="mb-8">
          <el-steps :active="1" finish-status="success" simple>
            <el-step title="购物车" icon="el-icon-shopping-cart"></el-step>
            <el-step title="确认订单" icon="el-icon-tickets"></el-step>
            <el-step title="支付" icon="el-icon-wallet"></el-step>
            <el-step title="完成" icon="el-icon-circle-check"></el-step>
          </el-steps>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2">
            <!-- 收货地址 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-location mr-2 text-gray-500"></i>
                  收货地址
                </h2>
                
                <div v-if="addresses.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <transition-group name="address-item">
                    <div 
                      v-for="address in addresses" 
                      :key="address.id"
                      class="address-card p-4 border rounded-lg cursor-pointer"
                      :class="{'border-primary-500 bg-primary-50': address.id === selectedAddressId, 'border-gray-200 hover:border-primary-300': address.id !== selectedAddressId}"
                      @click="selectAddress(address.id)"
                    >
                      <div class="flex justify-between">
                        <div class="font-medium">{{ address.name }}</div>
                        <div class="text-gray-500">{{ address.phone }}</div>
                      </div>
                      <div class="text-gray-600 mt-2 text-sm">
                        {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detail }}
                      </div>
                      <div class="mt-2 flex items-center gap-2">
                        <span 
                          v-if="address.isDefault" 
                          class="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded"
                        >默认</span>
                      </div>
                    </div>
                  </transition-group>
                </div>
                
                <div class="mt-4">
                  <el-button 
                    type="primary" 
                    plain 
                    icon="el-icon-plus"
                    class="rounded-lg hover:scale-105 transition-transform"
                  >
                    添加新地址
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 订单商品 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-goods mr-2 text-gray-500"></i>
                  订单商品
                </h2>
                
                <div class="cart-items space-y-4">
                  <div 
                    v-for="item in selectedItems" 
                    :key="item.id"
                    class="cart-item bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
                  >
                    <div class="grid grid-cols-12 gap-4 items-center p-4">
                      <!-- 商品信息 -->
                      <div class="col-span-7">
                        <div class="flex items-center">
                          <div class="product-img w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden mr-4">
                            <img :src="item.image" :alt="item.title" class="w-full h-full object-cover">
                          </div>
                          
                          <div class="product-info flex-1 min-w-0">
                            <h3 class="text-base font-medium text-gray-800 mb-1 truncate">
                              {{ item.title }}
                            </h3>
                            
                            <div v-if="item.specs" class="inline-flex flex-wrap gap-2 my-2">
                              <span 
                                v-for="(spec, index) in item.specs" 
                                :key="index"
                                class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md"
                              >
                                {{ spec }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <!-- 单价 -->
                      <div class="col-span-2 text-center">
                        <div class="text-gray-600 font-medium">¥{{ formatPrice(item.price) }}</div>
                      </div>
                      
                      <!-- 数量 -->
                      <div class="col-span-1 text-center">
                        <div class="text-gray-600">x{{ item.quantity }}</div>
                      </div>
                      
                      <!-- 小计 -->
                      <div class="col-span-2 text-right">
                        <div class="text-red-500 font-medium">¥{{ formatPrice(item.subtotal) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 配送方式 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-truck mr-2 text-gray-500"></i>
                  配送方式
                </h2>
                
                <div class="shipping-options grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div 
                    v-for="option in shippingOptions" 
                    :key="option.id"
                    class="shipping-option p-4 border rounded-lg cursor-pointer transition-all"
                    :class="{'border-primary-500 bg-primary-50': option.id === selectedShippingId, 'border-gray-200 hover:border-primary-300': option.id !== selectedShippingId}"
                    @click="selectShipping(option.id)"
                  >
                    <div class="flex items-center">
                      <el-radio v-model="selectedShippingId" :label="option.id" class="mr-2"></el-radio>
                      <div>
                        <div class="font-medium">{{ option.name }}</div>
                        <div class="text-gray-500 text-sm">{{ option.description }}</div>
                        <div class="text-red-500 mt-1">{{ option.fee > 0 ? `¥${formatPrice(option.fee)}` : '免运费' }}</div>
                      </div>
                    </div>
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
                
                <div class="payment-options grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div 
                    v-for="option in paymentOptions" 
                    :key="option.id"
                    class="payment-option p-4 border rounded-lg cursor-pointer transition-all"
                    :class="{'border-primary-500 bg-primary-50': option.id === selectedPaymentId, 'border-gray-200 hover:border-primary-300': option.id !== selectedPaymentId}"
                    @click="selectPayment(option.id)"
                  >
                    <div class="flex items-center">
                      <el-radio v-model="selectedPaymentId" :label="option.id" class="mr-2"></el-radio>
                      <div class="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 mr-3">
                        <i :class="option.icon" class="text-xl"></i>
                      </div>
                      <div>
                        <div class="font-medium">{{ option.name }}</div>
                        <div class="text-gray-500 text-xs">{{ option.description }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 优惠券 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-discount mr-2 text-gray-500"></i>
                  优惠券
                </h2>
                
                <div v-if="availableCoupons.length === 0 && !couponsLoading" class="text-center py-4">
                  <p class="text-gray-500">暂无可用优惠券</p>
                  <el-button 
                    type="primary" 
                    link 
                    class="mt-2"
                    @click="showCouponCodeInput = true"
                  >
                    使用优惠码
                  </el-button>
                </div>
                
                <div v-else>
                  <div class="coupon-list space-y-4">
                    <div v-if="couponsLoading" class="py-4">
                      <el-skeleton :rows="1" animated />
                    </div>
                    
                    <template v-else>
                      <div
                        v-for="coupon in availableCoupons"
                        :key="coupon.id"
                        class="coupon-item border rounded-lg overflow-hidden cursor-pointer transition-all"
                        :class="{'border-primary-500 bg-primary-50': selectedCouponId === coupon.id, 'border-gray-200 hover:border-primary-300': selectedCouponId !== coupon.id}"
                        @click="selectCoupon(coupon.id)"
                      >
                        <div class="flex">
                          <!-- 优惠券左侧金额 -->
                          <div 
                            class="coupon-amount bg-primary-500 text-white flex flex-col items-center justify-center p-4 w-24"
                          >
                            <div class="text-xl font-bold">{{ coupon.amount }}</div>
                            <div class="text-xs">{{ getCouponTypeText(coupon.type) }}</div>
                          </div>
                          
                          <!-- 优惠券信息 -->
                          <div class="coupon-info flex-1 p-4 flex justify-between items-center">
                            <div>
                              <div class="font-medium text-sm">{{ coupon.name }}</div>
                              <div class="text-xs text-gray-500 mt-1">{{ coupon.minAmount > 0 ? `满${coupon.minAmount}可用` : '无门槛' }}</div>
                              <div class="text-xs text-gray-500">有效期至：{{ formatDate(coupon.endDate) }}</div>
                            </div>
                            
                            <div>
                              <el-radio v-model="selectedCouponId" :label="coupon.id"></el-radio>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div class="flex items-center mt-4">
                        <el-button 
                          type="primary" 
                          link 
                          @click="showCouponCodeInput = true"
                        >
                          使用优惠码
                        </el-button>
                        
                        <div class="flex-1"></div>
                        
                        <el-button 
                          type="info" 
                          link 
                          @click="goCouponCenter"
                        >
                          查看更多优惠券
                        </el-button>
                      </div>
                    </template>
                  </div>
                  
                  <!-- 优惠码输入框 -->
                  <el-collapse-transition>
                    <div v-if="showCouponCodeInput" class="mt-4 border-t border-gray-100 pt-4">
                      <div class="flex space-x-2">
                        <el-input
                          v-model="couponCode"
                          placeholder="请输入优惠码"
                          class="flex-1"
                          maxlength="20"
                          show-word-limit
                        ></el-input>
                        <el-button
                          type="primary"
                          :loading="couponCodeLoading"
                          @click="applyCouponCode"
                        >
                          使用
                        </el-button>
                        <el-button @click="showCouponCodeInput = false">
                          取消
                        </el-button>
                      </div>
                    </div>
                  </el-collapse-transition>
                </div>
              </div>
            </div>
            
            <!-- 订单备注 -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div class="p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <i class="el-icon-edit-outline mr-2 text-gray-500"></i>
                  订单备注
                </h2>
                
                <el-input 
                  v-model="orderNote" 
                  type="textarea" 
                  placeholder="可以告诉我们您的特殊要求，如送货时间、包装等"
                  :rows="3"
                  class="rounded-lg"
                ></el-input>
              </div>
            </div>
          </div>
          
          <!-- 订单摘要 -->
          <div class="lg:col-span-1">
            <motion-div
              :initial="{ opacity: 0, x: 20 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.5, delay: 0.2 }"
            >
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
                <h2 class="text-xl font-bold text-gray-800 mb-4">订单摘要</h2>
                
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-gray-500">商品总计</span>
                    <span class="font-medium">¥{{ formatPrice(totalAmount) }}</span>
                  </div>
                  
                  <div class="flex justify-between">
                    <span class="text-gray-500">运费</span>
                    <span class="font-medium">
                      {{ shippingFee > 0 ? `¥${formatPrice(shippingFee)}` : '免运费' }}
                    </span>
                  </div>
                  
                  <div v-if="discount > 0" class="flex justify-between">
                    <span class="text-gray-500">优惠</span>
                    <span class="text-green-500">-¥{{ formatPrice(discount) }}</span>
                  </div>
                  
                  <div class="border-t border-gray-100 my-4 pt-4"></div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-gray-800 font-medium">实付金额</span>
                    <transition name="price" mode="out-in">
                      <span class="text-xl text-red-500 font-bold" :key="payAmount">¥{{ formatPrice(payAmount) }}</span>
                    </transition>
                  </div>
                </div>
                
                <el-button 
                  type="primary" 
                  class="w-full mt-6 h-12 text-base rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                  @click="submitOrder"
                >
                  提交订单 <i class="el-icon-arrow-right ml-1"></i>
                </el-button>
                
                <div class="mt-4 text-center">
                  <el-button 
                    link 
                    class="text-sm text-gray-500"
                    @click="goBack"
                  >
                    返回购物车
                    <i class="el-icon-back ml-1"></i>
                  </el-button>
                </div>
              </div>
            </motion-div>
            
            <!-- 订单协议 -->
            <div class="mt-6 text-center p-4">
              <el-checkbox v-model="agreeTerms">
                <span class="text-sm text-gray-500">
                  我已阅读并同意 <span class="text-primary-600 cursor-pointer">《用户协议》</span> 和 <span class="text-primary-600 cursor-pointer">《隐私政策》</span>
                </span>
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { getAvailableCouponsForOrder, validateCoupon } from '@/api/coupon';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const orderStore = useOrderStore();

// 购买来源（'cart' 或 'buy_now'）
const orderSource = ref('cart');

// 地址数据
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区88号华智大厦10楼1001室',
    isDefault: true
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '天河路385号太古汇23楼2301室',
    isDefault: false
  }
]);

// 已选择的商品
const selectedItems = ref([]);

// 配送方式选项
const shippingOptions = ref([
  {
    id: 1,
    name: '标准配送',
    description: '3-5天送达',
    fee: 0
  },
  {
    id: 2,
    name: '加急配送',
    description: '1-2天送达',
    fee: 15
  },
  {
    id: 3,
    name: '同城急送',
    description: '2小时内送达',
    fee: 30
  }
]);

// 支付方式选项
const paymentOptions = ref([
  {
    id: 1,
    name: '微信支付',
    description: '使用微信扫码支付(沙箱环境)',
    icon: 'el-icon-chat-dot-round'
  },
  {
    id: 2,
    name: '支付宝',
    description: '使用支付宝扫码支付(沙箱环境)',
    icon: 'el-icon-wallet'
  },
  {
    id: 3,
    name: '钱包支付',
    description: '使用账户余额支付',
    icon: 'el-icon-money'
  }
]);

// 选中的地址、配送方式和支付方式
const selectedAddressId = ref(1);
const selectedShippingId = ref(1);
const selectedPaymentId = ref(1);

// 订单备注
const orderNote = ref('');

// 是否同意条款
const agreeTerms = ref(true);

// 优惠券相关
const availableCoupons = ref([]);
const selectedCouponId = ref('');
const couponsLoading = ref(false);
const showCouponCodeInput = ref(false);
const couponCode = ref('');
const couponCodeLoading = ref(false);

// 优惠金额
const discount = computed(() => {
  if (!selectedCouponId.value) return 0;
  
  const selectedCoupon = availableCoupons.value.find(c => c.id === selectedCouponId.value);
  if (!selectedCoupon) return 0;
  
  if (selectedCoupon.type === 'fixed') {
    // 固定金额
    return Math.min(selectedCoupon.amount, totalAmount.value);
  } else if (selectedCoupon.type === 'percentage') {
    // 折扣比例
    return totalAmount.value * (selectedCoupon.amount / 100);
  }
  
  return 0;
});

// 商品总金额
const totalAmount = computed(() => {
  return selectedItems.value.reduce((total, item) => total + item.subtotal, 0);
});

// 运费
const shippingFee = computed(() => {
  const selected = shippingOptions.value.find(option => option.id === selectedShippingId.value);
  return selected ? selected.fee : 0;
});

// 实付金额
const payAmount = computed(() => {
  return totalAmount.value + shippingFee.value - discount.value;
});

// 选择地址
const selectAddress = (id) => {
  selectedAddressId.value = id;
};

// 选择配送方式
const selectShipping = (id) => {
  selectedShippingId.value = id;
};

// 选择支付方式
const selectPayment = (id) => {
  selectedPaymentId.value = id;
};

// 选择优惠券
const selectCoupon = (id) => {
  if (selectedCouponId.value === id) {
    selectedCouponId.value = ''; // 再次点击取消选择
  } else {
    selectedCouponId.value = id;
  }
};

// 获取优惠券类型文本
const getCouponTypeText = (type) => {
  return type === 'fixed' ? '元' : '折';
};

// 使用优惠码
const applyCouponCode = async () => {
  if (!couponCode.value) {
    ElMessage.warning('请输入优惠码');
    return;
  }
  
  couponCodeLoading.value = true;
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟成功响应
    const couponData = {
      id: 'code-' + Date.now(),
      name: '新用户专享券',
      type: 'fixed',
      amount: 20,
      minAmount: 100,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    
    availableCoupons.value.push(couponData);
    selectedCouponId.value = couponData.id;
    showCouponCodeInput.value = false;
    couponCode.value = '';
    
    ElMessage.success('优惠码使用成功');
  } catch (error) {
    ElMessage.error('优惠码无效或已过期');
  } finally {
    couponCodeLoading.value = false;
  }
};

// 前往优惠券中心
const goCouponCenter = () => {
  router.push('/coupons');
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 返回购物车或商品详情
const goBack = () => {
  if (orderSource.value === 'buy_now') {
    // 如果是直接购买，返回商品详情页
    router.go(-1); 
  } else {
    // 如果是购物车购买，返回购物车
    router.push('/cart');
  }
};

// 加载可用优惠券
const loadAvailableCoupons = async () => {
  couponsLoading.value = true;
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟优惠券数据
    availableCoupons.value = [
      {
        id: 'c1',
        name: '满100减10券',
        type: 'fixed',
        amount: 10,
        minAmount: 100,
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'c2',
        name: '满200减30券',
        type: 'fixed',
        amount: 30,
        minAmount: 200,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'c3',
        name: '95折优惠券',
        type: 'percentage',
        amount: 5, // 表示95折
        minAmount: 50,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];
    
    // 过滤不满足使用条件的优惠券
    availableCoupons.value = availableCoupons.value.filter(coupon => {
      return totalAmount.value >= coupon.minAmount;
    });
  } catch (error) {
    console.error('获取优惠券失败:', error);
    ElMessage.error('获取优惠券失败，请稍后重试');
  } finally {
    couponsLoading.value = false;
  }
};

// 提交订单
const submitOrder = () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }
  
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策');
    return;
  }
  
  // 创建订单
  ElMessageBox.confirm('确认提交订单吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      // 获取收货地址
      const address = addresses.value.find(addr => addr.id === selectedAddressId.value);
      
      // 获取配送方式
      const shipping = shippingOptions.value.find(opt => opt.id === selectedShippingId.value);
      
      // 获取支付方式
      const payment = paymentOptions.value.find(opt => opt.id === selectedPaymentId.value);
      
      // 获取优惠券
      const coupon = availableCoupons.value.find(c => c.id === selectedCouponId.value);
      
      // 构建订单数据
      const orderData = {
        items: selectedItems.value,
        address,
        shipping,
        payment: {
          id: payment.id,
          name: payment.name
        },
        coupon: coupon ? {
          id: coupon.id,
          name: coupon.name,
          amount: discount.value
        } : null,
        totalAmount: totalAmount.value,
        shippingFee: shippingFee.value,
        discount: discount.value,
        payAmount: payAmount.value,
        note: orderNote.value
      };
      
      // 创建订单
      const result = await orderStore.createOrder(orderData);
      
      if (result) {
        ElMessage.success('订单提交成功，即将跳转到支付页面');
        
        // 如果是从购物车来的，清空已选择的商品
        if (orderSource.value === 'cart') {
          // 模拟从购物车中移除已购买的商品
          // cartStore.removeSelectedItems();
        }
        
        // 清空临时订单
        orderStore.clearTempOrderItems();
        
        // 跳转到支付页面
        router.push({
          path: '/payment',
          query: { 
            order_id: result.orderId || '123456',
            amount: payAmount.value
          }
        });
      }
    } catch (error) {
      console.error('提交订单失败:', error);
      ElMessage.error('提交订单失败，请稍后重试');
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 初始化
onMounted(async () => {
  // 判断购买来源
  orderSource.value = route.query.from === 'buy_now' ? 'buy_now' : 'cart';
  
  if (orderSource.value === 'buy_now') {
    // 如果是直接购买，从 orderStore 中获取临时订单项
    const tempItems = orderStore.getTempOrderItems();
    if (tempItems && tempItems.length > 0) {
      selectedItems.value = tempItems;
    } else {
      // 如果没有临时订单项，返回首页
      ElMessage.error('订单信息已失效，请重新购买');
      router.push('/');
      return;
    }
  } else {
    // 如果是从购物车来的，从购物车中获取选中的商品
    // 这里使用模拟数据，实际应该从 cartStore 中获取
    selectedItems.value = [
      {
        id: 1,
        title: '婴儿纯棉连体衣秋冬装加厚保暖新生儿衣服',
        image: '/images/product1.jpg',
        specs: ['粉色', '73cm'],
        price: 89.9,
        originalPrice: 129.9,
        quantity: 1,
        subtotal: 89.9
      },
      {
        id: 2,
        title: '儿童宝宝牙刷婴幼儿软毛护齿训练牙刷',
        image: '/images/product2.jpg',
        specs: ['蓝色', '2-4岁'],
        price: 29.9,
        quantity: 2,
        subtotal: 59.8
      }
    ];
  }
  
  // 加载可用的优惠券
  await loadAvailableCoupons();
  
  // 默认选择第一个可用的优惠券
  if (availableCoupons.value.length > 0) {
    selectedCouponId.value = availableCoupons.value[0].id;
  }
});

// 监听总金额变化，重新加载可用优惠券
watch(totalAmount, (newValue) => {
  if (newValue > 0) {
    loadAvailableCoupons();
  }
});
</script>

<style scoped>
.checkout-page {
  padding-bottom: 2rem;
}

/* Address item animations */
.address-item-enter-active,
.address-item-leave-active {
  transition: all 0.5s ease;
}

.address-item-enter-from,
.address-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.address-item-move {
  transition: transform 0.5s ease;
}

/* Price animation */
.price-enter-active,
.price-leave-active {
  transition: all 0.3s ease;
}

.price-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.price-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style> 