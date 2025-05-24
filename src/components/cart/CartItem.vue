<template>
  <div
    :class="[
      'cart-item',
      { 'cart-item-card': viewMode === 'card', 'cart-item-list': viewMode === 'list' }
    ]"
  >
    <div class="cart-item-inner">
      <!-- 选择框部分 -->
      <div class="cart-item-select">
        <el-checkbox
          :model-value="selected === 1"
          @change="toggleSelection"
          :true-value="1"
          :false-value="0"
        ></el-checkbox>
      </div>

      <!-- 商品信息部分 -->
      <div class="cart-item-content">
        <!-- 商品图片 -->
        <div class="cart-item-image" @click="goToProduct">
          <el-image
            :src="item.image || '/products/goods1.jpg'"
            fit="cover"
            loading="lazy"
            @error="$emit('imageError', $event, item)"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <span v-if="viewMode === 'card'" class="image-hover-overlay">
            <el-icon><ZoomIn /></el-icon>
          </span>
        </div>

        <!-- 商品详情 -->
        <div class="cart-item-details">
          <h3 class="cart-item-title" @click="goToProduct">{{ item.title || '商品信息加载中...' }}</h3>
          
          <!-- 规格信息 -->
          <div class="cart-item-specs" v-if="item.specs && item.specs.length > 0">
            <span v-for="(spec, index) in item.specs" :key="index" class="spec-tag">{{ spec }}</span>
          </div>
          
          <!-- 卡片模式和列表模式的不同展示 -->
          <div v-if="viewMode === 'card'" class="cart-item-card-info">
            <div class="cart-item-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ formatPrice(item.price) }}</span>
            </div>
            
            <div class="cart-item-controls">
              <div class="quantity-control">
                <transition name="fade">
                  <el-button
                    class="quantity-btn minus"
                    size="small"
                    @click="decreaseQuantity"
                    :disabled="item.quantity <= 1"
                  >
                    <el-icon><Minus /></el-icon>
                  </el-button>
                </transition>
                <el-input
                  v-model.number="localQuantity"
                  size="small"
                  class="quantity-input"
                  @blur="updateQuantity"
                  @keyup.enter="updateQuantity"
                ></el-input>
                <transition name="fade">
                  <el-button
                    class="quantity-btn plus"
                    size="small"
                    @click="increaseQuantity"
                    :disabled="item.quantity >= (item.stock || 99)"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </transition>
              </div>
              
              <el-button
                class="cart-item-delete"
                link
                @click="removeItem"
                title="删除"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            
            <div class="cart-item-subtotal">
              <span>小计：</span>
              <span class="subtotal-value">¥{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>
        </div>

        <!-- 列表模式的附加元素 -->
        <template v-if="viewMode === 'list'">
          <div class="cart-item-price-col">
            <div class="price-label">单价</div>
            <div class="price">¥{{ formatPrice(item.price) }}</div>
          </div>
          
          <div class="cart-item-quantity-col">
            <div class="quantity-control">
              <el-button
                class="quantity-btn minus"
                size="small"
                @click="decreaseQuantity"
                :disabled="item.quantity <= 1"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
              <el-input
                v-model.number="localQuantity"
                size="small"
                class="quantity-input"
                @blur="updateQuantity"
                @keyup.enter="updateQuantity"
              ></el-input>
              <el-button
                class="quantity-btn plus"
                size="small"
                @click="increaseQuantity"
                :disabled="item.quantity >= (item.stock || 99)"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="cart-item-subtotal-col">
            <div class="subtotal-label">小计</div>
            <div class="subtotal">¥{{ formatPrice(item.subtotal) }}</div>
          </div>
          
          <div class="cart-item-action-col">
            <el-button
              link
              @click="removeItem"
              class="delete-btn"
            >
              删除
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { Minus, Plus, Picture, Delete, ZoomIn } from '@element-plus/icons-vue';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'list', // 'list' 或 'card'
    validator: (value) => ['list', 'card'].includes(value)
  },
  formatPrice: {
    type: Function,
    default: (price) => price.toFixed(2)
  }
});

const emit = defineEmits([
  'update-quantity',
  'remove-item',
  'toggle-selection',
  'go-to-product',
  'imageError'
]);

const localQuantity = ref(props.item.quantity);
const selected = computed(() => props.item.selected);

// 当数据源变化时更新本地数量
watch(() => props.item.quantity, (newVal) => {
  localQuantity.value = newVal;
});

// 商品数量增加
const increaseQuantity = () => {
  if (localQuantity.value < (props.item.stock || 99)) {
    const newQuantity = localQuantity.value + 1;
    emit('update-quantity', props.item, newQuantity);
  }
};

// 商品数量减少
const decreaseQuantity = () => {
  if (localQuantity.value > 1) {
    const newQuantity = localQuantity.value - 1;
    emit('update-quantity', props.item, newQuantity);
  }
};

// 直接更新商品数量
const updateQuantity = () => {
  let quantity = parseInt(localQuantity.value, 10);
  
  // 有效性检查
  if (isNaN(quantity) || quantity <= 0) {
    quantity = 1;
    localQuantity.value = 1;
  } else if (quantity > (props.item.stock || 99)) {
    quantity = props.item.stock || 99;
    localQuantity.value = quantity;
  }
  
  emit('update-quantity', props.item, quantity);
};

// 从购物车中移除商品
const removeItem = () => {
  emit('remove-item', props.item);
};

// 切换商品选择状态
const toggleSelection = () => {
  emit('toggle-selection', props.item);
};

// 跳转到商品详情页
const goToProduct = () => {
  emit('go-to-product', props.item.productId);
};
</script>

<style lang="scss" scoped>
.cart-item {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    transform: translateY(-2px);
  }
  
  // 共享样式
  &-inner {
    position: relative;
    display: flex;
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  &-select {
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &-content {
    flex: 1;
    display: flex;
  }
  
  &-image {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    
    .el-image {
      transition: transform 0.5s ease;
    }
    
    &:hover .el-image {
      transform: scale(1.05);
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
    
    .image-hover-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      color: white;
      
      .el-icon {
        font-size: 24px;
      }
    }
    
    &:hover .image-hover-overlay {
      opacity: 1;
    }
  }
  
  // 列表模式特定样式
  &-list {
    .cart-item {
      &-inner {
        padding: 15px;
      }
      
      &-content {
        display: flex;
        align-items: center;
      }
      
      &-image {
        width: 80px;
        height: 80px;
        margin-right: 15px;
        border-radius: 4px;
        flex-shrink: 0;
      }
      
      &-details {
        flex: 2;
        padding-right: 15px;
      }
      
      &-price-col, 
      &-quantity-col, 
      &-subtotal-col, 
      &-action-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
      }
      
      &-price-col {
        flex: 1;
        min-width: 100px;
      }
      
      &-quantity-col {
        flex: 1;
        min-width: 120px;
      }
      
      &-subtotal-col {
        flex: 1;
        min-width: 100px;
      }
      
      &-action-col {
        width: 60px;
        flex-shrink: 0;
      }
    }
  }
  
  // 卡片模式特定样式
  &-card {
    .cart-item {
      &-inner {
        flex-direction: column;
        height: 100%;
        padding: 0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          
          .cart-item-image::after {
            opacity: 1;
          }
        }
      }
      
      &-select {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 2;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        width: 28px;
        height: 28px;
        padding: 0;
      }
      
      &-content {
        flex-direction: column;
      }
      
      &-image {
        width: 100%;
        height: 200px;
        margin-right: 0;
        border-radius: 8px 8px 0 0;
        position: relative;
        overflow: hidden;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 60%, rgba(0, 0, 0, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .el-image {
          transition: transform 0.5s ease;
        }
        
        &:hover .el-image {
          transform: scale(1.08);
        }
      }
      
      &-details {
        padding: 15px;
      }
      
      &-card-info {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
      }
      
      &-price {
        font-size: 16px;
        color: var(--el-color-danger);
        font-weight: 600;
        
        .price-symbol {
          font-size: 14px;
          margin-right: 1px;
        }
      }
      
      &-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 5px;
      }
      
      &-subtotal {
        margin-top: 10px;
        text-align: right;
        font-size: 14px;
        color: #666;
        
        .subtotal-value {
          font-weight: 600;
          color: var(--el-color-danger);
          font-size: 16px;
        }
      }
      
      &-delete {
        color: #999;
        
        &:hover {
          color: var(--el-color-danger);
        }
      }
    }
  }
  
  // 标题样式
  &-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
    cursor: pointer;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    transition: color 0.2s;
    
    &:hover {
      color: var(--el-color-primary);
    }
  }
  
  // 规格标签样式
  &-specs {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 8px;
    
    .spec-tag {
      font-size: 12px;
      background-color: #f5f7fa;
      color: #666;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }
}

// 价格标签样式
.price-label,
.subtotal-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.price,
.subtotal {
  font-weight: 600;
  color: var(--el-color-danger);
}

.subtotal {
  font-size: 16px;
}

// 数量控制器样式
.quantity-control {
  display: flex;
  align-items: center;
  width: fit-content;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  
  .quantity-btn {
    padding: 0;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
    border: none;
    
    &:hover:not(:disabled) {
      background-color: #e9ecef;
      color: var(--el-color-primary);
    }
    
    &:disabled {
      opacity: 0.6;
    }
  }
  
  .quantity-input {
    width: 40px;
    
    :deep(.el-input__inner) {
      border: none;
      text-align: center;
      padding: 0 5px;
      min-height: 28px;
      height: 28px;
      font-size: 14px;
    }
  }
}

// 删除按钮样式
.delete-btn {
  color: #999;
  transition: all 0.2s;
  
  &:hover {
    color: var(--el-color-danger);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .cart-item-list {
    .cart-item {
      &-content {
        flex-wrap: wrap;
      }
      
      &-details {
        flex: 1 0 calc(100% - 95px);
      }
      
      &-price-col,
      &-quantity-col,
      &-subtotal-col,
      &-action-col {
        margin-top: 10px;
      }
      
      &-price-col {
        flex: 1 0 25%;
        min-width: auto;
      }
      
      &-quantity-col {
        flex: 1 0 40%;
        min-width: auto;
      }
      
      &-subtotal-col {
        flex: 1 0 25%;
        min-width: auto;
      }
      
      &-action-col {
        width: auto;
        flex: 0 0 auto;
      }
    }
  }
}
</style> 