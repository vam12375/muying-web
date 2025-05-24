<template>
  <div 
    class="enhanced-product-card"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="product-image-container">
      <!-- 商品图片 -->
      <div 
        class="product-image"
        :class="{ 'scale-105': isHovered }"
      >
        <el-image 
          :src="getProductImageUrl(product)" 
          :alt="product.name"
          fit="cover"
          loading="lazy"
          @error="handleImageError"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
              <span>加载失败</span>
            </div>
          </template>
        </el-image>
      </div>
      
      <!-- 商品标签 -->
      <div class="product-badges">
        <span v-if="product.isNew" class="badge new-badge">新品</span>
        <span v-if="product.discount" class="badge discount-badge">{{ formatDiscount(product.discount) }}折</span>
        <span v-if="product.isFeatured" class="badge featured-badge">推荐</span>
      </div>
      
      <!-- 收藏按钮 -->
      <el-button 
        circle 
        size="small" 
        class="favorite-button"
        :class="{ 'is-favorited': isFavorite }"
        @click.stop="toggleFavorite"
      >
        <el-icon><Star /></el-icon>
      </el-button>
      
      <!-- 悬浮操作区 - 查看详情 -->
      <transition name="fade">
        <div v-if="isHovered" class="hover-actions view-details">
          <el-button 
            class="view-details-btn"
            @click.stop="goToProduct"
          >
            <el-icon><View /></el-icon>
            <span>查看详情</span>
          </el-button>
        </div>
      </transition>
    </div>
    
    <!-- 商品信息部分将在这里实现 -->
    <div class="product-info">
      <!-- 商品名称和价格 -->
      <div class="product-header">
        <h3 class="product-name" @click="goToProduct">{{ product.name }}</h3>
        <div class="product-price">
          <span class="current-price">¥{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
            ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>
      </div>
      
      <!-- 商品简介 -->
      <p v-if="product.brief" class="product-brief">{{ product.brief }}</p>
      
      <!-- 评分 -->
      <div class="product-rating">
        <el-rate 
          v-model="productRating" 
          disabled 
          :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
        />
        <span v-if="product.reviewCount" class="review-count">({{ product.reviewCount }})</span>
      </div>
      
      <!-- 颜色选项 -->
      <div v-if="product.colors && product.colors.length" class="color-options">
        <div 
          v-for="(color, index) in product.colors" 
          :key="index"
          class="color-option"
          :class="{ 'active': activeColor === index }"
          :style="{ backgroundColor: color }"
          @click.stop="activeColor = index"
        ></div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="product-actions">
        <el-button 
          type="primary" 
          size="small"
          class="add-cart-btn"
          @click.stop="addToCart"
          :loading="isAddingToCart"
          :disabled="isAddingToCart"
        >
          <el-icon v-if="!isAddingToCart"><ShoppingCart /></el-icon>
          加入购物车
        </el-button>
        <el-button 
          type="danger" 
          size="small"
          class="buy-now-btn"
          @click.stop="buyNow"
          :loading="isBuyingNow"
          :disabled="isBuyingNow"
        >
          <el-icon v-if="!isBuyingNow"><ShoppingBag /></el-icon>
          立即购买
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ShoppingCart, View, Picture, Star, ShoppingBag } from '@element-plus/icons-vue';
import { useCartStore } from '@/stores/cart'; // 引入购物车store
import { addFavorite, removeFavorite } from '@/api/user'; // 引入收藏相关API
import { isAuthenticated } from '@/utils/auth'; // 引入认证工具

// 定义props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  initialFavoriteState: {
    type: Boolean,
    default: false
  },
  favoriteId: {
    type: [String, Number],
    default: null
  }
});

// 初始化store和router
const router = useRouter();
const cartStore = useCartStore(); // 购物车store实例

// 计算属性
const productRating = computed(() => props.product.rating || 0);

// 状态变量
const isHovered = ref(false);
const isFavorite = ref(props.initialFavoriteState); // 使用props初始化收藏状态
const activeColor = ref(0);
const imageError = ref(false);
const isAddingToCart = ref(false); // 添加购物车状态
const isBuyingNow = ref(false); // 立即购买状态
const isTogglingFavorite = ref(false); // 收藏操作状态

// 格式化价格
const formatPrice = (price) => {
  return price?.toFixed(2) || '0.00';
};

// 格式化折扣
const formatDiscount = (discount) => {
  return discount ? (discount * 10).toFixed(0) : '';
};

// 跳转到商品详情页
const goToProduct = () => {
  router.push(`/product/${props.product.id}`);
};

// 添加到购物车
const addToCart = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (isAddingToCart.value) return; // 防止重复点击
  
  try {
    isAddingToCart.value = true;
    
    // 构建商品信息
    const productInfo = {
      id: props.product.id,
      productId: props.product.id,
      name: props.product.name,
      price: props.product.price,
      image: props.product.image,
      quantity: 1
    };
    
    // 调用购物车store的添加方法
    await cartStore.addProductToCart(productInfo, 1);
    ElMessage.success('已成功添加到购物车');
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error('添加到购物车失败: ' + (error.message || '未知错误'));
  } finally {
    isAddingToCart.value = false;
  }
};

// 切换收藏状态
const toggleFavorite = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  // 检查用户是否登录
  if (!isAuthenticated()) {
    console.log('用户未登录，重定向到登录页面');
    ElMessage.warning('请先登录后再收藏商品');
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
    return;
  }
  
  // 防止重复点击
  if (isTogglingFavorite.value) return;
  
  try {
    isTogglingFavorite.value = true;
    const productId = props.product.id;
    
    if (isFavorite.value) {
      // 取消收藏
      if (props.favoriteId) {
        // 如果有favoriteId，直接调用移除API
        console.log('正在取消收藏，favoriteId:', props.favoriteId);
        const res = await removeFavorite(props.favoriteId);
        if (res.code !== 200) {
          throw new Error(res.message || '取消收藏失败');
        }
        isFavorite.value = false;
        ElMessage.success('已取消收藏');
      } else {
        // 无favoriteId，提示刷新页面
        console.warn('无法找到favoriteId，可能需要刷新页面');
        ElMessage.warning('收藏状态可能已过期，请刷新页面重试');
      }
    } else {
      // 添加收藏
      console.log('正在添加收藏，productId:', productId);
      const res = await addFavorite(productId);
      console.log('收藏API响应:', res);
      if (res.code !== 200) {
        throw new Error(res.message || '添加收藏失败');
      }
      isFavorite.value = true;
      ElMessage.success('已添加到收藏夹');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('收藏操作失败: ' + (error.message || '未知错误'));
  } finally {
    isTogglingFavorite.value = false;
  }
};

// 立即购买
const buyNow = async (event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  if (isBuyingNow.value) return; // 防止重复点击
  
  try {
    isBuyingNow.value = true;
    
    // 检查用户是否已登录
    if (!isAuthenticated()) {
      console.log('用户未登录，重定向到登录页面');
      // 记住购买意图
      const buyIntention = {
        productId: props.product.id,
        action: 'buyNow',
        timestamp: Date.now()
      };
      localStorage.setItem('buyIntention', JSON.stringify(buyIntention));
      
      ElMessage.warning('请先登录后再购买商品');
      router.push({
        path: '/login',
        query: { 
          redirect: router.currentRoute.value.fullPath,
          action: 'buyNow',
          productId: props.product.id
        }
      });
      return;
    }
    
    // 清除购买意图，因为用户已登录
    localStorage.removeItem('buyIntention');
    
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
      // 如果有颜色选择，也可以传递颜色信息
      colorId: props.product.colors ? activeColor.value : null,
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
  } finally {
    isBuyingNow.value = false;
  }
};

// 处理图片错误
const handleImageError = () => {
  imageError.value = true;
};

// 获取商品图片地址
const getProductImageUrl = (product) => {
  //console.log('处理商品图片路径，原始商品数据:', product);
  
  // 检查多种可能的图片属性
  const imgPath = product.image || product.productImg || product.img || product.goodsImg || product.imageUrl;
  //console.log('获取到的原始图片路径:', imgPath);
  
  if (!imgPath) {
    console.warn('未找到图片路径，使用默认图片');
    return '/images/product-placeholder.jpg';
  }
  
  // 如果已经是完整路径则直接返回
  if (imgPath.startsWith('http') || imgPath.startsWith('/')) {
    //console.log('使用完整路径:', imgPath);
    return imgPath;
  }
  
  // 检查是否有路径分隔符，如果有则提取文件名
  let filename = imgPath;
  if (imgPath.includes('/') || imgPath.includes('\\')) {
    // 提取文件名
    filename = imgPath.split(/[/\\]/).pop();
    //console.log('从路径中提取文件名:', filename);
  }
  
  // 统一路径格式为'/products/文件名'
  const resultPath = `/products/${filename}`;
  //console.log('最终图片路径:', resultPath);
  return resultPath;
};

// 在组件挂载后打印调试信息
onMounted(() => {
  //console.log('EnhancedProductCard组件挂载 - 商品数据:', props.product);
  //console.log('用户登录状态:', isAuthenticated());
  //console.log('商品收藏状态:', isFavorite.value);
  //console.log('商品收藏ID:', props.favoriteId);
});
</script>

<style scoped>
.enhanced-product-card {
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.enhanced-product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-7);
}

.product-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.product-image {
  height: 100%;
  width: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.product-image.scale-105 {
  transform: scale(1.05);
}

.product-image :deep(.el-image) {
  display: block;
  width: 100%;
  height: 100%;
}

.image-error {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  gap: 8px;
  padding: 20px;
}

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  animation: badge-appear 0.4s ease forwards;
}

@keyframes badge-appear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-badge {
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
}

.discount-badge {
  background-color: rgba(245, 108, 108, 0.9);
  color: white;
}

.featured-badge {
  background-color: rgba(103, 194, 58, 0.9);
  color: white;
}

.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  opacity: 1;
  transform: none;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  transition: all 0.3s ease;
}

.enhanced-product-card:hover .favorite-button {
  transform: scale(1.1);
}

.favorite-button.is-favorited :deep(.el-icon) {
  color: #f56c6c;
  fill: #f56c6c;
}

.hover-actions {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 15;
}

.hover-actions.view-details {
  bottom: 0;
  left: 0;
  right: 0;
  height: auto;
  padding: 10px 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
}

.view-details-btn {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  color: #333;
  border: none;
  transition: transform 0.3s ease;
}

.view-details-btn:hover {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-header {
  margin-bottom: 8px;
}

.product-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.2s;
}

.product-name:hover {
  color: var(--el-color-primary);
}

.product-price {
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--el-color-danger);
}

.original-price {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
}

.product-brief {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.product-rating :deep(.el-rate) {
  line-height: 1;
}

.review-count {
  font-size: 12px;
  color: #909399;
  margin-left: 6px;
}

.color-options {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
}

.color-option.active {
  transform: scale(1.2);
  border-color: #fff;
  box-shadow: 0 0 0 1px var(--el-color-primary);
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.add-cart-btn, .buy-now-btn {
  flex: 1;
  font-weight: 600;
  font-size: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 0;
}

.add-cart-btn:hover, .buy-now-btn:hover {
  transform: translateY(-2px);
}

/* 动画效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style> 