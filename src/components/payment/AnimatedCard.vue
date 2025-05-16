<template>
  <div 
    ref="cardRef"
    class="animated-card"
    :class="[`elevation-${elevation}`, { active, interactive }]"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @mouseenter="handleMouseEnter"
    @click="handleClick"
  >
    <div class="card-inner" :style="transformStyle">
      <div class="card-content">
        <slot></slot>
      </div>
      
      <!-- 光泽效果层 -->
      <div class="light-effect" :style="lightEffectStyle"></div>
      
      <!-- 卡片边缘高光 -->
      <div class="card-border" :class="{ active }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  elevation: {
    type: Number,
    default: 2
  },
  active: {
    type: Boolean,
    default: false
  },
  interactive: {
    type: Boolean,
    default: true
  },
  intensity: {
    type: Number,
    default: 5 // 3D效果强度，值越大，倾斜效果越明显
  },
  animationDuration: {
    type: Number,
    default: 0.3
  }
});

const emit = defineEmits(['click']);

const cardRef = ref(null);
const rotateX = ref(0);
const rotateY = ref(0);
const mouseX = ref(0);
const mouseY = ref(0);
const isHovered = ref(false);

// 计算卡片的3D变换样式
const transformStyle = computed(() => {
  if (!props.interactive || !isHovered.value) {
    return {
      transform: props.active 
        ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1.03)' 
        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)'
    };
  }
  
  return {
    transform: `perspective(1000px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(1.03)`
  };
});

// 计算光泽效果样式
const lightEffectStyle = computed(() => {
  if (!props.interactive || !isHovered.value) {
    return {
      opacity: 0
    };
  }
  
  return {
    opacity: 0.15,
    background: `radial-gradient(circle at ${mouseX.value}% ${mouseY.value}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 80%)`
  };
});

// 鼠标移动处理
const handleMouseMove = (e) => {
  if (!props.interactive) return;
  
  const rect = cardRef.value.getBoundingClientRect();
  
  // 获取鼠标在卡片上的相对位置（0-100%）
  mouseX.value = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  mouseY.value = Math.round(((e.clientY - rect.top) / rect.height) * 100);
  
  // 将相对位置转换为旋转角度，从卡片中心点计算
  const centerX = 50;
  const centerY = 50;
  const rotationIntensity = props.intensity;
  
  // 旋转方向是基于鼠标与卡片中心点的位置关系
  const newRotateY = ((mouseX.value - centerX) / centerX) * rotationIntensity;
  const newRotateX = -((mouseY.value - centerY) / centerY) * rotationIntensity;
  
  // 使用GSAP平滑过渡
  gsap.to([rotateX, rotateY], {
    duration: 0.3,
    rotateX: newRotateX,
    rotateY: newRotateY,
    ease: "power2.out"
  });
};

// 鼠标离开卡片时的效果
const handleMouseLeave = () => {
  if (!props.interactive) return;
  
  isHovered.value = false;
  
  // 重置旋转角度
  gsap.to([rotateX, rotateY], {
    duration: 0.6,
    rotateX: 0,
    rotateY: 0,
    ease: "elastic.out(1, 0.3)"
  });
};

// 鼠标进入卡片时的效果
const handleMouseEnter = () => {
  if (!props.interactive) return;
  isHovered.value = true;
};

// 点击事件
const handleClick = (e) => {
  emit('click', e);
};

// 适配移动设备，禁用陀螺仪效果
let gyroListener = null;

onMounted(() => {
  // 在移动设备上可以使用陀螺仪数据来实现倾斜效果
  if (window.DeviceOrientationEvent && props.interactive) {
    gyroListener = (event) => {
      if (!isHovered.value && props.active) {
        const tiltX = (event.beta - 40) / 10; // beta: 前后倾斜
        const tiltY = event.gamma / 5; // gamma: 左右倾斜
        
        gsap.to([rotateX, rotateY], {
          duration: 0.5,
          rotateX: Math.min(Math.max(tiltX, -5), 5),
          rotateY: Math.min(Math.max(tiltY, -5), 5),
          ease: "power1.out"
        });
      }
    };
    
    window.addEventListener('deviceorientation', gyroListener);
  }
});

onUnmounted(() => {
  if (gyroListener) {
    window.removeEventListener('deviceorientation', gyroListener);
  }
});
</script>

<style lang="scss" scoped>
.animated-card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  transition: box-shadow 0.5s ease, transform 0.3s ease;
  will-change: transform, box-shadow;
  
  &.interactive {
    cursor: pointer;
  }
  
  // 根据海拔高度设置阴影
  &.elevation-1 {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06), 0 3px 6px rgba(0, 0, 0, 0.08);
  }
  
  &.elevation-2 {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.07), 0 5px 10px rgba(0, 0, 0, 0.05);
  }
  
  &.elevation-3 {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 12px rgba(0, 0, 0, 0.08);
  }
  
  &.elevation-4 {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.active {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: inherit;
    overflow: hidden;
    transform-style: preserve-3d;
    transition: transform 0.3s ease;
  }
  
  .card-content {
    position: relative;
    z-index: 2;
    height: 100%;
    width: 100%;
  }
  
  .light-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  
  .card-border {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1.5px;
    pointer-events: none;
    z-index: 1;
    
    &:before {
      content: "";
      display: block;
      height: 100%;
      width: 100%;
      border-radius: inherit;
      transition: all 0.5s ease;
      opacity: 0;
      background: linear-gradient(
        135deg, 
        rgba(255, 255, 255, 0.2), 
        rgba(255, 200, 200, 0.2) 15%, 
        rgba(255, 200, 200, 0) 30%, 
        rgba(255, 200, 200, 0) 70%, 
        rgba(255, 200, 255, 0.2) 85%, 
        rgba(255, 255, 255, 0.2)
      );
    }
    
    &.active:before {
      opacity: 1;
    }
  }
}

// 添加适配移动端的样式
@media (max-width: 768px) {
  .animated-card {
    // 在移动端降低阴影效果
    &.elevation-1, &.elevation-2, &.elevation-3, &.elevation-4 {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    &.active {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
  }
}
</style> 