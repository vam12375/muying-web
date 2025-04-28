<template>
  <div 
    class="coupon-badge"
    :class="[
      `coupon-badge--${type}`, 
      { 'coupon-badge--animated': animated }
    ]"
  >
    <slot>{{ defaultText }}</slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 徽章类型：new-user(新用户专享), expire-soon(即将过期), used(已使用), expired(已过期)
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'new-user', 'expire-soon', 'used', 'expired'].includes(value)
  },
  // 自定义文本，如果不提供则使用默认文本
  text: {
    type: String,
    default: ''
  },
  // 是否启用动画
  animated: {
    type: Boolean,
    default: false
  }
});

const defaultText = computed(() => {
  const textMap = {
    'default': '',
    'new-user': '新人专享',
    'expire-soon': '即将过期',
    'used': '已使用',
    'expired': '已过期'
  };
  return props.text || textMap[props.type];
});
</script>

<style lang="scss" scoped>
.coupon-badge {
  position: absolute;
  top: 10px;
  left: -5px;
  padding: 3px 8px;
  font-size: 12px;
  color: #fff;
  border-radius: 0 3px 3px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 5;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: -5px;
    border: 5px solid transparent;
    border-right-color: inherit;
    border-top-color: inherit;
  }

  &--default {
    background-color: var(--pink-color, #ff85a2);
    
    &::before {
      border-right-color: var(--pink-dark, #e56a87);
      border-top-color: var(--pink-dark, #e56a87);
    }
  }

  &--new-user {
    background-color: #ff6b6b;
    
    &::before {
      border-right-color: #cc5757;
      border-top-color: #cc5757;
    }
  }

  &--expire-soon {
    background-color: #ff9f1a;
    
    &::before {
      border-right-color: #cc7f14;
      border-top-color: #cc7f14;
    }
  }

  &--used {
    background-color: #8e8e8e;
    
    &::before {
      border-right-color: #707070;
      border-top-color: #707070;
    }
  }

  &--expired {
    background-color: #8e8e8e;
    
    &::before {
      border-right-color: #707070;
      border-top-color: #707070;
    }
  }

  &--animated {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 