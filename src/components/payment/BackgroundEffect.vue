<template>
  <div class="background-effect" :data-theme="theme" :class="{ 'reduced-motion': reducedMotion }">
    <!-- 渐变背景 -->
    <div class="gradient-background" :style="gradientStyle"></div>
    
    <!-- 装饰性图形 -->
    <div class="decorative-shapes">
      <div 
        v-for="(shape, index) in shapes" 
        :key="index"
        class="shape"
        :class="['shape-' + shape.type, 'color-' + shape.color]"
        :style="getShapeStyle(shape, index)"
        ref="shapeRefs"
      ></div>
    </div>
    
    <!-- 光晕效果 -->
    <div class="glow-effect" :style="glowStyle"></div>
    
    <!-- 内容插槽 -->
    <div class="content-slot">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  // 主题色调 - primary, success, processing, error
  theme: {
    type: String,
    default: 'primary'
  },
  // 动画强度
  intensity: {
    type: Number,
    default: 1,
    validator: (val) => val >= 0 && val <= 1
  },
  // 是否减少动画效果（无障碍模式）
  reducedMotion: {
    type: Boolean,
    default: false
  }
});

// 形状元素的引用
const shapeRefs = ref([]);

// 随机生成的形状
const shapes = reactive([]);

// 鼠标位置
const mousePosition = reactive({
  x: 0,
  y: 0
});

// 主题颜色映射
const themeColors = {
  primary: {
    main: '#ff6b6b',
    secondary: '#ffa8a8',
    tertiary: '#ffd6d6',
    accent: '#ffef96'
  },
  success: {
    main: '#4bb71b',
    secondary: '#a5d6a7',
    tertiary: '#c8e6c9',
    accent: '#b9f6ca'
  },
  processing: {
    main: '#1890ff',
    secondary: '#91d5ff',
    tertiary: '#bae7ff',
    accent: '#e6f7ff'
  },
  error: {
    main: '#ff4d4f',
    secondary: '#ffccc7',
    tertiary: '#ffe0db',
    accent: '#ffedeb'
  }
};

// 渐变背景样式
const gradientStyle = computed(() => {
  const colors = themeColors[props.theme];
  return {
    background: `
      radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
        rgba(${hexToRgb(colors.tertiary)}, 0.3) 0%, 
        rgba(${hexToRgb(colors.secondary)}, 0.2) 45%, 
        rgba(${hexToRgb(colors.main)}, 0.1) 100%)
    `
  };
});

// 光晕效果样式
const glowStyle = computed(() => {
  const colors = themeColors[props.theme];
  return {
    background: `
      radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
        rgba(${hexToRgb(colors.accent)}, 0.4) 0%, 
        transparent 70%)
    `,
    opacity: props.intensity * 0.9
  };
});

// 辅助函数：将十六进制颜色转换为RGB
const hexToRgb = (hex) => {
  // 移除开头的#字符（如果有）
  hex = hex.replace(/^#/, '');
  
  // 解析十六进制颜色值
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return `${r}, ${g}, ${b}`;
};

// 生成形状样式
const getShapeStyle = (shape, index) => {
  return {
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    width: `${shape.size}px`,
    height: `${shape.size}px`,
    animationDelay: `${index * 0.4}s`,
    animationDuration: `${shape.duration}s`,
    transform: `rotate(${shape.rotation}deg) scale(${shape.scale})`,
    opacity: shape.opacity
  };
};

// 生成随机形状
const generateShapes = () => {
  shapes.length = 0; // 清空数组
  
  const shapeTypes = ['circle', 'triangle', 'square', 'plus'];
  const colorVariants = ['main', 'secondary', 'tertiary', 'accent'];
  
  // 增加形状数量 (10-15 -> 15-25)
  const shapesCount = props.reducedMotion ? 8 : 15 + Math.floor(Math.random() * 10);
  
  for (let i = 0; i < shapesCount; i++) {
    const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    const color = colorVariants[Math.floor(Math.random() * colorVariants.length)];
    
    shapes.push({
      type,
      color,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 15 + Math.random() * 50, // 增加形状大小
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.7,
      opacity: 0.15 + Math.random() * 0.15, // 增加不透明度
      duration: 15 + Math.random() * 15
    });
  }
};

// 动画形状
const animateShapes = () => {
  if (props.reducedMotion || !shapeRefs.value.length) return;
  
  shapeRefs.value.forEach((shape, index) => {
    if (!shape) return;
    
    // 创建浮动动画
    gsap.to(shape, {
      y: -30 + Math.random() * 60,
      x: -20 + Math.random() * 40,
      rotation: `+=${Math.random() * 40 - 20}`,
      duration: 10 + Math.random() * 20,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: index * 0.2
    });
  });
};

// 处理鼠标移动
const handleMouseMove = (e) => {
  if (props.reducedMotion) return;
  
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  
  // 计算鼠标位置百分比
  mousePosition.x = (clientX / innerWidth) * 100;
  mousePosition.y = (clientY / innerHeight) * 100;
};

// 监听主题变化重新生成形状
watch(() => props.theme, () => {
  generateShapes();
});

// 监听减少动画模式变化
watch(() => props.reducedMotion, (newVal) => {
  if (newVal) {
    // 停止所有形状动画
    gsap.killTweensOf(shapeRefs.value);
  } else {
    // 重新启动动画
    animateShapes();
  }
});

// 组件挂载
onMounted(() => {
  // 生成随机形状
  generateShapes();
  
  // 设置初始鼠标位置为页面中心
  mousePosition.x = 50;
  mousePosition.y = 50;
  
  // 添加鼠标移动监听
  window.addEventListener('mousemove', handleMouseMove);
  
  // 为避免在低端设备上的性能问题，检测设备性能
  const checkPerformance = () => {
    // 根据设备性能调整形状数量或减少动画
    if ('deviceMemory' in navigator && navigator.deviceMemory < 4) {
      // 内存小于4GB的设备减少动画效果
      return true;
    }
    
    // 尝试检测移动设备或平板
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile;
  };
  
  const shouldReduceMotion = checkPerformance();
  
  // 如果不需要减少动画，则开始动画
  if (!props.reducedMotion && !shouldReduceMotion) {
    // 启动形状动画
    setTimeout(() => {
      animateShapes();
    }, 100);
  }
  
  // 组件卸载时清理
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    gsap.killTweensOf(shapeRefs.value);
  };
});
</script>

<style lang="scss" scoped>
.background-effect {
  position: fixed;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  
  // 渐变背景
  .gradient-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background 1s ease;
    z-index: 0;
  }
  
  // 装饰性图形
  .decorative-shapes {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    
    .shape {
      position: absolute;
      border-radius: 50%;
      filter: blur(1px); // 添加轻微模糊效果
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); // 增加阴影效果
      
      &.shape-circle {
        border-radius: 50%;
      }
      
      &.shape-triangle {
        width: 0 !important;
        height: 0 !important;
        background: transparent !important;
        border-left: calc(var(--size, 30px) / 2) solid transparent;
        border-right: calc(var(--size, 30px) / 2) solid transparent;
        border-bottom: var(--size, 30px) solid;
        
        &.color-main {
          border-bottom-color: var(--main-color-light);
        }
        
        &.color-secondary {
          border-bottom-color: var(--secondary-color-light);
        }
        
        &.color-tertiary {
          border-bottom-color: var(--tertiary-color-light);
        }
        
        &.color-accent {
          border-bottom-color: var(--accent-color-light);
        }
      }
      
      &.shape-square {
        border-radius: 2px;
      }
      
      &.shape-plus {
        position: relative;
        background: transparent !important;
        
        &:before, &:after {
          content: '';
          position: absolute;
          background-color: inherit;
        }
        
        &:before {
          left: 50%;
          top: 0;
          width: 30%;
          height: 100%;
          transform: translateX(-50%);
        }
        
        &:after {
          top: 50%;
          left: 0;
          width: 100%;
          height: 30%;
          transform: translateY(-50%);
        }
      }
      
      &.color-main {
        background-color: var(--main-color);
      }
      
      &.color-secondary {
        background-color: var(--secondary-color);
      }
      
      &.color-tertiary {
        background-color: var(--tertiary-color);
      }
      
      &.color-accent {
        background-color: var(--accent-color);
      }
    }
  }
  
  // 光晕效果
  .glow-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background 1s ease, opacity 1s ease;
    pointer-events: none;
    z-index: 2;
  }
  
  // 内容插槽
  .content-slot {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
  }
  
  // 减少动画模式
  &.reduced-motion {
    .shape {
      animation: none !important;
    }
    
    .glow-effect {
      opacity: 0.3 !important;
      background: none !important;
    }
  }
}

// 定义CSS变量
:root {
  // Primary theme
  --main-color: rgba(255, 107, 107, 0.2);
  --secondary-color: rgba(255, 168, 168, 0.3);
  --tertiary-color: rgba(255, 214, 214, 0.35);
  --accent-color: rgba(255, 239, 150, 0.25);
  
  --main-color-light: rgba(255, 107, 107, 0.35);
  --secondary-color-light: rgba(255, 168, 168, 0.35);
  --tertiary-color-light: rgba(255, 214, 214, 0.35);
  --accent-color-light: rgba(255, 239, 150, 0.35);
}

// Success theme
.background-effect[data-theme="success"] {
  --main-color: rgba(75, 183, 27, 0.2);
  --secondary-color: rgba(165, 214, 167, 0.3);
  --tertiary-color: rgba(200, 230, 201, 0.35);
  --accent-color: rgba(185, 246, 202, 0.25);
  
  --main-color-light: rgba(75, 183, 27, 0.35);
  --secondary-color-light: rgba(165, 214, 167, 0.35);
  --tertiary-color-light: rgba(200, 230, 201, 0.35);
  --accent-color-light: rgba(185, 246, 202, 0.35);
}

// Processing theme
.background-effect[data-theme="processing"] {
  --main-color: rgba(24, 144, 255, 0.2);
  --secondary-color: rgba(145, 213, 255, 0.3);
  --tertiary-color: rgba(186, 231, 255, 0.35);
  --accent-color: rgba(230, 247, 255, 0.25);
  
  --main-color-light: rgba(24, 144, 255, 0.35);
  --secondary-color-light: rgba(145, 213, 255, 0.35);
  --tertiary-color-light: rgba(186, 231, 255, 0.35);
  --accent-color-light: rgba(230, 247, 255, 0.35);
}

// Error theme
.background-effect[data-theme="error"] {
  --main-color: rgba(255, 77, 79, 0.2);
  --secondary-color: rgba(255, 204, 199, 0.3);
  --tertiary-color: rgba(255, 224, 219, 0.35);
  --accent-color: rgba(255, 237, 235, 0.25);
  
  --main-color-light: rgba(255, 77, 79, 0.35);
  --secondary-color-light: rgba(255, 204, 199, 0.35);
  --tertiary-color-light: rgba(255, 224, 219, 0.35);
  --accent-color-light: rgba(255, 237, 235, 0.35);
}

// 响应式调整
@media (max-width: 768px) {
  .background-effect {
    .decorative-shapes {
      .shape {
        opacity: 0.05 !important; // 减少移动设备上形状的不透明度
      }
    }
  }
}

// 预加载动画库
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
</style> 