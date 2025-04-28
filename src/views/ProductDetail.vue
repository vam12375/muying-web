<template>
  <div class="product-detail-page bg-gray-50">
    <main-layout>
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
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <!-- 产品图片区 -->
              <div class="product-gallery lg:col-span-2">
                <div class="main-image mb-4 border border-gray-100 rounded-xl overflow-hidden relative">
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
                  <div class="absolute top-3 right-3 z-10">
                    <el-button
                      circle
                      plain
                      class="bg-white/70 backdrop-blur-sm hover:bg-white"
                      @click="openImageViewer(currentImageIndex)"
                    >
                      <el-icon><View /></el-icon>
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
              </div>
              
              <!-- 产品信息区 -->
              <div class="product-info flex flex-col lg:col-span-3">
                <h1 class="text-2xl font-bold text-gray-800 mb-2 leading-tight">{{ product.name }}</h1>
                
                <div class="product-brief text-gray-500 mb-6">{{ product.brief }}</div>
                
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
    </main-layout>
    
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElImage, ElImageViewer } from 'element-plus';
import { 
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
  CopyDocument
} from '@element-plus/icons-vue';
import ProductCard from '@/components/product/ProductCard.vue';
import { useOrderStore } from '@/stores/order';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { 
  getProductDetail, 
  getProductReviews, 
  getRelatedProducts, 
  toggleProductFavorite
} from '@/api/product';
import { useHead } from '@vueuse/head';

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const cartStore = useCartStore();
const userStore = useUserStore();

// 状态变量
const loading = ref(true);
const product = ref(null);
const currentImageIndex = ref(0);
const selectedAttrs = reactive({});
const quantity = ref(1);
const isAddingToCart = ref(false);
const isFavoriteLoading = ref(false);
const isImageViewerVisible = ref(false);
const recentlyViewed = ref([]);
const imageViewerIndex = ref(0);
const isRecentViewedOpen = ref(true);
const isShareDialogVisible = ref(false);

// 错误状态
const loadError = ref(false);
const reviewLoadError = ref(false);
const relatedLoadError = ref(false);

// 评价相关状态
const reviewLoading = ref(false);
const reviewFilter = ref('all');
const reviewPage = ref(1);
const reviewPageSize = ref(10);
const reviewTotal = ref(0);
const reviews = ref([]);
const reviewTagFilter = ref('');

// 相关推荐状态
const relatedProductsLoading = ref(false);
const relatedProducts = ref([]);

// 计算属性
const currentImage = computed(() => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value];
  }
  return '';
});

const discountPercentage = computed(() => {
  if (!product.value) return 0;
  if (!product.value.price || !product.value.originalPrice) return 0;
  if (product.value.originalPrice <= 0 || product.value.price >= product.value.originalPrice) return 0;
  
  return Math.round((1 - (product.value.price / product.value.originalPrice)) * 100);
});

const isStockLow = computed(() => {
  if (!product.value) return false;
  return product.value.stock > 0 && product.value.stock <= 10;
});

const isOutOfStock = computed(() => {
  if (!product.value) return true;
  return product.value.stock <= 0;
});

const validSelectedAttrs = computed(() => {
  if (!product.value || !product.value.attributes) return true;
  
  const requiredAttrs = product.value.attributes.filter(attr => attr.required);
  return requiredAttrs.every(attr => selectedAttrs[attr.name]);
});

// 产品链接
const productLink = computed(() => window.location.href);

// SEO元数据
const seoMeta = computed(() => {
  if (!product.value) {
    return {
      title: '商品详情 - 母婴商城',
      description: '母婴商城提供各类高品质母婴用品，为宝宝提供优质呵护。',
      image: ''
    };
  }
  
  return {
    title: `${product.value.name} - 母婴商城`,
    description: product.value.brief || `${product.value.name}，优质母婴用品，${product.value.price}元起，快来选购！`,
    image: product.value.images && product.value.images.length > 0 ? product.value.images[0] : ''
  };
});

// 设置页面元数据
useHead({
  title: computed(() => seoMeta.value.title),
  meta: [
    { name: 'description', content: computed(() => seoMeta.value.description) },
    { property: 'og:title', content: computed(() => seoMeta.value.title) },
    { property: 'og:description', content: computed(() => seoMeta.value.description) },
    { property: 'og:image', content: computed(() => seoMeta.value.image) },
    { property: 'og:url', content: computed(() => productLink.value) },
    { property: 'og:type', content: 'product' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: computed(() => seoMeta.value.title) },
    { name: 'twitter:description', content: computed(() => seoMeta.value.description) },
    { name: 'twitter:image', content: computed(() => seoMeta.value.image) }
  ],
  link: [
    { rel: 'canonical', href: computed(() => productLink.value) }
  ]
});

// 产品缓存管理
const productCache = reactive(new Map());
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5分钟缓存

// 从缓存获取产品数据
const getProductFromCache = (productId) => {
  if (!productCache.has(productId)) return null;
  
  const cacheItem = productCache.get(productId);
  const now = Date.now();
  
  // 检查缓存是否过期
  if (now - cacheItem.timestamp > CACHE_EXPIRY_TIME) {
    productCache.delete(productId);
    return null;
  }
  
  return cacheItem.data;
};

// 保存产品数据到缓存
const saveProductToCache = (productId, data) => {
  productCache.set(productId, {
    data,
    timestamp: Date.now()
  });
};

// 分享选项
const shareOptions = [
  { name: '微信', icon: 'ChatDotRound', type: 'wechat' },
  { name: '微博', icon: 'Promotion', type: 'weibo' },
  { name: 'QQ', icon: 'View', type: 'qq' },
  { name: '链接', icon: 'CopyDocument', type: 'copy' },
];

// 方法
const setCurrentImage = (index) => {
  currentImageIndex.value = index;
};

const formatPrice = (price) => {
  // 添加空值和类型检查
  if (price === undefined || price === null) {
    return '0.00';
  }
  // 确保price是数字
  const numPrice = Number(price);
  if (isNaN(numPrice)) {
    return '0.00';
  }
  return numPrice.toFixed(2);
};

const formatDiscount = (discount) => {
  return (discount * 10).toFixed(0);
};

const getSelectedAttrsText = (attrs) => {
  if (!attrs) return '';
  const attrTexts = [];
  for (const key in attrs) {
    attrTexts.push(`${key}: ${attrs[key]}`);
  }
  return attrTexts.join(' / ');
};

const goToProductList = () => {
  router.push('/products');
};

// 跳转到指定商品详情页
const goToProduct = (id) => {
  if (id === route.params.id) return;
  router.push(`/products/${id}`);
};

// 打开图片预览
const openImageViewer = (index = currentImageIndex.value) => {
  if (!product.value || !product.value.images || product.value.images.length === 0) return;
  
  imageViewerIndex.value = index;
  isImageViewerVisible.value = true;
};

// 添加到购物车
const addToCart = async () => {
  // 检查是否选择了所有必选属性
  if (!validSelectedAttrs.value) {
    const missingAttrs = product.value.attributes
      .filter(attr => attr.required && !selectedAttrs[attr.name])
      .map(attr => attr.name)
      .join('、');
    
    ElMessage.warning(`请选择${missingAttrs}`);
    return;
  }
  
  if (isAddingToCart.value) return;
  isAddingToCart.value = true;
  
  try {
    await cartStore.addToCart({
      productId: product.value.id,
      quantity: quantity.value,
      attrs: getSelectedAttrsObject()
    });
    
    ElMessage({
      message: '已成功加入购物车',
      type: 'success',
      customClass: 'custom-message'
    });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error('添加到购物车失败，请稍后再试');
  } finally {
    isAddingToCart.value = false;
  }
};

// 获取所选属性对象
const getSelectedAttrsObject = () => {
  const result = {};
  if (!product.value || !product.value.attributes) return result;
  
  product.value.attributes.forEach(attr => {
    if (selectedAttrs[attr.name]) {
      const selectedValue = attr.values.find(val => val.id === selectedAttrs[attr.name]);
      if (selectedValue) {
        result[attr.name] = selectedValue.name;
      }
    }
  });
  
  return result;
};

// 立即购买
const buyNow = () => {
  // 检查是否选择了所有必选属性
  if (!validSelectedAttrs.value) {
    const missingAttrs = product.value.attributes
      .filter(attr => attr.required && !selectedAttrs[attr.name])
      .map(attr => attr.name)
      .join('、');
    
    ElMessage.warning(`请选择${missingAttrs}`);
    return;
  }
  
  // 获取当前选择的属性值文本
  const selectedAttrsText = getSelectedAttrsObject();
  
  // 创建临时订单项
  const orderItem = {
    id: Date.now().toString(), // 临时ID
    productId: product.value.id,
    title: product.value.name,
    image: product.value.images[0],
    price: product.value.price,
    originalPrice: product.value.originalPrice,
    quantity: quantity.value,
    specs: selectedAttrsText,
    subtotal: product.value.price * quantity.value
  };
  
  // 存储到订单store
  orderStore.setTempOrderItems([orderItem]);
  
  // 跳转到结算页面，传递购买来源标记
  router.push({
    path: '/checkout',
    query: { from: 'buy_now' }
  });
};

// 切换收藏状态
const toggleFavorite = async () => {
  if (!product.value || isFavoriteLoading.value) return;
  
  if (!userStore.isLoggedIn) {
    ElMessageBox.confirm('登录后才能收藏商品，是否前往登录？', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      });
    }).catch(() => {});
    return;
  }
  
  isFavoriteLoading.value = true;
  
  try {
    const res = await toggleProductFavorite(product.value.id);
    
    if (res.code === 200) {
      product.value.isFavorite = !product.value.isFavorite;
      
      ElMessage({
        type: 'success',
        message: product.value.isFavorite ? '已添加到收藏' : '已取消收藏',
        customClass: 'custom-message'
      });
    } else {
      ElMessage.error(res.message || '操作失败，请稍后重试');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    isFavoriteLoading.value = false;
  }
};

// 分享商品
const shareProduct = () => {
  isShareDialogVisible.value = true;
};

// 处理不同类型的分享
const handleShare = (type) => {
  switch (type) {
    case 'wechat':
      ElMessage.info('请使用微信扫一扫功能分享');
      break;
    case 'weibo':
      window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(productLink.value)}&title=${encodeURIComponent(product.value?.name || '商品分享')}&pic=${encodeURIComponent(product.value?.images[0])}`);
      break;
    case 'qq':
      window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(productLink.value)}&title=${encodeURIComponent(product.value?.name || '商品分享')}&pics=${encodeURIComponent(product.value?.images[0])}`);
      break;
    case 'copy':
      copyProductLink();
      break;
    default:
      if (navigator.share) {
        navigator.share({
          title: product.value?.name || '商品分享',
          text: product.value?.brief || '查看这个商品',
          url: productLink.value
        }).catch(error => {
          console.error('分享失败:', error);
          copyProductLink();
        });
      } else {
        copyProductLink();
      }
  }
  
  // 关闭分享弹窗
  isShareDialogVisible.value = false;
};

// 复制商品链接
const copyProductLink = () => {
  const el = document.createElement('textarea');
  el.value = productLink.value;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  
  ElMessage({
    message: '商品链接已复制，可以分享给朋友了',
    type: 'success',
    customClass: 'custom-message'
  });
};

// 显示评价图片
const showReviewImage = (images, index) => {
  const imgViewer = new ElImageViewer({
    urlList: images,
    initialIndex: index
  });
  imgViewer.show();
};

// 筛选评价
const handleReviewFilterChange = () => {
  reviewPage.value = 1;
  fetchReviews();
};

// 按标签筛选评价
const filterReviewsByTag = (tagName) => {
  reviewTagFilter.value = reviewTagFilter.value === tagName ? '' : tagName;
  reviewPage.value = 1;
  fetchReviews();
};

// 评价分页事件处理
const handleReviewSizeChange = (size) => {
  reviewPageSize.value = size;
  fetchReviews();
};

const handleReviewPageChange = (page) => {
  reviewPage.value = page;
  fetchReviews();
};

// 保存至最近浏览
const saveToRecentlyViewed = () => {
  if (!product.value) return;
  
  // 从本地存储获取
  let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  
  // 如果当前商品已在列表中，先移除
  viewed = viewed.filter(item => item.id !== product.value.id);
  
  // 添加到列表开头
  viewed.unshift({
    id: product.value.id,
    name: product.value.name,
    image: product.value.images[0],
    price: product.value.price,
    time: new Date().toISOString()
  });
  
  // 限制保存数量
  if (viewed.length > 10) {
    viewed = viewed.slice(0, 10);
  }
  
  // 保存回本地存储
  localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
  
  // 更新状态
  recentlyViewed.value = viewed;
};

// 加载最近浏览记录
const loadRecentlyViewed = () => {
  try {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recentlyViewed.value = viewed;
  } catch (error) {
    console.error('加载最近浏览记录失败:', error);
    recentlyViewed.value = [];
  }
};

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true;
  loadError.value = false;
  try {
    const productId = route.params.id;
    
    // 检查产品ID是否有效
    if (!productId) {
      console.error('获取商品详情失败: 无效的商品ID');
      product.value = null;
      loadError.value = true;
      ElMessage.warning('商品不存在或已下架');
      router.push('/products');
      return;
    }
    
    const cachedProduct = getProductFromCache(productId);
    
    if (cachedProduct) {
      product.value = cachedProduct;
      document.title = `${product.value.name || '商品详情'} - 母婴商城`;
      saveToRecentlyViewed();
      
      // 获取评价和相关推荐
      fetchReviews();
      fetchRelatedProducts();
    } else {
      const res = await getProductDetail(productId);
      
      if (res.code === 200 && res.data) {
        product.value = res.data;
        
        // 处理图片数据
        if (!product.value.images || !Array.isArray(product.value.images)) {
          product.value.images = product.value.images 
            ? [product.value.images] 
            : ['/src/assets/images/product-placeholder.jpg'];
        }
        
        // 如果评分为空，设置默认值
        if (!product.value.rating) {
          product.value.rating = 5;
        }
        
        // 确保价格字段存在
        if (product.value.price === undefined || product.value.price === null) {
          product.value.price = 0;
        }
        
        if (product.value.originalPrice === undefined || product.value.originalPrice === null) {
          product.value.originalPrice = product.value.price;
        }
        
        // 默认选择第一个属性值
        if (product.value.attributes && Array.isArray(product.value.attributes)) {
          product.value.attributes.forEach(attr => {
            if (attr.values && attr.values.length > 0) {
              selectedAttrs[attr.name] = attr.values[0].id;
            }
          });
        }
        
        document.title = `${product.value.name || '商品详情'} - 母婴商城`;
        saveToRecentlyViewed();
        
        // 获取评价和相关推荐
        fetchReviews();
        fetchRelatedProducts();
        
        // 保存到缓存
        saveProductToCache(productId, product.value);
      } else {
        product.value = null;
        loadError.value = !res.code;
        ElMessage.error(res.message || '获取商品详情失败');
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败，请稍后重试');
    product.value = null;
    loadError.value = true;
  } finally {
    loading.value = false;
  }
};

// 重试获取商品详情
const retryFetchProductDetail = () => {
  fetchProductDetail();
};

// 获取商品评价
const fetchReviews = async () => {
  reviewLoading.value = true;
  reviewLoadError.value = false;
  try {
    // 检查产品和产品ID是否有效
    if (!product.value || !product.value.id) {
      console.warn('获取商品评价失败: 无效的商品ID');
      reviews.value = [];
      reviewTotal.value = 0;
      reviewLoadError.value = true;
      return;
    }
    
    const params = {
      page: reviewPage.value,
      pageSize: reviewPageSize.value,
      filter: reviewFilter.value,
      tag: reviewTagFilter.value
    };
    
    const res = await getProductReviews(product.value.id, params);
    
    if (res.code === 200 && res.data) {
      reviews.value = res.data.list || [];
      reviewTotal.value = res.data.total || 0;
    } else {
      console.error('获取商品评价失败:', res.message);
      reviews.value = [];
      reviewTotal.value = 0;
      reviewLoadError.value = !res.code;
    }
  } catch (error) {
    console.error('获取商品评价失败:', error);
    reviews.value = [];
    reviewTotal.value = 0;
    reviewLoadError.value = true;
  } finally {
    reviewLoading.value = false;
  }
};

// 重试获取评价
const retryFetchReviews = () => {
  fetchReviews();
};

// 获取相关推荐商品
const fetchRelatedProducts = async () => {
  relatedProductsLoading.value = true;
  relatedLoadError.value = false;
  try {
    // 检查产品和产品ID是否有效
    if (!product.value || !product.value.id) {
      console.warn('获取相关推荐商品失败: 无效的商品ID');
      relatedProducts.value = [];
      relatedLoadError.value = true;
      return;
    }
    
    const res = await getRelatedProducts(product.value.id, { limit: 5 });
    
    if (res.code === 200) {
      relatedProducts.value = res.data || [];
    } else {
      console.error('获取相关推荐商品失败:', res.message);
      relatedProducts.value = [];
      relatedLoadError.value = !res.code;
    }
  } catch (error) {
    console.error('获取相关推荐商品失败:', error);
    relatedProducts.value = [];
    relatedLoadError.value = true;
  } finally {
    relatedProductsLoading.value = false;
  }
};

// 重试获取相关推荐
const retryFetchRelated = () => {
  fetchRelatedProducts();
};

// 联系客服
const contactCustomerService = () => {
  ElMessageBox.alert(
    '客服热线: 400-888-9999<br>工作时间: 周一至周日 9:00-21:00', 
    '联系客服', 
    {
      confirmButtonText: '确定',
      dangerouslyUseHTMLString: true
    }
  );
};

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (!newId) {
      // 如果ID无效，重定向到商品列表页
      console.warn('无效的商品ID, 重定向到商品列表页');
      ElMessage.warning('商品不存在或已下架');
      router.push('/products');
      return;
    }

    if (newId && newId !== oldId) {
      currentImageIndex.value = 0;
      quantity.value = 1;
      reviewFilter.value = 'all';
      reviewPage.value = 1;
      reviewTagFilter.value = '';
      fetchProductDetail();
    }
  },
  { immediate: true } // 立即执行一次
);

// 生命周期钩子
onMounted(() => {
  loadRecentlyViewed();
  // 不需要再次调用fetchProductDetail，因为watch已经设置了immediate:true
});
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
}

/* 通用样式 */
.text-primary {
  color: var(--el-color-primary, #f27c8d);
}

.bg-primary {
  background-color: var(--el-color-primary, #f27c8d);
}

.border-primary {
  border-color: var(--el-color-primary, #f27c8d);
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 1rem;
}

/* 骨架屏动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 商品标签 */
.product-tag {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.new-tag {
  background-color: rgba(var(--el-color-success-rgb, 94, 206, 86), 0.9);
  color: white;
}

.discount-tag {
  background-color: rgba(var(--el-color-danger-rgb, 245, 108, 108), 0.9);
  color: white;
}

.stock-tag {
  background-color: rgba(var(--el-color-warning-rgb, 230, 162, 60), 0.9);
  color: white;
}

.outofstock-tag {
  background-color: rgba(68, 68, 68, 0.9);
  color: white;
}

/* 折扣徽章 */
.discount-badge {
  background-color: #fff0f3;
  color: var(--el-color-primary, #f27c8d);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
}

/* 缩略图导航 */
.product-thumbnail-list {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  overflow: hidden;
  transition: all 0.2s ease;
}

.thumbnail-item.active {
  border-color: var(--el-color-primary, #f27c8d);
}

.thumbnail-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 商品主图 */
.product-main-image {
  object-fit: contain;
  transition: transform 0.3s ease;
}

.image-wrapper:hover .product-main-image {
  transform: scale(1.02);
}

/* 属性选择 */
.attr-selected {
  font-weight: 500;
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(var(--el-color-primary-rgb, 242, 124, 141), 0.2);
}

/* 按钮样式 */
.action-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
}

.add-cart-btn:hover {
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb, 242, 124, 141), 0.3);
}

.buy-now-btn:hover {
  box-shadow: 0 4px 12px rgba(var(--el-color-danger-rgb, 245, 108, 108), 0.3);
}

/* 加载动画 */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--el-color-primary-rgb, 242, 124, 141), 0.2);
  border-top-color: var(--el-color-primary, #f27c8d);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 详情内容样式 */
.rich-text-content {
  color: #333;
  line-height: 1.8;
  font-size: 1rem;
}

.rich-text-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.5rem 0 0.8rem;
  color: #333;
}

.rich-text-content p {
  margin-bottom: 1rem;
}

.rich-text-content ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.rich-text-content li {
  margin-bottom: 0.5rem;
  position: relative;
}

.rich-text-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* 评价样式 */
.review-item:first-child {
  border-top: none;
}

.review-item:last-child {
  border-bottom: none;
}

/* 评价图片悬停效果 */
.review-image-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.review-image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-rate) {
  --el-rate-icon-size: 18px;
}

:deep(.el-tabs__item) {
  padding: 0 1.5rem;
  height: 48px;
  line-height: 48px;
  font-size: 1rem;
}

:deep(.el-tabs__active-bar) {
  height: 3px;
}

:deep(.custom-message) {
  border-radius: 8px;
  font-weight: 500;
}

/* 服务项目样式 */
.service-item {
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.service-item:hover {
  color: var(--el-color-primary, #f27c8d);
}

/* 响应式样式 */
@media (max-width: 1024px) {
  .product-main {
    padding: 1rem;
  }
  
  .review-summary {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-stats {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .review-tags {
    margin-left: 0;
    margin-top: 1rem;
    width: 100%;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .product-actions {
    gap: 0.5rem;
  }
  
  .product-attrs .attr-values {
    flex-wrap: wrap;
  }
  
  .thumbnail-item {
    min-width: 60px;
    height: 60px;
  }
  
  .review-image-item {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 576px) {
  .reviews-filter {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-btn {
    font-size: 0.875rem;
  }
}
</style> 
