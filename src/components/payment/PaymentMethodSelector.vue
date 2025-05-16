<template>
  <div class="payment-selector">
    <transition-group 
      name="payment-method" 
      tag="div" 
      class="payment-methods-wrapper"
    >
      <div
        v-for="method in methods"
        :key="method.id"
        class="payment-method-item"
        :class="{ active: modelValue === method.id }"
        :style="getMethodStyle(method)"
        @click="selectMethod(method.id)"
      >
        <div class="method-content">
          <div class="radio-wrapper">
            <div class="radio-outer">
              <div class="radio-inner" v-show="modelValue === method.id"></div>
            </div>
          </div>
          
          <div class="method-icon" :style="{ borderColor: method.color }">
            <img :src="method.image" :alt="method.name">
          </div>
          
          <div class="method-info">
            <div class="method-name">{{ method.name }}</div>
            <div class="method-description">{{ method.description }}</div>
          </div>
        </div>
        
        <!-- 背景装饰 -->
        <div class="method-bg-decoration" :style="{ background: getBgGradient(method.color) }"></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  methods: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:modelValue']);

// 选择支付方式
const selectMethod = (methodId) => {
  if (methodId === props.modelValue) return;
  
  // 播放选择动画
  const targetElement = document.querySelector(`.payment-method-item.active`);
  if (targetElement) {
    // 移除当前激活项的动画
    gsap.to(targetElement, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  }
  
  // 添加新选中项的动画
  emit('update:modelValue', methodId);
  
  setTimeout(() => {
    const newActiveElement = document.querySelector(`.payment-method-item.active`);
    if (newActiveElement) {
      gsap.fromTo(newActiveElement,
        { scale: 1 },
        { 
          scale: 1.03, 
          duration: 0.2,
          ease: 'back.out(1.5)',
          yoyo: true,
          repeat: 1
        }
      );
    }
  }, 10);
};

// 生成方法项的样式
const getMethodStyle = (method) => {
  return {
    '--method-color': method.color,
    '--method-shadow-color': `${method.color}33` // 添加20%透明度
  };
};

// 生成背景渐变
const getBgGradient = (color) => {
  return `linear-gradient(45deg, ${color}05 0%, ${color}10 100%)`;
};
</script>

<style lang="scss" scoped>
.payment-selector {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  
  .payment-methods-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    position: relative;
  }
  
  .payment-method-item {
    position: relative;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
    border: 2px solid transparent;
    background-color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
    
    &:hover {
      box-shadow: 0 6px 15px rgba(0, 0, 0, 0.07);
      transform: translateY(-2px);
    }
    
    &.active {
      border-color: var(--method-color, #2196f3);
      box-shadow: 0 8px 16px var(--method-shadow-color, rgba(33, 150, 243, 0.2));
      transform: translateY(-3px) scale(1.01);
      
      .radio-inner {
        transform: scale(1);
      }
      
      .method-bg-decoration {
        opacity: 1;
      }
    }
    
    .method-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      padding: 16px 20px;
    }
    
    .radio-wrapper {
      margin-right: 16px;
      
      .radio-outer {
        width: 22px;
        height: 22px;
        border: 2px solid #ddd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        
        .payment-method-item:hover & {
          border-color: var(--method-color, #2196f3);
        }
        
        .payment-method-item.active & {
          border-color: var(--method-color, #2196f3);
        }
        
        .radio-inner {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--method-color, #2196f3);
          transform: scale(0);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      }
    }
    
    .method-icon {
      width: 44px;
      height: 44px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      
      .payment-method-item.active & {
        border-color: var(--method-color, #2196f3);
        box-shadow: 0 0 0 4px var(--method-shadow-color, rgba(33, 150, 243, 0.2));
      }
      
      img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
    }
    
    .method-info {
      flex: 1;
      
      .method-name {
        font-weight: 600;
        font-size: 16px;
        color: #333;
        margin-bottom: 4px;
        transition: color 0.3s ease;
        
        .payment-method-item.active & {
          color: var(--method-color, #2196f3);
        }
      }
      
      .method-description {
        font-size: 13px;
        color: #888;
        line-height: 1.4;
      }
    }
    
    .method-bg-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      z-index: 1;
      transition: opacity 0.3s ease;
    }
  }
}

// 过渡动画定义
.payment-method-enter-active, 
.payment-method-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0, 0.1, 1);
  position: relative;
  z-index: 1;
}

.payment-method-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.payment-method-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  position: absolute;
  width: 100%;
}

// 移动端适配
@media (max-width: 768px) {
  .payment-selector {
    .payment-method-item {
      .method-content {
        padding: 12px 16px;
      }
      
      .method-icon {
        width: 38px;
        height: 38px;
        
        img {
          width: 22px;
          height: 22px;
        }
      }
      
      .method-info {
        .method-name {
          font-size: 15px;
        }
        
        .method-description {
          font-size: 12px;
        }
      }
    }
  }
}
</style> 