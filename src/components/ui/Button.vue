<template>
  <button 
    :class="[
      'mu-button', 
      `mu-button--${type}`,
      `mu-button--${size}`,
      { 'mu-button--rounded': rounded },
      { 'mu-button--block': block },
      { 'mu-button--with-icon': $slots.icon },
      { 'mu-button--loading': loading },
      { 'mu-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="!disabled && !loading && $emit('click', $event)"
  >
    <span v-if="loading" class="mu-button__loader">
      <span class="mu-button__loader-dot"></span>
      <span class="mu-button__loader-dot"></span>
      <span class="mu-button__loader-dot"></span>
    </span>
    <span v-else-if="$slots.icon" class="mu-button__icon">
      <slot name="icon"></slot>
    </span>
    <span class="mu-button__content">
      <slot></slot>
    </span>
    <span v-if="withShine" class="mu-button__shine"></span>
  </button>
</template>

<script>
export default {
  name: 'MuButton',
  props: {
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'accent', 'outline', 'text', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    rounded: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    withShine: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click']
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.mu-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: $font-family-primary;
  font-weight: $font-weight-medium;
  border: none;
  outline: none;
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  transition: all $transition-normal $ease-out;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  // 尺寸变体
  &--sm {
    height: 2rem;
    padding: 0 $spacing-3;
    font-size: $font-size-xs;
    border-radius: $radius-md;
  }
  
  &--md {
    height: 2.5rem;
    padding: 0 $spacing-4;
    font-size: $font-size-sm;
    border-radius: $radius-lg;
  }
  
  &--lg {
    height: 3rem;
    padding: 0 $spacing-5;
    font-size: $font-size-base;
    border-radius: $radius-xl;
  }
  
  // 类型变体
  &--primary {
    background: $gradient-primary;
    color: $color-white;
    box-shadow: $shadow-primary;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-primary, 0.5);
    }
  }
  
  &--secondary {
    background: $gradient-secondary;
    color: $color-white;
    box-shadow: $shadow-secondary;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-secondary, 0.5);
    }
  }
  
  &--accent {
    background: $gradient-accent;
    color: $color-white;
    box-shadow: $shadow-accent;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-accent, 0.5);
    }
  }
  
  &--outline {
    background: transparent;
    color: $color-primary;
    box-shadow: none;
    border: 2px solid $color-primary-light;
    
    &:hover {
      background: $color-primary-transparent;
    }
  }
  
  &--text {
    background: transparent;
    color: $color-primary;
    box-shadow: none;
    
    &:hover {
      background: $color-primary-transparent;
    }
  }
  
  &--success {
    background: linear-gradient(135deg, lighten($color-success, 10%), $color-success);
    color: $color-white;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-success, 0.5);
    }
  }
  
  &--warning {
    background: linear-gradient(135deg, lighten($color-warning, 10%), $color-warning);
    color: $color-white;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-warning, 0.5);
    }
  }
  
  &--error {
    background: linear-gradient(135deg, lighten($color-error, 10%), $color-error);
    color: $color-white;
    
    &:hover {
      box-shadow: 0 6px 18px rgba($color-error, 0.5);
    }
  }
  
  // 修饰符
  &--rounded {
    border-radius: $radius-full;
  }
  
  &--block {
    display: flex;
    width: 100%;
  }
  
  &--with-icon {
    .mu-button__content {
      margin-left: $spacing-2;
    }
  }
  
  &--loading {
    cursor: default;
    
    .mu-button__content {
      opacity: 0;
    }
  }
  
  &--disabled {
    opacity: $opacity-disabled;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  // 内部元素
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
  }
  
  &__content {
    transition: opacity $transition-fast $ease-out;
  }
  
  &__loader {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    
    &-dot {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: $radius-full;
      background-color: currentColor;
      margin: 0 0.1rem;
      opacity: 0.7;
      
      &:nth-child(1) {
        animation: loadingBounce 0.6s $ease-in-out 0s infinite;
      }
      
      &:nth-child(2) {
        animation: loadingBounce 0.6s $ease-in-out 0.1s infinite;
      }
      
      &:nth-child(3) {
        animation: loadingBounce 0.6s $ease-in-out 0.2s infinite;
      }
    }
  }
  
  // 光效效果
  &__shine {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, 
      rgba(255,255,255,0) 0%, 
      rgba(255,255,255,0.4) 50%, 
      rgba(255,255,255,0) 100%);
    transform: skewX(-25deg);
    background-position: -100px;
    background-size: 200px 100%;
    animation: buttonShine 3s infinite;
  }
}
</style> 