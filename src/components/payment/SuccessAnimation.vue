<template>
  <div class="success-animation-container" :class="{ completed }">
    <div class="success-card">
      <div class="success-icon-wrapper">
        <div class="success-icon">
          <svg ref="checkmarkSvg" class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle ref="checkmarkCircle" class="checkmark-circle" cx="26" cy="26" r="24" fill="none" />
            <path ref="checkmarkPath" class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>
      
      <h2 class="success-title" ref="successTitle">支付成功</h2>
      <p class="success-message" ref="successMessage">{{ message }}</p>
      
      <div class="order-info" ref="orderInfo">
        <div class="order-id-row">
          <div class="label">订单号</div>
          <div class="value">{{ orderNo }}</div>
        </div>
        <div class="amount-row">
          <div class="label">支付金额</div>
          <div class="amount-value">¥ {{ formatPrice(amount) }}</div>
        </div>
      </div>
      
      <div class="confetti-container" ref="confettiContainer"></div>
      
      <div class="action-buttons" ref="actionButtons">
        <slot name="actions">
          <button class="btn-primary" @click="handleMainAction">{{ mainActionText }}</button>
          <button class="btn-secondary" @click="handleSecondaryAction">{{ secondaryActionText }}</button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { gsap } from 'gsap';

// 使用动态导入代替静态导入，以便处理可能的导入失败
let confetti = null;
const confettiLoaded = ref(false);
const fallbackMode = ref(false);

// 尝试加载canvas-confetti库
const loadConfetti = async () => {
  try {
    // 使用动态导入 + vite 注释以避免构建警告
    // @vite-ignore
    const module = await import(/* @vite-ignore */ 'canvas-confetti');
    confetti = module.default;
    confettiLoaded.value = true;
    console.log('Canvas-confetti 库加载成功');
  } catch (error) {
    console.warn('Canvas-confetti 库加载失败，将使用后备动画:', error);
    fallbackMode.value = true;
  }
};

// 在组件初始化时尝试加载
loadConfetti();

const props = defineProps({
  message: {
    type: String,
    default: '您的订单已支付成功，感谢您的购买！'
  },
  amount: {
    type: [Number, String],
    default: 0
  },
  orderNo: {
    type: String,
    default: ''
  },
  mainActionText: {
    type: String,
    default: '查看订单'
  },
  secondaryActionText: {
    type: String,
    default: '继续购物'
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['main-action', 'secondary-action']);

// 引用元素
const checkmarkSvg = ref(null);
const checkmarkCircle = ref(null);
const checkmarkPath = ref(null);
const successTitle = ref(null);
const successMessage = ref(null);
const orderInfo = ref(null);
const actionButtons = ref(null);
const confettiContainer = ref(null);

// 格式化价格
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

// 处理主要操作
const handleMainAction = () => {
  emit('main-action');
};

// 处理次要操作
const handleSecondaryAction = () => {
  emit('secondary-action');
};

// 播放成功动画
const playSuccessAnimation = () => {
  // 重置元素状态
  gsap.set(checkmarkCircle.value, { drawSVG: '0%' });
  gsap.set(checkmarkPath.value, { drawSVG: '0%' });
  gsap.set(successTitle.value, { opacity: 0, y: 20 });
  gsap.set(successMessage.value, { opacity: 0, y: 20 });
  gsap.set(orderInfo.value, { opacity: 0, y: 20 });
  gsap.set(actionButtons.value, { opacity: 0, y: 20 });
  
  // 创建动画时间线
  const tl = gsap.timeline({
    onComplete: () => {
      // 动画完成后播放彩色纸屑特效
      if (confettiLoaded.value) {
        playConfetti();
      } else if (fallbackMode.value) {
        playFallbackConfetti();
      } else {
        // 再次尝试加载confetti库
        loadConfetti().then(() => {
          if (confettiLoaded.value) {
            playConfetti();
          } else {
            playFallbackConfetti();
          }
        });
      }
    }
  });
  
  // 按顺序添加动画
  tl.to(checkmarkCircle.value, {
    drawSVG: '100%',
    duration: 1,
    ease: 'power2.inOut'
  })
  .to(checkmarkPath.value, {
    drawSVG: '100%',
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3')
  .to(successTitle.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }, '-=0.1')
  .to(successMessage.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.5)'
  }, '-=0.3')
  .to(orderInfo.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.3)'
  }, '-=0.3')
  .to(actionButtons.value, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'back.out(1.2)'
  }, '-=0.3');
};

// 播放彩色纸屑特效 (使用canvas-confetti库)
const playConfetti = () => {
  if (!confetti || !confettiContainer.value) return;
  
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  confettiContainer.value.appendChild(canvas);
  
  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true
  });
  
  // 播放彩色纸屑
  myConfetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
  
  // 添加更多纸屑效果
  setTimeout(() => {
    myConfetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  }, 250);
  
  setTimeout(() => {
    myConfetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 400);
};

// 播放后备彩色纸屑特效 (使用CSS动画)
const playFallbackConfetti = () => {
  if (!confettiContainer.value) return;
  
  // 创建纸屑容器
  const container = confettiContainer.value;
  
  // 清空之前的内容
  container.innerHTML = '';
  
  // 创建多个纸屑元素
  for (let i = 0; i < 50; i++) {
    createConfettiParticle(container);
  }
};

// 创建单个纸屑元素
const createConfettiParticle = (container) => {
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'];
  const shapes = ['circle', 'square', 'triangle'];
  
  // 创建元素
  const particle = document.createElement('div');
  particle.className = `fallback-particle ${shapes[Math.floor(Math.random() * shapes.length)]}`;
  
  // 随机定位和样式
  const size = Math.random() * 10 + 5; // 5-15px
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100; // 0-100%
  
  // 应用样式
  Object.assign(particle.style, {
    backgroundColor: color,
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: '-20px',
    opacity: Math.random() * 0.5 + 0.5, // 0.5-1.0
    animationDuration: `${Math.random() * 3 + 2}s`, // 2-5s
    animationDelay: `${Math.random() * 0.5}s`, // 0-0.5s
  });
  
  // 添加到容器
  container.appendChild(particle);
  
  // 动画结束后移除元素
  particle.addEventListener('animationend', () => {
    particle.remove();
  });
};

// 监听completed属性变化
watch(() => props.completed, (newVal) => {
  if (newVal) {
    playSuccessAnimation();
  }
});

// 组件挂载时如果已经完成则播放动画
onMounted(() => {
  if (props.completed) {
    playSuccessAnimation();
  } else {
    // 预加载GSAP的drawSVG插件
    import('gsap/DrawSVGPlugin').then(module => {
      gsap.registerPlugin(module.default);
    });
  }
});
</script>

<style lang="scss" scoped>
.success-animation-container {
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  .success-card {
    width: 100%;
    max-width: 480px;
    background-color: white;
    border-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px 30px;
    text-align: center;
    position: relative;
    overflow: hidden;
    
    .success-icon-wrapper {
      margin-bottom: 24px;
      
      .success-icon {
        display: inline-block;
        width: 80px;
        height: 80px;
        
        .checkmark {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #4bb71b;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #4bb71b;
          
          .checkmark-circle {
            stroke-dasharray: 166;
            stroke-dashoffset: 166;
            stroke-width: 2;
            stroke-miterlimit: 10;
            stroke: #4bb71b;
            fill: none;
          }
          
          .checkmark-check {
            transform-origin: 50% 50%;
            stroke-dasharray: 48;
            stroke-dashoffset: 48;
          }
        }
      }
    }
    
    .success-title {
      font-size: 28px;
      font-weight: 700;
      color: #4bb71b;
      margin-bottom: 12px;
    }
    
    .success-message {
      font-size: 16px;
      color: #666;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    
    .order-info {
      background-color: #f9f9f9;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
      
      .order-id-row,
      .amount-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        &:not(:last-child) {
          margin-bottom: 16px;
        }
        
        .label {
          font-size: 14px;
          color: #888;
        }
        
        .value {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
        
        .amount-value {
          font-size: 22px;
          font-weight: 700;
          color: #ff6b6b;
        }
      }
    }
    
    .confetti-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      
      .confetti-canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
    
    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      
      .btn-primary,
      .btn-secondary {
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:focus {
          outline: none;
        }
      }
      
      .btn-primary {
        background-color: #4bb71b;
        color: white;
        box-shadow: 0 4px 12px rgba(75, 183, 27, 0.3);
        
        &:hover {
          background-color: darken(#4bb71b, 5%);
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(75, 183, 27, 0.4);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
      
      .btn-secondary {
        background-color: #f5f5f5;
        color: #666;
        
        &:hover {
          background-color: darken(#f5f5f5, 5%);
          transform: translateY(-2px);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .success-animation-container {
    padding: 15px;
    
    .success-card {
      padding: 30px 20px;
      
      .success-icon-wrapper {
        margin-bottom: 20px;
        
        .success-icon {
          width: 70px;
          height: 70px;
        }
      }
      
      .success-title {
        font-size: 24px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 12px;
        
        .btn-primary,
        .btn-secondary {
          width: 100%;
        }
      }
    }
  }
}

// 添加后备纸屑动画的样式
@keyframes fallbackConfettiFall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes fallbackConfettiSway {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(50px);
  }
}

.fallback-particle {
  position: absolute;
  animation: fallbackConfettiFall 3s linear forwards, fallbackConfettiSway 2s ease-in-out infinite;
  
  &.circle {
    border-radius: 50%;
  }
  
  &.square {
    border-radius: 0;
  }
  
  &.triangle {
    width: 0 !important;
    height: 0 !important;
    background-color: transparent !important;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid;
    
    &:after {
      content: '';
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 10px solid;
    }
  }
}
</style> 