<template>
  <section class="hero-section">
    <div class="hero-section__container">
      <MuCarousel 
        :slides="banners" 
        :autoplay="true"
        :autoplayInterval="5000"
        :dots="true"
        :navigation="true"
        :effect="'fade'"
        :height="bannerHeight"
        :organic="false"
      >
        <template #slide="{ slide, isActive }">
          <div 
            :class="['hero-slide', { 'hero-slide--active': isActive }]"
            :style="{ backgroundImage: `url(${slide.image})` }"
          >
            <div class="hero-slide__content">
              <h2 
                class="hero-slide__title"
                :class="[`animate-${slide.titleAnimation || 'fadeInUp'}`]"
              >
                {{ slide.title }}
              </h2>
              <p 
                class="hero-slide__description"
                :class="[`animate-${slide.descAnimation || 'fadeInUp'}`, 'delay-200']"
              >
                {{ slide.description }}
              </p>
              <div 
                class="hero-slide__actions"
                :class="[`animate-${slide.btnAnimation || 'fadeInUp'}`, 'delay-400']"
              >
                <MuButton 
                  :type="slide.btnType || 'primary'" 
                  :rounded="true"
                  :withShine="true"
                  @click="navigateTo(slide.link)"
                >
                  {{ slide.btnText || '立即查看' }}
                </MuButton>
              </div>
            </div>
          </div>
        </template>
      </MuCarousel>
    </div>
    <div class="hero-section__wave">
      <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" 
          fill="#ffffff"
          opacity="0.3"
        ></path>
        <path 
          d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" 
          fill="#ffffff"
          opacity="0.6"
        ></path>
        <path 
          d="M0,32L60,37.3C120,43,240,53,360,69.3C480,85,600,107,720,101.3C840,96,960,64,1080,58.7C1200,53,1320,75,1380,85.3L1440,96L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" 
          fill="#ffffff"
        ></path>
      </svg>
    </div>
    <div class="hero-section__particles">
      <div v-for="i in 10" :key="i" class="particle"></div>
    </div>
  </section>
</template>

<script>
import MuButton from '../ui/Button.vue';
import MuCarousel from '../ui/Carousel.vue';

export default {
  name: 'HeroSection',
  components: {
    MuButton,
    MuCarousel
  },
  props: {
    banners: {
      type: Array,
      default: () => [
        {
          id: 1,
          title: '妈妈的选择，宝宝的呵护',
          description: '严选全球优质母婴用品，为宝宝提供最好的呵护',
          image: '/banners/banner1.jpg',
          btnText: '立即选购',
          btnType: 'primary',
          link: '/products/baby-care',
          titleAnimation: 'fadeInDown',
          descAnimation: 'fadeInUp',
          btnAnimation: 'fadeInUp'
        },
        {
          id: 2,
          title: '初春上新，温暖出行',
          description: '精选婴幼儿春季新款服饰，舒适保暖又时尚',
          image: '/banners/banner2.jpg',
          btnText: '查看详情',
          btnType: 'secondary',
          link: '/products/baby-clothes',
          titleAnimation: 'fadeInLeft',
          descAnimation: 'fadeInRight',
          btnAnimation: 'fadeInUp'
        },
        {
          id: 3,
          title: '科学营养，健康成长',
          description: '来自全球的优质辅食和营养品，助力宝宝健康成长',
          image: '/banners/banner3.jpg',
          btnText: '了解更多',
          btnType: 'accent',
          link: '/products/nutrition',
          titleAnimation: 'fadeInScale',
          descAnimation: 'fadeInScale',
          btnAnimation: 'fadeInUp'
        }
      ]
    },
    bannerHeight: {
      type: [String, Number],
      default: '500px'
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

.hero-section {
  position: relative;
  width: 100%;
  margin-bottom: $spacing-16;
  overflow: hidden;
  
  &__container {
    position: relative;
    z-index: 1;
  }
  
  &__wave {
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    z-index: 2;
    line-height: 0;
    
    svg {
      width: 100%;
      height: auto;
    }
  }
  
  &__particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    
    .particle {
      position: absolute;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
      
      @for $i from 1 through 10 {
        &:nth-child(#{$i}) {
          left: random(100) * 1%;
          width: random(15) + 5px;
          height: random(15) + 5px;
          opacity: random(5) * 0.1 + 0.2;
          animation: particleRise random(10) + 15s ease-in-out infinite;
          animation-delay: random(5) * 1s;
        }
      }
    }
  }
}

.hero-slide {
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%);
    z-index: 1;
  }
  
  &__content {
    position: relative;
    z-index: 2;
    max-width: 600px;
    margin-left: 10%;
    color: $color-white;
    
    @media (max-width: $breakpoint-md) {
      margin-left: $spacing-6;
      margin-right: $spacing-6;
    }
  }
  
  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-4;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-2xl;
    }
    
    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-xl;
    }
  }
  
  &__description {
    font-size: $font-size-lg;
    margin-bottom: $spacing-6;
    line-height: $line-height-loose;
    max-width: 80%;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
    }
  }
  
  &__actions {
    .mu-button {
      padding: 0 $spacing-6;
      height: 3.25rem;
      font-size: $font-size-base;
      
      @media (max-width: $breakpoint-md) {
        height: 2.75rem;
        padding: 0 $spacing-5;
      }
    }
  }
}
</style> 