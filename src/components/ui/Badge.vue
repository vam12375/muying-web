<template>
  <div :class="['mu-badge-wrapper', wrapperClass]">
    <slot></slot>
    <span 
      v-if="!hidden && (content || $slots.default)" 
      :class="[
        'mu-badge', 
        `mu-badge--${type}`, 
        `mu-badge--${size}`,
        { 'mu-badge--dot': dot },
        { 'mu-badge--organic': organic },
        { 'mu-badge--pulse': pulse }
      ]"
      :style="badgeStyle"
    >
      <slot name="default">{{ !dot ? content : '' }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'MuBadge',
  props: {
    content: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'accent', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    hidden: {
      type: Boolean,
      default: false
    },
    dot: {
      type: Boolean,
      default: false
    },
    organic: {
      type: Boolean,
      default: false
    },
    pulse: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: null
    },
    max: {
      type: Number,
      default: 99
    },
    position: {
      type: String,
      default: 'top-right',
      validator: (value) => ['top-right', 'top-left', 'bottom-right', 'bottom-left'].includes(value)
    },
    offset: {
      type: Array,
      default: () => []
    },
    wrapperClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    displayContent() {
      if (this.dot) return '';
      const content = this.content;
      if (typeof content === 'number' && this.max !== undefined) {
        return content > this.max ? `${this.max}+` : content;
      }
      return content;
    },
    badgeStyle() {
      const style = {};
      
      if (this.color) {
        style.backgroundColor = this.color;
      }
      
      const [x, y] = this.offset || [];
      
      if (x) {
        style.transform = `translateX(${x})`;
      }
      
      if (y) {
        style.transform = style.transform 
          ? `${style.transform} translateY(${y})`
          : `translateY(${y})`;
      }
      
      switch(this.position) {
        case 'top-left':
          style.top = '0';
          style.left = '0';
          style.transform = style.transform 
            ? `${style.transform} translate(-50%, -50%)`
            : 'translate(-50%, -50%)';
          break;
        case 'bottom-right':
          style.bottom = '0';
          style.right = '0';
          style.transform = style.transform 
            ? `${style.transform} translate(50%, 50%)`
            : 'translate(50%, 50%)';
          break;
        case 'bottom-left':
          style.bottom = '0';
          style.left = '0';
          style.transform = style.transform 
            ? `${style.transform} translate(-50%, 50%)`
            : 'translate(-50%, 50%)';
          break;
        default: // top-right
          style.top = '0';
          style.right = '0';
          style.transform = style.transform 
            ? `${style.transform} translate(50%, -50%)`
            : 'translate(50%, -50%)';
      }
      
      return style;
    }
  }
}
</script>

<style lang="scss">
@import '../../styles/variables';
@import '../../styles/animations';

.mu-badge-wrapper {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
}

.mu-badge {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;
  font-family: $font-family-primary;
  white-space: nowrap;
  z-index: 1;
  
  // 类型变体
  &--primary {
    background: $gradient-primary;
    color: $color-white;
  }
  
  &--secondary {
    background: $gradient-secondary;
    color: $color-white;
  }
  
  &--accent {
    background: $gradient-accent;
    color: $color-white;
  }
  
  &--success {
    background: linear-gradient(135deg, lighten($color-success, 10%), $color-success);
    color: $color-white;
  }
  
  &--warning {
    background: linear-gradient(135deg, lighten($color-warning, 10%), $color-warning);
    color: $color-white;
  }
  
  &--error {
    background: linear-gradient(135deg, lighten($color-error, 10%), $color-error);
    color: $color-white;
  }
  
  // 尺寸变体
  &--sm {
    min-width: 1rem;
    height: 1rem;
    padding: 0 $spacing-1;
    font-size: 0.65rem;
    
    &.mu-badge--dot {
      min-width: 0.5rem;
      width: 0.5rem;
      height: 0.5rem;
      padding: 0;
    }
  }
  
  &--md {
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 $spacing-1;
    font-size: 0.75rem;
    
    &.mu-badge--dot {
      min-width: 0.625rem;
      width: 0.625rem;
      height: 0.625rem;
      padding: 0;
    }
  }
  
  &--lg {
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 $spacing-2;
    font-size: 0.8rem;
    
    &.mu-badge--dot {
      min-width: 0.75rem;
      width: 0.75rem;
      height: 0.75rem;
      padding: 0;
    }
  }
  
  // 修饰符
  &--dot {
    min-width: initial;
    padding: 0;
  }
  
  &--organic {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation: morphBlob 8s $ease-in-out infinite alternate;
  }
  
  &--pulse {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: inherit;
      z-index: -1;
      animation: ripple 2s $ease-in-out infinite;
    }
  }
}
</style> 