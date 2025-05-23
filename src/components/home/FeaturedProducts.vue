<template>
  <section class="featured-products">
    <div class="container">
      <div class="featured-products__header">
        <div class="featured-products__title-group">
          <h2 class="featured-products__title">精选好物</h2>
          <p class="featured-products__subtitle">FEATURED PRODUCTS</p>
        </div>
        <div class="featured-products__tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-button', { 'tab-button--active': activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>
      
      <div class="featured-products__grid">
        <div 
          v-for="product in filteredProducts" 
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
                    organic
                  />
                </div>
                <div v-if="product.isNew" class="product-card__new">
                  <MuBadge 
                    content="新品" 
                    type="accent"
                    size="md"
                    organic
                  />
                </div>
              </div>
            </template>
            
            <h3 class="product-card__name">{{ product.name }}</h3>
            <p class="product-card__desc">{{ product.shortDesc }}</p>
            
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
                <span class="product-card__rating-count">({{ product.ratingCount }})</span>
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
      </div>
      
      <div class="featured-products__more">
        <MuButton 
          type="outline" 
          @click="navigateTo('/products')"
        >
          查看更多商品
        </MuButton>
      </div>
    </div>
  </section>
</template>

<script>
import MuCard from '../ui/Card.vue';
import MuButton from '../ui/Button.vue';
import MuBadge from '../ui/Badge.vue';

export default {
  name: 'FeaturedProducts',
  components: {
    MuCard,
    MuButton,
    MuBadge
  },
  props: {
    products: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { id: 'all', name: '全部' },
        { id: 'new', name: '新品' },
        { id: 'sale', name: '特惠' },
        { id: 'popular', name: '热卖' }
      ],
      featuredProducts: [
        {
          id: 1,
          name: '有机婴儿配方奶粉',
          shortDesc: '欧洲原装进口，适合0-6个月婴儿',
          image: '/products/milk-1.jpg',
          price: 268.00,
          originalPrice: 318.00,
          discount: 15,
          isNew: true,
          rating: 4.8,
          ratingCount: 256,
          category: 'milk',
          tags: ['new', 'sale', 'popular'],
          inWishlist: false
        },
        {
          id: 2,
          name: '婴儿超薄透气纸尿裤',
          shortDesc: '全天候干爽，预防红屁屁',
          image: '/products/diaper-1.jpg',
          price: 99.00,
          originalPrice: 129.00,
          discount: 20,
          isNew: false,
          rating: 4.7,
          ratingCount: 342,
          category: 'diaper',
          tags: ['sale', 'popular'],
          inWishlist: true
        },
        {
          id: 3,
          name: '婴儿多功能推车',
          shortDesc: '轻便折叠，避震性强',
          image: '/products/stroller-1.jpg',
          price: 1299.00,
          originalPrice: null,
          discount: null,
          isNew: true,
          rating: 4.9,
          ratingCount: 128,
          category: 'vehicle',
          tags: ['new'],
          inWishlist: false
        },
        {
          id: 4,
          name: '婴儿电动摇椅',
          shortDesc: '多档摇摆，哄睡利器',
          image: '/products/chair-1.jpg',
          price: 599.00,
          originalPrice: 699.00,
          discount: 15,
          isNew: false,
          rating: 4.6,
          ratingCount: 207,
          category: 'furniture',
          tags: ['sale'],
          inWishlist: false
        },
        {
          id: 5,
          name: '婴儿洗发沐浴露',
          shortDesc: '温和配方，无泪配方',
          image: '/products/bath-1.jpg',
          price: 89.00,
          originalPrice: 109.00,
          discount: 10,
          isNew: true,
          rating: 4.8,
          ratingCount: 178,
          category: 'care',
          tags: ['new', 'sale'],
          inWishlist: false
        },
        {
          id: 6,
          name: '婴儿连体爬服',
          shortDesc: '纯棉材质，柔软亲肤',
          image: '/products/clothes-1.jpg',
          price: 139.00,
          originalPrice: null,
          discount: null,
          isNew: false,
          rating: 4.7,
          ratingCount: 156,
          category: 'clothes',
          tags: ['popular'],
          inWishlist: true
        },
        {
          id: 7,
          name: '多功能婴儿床',
          shortDesc: '可变书桌，成长陪伴',
          image: '/products/bed-1.jpg',
          price: 1599.00,
          originalPrice: 1899.00,
          discount: 15,
          isNew: false,
          rating: 4.9,
          ratingCount: 98,
          category: 'furniture',
          tags: ['sale', 'popular'],
          inWishlist: false
        },
        {
          id: 8,
          name: '婴儿益智早教玩具',
          shortDesc: '锻炼抓握能力，促进感官发育',
          image: '/products/toy-1.jpg',
          price: 199.00,
          originalPrice: null,
          discount: null,
          isNew: true,
          rating: 4.6,
          ratingCount: 145,
          category: 'toy',
          tags: ['new'],
          inWishlist: false
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      if (this.activeTab === 'all') {
        return this.displayProducts;
      }
      return this.displayProducts.filter(product => product.tags.includes(this.activeTab));
    },
    displayProducts() {
      // 使用props中的products，如果没有则使用默认数据
      return this.products.length > 0 ? this.products : this.featuredProducts;
    }
  },
  methods: {
    navigateTo(link) {
      if (link) {
        this.$router.push(link);
      }
    },
    navigateToProduct(productId) {
      console.log('导航到商品详情页:', productId);
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

.featured-products {
  padding: $spacing-12 0;
  background-color: $color-grey-100;
  
  .container {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-10;
    flex-wrap: wrap;
    gap: $spacing-4;
    
    @media (max-width: $breakpoint-md) {
      flex-direction: column;
      align-items: center;
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
  
  &__tabs {
    display: flex;
    gap: $spacing-2;
    flex-wrap: wrap;
    
    @media (max-width: $breakpoint-md) {
      justify-content: center;
    }
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-xl) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin: 0 auto;
    }
  }
  
  &__more {
    margin-top: $spacing-12;
    text-align: center;
  }
}

.tab-button {
  padding: $spacing-2 $spacing-4;
  background-color: transparent;
  border: none;
  border-radius: $radius-full;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $color-grey-600;
  cursor: pointer;
  transition: all $transition-normal $ease-out;
  
  &:hover {
    color: $color-primary;
    background-color: $color-primary-transparent;
  }
  
  &--active {
    color: $color-white;
    background-color: $color-primary;
  }
}

.product-card-wrapper {
  animation: fadeInUp 0.6s $ease-out forwards;
  
  @for $i from 1 through 8 {
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
  
  &:hover .product-card__image {
    transform: scale(1.05);
  }
  
  &__discount, &__new {
    position: absolute;
    z-index: 1;
  }
  
  &__discount {
    top: $spacing-2;
    left: $spacing-2;
  }
  
  &__new {
    top: $spacing-2;
    right: $spacing-2;
  }
  
  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-semibold;
    color: $color-grey-900;
    margin: $spacing-4 0 $spacing-2;
    line-height: 1.4;
  }
  
  &__desc {
    font-size: $font-size-sm;
    color: $color-grey-600;
    margin-bottom: $spacing-4;
    line-height: $line-height-normal;
  }
  
  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-4;
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
    font-size: $font-size-xs;
    color: $color-grey-500;
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
</style> 