<template>
  <transition name="cart-popup">
    <div v-if="visible" class="cart-mini-popup">
      <div class="cart-popup-header">
        <el-icon><ShoppingCart /></el-icon>
        <span>商品已成功加入购物车</span>
        <el-icon class="close-icon" @click="close"><Close /></el-icon>
      </div>
      
      <div class="cart-popup-content">
        <div class="product-info">
          <div class="product-image">
            <el-image :src="getImageUrl(product.image)" class="product-img" fit="cover">
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
          <div class="product-details">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ Number(product.price).toFixed(2) }}</div>
            <div class="product-specs" v-if="product.specs">规格：{{ product.specs }}</div>
            <div class="product-count">数量：{{ product.quantity }}</div>
          </div>
        </div>
      </div>
      
      <div class="cart-popup-footer">
        <el-button plain @click="close">继续购物</el-button>
        <el-button type="danger" color="#ff6699" @click="goToCart">去购物车结算</el-button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart, Close, Picture } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: () => ({
      id: '',
      name: '商品',
      image: '',
      price: 0,
      quantity: 1,
      specs: ''
    })
  },
  autoCloseTime: {
    type: Number,
    default: 5000 // 默认5秒后自动关闭
  }
})

const emit = defineEmits(['close'])
const router = useRouter()

let timer = null

// 获取图片URL的方法
const getImageUrl = (url) => {
  if (!url) return '';
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http')) return url;
  
  // 处理相对路径
  if (url.startsWith('/')) {
    return url;
  }
  
  // 处理商品图片
  if (url.match(/^goods\d+\.jpg$/)) {
    return `/products/${url}`;
  }
  
  return url;
}

// 监听visible的变化，设置自动关闭
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    // 如果显示，则设置定时器自动关闭
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      close()
    }, props.autoCloseTime)
  } else {
    // 如果隐藏，则清除定时器
    if (timer) clearTimeout(timer)
  }
})

// 关闭弹窗
const close = () => {
  if (timer) clearTimeout(timer)
  emit('close')
}

// 跳转到购物车页面
const goToCart = () => {
  router.push('/cart')
  close()
}
</script>

<style scoped>
.cart-mini-popup {
  position: fixed;
  top: 20%;
  right: 10px;
  width: 320px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 2000;
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.cart-popup-header {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ebeef5;
}

.cart-popup-header span {
  margin-left: 8px;
  flex: 1;
  font-size: 14px;
  font-weight: bold;
}

.close-icon {
  cursor: pointer;
  color: #909399;
}

.close-icon:hover {
  color: #409EFF;
}

.cart-popup-content {
  padding: 15px;
  max-height: 250px;
  overflow-y: auto;
}

.product-info {
  display: flex;
  margin-bottom: 10px;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 10px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  position: relative;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  margin-bottom: 5px;
  color: #303133;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-size: 16px;
  color: #ff6699;
  font-weight: bold;
  margin-bottom: 5px;
}

.product-specs {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.product-count {
  font-size: 12px;
  color: #606266;
}

.cart-popup-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
}

/* 过渡动画 */
.cart-popup-enter-active,
.cart-popup-leave-active {
  transition: all 0.3s;
}

.cart-popup-enter-from,
.cart-popup-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 