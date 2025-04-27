<template>
  <main-layout>
    <div class="product-list-container">
      <!-- 过滤器和排序 -->
      <div class="filter-container">
        <div class="filter-section">
          <h3 class="filter-title">商品分类</h3>
          <el-radio-group v-model="filterForm.category" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="milk">奶粉</el-radio-button>
            <el-radio-button label="toys">玩具</el-radio-button>
            <el-radio-button label="clothes">服装</el-radio-button>
            <el-radio-button label="stroller">推车</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">价格区间</h3>
          <el-radio-group v-model="filterForm.priceRange" size="small">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="0-100">0-100元</el-radio-button>
            <el-radio-button label="100-300">100-300元</el-radio-button>
            <el-radio-button label="300-500">300-500元</el-radio-button>
            <el-radio-button label="500-">500元以上</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
          <h3 class="filter-title">品牌</h3>
          <el-checkbox-group v-model="filterForm.brands">
            <el-checkbox label="brand1">品牌1</el-checkbox>
            <el-checkbox label="brand2">品牌2</el-checkbox>
            <el-checkbox label="brand3">品牌3</el-checkbox>
            <el-checkbox label="brand4">品牌4</el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div class="filter-buttons">
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
      
      <!-- 排序和布局选项 -->
      <div class="sort-container">
        <div class="total-count">共<span>{{ totalProducts }}</span> 件商品</div>
        
        <div class="sort-options">
          <el-radio-group v-model="sortOption" size="small" @change="handleSortChange">
            <el-radio-button label="default">默认排序</el-radio-button>
            <el-radio-button label="sales">销量优先</el-radio-button>
            <el-radio-button label="price-asc">价格低到高</el-radio-button>
            <el-radio-button label="price-desc">价格高到低</el-radio-button>
            <el-radio-button label="newest">最新上架</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="view-mode">
          <el-button 
            :type="viewMode === 'grid' ? 'primary' : ''" 
            circle 
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            circle 
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </div>
      </div>
      
      <!-- 商品列表 -->
      <div class="loading-container" v-if="loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else>
        <!-- 网格视图 -->
        <div v-if="viewMode === 'grid'" class="products-grid">
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
                <span class="product-sales">销量：{{ product.salesCount }}</span>
                <span class="product-rating">
                  <el-rate v-model="product.rating" disabled text-color="#ff9900" />
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 列表视图 -->
        <div v-else class="products-list">
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="product-list-item"
            @click="goToProduct(product.id)"
          >
            <div class="product-list-image">
              <img :src="product.imageUrl" :alt="product.name">
              <div v-if="product.discount" class="discount-tag">{{ product.discount }}</div>
            </div>
            <div class="product-list-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.shortDescription }}</p>
              <div class="product-price">
                <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
              </div>
              <div class="product-meta">
                <span class="product-sales">销量：{{ product.salesCount }}</span>
                <span class="product-rating">
                  <el-rate v-model="product.rating" disabled text-color="#ff9900" />
                </span>
              </div>
            </div>
            <div class="product-list-action">
              <el-button type="primary" @click.stop="addToCart(product.id)">加入购物车</el-button>
            </div>
          </div>
        </div>
        
        <!-- 无数据提示 -->
        <el-empty v-if="products.length === 0" description="暂无商品数据" />
      </div>
      
      <!-- 分页 -->
      <div class="pagination-container" v-if="totalProducts > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalProducts"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </main-layout>
</template>

<script>
export default {
  name: 'ProductListView'
}
</script>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Grid, List } from '@element-plus/icons-vue'

import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()

// 状态
const loading = ref(false)
const products = ref([])
const totalProducts = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const viewMode = ref('grid')
const sortOption = ref('default')

// 过滤条件
const filterForm = reactive({
  category: route.query.category || '',
  priceRange: '',
  brands: []
})

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟商品数据
    const mockProducts = Array.from({ length: 40 }).map((_, index) => ({
      id: `product-${index + 1}`,
      name: `产品${index + 1}`,
      shortDescription: '这是一个母婴商品的简短描述，包含商品的主要特点和优势。',
      imageUrl: `https://picsum.photos/seed/product${index}/300/300`,
      price: 50 + Math.random() * 450,
      originalPrice: Math.random() > 0.5 ? 100 + Math.random() * 500 : null,
      discount: Math.random() > 0.5 ? `${Math.floor(Math.random() * 3 + 5)}折` : null,
      salesCount: Math.floor(Math.random() * 1000),
      rating: 3 + Math.random() * 2,
      category: ['milk', 'toys', 'clothes', 'stroller'][Math.floor(Math.random() * 4)]
    }))
    
    // 应用筛选条件
    let filteredProducts = [...mockProducts]
    
    // 类别筛选
    if (filterForm.category) {
      filteredProducts = filteredProducts.filter(item => item.category === filterForm.category)
    }
    
    // 价格区间筛选
    if (filterForm.priceRange) {
      const [min, max] = filterForm.priceRange.split('-').map(Number)
      filteredProducts = filteredProducts.filter(item => {
        if (!max && min) {
          return item.price >= min
        } else if (min !== undefined && max !== undefined) {
          return item.price >= min && item.price <= max
        }
        return true
      })
    }
    
    // 品牌筛选
    if (filterForm.brands.length > 0) {
      // 在真实项目中会根据品牌进行筛选
      // 这里仅作为演示，保留原始列表
    }
    
    // 排序
    switch (sortOption.value) {
      case 'sales':
        filteredProducts.sort((a, b) => b.salesCount - a.salesCount)
        break
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        // 假设id越大的商品越新
        filteredProducts.sort((a, b) => b.id.localeCompare(a.id))
        break
      default:
        // 默认排序，不做额外处理
        break
    }
    
    totalProducts.value = filteredProducts.length
    
    // 分页处理
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    products.value = filteredProducts.slice(start, end)
    
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error('获取商品列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 路由参数变化时更新过滤条件
watch(() => route.query, (newQuery) => {
  if (newQuery.category) {
    filterForm.category = newQuery.category
  }
  
  loadProducts()
}, { immediate: true })

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1
  loadProducts()
}

// 重置筛选条件
const resetFilters = () => {
  filterForm.category = ''
  filterForm.priceRange = ''
  filterForm.brands = []
  currentPage.value = 1
  loadProducts()
}

// 排序变化
const handleSortChange = () => {
  currentPage.value = 1
  loadProducts()
}

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProducts()
  window.scrollTo(0, 0)
}

// 每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

// 跳转到商品详情
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 添加到购物车
const addToCart = async (productId) => {
  try {
    await cartStore.addToCart(productId, 1)
  } catch (error) {
    console.error('添加到购物车失败:', error)
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style lang="scss" scoped>
.product-list-container {
  padding: 0;
}

.filter-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-section {
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.filter-buttons {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.sort-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.total-count {
  font-size: 14px;
  color: #666;
  
  span {
    color: #f27c8d;
    font-weight: bold;
  }
}

.sort-options {
  flex: 1;
  display: flex;
  justify-content: center;
}

.view-mode {
  display: flex;
  gap: 10px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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

// 列表视图样式
.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.product-list-item {
  display: flex;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
}

.product-list-image {
  flex: 0 0 200px;
  position: relative;
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
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
}

.product-list-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.product-list-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  margin-bottom: 20px;
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .product-list-item {
    flex-direction: column;
  }
  
  .product-list-image {
    flex: none;
    width: 100%;
  }
  
  .product-list-action {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sort-container {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .sort-options {
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
