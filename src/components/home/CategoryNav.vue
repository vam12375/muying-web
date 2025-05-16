<template>
  <section class="category-nav">
    <div class="container">
      <div class="category-nav__header">
        <h2 class="category-nav__title">精选分类</h2>
        <p class="category-nav__subtitle">SELECTED CATEGORIES</p>
      </div>
      
      <div class="category-nav__grid">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          @click="navigateTo(category.link)"
        >
          <div 
            :class="[
              'category-item__inner', 
              { 'category-item__inner--organic': category.organic }
            ]"
          >
            <div class="category-item__icon-wrapper">
              <div class="category-item__icon-bg"></div>
              <img 
                :src="category.icon" 
                :alt="category.name"
                class="category-item__icon"
              />
            </div>
            <h3 class="category-item__name">{{ category.name }}</h3>
            <p class="category-item__count">{{ category.count }}+ 商品</p>
          </div>
        </div>
      </div>
      
      <div class="category-nav__more">
        <MuButton 
          type="outline" 
          @click="navigateTo('/categories')"
        >
          查看全部分类
        </MuButton>
      </div>
    </div>
  </section>
</template>

<script>
import MuButton from '../ui/Button.vue';

export default {
  name: 'CategoryNav',
  components: {
    MuButton
  },
  props: {
    categories: {
      type: Array,
      default: () => [
        {
          id: 1,
          name: '奶粉辅食',
          description: '全球精选婴幼儿奶粉及辅食',
          icon: '/icons/milk.svg',
          link: '/category/milk',
          accentColor: 'primary'
        },
        {
          id: 2,
          name: '尿裤湿巾',
          description: '舒适透气的尿裤与温和湿巾',
          icon: '/icons/diaper.svg',
          link: '/category/diaper',
          accentColor: 'secondary'
        },
        {
          id: 3,
          name: '喂养用品',
          description: '奶瓶、奶嘴、餐具等喂养装备',
          icon: '/icons/feeding.svg',
          link: '/category/feeding',
          accentColor: 'accent'
        },
        {
          id: 4,
          name: '洗护用品',
          description: '温和呵护宝宝娇嫩肌肤',
          icon: '/icons/bath.svg',
          link: '/category/bath',
          accentColor: 'primary'
        },
        {
          id: 5,
          name: '婴儿服饰',
          description: '舒适安全的婴幼儿服装',
          icon: '/icons/clothes.svg',
          link: '/category/clothes',
          accentColor: 'secondary'
        },
        {
          id: 6,
          name: '玩具早教',
          description: '益智玩具促进感官与认知发展',
          icon: '/icons/toys.svg',
          link: '/category/toys',
          accentColor: 'accent'
        },
        {
          id: 7,
          name: '孕产妈妈',
          description: '孕期及产后妈妈专属用品',
          icon: '/icons/maternity.svg',
          link: '/category/maternity',
          accentColor: 'primary'
        },
        {
          id: 8,
          name: '童床寝具',
          description: '婴幼儿床具与柔软寝具',
          icon: '/icons/bed.svg',
          link: '/category/bed',
          accentColor: 'secondary'
        }
      ]
    }
  },
  methods: {
    navigateTo(link) {
      if (link) {
        this.$router.push(link);
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.category-nav {
  padding: $spacing-12 0;
  
  .container {
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
  }
  
  &__header {
    text-align: center;
    margin-bottom: $spacing-10;
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
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-6;
    
    @media (max-width: $breakpoint-lg) {
      grid-template-columns: repeat(3, 1fr);
    }
    
    @media (max-width: $breakpoint-md) {
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-4;
    }
    
    @media (max-width: $breakpoint-xs) {
      grid-template-columns: 1fr;
    }
  }
  
  &__more {
    margin-top: $spacing-10;
    text-align: center;
  }
}

.category-item {
  cursor: pointer;
  
  &__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-6;
    background-color: $color-white;
    border-radius: $radius-xl;
    box-shadow: $shadow-sm;
    transition: all $transition-normal $ease-out;
    height: 100%;
    
    &:hover {
      transform: translateY(-8px);
      box-shadow: $shadow-lg;
      
      .category-item__icon-bg {
        transform: scale(1.1);
      }
    }
    
    &--organic {
      .category-item__icon-wrapper {
        border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        animation: morphBlob 15s $ease-in-out infinite alternate;
      }
    }
  }
  
  &__icon-wrapper {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: $spacing-4;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: $gradient-primary-to-secondary;
    overflow: hidden;
    
    @media (max-width: $breakpoint-md) {
      width: 70px;
      height: 70px;
    }
  }
  
  &__icon-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    transition: transform $transition-normal $ease-out;
  }
  
  &__icon {
    position: relative;
    z-index: 1;
    width: 40px;
    height: 40px;
    object-fit: contain;
    
    @media (max-width: $breakpoint-md) {
      width: 35px;
      height: 35px;
    }
  }
  
  &__name {
    font-size: $font-size-md;
    font-weight: $font-weight-medium;
    color: $color-grey-900;
    margin-bottom: $spacing-2;
    text-align: center;
  }
  
  &__count {
    font-size: $font-size-sm;
    color: $color-grey-500;
    text-align: center;
  }
}
</style> 