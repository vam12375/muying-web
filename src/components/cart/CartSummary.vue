<template>
  <div class="cart-summary" :class="{ 'is-sticky': isSticky, 'is-mobile': isMobile }">
    <div class="cart-summary-container">
      <!-- 标题 -->
      <div class="cart-summary-header">
        <h3 class="summary-title">订单摘要</h3>
        <span v-if="!isMobile" class="summary-item-count">{{ selectedItemCount }} 件商品</span>
      </div>
      
      <!-- 小计 -->
      <div class="summary-section">
        <div class="summary-row">
          <span>商品小计</span>
          <span class="summary-price">¥{{ formatPrice(subtotal) }}</span>
        </div>
        
        <!-- 运费 -->
        <div class="summary-row">
          <span>运费</span>
          <span class="summary-price">
            <span v-if="shipping === 0">免运费</span>
            <span v-else>¥{{ formatPrice(shipping) }}</span>
          </span>
        </div>
        
        <!-- 优惠折扣 -->
        <div class="summary-row discount-row" v-if="discount > 0">
          <span>优惠</span>
          <span class="summary-price discount">-¥{{ formatPrice(discount) }}</span>
        </div>
        
        <!-- 税费 -->
        <div class="summary-row" v-if="tax > 0">
          <span>税费</span>
          <span class="summary-price">¥{{ formatPrice(tax) }}</span>
        </div>
      </div>
      
      <!-- 分割线 -->
      <div class="summary-divider"></div>
      
      <!-- 总计 -->
      <div class="summary-total">
        <span class="total-label">合计</span>
        <span class="total-price">¥{{ formatPrice(total) }}</span>
      </div>
      
      <!-- 操作按钮 -->
      <div class="summary-actions">
        <div v-if="isMobile" class="mobile-summary-info">
          <span class="selected-count">已选 {{ selectedItemCount }} 件</span>
          <span class="total-text">合计: <span class="total-price-mobile">¥{{ formatPrice(total) }}</span></span>
        </div>
        
        <el-button
          type="primary"
          class="checkout-button"
          :disabled="selectedItemCount === 0 || checkoutDisabled"
          :loading="loading"
          @click="handleCheckout"
        >
          {{ checkoutButtonText }}
        </el-button>
      </div>
      
      <!-- 结算提示 -->
      <div class="checkout-tips" v-if="showTips">
        <el-alert
          :title="tipsTitle"
          :type="tipsType"
          :description="tipsDescription"
          :closable="false"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  subtotal: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  selectedItemCount: {
    type: Number,
    default: 0
  },
  formatPrice: {
    type: Function,
    default: (price) => price.toFixed(2)
  },
  checkoutButtonText: {
    type: String,
    default: '结算'
  },
  loading: {
    type: Boolean,
    default: false
  },
  checkoutDisabled: {
    type: Boolean,
    default: false
  },
  tipsTitle: {
    type: String,
    default: '温馨提示'
  },
  tipsDescription: {
    type: String,
    default: '请确认您的订单信息无误后再进行结算'
  },
  tipsType: {
    type: String,
    default: 'info'
  },
  showTips: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['checkout']);

const isSticky = ref(false);
const isMobile = ref(false);

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth < 768;
  
  // 在移动设备上自动禁用粘性定位，改为固定底栏
  if (isMobile.value) {
    isSticky.value = false;
  } else {
    handleScroll(); // 重新检查滚动位置
  }
};

// 处理滚动事件，实现粘性定位效果
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  isSticky.value = scrollTop > 100; // 当滚动超过100px时，启用粘性定位
};

// 处理结算按钮点击
const handleCheckout = () => {
  emit('checkout');
};

// 生命周期钩子
onMounted(() => {
  checkDeviceType();
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', checkDeviceType);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', checkDeviceType);
});
</script>

<style lang="scss" scoped>
.cart-summary {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  transition: all 0.3s ease;
  width: 100%;
  
  &.is-sticky {
    position: sticky;
    top: 20px;
    animation: slide-down 0.3s ease;
  }
  
  &-container {
    max-width: 400px;
    margin: 0 auto;
  }
  
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    
    .summary-title {
      font-size: 18px;
      color: #303133;
      margin: 0;
      font-weight: 500;
    }
    
    .summary-item-count {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .summary-section {
    margin-bottom: 15px;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 14px;
    color: #606266;
    
    &.discount-row {
      .discount {
        color: #67c23a;
      }
    }
    
    .summary-price {
      font-weight: 500;
      color: #303133;
    }
  }
  
  .summary-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
    margin: 15px 0;
  }
  
  .summary-total {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    margin-bottom: 20px;
    
    .total-label {
      font-size: 16px;
      color: #303133;
      font-weight: 500;
    }
    
    .total-price {
      font-size: 22px;
      color: var(--el-color-danger);
      font-weight: 700;
    }
  }
  
  .summary-actions {
    .checkout-button {
      width: 100%;
      height: 44px;
      border-radius: 22px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 1px;
      background: var(--el-color-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s;
      
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
  }
  
  .checkout-tips {
    margin-top: 15px;
    
    .el-alert {
      border-radius: 4px;
    }
  }
  
  // 移动端样式适配
  &.is-mobile {
    padding: 15px;
    border-radius: 0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.08);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    backdrop-filter: blur(10px); /* 添加模糊效果增强视觉体验 */
    
    .cart-summary-container {
      width: 100%;
      max-width: 100%;
    }
    
    .summary-header,
    .summary-section,
    .summary-divider,
    .summary-total {
      display: none;
    }
    
    .summary-actions {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .mobile-summary-info {
        flex: 1;
        
        .selected-count {
          display: block;
          font-size: 12px;
          color: #606266;
          margin-bottom: 2px;
        }
        
        .total-text {
          font-size: 14px;
          color: #303133;
          
          .total-price-mobile {
            font-size: 18px;
            color: var(--el-color-danger);
            font-weight: 600;
          }
        }
      }
      
      .checkout-button {
        flex: none;
        width: auto;
        min-width: 120px;
        padding: 0 25px;
      }
    }
    
    .checkout-tips {
      margin-top: 10px;
      
      .el-alert {
        padding: 8px 12px;
      }
    }
  }
}

// 动画
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 