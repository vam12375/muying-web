<template>
  <div 
    :class="[
      'mu-carousel', 
      { 'mu-carousel--fullscreen': fullscreen },
      { 'mu-carousel--organic': organic },
      { 'mu-carousel--dots-inside': dotsInside },
      { 'mu-carousel--nav-outside': navOutside },
      { 'mu-carousel--fade': effect === 'fade' },
      { 'mu-carousel--slide': effect === 'slide' },
      { 'mu-carousel--auto-height': autoHeight },
    ]"
    :style="carouselStyle"
  >
    <div 
      class="mu-carousel__inner" 
      ref="carouselInner"
      :style="innerStyle"
    >
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        :class="[
          'mu-carousel__slide',
          { 'mu-carousel__slide--active': index === activeIndex },
          { 'mu-carousel__slide--prev': index === getPrevIndex() },
          { 'mu-carousel__slide--next': index === getNextIndex() }
        ]"
        :style="slideStyle(index)"
        @mouseenter="pauseOnHover && stopAutoplay()"
        @mouseleave="pauseOnHover && startAutoplay()"
      >
        <slot 
          :name="`slide-${index}`" 
          :index="index" 
          :isActive="index === activeIndex"
        >
          <div class="mu-carousel__slide-content">
            <slot 
              name="slide" 
              :slide="slide" 
              :index="index" 
              :isActive="index === activeIndex"
            >
              <img 
                v-if="typeof slide === 'string'"
                :src="slide" 
                :alt="`slide ${index}`" 
                :style="imgStyle"
              />
              <div v-else>{{ slide }}</div>
            </slot>
          </div>
        </slot>
      </div>
    </div>

    <!-- 导航箭头 -->
    <div 
      v-if="navigation" 
      class="mu-carousel__nav mu-carousel__nav--prev" 
      @click="prevSlide"
    >
      <slot name="prev-nav">
        <div class="mu-carousel__nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"/>
          </svg>
        </div>
      </slot>
    </div>
    <div 
      v-if="navigation" 
      class="mu-carousel__nav mu-carousel__nav--next" 
      @click="nextSlide"
    >
      <slot name="next-nav">
        <div class="mu-carousel__nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"/>
          </svg>
        </div>
      </slot>
    </div>

    <!-- 指示点 -->
    <div v-if="dots" class="mu-carousel__dots">
      <slot name="dots" :active="activeIndex" :count="slides.length">
        <div 
          v-for="(_, index) in slides" 
          :key="index"
          :class="[
            'mu-carousel__dot',
            { 'mu-carousel__dot--active': index === activeIndex }
          ]"
          @click="setActive(index)"
        ></div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MuCarousel',
  props: {
    slides: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    },
    effect: {
      type: String,
      default: 'slide',
      validator: (value) => ['slide', 'fade'].includes(value)
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    autoplayInterval: {
      type: Number,
      default: 3000
    },
    pauseOnHover: {
      type: Boolean,
      default: true
    },
    loop: {
      type: Boolean,
      default: true
    },
    dots: {
      type: Boolean,
      default: true
    },
    dotsInside: {
      type: Boolean,
      default: true
    },
    navigation: {
      type: Boolean,
      default: true
    },
    navOutside: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    height: {
      type: [String, Number],
      default: '300px'
    },
    width: {
      type: [String, Number],
      default: '100%'
    },
    autoHeight: {
      type: Boolean,
      default: false
    },
    transition: {
      type: [String, Number],
      default: 500
    },
    organic: {
      type: Boolean,
      default: false
    },
    objectFit: {
      type: String,
      default: 'cover'
    }
  },
  data() {
    return {
      activeIndex: this.initialIndex,
      autoplayTimer: null,
      slideWidth: 0,
      slideHeight: 0,
      touchStartX: 0,
      touchStartY: 0,
      touchMoveX: 0,
      touchMoveY: 0,
      isTouching: false,
      isAnimating: false
    }
  },
  computed: {
    carouselStyle() {
      const style = {};
      if (!this.autoHeight) {
        style.height = typeof this.height === 'number' ? `${this.height}px` : this.height;
      }
      style.width = typeof this.width === 'number' ? `${this.width}px` : this.width;
      return style;
    },
    innerStyle() {
      if (this.effect === 'slide') {
        return {
          transform: `translateX(-${this.activeIndex * 100}%)`,
          transition: this.isAnimating ? `transform ${this.transitionTime}ms ${this.transitionEasing}` : 'none'
        };
      }
      return {};
    },
    imgStyle() {
      return {
        objectFit: this.objectFit
      };
    },
    transitionTime() {
      return Number(this.transition);
    },
    transitionEasing() {
      return 'cubic-bezier(0.4, 0, 0.2, 1)';
    }
  },
  mounted() {
    this.startAutoplay();
    window.addEventListener('resize', this.handleResize);
    this.updateSlideSize();
    
    // 添加触摸事件
    this.$refs.carouselInner.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.$refs.carouselInner.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.$refs.carouselInner.addEventListener('touchend', this.handleTouchEnd);
  },
  beforeUnmount() {
    this.stopAutoplay();
    window.removeEventListener('resize', this.handleResize);
    
    // 移除触摸事件
    if (this.$refs.carouselInner) {
      this.$refs.carouselInner.removeEventListener('touchstart', this.handleTouchStart);
      this.$refs.carouselInner.removeEventListener('touchmove', this.handleTouchMove);
      this.$refs.carouselInner.removeEventListener('touchend', this.handleTouchEnd);
    }
  },
  methods: {
    startAutoplay() {
      if (this.autoplay && !this.autoplayTimer) {
        this.autoplayTimer = setInterval(() => {
          this.nextSlide();
        }, this.autoplayInterval);
      }
    },
    stopAutoplay() {
      if (this.autoplayTimer) {
        clearInterval(this.autoplayTimer);
        this.autoplayTimer = null;
      }
    },
    nextSlide() {
      const nextIndex = this.getNextIndex();
      if (nextIndex !== null) {
        this.setActive(nextIndex);
      }
    },
    prevSlide() {
      const prevIndex = this.getPrevIndex();
      if (prevIndex !== null) {
        this.setActive(prevIndex);
      }
    },
    getNextIndex() {
      if (this.activeIndex === this.slides.length - 1) {
        return this.loop ? 0 : null;
      }
      return this.activeIndex + 1;
    },
    getPrevIndex() {
      if (this.activeIndex === 0) {
        return this.loop ? this.slides.length - 1 : null;
      }
      return this.activeIndex - 1;
    },
    setActive(index) {
      if (index !== this.activeIndex) {
        this.isAnimating = true;
        this.activeIndex = index;
        this.$emit('change', index);
        
        // 重置动画状态
        setTimeout(() => {
          this.isAnimating = false;
        }, this.transitionTime);
      }
    },
    updateSlideSize() {
      if (this.$refs.carouselInner) {
        this.slideWidth = this.$refs.carouselInner.offsetWidth;
        this.slideHeight = this.$refs.carouselInner.offsetHeight;
      }
    },
    handleResize() {
      this.updateSlideSize();
    },
    slideStyle(index) {
      if (this.effect === 'fade') {
        return {
          opacity: index === this.activeIndex ? 1 : 0,
          zIndex: index === this.activeIndex ? 1 : 0,
          transition: `opacity ${this.transitionTime}ms ${this.transitionEasing}`
        };
      }
      return {};
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isTouching = true;
      this.stopAutoplay();
    },
    handleTouchMove(e) {
      if (!this.isTouching) return;
      
      this.touchMoveX = e.touches[0].clientX;
      this.touchMoveY = e.touches[0].clientY;
    },
    handleTouchEnd() {
      if (!this.isTouching) return;
      
      const deltaX = this.touchStartX - this.touchMoveX;
      const deltaY = this.touchStartY - this.touchMoveY;
      
      // 确保是水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
        if (deltaX > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
      
      this.isTouching = false;
      this.startAutoplay();
    }
  },
  emits: ['change']
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.mu-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: $radius-xl;
  
  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: $z-index-modal;
    border-radius: 0;
  }
  
  &--organic {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation: morphBlob 30s $ease-in-out infinite alternate;
    transform-origin: center;
  }
  
  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    transition: transform $transition-normal $ease-out;
  }
  
  &__slide {
    position: relative;
    flex: 0 0 100%;
    width: 100%;
    height: 100%;
    
    .mu-carousel--fade & {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transition: opacity $transition-normal $ease-out;
      pointer-events: none;
      
      &--active {
        opacity: 1;
        pointer-events: auto;
      }
    }
    
    &-content {
      width: 100%;
      height: 100%;
      
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
  
  &__nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba($color-white, 0.7);
    color: $color-grey-700;
    border-radius: 50%;
    cursor: pointer;
    z-index: 2;
    transition: all $transition-normal $ease-out;
    backdrop-filter: blur(5px);
    
    &:hover {
      background-color: rgba($color-white, 0.9);
      color: $color-primary;
      transform: translateY(-50%) scale(1.1);
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
    
    &--prev {
      left: $spacing-4;
    }
    
    &--next {
      right: $spacing-4;
    }
    
    .mu-carousel--nav-outside & {
      &--prev {
        left: -$spacing-8;
      }
      
      &--next {
        right: -$spacing-8;
      }
      
      @media (max-width: $breakpoint-md) {
        &--prev {
          left: $spacing-2;
        }
        
        &--next {
          right: $spacing-2;
        }
      }
    }
    
    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        fill: currentColor;
        width: 1.5rem;
        height: 1.5rem;
      }
    }
  }
  
  &__dots {
    position: absolute;
    bottom: $spacing-4;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: $spacing-2;
    z-index: 2;
    
    .mu-carousel--dots-inside & {
      bottom: $spacing-4;
    }
    
    .mu-carousel:not(.mu-carousel--dots-inside) & {
      bottom: -$spacing-6;
    }
  }
  
  &__dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: $radius-full;
    background-color: rgba($color-white, 0.5);
    backdrop-filter: blur(5px);
    cursor: pointer;
    transition: all $transition-normal $ease-out;
    
    &:hover {
      background-color: rgba($color-white, 0.8);
    }
    
    &--active {
      width: 1.5rem;
      background-color: $color-white;
    }
    
    .mu-carousel:not(.mu-carousel--dots-inside) & {
      background-color: rgba($color-grey-500, 0.5);
      
      &:hover {
        background-color: rgba($color-grey-500, 0.8);
      }
      
      &--active {
        background-color: $color-primary;
      }
    }
  }
}
</style> 