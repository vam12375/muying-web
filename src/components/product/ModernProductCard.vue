<template>
  <div 
    class="product-card"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="product-image-container">
      <div 
        class="product-image"
        :class="{ 'scale-105': isHovered }"
      >
        <el-image 
          :src="product.image ? `/products/${product.image.replace(/^.*[\\\/]/, '')}` : ''" 
          :alt="product.name"
          fit="cover"
          loading="lazy"
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
      </div>
      
      <!-- 悬浮操作区 -->
      <transition name="fade-up">
        <div v-if="isHovered" class="hover-actions">
          <el-button 
            type="danger" 
            class="buy-now-btn"
            @click="buyNow"
          >
            <el-icon class="mr-1"><ShoppingCart /></el-icon>
            立即购买
          </el-button>
        </div>
      </transition>
    </div>
    
    <div class="product-info">
      <div class="name-price-row">
        <h3 class="product-name">{{ product.name }}</h3>
        <div class="product-price">
          <span class="current-price">¥{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice > product.price" class="original-price">¥{{ formatPrice(product.originalPrice) }}</span>
        </div>
      </div>
      
      <p class="product-brief">{{ product.brief || '暂无描述' }}</p>
      
      <!-- 颜色选项 -->
      <div v-if="product.colors && product.colors.length" class="color-options">
        <div 
          v-for="(color, index) in product.colors" 
          :key="index"
          class="color-option"
          :class="{ 'active': activeColor === index }"
          :style="{ backgroundColor: color }"
          @click="activeColor = index"
        ></div>
      </div>
      
      <div class="product-footer">
        <div class="product-rating">
          <el-rate 
            v-model="product.rating" 
            disabled 
            :colors="['#F7BA2A', '#F7BA2A', '#F7BA2A']"
          />
          <span v-if="product.reviewCount" class="review-count">({{ product.reviewCount }})</span>
        </div>
        
        <div class="product-actions">
          <el-button 
            class="view-details-btn" 
            size="small" 
            @click="goToProduct"
          >
            <el-icon><View /></el-icon>
            详情
          </el-button>
          <el-button 
            class="add-cart-btn"
            size="small"
            type="primary"
            @click="addToCart"
          >
            <el-icon><ShoppingCart /></el-icon>
            加入购物车
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ShoppingCart, View, Picture } from '@element-plus/icons-vue';

// 定义props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const isHovered = ref(false);
const activeColor = ref(0);

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
const addToCart = () => {
  // 此处应该调用实际的添加购物车API或与Vuex/Pinia状态管理集成
  ElMessage.success('已添加到购物车');
};

// 立即购买
const buyNow = () => {
  // 创建一个购买的商品项数组，只包含当前商品
  const buyItem = {
    id: props.product.id,
    quantity: 1,
    // 如果有颜色选择，也可以传递颜色信息
    colorId: props.product.colors ? activeColor.value : null
  };
  
  // 将商品信息保存到localStorage，供结算页面使用
  localStorage.setItem('checkoutItems', JSON.stringify([buyItem]));
  
  // 跳转到结算页面
  router.push('/checkout');
};
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid transparent;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
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
  transition: transform 0.5s;
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
}

.product-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
}

.new-badge {
  background-color: var(--el-color-success);
  color: white;
}

.discount-badge {
  background-color: var(--el-color-danger);
  color: white;
}

.hover-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  padding: 15px;
  z-index: 20;
}

.buy-now-btn {
  width: 100%;
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.name-price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: flex-start;
}

.product-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  white-space: nowrap;
  margin-left: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-danger);
}

.original-price {
  font-size: 12px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 5px;
}

.product-brief {
  font-size: 13px;
  color: #606266;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  height: 3em;
}

.color-options {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.color-option {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.color-option.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--el-color-primary);
}

.product-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-rating {
  display: flex;
  align-items: center;
}

.product-rating :deep(.el-rate) {
  --el-rate-icon-size: 16px;
}

.review-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.product-actions {
  display: flex;
  gap: 8px;
}

/* Animation */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style> 