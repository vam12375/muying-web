<template>
  <div class="product-list-page">
  <main-layout>
      <!-- 顶部横幅 -->
      <section class="hero-banner">
        <div class="container">
          <div class="banner-content">
            <motion-div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.7 }"
            >
              <h1 class="banner-title">精选母婴好物</h1>
              <p class="banner-subtitle">为宝宝的每一天提供温馨呵护</p>
            </motion-div>
          </div>
          
          <!-- 装饰元素 -->
          <div class="floating-elements">
            <div class="float-element baby-bottle"></div>
            <div class="float-element baby-bib"></div>
            <div class="float-element baby-rattle"></div>
            <div class="float-element baby-stroller"></div>
            <div class="float-element baby-blocks"></div>
          </div>
        </div>
        
        <!-- 波浪形状底部 -->
        <div class="wave-shape">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fill-opacity="1" d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,144C840,128,960,128,1080,149.3C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      
      <div class="container mx-auto px-4 pb-20">
        <!-- 快速分类导航 -->
        <div class="quick-categories">
          <motion-div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.2 }"
            class="quick-categories-wrapper"
          >
            <router-link 
              v-for="(category, index) in quickCategories" 
              :key="index"
              :to="{ path: '/products', query: { category: category.value } }"
              class="category-item"
              :class="{ 'active': filterForm.category === category.value }"
            >
              <div class="category-icon">
                <i :class="category.icon"></i>
              </div>
              <span>{{ category.label }}</span>
            </router-link>
          </motion-div>
        </div>
        
        <div class="product-content-wrapper">
          <!-- 侧边筛选器 -->
          <motion-div
            :initial="{ opacity: 0, x: -20 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.5, delay: 0.3 }"
            class="filter-sidebar"
            :class="{ 'filter-sidebar-open': showFilters }"
          >
            <div class="filter-header">
              <h3>商品筛选</h3>
              <el-button 
                class="close-filter-btn" 
                icon="el-icon-close" 
                circle 
                @click="toggleFilters"
                v-if="isMobile"
              ></el-button>
            </div>
            
            <div class="filter-body">
        <div class="filter-section">
                <h4 class="filter-title">商品分类</h4>
                <el-radio-group v-model="filterForm.category" size="small" class="filter-radio-group">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="1">奶粉</el-radio-button>
            <el-radio-button label="2">玩具</el-radio-button>
            <el-radio-button label="3">服装</el-radio-button>
            <el-radio-button label="4">推车</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
                <h4 class="filter-title">价格区间</h4>
                <el-radio-group v-model="filterForm.priceRange" size="small" class="filter-radio-group">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="0-100">0-100元</el-radio-button>
            <el-radio-button label="100-300">100-300元</el-radio-button>
            <el-radio-button label="300-500">300-500元</el-radio-button>
            <el-radio-button label="500-">500元以上</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="filter-section">
                <h4 class="filter-title">品牌</h4>
                <el-checkbox-group v-model="filterForm.brands" class="filter-checkbox-group">
            <el-checkbox label="1">惠氏</el-checkbox>
            <el-checkbox label="2">美素佳儿</el-checkbox>
            <el-checkbox label="3">帮宝适</el-checkbox>
            <el-checkbox label="4">花王</el-checkbox>
          </el-checkbox-group>
        </div>
              
              <div class="filter-section">
                <h4 class="filter-title">适用年龄</h4>
                <el-checkbox-group v-model="filterForm.ageRange" class="filter-checkbox-group">
                  <el-checkbox label="0-6m">0-6个月</el-checkbox>
                  <el-checkbox label="6-12m">6-12个月</el-checkbox>
                  <el-checkbox label="1-3y">1-3岁</el-checkbox>
                  <el-checkbox label="3-6y">3-6岁</el-checkbox>
                </el-checkbox-group>
              </div>
        
        <div class="filter-buttons">
          <el-button type="primary" @click="applyFilters">应用筛选</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
          </motion-div>
          
          <!-- 主内容区域 -->
          <div class="main-content">
            <!-- 移动设备筛选器按钮 -->
            <div class="mobile-filter-toggle" v-if="isMobile">
              <el-button 
                type="primary" 
                icon="el-icon-filter" 
                @click="toggleFilters"
              >筛选</el-button>
            </div>
            
            <!-- 商品排序和数量 -->
            <motion-div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.5, delay: 0.4 }"
              class="products-header"
            >
              <div class="total-count">找到 <span>{{ totalProducts }}</span> 件宝宝好物</div>
              
              <div class="controls-wrapper">
        <div class="sort-options">
          <el-radio-group v-model="sortOption" size="small" @change="handleSortChange">
            <el-radio-button label="default">默认排序</el-radio-button>
            <el-radio-button label="sales">销量优先</el-radio-button>
            <el-radio-button label="price-asc">价格低到高</el-radio-button>
            <el-radio-button label="price-desc">价格高到低</el-radio-button>
            <el-radio-button label="newest">最新上架</el-radio-button>
          </el-radio-group>
        </div>
        
                <div class="view-toggle">
                  <el-tooltip content="网格视图" placement="top">
          <el-button 
            :type="viewMode === 'grid' ? 'primary' : ''" 
            circle 
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
                  </el-tooltip>
                  <el-tooltip content="列表视图" placement="top">
          <el-button 
            :type="viewMode === 'list' ? 'primary' : ''" 
            circle 
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
          </el-button>
                  </el-tooltip>
        </div>
      </div>
            </motion-div>
            
            <!-- 商品列表加载中 -->
            <div v-if="loading" class="products-loading">
              <div class="loading-animation">
                <div class="baby-cradle">
                  <div class="cradle-body"></div>
                  <div class="cradle-base"></div>
                </div>
                <p>正在为您寻找最适合的宝宝好物...</p>
              </div>
      </div>
      
            <!-- 商品网格视图 -->
            <motion-div
              v-if="!loading && viewMode === 'grid'"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ duration: 0.5 }"
              class="products-wrapper"
            >
              <transition-group 
                name="product-list"
                tag="div"
                class="products-grid"
              >
                <div 
                  v-for="(product, index) in products" 
            :key="product.id" 
            class="product-card"
                  :style="{ animationDelay: `${index * 0.05}s` }"
          >
                  <div class="product-card-inner">
                    <!-- 产品前面 -->
                    <div class="product-front">
            <div class="product-image">
              <img :src="product.imageUrl" :alt="product.name">
                        <div class="product-badges">
                          <span v-if="product.isNew" class="badge new-badge">新品</span>
                          <span v-if="product.discount" class="badge discount-badge">{{ product.discount }}</span>
                          <span v-if="product.isFeatured" class="badge featured-badge">推荐</span>
            </div>
                        <div class="quick-actions">
                          <el-tooltip content="快速查看" placement="top">
                            <el-button 
                              circle 
                              size="small"
                              class="quick-view-btn"
                              @click.stop="quickViewProduct(product)"
                            >
                              <i class="el-icon-view"></i>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip content="收藏" placement="top">
                            <el-button 
                              circle 
                              size="small"
                              class="favorite-btn"
                              @click.stop="toggleFavorite(product)"
                            >
                              <i class="el-icon-star-off"></i>
                            </el-button>
                          </el-tooltip>
                        </div>
                      </div>
                      
                      <div class="product-info" @click="goToProduct(product.id)">
                        <div class="product-category">{{ getCategoryName(product.category) }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
                        
                        <div class="product-rating">
                          <el-rate v-model="product.rating" disabled text-color="#ff9900" />
                          <span class="rating-count">({{ Math.floor(Math.random() * 100) + 10 }})</span>
                        </div>
                        
              <div class="product-price">
                <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
                <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
              </div>
                        
              <div class="product-meta">
                          <span class="product-sale-info">已售 {{ product.salesCount }}</span>
              </div>
            </div>
                      
                      <div class="product-action">
                        <el-button 
                          type="primary" 
                          class="add-to-cart-btn"
                          @click.stop="addToCart(product.id)"
                        >
                          <i class="el-icon-shopping-cart"></i> 加入购物车
                        </el-button>
          </div>
        </div>
                  </div>
                </div>
              </transition-group>
            </motion-div>
            
            <!-- 商品列表视图 -->
            <motion-div
              v-if="!loading && viewMode === 'list'"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ duration: 0.5 }"
              class="products-wrapper"
            >
              <transition-group 
                name="product-list"
                tag="div"
                class="products-list"
              >
                <div 
                  v-for="(product, index) in products" 
            :key="product.id" 
            class="product-list-item"
                  :style="{ animationDelay: `${index * 0.05}s` }"
          >
            <div class="product-list-image">
              <img :src="product.imageUrl" :alt="product.name">
                    <div class="product-badges">
                      <span v-if="product.isNew" class="badge new-badge">新品</span>
                      <span v-if="product.discount" class="badge discount-badge">{{ product.discount }}</span>
                      <span v-if="product.isFeatured" class="badge featured-badge">推荐</span>
            </div>
                  </div>
                  
                  <div class="product-list-info" @click="goToProduct(product.id)">
                    <div class="product-category">{{ getCategoryName(product.category) }}</div>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.shortDescription }}</p>
                    
                    <div class="product-rating">
                      <el-rate v-model="product.rating" disabled text-color="#ff9900" />
                      <span class="rating-count">({{ Math.floor(Math.random() * 100) + 10 }})</span>
              </div>
                    
              <div class="product-meta">
                      <span class="product-sale-info">已售 {{ product.salesCount }}</span>
              </div>
            </div>
                  
                  <div class="product-list-price-action">
                    <div class="product-price">
                      <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
                      <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice.toFixed(2) }}</span>
            </div>
                    
                    <div class="product-list-actions">
                      <el-button 
                        circle 
                        size="small"
                        class="quick-view-btn"
                        @click.stop="quickViewProduct(product)"
                      >
                        <i class="el-icon-view"></i>
                      </el-button>
                      <el-button 
                        circle 
                        size="small"
                        class="favorite-btn"
                        @click.stop="toggleFavorite(product)"
                      >
                        <i class="el-icon-star-off"></i>
                      </el-button>
                      <el-button 
                        type="primary" 
                        @click.stop="addToCart(product.id)"
                      >
                        <i class="el-icon-shopping-cart"></i> 加入购物车
                      </el-button>
          </div>
        </div>
                </div>
              </transition-group>
            </motion-div>
        
        <!-- 无数据提示 -->
            <div v-if="!loading && products.length === 0" class="no-products">
              <div class="no-data-illustration">
                <img src="../assets/images/404.png" alt="暂无商品" class="empty-img">
              </div>
              <p>抱歉，暂时没有找到符合条件的商品</p>
              <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
      </div>
      
      <!-- 分页 -->
            <div class="pagination-container" v-if="!loading && totalProducts > 0">
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
        </div>
      </div>
      
      <!-- 快速预览弹窗 -->
      <el-dialog
        v-model="quickViewVisible"
        width="800px"
        class="quick-view-dialog"
        destroy-on-close
      >
        <div v-if="selectedProduct" class="quick-view-content">
          <div class="quick-view-image">
            <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name">
            <div class="product-badges">
              <span v-if="selectedProduct.isNew" class="badge new-badge">新品</span>
              <span v-if="selectedProduct.discount" class="badge discount-badge">{{ selectedProduct.discount }}</span>
            </div>
          </div>
          
          <div class="quick-view-details">
            <h2 class="product-name">{{ selectedProduct.name }}</h2>
            <div class="product-rating">
              <el-rate v-model="selectedProduct.rating" disabled text-color="#ff9900" />
              <span class="rating-count">({{ Math.floor(Math.random() * 100) + 10 }})</span>
            </div>
            
            <div class="product-price">
              <span class="current-price">¥{{ selectedProduct.price.toFixed(2) }}</span>
              <span v-if="selectedProduct.originalPrice" class="original-price">¥{{ selectedProduct.originalPrice.toFixed(2) }}</span>
            </div>
            
            <div class="product-description">
              <p>{{ selectedProduct.shortDescription }}</p>
              <p>这是一款专为宝宝设计的优质产品，采用安全环保材料制作，触感柔软，色彩鲜艳，能够刺激宝宝的感官发育，是您送给宝宝的理想礼物。</p>
            </div>
            
            <div class="product-quantity">
              <span class="label">数量:</span>
              <el-input-number v-model="quickViewQuantity" :min="1" :max="10" size="small"></el-input-number>
            </div>
            
            <div class="product-actions">
              <el-button type="primary" @click="addToCartFromQuickView">
                <i class="el-icon-shopping-cart"></i> 加入购物车
              </el-button>
              <el-button @click="goToProduct(selectedProduct.id)">
                查看详情
              </el-button>
            </div>
            
            <div class="product-meta-info">
              <div class="meta-item">
                <span class="label">分类:</span>
                <span>{{ getCategoryName(selectedProduct.category) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">库存状态:</span>
                <span class="in-stock">有货</span>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
  </main-layout>
  </div>
</template>

<script>
export default {
  name: 'ProductListView'
}
</script>

<script setup>
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Grid, List } from '@element-plus/icons-vue'

import { useCartStore } from '@/stores/cart'
// 导入产品API
import { getProductList } from '@/api/product'
import { getFavorites, addFavorite, removeFavorite } from '@/api/user'

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
const favoriteIdMap = ref(new Map()) // 新增：存储 productId -> favoriteId 的映射

// 移动设备检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// 筛选器状态
const showFilters = ref(window.innerWidth >= 768) // 默认在桌面设备上显示筛选器

// 过滤条件
const filterForm = reactive({
  category: route.query.category || '',
  priceRange: '',
  brands: [],
  ageRange: []
})

// 快速分类
const quickCategories = [
  { label: '全部', value: '', icon: 'el-icon-menu' },
  { label: '奶粉', value: '1', icon: 'el-icon-milk-tea' },
  { label: '玩具', value: '2', icon: 'el-icon-present' },
  { label: '服装', value: '3', icon: 'el-icon-brush' },
  { label: '推车', value: '4', icon: 'el-icon-shopping-cart' },
  { label: '护理', value: '5', icon: 'el-icon-box' },
  { label: '洗护', value: '6', icon: 'el-icon-water-cup' },
  { label: '喂养', value: '7', icon: 'el-icon-food' }
]

// 获取分类名称
const getCategoryName = (categoryId) => {
  // 这里的categoryId可能是字符串或数字，统一处理
  const id = categoryId ? categoryId.toString() : ''
  const category = quickCategories.find(c => c.value === id)
  return category ? category.label : '未分类'
}

// 快速预览
const quickViewVisible = ref(false)
const selectedProduct = ref(null)
const quickViewQuantity = ref(1)

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  
  try {
    // 构建API请求参数
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      categoryId: filterForm.category ? parseInt(filterForm.category) : undefined
    }
    
    // 添加价格区间筛选
    if (filterForm.priceRange) {
      const [min, max] = filterForm.priceRange.split('-').map(Number)
      if (!max && min) {
        params.minPrice = min
        params.maxPrice = undefined
      } else if (min !== undefined && max !== undefined) {
        params.minPrice = min
        params.maxPrice = max
      }
    }
    
    // 添加品牌筛选
    if (filterForm.brands && filterForm.brands.length > 0) {
      params.brandIds = filterForm.brands.join(',')
    }
    
    // 排序参数
    switch (sortOption.value) {
      case 'sales':
        params.sortBy = 'sales'
        params.sortDirection = 'desc'
        break
      case 'price-asc':
        params.sortBy = 'price'
        params.sortDirection = 'asc'
        break
      case 'price-desc':
        params.sortBy = 'price'
        params.sortDirection = 'desc'
        break
      case 'newest':
        params.sortBy = 'createTime'
        params.sortDirection = 'desc'
        break
      default:
        // 默认排序，不做额外处理
        break
    }
    
    // 发起API请求 - 获取商品列表
    const res = await getProductList(params)
    
    // 发起API请求 - 获取用户收藏夹
    let favoriteProductIds = new Set()
    favoriteIdMap.value.clear() // 清空旧的映射
    try {
      const favRes = await getFavorites({ pageSize: 1000 }); 
      if (favRes.code === 200 && favRes.data && favRes.data.records) {
        favoriteProductIds = new Set(favRes.data.records.map(fav => fav.productId));
        // 填充映射
        favRes.data.records.forEach(fav => {
          favoriteIdMap.value.set(fav.productId, fav.favoriteId);
        });
      }
    } catch (favError) {
      console.warn('获取收藏列表失败 (可能未登录):', favError);
      // 非致命错误，继续执行
    }
    
    if (res.code === 200 && res.data) {
      // 将API返回的数据映射为组件所需格式
      products.value = res.data.records.map(product => ({
        id: product.productId,
        name: product.productName,
        shortDescription: product.productDetail ? 
          product.productDetail.substring(0, 100) + (product.productDetail.length > 100 ? '...' : '') : 
          '暂无描述',
        imageUrl: `/products/${product.productImg}`, // 使用 public 目录
        price: product.priceNew,
        originalPrice: product.priceOld,
        discount: product.priceOld && product.priceNew ? 
          `${Math.floor(product.priceNew / product.priceOld * 10)}折` : null,
        salesCount: product.sales || 0,
        rating: product.rating || 4.5,
        category: mapCategoryId(product.categoryId),
        isNew: product.isNew === 1,
        isFeatured: product.isRecommend === 1,
        isFavorite: ref(favoriteProductIds.has(product.productId)) // 添加响应式收藏状态
      }))
      
      totalProducts.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
      products.value = []
      totalProducts.value = 0
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error('获取商品列表失败:', error)
    products.value = []
    totalProducts.value = 0
  } finally {
    loading.value = false
  }
}

// 辅助函数：根据分类ID映射为前端分类值
const mapCategoryId = (categoryId) => {
  if (!categoryId) return ''
  
  // 根据分类ID映射到前端的分类值
  // 这里需要根据实际数据库中的分类ID进行映射
  const categoryMap = {
    1: 'milk',    // 奶粉
    2: 'toys',    // 玩具
    3: 'clothes', // 服装
    4: 'stroller', // 推车
    5: 'care',    // 护理
    6: 'bath',    // 洗护
    7: 'feeding'  // 喂养
    // 可以根据实际需要添加更多映射
  }
  
  return categoryMap[categoryId] || ''
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
  toggleFilters()
  loadProducts()
}

// 重置筛选条件
const resetFilters = () => {
  filterForm.category = ''
  filterForm.priceRange = ''
  filterForm.brands = []
  filterForm.ageRange = []
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
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
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
    ElMessage.success('已成功加入购物车')
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败，请稍后再试')
  }
}

// 添加到购物车（从快速预览）
const addToCartFromQuickView = () => {
  if (selectedProduct.value) {
    try {
      cartStore.addToCart(selectedProduct.value.id, quickViewQuantity.value)
      ElMessage.success(`已成功加入${quickViewQuantity.value}件商品到购物车`)
      quickViewVisible.value = false
    } catch (error) {
      console.error('添加到购物车失败:', error)
      ElMessage.error('添加到购物车失败，请稍后再试')
    }
  }
}

// 切换筛选器显示状态
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// 收藏商品
const toggleFavorite = async (product) => {
  const loadingMsg = ElMessage({ message: '处理中...', type: 'info', duration: 0 })
  const productId = product.id; // 先保存 productId
  try {
    const productInArrayIndex = products.value.findIndex(p => p.id === productId); // 提前找到索引
    if (productInArrayIndex === -1) {
        throw new Error('在列表中找不到对应的商品');
    }

    if (products.value[productInArrayIndex].isFavorite.value) { // 判断原始数组中的状态
      // 取消收藏
      const favoriteId = favoriteIdMap.value.get(productId);
      if (!favoriteId) {
        // 如果映射中没有，可能状态不同步，尝试按 productId 取消 (需要后端支持) 或提示刷新
        console.warn(`无法在 map 中找到 favoriteId for productId: ${productId}, 可能需要刷新`);
        // 尝试直接用 productId 调用 remove (如果后端支持)
        // const res = await removeFavorite(productId);
        // 或者 抛出错误提示用户刷新
         throw new Error('收藏状态可能已过期，请刷新页面重试');
         // 如果确定后端 removeFavorite 需要 favoriteId, 必须阻止
         // throw new Error('无法找到对应的收藏ID，请刷新后重试');
      }
      const res = await removeFavorite(favoriteId)
      if (res.code !== 200) throw new Error(res.message || '取消收藏失败')
      // 更新原始数组中的响应式状态
      products.value[productInArrayIndex].isFavorite.value = false;
      favoriteIdMap.value.delete(productId); 
      ElMessage.success('已取消收藏')
    } else {
      // 添加收藏
      const res = await addFavorite(productId)
      if (res.code !== 200) throw new Error(res.message || '添加收藏失败')
       // 理想情况：后端 addFavorite 返回 favoriteId，前端更新 map
       // const newFavoriteId = res.data?.favoriteId; // 假设后端返回 favoriteId
       // if (newFavoriteId) favoriteIdMap.value.set(productId, newFavoriteId);
       // 更新原始数组中的响应式状态
      products.value[productInArrayIndex].isFavorite.value = true; 
      ElMessage.success('已添加到收藏夹')
    }
  } catch (error) {
    console.error('收藏/取消收藏失败:', error)
    ElMessage.error(error.message || '操作失败，请稍后再试')
  } finally {
    loadingMsg.close()
  }
}

// 窗口大小变化处理
const handleResize = () => {
  checkMobile()
  if (!isMobile.value && !showFilters.value) {
    showFilters.value = true
  }
}

// 快速预览产品
const quickViewProduct = (product) => {
  selectedProduct.value = product
  quickViewVisible.value = true
  quickViewQuantity.value = 1
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  loadProducts()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
/* 页面整体样式 */
.product-list-page {
  background-color: #f8f9fc;
  min-height: 100vh;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* 顶部横幅 */
.hero-banner {
  position: relative;
  background: linear-gradient(45deg, #f8c6d1 0%, #ffeef2 50%, #d9f0ff 100%);
  padding: 80px 0 120px;
  overflow: hidden;
  margin-bottom: -40px;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.6;
  }
  
  .banner-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .banner-title {
    font-size: 3rem;
    font-weight: 700;
    color: #ff6b95;
    margin-bottom: 1rem;
    text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.8);
    
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
  }
  
  .banner-subtitle {
    font-size: 1.3rem;
    color: #5a6b87;
    margin-bottom: 1.5rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
  
  .floating-elements {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    
    .float-element {
      position: absolute;
      width: 40px;
      height: 40px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 1;
      
      &.baby-bottle {
        top: 20%;
        left: 15%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%23ff6b95' d='M13.75 21.5c-.69 0-1.25-.56-1.25-1.25v-6.5H6.5c-.83 0-1.5-.67-1.5-1.5V8c0-.23.12-.43.29-.55l4.25-3.18c.23-.17.52-.22.78-.11.26.1.45.34.48.62l.17 1.47H14c.55 0 1 .45 1 1v1.25h.25c.41 0 .75.34.75.75v5c0 .41-.34.75-.75.75h-.25v3.75c0 .69-.56 1.25-1.25 1.25zm-5.35-12.75l-2.65 1.99V12c0 .14.11.25.25.25h6.25v-3.5H7.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.15l-.05-.47 .55-.03z'/%3E%3C/svg%3E");
        animation: float 10s infinite ease-in-out;
      }
      
      &.baby-bib {
        top: 30%;
        right: 20%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%233f97ff' d='M18.5 2h-13C4.12 2 3 3.12 3 4.5v15C3 20.88 4.12 22 5.5 22h13c1.38 0 2.5-1.12 2.5-2.5v-15C21 3.12 19.88 2 18.5 2zm.5 17.5c0 .28-.22.5-.5.5h-13c-.28 0-.5-.22-.5-.5v-15c0-.28.22-.5.5-.5h13c.28 0 .5.22.5.5v15z'/%3E%3Cpath fill='%233f97ff' d='M12 14c-2.21 0-4-1.79-4-4V8c0-.55.45-1 1-1s1 .45 1 1v2c0 1.1.9 2 2 2s2-.9 2-2V8c0-.55.45-1 1-1s1 .45 1 1v2c0 2.21-1.79 4-4 4z'/%3E%3C/svg%3E");
        animation: float 12s infinite ease-in-out;
        animation-delay: 0.5s;
      }
      
      &.baby-rattle {
        bottom: 30%;
        left: 25%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%23ffc045' d='M8.5 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm7 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3.5-7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z'/%3E%3Cpath fill='%23ffc045' d='M18.12 15.88l-2.12-2.12c.78-1.3.67-2.97-.36-4.12-1.4-1.4-3.76-1.4-5.16 0l-1.06 1.06-1.06-1.06c-1.4-1.4-3.76-1.4-5.16 0-1.4 1.4-1.4 3.76 0 5.16l4.24 4.24c.59.59 1.37.92 2.2.92s1.61-.33 2.2-.92l1.06-1.06 1.06 1.06c.59.59 1.37.92 2.2.92.83 0 1.61-.33 2.2-.92.99-1 1.35-2.57.76-3.66z'/%3E%3C/svg%3E");
        animation: float 15s infinite ease-in-out;
        animation-delay: 1s;
      }
      
      &.baby-stroller {
        bottom: 20%;
        right: 15%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%238a6fdb' d='M19.5 18c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3Cpath fill='%238a6fdb' d='M9.5 18c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3Cpath fill='%238a6fdb' d='M19.5 15h-2c-2.76 0-5-2.24-5-5V3H7c-1.1 0-2 .9-2 2v7h1c1.65 0 3 1.35 3 3s-1.35 3-3 3H3v2h4c2.76 0 5-2.24 5-5 0-.34-.04-.67-.09-1h3.09c1.1 0 2-.9 2-2V7.62c.73.63 1.34 1.39 1.78 2.24.4.77.63 1.64.63 2.54-.01 1.44-1.17 2.6-2.6 2.6H15v2h2.5c2.55 0 4.63-2.06 4.5-4.6-.18-2.69-1.97-4.95-4.37-5.82-.18-.06-.37-.1-.54-.13.68-.19 1.33-.49 1.92-.88l-1.73-1.45c-.93.61-2 .95-3.12.95-.06 0-.12 0-.19-.01.06-.36.1-.74.1-1.12V3.04c2.73.41 5.09 1.92 6.54 4.06l1.38-1.45c-1.99-2.68-5.1-4.41-8.66-4.62C13.2.52 12.62 0 11.92 0c-.7 0-1.28.52-1.38 1.19-3.56.21-6.67 1.93-8.66 4.62L3.27 7.2c2.09-2.79 5.4-4.6 9.15-4.61v9.3c0 1.72 1.4 3.12 3.12 3.12h3.96c.18 0 .35-.02.51-.06-.05.01-.09.03-.13.04H21l.75-2h-2.25z'/%3E%3C/svg%3E");
        animation: float 14s infinite ease-in-out;
        animation-delay: 1.5s;
      }
      
      &.baby-blocks {
        top: 60%;
        left: 10%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='%2349cc90' d='M6 14h2c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1zm10-8h2c.55 0 1 .45 1 1v13c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1zm-5 4h2c.55 0 1 .45 1 1v9c0 .55-.45 1-1 1h-2c-.55 0-1-.45-1-1v-9c0-.55.45-1 1-1z'/%3E%3C/svg%3E");
        animation: float 11s infinite ease-in-out;
        animation-delay: 2s;
      }
    }
  }
  
  .wave-shape {
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    
    svg {
      position: relative;
      display: block;
      width: calc(100% + 1.3px);
      height: 80px;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0);
  }
  25% {
    transform: translateY(-10px) rotate(5deg);
  }
  50% {
    transform: translateY(5px) rotate(-2deg);
  }
  75% {
    transform: translateY(-5px) rotate(1deg);
  }
}

/* 快速分类导航 */
.quick-categories {
  margin: -20px 0 30px;
  position: relative;
  z-index: 10;
  padding: 0 20px;
  
  .quick-categories-wrapper {
  background-color: #fff;
    border-radius: 12px;
    padding: 15px 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 15px;
    min-width: 90px;
    transition: all 0.3s ease;
    border-radius: 8px;
    text-decoration: none;
    
    &:hover {
      background-color: #f8f8fd;
      transform: translateY(-3px);
    }
    
    &.active {
      background-color: #ffeef2;
      color: #ff6b95;
      
      .category-icon {
        background-color: #ff6b95;
        color: #fff;
      }
    }
    
    .category-icon {
      width: 48px;
      height: 48px;
      background-color: #f3f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      transition: all 0.3s ease;
      font-size: 22px;
      color: #5a6b87;
    }
    
    span {
      font-size: 14px;
      color: #5a6b87;
      text-align: center;
      transition: all 0.3s ease;
    }
  }
  
  @media (max-width: 768px) {
    .category-item {
      min-width: 70px;
      padding: 8px 10px;
      
      .category-icon {
        width: 36px;
        height: 36px;
        font-size: 18px;
      }
      
      span {
        font-size: 12px;
      }
    }
  }
}

/* 页面布局 */
.product-content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 25px;
  position: relative;
  
  @media (max-width: 992px) {
    grid-template-columns: 240px 1fr;
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

/* 侧边筛选器 */
.filter-sidebar {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease-in-out;
  
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f7;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
}

.filter-section {
    margin-bottom: 20px;
    
    .filter-title {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 12px;
      color: #5a6b87;
      position: relative;
      display: flex;
      align-items: center;
      
      &::before {
        content: "";
        width: 4px;
        height: 14px;
        border-radius: 2px;
        background: linear-gradient(to bottom, #ff6b95, #ffa7bd);
        margin-right: 8px;
      }
    }
    
    .filter-radio-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 5px;
      
      .el-radio-button {
        margin-bottom: 5px;
      }
    }
    
    .filter-checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
}

.filter-buttons {
  display: flex;
  gap: 10px;
    margin-top: 25px;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    height: 100vh;
    z-index: 1000;
    border-radius: 0;
    transform: translateX(-100%);
    overflow-y: auto;
    padding-bottom: 100px;
    
    &.filter-sidebar-open {
      transform: translateX(0);
    }
  }
}

/* 主内容区域 */
.main-content {
  .mobile-filter-toggle {
    display: none;
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
      display: block;
    }
  }
  
  .products-header {
    background-color: #fff;
    border-radius: 12px;
    padding: 15px 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
    align-items: center;

.total-count {
  font-size: 14px;
      color: #5a6b87;
  
  span {
        font-weight: 600;
        color: #ff6b95;
      }
    }
    
    .controls-wrapper {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .view-toggle {
      display: flex;
      gap: 8px;
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      
      .controls-wrapper {
        width: 100%;
        justify-content: space-between;
}

.sort-options {
        overflow-x: auto;
        padding-bottom: 5px;
        -ms-overflow-style: none;
        scrollbar-width: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }
  }
  
  /* 加载动画 */
  .products-loading {
  display: flex;
  justify-content: center;
    align-items: center;
    padding: 60px 0;

    .loading-animation {
  display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      
      .baby-cradle {
        position: relative;
        width: 100px;
        height: 60px;
        animation: cradle-rock 2s infinite ease-in-out;
        
        .cradle-body {
          position: absolute;
          width: 80px;
          height: 40px;
          background-color: #ffeef2;
          border: 2px solid #ff6b95;
          border-radius: 8px 8px 0 0;
          top: 0;
          left: 10px;
          
          &::after {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: #fff;
            border-radius: 50%;
            top: 10px;
            left: 30px;
            animation: pulse 1.5s infinite ease-in-out;
          }
        }
        
        .cradle-base {
          position: absolute;
          width: 100px;
          height: 10px;
          background-color: #ff6b95;
          border-radius: 5px;
          bottom: 0;
          left: 0;
        }
      }
      
      p {
        color: #5a6b87;
        font-size: 14px;
        text-align: center;
      }
    }
  }
  
  @keyframes cradle-rock {
    0%, 100% {
      transform: rotate(-5deg);
    }
    50% {
      transform: rotate(5deg);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  /* 商品网格视图 */
  .products-wrapper {
    min-height: 400px;
}

.products-grid {
  display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px;
  margin-bottom: 30px;
    
    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 600px) {
      grid-template-columns: 1fr;
    }
  }
  
  /* 产品卡片 */
.product-card {
    perspective: 1000px;
    opacity: 0;
    animation: fadeInUp 0.5s forwards;
    
    .product-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.8s;
      transform-style: preserve-3d;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
  overflow: hidden;
      background-color: #fff;
  
  &:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        
        .product-image img {
          transform: scale(1.08);
        }
        
        .quick-actions {
          opacity: 1;
          transform: translateY(0);
        }
        
        .product-action {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
    
    .product-front {
      position: relative;
      width: 100%;
      backface-visibility: hidden;
}

.product-image {
  position: relative;
      height: 260px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
        transition: transform 0.6s ease;
  }
  
      .product-badges {
    position: absolute;
    top: 10px;
        left: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.new-badge {
            background-color: #49cc90;
    color: white;
          }
          
          &.discount-badge {
            background-color: #ff6b95;
            color: white;
          }
          
          &.featured-badge {
            background-color: #8a6fdb;
            color: white;
          }
        }
      }
      
      .quick-actions {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        
        .el-button {
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
          background-color: rgba(255, 255, 255, 0.9);
          border: none;
          transition: all 0.3s ease;
          
          &:hover {
            background-color: #fff;
            transform: scale(1.1);
          }
        }
  }
}

.product-info {
  padding: 15px;
      cursor: pointer;
      
      .product-category {
        font-size: 12px;
        color: #8a6fdb;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
}

.product-name {
  font-size: 16px;
        font-weight: 600;
  color: #333;
        margin: 0 0 10px;
        transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
        height: 44px;
        
        &:hover {
          color: #ff6b95;
        }
      }
      
      .product-rating {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        
        .rating-count {
          margin-left: 5px;
          font-size: 12px;
          color: #999;
        }
}

.product-price {
  display: flex;
  align-items: center;
        gap: 10px;
        margin-bottom: 5px;
  
  .current-price {
    font-size: 18px;
          font-weight: 700;
          color: #ff6b95;
  }
  
  .original-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
}

.product-meta {
        margin-top: 10px;
  font-size: 12px;
  color: #999;
      }
    }
    
    .product-action {
      padding: 0 15px 15px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
      
      .add-to-cart-btn {
        width: 100%;
        border-radius: 6px;
        transition: all 0.3s ease;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 107, 149, 0.3);
        }
      }
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* 商品列表视图 */
.products-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;

.product-list-item {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
  background-color: #fff;
    border-radius: 12px;
  overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeInUp 0.5s forwards;
  
  &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
      
      .product-list-image img {
        transform: scale(1.05);
  }
}

.product-list-image {
  position: relative;
      height: 100%;
      overflow: hidden;
  
  img {
    width: 100%;
        height: 100%;
    object-fit: cover;
        transition: transform 0.6s ease;
  }
  
      .product-badges {
    position: absolute;
    top: 10px;
        left: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.new-badge {
            background-color: #49cc90;
    color: white;
          }
          
          &.discount-badge {
            background-color: #ff6b95;
            color: white;
          }
          
          &.featured-badge {
            background-color: #8a6fdb;
            color: white;
          }
        }
  }
}

.product-list-info {
      padding: 20px;
      cursor: pointer;
      
      .product-category {
        font-size: 12px;
        color: #8a6fdb;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }
      
      .product-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 10px;
        transition: color 0.3s ease;
        
        &:hover {
          color: #ff6b95;
        }
      }
      
      .product-desc {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .product-rating {
  display: flex;
  align-items: center;
        margin-bottom: 10px;
        
        .rating-count {
          margin-left: 5px;
          font-size: 12px;
          color: #999;
        }
      }
      
      .product-meta {
        margin-top: 10px;
        font-size: 12px;
        color: #999;
      }
    }
    
    .product-list-price-action {
  padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-left: 1px dashed #eee;
      
      .product-price {
        display: flex;
        flex-direction: column;
  margin-bottom: 20px;
        
        .current-price {
          font-size: 20px;
          font-weight: 700;
          color: #ff6b95;
        }
        
        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
        }
      }
      
      .product-list-actions {
        display: flex;
    flex-direction: column;
        gap: 10px;
        
        .el-button {
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
          }
        }
      }
    }
    
    @media (max-width: 992px) {
      grid-template-columns: 160px 1fr 160px;
    }
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
  
  .product-list-image {
        height: 200px;
      }
      
      .product-list-price-action {
        border-left: none;
        border-top: 1px dashed #eee;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        
        .product-price {
          margin-bottom: 0;
        }
        
        .product-list-actions {
          flex-direction: row;
        }
      }
    }
  }
}

/* 空数据状态 */
.no-products {
  background-color: #fff;
  border-radius: 12px;
  padding: 40px 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  
  .no-data-illustration {
    max-width: 200px;
    margin: 0 auto 20px;
    
    img {
    width: 100%;
      height: auto;
    }
  }
  
  p {
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
  }
}

/* 分页 */
.pagination-container {
  margin-top: 30px;
  margin-bottom: 50px;
  display: flex;
  justify-content: center;
}

/* 快速预览弹窗 */
:deep(.quick-view-dialog) {
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    padding: 0;
  }
  
  .quick-view-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    
    .quick-view-image {
      position: relative;
      height: 100%;
      min-height: 400px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .product-badges {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
    flex-direction: column;
        gap: 5px;
        
        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.new-badge {
            background-color: #49cc90;
            color: white;
          }
          
          &.discount-badge {
            background-color: #ff6b95;
            color: white;
          }
        }
      }
    }
    
    .quick-view-details {
      padding: 30px;
      
      .product-name {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0 0 15px;
      }
      
      .product-rating {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        
        .rating-count {
          margin-left: 5px;
          font-size: 13px;
          color: #999;
        }
      }
      
      .product-price {
        margin-bottom: 20px;
        
        .current-price {
          font-size: 24px;
          font-weight: 700;
          color: #ff6b95;
        }
        
        .original-price {
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
          margin-left: 10px;
        }
      }
      
      .product-description {
        margin-bottom: 25px;
        border-bottom: 1px solid #eee;
        padding-bottom: 20px;
        
        p {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 10px;
        }
      }
      
      .product-quantity {
        display: flex;
        align-items: center;
    gap: 10px;
        margin-bottom: 25px;
        
        .label {
          font-size: 14px;
          color: #666;
        }
      }
      
      .product-actions {
        display: flex;
        gap: 10px;
        margin-bottom: 25px;
        
        .el-button {
          flex: 1;
          transition: all 0.3s ease;
          
          &:hover {
            transform: translateY(-2px);
          }
        }
      }
      
      .product-meta-info {
        border-top: 1px solid #eee;
        padding-top: 20px;
        
        .meta-item {
          display: flex;
          margin-bottom: 10px;
          font-size: 14px;
          
          .label {
            width: 80px;
            color: #666;
          }
          
          .in-stock {
            color: #49cc90;
            font-weight: 500;
          }
        }
      }
    }
    
    @media (max-width: 768px) {
    grid-template-columns: 1fr;
      
      .quick-view-image {
        min-height: 300px;
      }
    }
  }
}

/* 动画 */
.product-list-enter-active,
.product-list-leave-active {
  transition: all 0.5s ease;
}

.product-list-enter-from,
.product-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.product-list-move {
  transition: transform 0.5s ease;
}
</style> 
