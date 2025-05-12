<template>
  <div class="cart-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
      
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <i class="el-icon-loading text-3xl text-primary-500 mb-4"></i>
          <p class="text-gray-500">{{ loadingMessage }}</p>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <i class="el-icon-warning text-4xl text-red-500 mb-4"></i>
        <p class="text-gray-800">{{ error }}</p>
        <el-button type="primary" class="mt-4" @click="fetchCartData">重新加载</el-button>
      </div>
      
      <!-- 未登录状态 -->
      <div v-else-if="!isLoggedIn" class="flex flex-col items-center justify-center py-20">
        <i class="el-icon-lock text-4xl text-primary-500 mb-4"></i>
        <h2 class="text-xl font-medium text-gray-800 mb-2">您需要登录才能查看购物车</h2>
        <p class="text-gray-600 mb-6">登录后即可访问您的购物车和保存的商品</p>
        <div class="flex gap-4">
          <el-button type="primary" @click="goToLogin">
            去登录
          </el-button>
          <el-button :loading="isSyncing" @click="syncAndFetchCart">
            同步会话
          </el-button>
        </div>
        <p class="text-gray-500 text-sm mt-4">如果您已登录但无法查看购物车，请点击"同步会话"</p>
        <el-button class="mt-4" plain @click="goToShop">
          先去购物
        </el-button>
      </div>
      
      <!-- 购物车内容 -->
      <div class="cart-container" v-if="!cartEmpty">
        <!-- 购物车标题栏 -->
        <div class="cart-header">
          <div class="cart-column select-column">
            <el-checkbox
              :model-value="allSelected"
              @change="toggleSelectAll"
              :indeterminate="isIndeterminate"
              :true-value="1" 
              :false-value="0"
            ></el-checkbox>
          </div>
          <div class="cart-column product-column">商品信息</div>
          <div class="cart-column price-column">单价</div>
          <div class="cart-column quantity-column">数量</div>
          <div class="cart-column subtotal-column">小计</div>
          <div class="cart-column action-column">操作</div>
        </div>

        <!-- 购物车项列表 -->
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.cartId" class="cart-item-row">
            <div class="cart-column select-column">
              <el-checkbox 
                :model-value="item.selected === 1" 
                @change="toggleCartItemSelection(item)"
                :true-value="1" 
                :false-value="0"
              ></el-checkbox>
            </div>
            
            <div class="cart-column product-column">
              <div class="product-info">
                <div class="product-image" @click="goToProduct(item.productId)">
                  <el-image 
                    :src="item.image || '/products/goods1.jpg'" 
                    fit="cover"
                    @error="(e) => handleImageError(e, item)"
                  />
                </div>
                <div class="product-details">
                  <div class="product-name" @click="goToProduct(item.productId)">{{ item.title || '商品信息加载中...' }}</div>
                  <div class="product-attrs" v-if="item.specs && item.specs.length > 0">
                    <span v-for="(spec, index) in item.specs" :key="index">{{ spec }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="cart-column price-column">
              <div class="price">¥{{ formatPrice(item.price) }}</div>
            </div>
            
            <div class="cart-column quantity-column">
              <div class="quantity-control">
                <el-button 
                  size="small" 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                  class="quantity-btn"
                >-</el-button>
                <el-input 
                  v-model="item.quantity" 
                  size="small" 
                  class="quantity-input"
                  @blur="updateQuantityDirectly(item, $event.target.value)"
                  @keyup.enter="updateQuantityDirectly(item, $event.target.value)"
                ></el-input>
                <el-button 
                  size="small" 
                  @click="increaseQuantity(item)"
                  :disabled="item.quantity >= (item.stock || 99)"
                  class="quantity-btn"
                >+</el-button>
              </div>
            </div>
            
            <div class="cart-column subtotal-column">
              <div class="subtotal">¥{{ formatPrice(item.subtotal) }}</div>
            </div>
            
            <div class="cart-column action-column">
              <el-button 
                link 
                @click="removeItemFromCart(item)"
                class="delete-btn"
              >删除</el-button>
            </div>
          </div>
        </div>

        <!-- 购物车底部 -->
        <div class="cart-footer">
          <div class="cart-footer-left">
            <el-checkbox
              :model-value="allSelected"
              @change="toggleSelectAll"
              :indeterminate="isIndeterminate"
              :true-value="1" 
              :false-value="0"
            >全选</el-checkbox>
            <el-button link @click="removeSelectedItems" :disabled="!hasSelectedItems">删除选中商品</el-button>
            <el-button link @click="clearCart" :disabled="cartItems.length === 0">清空购物车</el-button>
          </div>
          
          <div class="cart-footer-right">
            <div class="cart-total">
              <span>已选商品 <span class="selected-count">{{ selectedItemsCount }}</span> 件</span>
              <span class="total-label">合计（不含运费）：</span>
              <span class="total-price">¥{{ formatPrice(cartTotal) }}</span>
            </div>
            <el-button 
              type="primary" 
              @click="handleCheckout" 
              :disabled="!hasSelectedItems"
              :loading="checkoutLoading"
              class="checkout-btn"
            >
              <template v-if="!checkoutLoading">结算</template>
              <template v-else>处理中...</template>
            </el-button>
          </div>
        </div>
        
        <!-- 加载动效 -->
        <div class="cart-loading" v-if="loading">
          <el-loading :fullscreen="false" text="加载中..." />
        </div>
        
        <!-- 更新动画 -->
        <div class="cart-update-animation" v-if="showUpdateAnimation">
          <i class="el-icon-check"></i>
          <span>更新成功</span>
        </div>
      </div>

      <!-- 空购物车提示 -->
      <div class="empty-cart" v-else>
        <div class="empty-cart-inner">
          <i class="el-icon-shopping-cart-2 text-gray-300 text-8xl mb-4"></i>
          <h2>购物车空空如也</h2>
          <p>您的购物车还没有商品，快去选购心仪的商品吧！</p>
          <el-button type="primary" @click="goShopping">去购物</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
<style src="@/styles/Cart.scss" scoped></style> 
<script setup>
import { ElLoading } from 'element-plus';
import MotionDiv from '@/components/MotionDiv.vue';
import useCart from '@/scripts/Cart';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

// 处理结算按钮的加载状态
const checkoutLoading = ref(false);

// 处理结算按钮点击
const handleCheckout = async () => {
  if (checkoutLoading.value) return; // 防止重复点击
  
  checkoutLoading.value = true;
  try {
    const success = await proceedToCheckout();
    if (!success) {
      // 结算失败，显示适当的反馈
      ElMessage({
        type: 'warning',
        message: '结算失败，请确认选中的商品并检查登录状态',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('结算过程中出错:', error);
    ElMessage.error('结算过程中出错，请稍后重试');
  } finally {
    // 延迟恢复按钮状态，提供更好的用户体验
    setTimeout(() => {
      checkoutLoading.value = false;
    }, 500);
  }
};

const {
  // 状态
  cartItems,
  loading,
  loadingMessage,
  error,
  isLoggedIn,
  isSyncing,
  recommendedProducts,
  allSelected,
  selectedItemsCount,
  hasSelectedItems,
  isIndeterminate,
  cartEmpty,
  cartTotal,
  cartUpdated,
  showUpdateAnimation,
  
  // 方法
  syncAndFetchCart,
  fetchCartData,
  increaseQuantity,
  decreaseQuantity,
  updateQuantityDirectly,
  removeItemFromCart,
  toggleCartItemSelection,
  toggleSelectAll,
  removeSelectedItems,
  clearCart,
  proceedToCheckout,
  goToProduct,
  handleImageError,
  formatPrice,
  goToShop,
  goShopping
} = useCart();

// 跳转到登录页面
const goToLogin = () => {
  window.location.href = '/login?redirect=/cart';
};
</script> 