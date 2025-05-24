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

    <!-- 商品状态错误提示 -->
    <div v-if="product && product.productStatus !== '上架' && product.productStatus !== undefined" class="error-container status-warning">
      <el-alert
        title="商品状态提示"
        type="warning"
        :description="`该商品当前状态为: ${product.productStatus || '未知'}, 库存: ${product.stock || 0}`"
        show-icon
        :closable="false"
      />
      <div class="status-action">
        <el-button type="primary" @click="$router.push('/products')">浏览其他商品</el-button>
      </div>
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
          <h2 class="section-title">用户评价 <span class="count">({{ ratingStats?.totalComments || product.review_count || product.reviewCount || 0 }})</span></h2>
          <div class="section-more" @click="activeTab = 'comments'">查看全部</div>
        </div>
        
        <!-- 评价统计加载状态 -->
        <div class="comments-stats-loading" v-if="commentsStatsLoading">
          <el-skeleton animated :rows="3" />
          <el-skeleton animated style="margin-top: 20px" :rows="5" />
        </div>
        
        <!-- 评价统计 - 现代化版本 -->
        <div class="comments-stats" v-else>
          <div class="rating-overview">
            <div class="rating-score-circle">
              <div class="circle-progress">
                <div class="circle-inner">
                  <div class="score-number">{{ (ratingStats?.averageRating || product.rating || 5).toFixed(1) }}</div>
                  <div class="score-max">/ 5</div>
                </div>
              </div>
              <svg class="circle-bg">
                <circle cx="50" cy="50" r="45" />
              </svg>
              <svg class="circle-progress-bar">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  :stroke-dasharray="`${getCircleProgressValue()} 283`" 
                />
              </svg>
            </div>
            <div class="rating-text">
              <div class="rating-desc">
                {{ getRatingText(ratingStats?.averageRating || product.rating || 5) }}
              </div>
              <div class="rating-stars">
                <el-rate v-model="ratingStarsValue" disabled show-score></el-rate>
              </div>
              <div class="rating-count">
                <span class="highlight">{{ ratingStats?.totalComments || product.review_count || product.reviewCount || 0 }}</span> 条评价，好评率 
                <span class="highlight">{{ calculateGoodRating() }}%</span>
              </div>
            </div>
          </div>
          
          <div class="rating-distribution" v-if="ratingStats">
            <div class="rating-bar-item" v-for="i in 5" :key="i">
              <div class="star-level">{{ i }}星</div>
              <div class="rating-bar-wrapper">
                <div 
                  class="rating-bar" 
                  :style="{
                    width: `${calculateRatingPercentage(i)}%`,
                    background: i >= 4 ? 'linear-gradient(to right, #67c23a, #95d475)' : 
                              i === 3 ? 'linear-gradient(to right, #e6a23c, #f3d19e)' : 
                              'linear-gradient(to right, #f56c6c, #fab6b6)'
                  }"
                >
                  <span class="bar-percentage" v-if="calculateRatingPercentage(i) > 5">{{ calculateRatingPercentage(i) }}%</span>
              </div>
                <span class="bar-percentage-outside" v-if="calculateRatingPercentage(i) <= 5">{{ calculateRatingPercentage(i) }}%</span>
              </div>
            </div>
          </div>
          <div v-else class="ratings-loading">
            <el-skeleton animated :rows="5" />
          </div>
          
          <!-- 标签云加载状态 -->
          <div class="rating-tags" v-if="commentTags && commentTags.length > 0">
            <div class="tags-title">热门标签</div>
            <div class="tags-cloud">
              <div 
                v-for="(tag, index) in commentTags" 
                :key="index" 
                class="rating-tag"
                :class="{ 'active': selectedCommentTag === tag }"
                @click="filterCommentsByTag(tag)"
              >
                <el-tag 
                  :type="getTagType(index)" 
                  effect="light" 
                  size="small" 
                  class="tag-pill"
                >
                  {{ tag }}
                  <template v-if="tagCounts && tagCounts[tag]">
                    ({{ tagCounts[tag] }})
                  </template>
                </el-tag>
              </div>
            </div>
          </div>
          <div class="rating-tags-empty" v-else-if="!commentsStatsLoading">
            <el-empty description="暂无评价标签" :image-size="60">
              <template #description>
                <p>该商品暂无评价标签</p>
              </template>
            </el-empty>
          </div>
        </div>
        
        <!-- 评价内容预览 - 卡片式设计 -->
        <div class="comments-preview">
          <div v-if="comments.length === 0" class="no-comments">
            <el-empty description="暂无评价">
              <template #image>
                <img src="@/assets/images/no-review.svg" alt="暂无评价" class="no-comments-image" />
              </template>
              <template #description>
                <p>暂时还没有用户评价，成为第一个评价者吧</p>
              </template>
            </el-empty>
          </div>
          <div v-else class="comment-list">
            <transition-group name="comment-fade">
              <el-card 
                v-for="(comment, index) in comments.slice(0, 3)" 
                :key="index" 
                class="comment-card"
                shadow="hover"
              >
                <div class="comment-header">
                  <div class="comment-user-info">
                    <el-avatar :src="comment.userAvatar || userAvatar" :size="40"></el-avatar>
                    <div class="user-details">
                      <div class="user-name">{{ comment.isAnonymous ? '匿名用户' : (comment.userNickname || comment.userName || '用户') }}</div>
                      <div class="comment-date">{{ formatCommentTime(comment.createTime) }}</div>
              </div>
                  </div>
                  <div class="comment-rating">
                    <el-rate v-model="comment.rating" disabled size="small"></el-rate>
                    <div class="rating-text">{{ getRatingText(comment.rating) }}</div>
                  </div>
                </div>
                
                <div class="comment-body">
              <div class="comment-content">{{ comment.content }}</div>
                  
              <div class="comment-images" v-if="comment.images?.length">
                    <div class="images-grid">
                <el-image
                        v-for="(img, imgIndex) in comment.images"
                        :key="imgIndex"
                  :src="img"
                  :preview-src-list="comment.images"
                  fit="cover"
                        class="comment-image"
                        :initial-index="imgIndex"
                      >
                        <template #error>
                          <div class="image-error">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                        <template #placeholder>
                          <div class="image-placeholder">
                            <el-icon><Loading /></el-icon>
                          </div>
                        </template>
                </el-image>
              </div>
                  </div>
                  
              <div class="comment-tags" v-if="comment.tags && comment.tags.length">
                <div 
                  v-for="(tag, tIndex) in comment.tags" 
                  :key="tIndex" 
                  class="tag-item"
                    >
                      <el-tag size="small" effect="plain">{{ tag }}</el-tag>
              </div>
                  </div>
                  
              <div class="comment-product-info" v-if="comment.productSpecs">
                    <el-tag type="info" size="small" effect="plain" class="specs-tag">
                      <el-icon><Goods /></el-icon>
                      <span>{{ comment.productSpecs }}</span>
                    </el-tag>
              </div>
                </div>
                
              <div class="comment-footer">
                <div class="comment-actions">
                    <el-button type="primary" text size="small" class="action-btn">
                    <el-icon><Pointer /></el-icon> 有用({{ comment.usefulCount || 0 }})
                  </el-button>
                    <el-button type="primary" text size="small" class="action-btn">
                    <el-icon><ChatLineSquare /></el-icon> 回复
                  </el-button>
                    <el-button type="primary" text size="small" class="action-btn">
                      <el-icon><Share /></el-icon> 分享
                    </el-button>
                </div>
              </div>
                
                <!-- 评论回复区域 -->
                <div class="comment-replies" v-if="comment.replies && comment.replies.length">
                  <div class="reply-title">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>回复 ({{ comment.replies.length }})</span>
            </div>
                  <div 
                    v-for="(reply, rIndex) in comment.replies" 
                    :key="rIndex"
                    class="reply-item"
                  >
                    <div class="reply-user">{{ reply.userNickname || reply.userName || '用户' }}:</div>
                    <div class="reply-content">{{ reply.content }}</div>
                    <div class="reply-time">{{ formatCommentTime(reply.createTime) }}</div>
                  </div>
                </div>
              </el-card>
            </transition-group>
            
            <div class="view-more-comments" v-if="comments.length > 3">
              <el-button type="primary" plain @click="showAllComments">
                查看更多评价
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 评价分页对话框 - 优化设计 -->
        <el-dialog
          v-model="commentDialogVisible"
          title="全部评价"
          width="800px"
          custom-class="comments-dialog"
          destroy-on-close
        >
          <div class="comments-filter">
            <div class="filter-buttons">
              <el-button 
                :type="commentFilter === 'all' ? 'primary' : ''" 
                :plain="commentFilter !== 'all'"
                class="filter-btn" 
                @click="setCommentFilter('all')"
                round
              >全部</el-button>
              <el-button 
                :type="commentFilter === 'positive' ? 'success' : ''" 
                :plain="commentFilter !== 'positive'"
                class="filter-btn" 
                @click="setCommentFilter('positive')"
                round
              >好评</el-button>
              <el-button 
                :type="commentFilter === 'neutral' ? 'warning' : ''" 
                :plain="commentFilter !== 'neutral'"
                class="filter-btn" 
                @click="setCommentFilter('neutral')"
                round
              >中评</el-button>
              <el-button 
                :type="commentFilter === 'negative' ? 'danger' : ''" 
                :plain="commentFilter !== 'negative'"
                class="filter-btn" 
                @click="setCommentFilter('negative')"
                round
              >差评</el-button>
              <el-button 
                :type="commentFilter === 'withImage' ? 'info' : ''" 
                :plain="commentFilter !== 'withImage'"
                class="filter-btn" 
                @click="setCommentFilter('withImage')"
                round
              ><el-icon><Picture /></el-icon> 有图</el-button>
            </div>
          </div>
          
          <div class="dialog-comment-list">
            <transition-group name="comment-fade">
              <el-card 
                v-for="(comment, index) in filteredComments" 
                :key="index" 
                class="comment-card"
                shadow="hover"
              >
                <div class="comment-header">
                  <div class="comment-user-info">
                    <el-avatar :src="comment.userAvatar || userAvatar" :size="40"></el-avatar>
                    <div class="user-details">
                      <div class="user-name">{{ comment.isAnonymous ? '匿名用户' : (comment.userNickname || comment.userName || '用户') }}</div>
                      <div class="comment-date">{{ formatCommentTime(comment.createTime) }}</div>
              </div>
                  </div>
                  <div class="comment-rating">
                    <el-rate v-model="comment.rating" disabled size="small"></el-rate>
                    <div class="rating-text">{{ getRatingText(comment.rating) }}</div>
                  </div>
                </div>
                
                <div class="comment-body">
              <div class="comment-content">{{ comment.content }}</div>
                  
              <div class="comment-images" v-if="comment.images?.length">
                    <div class="images-grid">
                <el-image
                        v-for="(img, imgIndex) in comment.images"
                        :key="imgIndex"
                  :src="img"
                  :preview-src-list="comment.images"
                  fit="cover"
                        class="comment-image"
                        :initial-index="imgIndex"
                      >
                        <template #error>
                          <div class="image-error">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                        <template #placeholder>
                          <div class="image-placeholder">
                            <el-icon><Loading /></el-icon>
                          </div>
                        </template>
                </el-image>
              </div>
                  </div>
                  
              <div class="comment-tags" v-if="comment.tags && comment.tags.length">
                <div 
                  v-for="(tag, tIndex) in comment.tags" 
                  :key="tIndex" 
                  class="tag-item"
                    >
                      <el-tag size="small" effect="plain">{{ tag }}</el-tag>
              </div>
                  </div>
                  
              <div class="comment-product-info" v-if="comment.productSpecs">
                    <el-tag type="info" size="small" effect="plain" class="specs-tag">
                      <el-icon><Goods /></el-icon>
                      <span>{{ comment.productSpecs }}</span>
                    </el-tag>
              </div>
                </div>
                
              <div class="comment-footer">
                <div class="comment-actions">
                    <el-button type="primary" text size="small" class="action-btn">
                    <el-icon><Pointer /></el-icon> 有用({{ comment.usefulCount || 0 }})
                  </el-button>
                    <el-button type="primary" text size="small" class="action-btn">
                    <el-icon><ChatLineSquare /></el-icon> 回复
                  </el-button>
                    <el-button type="primary" text size="small" class="action-btn">
                      <el-icon><Share /></el-icon> 分享
                    </el-button>
                </div>
              </div>
                
                <!-- 评论回复区域 -->
                <div class="comment-replies" v-if="comment.replies && comment.replies.length">
                  <div class="reply-title">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>回复 ({{ comment.replies.length }})</span>
            </div>
                  <div 
                    v-for="(reply, rIndex) in comment.replies" 
                    :key="rIndex"
                    class="reply-item"
                  >
                    <div class="reply-user">{{ reply.userNickname || reply.userName || '用户' }}:</div>
                    <div class="reply-content">{{ reply.content }}</div>
                    <div class="reply-time">{{ formatCommentTime(reply.createTime) }}</div>
                  </div>
                </div>
              </el-card>
            </transition-group>
          </div>
          
          <div class="dialog-pagination">
            <el-pagination
              background
              layout="prev, pager, next, sizes"
              :total="totalComments"
              :page-size="commentPageSize"
              :current-page="commentPage"
              :page-sizes="[5, 10, 15, 20]"
              @current-change="handleCommentPageChange"
              @size-change="handleCommentSizeChange"
            />
          </div>
        </el-dialog>
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
import { Picture, Loading, Van, GoodsFilled, RefreshRight, ShoppingCart, SoldOut, Star, StarFilled, Top, TopRight, ChatDotRound, ArrowRight, Refresh, ChatRound, Pointer, ChatLineSquare, ArrowDown, Goods } from '@element-plus/icons-vue'
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
import { getProductComments, getProductRatingStats } from '@/api/comment'

const {
  product,
  loading,
  quantity,
  activeTab,
  selectedSpecs,
  comments: originalComments,
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
  productParams,
  getSelectedSpecsText
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

// 评价相关数据
const comments = ref([])
const ratingStats = ref(null)
const commentTags = ref([])
const selectedCommentTag = ref(null)
const commentDialogVisible = ref(false)
const commentFilter = ref('all')
const commentPage = ref(1)
const commentPageSize = ref(10)
const totalComments = ref(0)

// 添加加载状态变量
const commentsStatsLoading = ref(true);

// 标签计数对象
const tagCounts = ref({});

// 获取商品评价
const fetchProductComments = async (productId) => {
  try {
    console.log('获取商品评价，ID:', productId);
    const res = await getProductComments(productId);
    console.log('商品评价API响应:', res);
    
    if (res.code === 200 && res.data) {
      comments.value = res.data;
      console.log('设置评价数据:', comments.value);
      
      // 评论数据加载完后，获取或计算评价统计数据
      fetchProductRatingStats(productId);
    } else {
      console.warn('获取商品评价失败，API返回错误:', res.message || '未知错误');
      comments.value = [];
      commentsStatsLoading.value = false;
    }
  } catch (error) {
    console.error('获取商品评价失败:', error);
    comments.value = [];
    commentsStatsLoading.value = false;
  }
}

// 获取商品评价统计
const fetchProductRatingStats = async (productId) => {
  commentsStatsLoading.value = true;
  try {
    console.log('获取商品评价统计，ID:', productId);
    const res = await getProductRatingStats(productId);
    console.log('评价统计API响应:', res);
    
    if (res.code === 200 && res.data) {
      ratingStats.value = res.data;
      console.log('设置评价统计数据:', ratingStats.value);
      
      // 检查数据结构是否完整
      if (!ratingStats.value.ratingDistribution) {
        console.warn('API返回的评价统计数据不完整，缺少ratingDistribution');
        // 使用本地计算作为备选
        calculateLocalRatingStats();
      }
      
      // 提取评价标签和计数
      if (res.data.tags && Array.isArray(res.data.tags)) {
        commentTags.value = res.data.tags;
        
        // 如果API返回的标签数据包含计数信息，提取出来
        if (res.data.tagCounts) {
          tagCounts.value = res.data.tagCounts;
        } else {
          // 否则初始化标签计数对象，稍后可能通过本地计算设置
          tagCounts.value = {};
          commentTags.value.forEach(tag => {
            tagCounts.value[tag] = 0;
          });
        }
        
        console.log('评价标签:', commentTags.value);
        console.log('标签计数:', tagCounts.value);
      } else {
        console.warn('API返回的评价标签数据不完整或格式错误');
      }
    } else {
      console.warn('获取评价统计失败，API返回错误:', res.message || '未知错误');
      // 使用本地计算作为备选
      calculateLocalRatingStats();
    }
  } catch (error) {
    console.error('获取商品评价统计失败:', error);
    // 使用本地计算作为备选
    calculateLocalRatingStats();
  } finally {
    commentsStatsLoading.value = false;
  }
}

// 本地计算评价统计数据（当API未返回统计数据时使用）
const calculateLocalRatingStats = () => {
  console.log('开始本地计算评价统计数据');
  if (!comments.value || !Array.isArray(comments.value)) {
    console.warn('评论数据不可用，无法计算统计数据');
    return;
  }
  
  try {
    const totalComments = comments.value.length;
    console.log('评论总数:', totalComments);
    
    // 初始化评分分布对象
    const ratingDist = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    
    // 统计各评分数量
    comments.value.forEach(comment => {
      const rating = Math.floor(comment.rating || 5); // 默认5星
      if (rating >= 1 && rating <= 5) {
        ratingDist[rating]++;
      }
    });
    
    console.log('本地计算的评分分布:', ratingDist);
    
    // 提取评论标签（如果有）
    const tagCount = {};
    comments.value.forEach(comment => {
      if (comment.tags && Array.isArray(comment.tags)) {
        comment.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    
    // 更新标签计数
    tagCounts.value = tagCount;
    
    // 获取出现频率最高的标签（最多10个）
    const sortedTags = Object.keys(tagCount)
      .sort((a, b) => tagCount[b] - tagCount[a])
      .slice(0, 10);
    
    console.log('本地提取的热门标签:', sortedTags);
    console.log('标签计数:', tagCounts.value);
    
    // 更新ratingStats对象
    ratingStats.value = {
      totalComments: totalComments,
      ratingDistribution: ratingDist,
      averageRating: calculateAverageRating(ratingDist, totalComments),
      tags: sortedTags
    };
    
    console.log('本地计算的评价统计数据:', ratingStats.value);
    
    // 如果没有标签数据，则使用本地计算的结果
    if (!commentTags.value || !commentTags.value.length) {
      commentTags.value = sortedTags;
    }
  } catch (error) {
    console.error('本地计算评价统计数据出错:', error);
  }
}

// 计算平均评分
const calculateAverageRating = (ratingDist, totalCount) => {
  if (!totalCount) return 5;
  
  let sum = 0;
  for (const [rating, count] of Object.entries(ratingDist)) {
    sum += Number(rating) * count;
  }
  
  return (sum / totalCount).toFixed(1);
}

// 计算筛选后的评价
const filteredComments = computed(() => {
  if (!comments.value) return []
  
  let result = [...comments.value]
  
  // 根据筛选条件过滤
  switch (commentFilter.value) {
    case 'positive':
      result = result.filter(comment => comment.rating >= 4)
      break
    case 'neutral':
      result = result.filter(comment => comment.rating === 3)
      break
    case 'negative':
      result = result.filter(comment => comment.rating < 3)
      break
    case 'withImage':
      result = result.filter(comment => comment.images && comment.images.length > 0)
      break
  }
  
  // 如果选择了标签，进一步筛选
  if (selectedCommentTag.value) {
    result = result.filter(comment => 
      comment.tags && comment.tags.includes(selectedCommentTag.value)
    )
  }
  
  return result
})

// 计算评分占比
const calculateRatingPercentage = (rating) => {
  // 检查ratingStats是否存在且包含必要数据
  if (!ratingStats.value || !ratingStats.value.ratingDistribution) {
    console.warn(`计算评分百分比失败: 评分数据不完整，评分: ${rating}`);
    return 0;
  }
  
  const totalReviews = ratingStats.value.totalComments || 0;
  if (totalReviews === 0) {
    console.warn('计算评分百分比失败: 总评论数为0');
    return 0;
  }
  
  // 确保rating是数字且在1-5范围内
  const validRating = Number(rating);
  if (isNaN(validRating) || validRating < 1 || validRating > 5) {
    console.warn(`计算评分百分比失败: 无效的评分值 ${rating}`);
    return 0;
  }
  
  // 获取当前评分的数量，如果不存在则为0
  const ratingCount = ratingStats.value.ratingDistribution[validRating] || 0;
  console.log(`评分 ${validRating} 的数量:`, ratingCount, '总数:', totalReviews);
  
  // 计算百分比并四舍五入到整数
  const percentage = Math.round((ratingCount / totalReviews) * 100);
  return percentage;
}

// 过滤评论
const filterCommentsByTag = (tag) => {
  if (selectedCommentTag.value === tag) {
    selectedCommentTag.value = null
  } else {
    selectedCommentTag.value = tag
  }
}

// 显示所有评论
const showAllComments = () => {
  commentDialogVisible.value = true
  commentPage.value = 1
  commentFilter.value = 'all'
  selectedCommentTag.value = null
}

// 设置评论过滤器
const setCommentFilter = (filter) => {
  commentFilter.value = filter
  commentPage.value = 1
}

// 处理评论分页
const handleCommentPageChange = (page) => {
  commentPage.value = page
  // 在实际应用中，这里应该调用API获取对应页的评论
}

// 处理评论页面大小变化
const handleCommentSizeChange = (size) => {
  commentPageSize.value = size;
  // 重置页码为1，避免切换页面大小时出现空页
  commentPage.value = 1;
  // 重新加载评论数据
  fetchComments();
}

// 格式化评论时间
const formatCommentTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 小于30天
  if (diff < 2592000000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 大于30天，显示具体日期
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 监听商品ID变化，重新获取评价
watch(() => product.value?.productId || product.value?.goodsId, (newVal) => {
  if (newVal) {
    console.log('商品ID变化，重新获取评价数据:', newVal);
    fetchProductComments(newVal);
  }
}, { immediate: true });

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

// 获取规格值的文本显示，用于UI展示
const getSelectedSpecText = (specName, specValue) => {
  if (!product || !product.specs) return specValue;
  
  const specType = product.specs.find(s => s.name === specName);
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
    
    // 准备商品数据对象
    const productData = {
      id: product.value.goodsId || product.value.id || product.value.productId,
      productId: product.value.goodsId || product.value.id || product.value.productId,
      productName: product.value.goodsName || product.value.productName || product.value.goods_name,
      productImg: product.value.goodsImg || product.value.productImg || product.value.goods_img,
      priceNew: Number(product.value.price_new || product.value.priceNew || product.value.price || 0),
      priceOld: Number(product.value.price_old || product.value.priceOld || product.value.originalPrice || 0),
      specs: getSelectedSpecsFormatted(),
      stock: product.value.stock
    }
    
    // 保存商品详情到localStorage，提供添加购物车参考
    const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}')
    productDetails[productData.id] = {...product.value}
    localStorage.setItem('productDetails', JSON.stringify(productDetails))
    
    console.log('准备添加到购物车的商品:', productData);
    
    // 使用cartStore添加到购物车
      const cartStore = useCartStore();
    const result = await cartStore.addProductToCart(productData, quantity.value);
    
    if (result) {
      ElMessage.success('商品已成功添加到购物车')
      
      // 触发购物车弹窗显示
      cartPopupProduct.value = {
        id: productData.id,
        name: productData.productName,
        image: getImageUrl(productData.productImg),
        price: productData.priceNew,
        quantity: quantity.value,
        specs: productData.specs || ''
      }
      cartPopupVisible.value = true
      
      // 更新购物车数量显示
      cartCount.value = cartStore.totalCount
      
      // 触发购物车更新事件
      window.dispatchEvent(new CustomEvent('cart:updated'))
    } else {
      ElMessage.warning('添加购物车失败，请稍后重试')
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

// 获取评论
const fetchComments = () => {
  // 实现获取评论的逻辑
  console.log('获取评论');
}

// 初始化规格选择
const initSelectedSpecs = () => {
  // 实现初始化规格选择的逻辑
  console.log('初始化规格选择');
}

// 处理商品图片
const handleProductImages = () => {
  // 实现处理商品图片的逻辑
  console.log('处理商品图片');
}

// 获取评论文本
const getRatingText = (rating) => {
  switch (Math.floor(rating)) {
    case 5:
      return '非常满意';
    case 4:
      return '满意';
    case 3:
      return '一般';
    case 2:
      return '不满意';
    case 1:
      return '非常不满意';
    default:
      return '未知';
  }
}

// 计算好评率
const calculateGoodRating = () => {
  // 检查ratingStats是否存在且包含必要数据
  if (!ratingStats.value || !ratingStats.value.ratingDistribution) {
    console.warn('计算好评率失败: 评分数据不完整');
    return 95; // 默认好评率
  }
  
  const totalReviews = ratingStats.value.totalComments || 0;
  if (totalReviews === 0) {
    console.warn('计算好评率失败: 总评论数为0');
    return 100; // 默认100%好评
  }
  
  try {
    // 计算4星和5星评价的总数（好评定义为4-5星）
    const positiveReviews = (ratingStats.value.ratingDistribution[4] || 0) + 
                           (ratingStats.value.ratingDistribution[5] || 0);
    
    console.log('计算好评率:', positiveReviews, '/', totalReviews);
    
    // 计算好评率并四舍五入到整数
    const positivePercentage = Math.round((positiveReviews / totalReviews) * 100);
    return positivePercentage;
  } catch (error) {
    console.error('计算好评率出错:', error);
    return 95; // 发生错误时的默认值
  }
}

// 获取标签类型
const getTagType = (index) => {
  const tagTypes = ['', 'success', 'warning', 'danger', 'info'];
  return tagTypes[index % tagTypes.length];
}

// 计算环形进度条的值
const getCircleProgressValue = () => {
  // 圆环总长度为2πr = 2 * 3.14159 * 45 ≈ 283
  const totalLength = 283;
  // 获取评分
  const rating = Number(ratingStats.value?.averageRating || product.value?.rating || 5);
  // 计算百分比
  const percentage = (rating / 5);
  console.log('环形进度条百分比:', percentage, '评分:', rating);
  // 计算显示长度
  return Math.min(totalLength, Math.max(0, percentage * totalLength));
}

// 星级评分的计算值
const ratingStarsValue = computed(() => {
  return Number(ratingStats.value?.averageRating || product.value?.rating || 5);
});

// 监听comments数据变化，自动更新统计数据（当API没有提供统计数据时使用）
watch(comments, (newComments) => {
  if (newComments && newComments.length > 0 && (!ratingStats.value || !ratingStats.value.ratingDistribution)) {
    console.log('评论数据变化，重新计算统计数据');
    calculateLocalRatingStats();
  }
}, { deep: true });
</script>

<style scoped>
.error-container {
  padding: 40px 0;
  text-align: center;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.status-warning {
  margin: 20px 0;
  background-color: #fef9e7;
  border-radius: 8px;
  padding: 20px;
}

.status-warning .el-alert {
  width: 100%;
  margin-bottom: 20px;
}

.status-action {
  margin-top: 20px;
}

/* 添加评分相关的加载状态样式 */
.ratings-loading {
  padding: 15px;
}

.comments-stats-loading {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  margin-bottom: 30px;
}

.rating-tags-empty {
  margin-top: 20px;
  padding: 15px 0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  /* 评价统计区域移动端优化 */
  .comments-stats {
    padding: 15px 10px !important;
    flex-direction: column;
    gap: 15px !important;
  }
  
  .rating-overview {
    flex-direction: column;
    align-items: center !important;
    gap: 15px !important;
  }
  
  .rating-distribution {
    width: 100%;
  }
  
  .rating-text {
    text-align: center;
    margin-top: 10px;
  }
  
  .rating-bar-item {
    margin-bottom: 8px !important;
  }
  
  .rating-score-circle {
    width: 80px !important;
    height: 80px !important;
  }
  
  .score-number {
    font-size: 20px !important;
  }
  
  .score-max {
    font-size: 10px !important;
  }
  
  .tags-cloud {
    justify-content: center;
  }
  
  /* 评论卡片移动端优化 */
  .comment-card {
    padding: 10px !important;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .comment-rating {
    margin-top: 10px;
    align-self: flex-start;
  }
  
  .images-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 5px !important;
  }
  
  .comment-footer .comment-actions {
    justify-content: space-between;
    width: 100%;
  }
  
  /* 修复z-index问题 */
  .right-floating-panel {
    z-index: 1000 !important;
  }
  
  /* 修复评分条宽度问题 */
  .rating-bar-wrapper {
    max-width: 70vw !important;
  }
}

/* 修复暗模式适配 */
@media (prefers-color-scheme: dark) {
  .comments-stats {
    background-color: #1a1a1a !important;
  }
  
  .circle-bg circle {
    stroke: #333 !important;
  }
  
  .rating-bar-wrapper {
    background-color: #333 !important;
  }
  
  .rating-tags-empty .el-empty__description p {
    color: #aaa !important;
  }
  
  .comment-card {
    background-color: #1a1a1a !important;
    border-color: #333 !important;
  }
  
  .comment-replies {
    background-color: #1a1a1a !important;
  }
  
  .reply-item {
    background-color: #2a2a2a !important;
  }
}

/* 优化评价统计展示动画 */
.rating-bar {
  transition: width 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.circle-progress-bar circle {
  transition: stroke-dasharray 1s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
}

.rating-tag {
  transition: transform 0.3s ease !important;
}

.rating-tag:hover {
  transform: translateY(-2px) !important;
}

.rating-tag.active {
  transform: translateY(-2px) !important;
}
</style>