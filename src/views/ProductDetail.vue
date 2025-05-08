<template>
  <div class="product-detail-page bg-gray-50">
    <div class="container mx-auto py-6 px-4">
      <!-- 骨架屏加载状态 -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="skeleton-gallery">
            <div class="skeleton-image h-[400px] w-full bg-gray-200 animate-pulse rounded-lg mb-4"></div>
            <div class="flex gap-2">
              <div v-for="i in 4" :key="i" class="skeleton-thumb h-20 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
          
          <div class="skeleton-info space-y-4">
            <div class="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
            <div class="h-4 bg-gray-200 animate-pulse rounded w-1/2"></div>
            <div class="h-20 bg-gray-200 animate-pulse rounded"></div>
            <div class="h-12 bg-gray-200 animate-pulse rounded w-2/3"></div>
            <div class="h-12 bg-gray-200 animate-pulse rounded w-1/2"></div>
            <div class="flex gap-3 mt-6">
              <div class="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div class="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
              <div class="h-10 bg-gray-200 animate-pulse rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品不存在 -->
      <div v-else-if="!product" class="bg-white rounded-xl shadow-sm p-12 text-center">
        <div class="max-w-md mx-auto">
          <div class="text-gray-400 mb-4">
            <el-icon :size="64"><Warning /></el-icon>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ loadError ? '加载商品信息失败' : '商品不存在或已下架' }}</h2>
          <p class="text-gray-500 mb-8">
            {{ loadError ? '网络错误或服务器异常，请稍后再试' : '抱歉，您查看的商品可能已经下架或不存在，请浏览其他商品' }}
          </p>
          <div class="flex justify-center gap-4">
            <el-button 
              v-if="loadError" 
              type="primary" 
              size="large" 
              @click="retryFetchProductDetail"
              :loading="loading"
            >
              <el-icon class="mr-2"><RefreshRight /></el-icon>
              重新加载
            </el-button>
            <el-button type="primary" size="large" @click="goToProductList">
              <el-icon class="mr-2"><Back /></el-icon>
              返回商品列表
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 商品详情内容 -->
      <div v-else>
        <!-- 面包屑导航 -->
        <div class="breadcrumb mb-4">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/products' }">全部商品</el-breadcrumb-item>
            <el-breadcrumb-item 
              v-if="product.category" 
              :to="{ path: `/products?category=${product.category.id}` }"
            >
              {{ product.category.name }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <!-- 商品主体信息 -->
        <div class="product-main bg-white rounded-xl shadow-sm p-6 mb-6 relative overflow-hidden">
          <!-- 限时优惠倒计时 -->
          <div v-if="product.promotion?.endTime && timeRemaining" class="flash-deal-banner mb-6 bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg">
            <div class="flex flex-col sm:flex-row items-center justify-between">
              <div class="flash-deal-info flex items-center">
                <el-icon class="text-primary text-xl mr-3"><Timer /></el-icon>
                <div>
                  <div class="text-primary font-bold text-lg">{{ product.promotion.title || '限时优惠' }}</div>
                  <div class="text-gray-600 text-sm">{{ product.promotion.description || '抢购倒计时' }}</div>
                </div>
              </div>
              <div class="flash-deal-timer mt-3 sm:mt-0">
                <div class="countdown-box flex items-center">
                  <div class="countdown-unit">
                    <div class="countdown-value">{{ timeRemaining.days }}</div>
                    <div class="countdown-label">天</div>
                  </div>
                  <div class="countdown-separator">:</div>
                  <div class="countdown-unit">
                    <div class="countdown-value">{{ timeRemaining.hours.toString().padStart(2, '0') }}</div>
                    <div class="countdown-label">时</div>
                  </div>
                  <div class="countdown-separator">:</div>
                  <div class="countdown-unit">
                    <div class="countdown-value">{{ timeRemaining.minutes.toString().padStart(2, '0') }}</div>
                    <div class="countdown-label">分</div>
                  </div>
                  <div class="countdown-separator">:</div>
                  <div class="countdown-unit">
                    <div class="countdown-value">{{ timeRemaining.seconds.toString().padStart(2, '0') }}</div>
                    <div class="countdown-label">秒</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <!-- 产品图片区 -->
            <div class="product-gallery lg:col-span-2">
              <div 
                class="main-image mb-4 border border-gray-100 rounded-xl overflow-hidden relative"
                ref="galleryContainer"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              >
                <div
                  class="image-wrapper cursor-zoom-in"
                  @click="openImageViewer(currentImageIndex)"
                  role="button"
                  tabindex="0"
                  aria-label="点击查看大图"
                  @keydown.enter="openImageViewer(currentImageIndex)"
                >
                  <el-image
                    :src="currentImage"
                    fit="contain"
                    class="w-full product-main-image transition-all duration-300"
                    :initial-index="currentImageIndex"
                    style="height: 400px"
                    loading="lazy"
                    @mousemove="handleImageZoom"
                    ref="productImage"
                  >
                    <template #placeholder>
                      <div class="flex justify-center items-center h-full bg-gray-50">
                        <div class="spinner"></div>
                      </div>
                    </template>
                    <template #error>
                      <div class="flex justify-center items-center h-full bg-gray-100">
                        <el-icon class="text-gray-400" :size="24"><Picture /></el-icon>
                        <span class="ml-2 text-gray-400">图片加载失败</span>
                      </div>
                    </template>
                  </el-image>
                  <div class="zoom-lens" v-show="isZooming" ref="zoomLens"></div>
                  <div class="zoomed-image" v-show="isZooming" ref="zoomedImage"></div>
                </div>
                
                <!-- 商品标签 -->
                <div class="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                  <div v-if="product.isNew" class="product-tag new-tag">
                    新品
                  </div>
                  <div v-if="discountPercentage > 0" class="product-tag discount-tag">
                    {{ discountPercentage }}% OFF
                  </div>
                  <div v-if="isStockLow && !isOutOfStock" class="product-tag stock-tag">
                    库存紧张
                  </div>
                  <div v-if="isOutOfStock" class="product-tag outofstock-tag">
                    已售罄
                  </div>
                </div>
                
                <!-- 图片控制按钮 -->
                <div class="absolute top-3 right-3 z-10 flex space-x-2">
                  <el-button
                    circle
                    plain
                    class="bg-white/70 backdrop-blur-sm hover:bg-white"
                    @click="openImageViewer(currentImageIndex)"
                  >
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button
                    circle
                    plain
                    class="bg-white/70 backdrop-blur-sm hover:bg-white"
                    @click="toggleZoomMode"
                  >
                    <el-icon><ZoomIn /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <!-- 缩略图列表 -->
              <div class="product-thumbnail-list">
                <div 
                  v-for="(img, i) in product.images" 
                  :key="i" 
                  class="thumbnail-item"
                  :class="{ active: currentImageIndex === i }"
                  @click="currentImageIndex = i"
                  @keydown.enter="currentImageIndex = i"
                  tabindex="0"
                  role="button"
                  :aria-label="`选择图片 ${i + 1}`"
                  :aria-selected="currentImageIndex === i"
                >
                  <img :src="img" :alt="`${product.title} - 图片 ${i + 1}`" />
                </div>
              </div>
              
              <!-- 360度查看按钮 -->
              <div v-if="product.has360View" class="view-360-wrapper mt-4 text-center">
                <el-button type="primary" plain class="view-360-btn" @click="open360View">
                  <el-icon class="mr-2"><View /></el-icon>
                  360° 全方位查看
                </el-button>
              </div>
            </div>
            
            <!-- 产品信息区 -->
            <div class="product-info flex flex-col lg:col-span-3">
              <h1 class="text-2xl font-bold text-gray-800 mb-2 leading-tight">{{ product.name }}</h1>
              
              <div class="product-brief text-gray-500 mb-6">{{ product.brief }}</div>
              
              <!-- 主要特点 -->
              <div v-if="product.features?.length" class="product-features mb-6">
                <h3 class="text-base font-semibold text-gray-700 mb-3">产品特点</h3>
                <ul class="feature-list grid grid-cols-1 md:grid-cols-2 gap-2">
                  <li 
                    v-for="(feature, i) in product.features" 
                    :key="i" 
                    class="flex items-start gap-2"
                  >
                    <el-icon class="text-primary mt-1"><Check /></el-icon>
                    <span>{{ feature }}</span>
                  </li>
                </ul>
              </div>
              
              <!-- 价格区块 -->
              <div class="product-price-box mb-6 bg-gray-50 px-5 py-6 rounded-xl">
                <div class="flex items-baseline gap-3 mb-3">
                  <span class="text-3xl font-bold text-primary">¥{{ formatPrice(product.price) }}</span>
                  <span v-if="product.originalPrice > product.price" class="text-gray-400 line-through">
                    ¥{{ formatPrice(product.originalPrice) }}
                  </span>
                  <span v-if="discountPercentage > 0" class="discount-badge">
                    {{ discountPercentage }}% 折扣
                  </span>
                </div>
                
                <div class="flex flex-wrap gap-6 text-sm">
                  <div class="sales-count text-gray-600 flex items-center gap-1">
                    <el-icon><ShoppingBag /></el-icon>
                    <span>销量: {{ product.salesCount }}</span>
                  </div>
                  <div class="reviews text-gray-600 flex items-center gap-1">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>评价: {{ product.reviewCount }}</span>
                    <div class="ml-1">
                      <el-rate
                        v-model="product.rating"
                        disabled
                        text-color="#ff9900"
                      />
                    </div>
                  </div>
                  <div v-if="product.wishlistCount" class="wishlist-count text-gray-600 flex items-center gap-1">
                    <el-icon><Star /></el-icon>
                    <span>收藏: {{ product.wishlistCount }}</span>
                  </div>
                </div>
                
                <!-- 促销信息 -->
                <div v-if="product.promotions?.length" class="promotions-wrapper mt-4 p-3 bg-white rounded-lg border border-dashed border-primary/30">
                  <div class="promotion-title flex items-center mb-2">
                    <el-icon class="text-primary mr-1"><Discount /></el-icon>
                    <span class="text-primary font-medium">促销优惠</span>
                  </div>
                  <div class="promotions-list">
                    <div 
                      v-for="(promo, i) in product.promotions" 
                      :key="i"
                      class="promotion-item flex items-center py-1"
                    >
                      <span class="promotion-tag mr-2">{{ promo.type }}</span>
                      <span class="promotion-desc">{{ promo.description }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 库存状态提示 -->
              <div v-if="isStockLow && !isOutOfStock" class="stock-warning mb-4 text-sm">
                <el-alert
                  type="warning"
                  :closable="false"
                  show-icon
                >
                  <template #title>
                    <span class="font-medium">库存紧张！仅剩 {{ product.stock }} 件</span>
                  </template>
                </el-alert>
              </div>
              
              <div v-if="isOutOfStock" class="stock-warning mb-4 text-sm">
                <el-alert
                  type="error"
                  :closable="false"
                  show-icon
                >
                  <template #title>
                    <span class="font-medium">商品已售罄，您可以先收藏，等待到货通知</span>
                  </template>
                </el-alert>
              </div>
              
              <!-- 商品属性选择 -->
              <div class="product-attrs mb-6">
                <div 
                  v-for="(attr, index) in product.attributes" 
                  :key="index" 
                  class="attr-group mb-5"
                  role="radiogroup"
                  :aria-labelledby="`attr-name-${index}`"
                >
                  <div 
                    class="attr-name text-gray-700 mb-2 flex items-center"
                    :id="`attr-name-${index}`"
                  >
                    {{ attr.name }}
                    <span v-if="attr.required" class="text-red-500 ml-1">*</span>
                  </div>
                  <div class="attr-values flex flex-wrap gap-3">
                    <div
                      v-for="value in attr.values"
                      :key="value.id"
                      class="attr-value-item cursor-pointer border rounded-lg px-4 py-2 text-sm transition-all duration-200"
                      :class="{
                        'attr-selected border-primary text-primary bg-primary bg-opacity-5': selectedAttrs[attr.name] === value.id,
                        'border-gray-200 text-gray-700 hover:border-gray-400': selectedAttrs[attr.name] !== value.id
                      }"
                      @click="selectedAttrs[attr.name] = value.id"
                      role="radio"
                      :aria-checked="selectedAttrs[attr.name] === value.id"
                      tabindex="0"
                      @keydown.enter="selectedAttrs[attr.name] = value.id"
                      @keydown.space.prevent="selectedAttrs[attr.name] = value.id"
                    >
                      {{ value.name }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 购买数量 -->
              <div class="product-quantity flex items-center mb-6">
                <div class="text-gray-700 mr-4">购买数量</div>
                <el-input-number 
                  v-model="quantity" 
                  :min="1" 
                  :max="product.stock"
                  :disabled="isOutOfStock"
                />
                <div class="text-gray-500 ml-4">
                  <span v-if="!isOutOfStock">库存 {{ product.stock }} 件</span>
                  <span v-else class="text-red-500">无货</span>
                </div>
              </div>
              
              <!-- 购买按钮 -->
              <div class="product-actions flex flex-wrap gap-4 mt-auto">
                <el-button 
                  type="primary" 
                  size="large" 
                  :icon="ShoppingCart"
                  :disabled="isOutOfStock"
                  :loading="isAddingToCart"
                  @click="addToCart"
                  class="action-btn add-cart-btn flex-1"
                >
                  加入购物车
                </el-button>
                <el-button 
                  type="danger" 
                  size="large"
                  :disabled="isOutOfStock"
                  @click="buyNow"
                  class="action-btn buy-now-btn flex-1"
                >
                  立即购买
                </el-button>
                <el-button
                  :icon="Star"
                  size="large"
                  :type="product.isFavorite ? 'warning' : ''"
                  :loading="isFavoriteLoading"
                  @click="toggleFavorite"
                  class="action-btn"
                >
                  {{ product.isFavorite ? '已收藏' : '收藏' }}
                </el-button>
                <el-button
                  :icon="Share"
                  size="large"
                  @click="shareProduct"
                  class="action-btn"
                >
                  分享
                </el-button>
              </div>
              
              <!-- 配送信息 -->
              <div class="shipping-info mt-6 pt-4 border-t border-gray-100">
                <div class="text-base font-medium text-gray-700 mb-3">配送信息</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div class="shipping-location flex items-center">
                    <el-icon class="text-gray-500 mr-2"><Location /></el-icon>
                    <span class="text-gray-700 mr-2">配送至:</span>
                    <el-button type="text" class="p-0 text-primary">选择收货地址</el-button>
                  </div>
                  <div class="shipping-fee flex items-center">
                    <el-icon class="text-gray-500 mr-2"><Van /></el-icon>
                    <span class="text-gray-700 mr-2">配送费用:</span>
                    <span class="text-primary font-medium">包邮</span>
                  </div>
                </div>
              </div>
              
              <!-- 服务承诺 -->
              <div class="product-services mt-8 flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                <div class="service-item flex items-center">
                  <el-icon class="mr-1"><Check /></el-icon>
                  <span>正品保证</span>
                </div>
                <div class="service-item flex items-center">
                  <el-icon class="mr-1"><Ship /></el-icon>
                  <span>全场包邮</span>
                </div>
                <div class="service-item flex items-center">
                  <el-icon class="mr-1"><RefreshRight /></el-icon>
                  <span>7天无理由退换</span>
                </div>
                <div class="service-item flex items-center cursor-pointer" @click="contactCustomerService">
                  <el-icon class="mr-1"><MessageBox /></el-icon>
                  <span class="hover:text-primary">联系客服</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分享弹窗 -->
        <el-dialog
          v-model="isShareDialogVisible"
          title="分享商品"
          width="320px"
          destroy-on-close
        >
          <div class="text-center pb-4">
            <p class="mb-4 text-gray-600">选择分享方式</p>
            <div class="share-buttons grid grid-cols-4 gap-4">
              <div 
                v-for="item in shareOptions" 
                :key="item.name"
                class="share-btn flex flex-col items-center cursor-pointer transition-all hover:text-primary"
                @click="handleShare(item.type)"
              >
                <el-icon :size="30" class="mb-2">
                  <component :is="item.icon" />
                </el-icon>
                <span class="text-xs">{{ item.name }}</span>
              </div>
            </div>
            
            <div class="mt-6">
              <p class="text-sm text-gray-500 mb-2">商品链接</p>
              <div class="flex rounded-lg overflow-hidden">
                <div class="flex-1 bg-gray-100 px-3 py-2 text-xs text-gray-500 truncate">
                  {{ productLink }}
                </div>
                <el-button 
                  type="primary" 
                  :icon="CopyDocument"
                  @click="copyProductLink"
                >复制</el-button>
              </div>
            </div>
          </div>
        </el-dialog>
        
        <!-- 商品详情和评价 tabs -->
        <div class="product-tabs bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <el-tabs type="border-card" class="product-detail-tabs">
            <el-tab-pane label="商品详情" name="detail">
              <div class="p-6">
                <!-- 商品参数 -->
                <div v-if="product.specifications && product.specifications.length > 0">
                  <h3 class="text-xl font-bold mb-4">商品参数</h3>
                  <div class="specs-table mb-8">
                    <el-descriptions :column="2" border>
                      <el-descriptions-item 
                        v-for="(spec, index) in product.specifications" 
                        :key="index" 
                        :label="spec.name"
                      >
                        {{ spec.value }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </div>
                
                <!-- 商品详情内容 -->
                <h3 class="text-xl font-bold mb-4">商品详情</h3>
                <div class="rich-text-content" v-html="product.description"></div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane :label="`商品评价(${product.reviewCount || 0})`" name="reviews">
              <div class="p-6">
                <!-- 评价统计信息 -->
                <div v-if="reviews.length > 0" class="review-summary flex items-center mb-6">
                  <div class="review-stats text-center pr-8 border-r">
                    <div class="text-3xl font-bold text-primary">{{ product.rating?.toFixed(1) || '5.0' }}</div>
                    <div class="text-sm text-gray-500">综合评分</div>
                    <div class="mt-2">
                      <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
                    </div>
                  </div>
                  
                  <div class="review-tags flex-1 ml-8">
                    <div class="text-gray-700 mb-2">大家都在说：</div>
                    <div class="tag-cloud flex flex-wrap gap-2">
                      <el-tag 
                        v-for="(tag, index) in product.reviewTags || []" 
                        :key="index"
                        :type="reviewTagFilter === tag.name ? 'primary' : ''"
                        :effect="reviewTagFilter === tag.name ? 'dark' : 'plain'"
                        class="cursor-pointer transition-all duration-200"
                        @click="filterReviewsByTag(tag.name)"
                        role="button"
                        tabindex="0"
                        :aria-pressed="reviewTagFilter === tag.name"
                        @keydown.enter="filterReviewsByTag(tag.name)"
                      >
                        {{ tag.name }} ({{ tag.count }})
                      </el-tag>
                    </div>
                  </div>
                </div>
                
                <!-- 评价过滤选项 -->
                <div class="reviews-filter mb-4 flex flex-wrap items-center justify-between">
                  <el-radio-group v-model="reviewFilter" size="small" @change="handleReviewFilterChange">
                    <el-radio-button label="all">全部评价</el-radio-button>
                    <el-radio-button label="good">好评</el-radio-button>
                    <el-radio-button label="neutral">中评</el-radio-button>
                    <el-radio-button label="bad">差评</el-radio-button>
                    <el-radio-button label="hasImage">有图</el-radio-button>
                  </el-radio-group>
                  
                  <el-button 
                    v-if="reviewTagFilter" 
                    size="small" 
                    plain 
                    @click="reviewTagFilter = ''; fetchReviews()"
                  >
                    <el-icon class="mr-1"><MoreFilled /></el-icon>
                    清除标签筛选
                  </el-button>
                </div>
                
                <!-- 评价加载状态 -->
                <div v-if="reviewLoading" class="py-12 text-center">
                  <div class="spinner mx-auto mb-4"></div>
                  <p class="text-gray-500">正在加载评价...</p>
                </div>
                
                <!-- 评价加载错误 -->
                <div v-else-if="reviewLoadError" class="py-12 text-center">
                  <el-result
                    icon="error"
                    title="评价加载失败"
                    sub-title="由于网络原因，评价数据加载失败"
                  >
                    <template #extra>
                      <el-button 
                        type="primary"
                        @click="retryFetchReviews"
                        :loading="reviewLoading"
                      >
                        <el-icon class="mr-1"><RefreshRight /></el-icon>
                        重新加载
                      </el-button>
                    </template>
                  </el-result>
                </div>
                
                <!-- 空评价状态 -->
                <div v-else-if="reviews.length === 0" class="py-12 text-center">
                  <el-empty description="暂无相关评价"></el-empty>
                </div>
                
                <!-- 评价列表 -->
                <div v-else class="reviews-list divide-y">
                  <div 
                    v-for="(review, index) in reviews" 
                    :key="index"
                    class="review-item py-6"
                  >
                    <div class="review-header flex justify-between mb-3">
                      <div class="user-info flex items-center">
                        <el-avatar :size="40" :src="review.avatar"></el-avatar>
                        <div class="ml-3">
                          <div class="user-name text-gray-800">{{ review.username }}</div>
                          <div class="review-time text-gray-400 text-sm">{{ review.createTime }}</div>
                        </div>
                      </div>
                      <div class="review-rating">
                        <el-rate v-model="review.rating" disabled text-color="#ff9900" />
                      </div>
                    </div>
                    
                    <div class="review-attrs text-sm text-gray-500 mb-3">
                      {{ getSelectedAttrsText(review.productAttrs) }}
                    </div>
                    
                    <div class="review-content text-gray-700 mb-4">
                      {{ review.content }}
                    </div>
                    
                    <div v-if="review.images && review.images.length > 0" class="review-images flex flex-wrap gap-2 mb-4">
                      <div 
                        v-for="(img, imgIndex) in review.images" 
                        :key="imgIndex"
                        class="review-image-item w-24 h-24 cursor-pointer overflow-hidden rounded-lg"
                        @click="showReviewImage(review.images, imgIndex)"
                      >
                        <el-image 
                          :src="img" 
                          fit="cover" 
                          class="w-full h-full transition-all duration-300 hover:scale-110" 
                          loading="lazy"
                        />
                      </div>
                    </div>
                    
                    <div v-if="review.replyContent" class="shop-reply bg-gray-50 p-4 rounded-lg text-sm mt-3">
                      <div class="font-medium text-gray-800 mb-1">商家回复：</div>
                      <div class="text-gray-600">{{ review.replyContent }}</div>
                    </div>
                    
                    <!-- 评价操作按钮 -->
                    <div class="review-actions flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <div 
                        class="review-action flex items-center cursor-pointer hover:text-primary transition-colors"
                        @click="handleReviewLike(review)"
                      >
                        <el-icon :class="{'text-primary': review.isLiked}" class="mr-1">
                          <Star />
                        </el-icon>
                        <span>有用({{ review.likeCount || 0 }})</span>
                      </div>
                      <div 
                        class="review-action flex items-center cursor-pointer hover:text-primary transition-colors"
                        @click="handleReviewComment(review)"
                      >
                        <el-icon class="mr-1"><ChatDotRound /></el-icon>
                        <span>回复</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 评价分页 -->
                <div v-if="reviewTotal > 0" class="pagination-container mt-6 flex justify-center">
                  <el-pagination
                    v-model:current-page="reviewPage"
                    v-model:page-size="reviewPageSize"
                    :page-sizes="[5, 10, 20]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="reviewTotal"
                    @size-change="handleReviewSizeChange"
                    @current-change="handleReviewPageChange"
                    background
                  />
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="常见问题" name="faq">
              <div class="p-6">
                <!-- FAQ内容 -->
                <div v-if="product.faqs && product.faqs.length > 0">
                  <h3 class="text-xl font-bold mb-6">常见问题</h3>
                  <el-collapse class="mb-6 faq-collapse">
                    <el-collapse-item 
                      v-for="(faq, index) in product.faqs" 
                      :key="index" 
                      :title="faq.question"
                      :name="index"
                    >
                      <div class="faq-answer">{{ faq.answer }}</div>
                    </el-collapse-item>
                  </el-collapse>
                  
                  <!-- 未解决问题区域 -->
                  <div class="ask-question mt-8 pt-6 border-t border-gray-100">
                    <h4 class="text-lg font-semibold mb-4">还有疑问?</h4>
                    <el-input
                      v-model="newQuestion"
                      type="textarea"
                      rows="3"
                      placeholder="请输入您的问题，我们将尽快回复..."
                      class="mb-4"
                    ></el-input>
                    <div class="flex justify-end">
                      <el-button type="primary" @click="submitQuestion" :loading="isSubmittingQuestion">
                        <el-icon class="mr-2"><QuestionFilled /></el-icon>
                        提交问题
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <div v-else class="py-12 text-center">
                  <el-empty description="暂无相关问答"></el-empty>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <!-- 相关推荐 -->
        <div v-if="relatedProducts.length > 0" class="related-products bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="section-header flex items-center justify-between mb-5">
            <h3 class="text-xl font-bold text-gray-800">相关推荐</h3>
            <el-button plain size="small" @click="$router.push('/products')">
              查看更多
              <el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <product-card
              v-for="(item, index) in relatedProducts"
              :key="index"
              :product="item"
            />
          </div>
        </div>
        
        <!-- 猜你喜欢 -->
        <div v-if="recommendedProducts.length > 0" class="recommended-products bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="section-header flex items-center justify-between mb-5">
            <h3 class="text-xl font-bold text-gray-800">猜你喜欢</h3>
            <div class="carousel-controls flex gap-2">
              <el-button 
                circle 
                plain 
                @click="prevRecommended" 
                :disabled="recommendedPageIndex <= 0"
              >
                <el-icon><ArrowLeft /></el-icon>
              </el-button>
              <el-button 
                circle 
                plain 
                @click="nextRecommended" 
                :disabled="recommendedPageIndex >= Math.ceil(recommendedProducts.length / recommendedPageSize) - 1"
              >
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
          
          <div class="carousel-container overflow-hidden relative">
            <div 
              class="carousel-track flex transition-transform duration-500" 
              :style="{ transform: `translateX(-${recommendedPageIndex * 100}%)` }"
            >
              <div 
                v-for="(page, pageIndex) in recommendedPages" 
                :key="pageIndex"
                class="carousel-page w-full flex-shrink-0 flex gap-4"
              >
                <product-card
                  v-for="(item, index) in page"
                  :key="index"
                  :product="item"
                  class="flex-1 min-w-0"
                />
              </div>
            </div>
            
            <div class="carousel-indicators flex justify-center gap-2 mt-6">
              <div 
                v-for="(_, index) in recommendedPages" 
                :key="index"
                class="carousel-dot w-2 h-2 rounded-full transition-all cursor-pointer"
                :class="{ 'bg-primary scale-125': recommendedPageIndex === index, 'bg-gray-300': recommendedPageIndex !== index }"
                @click="recommendedPageIndex = index"
              ></div>
            </div>
          </div>
        </div>
        
        <!-- 相关推荐加载错误 -->
        <div v-else-if="relatedLoadError" class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <el-result
            icon="error"
            title="相关推荐加载失败"
            sub-title="由于网络原因，相关商品加载失败"
          >
            <template #extra>
              <el-button 
                type="primary"
                @click="retryFetchRelated"
                :loading="relatedProductsLoading"
              >
                <el-icon class="mr-1"><RefreshRight /></el-icon>
                重新加载
              </el-button>
            </template>
          </el-result>
        </div>
      </div>
    </div>
    
    <!-- 最近浏览记录 -->
    <div v-if="recentlyViewed.length > 0" class="fixed right-4 bottom-24 z-10">
      <div class="bg-white rounded-lg shadow-md p-3 w-56">
        <div class="text-gray-700 font-medium mb-2 flex items-center justify-between">
          <span class="flex items-center">
            <el-icon class="mr-1"><Timer /></el-icon>
            最近浏览
          </span>
          <el-button 
            type="text" 
            size="small" 
            @click="isRecentViewedOpen = !isRecentViewedOpen"
          >
            <el-icon>
              <ArrowRight v-if="!isRecentViewedOpen" />
              <arrow-down v-else />
            </el-icon>
          </el-button>
        </div>
        
        <div v-if="isRecentViewedOpen" class="recent-products">
          <div 
            v-for="item in recentlyViewed.slice(0, 4)" 
            :key="item.id"
            class="recent-item flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-all"
            v-show="item.id !== product?.id"
            @click="goToProduct(item.id)"
          >
            <div class="w-10 h-10 flex-shrink-0 mr-2">
              <el-image 
                :src="item.image" 
                fit="cover" 
                class="w-full h-full rounded" 
                loading="lazy"
              >
                <template #error>
                  <div class="h-full w-full flex items-center justify-center bg-gray-100 rounded">
                    <el-icon class="text-gray-400" :size="14"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-800 truncate">{{ item.name }}</div>
              <div class="text-xs text-primary font-medium">¥{{ item.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 回到顶部按钮 -->
    <el-backtop right="40" bottom="80" />
    
    <!-- 图片查看器 -->
    <el-image-viewer
      v-if="isImageViewerVisible"
      :url-list="product?.images || []"
      :initial-index="imageViewerIndex"
      :hide-on-click-modal="false"
      :zoom-rate="1.2"
      @close="isImageViewerVisible = false"
    />
    
    <!-- 悬浮购买栏 -->
    <div 
      v-if="product && !isOutOfStock" 
      class="fixed-bottom-bar" 
      :class="{ 'show': showFixedBar }"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between py-3">
          <div class="product-info-summary hidden md:flex items-center">
            <div class="w-12 h-12 rounded-md overflow-hidden mr-3">
              <img :src="product.images && product.images[0] ? `/products/${product.images[0].replace(/^.*[\\\/]/, '')}` : ''" alt="" class="w-full h-full object-cover">
            </div>
            <div>
              <div class="text-gray-800 font-medium truncate max-w-xs">{{ product.name }}</div>
              <div class="text-primary font-bold">¥{{ formatPrice(product.price) }}</div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="product.stock"
              size="small"
              class="hidden sm:flex"
            />
            
            <el-button 
              type="primary" 
              size="large" 
              :icon="ShoppingCart"
              :loading="isAddingToCart"
              @click="addToCart"
              class="action-btn add-cart-btn"
            >
              加入购物车
            </el-button>
            <el-button 
              type="danger" 
              size="large"
              @click="buyNow"
              class="action-btn buy-now-btn"
            >
              立即购买
            </el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 移动设备导航提示 -->
    <div 
      v-if="isMobile && !mobileTipDismissed" 
      class="mobile-nav-tip fixed bottom-0 left-0 right-0 bg-primary text-white py-2 px-4 text-center text-sm z-50"
    >
      <div class="flex items-center justify-center">
        <span>左右滑动查看图片，上下滑动浏览详情</span>
        <el-button 
          type="text" 
          class="text-white ml-2" 
          @click="dismissMobileTip"
        >
          <el-icon><CloseBold /></el-icon>
        </el-button>
      </div>
    </div>
    
    <!-- 全局加载状态指示器 -->
    <div 
      v-if="globalLoading" 
      class="global-loading-overlay fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-gray-800 font-medium">{{ loadingMessage || '加载中...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import MotionDiv from '@/components/MotionDiv.vue';
import ProductCard from '@/components/product/ProductCard.vue';
import useProductDetail from '@/scripts/ProductDetail';

// 使用从ProductDetail.js导入的逻辑
const {
  // 状态变量
  loading,
  product,
  currentImageIndex,
  selectedAttrs,
  quantity,
  isAddingToCart,
  isFavoriteLoading,
  isImageViewerVisible,
  recentlyViewed,
  imageViewerIndex,
  isRecentViewedOpen,
  isShareDialogVisible,
  loadError,
  reviewLoadError,
  relatedLoadError,
  reviewLoading,
  reviewFilter,
  reviewPage,
  reviewPageSize,
  reviewTotal,
  reviews,
  reviewTagFilter,
  relatedProductsLoading,
  relatedProducts,
  isZooming,
  productImage,
  zoomLens,
  zoomedImage,
  showFixedBar,
  newQuestion,
  isSubmittingQuestion,
  recommendedProducts,
  recommendedPageIndex,
  recommendedPageSize,
  timeRemaining,
  isMobile,
  mobileTipDismissed,
  globalLoading,
  loadingMessage,
  touchStartX,
  touchEndX,
  galleryContainer,
  
  // 计算属性
  currentImage,
  discountPercentage,
  isStockLow,
  isOutOfStock,
  validSelectedAttrs,
  productLink,
  recommendedPages,
  
  // 共享变量
  shareOptions,
  
  // 方法
  handleResize,
  dismissMobileTip,
  showGlobalLoading,
  hideGlobalLoading,
  getSelectedAttrsText,
  formatPrice,
  goToProductList,
  goToProduct,
  openImageViewer,
  addToCart,
  buyNow,
  shareProduct,
  handleShare,
  copyProductLink,
  contactCustomerService,
  showReviewImage,
  toggleZoomMode,
  handleImageZoom,
  getCursorPos,
  open360View,
  submitQuestion,
  nextRecommended,
  prevRecommended,
  handleReviewLike,
  handleReviewComment,
  fetchReviews,
  fetchRelatedProducts,
  fetchRecommendedProducts,
  retryFetchProductDetail,
  retryFetchReviews,
  retryFetchRelated,
  handleReviewSizeChange,
  handleReviewPageChange,
  handleReviewFilterChange,
  filterReviewsByTag,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  
  // 图标引用
  ShoppingCart,
  Star,
  Picture,
  Check,
  Ship,
  RefreshRight,
  MessageBox,
  Share,
  ChatDotRound,
  Back,
  View,
  Sort,
  Download,
  ShoppingBag,
  Discount,
  Timer,
  Promotion,
  Warning,
  MoreFilled,
  ArrowRight,
  CopyDocument,
  ZoomIn,
  Location,
  Van,
  ThumbsUp,
  ArrowLeft,
  QuestionFilled,
  CloseBold
} = useProductDetail();
</script>

<style src="../styles/ProductDetail.scss" scoped></style> 
