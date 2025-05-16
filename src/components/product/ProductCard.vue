<template>
  <div 
    class="product-card" 
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    @click="goToProduct"
  >
    <div class="product-image relative overflow-hidden">
      <img :src="product.image ? `/products/${product.image.replace(/^.*[\\\/]/, '')}` : ''" :alt="product.name" class="w-full h-full object-cover transition-transform duration-300">
      
      <!-- 标签 -->
      <div class="product-badges absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="product.isNew" class="badge new-badge bg-green-500 text-white text-xs px-2 py-0.5 rounded">新品</span>
        <span v-if="product.discount" class="badge discount-badge bg-primary text-white text-xs px-2 py-0.5 rounded">{{ formatDiscount(product.discount) }}折</span>
      </div>
      
      <!-- 添加悬浮操作区 -->
      <transition name="fade-up">
        <div class="hover-actions" v-show="isHovered">
          <el-button 
            type="danger" 
            class="buy-now-btn"
            @click.stop="buyNow"
          >
            <el-icon class="mr-1"><ShoppingCart /></el-icon>
            立即购买
          </el-button>
        </div>
      </transition>
    </div>
    
    <div class="product-info p-3">
      <h3 class="product-name text-sm font-medium text-gray-800 mb-1 line-clamp-2">{{ product.name }}</h3>
      
      <div class="product-rating flex items-center mt-2 mb-2">
        <el-rate
          v-model="product.rating"
          disabled
          size="small"
          :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
        ></el-rate>
        <span class="text-xs text-gray-500 ml-1">{{ product.rating }}</span>
      </div>
      
      <div class="product-price flex items-center">
        <span class="text-primary font-bold">¥{{ formatPrice(product.price) }}</span>
        <span v-if="product.originalPrice > product.price" class="text-gray-400 text-xs line-through ml-2">
          ¥{{ formatPrice(product.originalPrice) }}
        </span>
      </div>
      
      <!-- 添加购买和购物车按钮 -->
      <div class="product-actions mt-2 flex space-x-2">
        <el-button 
          type="primary" 
          size="small" 
          class="add-cart-btn"
          @click.stop="addToCart"
        >
          <el-icon class="mr-1"><ShoppingCart /></el-icon>
          加入购物车
        </el-button>
        <el-button 
          type="danger" 
          size="small"
          class="buy-now-btn"
          @click.stop="buyNow"
        >
          <el-icon class="mr-1"><ShoppingBag /></el-icon>
          立即购买
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ShoppingCart, ShoppingBag } from '@element-plus/icons-vue';

// 定义props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const isHovered = ref(false);

// 格式化价格
const formatPrice = (price) => {
  return price.toFixed(2);
};

// 格式化折扣
const formatDiscount = (discount) => {
  return (discount * 10).toFixed(0);
};

// 跳转到商品详情页
const goToProduct = () => {
  router.push(`/product/${props.product.id}`);
};

// 添加到购物车
const addToCart = (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  // 此处应该调用实际的添加购物车API或与Vuex/Pinia状态管理集成
  ElMessage.success('已添加到购物车');
};

// 立即购买
const buyNow = (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  // 检查用户是否已登录
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('请先登录后再购买商品');
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return;
  }
  
  try {
    // 清除其他可能影响结算页面的数据
    localStorage.removeItem('checkoutItems');
    
    // 构建订单项，包含完整的商品信息
    const orderItem = {
      id: props.product.id,
      goodsId: props.product.id,
      productId: props.product.id,
      name: props.product.name,
      goodsName: props.product.name,
      price: parseFloat(props.product.price).toFixed(2),
      unitPrice: parseFloat(props.product.price).toFixed(2),
      image: props.product.image,
      goodsImg: props.product.image,
      quantity: 1,
      count: 1,
      spec: props.product.spec || '',
      specs: props.product.specs || '',
      // 添加额外信息以帮助结算页面处理
      fromSource: 'buyNow',
      timestamp: Date.now() // 添加时间戳防止缓存问题
    };
    
    console.log('立即购买商品信息:', orderItem);
    
    // 保存到本地存储，用于结算页面获取
    localStorage.setItem('buyNow', JSON.stringify(orderItem));
    
    // 同时保存到orderProductsMap用于订单列表和详情显示
    try {
      const orderProductsMap = JSON.parse(localStorage.getItem('orderProductsMap') || '{}');
      const tempOrderId = 'temp_buy_now_' + Date.now();
      orderProductsMap[tempOrderId] = [orderItem];
      localStorage.setItem('orderProductsMap', JSON.stringify(orderProductsMap));
      
      // 显示成功提示
      ElMessage.success({
        message: '正在前往结算页面...',
        duration: 1500
      });
      
      // 跳转到结算页面
      setTimeout(() => {
        router.push('/checkout');
      }, 300);
    } catch (e) {
      console.error('保存订单商品信息到本地存储失败:', e);
      ElMessage.error('准备结算信息失败，请重试');
    }
  } catch (error) {
    console.error('立即购买失败:', error);
    ElMessage.error('立即购买失败: ' + (error.message || '未知错误'));
  }
};
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-image {
  height: 160px;
  position: relative;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5rem;
}

.bg-primary {
  background-color: #ff85a2;
}

.text-primary {
  color: #ff85a2;
}

/* 悬浮操作区样式 */
.hover-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 10px;
  z-index: 2;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
}

/* Transition for hover actions */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.product-card:hover .hover-actions {
  opacity: 1;
  transform: translateY(0);
}

.buy-now-btn {
  width: 100%;
  transition: all 0.2s ease;
}

.buy-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 产品操作按钮样式 */
.product-actions {
  display: flex;
  gap: 8px;
}

.add-cart-btn,
.buy-now-btn {
  flex: 1;
  font-size: 12px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-cart-btn:hover,
.buy-now-btn:hover {
  transform: translateY(-2px);
}
</style> 