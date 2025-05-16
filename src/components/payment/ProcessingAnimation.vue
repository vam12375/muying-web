<template>
  <div class="processing-animation-container">
    <div class="processing-content">
      <div class="animation-container">
        <div class="payment-processing-animation">
          <div ref="circleRef" class="circle-wrapper">
            <svg 
              class="circle-svg" 
              viewBox="0 0 100 100" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                ref="backgroundCircle"
                class="background-circle" 
                cx="50" 
                cy="50" 
                r="40"
              />
              <circle 
                ref="progressCircle"
                class="progress-circle" 
                cx="50" 
                cy="50" 
                r="40"
              />
            </svg>
            
            <div class="payment-icons">
              <transition name="method-swap">
                <div 
                  v-if="currentIconIndex === 0" 
                  key="card" 
                  class="payment-icon-container"
                >
                  <img src="/pay/card.png" alt="支付卡" class="payment-icon card-icon" />
                </div>
                <div 
                  v-else-if="currentIconIndex === 1" 
                  key="processing" 
                  class="payment-icon-container"
                >
                  <img src="/pay/processing.png" alt="处理中" class="payment-icon processing-icon" />
                </div>
                <div 
                  v-else
                  key="success" 
                  class="payment-icon-container"
                >
                  <img src="/pay/success-check.png" alt="成功" class="payment-icon success-icon" />
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
      
      <div class="processing-status">
        <h3 class="processing-title">{{ getStatusTitle }}</h3>
        <p class="processing-description">{{ getStatusDescription }}</p>
      </div>
      
      <div class="processing-time">
        <div v-if="showProgress" class="progress-bar-container">
          <div class="progress-label">
            <span>处理进度</span>
            <span>{{ progressPercent }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="progressStyle"></div>
          </div>
        </div>
        
        <div v-if="showEstimatedTime" class="estimated-time">
          预计完成时间：<span class="time-value">{{ estimatedTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  status: {
    type: String,
    default: 'processing', // 'processing', 'verifying', 'success', 'failed'
    validator: (value) => ['processing', 'verifying', 'success', 'failed'].includes(value)
  },
  progress: {
    type: Number,
    default: 0 // 0-100
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  estimatedTime: {
    type: String,
    default: '约1分钟'
  },
  showEstimatedTime: {
    type: Boolean,
    default: true
  }
});

const backgroundCircle = ref(null);
const progressCircle = ref(null);
const circleRef = ref(null);

// 当前展示的图标索引
const currentIconIndex = ref(0);

// 图标循环切换的计时器
let iconIntervalId = null;

// 状态标题
const getStatusTitle = computed(() => {
  switch(props.status) {
    case 'processing':
      return '正在处理您的支付';
    case 'verifying':
      return '正在验证支付结果';
    case 'success':
      return '支付成功';
    case 'failed':
      return '支付失败';
    default:
      return '处理中';
  }
});

// 状态描述
const getStatusDescription = computed(() => {
  switch(props.status) {
    case 'processing':
      return '请耐心等待，系统正在处理您的支付请求...';
    case 'verifying':
      return '支付已提交，正在确认交易结果...';
    case 'success':
      return '您的订单已支付成功，系统正在处理后续流程...';
    case 'failed':
      return '支付处理失败，请重新尝试或选择其他支付方式';
    default:
      return '请稍候...';
  }
});

// 进度条样式
const progressStyle = computed(() => {
  return {
    width: `${props.progress}%`,
    background: getProgressColor(props.progress)
  };
});

// 进度百分比
const progressPercent = computed(() => {
  return Math.min(100, Math.max(0, Math.round(props.progress)));
});

// 获取进度颜色（根据进度渐变）
const getProgressColor = (progress) => {
  if (progress < 30) {
    return 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)';
  } else if (progress < 60) {
    return 'linear-gradient(90deg, #fad0c4 0%, #ffd1ff 100%)';
  } else if (progress < 90) {
    return 'linear-gradient(90deg, #ffd1ff 0%, #a6c1ee 100%)';
  } else {
    return 'linear-gradient(90deg, #a6c1ee 0%, #67e8f9 100%)';
  }
};

// 开始图标循环动画
const startIconAnimation = () => {
  // 清除可能存在的计时器
  clearInterval(iconIntervalId);
  
  // 只有在处理中或验证状态才循环切换图标
  if (props.status === 'processing' || props.status === 'verifying') {
    currentIconIndex.value = 0;
    
    // 设置图标循环切换
    iconIntervalId = setInterval(() => {
      // 只循环前两个图标（支付卡和处理中）
      currentIconIndex.value = currentIconIndex.value === 0 ? 1 : 0;
    }, 2000);
  } else if (props.status === 'success') {
    currentIconIndex.value = 2; // 成功图标
  }
};

// 启动圆圈进度动画
const startCircleAnimation = () => {
  if (!backgroundCircle.value || !progressCircle.value) return;
  
  // 获取圆的周长
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  // 设置圆的初始状态
  gsap.set(backgroundCircle.value, {
    strokeDasharray: circumference,
    strokeDashoffset: 0
  });
  
  gsap.set(progressCircle.value, {
    strokeDasharray: circumference,
    strokeDashoffset: circumference
  });
  
  // 创建循环动画
  gsap.to(progressCircle.value, {
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut',
    repeat: -1,
    yoyo: true
  });
  
  // 添加旋转动画
  gsap.to(circleRef.value, {
    rotation: 360,
    duration: 10,
    ease: 'none',
    repeat: -1
  });
};

// 监听状态变化
watch(() => props.status, (newStatus) => {
  startIconAnimation();
});

// 组件挂载后初始化动画
onMounted(() => {
  startCircleAnimation();
  startIconAnimation();
});

// 组件卸载前清除定时器
onUnmounted(() => {
  clearInterval(iconIntervalId);
});
</script>

<style lang="scss" scoped>
.processing-animation-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  
  .processing-content {
    background-color: white;
    border-radius: 24px;
    padding: 40px 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    text-align: center;
    
    .animation-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
      
      .payment-processing-animation {
        width: 160px;
        height: 160px;
        position: relative;
        
        .circle-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          
          .circle-svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
            
            .background-circle {
              fill: none;
              stroke: rgba(0, 0, 0, 0.05);
              stroke-width: 4;
              stroke-linecap: round;
            }
            
            .progress-circle {
              fill: none;
              stroke: rgba(125, 211, 252, 0.8);
              stroke-width: 4;
              stroke-linecap: round;
            }
          }
          
          .payment-icons {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
            
            .payment-icon-container {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              
              .payment-icon {
                width: 100%;
                height: 100%;
                object-fit: contain;
                
                &.card-icon {
                  animation: cardPulse 2s infinite ease-in-out;
                }
                
                &.processing-icon {
                  animation: processingPulse 2s infinite ease-in-out;
                }
                
                &.success-icon {
                  animation: successBounce 1s ease-in-out;
                }
              }
            }
          }
        }
      }
    }
    
    .processing-status {
      margin-bottom: 30px;
      
      .processing-title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }
      
      .processing-description {
        font-size: 16px;
        color: #666;
        line-height: 1.5;
        max-width: 400px;
        margin: 0 auto;
      }
    }
    
    .processing-time {
      .progress-bar-container {
        margin-bottom: 20px;
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          overflow: hidden;
          
          .progress-bar-fill {
            height: 100%;
            width: 0%;
            border-radius: 4px;
            transition: width 0.5s ease, background 0.5s ease;
          }
        }
      }
      
      .estimated-time {
        font-size: 14px;
        color: #888;
        
        .time-value {
          font-weight: 600;
          color: #333;
        }
      }
    }
  }
}

// 支付卡脉动动画
@keyframes cardPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

// 处理中脉动动画
@keyframes processingPulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 成功弹跳动画
@keyframes successBounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

// 图标切换过渡动画
.method-swap-enter-active,
.method-swap-leave-active {
  transition: all 0.5s ease;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.method-swap-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.method-swap-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.8);
}

// 响应式调整
@media (max-width: 768px) {
  .processing-animation-container {
    padding: 15px;
    
    .processing-content {
      padding: 30px 20px;
      
      .animation-container {
        .payment-processing-animation {
          width: 140px;
          height: 140px;
        }
      }
      
      .processing-status {
        .processing-title {
          font-size: 20px;
        }
        
        .processing-description {
          font-size: 14px;
        }
      }
    }
  }
}
</style> 