<template>
  <section class="new-arrivals">
    <div class="container">
      <div class="new-arrivals__header">
        <div class="new-arrivals__title-group">
          <h2 class="new-arrivals__title">新品上市</h2>
          <p class="new-arrivals__subtitle">NEW ARRIVALS</p>
        </div>
        <MuButton 
          type="outline" 
          @click="navigateTo('/products/new')"
        >
          查看全部
        </MuButton>
      </div>
      
      <div class="new-arrivals__carousel-wrapper">
        <MuCarousel 
          :slides="newProducts"
          :effect="'slide'"
          :height="'auto'"
          :autoplay="true"
          :autoHeight="true"
          :autoplayInterval="4000"
          :dots="false"
          :navOutside="true"
          :navigation="true"
          :loop="true"
          :organic="false"
          class="new-arrivals__carousel"
        >
          <template #slide="{ slide, isActive }">
            <div class="new-product">
              <div class="new-product__image">
                <img :src="slide.image" :alt="slide.name">
                <div class="new-product__badge">
                  <MuBadge 
                    content="NEW" 
                    type="accent"
                    size="md"
                    organic
                  />
                </div>
              </div>
              <div class="new-product__content">
                <h3 class="new-product__name">{{ slide.name }}</h3>
                <p class="new-product__desc">{{ slide.description }}</p>
                <div class="new-product__meta">
                  <div class="new-product__price">
                    <span class="new-product__price-now">¥{{ slide.price.toFixed(2) }}</span>
                    <span v-if="slide.originalPrice" class="new-product__price-old">
                      ¥{{ slide.originalPrice.toFixed(2) }}
                    </span>
                  </div>
                  <MuButton 
                    type="primary" 
                    size="sm" 
                    @click.stop="navigateToProduct(slide.id)"
                  >
                    立即查看
                  </MuButton>
                </div>
              </div>
            </div>
          </template>
        </MuCarousel>
      </div>
      
      <div class="new-arrivals__grid">
        <MuCard 
          v-for="(item, index) in gridItems" 
          :key="item.id"
          :class="['grid-item', `grid-item--${index + 1}`]"
          hover
          clickable
          @click="navigateTo(item.link)"
        >
          <template #image>
            <div class="grid-item__image-wrapper">
              <img :src="item.image" :alt="item.title" class="grid-item__image">
            </div>
          </template>
          <template #overlay>
            <div class="grid-item__content">
              <h3 class="grid-item__title">{{ item.title }}</h3>
              <p class="grid-item__desc">{{ item.description }}</p>
              <div class="grid-item__action">
                <MuButton 
                  :type="item.buttonType || 'primary'"
                  size="sm"
                  rounded
                >
                  {{ item.buttonText }}
                </MuButton>
              </div>
            </div>
          </template>
        </MuCard>
      </div>
    </div>
  </section>
</template>

<script>
import MuButton from '../ui/Button.vue';
import MuCarousel from '../ui/Carousel.vue';
import MuCard from '../ui/Card.vue';
import MuBadge from '../ui/Badge.vue';

export default {
  name: 'NewArrivals',
  components: {
    MuButton,
    MuCarousel,
    MuCard,
    MuBadge
  },
  props: {
    newProducts: {
      type: Array,
      default: () => [
        {
          id: 101,
          name: '婴儿超柔棉质睡袋',
          price: 199.00,
          originalPrice: 249.00,
          discount: 20,
          image: '/products/new-1.jpg',
          category: 'sleep'
        },
        {
          id: 102,
          name: '婴儿有机水果泥组合',
          price: 129.00,
          originalPrice: null,
          discount: null,
          image: '/products/new-2.jpg',
          category: 'food'
        },
        {
          id: 103,
          name: '婴儿专用洗衣液',
          price: 69.00,
          originalPrice: 89.00,
          discount: 22,
          image: '/products/new-3.jpg',
          category: 'care'
        },
        {
          id: 104,
          name: '婴儿音乐安抚玩具',
          price: 159.00,
          originalPrice: null,
          discount: null,
          image: '/products/new-4.jpg',
          category: 'toy'
        }
      ]
    }
  },
  data() {
    return {
      gridItems: [
        {
          id: 1,
          title: '夏季必备',
          subtitle: '专为婴儿打造的夏季清凉系列',
          image: '/grid/summer.jpg',
          btnText: '查看系列',
          link: '/collection/summer'
        },
        {
          id: 2,
          title: '精选奶粉',
          subtitle: '全球优质品牌婴幼儿奶粉',
          image: '/grid/milk.jpg',
          btnText: '了解更多',
          link: '/collection/milk'
        },
        {
          id: 3,
          title: '趣味玩具',
          subtitle: '促进宝宝感官与认知发展',
          image: '/grid/toys.jpg',
          btnText: '立即选购',
          link: '/collection/toys'
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

.new-arrivals {
  padding: $spacing-12 0;
  
  .container {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
  }
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-8;
    
    @media (max-width: $breakpoint-sm) {
      flex-direction: column;
      align-items: flex-start;
      gap: $spacing-4;
    }
  }
  
  &__title-group {
    margin-right: $spacing-4;
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
  
  &__carousel-wrapper {
    margin-bottom: $spacing-10;
  }
  
  &__carousel {
    border-radius: $radius-xl;
    overflow: hidden;
    box-shadow: $shadow-lg;
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: $breakpoint-sm) {
      grid-template-columns: 1fr;
    }
  }
}

.new-product {
  display: flex;
  height: 100%;
  min-height: 300px;
  
  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    min-height: auto;
  }
  
  &__image {
    flex: 0 0 50%;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    @media (max-width: $breakpoint-md) {
      flex: 0 0 200px;
    }
  }
  
  &__badge {
    position: absolute;
    top: $spacing-4;
    right: $spacing-4;
  }
  
  &__content {
    flex: 1;
    padding: $spacing-6;
    display: flex;
    flex-direction: column;
    background-color: $color-white;
  }
  
  &__name {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-grey-900;
    margin-bottom: $spacing-3;
  }
  
  &__desc {
    font-size: $font-size-base;
    line-height: $line-height-normal;
    color: $color-grey-600;
    margin-bottom: $spacing-6;
    flex-grow: 1;
  }
  
  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  &__price {
    display: flex;
    flex-direction: column;
  }
  
  &__price-now {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-primary;
  }
  
  &__price-old {
    font-size: $font-size-sm;
    color: $color-grey-500;
    text-decoration: line-through;
  }
}

.grid-item {
  height: 300px;
  overflow: hidden;
  
  @media (max-width: $breakpoint-md) {
    height: 250px;
  }
  
  &__image-wrapper {
    height: 100%;
  }
  
  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-normal $ease-out;
  }
  
  &:hover &__image {
    transform: scale(1.05);
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: $spacing-6;
    width: 100%;
    height: 100%;
    color: $color-white;
  }
  
  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  &__desc {
    font-size: $font-size-base;
    margin-bottom: $spacing-4;
    max-width: 80%;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  &__action {
    margin-top: $spacing-2;
  }
}
</style> 