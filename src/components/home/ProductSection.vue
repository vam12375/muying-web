<template>
  <div class="product-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <router-link :to="moreLink" class="more-link">
        查看更多 <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>
    
    <div class="products-grid">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
        @click="goToProduct(product.id)"
      >
        <div class="product-image">
          <img :src="product.imageUrl" :alt="product.name">
          <div v-if="product.discount" class="discount-tag">{{ product.discount }}</div>
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.shortDescription }}</p>
          <div class="product-price">
            <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
          </div>
          <div class="product-meta">
            <span class="product-sales">销量 {{ product.salesCount }}</span>
            <span class="product-rating">
              <el-rate v-model="product.rating" disabled text-color="#ff9900" />
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductSection'
}
</script>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  moreLink: {
    type: String,
    default: '/products'
  }
})

const router = useRouter()

// 跳转到商品详情页
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}
</script>

<style lang="scss" scoped>
.product-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin: 0;
  position: relative;
  padding-left: 15px;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 70%;
    background-color: #f27c8d;
    border-radius: 2px;
  }
}

.more-link {
  display: flex;
  align-items: center;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  
  .el-icon {
    margin-left: 4px;
    transition: transform 0.3s;
  }
  
  &:hover {
    color: #f27c8d;
    
    .el-icon {
      transform: translateX(3px);
    }
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.product-image {
  position: relative;
  overflow: hidden;
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  .discount-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #f27c8d;
    color: white;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .product-card:hover & img {
    transform: scale(1.05);
  }
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 40px;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .current-price {
    font-size: 18px;
    font-weight: bold;
    color: #f27c8d;
  }
  
  .original-price {
    margin-left: 8px;
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 