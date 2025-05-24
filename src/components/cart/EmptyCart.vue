<template>
  <div class="empty-cart-container">
    <div class="empty-cart-content">
      <!-- 图标和标题部分 -->
      <div class="empty-cart-icon">
        <div class="cart-icon-wrapper">
          <template v-if="imageLoaded">
            <img 
              src="@/assets/images/empty-cart.svg" 
              alt="购物车空空如也" 
              @error="handleImageError"
            />
          </template>
          
          <!-- 备用内联SVG图标 -->
          <template v-else-if="useInlineSvg">
            <svg width="80" height="80" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <circle fill="#f2f2f2" cx="100" cy="100" r="100"></circle>
              <g transform="translate(35, 45)">
                <path d="M123,68 L37,68 C34.791,68 33,69.791 33,72 C33,74.209 34.791,76 37,76 L123,76 C125.209,76 127,74.209 127,72 C127,69.791 125.209,68 123,68 Z" fill="#A0A0A0"></path>
                <path d="M127,54 L33,54 L23,14 L5,14 C2.791,14 1,15.791 1,18 C1,20.209 2.791,22 5,22 L17,22 L27,62 C27.835,65.254 30.751,68 34,68 L123,68 C126.866,68 130,64.866 130,61 L130,57 C130,55.343 128.657,54 127,54 Z" fill="#C0C0C0"></path>
                <path d="M117,88 C112.582,88 109,91.582 109,96 C109,100.418 112.582,104 117,104 C121.418,104 125,100.418 125,96 C125,91.582 121.418,88 117,88 Z" fill="#A0A0A0"></path>
                <path d="M47,88 C42.582,88 39,91.582 39,96 C39,100.418 42.582,104 47,104 C51.418,104 55,100.418 55,96 C55,91.582 51.418,88 47,88 Z" fill="#A0A0A0"></path>
              </g>
              <g transform="translate(80, 80)" stroke="#FF6B6B" stroke-width="4">
                <line x1="0" y1="0" x2="40" y2="40"></line>
                <line x1="40" y1="0" x2="0" y2="40"></line>
              </g>
            </svg>
          </template>
          
          <!-- 使用Element Plus图标作为最后备选 -->
          <el-icon v-else class="empty-cart-icon-el"><ShoppingCart /></el-icon>
          
          <div class="cart-icon-animation"></div>
        </div>
      </div>
      
      <!-- 标题和描述 -->
      <h2 class="empty-cart-title">{{ title }}</h2>
      <p class="empty-cart-description">{{ description }}</p>
      
      <!-- 操作按钮 -->
      <div class="empty-cart-actions">
        <el-button type="primary" @click="goShopping" :loading="loading">
          {{ primaryButtonText }}
        </el-button>
        <el-button v-if="showSecondaryButton" @click="$emit('secondary-action')">
          {{ secondaryButtonText }}
        </el-button>
      </div>
      
      <!-- 推荐商品部分 -->
      <div class="recommended-products" v-if="showRecommended && recommendedProducts.length > 0">
        <h3 class="recommended-title">您可能感兴趣的商品</h3>
        <div class="recommended-list">
          <div
            v-for="product in recommendedProducts"
            :key="product.id"
            class="recommended-item"
            @click="goToProduct(product.id)"
          >
            <div class="recommended-image">
              <el-image :src="product.image" fit="cover" lazy>
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="recommended-details">
              <div class="recommended-name">{{ product.title }}</div>
              <div class="recommended-price">¥{{ formatPrice(product.price) }}</div>
            </div>
            <el-button size="small" class="recommend-add-btn" @click.stop="addToCart(product)">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';
import { ShoppingCart, Picture, Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

// 自定义图标加载状态
const imageLoaded = ref(true);

// 使用内联SVG作为备选
const useInlineSvg = ref(true);

// 处理图片加载错误
const handleImageError = () => {
  imageLoaded.value = false;
  console.warn('购物车图标加载失败，使用备用图标替代');
};

const props = defineProps({
  title: {
    type: String,
    default: '购物车空空如也'
  },
  description: {
    type: String,
    default: '您的购物车还没有商品，快去选购心仪的商品吧！'
  },
  primaryButtonText: {
    type: String,
    default: '去购物'
  },
  secondaryButtonText: {
    type: String,
    default: '查看我的收藏'
  },
  showSecondaryButton: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  customIconUrl: {
    type: String,
    default: ''
  },
  recommendedProducts: {
    type: Array,
    default: () => ([])
  },
  showRecommended: {
    type: Boolean,
    default: true
  },
  formatPrice: {
    type: Function,
    default: (price) => price.toFixed(2)
  }
});

const emit = defineEmits(['go-shopping', 'secondary-action', 'go-to-product', 'add-to-cart']);

const router = useRouter();

// 跳转到商城首页
const goShopping = () => {
  emit('go-shopping');
};

// 跳转到商品详情页
const goToProduct = (productId) => {
  emit('go-to-product', productId);
};

// 添加商品到购物车
const addToCart = (product) => {
  emit('add-to-cart', product);
};
</script>

<style lang="scss" scoped>
.empty-cart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  width: 100%;
  
  .empty-cart-content {
    max-width: 600px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .empty-cart-icon {
    margin-bottom: 20px;
    
    .cart-icon-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      
      img, .el-icon {
        width: 80px;
        height: 80px;
        color: #c0c4cc;
        z-index: 2;
      }
      
      .el-icon {
        font-size: 80px;
      }
      
      .cart-icon-animation {
        position: absolute;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(90deg, rgba(236, 236, 236, 0.5) 0%, rgba(246, 246, 246, 0.8) 100%);
        z-index: 1;
        animation: pulse 2s ease-in-out infinite;
      }
    }
  }
  
  .empty-cart-title {
    font-size: 24px;
    color: #303133;
    margin: 0 0 10px;
    font-weight: 500;
  }
  
  .empty-cart-description {
    color: #606266;
    font-size: 16px;
    margin: 0 0 30px;
    max-width: 400px;
    line-height: 1.6;
  }
  
  .empty-cart-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 40px;
  }
  
  // 推荐商品样式
  .recommended-products {
    width: 100%;
    margin-top: 20px;
    
    .recommended-title {
      font-size: 18px;
      color: #303133;
      margin-bottom: 20px;
      font-weight: 500;
      text-align: left;
    }
    
    .recommended-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }
    
    .recommended-item {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      transition: all 0.3s;
      position: relative;
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.08);
        
        .recommended-image {
          .el-image {
            transform: scale(1.05);
          }
        }
        
        .recommend-add-btn {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
    
    .recommended-image {
      height: 150px;
      overflow: hidden;
      
      .el-image {
        width: 100%;
        height: 100%;
        transition: transform 0.5s ease;
      }
      
      .image-error {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f7f7f7;
        color: #999;
      }
    }
    
    .recommended-details {
      padding: 10px;
      text-align: left;
    }
    
    .recommended-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 5px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }
    
    .recommended-price {
      color: #ff6b6b;
      font-weight: 600;
      font-size: 15px;
    }
    
    .recommend-add-btn {
      position: absolute;
      right: 10px;
      bottom: 10px;
      width: 30px;
      height: 30px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s;
      background-color: var(--el-color-primary);
      color: white;
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
}

// 动画
@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .empty-cart-container {
    padding: 20px 15px;
    
    .empty-cart-title {
      font-size: 20px;
    }
    
    .empty-cart-description {
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .recommended-products {
      .recommended-list {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}

.empty-cart-icon-el {
  font-size: 80px;
  color: #c0c4cc;
}
</style> 