<template>
  <div class="cart-page min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div class="container mx-auto py-10 px-4">
      <!-- 页面标题 -->
      <div class="mb-8 flex flex-wrap justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <div class="text-primary-600">
              <el-icon class="text-2xl"><ShoppingCart /></el-icon>
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
        </div>
        
        <!-- 视图切换控制器 -->
        <div class="mt-4 md:mt-0">
          <el-tooltip
            content="切换视图模式"
            placement="top"
            :offset="8"
          >
            <el-radio-group 
              v-model="viewMode" 
              size="small" 
              class="view-mode-switch"
              @change="handleViewModeChange"
            >
              <el-radio-button label="list">
                <el-icon><List /></el-icon>
                <span class="ml-1 d-none d-sm-inline">列表视图</span>
              </el-radio-button>
              <el-radio-button label="card">
                <el-icon><Grid /></el-icon>
                <span class="ml-1 d-none d-sm-inline">卡片视图</span>
              </el-radio-button>
            </el-radio-group>
          </el-tooltip>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <CartSkeleton 
        v-if="loading" 
        :mode="viewMode" 
        :count="3" 
      />
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 cart-error">
        <el-icon class="text-4xl text-red-500 mb-4"><Warning /></el-icon>
        <p class="text-gray-800">{{ error }}</p>
        <el-button type="primary" class="mt-4" @click="fetchCartData">重新加载</el-button>
      </div>
      
      <!-- 未登录状态 -->
      <div v-else-if="!isLoggedIn" class="flex flex-col items-center justify-center py-20 cart-login">
        <el-icon class="text-4xl text-primary-500 mb-4"><Lock /></el-icon>
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
      <template v-else-if="!cartEmpty">
        <div class="cart-layout">
          <!-- 主要内容区（商品列表） -->
          <div class="cart-main">
            <div class="cart-container">
              <!-- 购物车标题栏 - 仅列表视图显示 -->
              <div v-if="viewMode === 'list'" class="cart-header">
                <div class="cart-column select-column">
                  <el-checkbox
                    :model-value="allSelected"
                    @change="toggleSelectAll"
                    :indeterminate="isIndeterminate"
                  ></el-checkbox>
                </div>
                <div class="cart-column product-column">商品信息</div>
                <div class="cart-column price-column">单价</div>
                <div class="cart-column quantity-column">数量</div>
                <div class="cart-column subtotal-column">小计</div>
                <div class="cart-column action-column">操作</div>
              </div>

              <!-- 购物车项容器 -->
              <div :class="['cart-items', {'cart-items-grid': viewMode === 'card'}]">
                <transition-group
                  :name="viewMode === 'card' ? 'cart-grid-item' : 'cart-list-item'"
                  tag="div"
                  :class="{'grid-container': viewMode === 'card'}"
                >
                  <CartItem
                    v-for="item in cartItems"
                    :key="item.cartId"
                    :item="item"
                    :view-mode="viewMode"
                    :format-price="formatPrice"
                    @update-quantity="updateQuantity"
                    @remove-item="removeItemFromCart"
                    @toggle-selection="toggleCartItemSelection"
                    @go-to-product="goToProduct"
                    @image-error="handleImageError"
                    class="cart-item-wrapper"
                  />
                </transition-group>
              </div>

              <!-- 购物车底部 -->
              <div class="cart-footer">
                <div class="cart-footer-left">
                  <el-checkbox
                    :model-value="allSelected"
                    @change="toggleSelectAll"
                    :indeterminate="isIndeterminate"
                  >全选</el-checkbox>
                  <el-button link @click="removeSelectedItems" :disabled="!hasSelectedItems">删除选中商品</el-button>
                  <el-button link @click="clearCart" :disabled="cartItems.length === 0">清空购物车</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 侧边栏（结算摘要） -->
          <div class="cart-sidebar">
            <CartSummary 
              :subtotal="cartTotal"
              :discount="discount"
              :shipping="0"
              :tax="0"
              :total="cartTotal"
              :selected-item-count="selectedItemsCount"
              :format-price="formatPrice"
              :loading="checkoutLoading"
              checkout-button-text="去结算"
              @checkout="handleCheckout"
            />
          </div>
        </div>
        
        <!-- 更新动画 -->
        <div class="cart-update-animation" v-if="showUpdateAnimation">
          <el-icon><Check /></el-icon>
          <span>更新成功</span>
        </div>
      </template>

      <!-- 空购物车提示 -->
      <div class="cart-layout" v-else>
        <!-- 主内容区 -->
        <div class="cart-main">
          <div class="cart-container">
            <EmptyCart
              :recommended-products="recommendedProducts"
              :format-price="formatPrice"
              @go-shopping="goShopping"
              @go-to-product="goToProduct"
              @add-to-cart="addRecommendedToCart"
            />
          </div>
        </div>
        
        <!-- 侧边栏 - 空购物车状态下也可以显示一些促销信息或帮助内容 -->
        <div class="cart-sidebar cart-sidebar-empty">
          <div class="help-card">
            <h3>购物指南</h3>
            <ul>
              <li>将商品加入购物车</li>
              <li>在购物车中调整数量</li>
              <li>结算并选择支付方式</li>
              <li>等待商品配送到家</li>
            </ul>
            <el-button 
              type="primary" 
              plain
              size="small"
              class="mt-3"
              @click="goShopping"
            >
              立即开始购物
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { ShoppingCart, Check, List, Grid, Warning, Lock, Picture } from '@element-plus/icons-vue';

// 导入组件和工具函数
import CartItem from '@/components/cart/CartItem.vue';
import CartSkeleton from '@/components/cart/CartSkeleton.vue';
import EmptyCart from '@/components/cart/EmptyCart.vue';
import CartSummary from '@/components/cart/CartSummary.vue';
import useCartAnimation from '@/scripts/useCartAnimation';
import useCart from '@/scripts/Cart';

// 视图模式
const viewMode = ref('list'); // 'list' 或 'card'

// 获取购物车功能
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

// 获取动画工具函数
const {
  cartUpdated,
  showUpdateAnimation,
  showItemUpdateAnimation
} = useCartAnimation();

// 优惠折扣
const discount = ref(0);

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

// 更新商品数量的代理函数
const updateQuantity = (item, quantity) => {
  updateQuantityDirectly(item, quantity);
  // 显示更新动画
  showItemUpdateAnimation();
};

// 添加推荐商品到购物车
const addRecommendedToCart = async (product) => {
  if (!product || !product.id) {
    ElMessage.warning('商品信息不完整，无法添加到购物车');
    return;
  }
  
  try {
    await increaseQuantity({
      cartId: product.id,
      productId: product.id,
      quantity: 1
    });
    
    ElMessage.success(`已成功添加 ${product.title || '商品'} 到购物车`);
  } catch (error) {
    console.error('添加推荐商品失败:', error);
    ElMessage.error('添加到购物车失败，请稍后再试');
  }
};

// 跳转到登录页面
const goToLogin = () => {
  window.location.href = '/login?redirect=/cart';
};

// 处理视图模式变化
const handleViewModeChange = (newMode) => {
  // 应用动画或其他效果
  document.querySelector('.cart-items')?.classList.add('view-mode-changing');
  
  // 200ms后移除动画类，与transition-duration保持一致
  setTimeout(() => {
    document.querySelector('.cart-items')?.classList.remove('view-mode-changing');
  }, 200);
  
  // 保存用户偏好
  try {
    localStorage.setItem('cart-view-mode', newMode);
  } catch (e) {
    console.warn('无法存储视图模式首选项:', e);
  }
};

// 组件加载时
onMounted(() => {
  // 从localStorage读取用户偏好的视图模式
  try {
    const savedViewMode = localStorage.getItem('cart-view-mode');
    if (savedViewMode && ['list', 'card'].includes(savedViewMode)) {
      viewMode.value = savedViewMode;
    }
  } catch (e) {
    console.warn('无法读取视图模式首选项:', e);
  }
});
</script>

<style lang="scss">
@import '@/styles/Cart.scss';

/* 新增样式，自定义动画和卡片网格布局等 */

/* 如果未额外定义网格类，确保在这里定义它以支持卡片视图 */
.cart-items-grid {
  margin-bottom: 20px;
  
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

/* 购物车布局处理 */
.cart-layout {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  .cart-main {
    flex: 1;
    min-width: 0; /* 防止flex子项溢出 */
  }
  
  .cart-sidebar {
    width: 340px;
    flex-shrink: 0;
  }
  
  @media (max-width: 991px) {
    flex-direction: column;
    
    .cart-sidebar {
      width: 100%;
    }
  }
}

/* 视图切换控制器样式 */
.view-mode-switch {
  .el-radio-button__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .el-icon {
      font-size: 16px;
      transition: transform 0.2s;
    }
    
    &:hover .el-icon {
      transform: scale(1.2);
    }
  }

  .is-active {
    .el-radio-button__inner {
      font-weight: 600;
      
      .el-icon {
        transform: scale(1.1);
      }
    }
  }
}

/* 列表项目过渡动画 */
.cart-list-item-enter-active,
.cart-list-item-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-list-item-enter-from,
.cart-list-item-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.cart-list-item-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 网格项目过渡动画 */
.cart-grid-item-enter-active,
.cart-grid-item-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-grid-item-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.cart-grid-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.cart-grid-item-move {
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 价格增加/减少动画 */
.price-increase {
  color: #67c23a;
  transition: color 0.5s;
}

.price-decrease {
  color: #f56c6c;
  transition: color 0.5s;
}

/* 数量增加/减少动画 */
.quantity-increase {
  color: #67c23a;
  transition: all 0.3s;
}

.quantity-decrease {
  color: #f56c6c;
  transition: all 0.3s;
}

/* 动画组件 */
.cart-update-animation {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(103, 194, 58, 0.9);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2000;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s forwards;
  
  .el-icon {
    font-size: 18px;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 视图模式切换动画 */
.view-mode-changing {
  transition: opacity 0.2s ease-out;
  opacity: 0.5;
}

/* 在小屏幕上隐藏文本，仅显示图标 */
@media (max-width: 575.98px) {
  .d-none {
    display: none !important;
  }
  
  .d-sm-inline {
    display: inline !important;
  }
}

/* 帮助卡片样式 */
.help-card {
  background-color: var(--cart-bg-color);
  border-radius: var(--cart-border-radius-medium);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  border: 1px solid var(--cart-border-color);
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
    color: var(--cart-text-color);
  }
  
  ul {
    padding-left: 20px;
    margin-bottom: 15px;
    
    li {
      margin-bottom: 8px;
      color: var(--cart-text-light-color);
    }
  }
}

/* 空购物车特殊样式 */
.cart-sidebar-empty {
  @media (max-width: 991px) {
    display: none; /* 在小屏幕上隐藏辅助内容 */
  }
}
</style> 