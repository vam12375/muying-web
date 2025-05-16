<template>
  <section class="brand-showcase">
    <div class="container">
      <div class="brand-showcase__header">
        <h2 class="brand-showcase__title">品牌精选</h2>
        <p class="brand-showcase__subtitle">FEATURED BRANDS</p>
      </div>
      
      <div class="brand-showcase__content">
        <div class="brand-showcase__intro">
          <p class="brand-showcase__text">
            我们严选全球知名母婴品牌，为宝宝提供最优质的产品。每一个品牌都经过严格筛选，确保品质和安全。
          </p>
          <MuButton 
            type="outline" 
            @click="navigateTo('/brands')"
          >
            查看所有品牌
          </MuButton>
        </div>
        
        <div class="brand-showcase__marquee-wrapper">
          <div class="brand-showcase__marquee">
            <div class="brand-showcase__marquee-track">
              <div 
                v-for="(brand, index) in displayBrands" 
                :key="`brand-${index}`"
                class="brand-item"
                @click="navigateTo(brand.link)"
              >
                <div class="brand-item__inner">
                  <img :src="brand.logo" :alt="brand.name" class="brand-item__logo">
                </div>
              </div>
            </div>
            <div class="brand-showcase__marquee-track">
              <div 
                v-for="(brand, index) in displayBrands" 
                :key="`brand-dup-${index}`"
                class="brand-item"
                @click="navigateTo(brand.link)"
              >
                <div class="brand-item__inner">
                  <img :src="brand.logo" :alt="brand.name" class="brand-item__logo">
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="brand-showcase__featured">
          <div 
            v-for="(brand, index) in featuredBrands" 
            :key="brand.id"
            :class="['featured-brand', `featured-brand--${index + 1}`]"
          >
            <MuCard 
              class="featured-brand__card" 
              hover 
              clickable
              :glass="brand.glass"
              @click="navigateTo(brand.link)"
            >
              <template #header>
                <div class="featured-brand__header">
                  <img :src="brand.logo" :alt="brand.name" class="featured-brand__logo">
                </div>
              </template>
              
              <div class="featured-brand__content">
                <h3 class="featured-brand__name">{{ brand.name }}</h3>
                <p class="featured-brand__desc">{{ brand.description }}</p>
                
                <div class="featured-brand__products">
                  <div 
                    v-for="product in brand.featuredProducts" 
                    :key="product.id"
                    class="brand-product"
                    @click.stop="navigateToProduct(product.id)"
                  >
                    <div class="brand-product__image">
                      <img :src="product.image" :alt="product.name">
                    </div>
                    <div class="brand-product__info">
                      <p class="brand-product__name">{{ product.name }}</p>
                      <p class="brand-product__price">¥{{ product.price.toFixed(2) }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <template #footer>
                <div class="featured-brand__footer">
                  <MuButton 
                    type="text" 
                    @click.stop="navigateTo(brand.link)"
                  >
                    查看品牌 <span class="arrow-icon">→</span>
                  </MuButton>
                </div>
              </template>
            </MuCard>
          </div>
        </div>
      </div>
    </div>
    
    <div class="brand-showcase__decoration brand-showcase__decoration--1"></div>
    <div class="brand-showcase__decoration brand-showcase__decoration--2"></div>
  </section>
</template>

<script>
import MuButton from '../ui/Button.vue';
import MuCard from '../ui/Card.vue';

export default {
  name: 'BrandShowcase',
  components: {
    MuButton,
    MuCard
  },
  props: {
    brands: {
      type: Array,
      default: () => [
        { id: 1, name: 'Pampers', logo: '/brands/pampers.png', link: '/brand/pampers' },
        { id: 2, name: 'Aptamil', logo: '/brands/aptamil.png', link: '/brand/aptamil' },
        { id: 3, name: 'Avent', logo: '/brands/avent.png', link: '/brand/avent' },
        { id: 4, name: 'Fisher-Price', logo: '/brands/fisher-price.png', link: '/brand/fisher-price' },
        { id: 5, name: 'Medela', logo: '/brands/medela.png', link: '/brand/medela' },
        { id: 6, name: 'Pigeon', logo: '/brands/pigeon.png', link: '/brand/pigeon' },
        { id: 7, name: 'Gerber', logo: '/brands/gerber.png', link: '/brand/gerber' },
        { id: 8, name: 'Chicco', logo: '/brands/chicco.png', link: '/brand/chicco' }
      ]
    }
  },
  computed: {
    displayBrands() {
      // 如果有传入的品牌数据则使用，否则使用默认数据
      if (this.brands.length > 0) {
        return this.brands;
      }
      
      return this.defaultBrands;
    }
  },
  data() {
    return {
      defaultBrands: [
        { id: 1, name: '惠氏', logo: '/brands/wyeth.png', link: '/brand/wyeth' },
        { id: 2, name: '美素佳儿', logo: '/brands/friso.png', link: '/brand/friso' },
        { id: 3, name: '帮宝适', logo: '/brands/pampers.png', link: '/brand/pampers' },
        { id: 4, name: '花王', logo: '/brands/huawang.png', link: '/brand/huawang' },
        { id: 5, name: '爱他美', logo: '/brands/aptamil.png', link: '/brand/aptamil' },
        { id: 6, name: '费雪', logo: '/brands/fisher-price.png', link: '/brand/fisher-price' },
        { id: 7, name: '飞利浦新安怡', logo: '/brands/avent.png', link: '/brand/avent' },
        { id: 8, name: '美德乐', logo: '/brands/medela.png', link: '/brand/medela' },
        { id: 9, name: '贝亲', logo: '/brands/pigeon.png', link: '/brand/pigeon' },
        { id: 10, name: '嘉宝', logo: '/brands/gerber.png', link: '/brand/gerber' }
      ],
      featuredBrands: [
        {
          id: 5,
          name: '爱他美',
          logo: '/brands/aptamil-big.png',
          description: '源自德国的高端婴幼儿配方奶粉品牌，专注婴幼儿营养研究超过40年',
          link: '/brand/aptamil',
          glass: false,
          featuredProducts: [
            { id: 101, name: '爱他美白金版奶粉1段', image: '/products/aptamil-1.jpg', price: 358.00 },
            { id: 102, name: '爱他美有机奶粉2段', image: '/products/aptamil-2.jpg', price: 398.00 },
            { id: 103, name: '爱他美青少年奶粉', image: '/products/aptamil-3.jpg', price: 278.00 }
          ]
        },
        {
          id: 6,
          name: '费雪',
          logo: '/brands/fisher-price-big.png',
          description: '全球著名玩具品牌，专注于儿童早期发展和教育玩具设计',
          link: '/brand/fisher-price',
          glass: true,
          featuredProducts: [
            { id: 201, name: '费雪音乐小钢琴', image: '/products/fisher-1.jpg', price: 199.00 },
            { id: 202, name: '费雪小狮子学步车', image: '/products/fisher-2.jpg', price: 399.00 },
            { id: 203, name: '费雪积木套装', image: '/products/fisher-3.jpg', price: 159.00 }
          ]
        }
      ]
    }
  },
  methods: {
    navigateTo(link) {
      if (link) {
        this.$router.push(link);
      }
    },
    navigateToProduct(productId) {
      this.$router.push(`/product/${productId}`);
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.brand-showcase {
  padding: $spacing-16 0;
  position: relative;
  overflow: hidden;
  background-color: $color-white;
  
  .container {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
    position: relative;
    z-index: 2;
  }
  
  &__header {
    text-align: center;
    margin-bottom: $spacing-12;
  }
  
  &__title {
    font-size: $font-size-2xl;
    font-weight: $font-weight-bold;
    color: $color-grey-900;
    margin-bottom: $spacing-2;
  }
  
  &__subtitle {
    font-size: $font-size-sm;
    color: $color-grey-500;
    letter-spacing: 0.05em;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-12;
  }
  
  &__intro {
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    
    .mu-button {
      margin-top: $spacing-6;
    }
  }
  
  &__text {
    font-size: $font-size-lg;
    color: $color-grey-700;
    line-height: $line-height-loose;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
    }
  }
  
  &__marquee-wrapper {
    margin: $spacing-10 0;
    overflow: hidden;
  }
  
  &__marquee {
    display: flex;
    width: 100%;
    overflow: hidden;
  }
  
  &__marquee-track {
    display: flex;
    animation: infiniteSlide 30s linear infinite;
    
    &:hover {
      animation-play-state: paused;
    }
  }
  
  &__featured {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }
  
  &__decoration {
    position: absolute;
    border-radius: 50%;
    
    &--1 {
      top: -150px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba($color-primary, 0.1) 0%, rgba($color-primary, 0) 70%);
    }
    
    &--2 {
      bottom: -200px;
      left: -150px;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba($color-secondary, 0.1) 0%, rgba($color-secondary, 0) 70%);
    }
  }
}

.brand-item {
  padding: $spacing-4 $spacing-6;
  cursor: pointer;
  
  &__inner {
    width: 120px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $color-white;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    transition: all $transition-normal $ease-out;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: $shadow-md;
    }
    
    @media (max-width: $breakpoint-md) {
      width: 100px;
      height: 70px;
    }
  }
  
  &__logo {
    max-width: 80%;
    max-height: 50px;
    object-fit: contain;
  }
}

.featured-brand {
  &__card {
    height: 100%;
  }
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-4;
    border-bottom: 1px solid $color-grey-200;
  }
  
  &__logo {
    max-height: 50px;
    max-width: 150px;
    object-fit: contain;
  }
  
  &__content {
    padding: $spacing-4 0;
  }
  
  &__name {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $color-grey-900;
    margin-bottom: $spacing-2;
  }
  
  &__desc {
    font-size: $font-size-sm;
    color: $color-grey-600;
    line-height: $line-height-normal;
    margin-bottom: $spacing-4;
  }
  
  &__products {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-3;
    
    @media (max-width: $breakpoint-xl) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  &__footer {
    .arrow-icon {
      display: inline-block;
      transition: transform $transition-normal $ease-out;
    }
    
    .mu-button:hover .arrow-icon {
      transform: translateX(5px);
    }
  }
}

.brand-product {
  cursor: pointer;
  transition: all $transition-normal $ease-out;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &__image {
    border-radius: $radius-md;
    overflow: hidden;
    margin-bottom: $spacing-2;
    
    img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      
      @media (max-width: $breakpoint-lg) {
        height: 80px;
      }
    }
  }
  
  &__info {
    padding: 0 $spacing-1;
  }
  
  &__name {
    font-size: $font-size-xs;
    color: $color-grey-800;
    margin-bottom: $spacing-1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &__price {
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    color: $color-primary;
  }
}

@keyframes infiniteSlide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
</style> 