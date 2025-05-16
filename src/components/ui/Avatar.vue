<template>
  <div 
    :class="[
      'mu-avatar', 
      `mu-avatar--${size}`,
      { 'mu-avatar--organic': organic },
      { 'mu-avatar--square': square },
      { 'mu-avatar--bordered': bordered },
      { 'mu-avatar--glow': glow },
      { 'mu-avatar--clickable': clickable },
    ]"
    :style="avatarStyle"
    @click="clickable && $emit('click', $event)"
  >
    <img 
      v-if="src && !error" 
      :src="src" 
      :alt="alt || 'avatar'"
      @error="handleError"
    />
    <div v-else-if="$slots.icon" class="mu-avatar__icon">
      <slot name="icon"></slot>
    </div>
    <div v-else-if="text" class="mu-avatar__text">
      {{ computedText }}
    </div>
    <slot v-else></slot>
    <div v-if="$slots.badge" class="mu-avatar__badge">
      <slot name="badge"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MuAvatar',
  props: {
    src: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
    },
    organic: {
      type: Boolean,
      default: false
    },
    square: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: false
    },
    glow: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: null
    },
    textLength: {
      type: Number,
      default: 2
    },
    color: {
      type: String,
      default: null
    },
    bgColor: {
      type: String,
      default: null
    },
    borderColor: {
      type: String,
      default: null
    },
    clickable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      error: false
    }
  },
  computed: {
    computedText() {
      if (!this.text) return '';
      
      // 如果只需要首字母或指定字符
      if (this.textLength === 1) {
        return this.text.charAt(0).toUpperCase();
      }
      
      // 中文名字处理，优先取最后两个字
      if (/[\u4e00-\u9fa5]/.test(this.text)) {
        return this.text.length <= this.textLength 
          ? this.text 
          : this.text.substring(this.text.length - this.textLength);
      }
      
      // 英文名处理，取首字母
      const names = this.text.split(' ').filter(Boolean);
      if (names.length === 1) {
        return names[0].substring(0, this.textLength).toUpperCase();
      }
      
      // 多个英文名时，取首字母组合
      return names.slice(0, this.textLength)
        .map(name => name.charAt(0).toUpperCase())
        .join('');
    },
    avatarStyle() {
      const style = {};
      
      if (this.bgColor) {
        style.backgroundColor = this.bgColor;
      }
      
      if (this.color) {
        style.color = this.color;
      }
      
      if (this.borderColor) {
        style.borderColor = this.borderColor;
      }
      
      return style;
    }
  },
  methods: {
    handleError() {
      this.error = true;
      this.$emit('error');
    }
  },
  emits: ['error', 'click']
}
</script>

<style lang="scss">
@import '../../styles/variables';
@import '../../styles/animations';

.mu-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: $color-grey-200;
  color: $color-grey-700;
  font-family: $font-family-primary;
  font-weight: $font-weight-medium;
  border-radius: 50%;
  transition: all $transition-normal $ease-out;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform $transition-normal $ease-out;
  }
  
  // 尺寸变体
  &--xs {
    width: 1.5rem;
    height: 1.5rem;
    font-size: $font-size-xs;
  }
  
  &--sm {
    width: 2rem;
    height: 2rem;
    font-size: $font-size-xs;
  }
  
  &--md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: $font-size-sm;
  }
  
  &--lg {
    width: 3.5rem;
    height: 3.5rem;
    font-size: $font-size-base;
  }
  
  &--xl {
    width: 5rem;
    height: 5rem;
    font-size: $font-size-lg;
  }
  
  &--2xl {
    width: 8rem;
    height: 8rem;
    font-size: $font-size-xl;
  }
  
  // 修饰符
  &--organic {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    animation: morphBlob 15s $ease-in-out infinite alternate;
  }
  
  &--square {
    border-radius: $radius-md;
  }
  
  &--bordered {
    border: 2px solid $color-white;
    box-shadow: $shadow-sm;
  }
  
  &--glow {
    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: inherit;
      background: $gradient-primary-to-accent;
      opacity: 0.5;
      z-index: -1;
      animation: pulseSmall 3s $ease-in-out infinite;
    }
  }
  
  &--clickable {
    cursor: pointer;
    
    &:hover img {
      transform: scale(1.1);
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  // 子元素
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 1.2em;
  }
  
  &__text {
    line-height: 1;
    letter-spacing: 0.02em;
  }
  
  &__badge {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
  }
}
</style> 