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
                    type="text" 
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

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

// 已选择的商品（模拟从购物车传过来的数据）
const selectedItems = ref([
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
]);

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
    description: '使用微信扫码支付',
    icon: 'el-icon-chat-dot-round'
  },
  {
    id: 2,
    name: '支付宝',
    description: '使用支付宝扫码支付',
    icon: 'el-icon-wallet'
  },
  {
    id: 3,
    name: '银行卡支付',
    description: '使用储蓄卡或信用卡支付',
    icon: 'el-icon-credit-card'
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

// 优惠金额
const discount = ref(10);

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

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 返回购物车
const goBack = () => {
  router.push('/cart');
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
  }).then(() => {
    ElMessage.success('订单提交成功，即将跳转到支付页面');
    
    // 模拟跳转到支付页面
    setTimeout(() => {
      router.push('/payment?order_id=123456');
    }, 1000);
  }).catch(() => {
    // 用户取消操作
  });
};

// 初始化
onMounted(() => {
  // 这里可以从路由或状态管理中获取已选择的购物车商品
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