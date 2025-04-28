<template>
  <div class="product-card" @click="goToProduct">
    <div class="product-image relative overflow-hidden">
      <img :src="product.image" :alt="product.name" class="w-full h-full object-cover transition-transform duration-300">
      
      <!-- 标签 -->
      <div class="product-badges absolute top-2 left-2 flex flex-col gap-1">
        <span v-if="product.isNew" class="badge new-badge bg-green-500 text-white text-xs px-2 py-0.5 rounded">新品</span>
        <span v-if="product.discount" class="badge discount-badge bg-primary text-white text-xs px-2 py-0.5 rounded">{{ formatDiscount(product.discount) }}折</span>
      </div>
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
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// 定义props
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const router = useRouter();

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
</script>

<style scoped>
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
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
</style> 