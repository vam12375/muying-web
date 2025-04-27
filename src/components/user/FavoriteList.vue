<template>
  <div class="favorite-list-container">
    <div class="section-header">
      <h2 class="section-title">我的收藏</h2>
    </div>
    
    <div class="filter-bar">
      <div class="favorite-count">
        <span>共 {{ total }} 件商品</span>
      </div>
      <div class="actions">
        <el-popconfirm
          title="确定要清空收藏列表吗？"
          @confirm="clearFavorites"
          confirm-button-text="确定"
          cancel-button-text="取消"
        >
          <template #reference>
            <el-button type="danger" plain size="small" :disabled="favorites.length === 0">
              清空收藏夹
            </el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <div v-else-if="favorites.length === 0" class="empty-container">
      <el-empty description="收藏夹还是空的">
        <router-link to="/products">
          <el-button type="primary">去选购商品</el-button>
        </router-link>
      </el-empty>
    </div>
    
    <div v-else class="favorite-grid">
      <div v-for="item in favorites" :key="item.id" class="favorite-item">
        <div class="product-card">
          <div class="product-image">
            <router-link :to="`/product/${item.productId || item.id}`">
              <img :src="item.image" :alt="item.name" />
            </router-link>
            <div class="hover-actions">
              <el-button type="danger" circle size="small" @click="removeFavorite(item.id)">
                <i class="el-icon-delete"></i>
              </el-button>
            </div>
          </div>
          
          <div class="product-info">
            <router-link :to="`/product/${item.productId || item.id}`" class="product-name">
              {{ item.name }}
            </router-link>
            
            <div class="product-price">
              <span class="price-now">¥{{ formatPrice(item.price) }}</span>
              <span v-if="item.originalPrice" class="price-original">
                ¥{{ formatPrice(item.originalPrice) }}
              </span>
            </div>
            
            <div class="product-actions">
              <el-button type="primary" size="small" @click="addToCart(item)">
                加入购物车
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pagination-container" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'FavoriteList'
}
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFavorites, removeFavorite as removeUserFavorite, clearFavorites as clearUserFavorites } from '@/api/user'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const loading = ref(false)
const favorites = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

onMounted(() => {
  loadFavorites()
})

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00'
  return parseFloat(price).toFixed(2)
}

// 加载收藏数据
const loadFavorites = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    const res = await getFavorites(params)
    
    if (res.code === 200) {
      favorites.value = res.data.list || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadFavorites()
}

// 移除收藏
const removeFavorite = async (id) => {
  try {
    const res = await removeUserFavorite(id)
    
    if (res.code === 200) {
      ElMessage.success('移除收藏成功')
      
      // 如果当前页只有一个项目且不是第一页，则跳转到上一页
      if (favorites.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      
      loadFavorites()
    } else {
      ElMessage.error(res.message || '移除收藏失败')
    }
  } catch (error) {
    console.error('移除收藏失败:', error)
    ElMessage.error('移除收藏失败，请稍后重试')
  }
}

// 清空收藏夹
const clearFavorites = async () => {
  try {
    const res = await clearUserFavorites()
    
    if (res.code === 200) {
      ElMessage.success('收藏夹已清空')
      currentPage.value = 1
      loadFavorites()
    } else {
      ElMessage.error(res.message || '清空收藏夹失败')
    }
  } catch (error) {
    console.error('清空收藏夹失败:', error)
    ElMessage.error('清空收藏夹失败，请稍后重试')
  }
}

// 加入购物车
const addToCart = async (item) => {
  try {
    const productId = item.productId || item.id
    const result = await cartStore.addProductToCart({ id: productId }, 1)
    
    if (result) {
      ElMessage.success(`已将"${item.name}"加入购物车`)
    }
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败，请稍后重试')
  }
}
</script>

<style lang="scss" scoped>
.favorite-list-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20px;
  
  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  
  .favorite-count {
    color: #606266;
  }
}

.loading-container, .empty-container {
  padding: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #ebeef5;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
    
    .hover-actions {
      opacity: 1;
    }
  }
}

.product-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .hover-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }
}

.product-info {
  padding: 15px;
}

.product-name {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-decoration: none;
  
  &:hover {
    color: var(--el-color-primary);
  }
}

.product-price {
  margin-bottom: 12px;
  
  .price-now {
    font-size: 18px;
    font-weight: 500;
    color: #f56c6c;
  }
  
  .price-original {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    margin-left: 5px;
  }
}

.product-actions {
  display: flex;
  justify-content: center;
}

.pagination-container {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .favorite-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .product-image {
    height: 160px;
  }
}
</style>
