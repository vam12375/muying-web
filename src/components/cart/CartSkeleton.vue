<template>
  <div class="cart-skeleton">
    <!-- 列表模式骨架屏 -->
    <div v-if="mode === 'list'" class="cart-skeleton-list">
      <div
        v-for="item in count"
        :key="item"
        class="skeleton-item-list"
        :style="{ animationDelay: `${item * 0.05}s` }"
      >
        <div class="skeleton-item-inner">
          <div class="skeleton-checkbox"></div>
          <div class="skeleton-image"></div>
          <div class="skeleton-details">
            <div class="skeleton-title"></div>
            <div class="skeleton-specs"></div>
          </div>
          <div class="skeleton-price"></div>
          <div class="skeleton-quantity"></div>
          <div class="skeleton-subtotal"></div>
          <div class="skeleton-action"></div>
        </div>
      </div>
      
      <!-- 底部结算栏骨架屏 -->
      <div class="skeleton-footer">
        <div class="skeleton-footer-left">
          <div class="skeleton-checkbox"></div>
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
        <div class="skeleton-footer-right">
          <div class="skeleton-total"></div>
          <div class="skeleton-checkout"></div>
        </div>
      </div>
    </div>
    
    <!-- 卡片模式骨架屏 -->
    <div v-else class="cart-skeleton-grid">
      <div class="skeleton-grid-container">
        <div
          v-for="item in count"
          :key="item"
          class="skeleton-item-card"
          :style="{ animationDelay: `${item * 0.05}s` }"
        >
          <div class="skeleton-checkbox"></div>
          <div class="skeleton-image-large"></div>
          <div class="skeleton-card-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-specs"></div>
            <div class="skeleton-price"></div>
            <div class="skeleton-controls">
              <div class="skeleton-quantity-control"></div>
              <div class="skeleton-button-small"></div>
            </div>
            <div class="skeleton-subtotal"></div>
          </div>
        </div>
      </div>
      
      <!-- 底部结算栏骨架屏 -->
      <div class="skeleton-footer">
        <div class="skeleton-footer-left">
          <div class="skeleton-checkbox"></div>
          <div class="skeleton-button"></div>
          <div class="skeleton-button"></div>
        </div>
        <div class="skeleton-footer-right">
          <div class="skeleton-total"></div>
          <div class="skeleton-checkout"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  mode: {
    type: String,
    default: 'list', // 'list' 或 'card'
    validator: (value) => ['list', 'card'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  }
});
</script>

<style lang="scss" scoped>
.cart-skeleton {
  width: 100%;
  
  // 共享的骨架屏样式
  [class^="skeleton-"] {
    background: linear-gradient(90deg, #f2f2f2 25%, #e6e6e6 37%, #f2f2f2 63%);
    background-size: 400% 100%;
    animation: skeleton-loading 1.4s ease infinite;
    border-radius: 4px;
  }
  
  // 列表模式骨架屏
  &-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .skeleton-item-list {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      overflow: hidden;
      
      &-inner {
        padding: 15px;
        display: flex;
        align-items: center;
      }
    }
    
    .skeleton-checkbox {
      width: 18px;
      height: 18px;
      margin: 0 10px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .skeleton-image {
      width: 80px;
      height: 80px;
      margin-right: 15px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    
    .skeleton-details {
      flex: 2;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .skeleton-title {
      height: 16px;
      width: 70%;
    }
    
    .skeleton-specs {
      height: 24px;
      width: 40%;
    }
    
    .skeleton-price,
    .skeleton-subtotal {
      height: 20px;
      width: 60px;
      margin: 0 10px;
      flex-shrink: 0;
    }
    
    .skeleton-quantity {
      height: 32px;
      width: 110px;
      margin: 0 10px;
      flex-shrink: 0;
    }
    
    .skeleton-action {
      height: 20px;
      width: 40px;
      margin: 0 10px;
      flex-shrink: 0;
    }
  }
  
  // 卡片模式骨架屏
  &-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    
    .skeleton-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    
    .skeleton-item-card {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      overflow: hidden;
      position: relative;
      height: 360px;
    }
    
    .skeleton-checkbox {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      z-index: 1;
    }
    
    .skeleton-image-large {
      width: 100%;
      height: 200px;
    }
    
    .skeleton-card-content {
      padding: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .skeleton-title {
      height: 16px;
      width: 90%;
    }
    
    .skeleton-specs {
      height: 24px;
      width: 60%;
    }
    
    .skeleton-price {
      height: 20px;
      width: 70px;
    }
    
    .skeleton-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .skeleton-quantity-control {
      height: 32px;
      width: 110px;
    }
    
    .skeleton-button-small {
      height: 32px;
      width: 32px;
      border-radius: 4px;
    }
    
    .skeleton-subtotal {
      height: 20px;
      width: 100px;
      align-self: flex-end;
    }
  }
  
  // 底部结算栏骨架屏
  .skeleton-footer {
    margin-top: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &-left {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .skeleton-checkbox {
        width: 18px;
        height: 18px;
        border-radius: 4px;
      }
      
      .skeleton-button {
        width: 80px;
        height: 32px;
        border-radius: 4px;
      }
    }
    
    &-right {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .skeleton-total {
        width: 150px;
        height: 24px;
      }
      
      .skeleton-checkout {
        width: 120px;
        height: 40px;
        border-radius: 20px;
      }
    }
  }
}

// 骨架屏动画
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

// 响应式布局
@media (max-width: 768px) {
  .cart-skeleton {
    &-list {
      .skeleton-item-list {
        &-inner {
          flex-wrap: wrap;
        }
        
        .skeleton-details {
          flex: 1 0 calc(100% - 95px);
        }
        
        .skeleton-price,
        .skeleton-quantity,
        .skeleton-subtotal,
        .skeleton-action {
          margin-top: 15px;
        }
      }
    }
    
    .skeleton-footer {
      flex-direction: column;
      gap: 15px;
      
      &-left, &-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style> 