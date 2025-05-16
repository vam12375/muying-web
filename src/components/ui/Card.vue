<template>
  <div 
    :class="[
      'mu-card', 
      `mu-card--${elevation}`,
      { 'mu-card--hover': hover },
      { 'mu-card--clickable': clickable },
      { 'mu-card--rounded': rounded },
      { 'mu-card--no-padding': noPadding },
      { 'mu-card--glass': glass },
      { 'mu-card--organic': organic }
    ]"
    :style="cardStyle"
    @click="clickable && $emit('click', $event)"
  >
    <div v-if="$slots.image" class="mu-card__image">
      <slot name="image"></slot>
    </div>
    <div v-if="$slots.header" class="mu-card__header">
      <slot name="header"></slot>
    </div>
    <div v-if="!noPadding && !$slots.content" class="mu-card__body">
      <slot></slot>
    </div>
    <div v-else-if="$slots.content">
      <slot name="content"></slot>
    </div>
    <div v-if="$slots.footer" class="mu-card__footer">
      <slot name="footer"></slot>
    </div>
    <div v-if="$slots.overlay" class="mu-card__overlay">
      <slot name="overlay"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MuCard',
  props: {
    elevation: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    hover: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    },
    noPadding: {
      type: Boolean,
      default: false
    },
    glass: {
      type: Boolean,
      default: false
    },
    organic: {
      type: Boolean,
      default: false
    },
    backgroundColor: {
      type: String,
      default: null
    },
    borderColor: {
      type: String,
      default: null
    }
  },
  computed: {
    cardStyle() {
      const style = {};
      if (this.backgroundColor) {
        style.backgroundColor = this.backgroundColor;
      }
      if (this.borderColor) {
        style.borderColor = this.borderColor;
      }
      return style;
    }
  },
  emits: ['click']
}
</script>

<style lang="scss">
@import '../../styles/variables';
@import '../../styles/animations';

.mu-card {
  position: relative;
  background-color: $color-white;
  border-radius: $radius-lg;
  overflow: hidden;
  transition: all $transition-normal $ease-out;
  
  // 阴影变体
  &--sm {
    box-shadow: $shadow-sm;
  }
  
  &--md {
    box-shadow: $shadow-md;
  }
  
  &--lg {
    box-shadow: $shadow-lg;
  }
  
  &--xl {
    box-shadow: $shadow-xl;
  }
  
  // 修饰符
  &--hover {
    &:hover {
      transform: translateY(-8px);
      box-shadow: $shadow-xl;
    }
  }
  
  &--clickable {
    cursor: pointer;
    
    &:active {
      transform: translateY(2px);
      transition: transform $transition-fast $ease-out;
    }
  }
  
  &--rounded {
    border-radius: $radius-2xl;
  }
  
  &--no-padding {
    .mu-card__body {
      padding: 0;
    }
  }
  
  &--glass {
    background-color: rgba($color-white, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba($color-white, 0.2);
  }
  
  &--organic {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation: morphBlob 25s $ease-in-out infinite alternate;
    overflow: hidden;
  }
  
  // 子元素
  &__image {
    position: relative;
    width: 100%;
    overflow: hidden;
    
    img {
      width: 100%;
      display: block;
      transition: transform $transition-normal $ease-out;
    }
    
    .mu-card--hover:hover & img {
      transform: scale(1.05);
    }
  }
  
  &__header {
    padding: $spacing-4 $spacing-4 $spacing-2 $spacing-4;
    font-weight: $font-weight-semibold;
    font-size: $font-size-md;
  }
  
  &__body {
    padding: $spacing-4;
  }
  
  &__footer {
    padding: $spacing-2 $spacing-4 $spacing-4 $spacing-4;
    border-top: 1px solid $color-grey-200;
  }
  
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, 
      rgba(0, 0, 0, 0) 0%, 
      rgba(0, 0, 0, 0.4) 100%);
    opacity: 0;
    transition: opacity $transition-normal $ease-out;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .mu-card--hover:hover & {
      opacity: 1;
    }
  }
}
</style> 