<template>
  <div class="cart-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
              <i class="el-icon-shopping-cart text-2xl"></i>
            </div>
            我的购物车
            <transition name="bounce" mode="out-in">
              <span 
                v-if="cartUpdated" 
                key="updated"
                class="inline-flex items-center justify-center rounded-full bg-primary-500 text-white text-xs w-5 h-5"
              >
                +1
              </span>
            </transition>
          </h1>
          <p class="text-gray-500 mt-2">
            查看您选择的商品并进行结算
          </p>
        </motion-div>
        
        <!-- 空购物车状态 -->
        <div v-if="cartItems.length === 0" class="empty-cart">
          <div class="empty-cart-animation bg-white rounded-2xl p-14 shadow-sm border border-gray-100 max-w-[620px] mx-auto
                      group hover:shadow-md transition duration-500 hover:border-primary-100">
            <div class="flex justify-center isolate relative h-24">
              <div class="bg-white w-16 h-16 grid place-items-center rounded-xl absolute left-2.5 top-1.5 -rotate-6 shadow-lg border border-gray-100 
                          group-hover:-translate-x-5 group-hover:-rotate-12 group-hover:-translate-y-0.5 transition duration-500">
                <i class="el-icon-goods text-2xl text-gray-400"></i>
              </div>
              <div class="bg-white w-16 h-16 grid place-items-center rounded-xl relative z-10 shadow-lg border border-gray-100
                          group-hover:-translate-y-0.5 transition duration-500">
                <i class="el-icon-shopping-cart-full text-2xl text-gray-400"></i>
              </div>
              <div class="bg-white w-16 h-16 grid place-items-center rounded-xl absolute right-2.5 top-1.5 rotate-6 shadow-lg border border-gray-100
                          group-hover:translate-x-5 group-hover:rotate-12 group-hover:-translate-y-0.5 transition duration-500">
                <i class="el-icon-star-off text-2xl text-gray-400"></i>
              </div>
            </div>
            <h2 class="text-gray-800 font-medium mt-8 text-xl">购物车还是空的</h2>
            <p class="text-sm text-gray-500 mt-2">添加商品到购物车继续购物</p>
            <el-button 
              type="primary" 
              class="mt-6 px-8 py-3 rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
              @click="goToShop"
            >
              去购物
            </el-button>
          </div>
        </div>
        
        <!-- 购物车内容 -->
        <div v-else>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              <!-- 表头 - 仅桌面显示 -->
              <div class="cart-header grid grid-cols-12 gap-4 pb-4 border-b text-gray-500 text-sm hidden md:grid">
                <div class="col-span-6">商品信息</div>
                <div class="col-span-2 text-center">单价</div>
                <div class="col-span-2 text-center">数量</div>
                <div class="col-span-1 text-center">小计</div>
                <div class="col-span-1 text-center">操作</div>
              </div>
              
              <!-- 商品列表 -->
              <transition-group 
                name="cart-item" 
                tag="div" 
                class="cart-items space-y-4 mt-4"
              >
                <div 
                  v-for="item in cartItems" 
                  :key="item.id"
                  class="cart-item bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4">
                    <!-- 商品信息 -->
                    <div class="col-span-1 md:col-span-6">
                      <div class="flex items-center">
                        <el-checkbox 
                          v-model="item.selected" 
                          @change="updateCartTotal"
                          class="mr-4 transform scale-110"
                        ></el-checkbox>
                        
                        <div class="product-img w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden mr-4 group">
                          <img :src="item.image" :alt="item.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        </div>
                        
                        <div class="product-info flex-1 min-w-0">
                          <h3 class="text-base font-medium text-gray-800 mb-1 truncate hover:text-primary-600 transition-colors">
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
                          
                          <!-- 移动端显示 -->
                          <div class="flex justify-between items-center md:hidden mt-4">
                            <div class="text-red-500 font-medium text-price-animate">¥{{ formatPrice(item.price) }}</div>
                            <div class="quantity-selector flex items-center border border-gray-200 rounded-lg overflow-hidden p-1 bg-gray-50">
                              <button 
                                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                                @click="decreaseQuantity(item)"
                              >
                                <i class="el-icon-minus text-xs"></i>
                              </button>
                              <span class="w-10 text-center font-medium text-gray-700">{{ item.quantity }}</span>
                              <button 
                                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                                @click="increaseQuantity(item)"
                              >
                                <i class="el-icon-plus text-xs"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 单价 -->
                    <div class="hidden md:block col-span-2 text-center">
                      <transition name="price" mode="out-in">
                        <div class="text-red-500 font-medium" :key="item.price">¥{{ formatPrice(item.price) }}</div>
                      </transition>
                      <div v-if="item.originalPrice" class="text-xs text-gray-400 line-through">
                        ¥{{ formatPrice(item.originalPrice) }}
                      </div>
                    </div>
                    
                    <!-- 数量 -->
                    <div class="hidden md:flex col-span-2 justify-center">
                      <div class="quantity-selector flex items-center border border-gray-200 rounded-lg overflow-hidden p-1 bg-gray-50">
                        <button 
                          class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                          @click="decreaseQuantity(item)"
                        >
                          <i class="el-icon-minus text-xs"></i>
                        </button>
                        <span class="w-10 text-center font-medium text-gray-700">{{ item.quantity }}</span>
                        <button 
                          class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors"
                          @click="increaseQuantity(item)"
                        >
                          <i class="el-icon-plus text-xs"></i>
                        </button>
                      </div>
                    </div>
                    
                    <!-- 小计 -->
                    <div class="hidden md:block col-span-1 text-center">
                      <transition name="price" mode="out-in">
                        <div class="text-red-500 font-medium" :key="item.subtotal">¥{{ formatPrice(item.subtotal) }}</div>
                      </transition>
                    </div>
                    
                    <!-- 操作 -->
                    <div class="col-span-1 text-center">
                      <el-button 
                        link 
                        class="text-gray-500 hover:text-red-500 hover:scale-110 transition-transform"
                        @click="handleRemoveItem(item)"
                      >
                        <i class="el-icon-delete"></i>
                      </el-button>
                    </div>
                  </div>
                </div>
              </transition-group>
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
                      <span class="text-gray-500">已选商品</span>
                      <span class="font-medium">{{ selectedCount }} 件</span>
                    </div>
                    
                    <div v-if="discount > 0" class="flex justify-between">
                      <span class="text-gray-500">优惠</span>
                      <span class="text-green-500">-¥{{ formatPrice(discount) }}</span>
                    </div>
                    
                    <div class="border-t border-gray-100 my-4 pt-4"></div>
                    
                    <div class="flex justify-between items-center">
                      <span class="text-gray-800 font-medium">合计</span>
                      <transition name="price" mode="out-in">
                        <span class="text-xl text-red-500 font-bold" :key="cartTotal">¥{{ formatPrice(cartTotal) }}</span>
                      </transition>
                    </div>
                  </div>
                  
                  <el-button 
                    type="primary" 
                    class="w-full mt-6 h-12 text-base rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105"
                    :disabled="selectedCount === 0"
                    @click="goToCheckout"
                  >
                    去结算 <i class="el-icon-arrow-right ml-1"></i>
                  </el-button>
                  
                  <div class="mt-4 text-center">
                    <el-button 
                      link 
                      class="text-sm text-gray-500"
                      @click="goToShop"
                    >
                      继续购物
                      <i class="el-icon-right ml-1"></i>
                    </el-button>
                  </div>
                </div>
              </motion-div>
              
              <!-- 购物车操作 -->
              <div class="flex flex-wrap items-center gap-2 mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <el-checkbox 
                  v-model="allSelected" 
                  @change="toggleSelectAll"
                  class="mr-2"
                >
                  全选
                </el-checkbox>
                
                <el-button 
                  link 
                  class="text-gray-500 hover:text-red-500"
                  @click="handleBatchRemove"
                >
                  <i class="el-icon-delete mr-1"></i> 批量删除
                </el-button>
                
                <el-button 
                  link 
                  class="text-gray-500 hover:text-primary-600"
                  @click="handleMoveToFavorites"
                >
                  <i class="el-icon-star-off mr-1"></i> 移入收藏夹
                </el-button>
                
                <el-button 
                  link 
                  class="text-gray-500 hover:text-red-500 ml-auto"
                  @click="handleClearCart"
                >
                  <i class="el-icon-delete mr-1"></i> 清空购物车
                </el-button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 猜你喜欢 -->
        <div class="recommended-products mt-16">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="el-icon-star-off mr-2 text-gray-500"></i>
                猜你喜欢
              </h2>
              
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <motion-div
                  v-for="(product, index) in recommendedProducts" 
                  :key="product.id"
                  :initial="{ opacity: 0, y: 20 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :transition="{ duration: 0.3, delay: index * 0.05 }"
                  class="product-card group cursor-pointer"
                  @click="viewProduct(product)"
                >
                  <div class="product-img aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3 relative">
                    <img :src="product.image" :alt="product.title" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <el-button 
                        type="primary" 
                        size="small" 
                        class="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                        @click.stop="addToCart(product)"
                      >
                        <i class="el-icon-plus mr-1"></i> 加入购物车
                      </el-button>
                    </div>
                  </div>
                  
                  <h3 class="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary-600 transition-colors mb-1">
                    {{ product.title }}
                  </h3>
                  
                  <div class="text-red-500 font-medium">¥{{ formatPrice(product.price) }}</div>
                </motion-div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// 购物车数据
const cartItems = ref([
  {
    id: 1,
    title: '婴儿纯棉连体衣秋冬装加厚保暖新生儿衣服',
    image: '/images/product1.jpg',
    specs: ['粉色', '73cm'],
    price: 89.9,
    originalPrice: 129.9,
    quantity: 1,
    subtotal: 89.9,
    stock: 50,
    selected: true
  },
  {
    id: 2,
    title: '儿童宝宝牙刷婴幼儿软毛护齿训练牙刷',
    image: '/images/product2.jpg',
    specs: ['蓝色', '2-4岁'],
    price: 29.9,
    quantity: 2,
    subtotal: 59.8,
    stock: 100,
    selected: true
  },
  {
    id: 3,
    title: '婴儿奶瓶宽口径防胀气宝宝防摔硅胶奶瓶',
    image: '/images/product3.jpg',
    specs: ['240ml'],
    price: 69.9,
    originalPrice: 88,
    quantity: 1,
    subtotal: 69.9,
    stock: 30,
    selected: false
  }
]);

// 推荐商品
const recommendedProducts = ref([
  {
    id: 101,
    title: '婴儿洗发沐浴露二合一宝宝洗护用品新生儿沐浴露',
    image: '/images/product4.jpg',
    price: 59.9
  },
  {
    id: 102,
    title: '儿童餐椅多功能可折叠便携式宝宝吃饭椅子',
    image: '/images/product5.jpg',
    price: 299
  },
  {
    id: 103,
    title: '婴儿推车轻便折叠可坐可躺高景观婴儿车',
    image: '/images/product6.jpg',
    price: 899
  },
  {
    id: 104,
    title: '宝宝辅食机多功能料理机婴儿研磨器',
    image: '/images/product7.jpg',
    price: 259
  },
  {
    id: 105,
    title: '儿童益智早教玩具拼图积木3-6岁男女孩礼物',
    image: '/images/product8.jpg',
    price: 69.9
  }
]);

// 全选状态
const allSelected = computed({
  get: () => {
    return cartItems.value.length > 0 && cartItems.value.every(item => item.selected);
  },
  set: (value) => {
    cartItems.value.forEach(item => {
      item.selected = value;
    });
  }
});

// 已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length;
});

// 购物车总金额
const cartTotal = ref(0);

// 优惠金额
const discount = ref(10);

// 购物车更新动画控制
const cartUpdated = ref(false);

// 更新购物车总金额
const updateCartTotal = () => {
  cartTotal.value = cartItems.value
    .filter(item => item.selected)
    .reduce((total, item) => {
      return total + item.subtotal;
    }, 0);
};

// 更新商品小计
const updateItemSubtotal = (item) => {
  item.subtotal = item.price * item.quantity;
  updateCartTotal();
};

// 增加数量
const increaseQuantity = (item) => {
  if (item.quantity < (item.stock || 99)) {
    item.quantity++;
    updateItemSubtotal(item);
    
    // 触发动画
    showCartUpdateAnimation();
  }
};

// 减少数量
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    updateItemSubtotal(item);
  }
};

// 显示购物车更新动画
const showCartUpdateAnimation = () => {
  cartUpdated.value = true;
  setTimeout(() => {
    cartUpdated.value = false;
  }, 1000);
};

// 全选/取消全选
const toggleSelectAll = (value) => {
  cartItems.value.forEach(item => {
    item.selected = value;
  });
  updateCartTotal();
};

// 删除单个商品
const handleRemoveItem = (item) => {
  ElMessageBox.confirm('确定要从购物车中删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = cartItems.value.filter(cartItem => cartItem.id !== item.id);
    updateCartTotal();
    ElMessage.success('商品已从购物车中删除');
  }).catch(() => {
    // 用户取消操作
  });
};

// 批量删除选中商品
const handleBatchRemove = () => {
  const selectedItems = cartItems.value.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择要删除的商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.length} 件商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = cartItems.value.filter(item => !item.selected);
    updateCartTotal();
    ElMessage.success('选中商品已从购物车中删除');
  }).catch(() => {
    // 用户取消操作
  });
};

// 清空购物车
const handleClearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = [];
    cartTotal.value = 0;
    ElMessage.success('购物车已清空');
  }).catch(() => {
    // 用户取消操作
  });
};

// 移入收藏夹
const handleMoveToFavorites = () => {
  const selectedItems = cartItems.value.filter(item => item.selected);
  
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择要移入收藏夹的商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要将选中的 ${selectedItems.length} 件商品移入收藏夹吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 从购物车中移除选中商品
    cartItems.value = cartItems.value.filter(item => !item.selected);
    updateCartTotal();
    ElMessage.success('选中商品已移入收藏夹');
  }).catch(() => {
    // 用户取消操作
  });
};

// 加入购物车
const addToCart = (product) => {
  // 检查是否已在购物车中
  const existingItem = cartItems.value.find(item => item.id === product.id);
  
  if (existingItem) {
    // 已在购物车中，增加数量
    existingItem.quantity++;
    updateItemSubtotal(existingItem);
  } else {
    // 不在购物车中，添加新项
    const newItem = {
      id: product.id,
      title: product.title,
      image: product.image,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      stock: 99,
      selected: true
    };
    
    cartItems.value.push(newItem);
    updateCartTotal();
  }
  
  ElMessage.success('商品已加入购物车');
  showCartUpdateAnimation();
};

// 前往结算页面
const goToCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要结算的商品');
    return;
  }
  
  // 跳转到结算页面
  router.push('/checkout');
};

// 前往商城
const goToShop = () => {
  router.push('/products');
};

// 查看商品详情
const viewProduct = (product) => {
  router.push(`/product/${product.id}`);
};

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 初始化
onMounted(() => {
  updateCartTotal();
});
</script>

<style scoped>
.cart-page {
  padding-bottom: 2rem;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation for cart items */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.5s ease;
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.cart-item-move {
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

/* Bounce animation for +1 */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* Price animation */
.text-price-animate {
  position: relative;
  overflow: hidden;
  display: inline-block;
}
.text-price-animate::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  transform: translateX(-100%);
}
.cart-item:hover .text-price-animate::after {
  animation: price-shine 1.5s;
}
@keyframes price-shine {
  100% {
    transform: translateX(100%);
  }
}
</style> 
