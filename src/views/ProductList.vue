<template>
  <div class="product-list-page">
    <!-- 顶部横幅 - 现代化设计 -->
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
            <el-button type="primary" size="large" class="banner-button">
              立即选购
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
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
      <!-- 品牌展示区 -->
      <section class="brands-showcase">
        <div class="section-header">
          <h2 class="section-title">热门品牌</h2>
          <el-button link class="view-all-btn">
            查看全部
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>
        
        <div class="brands-grid">
          <div v-for="(brand, index) in [
            {name: '惠氏', image: '/brands/wyeth.png'}, 
            {name: '帮宝适', image: '/brands/pampers.png'},
            {name: '美素佳儿', image: '/brands/friso.png'},
            {name: '美德乐', image: '/brands/medela.png'},
            {name: '贝亲', image: '/brands/pigeon.png'},
            {name: '嘉宝', image: '/brands/gerber.png'},
          ]" :key="index" class="brand-item">
            <div class="brand-image">
              <img :src="brand.image" :alt="brand.name" />
            </div>
            <p class="brand-name">{{ brand.name }}</p>
          </div>
        </div>
      </section>
      
      <!-- 快速分类导航 - 使用真实分类图片 -->
      <section class="categories-section">
        <div class="section-header">
          <h2 class="section-title">商品分类</h2>
        </div>
        
        <div class="categories-grid">
          <router-link 
            v-for="(category, index) in [
              {label: '全部', value: '', image: '/categorys/milk.png', icon: 'el-icon-menu'},
              {label: '奶粉', value: '1', image: '/categorys/milk.png', icon: 'el-icon-milk-tea'},
              {label: '玩具', value: '2', image: '/categorys/toy.png', icon: 'el-icon-present'},
              {label: '服装', value: '3', image: '/categorys/clothing.png', icon: 'el-icon-brush'},
              {label: '尿片', value: '5', image: '/categorys/diaper.png', icon: 'el-icon-box'},
              {label: '喂养', value: '7', image: '/categorys/feeding.png', icon: 'el-icon-food'},
            ]"
            :key="index"
            :to="{ path: '/products', query: { category: category.value } }"
            class="category-card"
            :class="{ 'active': filterForm.category === category.value }"
          >
            <div class="category-image">
              <img :src="category.image" :alt="category.label" />
            </div>
            <span class="category-name">{{ category.label }}</span>
          </router-link>
        </div>
      </section>
      
      <div class="product-content-wrapper">
        <!-- 侧边筛选器 - 现代风格 -->
        <motion-div
          :initial="{ opacity: 0, x: -20 }"
          :animate="{ opacity: 1, x: 0 }"
          :transition="{ duration: 0.5, delay: 0.3 }"
          class="filter-sidebar"
          :class="{ 'filter-sidebar-open': showFilters }"
        >
          <div class="filter-header">
            <h3>
              <el-icon><Filter /></el-icon>
              商品筛选
            </h3>
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
              @click="toggleFilters"
            >
              <el-icon><Filter /></el-icon>
              筛选
            </el-button>
          </div>
          
          <!-- 活跃筛选标签 -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="filter-label">已选条件:</span>
            <div class="filter-tags">
              <el-tag 
                v-if="filterForm.category" 
                closable 
                @close="filterForm.category = ''"
                class="filter-tag"
              >
                分类: {{ getCategoryNameById(filterForm.category) }}
              </el-tag>
              
              <el-tag 
                v-if="filterForm.priceRange" 
                closable 
                @close="filterForm.priceRange = ''"
                class="filter-tag"
              >
                价格: {{ formatPriceRange(filterForm.priceRange) }}
              </el-tag>
              
              <el-tag 
                v-for="(brand, index) in filterForm.brands" 
                :key="'brand-' + index"
                closable 
                @close="removeBrandFilter(brand)"
                class="filter-tag"
              >
                品牌: {{ getBrandNameById(brand) }}
              </el-tag>
              
              <el-tag 
                v-for="(age, index) in filterForm.ageRange" 
                :key="'age-' + index"
                closable 
                @close="removeAgeFilter(age)"
                class="filter-tag"
              >
                年龄: {{ age }}
              </el-tag>
              
              <el-button link size="small" @click="resetFilters" class="clear-all-btn">
                清除全部
              </el-button>
            </div>
          </div>
          
          <!-- 商品排序和数量 - 增强版UI -->
          <motion-div
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.5, delay: 0.4 }"
            class="products-header"
          >
            <div class="total-count">
              找到 <span>{{ totalProducts }}</span> 件宝宝好物
            </div>
            
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
                class="product-card-wrapper"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <EnhancedProductCard 
                  :product="product" 
                  :initial-favorite-state="product.isFavorite ? product.isFavorite.value : false"
                  :favorite-id="favoriteIdMap.get(product.id)"
                />
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
                      <el-icon><View /></el-icon>
                    </el-button>
                    <el-button 
                      circle 
                      size="small"
                      class="favorite-btn"
                      @click.stop="toggleFavorite(product)"
                    >
                      <el-icon><Star /></el-icon>
                    </el-button>
                    <el-button 
                      type="primary" 
                      @click.stop="addToCart(product.id)"
                    >
                      <el-icon><ShoppingCart /></el-icon> 加入购物车
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
          
          <!-- 分页 - 增强样式 -->
          <div class="pagination-container" v-if="!loading && totalProducts > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[12, 24, 36, 48]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalProducts"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              background
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 快速预览弹窗 - 保留原有功能，增强样式 -->
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
              <el-icon><ShoppingCart /></el-icon> 加入购物车
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
import { Grid, List, Filter, ArrowRight, Star, ShoppingCart, View } from '@element-plus/icons-vue'

import { useCartStore } from '@/stores/cart'
// 导入产品API
import { getProductList } from '@/api/product'
import { getFavorites, addFavorite, removeFavorite } from '@/api/user'
// 导入EnhancedProductCard组件
import { EnhancedProductCard } from '@/components/product'
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
      console.log('获取到商品列表数据:', res.data);
      
      // 将API返回的数据映射为组件所需格式
      products.value = res.data.records.map(product => {
        // 调试输出每个商品的原始数据
        console.log('处理商品数据:', product);
        
        // 检查图片路径
        let imagePath = product.productImg || '';
        console.log('图片原始路径:', imagePath);
        
        // 确保productId存在
        const productId = product.productId;
        
        // 检查这个商品是否在收藏列表中
        const isInFavorite = favoriteProductIds.has(productId);
        console.log(`商品ID: ${productId}, 是否在收藏列表中: ${isInFavorite}`);
        if (isInFavorite) {
          console.log('该商品的favoriteId为:', favoriteIdMap.value.get(productId));
        }
        
        return {
          id: productId,
          productId: productId, // 确保同时有productId属性
          name: product.productName,
          shortDescription: product.productDetail ? 
            product.productDetail.substring(0, 100) + (product.productDetail.length > 100 ? '...' : '') : 
            '暂无描述',
          image: product.productImg, // 直接保存原始图片名或路径
          productImg: product.productImg, // 添加productImg属性
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
          isFavorite: ref(isInFavorite) // 添加响应式收藏状态
        };
      });
      
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
    // 从products数组中找到对应的产品对象
    const product = products.value.find(p => p.id === productId);
    if (!product) {
      console.error('找不到对应的产品:', productId);
      ElMessage.error('添加到购物车失败，商品信息不完整');
      return;
    }
    
    const result = await cartStore.addProductToCart(product, 1);
    if (result) {
      // 使用更友好的成功提示
      ElMessage({
        message: '商品已成功加入购物车',
        type: 'success',
        duration: 2000
      });
      
      // 可以考虑在这里显示购物车当前数量
      console.log('当前购物车数量:', cartStore.cartItemCount);
    }
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error('添加到购物车失败，请稍后再试');
  }
}

// 添加到购物车（从快速预览）
const addToCartFromQuickView = () => {
  if (selectedProduct.value) {
    try {
      cartStore.addProductToCart(selectedProduct.value, quickViewQuantity.value);
      ElMessage.success(`已成功加入${quickViewQuantity.value}件商品到购物车`);
      quickViewVisible.value = false;
    } catch (error) {
      console.error('添加到购物车失败:', error);
      ElMessage.error('添加到购物车失败，请稍后再试');
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

// 计算属性
const productRating = computed(() => props.product.rating || 0);

// 计算是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return filterForm.category !== '' || 
         filterForm.priceRange !== '' || 
         filterForm.brands.length > 0 || 
         filterForm.ageRange.length > 0;
});

// 格式化价格区间显示
const formatPriceRange = (range) => {
  if (!range) return '';
  
  const [min, max] = range.split('-').map(Number);
  if (!max && min) {
    return `${min}元以上`;
  } else if (min !== undefined && max !== undefined) {
    return `${min}-${max}元`;
  }
  return range;
};

// 根据ID获取分类名称
const getCategoryNameById = (categoryId) => {
  if (!categoryId) return '全部';
  
  const categories = [
    {label: '全部', value: ''},
    {label: '奶粉', value: '1'},
    {label: '玩具', value: '2'},
    {label: '服装', value: '3'},
    {label: '推车', value: '4'},
    {label: '护理', value: '5'},
    {label: '洗护', value: '6'},
    {label: '喂养', value: '7'}
  ];
  
  const category = categories.find(c => c.value === categoryId);
  return category ? category.label : '未知分类';
};

// 根据ID获取品牌名称
const getBrandNameById = (brandId) => {
  if (!brandId) return '';
  
  const brands = {
    '1': '惠氏',
    '2': '美素佳儿',
    '3': '帮宝适',
    '4': '花王',
    '5': '爱他美',
    '6': '费雪',
    '7': '飞利浦新安怡',
    '8': '美德乐',
    '9': '贝亲',
    '10': '嘉宝'
  };
  
  return brands[brandId] || '未知品牌';
};

// 移除品牌筛选
const removeBrandFilter = (brand) => {
  filterForm.brands = filterForm.brands.filter(b => b !== brand);
  applyFilters();
};

// 移除年龄筛选
const removeAgeFilter = (age) => {
  filterForm.ageRange = filterForm.ageRange.filter(a => a !== age);
  applyFilters();
};

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', handleResize)
  loadProducts()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style src="../styles/ProductList.scss" scoped></style> 
