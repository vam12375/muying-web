<template>
  <div class="product-detail" v-loading="loading">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/products' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品详情</el-breadcrumb-item>
    </el-breadcrumb>

    <div v-if="!product && !loading" class="error-container">
      <el-empty description="商品信息加载失败" :image-size="200">
        <template #description>
          <p>该商品可能不存在或已下架</p>
        </template>
        <el-button type="primary" @click="$router.push('/products')">返回商品列表</el-button>
      </el-empty>
    </div>

    <el-row :gutter="40" v-if="product">
      <!-- 商品图片展示 -->
      <el-col :span="12">
        <div class="product-gallery">
          <el-image 
            :src="getImageUrl(product.goods_img || product.goodsImg)"
            fit="contain"
            class="main-image"
            lazy
            :preview-src-list="previewImages"
            @error="handleImageError">
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>加载失败</span>
              </div>
            </template>
            <template #placeholder>
              <div class="image-placeholder">
                <el-icon><Loading /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="image-list" v-if="productImages.length">
            <el-image
              v-for="(img, index) in productImages"
              :key="index"
              :src="getImageUrl(img)"
              @click="changeMainImage(img)"
              class="thumb-image"
            />
          </div>
        </div>
      </el-col>

      <!-- 商品信息 -->
      <el-col :span="12">
        <div class="product-info">
          <h1 class="product-name">{{ product.productName || product.goodsName || product.goods_name }}</h1>
          <div class="product-brief">{{ product.productDetail || product.goodsDetail || product.goods_detail }}</div>
          
          <div class="price-section">
            <div class="current-price">
              <span class="label">价格</span>
              <span class="price">¥{{ Number(product.priceNew || product.price_new || product.price || 0).toFixed(2) }}</span>
              <span class="original-price" v-if="product.priceOld || product.price_old">
                ¥{{ Number(product.priceOld || product.price_old || product.originalPrice || 0).toFixed(2) }}
              </span>
              <el-tag v-if="product.discount || calculateDiscount() > 0" type="danger" size="small" class="discount-tag">
                {{ calculateDiscount() }}折
              </el-tag>
            </div>
            <div class="rating-section">
              <el-rate v-model="product.rating" disabled show-score></el-rate>
              <span class="review-count">({{ product.reviewCount || product.review_count || 0 }}条评价)</span>
            </div>
          </div>
          
          <div class="promotion-section" v-if="product.promotions && product.promotions.length">
            <span class="label">促销</span>
            <div class="promotion-content">
              <div v-for="(promo, index) in product.promotions" :key="index" class="promo-item">
                <el-tag size="small" class="promo-tag" type="danger">{{ promo.type }}</el-tag>
                <span class="promo-text">{{ promo.desc }}</span>
              </div>
              <div class="promo-item" v-if="!product.promotions || product.promotions.length === 0">
                <el-tag size="small" class="promo-tag" type="danger">限时</el-tag>
                <span class="promo-text">限时折后价¥{{ Number(product.price_new || product.priceNew || product.price || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <div class="stock-section">
            <span class="label">配送</span>
            <span class="delivery-info">
              <i class="el-icon"><Van /></i> 
              48小时内发货，预计3月31日送达
            </span>
          </div>

          <div class="stock-section">
            <span class="label">库存</span>
            <span class="stock">{{ product.stock }}件</span>
            <span class="support">销量: {{ product.sales || 0 }}</span>
            <el-tag v-if="product.stock <= 5 && product.stock > 0" type="warning" size="small">库存紧张</el-tag>
            <el-tag v-if="product.stock <= 0" type="danger" size="small">已售罄</el-tag>
          </div>

          <div class="service-section">
            <div class="service-item">
              <el-icon><Van /></el-icon>
              <span>全场包邮</span>
            </div>
            <div class="service-item">
              <el-icon><GoodsFilled /></el-icon>
              <span>正品保证</span>
            </div>
            <div class="service-item">
              <el-icon><RefreshRight /></el-icon>
              <span>七天无理由退换</span>
            </div>
          </div>

          <div class="sku-section" v-if="product.specs && product.specs.length > 0">
            <div v-for="(spec, index) in product.specs" :key="index" class="spec-item">
              <div class="spec-name">{{ spec.name }}</div>
              <div class="spec-values">
                <el-radio-group v-model="selectedSpecs[spec.name]">
                  <el-radio-button 
                    v-for="value in spec.values" 
                    :key="value.id || value"
                    :label="value.id || value"
                    :disabled="value.disabled">
                    {{ value.name || value }}
                  </el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </div>
          
          <div class="quantity-section">
            <span class="label">数量</span>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="product.stock || 99"
              size="small"
            ></el-input-number>
            <span class="stock-info">库存{{ product.stock }}件</span>
          </div>

          <div class="action-section">
            <el-button 
              type="primary" 
              @click="addToCart"
              :disabled="product.stock <= 0"
              class="action-button cart-button"
              round
            >
              <el-icon><ShoppingCart /></el-icon> 加入购物车
            </el-button>
            <el-button 
              type="danger" 
              @click="buyNow"
              :disabled="product.stock <= 0"
              class="action-button buy-button"
              round
            >
              <el-icon><SoldOut /></el-icon> 立即购买
            </el-button>
            <div 
              class="favorite-action" 
              @click="toggleFavorite" 
              :class="{'is-favorite': isFavorite}"
            >
              <el-icon :class="{'favorites-active': isFavorite}">
                <component :is="isFavorite ? 'StarFilled' : 'Star'" />
              </el-icon>
              <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
            </div>
          </div>
          
          <div class="shop-info" v-if="product.shopName || product.shop_name">
            <div class="shop-logo">
              <img :src="product.shopLogo || 'https://img.alicdn.com/imgextra/i4/O1CN01EYFcMQ1DGSt54Mb1h_!!6000000000187-2-tps-512-512.png'" alt="店铺logo">
            </div>
            <div class="shop-detail">
              <div class="shop-name">{{ product.shopName || product.shop_name || 'scoornest科巢旗舰店' }}</div>
              <div class="shop-rating">
                <el-rate v-model="shopRating" disabled :max="5" :colors="['#ff0036', '#ff0036', '#ff0036']"></el-rate>
                <span class="rating-text">5.0</span>
              </div>
            </div>
            <el-button type="primary" plain size="small" class="enter-shop-btn">进入店铺</el-button>
          </div>
          
          <div class="tags-section" v-if="product.tags && product.tags.length">
            <span class="label">标签:</span>
            <div class="tags-content">
              <el-tag 
                v-for="tag in product.tags" 
                :key="tag"
                size="small"
                effect="plain"
                class="product-tag"
              >{{ tag }}</el-tag>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 吸顶导航栏 -->
    <div class="sticky-nav" :class="{ 'sticky-active': isNavSticky }">
      <div class="nav-container">
        <div 
          v-for="(item, index) in navItems" 
          :key="index" 
          class="nav-item" 
          :class="{ 'active': activeSection === item.key }"
          @click="scrollToSection(item.key)"
        >
          <span class="nav-text">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 商品详情内容区域 -->
    <div class="product-sections" v-if="product">
      <!-- 用户评价区域 -->
      <div class="product-section" id="product-comments" ref="commentsSection">
        <div class="section-header">
          <h2 class="section-title">用户评价 <span class="count">({{ product.review_count || product.reviewCount || 0 }})</span></h2>
          <div class="section-more" @click="activeTab = 'comments'">查看全部</div>
        </div>
        <div class="comments-preview">
          <div v-if="comments.length === 0">
            <el-empty description="暂无评价" />
          </div>
          <div v-else class="comment-list">
            <div v-for="(comment, index) in comments.slice(0, 2)" :key="index" class="comment-item">
              <div class="comment-user">
                <el-avatar :src="comment.userAvatar || userAvatar"></el-avatar>
                <span>{{ comment.userName }}</span>
                <el-rate v-model="comment.rating" disabled></el-rate>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-images" v-if="comment.images?.length">
                <el-image
                  v-for="img in comment.images"
                  :key="img"
                  :src="img"
                  :preview-src-list="comment.images"
                  fit="cover"
                  class="comment-image">
                </el-image>
              </div>
              <div class="comment-tags">
                <div class="tag-item">用材很良心</div>
                <div class="tag-item">没异味</div>
                <div class="tag-item">出门带特方便</div>
              </div>
              <div class="comment-time">{{ comment.createTime }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 参数信息区域 -->
      <div class="product-section" id="product-params" ref="paramsSection">
        <div class="section-header">
          <h2 class="section-title">参数信息</h2>
        </div>
        <div class="params-content">
          <el-descriptions 
            :column="2" 
            border 
            size="large"
            v-if="productParams.length > 0"
          >
            <el-descriptions-item 
              v-for="(param, index) in productParams"
              :key="index"
              :label="param.paramName"
              labelClassName="param-label"
              contentClassName="param-content"
            >
              {{ param.paramValue }}{{ param.paramUnit ? param.paramUnit : '' }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-else class="no-params">
            <el-empty description="暂无参数信息" />
          </div>
        </div>
            </div>
            
      <!-- 商品详情区域 -->
      <div class="product-section" id="product-detail" ref="detailSection">
        <div class="section-header">
          <h2 class="section-title">商品详情</h2>
        </div>
        <div class="detail-content">
          <div class="detail-images" v-if="detailPictures.length > 0">
            <div class="image-wrapper">
              <div v-for="(pic, index) in detailPictures" :key="index" class="image-container">
                
                <el-image
                  :src="pic.url || getImageUrl(pic.image)"
                  fit="contain"
                  lazy
                  class="detail-image"
                  @load="handleImageLoad"
                  @error="handleImageError"
                >
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                      <span>加载失败</span>
                    </div>
                  </template>
                  <template #placeholder>
                    <div class="image-loading">
                      <el-icon><Loading /></el-icon>
                      <span>加载中...</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>
          </div>
          <div v-else class="rich-content" v-html="product.description || product.goods_detail || product.goodsDetail"></div>
          </div>
        </div>
        
      <!-- 本店推荐区域 -->
      <div class="product-section" id="product-shop-recommend" ref="shopRecommendSection">
        <div class="section-header">
          <h2 class="section-title">本店推荐</h2>
          <div class="section-action">
            <el-button 
              type="primary" 
              size="small" 
              color="#ff69b4"
              :icon="Refresh" 
              circle 
              @click="fetchShopRecommendProducts"
              :loading="shopRecommendLoading"
              title="换一批商品"
            ></el-button>
          </div>
        </div>
        <div class="shop-recommend-content" v-loading="shopRecommendLoading">
          <div class="product-grid" v-if="shopRecommendList.length > 0">
            <div 
              v-for="(item, index) in shopRecommendList" 
              :key="index" 
              class="recommend-item" 
              @click="handleProductClick(item, $event, 'shop')"
            >
              <div class="item-image">
                <el-image :src="item.img" fit="cover" lazy>
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="item-tag" v-if="item.tag">{{ item.tag }}</div>
              </div>
              <div class="item-info">
                <el-tooltip 
                  :content="item.title" 
                  placement="top" 
                  :show-after="500" 
                  :hide-after="300"
                >
                  <div class="item-title">{{ item.title }}</div>
                </el-tooltip>
                <div class="item-price">
                  <span class="current-price">¥{{ item.price }}</span>
                  <span class="sales-count">{{ item.sales }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!shopRecommendLoading" class="empty-recommend">
            <el-empty description="暂无推荐商品" />
          </div>
              </div>
            </div>
            
      <!-- 猜你喜欢区域 -->
      <div class="product-section" id="product-viewed-also-view" ref="viewedAlsoViewSection">
        <div class="section-header">
          <h2 class="section-title">猜你喜欢</h2>
          <div class="section-action">
            <el-button 
              type="primary" 
              size="small" 
              color="#ff69b4"
              :icon="Refresh" 
              circle 
              @click="fetchViewedAlsoViewProducts"
              :loading="viewedAlsoViewLoading"
              title="换一批商品"
            ></el-button>
          </div>
        </div>
        <div class="viewed-also-view-content" v-loading="viewedAlsoViewLoading">
          <div class="product-grid" v-if="viewedAlsoViewList.length > 0">
            <div 
              v-for="(item, index) in viewedAlsoViewList" 
              :key="index" 
              class="recommend-item" 
              @click="handleProductClick(item, $event, 'view')"
            >
              <div class="item-image">
                <el-image :src="item.img" fit="cover" lazy>
                  <template #error>
                    <div class="image-error">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <div class="item-tag" v-if="item.tag">{{ item.tag }}</div>
              </div>
              <div class="item-info">
                <el-tooltip 
                  :content="item.title" 
                  placement="top" 
                  :show-after="500" 
                  :hide-after="300"
                >
                  <div class="item-title">{{ item.title }}</div>
                </el-tooltip>
                <div class="item-price">
                  <span class="current-price">¥{{ item.price }}</span>
                  <span class="sales-count">{{ item.sales }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!viewedAlsoViewLoading" class="empty-recommend">
            <el-empty description="暂无推荐商品" />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加购物车弹窗组件 -->
    <CartMiniPopup 
      :visible="cartPopupVisible" 
      :product="cartPopupProduct" 
      @close="closeCartPopup" 
    />

    <!-- 右侧悬浮评价栏 -->
    <div class="right-floating-panel" v-show="showFloatingBar">
      <!-- 商品信息面板 -->
      <div class="panel-item product-panel">
        <div class="panel-title">商品信息</div>
        <div class="product-mini-info">
          <div class="product-mini-image">
            <el-image :src="getImageUrl(product?.goods_img || product?.goodsImg)" fit="cover"></el-image>
          </div>
          <div class="product-mini-details">
            <div class="product-mini-name">{{ product?.goods_name || product?.goodsName }}</div>
            <div class="product-mini-price">
              <span class="current-price">¥{{ Number(product?.price_new || product?.priceNew || product?.price || 0).toFixed(2) }}</span>
              <span class="original-price" v-if="product?.price_old || product?.priceOld">¥{{ Number(product?.price_old || product?.priceOld || 0).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- 88VIP区域 -->
        <div class="vip-benefits-section">
          <div class="vip-tag">88VIP</div>
          <div class="scrolling-text-container">
            <div class="scrolling-text">
              货包运费，每单最高省25元 | 专属优惠券 | 购物返5%超级红包
            </div>
          </div>
          <div class="vip-action">
            <span>去开通 <i class="el-icon"><ArrowRight /></i></span>
          </div>
        </div>
        
        <!-- 规格选择区域 -->
        <div class="floating-sku-section" v-if="product?.specs && product?.specs.length > 0">
          <div class="floating-sku-title">已选</div>
          <div class="floating-sku-value">
            <template v-if="Object.keys(selectedSpecs).length > 0">
              <span v-for="(value, name) in selectedSpecs" :key="name" v-if="value">
                {{ name }}: {{ getSelectedSpecText(name, value) }}
              </span>
            </template>
            <span v-else>未选择规格</span>
          </div>
        </div>
        
        <!-- 数量选择区域 -->
        <div class="floating-quantity-section">
          <div class="floating-quantity-title">数量</div>
          <div class="floating-quantity-control">
            <el-input-number v-model="quantity" :min="1" :max="product?.stock || 99" size="small" controls-position="right"></el-input-number>
          </div>
        </div>
        
        <!-- 购买按钮区域 -->
        <div class="floating-action-section">
          <el-button type="warning" @click="addToCart" class="floating-cart-btn">
            <el-icon><ShoppingCart /></el-icon>加入购物车
          </el-button>
          <el-button type="danger" @click="buyNow" class="floating-buy-btn">
            立即购买
          </el-button>
        </div>
        
        <!-- 收藏按钮 -->
        <div class="floating-favorite-section" @click="toggleFavorite">
          <div class="favorite-btn" :class="{'is-favorite': isFavorite}">
            <el-icon>
              <component :is="isFavorite ? 'StarFilled' : 'Star'" />
            </el-icon>
            <span>{{ isFavorite ? '已收藏' : '收藏商品' }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 悬浮操作栏 - 仅在小屏幕上显示 -->
    <div class="floating-action-bar" v-show="showFloatingBar && isMobileView">
      <div class="action-item" @click="addToCart">
        <el-icon><ShoppingCart /></el-icon>
        <span>加入购物车</span>
      </div>
      <div class="action-item" @click="buyNow">
        <el-icon><SoldOut /></el-icon>
        <span>立即购买</span>
      </div>
      <div class="action-item" :class="{'favorites-active': isFavorite}" @click="toggleFavorite">
        <el-icon>
          <component :is="isFavorite ? 'StarFilled' : 'Star'" />
        </el-icon>
        <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
      </div>
      <div class="action-item" @click="scrollToComments">
        <el-icon><ChatDotRound /></el-icon>
        <span>查看评价</span>
      </div>
      <div class="action-item" @click="scrollToTop">
        <el-icon><TopRight /></el-icon>
        <span>回到顶部</span>
      </div>
    </div>
    <!-- 固定在右侧的条形栏 -->
    <div class="fixed-sidebar">
      <div class="sidebar-item" @click="openCustomerService" data-title="联系客服">
        <el-icon><ChatRound /></el-icon>
        <span>客服中心</span>
      </div>
      <div class="sidebar-item" @click="navigateToCart" data-title="查看购物车">
        <el-icon><ShoppingCart /></el-icon>
        <span>购物车</span>
        <div class="cart-count" v-if="cartCount > 0">{{ cartCount }}</div>
      </div>
      <div class="sidebar-item" @click="toggleFavorite" data-title="收藏商品" :class="{'favorites-active': isFavorite}">
        <el-icon>
          <component :is="isFavorite ? 'StarFilled' : 'Star'" />
        </el-icon>
        <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
      </div>
      <div class="sidebar-item" @click="navigateToCategory" data-title="浏览分类">
        <el-icon><GoodsFilled /></el-icon>
        <span>商品分类</span>
      </div>
      <div class="sidebar-item" @click="scrollToTop" data-title="返回顶部">
        <el-icon><Top /></el-icon>
        <span>回到顶部</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Picture, Loading, Van, GoodsFilled, RefreshRight, ShoppingCart, SoldOut, Star, StarFilled, Top, TopRight, ChatDotRound, ArrowRight, Refresh, ChatRound } from '@element-plus/icons-vue'
import { useProductDetail } from '@/scripts/ProductDetail'
import '@/styles/ProductDetail.scss'
import CartMiniPopup from '@/components/product/CartMiniPopup.vue'
import { ref, computed, onMounted, onBeforeUnmount, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductDetail, getRecommendedProducts, getProductList, getProductDetailWithParams } from '@/api/product'
import { addToCart as addToCartApi } from '@/api/cart'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'

const {
  product,
  loading,
  quantity,
  activeTab,
  selectedSpecs,
  comments,
  previewImages,
  productImages,
  detailPictures,
  addToCart: originalAddToCart,
  buyNow,
  getImageUrl,
  changeMainImage,
  handleImageLoad,
  handleImageError,
  cartPopupVisible,
  cartPopupProduct,
  closeCartPopup,
  showFloatingBar,
  isFavorite,
  toggleFavorite,
  scrollToTop,
  scrollToComments,
  handleScroll,
  userAvatar,
  commentImages,
  isMobileView,
  productParams
} = useProductDetail()

// 获取route实例
const route = useRoute();

// 获取当前环境变量
const isDev = ref(process.env.NODE_ENV === 'development')

// 购物车商品数量
const cartCount = ref(0)

// 吸顶导航相关
const isNavSticky = ref(false)
const activeSection = ref('comments')
const commentsSection = ref(null)
const paramsSection = ref(null)
const detailSection = ref(null)
const shopRecommendSection = ref(null)
const viewedAlsoViewSection = ref(null)

// 导航项配置
const navItems = [
  { key: 'comments', label: '用户评价' },
  { key: 'params', label: '参数信息' },
  { key: 'detail', label: '商品详情' },
  { key: 'shop-recommend', label: '本店推荐' },
  { key: 'viewed-also-view', label: '猜你喜欢' }
]

// 本店推荐数据
const shopRecommendList = ref([])
const shopRecommendLoading = ref(false)

// 猜你喜欢数据
const viewedAlsoViewList = ref([])
const viewedAlsoViewLoading = ref(false)

// 初始化favorite store
const favoriteStore = useFavoriteStore()

// 获取本店推荐商品数据
const fetchShopRecommendProducts = async () => {
  if (!product.value || !product.value.goodsId) return
  
  try {
    shopRecommendLoading.value = true
    const params = {
      productId: product.value.goodsId,
      categoryId: product.value.categoryId,
      limit: 20, // 获取更多商品，以便随机选取
      type: 'shop'
    }
    
    const res = await getRecommendedProducts(params)
    console.log('获取本店推荐商品响应:', res)
    
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 随机排序并最多取10个商品
      const randomProducts = res.data
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(item => {
          console.log('推荐商品原始数据:', item)
          // 确保获取到正确的图片字段
          const imageField = item.productImg || item.goodsImg || item.goods_img || ''
          console.log('使用的图片字段:', imageField)
          
          return {
            id: item.productId || item.goodsId || item.id,
            title: item.productName || item.goodsName || item.goods_name,
            price: (item.priceNew || item.price_new || item.price || 0).toFixed(2),
            sales: (item.sales || 0) + '人付款',
            img: getImageUrl(imageField),
            tag: item.tag || (item.discount ? `${item.discount}折` : null)
          }
        })
      
      console.log('处理后的推荐商品:', randomProducts)
      shopRecommendList.value = randomProducts
    } else {
      console.warn('无推荐商品数据，使用备用数据')
      // 如果没有获取到数据，使用商品列表中的其他商品
      await fetchBackupProducts('shop')
    }
  } catch (error) {
    console.error('获取本店推荐商品失败:', error)
    await fetchBackupProducts('shop')
  } finally {
    shopRecommendLoading.value = false
  }
}

// 获取猜你喜欢商品数据
const fetchViewedAlsoViewProducts = async () => {
  try {
    viewedAlsoViewLoading.value = true
    const params = {
      productId: product.value?.goodsId,
      limit: 20, // 获取更多商品，以便随机选取
      type: 'view'
    }
    
    const res = await getRecommendedProducts(params)
    console.log('获取猜你喜欢商品响应:', res)
    
    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // 随机排序并最多取10个商品
      const randomProducts = res.data
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(item => {
          // 确保获取到正确的图片字段
          const imageField = item.productImg || item.goodsImg || item.goods_img || ''
          console.log('猜你喜欢商品图片字段:', imageField)
          
          return {
            id: item.productId || item.goodsId || item.id,
            title: item.productName || item.goodsName || item.goods_name,
            price: (item.priceNew || item.price_new || item.price || 0).toFixed(2),
            sales: (item.sales || 0) + '人付款',
            img: getImageUrl(imageField),
            tag: item.tag || (item.discount ? `${item.discount}折` : null)
          }
        })
      
      console.log('处理后的猜你喜欢商品:', randomProducts)
      viewedAlsoViewList.value = randomProducts
    } else {
      console.warn('无猜你喜欢商品数据，使用备用数据')
      // 如果没有获取到数据，使用商品列表中的其他商品
      await fetchBackupProducts('view')
    }
  } catch (error) {
    console.error('获取猜你喜欢商品失败:', error)
    await fetchBackupProducts('view')
  } finally {
    viewedAlsoViewLoading.value = false
  }
}

// 获取备用商品数据(当API返回空数据时使用)
const fetchBackupProducts = async (type) => {
  try {
    // 获取商品列表数据，请求更多商品以确保有足够的随机性
    const res = await getProductList({ page: 1, size: 30 })
    console.log('获取备用商品列表响应:', res)
    
    if (res && res.list && Array.isArray(res.list) && res.list.length > 0) {
      // 随机选取10个商品
      const randomProducts = [...res.list]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(item => {
          // 确保获取到正确的图片字段
          const imageField = item.productImg || item.goodsImg || item.goods_img || ''
          console.log('备用商品图片字段:', imageField)
          
          return {
            id: item.productId || item.goodsId || item.id,
            title: item.productName || item.goodsName || item.goods_name,
            price: (item.priceNew || item.price_new || item.price || 0).toFixed(2),
            sales: (item.sales || 0) + '人付款',
            img: getImageUrl(imageField),
            tag: item.tag || (item.discount ? `${item.discount}折` : null)
          }
        })
      
      console.log('处理后的备用商品:', randomProducts)
      
      if (type === 'shop') {
        shopRecommendList.value = randomProducts
      } else {
        viewedAlsoViewList.value = randomProducts
      }
    } else {
      console.warn('获取备用商品列表失败，无数据')
    }
  } catch (error) {
    console.error('获取备用商品数据失败:', error)
  }
}

// 滚动到指定区域
const scrollToSection = (sectionKey) => {
  const sectionRefs = {
    comments: commentsSection,
    params: paramsSection,
    detail: detailSection,
    'shop-recommend': shopRecommendSection,
    'viewed-also-view': viewedAlsoViewSection
  }
  
  if (sectionRefs[sectionKey]?.value) {
    // 更新活跃导航项
    activeSection.value = sectionKey;
    
    // 获取sticky导航栏高度
    const navHeight = 50;
    
    // 获取目标元素的位置
    const targetElement = sectionRefs[sectionKey].value;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
    
    // 平滑滚动到目标位置
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

// 监听滚动，判断当前所在区域和是否需要吸顶
const handlePageScroll = () => {
  if (!window || !document) return
  
  try {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // 检查是否需要吸顶（商品信息区域之后）
    const productInfoSection = document.querySelector('.product-sections')
    if (productInfoSection) {
      const stickyPosition = productInfoSection.offsetTop - 60 // 考虑顶部的间距
      isNavSticky.value = scrollTop >= stickyPosition
    }

    
    // 判断当前在哪个区域
    const sections = ['comments', 'params', 'detail', 'shop-recommend', 'viewed-also-view']
    const sectionElements = sections.map(s => document.getElementById(`product-${s}`))
    
    // 计算各个区域的位置，找出当前滚动位置所在的区域
    let currentSection = activeSection.value
    for (let i = sectionElements.length - 1; i >= 0; i--) {
      if (sectionElements[i] && sectionElements[i].offsetTop - 100 <= scrollTop) {
        currentSection = sections[i]
        break
      }
    }
    
    // 更新当前活跃区域
    if (activeSection.value !== currentSection) {
      console.log(`切换到区域: ${currentSection}`);
      activeSection.value = currentSection
    }
    
    // 判断是否应该显示右侧悬浮栏
    // 在"本店推荐"和"猜你喜欢"区域不显示右侧悬浮栏
    const shouldShowFloatingBar = 
      scrollTop > 400 && 
      currentSection !== 'shop-recommend' &&
      currentSection !== 'viewed-also-view'
    
    // 更新右侧悬浮栏的显示状态
    if (showFloatingBar.value !== shouldShowFloatingBar) {
      showFloatingBar.value = shouldShowFloatingBar
    }
    
    // 检测屏幕宽度，判断是否为移动视图
    isMobileView.value = window.innerWidth < 1200
  } catch (error) {
    console.error('页面滚动处理出错:', error)
  }
}

// 在组件挂载后添加滚动监听
onMounted(() => {
  window.addEventListener('scroll', handlePageScroll)
  
  // 初始化时检查一次
  setTimeout(() => {
    handlePageScroll()
  }, 500)
  
  // 获取商品推荐数据
  if (product.value) {
    fetchShopRecommendProducts()
    fetchViewedAlsoViewProducts()
  }
  
  // 初始化购物车数量
  const cartStore = useCartStore()
  if (cartStore) {
    cartCount.value = cartStore.totalCount
    
    // 监听购物车更新事件
    window.addEventListener('cart:updated', () => {
      cartCount.value = cartStore.totalCount
    })
  } else {
    // 从本地存储获取购物车数量
    cartCount.value = parseInt(localStorage.getItem('cartCount') || '0')
  }
})

// 监听product数据变化
watch(() => product.value, (newVal) => {
  if (newVal) {
    fetchShopRecommendProducts()
    fetchViewedAlsoViewProducts()
  }
}, { immediate: false })

// 监听路由参数变化，重新获取商品数据
watch(() => route.params.id, (newId, oldId) => {
  console.log('路由参数变化:', oldId, '->', newId);
  if (newId && newId !== oldId) {
    console.log('重新获取商品详情');
    loading.value = true;
    
    // 清空之前的数据，避免页面闪烁显示旧数据
    product.value = null;
    previewImages.value = [];
    productParams.value = [];
    detailPictures.value = [];
    
    // 重新获取商品详情
    fetchProductDetail();
    
    // 重新加载推荐商品
    if (shopRecommendSection.value) {
      fetchShopRecommendProducts();
    }
    
    if (viewedAlsoViewSection.value) {
      fetchViewedAlsoViewProducts();
    }
    
    // 滚动到页面顶部
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}, { immediate: false });

// 组件卸载前移除监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handlePageScroll)
  window.removeEventListener('cart:updated', () => {
    console.log('移除购物车更新事件监听')
  })
})

// 计算折扣
const calculateDiscount = () => {
  const newPrice = Number(product.value?.price_new || product.value?.priceNew || product.value?.price || 0)
  const oldPrice = Number(product.value?.price_old || product.value?.priceOld || product.value?.originalPrice || 0)
  
  if (oldPrice && oldPrice > 0 && newPrice < oldPrice) {
    const discount = (newPrice / oldPrice * 10).toFixed(1)
    return discount
  }
  
  return 0
}

// 获取已选规格的文本显示
const getSelectedSpecText = (specName, specValue) => {
  if (!product.value || !product.value.specs) return specValue;
  
  const specType = product.value.specs.find(s => s.name === specName);
  if (!specType || !specType.values) return specValue;
  
  const selectedSpec = specType.values.find(v => 
    (v.id && v.id === specValue) || (v === specValue)
  );
  
  return selectedSpec?.name || selectedSpec || specValue;
}

// 获取已选规格的格式化表示
const getSelectedSpecsFormatted = () => {
  if (!product.value || !product.value.specs || !selectedSpecs) {
    return '';
  }
  
  const texts = [];
  
  // 遍历已选规格
  Object.keys(selectedSpecs).forEach(key => {
    const specType = product.value.specs.find(s => s.name === key);
    if (specType) {
      const selectedValue = specType.values.find(v => v.id === selectedSpecs[key] || v === selectedSpecs[key]);
      if (selectedValue) {
        texts.push(`${key}:${selectedValue.name || selectedValue}`);
      }
    }
  });
  
  return texts.join(';');
}

// 添加到购物车
const addToCart = async () => {
  if (!product.value) {
    ElMessage.warning('商品信息不完整，无法添加到购物车')
    return
  }
  
  if (product.value.stock <= 0) {
    ElMessage.warning('该商品已售罄')
    return
  }
  
  try {
    loading.value = true
    
    // 准备购物车数据，包含价格快照
    const cartData = {
      goodsId: product.value.goodsId || product.value.id,
      quantity: quantity.value,
      specs: getSelectedSpecsFormatted(),
      // 添加价格快照字段
      priceSnapshot: Number(product.value.price_new || product.value.priceNew || product.value.price || 0)
    }
    
    // 保存商品详情到localStorage，提供添加购物车参考
    const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}')
    productDetails[cartData.goodsId] = {...product.value}
    localStorage.setItem('productDetails', JSON.stringify(productDetails))
    
    const res = await originalAddToCart(cartData)
    
    if (res && res.code === 200) {
      ElMessage.success('已添加到购物车')
      
      // 更新顶部购物车图标的数量
      const cartStore = useCartStore();
      if (cartStore) {
        // 刷新购物车数据，让商店自己更新计数
        cartStore.getCartItems();
      } else {
        // 如果商店不可用，才使用本地存储计数
        const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
        localStorage.setItem('cartCount', (currentCount + quantity.value).toString());
      }
      
      // 触发购物车更新事件
      window.dispatchEvent(new CustomEvent('cart:updated'))
    } else {
      ElMessage.warning(res?.message || '添加购物车失败')
    }
  } catch (error) {
    console.error('添加购物车异常:', error)
    ElMessage.error('添加购物车失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 在methods部分添加
const addItemToCart = (item) => {
  // 创建一个简化版的产品对象
  const cartItem = {
    id: item.id,
    goodsId: item.id,
    goodsName: item.title,
    goodsImg: item.img,
    price: item.price,
    priceNew: item.price,
    quantity: 1,
    selected: true
  }
  
  // 显示添加成功提示
  ElMessage({
    message: '已成功加入购物车',
    type: 'success',
    duration: 2000
  })
  
  // 调用添加到购物车的逻辑
  // 如果存在cartStore，则调用store的action
  const cartStore = useCartStore()
  if (cartStore) {
    cartStore.addItem(cartItem)
  } else {
    // 简单的本地存储逻辑作为备用
    const cart = JSON.parse(localStorage.getItem('muying_cart') || '[]')
    const existingItem = cart.find(i => i.id === item.id)
    
    if (existingItem) {
      existingItem.quantity++
    } else {
      cart.push(cartItem)
    }
    
    localStorage.setItem('muying_cart', JSON.stringify(cart))
  }
}

// 添加处理点击事件的方法，使右侧边栏的按钮具备相应功能
const router = useRouter()

const openCustomerService = () => {
  // 实现打开客服中心的逻辑
  ElMessageBox.confirm(
    '是否连接在线客服？',
    '客服中心',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage({
      type: 'success',
      message: '正在连接客服...'
    })
  }).catch(() => {
    // 取消操作
  })
}

const navigateToCart = () => {
  // 导航到购物车
  router.push('/cart')
}

const navigateToCategory = () => {
  // 导航到商品分类
  router.push('/products')
}

// 修改初始化方法
const fetchProductDetail = async () => {
  loading.value = true;
  try {
    console.log(`获取商品详情，ID: ${route.params.id}`);
    // 使用新的API获取商品详情和参数信息
    const response = await getProductDetailWithParams(route.params.id);
    
    if (response && response.code === 200 && response.data) {
      product.value = response.data.goods || {};
      productParams.value = response.data.params || [];
      
      // 处理商品图片
      handleProductImages();
      
      // 初始化规格选择
      initSelectedSpecs();
      
      // 获取评论
      fetchComments();
    } else {
      ElMessage.error(response?.message || '获取商品详情失败');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error(error.message || '获取商品详情失败');
  } finally {
    loading.value = false;
  }
};

// 商品点击处理函数
const handleProductClick = (item, event, source) => {
  // 防止事件冒泡和默认行为
  event.preventDefault();
  event.stopPropagation();
  
  if (!item || !item.id) {
    console.error(`${source}推荐商品点击错误: 商品ID不存在`, item);
    ElMessage.error('商品信息不完整，无法查看详情');
    return;
  }
  
  console.log(`点击${source}推荐商品:`, item);
  console.log(`准备跳转到: /product/${item.id}`);
  
  // 如果是同一个商品，需要特殊处理
  if (String(item.id) === String(route.params.id)) {
    console.log('点击的是当前商品，刷新页面');
    // 刷新当前页数据而不是跳转
    fetchProductDetail();
    return;
  }
  
  try {
    // 跳转前显示loading状态
    loading.value = true;
    
    // 使用router实例进行导航，而不是$router
    router.push({
      name: 'product-detail',
      params: { id: item.id }
    }).catch(err => {
      console.error('路由跳转失败:', err);
      // 如果路由跳转失败，尝试硬刷新
      window.location.href = `/product/${item.id}`;
    });
  } catch (error) {
    console.error('跳转出错:', error);
    // 如果出错，使用window.location作为备选方案
    window.location.href = `/product/${item.id}`;
  }
}
</script>