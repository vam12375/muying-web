<template>
  <section class="recommended-section">
    <div class="container">
      <div class="recommended-section__header">
        <div class="recommended-section__title-group">
          <h2 class="recommended-section__title">{{ title }}</h2>
          <p class="recommended-section__subtitle">RECOMMENDED FOR YOU</p>
        </div>
        <div v-if="!isLoading && isLoggedIn" class="recommended-section__filter">
          <div class="preference-selector">
            <label class="preference-selector__label">偏好</label>
            <div class="preference-selector__options">
              <button 
                v-for="tag in preferenceOptions" 
                :key="tag.id"
                :class="[
                  'preference-tag', 
                  { 'preference-tag--active': selectedPreferences.includes(tag.id) }
                ]"
                @click="togglePreference(tag.id)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="isLoading" class="recommended-section__loading">
        <div class="loading-spinner"></div>
        <p>正在为您加载个性化推荐...</p>
      </div>
      
      <div v-else-if="isLoggedIn" class="recommended-section__grid">
        <template v-if="filteredRecommendations.length > 0">
          <div 
            v-for="product in filteredRecommendations" 
            :key="product.id"
            class="product-card-wrapper"
          >
            <MuCard 
              class="product-card" 
              hover
              clickable
              @click="navigateToProduct(product.id)"
            >
              <template #image>
                <div class="product-card__image-wrapper">
                  <img 
                    :src="product.image" 
                    :alt="product.name" 
                    class="product-card__image"
                  />
                  <div v-if="product.discount" class="product-card__discount">
                    <MuBadge 
                      :content="`-${product.discount}%`" 
                      type="error"
                      size="md"
                    />
                  </div>
                </div>
              </template>
              
              <div class="product-card__tags">
                <span 
                  v-for="tag in product.tags.slice(0, 3)" 
                  :key="tag.id"
                  :class="[
                    'product-tag',
                    `product-tag--${tag.type || 'default'}`
                  ]"
                >
                  {{ tag.name }}
                </span>
              </div>
              
              <h3 class="product-card__name">{{ product.name }}</h3>
              
              <div class="product-card__meta">
                <div class="product-card__rating">
                  <div class="product-card__stars">
                    <span v-for="i in 5" :key="i" class="product-card__star">
                      <svg 
                        :class="[
                          'star-icon', 
                          i <= product.rating ? 'star-icon--filled' : 'star-icon--empty'
                        ]"
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </span>
                  </div>
                  <span class="product-card__rating-count">{{ product.rating.toFixed(1) }}</span>
                </div>
                
                <div class="product-card__price">
                  <span v-if="product.originalPrice" class="product-card__original-price">
                    ¥{{ product.originalPrice.toFixed(2) }}
                  </span>
                  <span class="product-card__current-price">
                    ¥{{ product.price.toFixed(2) }}
                  </span>
                </div>
              </div>
              
              <div class="product-card__match">
                <div 
                  class="match-indicator"
                  :style="{ '--match-percent': `${product.matchPercent}%` }"
                >
                  <div class="match-indicator__bar"></div>
                </div>
                <span class="match-indicator__text">{{ product.matchPercent }}% 匹配度</span>
              </div>
              
              <template #footer>
                <div class="product-card__footer">
                  <MuButton 
                    type="primary" 
                    size="sm"
                    @click.stop="addToCart(product)"
                  >
                    加入购物车
                  </MuButton>
                  <button 
                    class="product-card__wishlist"
                    @click.stop="toggleWishlist(product)"
                  >
                    <svg 
                      :class="[
                        'wishlist-icon', 
                        { 'wishlist-icon--active': product.inWishlist }
                      ]"
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
              </template>
            </MuCard>
          </div>
        </template>
        
        <div v-else-if="isLoggedIn && displayRecommendations.length === 0" class="recommended-section__empty">
          <div class="empty-recommendations">
            <div class="empty-recommendations__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 3a2.5 2.5 0 0 1 2.5 2.5c0 .894-.466 1.606-1.025 2.148-.543.526-1.275.91-1.975 1.202l-.362.135-.363.146V14h2v2H9v-3.46l.6-.3c.626-.313 1.099-.633 1.428-.957.316-.306.6-.79.6-1.283A1.5 1.5 0 0 0 10.5 8.5h-2V7h2A2.5 2.5 0 0 1 12 7z" fill="#909399"/>
              </svg>
            </div>
            <h3 class="empty-recommendations__title">暂无个性化推荐</h3>
            <p class="empty-recommendations__description">
              我们正在了解您的喜好，浏览更多商品或完成购买将帮助我们提供更精准的推荐
            </p>
            <div class="empty-recommendations__actions">
              <MuButton 
                type="primary" 
                @click="navigateTo('/products')"
              >
                浏览商品
              </MuButton>
            </div>
          </div>
        </div>
        
        <div v-else class="recommended-section__empty">
          <p>没有符合当前筛选条件的推荐商品</p>
          <MuButton 
            type="outline" 
            @click="resetPreferences"
          >
            重置筛选条件
          </MuButton>
        </div>
      </div>
      
      <div v-else class="recommended-section__login-prompt">
        <div class="login-card">
          <div class="login-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
              <path fill="none" d="M0 0h24v24H0z"/>
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-4.987-3.744A7.966 7.966 0 0 0 12 20c1.97 0 3.773-.712 5.167-1.892A6.979 6.979 0 0 0 12.16 16a6.981 6.981 0 0 0-5.147 2.256zM5.616 16.82A8.975 8.975 0 0 1 12.16 14a8.972 8.972 0 0 1 6.362 2.634 8 8 0 1 0-12.906.187zM12 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/>
            </svg>
          </div>
          <h3 class="login-card__title">登录获取个性化推荐</h3>
          <p class="login-card__description">
            登录后我们将根据您的喜好和购买历史提供更精准的商品推荐
          </p>
          <div class="login-card__actions">
            <MuButton 
              type="primary" 
              @click="navigateTo('/login')"
            >
              立即登录
            </MuButton>
            <MuButton 
              type="text" 
              @click="navigateTo('/register')"
            >
              注册账号
            </MuButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import MuCard from '../ui/Card.vue';
import MuButton from '../ui/Button.vue';
import MuBadge from '../ui/Badge.vue';

export default {
  name: 'RecommendedForYou',
  components: {
    MuCard,
    MuButton,
    MuBadge
  },
  props: {
    title: {
      type: String,
      default: '猜你喜欢'
    },
    isLoggedIn: {
      type: Boolean,
      default: true // 默认值方便调试，实际使用需要传入真实的登录状态
    },
    recommendations: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedPreferences: [],
      preferenceOptions: [
        { id: 'baby_clothes', name: '婴儿服饰' },
        { id: 'diaper', name: '纸尿裤' },
        { id: 'toy', name: '玩具' },
        { id: 'milk_powder', name: '奶粉' },
        { id: 'feeding', name: '喂养' },
        { id: 'bath', name: '洗护' }
      ],
      demoRecommendations: [
        {
          id: 1,
          name: '婴儿柔软蜂巢毯',
          description: '四季通用，亲肤透气',
          price: 139.00,
          originalPrice: 169.00,
          image: '/products/rec-1.jpg',
          matchScore: 97,
          tags: ['for you', 'new'],
          inWishlist: false
        },
        {
          id: 2,
          name: '婴儿按摩精油',
          description: '纯天然植物精油，促进睡眠',
          price: 89.00,
          originalPrice: 109.00,
          image: '/products/rec-2.jpg',
          matchScore: 95,
          tags: ['for you', 'trending'],
          inWishlist: true
        },
        {
          id: 3,
          name: '婴儿多肉植物玩偶套装',
          description: '柔软安全，色彩鲜艳',
          price: 129.00,
          originalPrice: null,
          image: '/products/rec-3.jpg',
          matchScore: 92,
          tags: ['for you', 'best seller'],
          inWishlist: false
        },
        {
          id: 4,
          name: '婴儿智能体温监测器',
          description: '实时监测，APP连接',
          price: 239.00,
          originalPrice: 299.00,
          image: '/products/rec-4.jpg',
          matchScore: 90,
          tags: ['for you', 'sale'],
          inWishlist: false
        },
        {
          id: 5,
          name: '婴儿海洋音乐投影仪',
          description: '多种自然声音，自动关闭',
          price: 179.00,
          originalPrice: null,
          image: '/products/rec-5.jpg',
          matchScore: 88,
          tags: ['best seller', 'trending'],
          inWishlist: false
        },
        {
          id: 6,
          name: '婴儿微量元素营养滴剂',
          description: '补充DHA和维生素D',
          price: 198.00,
          originalPrice: 238.00,
          image: '/products/rec-6.jpg',
          matchScore: 86,
          tags: ['best seller', 'sale'],
          inWishlist: false
        }
      ]
    }
  },
  computed: {
    displayRecommendations() {
      // 使用传入的recommendations或默认的demo数据
      if (this.recommendations.length > 0) {
        // 验证和修复API返回的推荐数据格式
        return this.recommendations.map(product => {
          let formattedProduct = { ...product };
          
          // 确保存在matchPercent字段
          if (typeof formattedProduct.matchPercent === 'undefined') {
            formattedProduct.matchPercent = Math.floor(Math.random() * 15) + 85; // 85-100随机值
          }
          
          // 确保标签格式正确
          if (!Array.isArray(formattedProduct.tags)) {
            formattedProduct.tags = [];
          } else if (formattedProduct.tags.length > 0 && typeof formattedProduct.tags[0] !== 'object') {
            // 如果标签是字符串数组，转换为对象数组
            formattedProduct.tags = formattedProduct.tags.map(tag => ({
              id: typeof tag === 'string' ? tag : `tag-${Math.random()}`,
              name: typeof tag === 'string' ? tag : '标签',
              type: 'default'
            }));
          }
          
          // 为登录用户添加"为您推荐"标签，如果没有其他标签
          if (this.isLoggedIn && (!formattedProduct.tags || formattedProduct.tags.length === 0)) {
            formattedProduct.tags = [{ id: 'for_you', name: '为您推荐', type: 'primary' }];
          }
          
          return formattedProduct;
        });
      }
      return this.demoRecommendations;
    },
    filteredRecommendations() {
      if (this.selectedPreferences.length === 0) {
        return this.displayRecommendations;
      }
      
      return this.displayRecommendations.filter(product => {
        const productCategories = product.tags.map(tag => tag.id);
        return this.selectedPreferences.some(pref => {
          return productCategories.includes(pref) || 
                 product.tags.some(tag => tag.name.toLowerCase().includes(pref.toLowerCase()));
        });
      });
    }
  },
  methods: {
    togglePreference(preferenceId) {
      const index = this.selectedPreferences.indexOf(preferenceId);
      if (index === -1) {
        this.selectedPreferences.push(preferenceId);
      } else {
        this.selectedPreferences.splice(index, 1);
      }
    },
    resetPreferences() {
      this.selectedPreferences = [];
    },
    navigateTo(link) {
      if (link) {
        this.$router.push(link);
      }
    },
    navigateToProduct(productId) {
      this.$router.push(`/product/${productId}`);
    },
    addToCart(product) {
      console.log('Add to cart:', product);
      this.$emit('add-to-cart', product);
    },
    toggleWishlist(product) {
      product.inWishlist = !product.inWishlist;
      this.$emit('toggle-wishlist', product);
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.recommended-section {
  padding: $spacing-16 0;
  background-color: $color-grey-50;
  
  .container {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $spacing-10;
    flex-wrap: wrap;
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  
  &__title-group {
    flex-shrink: 0;
  }
  
  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-grey-900;
    margin-bottom: $spacing-1;
  }
  
  &__subtitle {
    font-size: $font-size-sm;
    color: $color-grey-500;
    letter-spacing: 0.05em;
  }
  
  &__filter {
    flex-grow: 1;
    max-width: 600px;
    
    @media (max-width: $breakpoint-md) {
      max-width: 100%;
    }
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
  
  &__loading, &__empty, &__login-prompt {
    grid-column: 1 / -1;
    padding: $spacing-12;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  &__loading {
    color: $color-grey-600;
    
    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 3px solid $color-grey-300;
      border-radius: 50%;
      border-top-color: $color-primary;
      animation: spin 1s infinite linear;
      margin-bottom: $spacing-4;
    }
  }
  
  &__empty {
    color: $color-grey-600;
    
    p {
      margin-bottom: $spacing-4;
    }
  }
}

.preference-selector {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  
  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-grey-700;
  }
  
  &__options {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-2;
  }
}

.preference-tag {
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  background-color: $color-grey-200;
  color: $color-grey-700;
  border: none;
  cursor: pointer;
  transition: all $transition-normal $ease-out;
  
  &:hover {
    background-color: $color-grey-300;
  }
  
  &--active {
    background-color: $color-primary;
    color: $color-white;
    
    &:hover {
      background-color: darken($color-primary, 5%);
    }
  }
}

.product-card-wrapper {
  animation: fadeInUp 0.6s $ease-out forwards;
  
  @for $i from 1 through 6 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.1}s;
    }
  }
}

.product-card {
  height: 100%;
  
  &__image-wrapper {
    position: relative;
    padding-top: 100%; // 1:1 aspect ratio
    overflow: hidden;
  }
  
  &__image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-normal $ease-out;
  }
  
  &:hover &__image {
    transform: scale(1.05);
  }
  
  &__discount {
    position: absolute;
    top: $spacing-2;
    left: $spacing-2;
    z-index: 1;
  }
  
  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-1;
    margin: $spacing-3 0;
  }
  
  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: $color-grey-900;
    margin-bottom: $spacing-3;
    line-height: 1.4;
  }
  
  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-3;
  }
  
  &__rating {
    display: flex;
    align-items: center;
  }
  
  &__stars {
    display: flex;
    margin-right: $spacing-1;
  }
  
  &__star {
    margin-right: 1px;
  }
  
  &__rating-count {
    font-size: $font-size-sm;
    color: $color-grey-700;
  }
  
  &__price {
    display: flex;
    align-items: center;
  }
  
  &__original-price {
    font-size: $font-size-xs;
    color: $color-grey-500;
    text-decoration: line-through;
    margin-right: $spacing-2;
  }
  
  &__current-price {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-primary;
  }
  
  &__match {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    margin-bottom: $spacing-4;
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__wishlist {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: $color-grey-100;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all $transition-normal $ease-out;
    
    &:hover {
      background-color: $color-primary-transparent;
    }
  }
}

.product-tag {
  display: inline-block;
  padding: $spacing-1 $spacing-2;
  border-radius: $radius-full;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  
  &--default {
    background-color: $color-grey-200;
    color: $color-grey-700;
  }
  
  &--category {
    background-color: rgba($color-primary, 0.1);
    color: $color-primary;
  }
  
  &--feature {
    background-color: rgba($color-secondary, 0.1);
    color: $color-secondary;
  }
  
  &--material {
    background-color: rgba($color-success, 0.1);
    color: $color-success;
  }
  
  &--age {
    background-color: rgba($color-accent, 0.1);
    color: $color-accent;
  }
  
  &--size {
    background-color: rgba($color-warning, 0.1);
    color: $color-warning;
  }
}

.match-indicator {
  flex-grow: 1;
  height: 6px;
  background-color: $color-grey-200;
  border-radius: $radius-full;
  overflow: hidden;
  
  &__bar {
    height: 100%;
    width: var(--match-percent, 0%);
    background: $gradient-primary-to-secondary;
    border-radius: $radius-full;
  }
  
  &__text {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    color: $color-grey-700;
  }
}

.login-card {
  max-width: 400px;
  width: 100%;
  padding: $spacing-8;
  background-color: $color-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  text-align: center;
  
  &__icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: $gradient-primary-to-secondary;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto $spacing-6;
    color: $color-white;
  }
  
  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-grey-900;
    margin-bottom: $spacing-3;
  }
  
  &__description {
    font-size: $font-size-base;
    color: $color-grey-600;
    line-height: $line-height-normal;
    margin-bottom: $spacing-6;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-3;
    justify-content: center;
    
    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
    }
  }
}

.star-icon {
  fill: $color-grey-300;
  
  &--filled {
    fill: #FFD700;
  }
}

.wishlist-icon {
  fill: $color-grey-400;
  
  &--active {
    fill: $color-error;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 空推荐样式
.empty-recommendations {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 450px;
  margin: 0 auto;
  
  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    background-color: $color-grey-100;
    border-radius: 50%;
    margin-bottom: $spacing-6;
  }
  
  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-grey-900;
    margin-bottom: $spacing-3;
    text-align: center;
  }
  
  &__description {
    font-size: $font-size-base;
    color: $color-grey-600;
    text-align: center;
    margin-bottom: $spacing-6;
    line-height: 1.6;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-4;
  }
}
</style> 