<template>
  <div class="qrcode-animated-container">
    <!-- 骨架屏加载 -->
    <div v-if="loading" class="qrcode-skeleton">
      <div class="qrcode-skeleton-inner">
        <div class="qrcode-skeleton-pattern"></div>
        <div class="qrcode-loading-text">
          <span>正在生成支付二维码</span>
          <span class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </div>
      </div>
    </div>
    
    <!-- 二维码内容 -->
    <div v-else class="qrcode-wrapper" :class="['payment-' + paymentType, { 'success': success }]">
      <div class="qrcode-image-wrapper">
        <!-- 品牌图标 -->
        <div class="brand-icon-holder" :class="paymentType">
          <div class="brand-icon">
            <img :src="brandIcon" :alt="paymentType">
          </div>
        </div>
        
        <!-- 二维码图片 -->
        <img 
          :src="qrcodeUrl" 
          alt="支付二维码" 
          class="qrcode-image"
          @load="handleQrcodeLoaded"
        >
        
        <!-- 扫描区域指示器 -->
        <div class="scan-indicator"></div>
        
        <!-- 支付成功覆盖层 -->
        <div v-if="success" class="success-overlay">
          <div class="success-icon-wrapper">
            <div class="success-icon">
              <i class="el-icon-check"></i>
            </div>
            <div class="success-text">支付成功</div>
          </div>
        </div>
      </div>
      
      <!-- 文字引导 -->
      <div v-if="!success" class="qrcode-guide">
        <div class="qrcode-title">{{ getPaymentTitle }}</div>
        <div class="qrcode-subtitle">请打开 {{ paymentTitle }} 扫描二维码支付</div>
      </div>
      
      <!-- 倒计时 -->
      <div v-if="showCountdown && !success" class="countdown-wrapper">
        <div class="countdown-label">二维码有效期</div>
        <div class="countdown-timer">{{ formattedCountdown }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { gsap } from 'gsap';

const props = defineProps({
  qrcodeUrl: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  success: {
    type: Boolean,
    default: false
  },
  paymentType: {
    type: String,
    default: 'alipay',
    validator: (value) => ['alipay', 'wechat'].includes(value)
  },
  countdown: {
    type: Number,
    default: 0
  },
  showCountdown: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['load', 'countdown-end']);

// 二维码加载状态
const qrcodeLoaded = ref(false);

// 处理二维码加载完成
const handleQrcodeLoaded = () => {
  qrcodeLoaded.value = true;
  emit('load');
  
  // 加载完成后给随机生成的二维码添加特殊效果
  if (props.paymentType === 'wechat') {
    setTimeout(() => {
      const qrcodeImage = document.querySelector('.qrcode-image');
      if (qrcodeImage) {
        // 给随机生成的微信二维码添加微信绿色滤镜效果和阴影
        qrcodeImage.style.filter = 'drop-shadow(0 4px 8px rgba(7, 193, 96, 0.3))';
        animateQrcodeAppearance(); // 二维码特殊动画效果
      }
    }, 100);
  } else {
  animateQrcodeAppearance();
  }
};

// 根据支付类型返回品牌图标
const brandIcon = computed(() => {
  return props.paymentType === 'alipay' 
    ? '/pay/alipay.png' 
    : '/pay/wechat.png';
});

// 根据支付类型返回支付标题
const paymentTitle = computed(() => {
  return props.paymentType === 'alipay' ? '支付宝' : '微信';
});

// 获取支付引导文字
const getPaymentTitle = computed(() => {
  return props.paymentType === 'alipay' 
    ? '支付宝扫码支付' 
    : '微信扫码支付';
});

// 倒计时格式化
const formattedCountdown = computed(() => {
  if (props.countdown <= 0) return '00:00';
  
  const minutes = Math.floor(props.countdown / 60);
  const seconds = props.countdown % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 监听倒计时变化
watch(() => props.countdown, (newVal) => {
  if (newVal === 0 && props.showCountdown) {
    emit('countdown-end');
  }
  
  // 当倒计时小于30秒时，添加闪烁效果
  if (newVal <= 30 && props.showCountdown) {
    const countdownTimer = document.querySelector('.countdown-timer');
    if (countdownTimer) {
      gsap.to(countdownTimer, {
        color: '#ff4d4f',
        fontWeight: '700',
        duration: 0.3
      });
      
      if (newVal <= 10) {
        // 倒计时不足10秒时的脉动效果
        gsap.to(countdownTimer, {
          scale: 1.1,
          duration: 0.5,
          repeat: 1,
          yoyo: true
        });
      }
    }
  }
});

// 监听支付成功状态变化
watch(() => props.success, (newVal) => {
  if (newVal) {
    animateSuccessState();
  }
});

// 二维码出现动画
const animateQrcodeAppearance = () => {
  const qrcodeImage = document.querySelector('.qrcode-image');
  const scanIndicator = document.querySelector('.scan-indicator');
  const brandIcon = document.querySelector('.brand-icon-holder');
  
  if (qrcodeImage && scanIndicator && brandIcon) {
    // 重置样式
    gsap.set(qrcodeImage, { scale: 0.9, opacity: 0 });
    gsap.set(scanIndicator, { opacity: 0, height: '0%' });
    gsap.set(brandIcon, { scale: 0.5, opacity: 0 });
    
    // 创建动画时间线
    const tl = gsap.timeline();
    
    tl.to(qrcodeImage, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.7)'
    })
    .to(brandIcon, {
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: 'back.out(2)'
    }, '-=0.2')
    .to(scanIndicator, {
      opacity: 0.5,
      height: '100%',
      duration: 2,
      ease: 'power1.inOut',
      repeat: -1
    }, '-=0.1');
  }
};

// 支付成功动画
const animateSuccessState = () => {
  const successIcon = document.querySelector('.success-icon');
  const successText = document.querySelector('.success-text');
  
  if (successIcon && successText) {
    // 重置样式
    gsap.set(successIcon, { scale: 0, opacity: 0 });
    gsap.set(successText, { y: 20, opacity: 0 });
    
    // 创建动画时间线
    const tl = gsap.timeline();
    
    tl.to(successIcon, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(2)'
    })
    .to(successText, {
      y: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.2');
  }
};

// 组件挂载时初始化动画
onMounted(() => {
  if (!props.loading && qrcodeLoaded.value) {
    animateQrcodeAppearance();
  }
  
  if (props.success) {
    animateSuccessState();
  }
});
</script>

<style lang="scss" scoped>
.qrcode-animated-container {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  
  // 骨架屏
  .qrcode-skeleton {
    width: 100%;
    aspect-ratio: 1;
    background-color: #f5f5f5;
    border-radius: 16px;
    overflow: hidden;
    padding: 24px;
    
    .qrcode-skeleton-inner {
      width: 100%;
      height: 100%;
      background-color: white;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      
      .qrcode-skeleton-pattern {
        width: 70%;
        height: 70%;
        background: 
          linear-gradient(90deg, #f5f5f5 25%, #eee 37%, #f5f5f5 63%);
        background-size: 400% 100%;
        animation: qrcodeSkeleton 1.4s ease infinite;
        border-radius: 8px;
      }
      
      .qrcode-loading-text {
        margin-top: 16px;
        font-size: 14px;
        color: #999;
        display: flex;
        
        .dots {
          display: inline-flex;
          margin-left: 4px;
          
          .dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #999;
            margin: 0 2px;
            position: relative;
            top: 9px;
            animation: dotPulse 1.4s infinite ease-in-out;
            
            &:nth-child(1) {
              animation-delay: 0s;
            }
            
            &:nth-child(2) {
              animation-delay: 0.2s;
            }
            
            &:nth-child(3) {
              animation-delay: 0.4s;
            }
          }
        }
      }
    }
  }
  
  // 二维码包装器
  .qrcode-wrapper {
    width: 100%;
    text-align: center;
    
    &.success {
      .qrcode-image {
        filter: blur(2px) brightness(0.9);
      }
      
      .scan-indicator {
        opacity: 0 !important;
      }
    }
    
    .qrcode-image-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      margin: 0 auto;
      border-radius: 16px;
      background-color: white;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      padding: 20px;
      overflow: hidden;
      
      // 品牌图标
      .brand-icon-holder {
        position: absolute;
        z-index: 20;
        width: 56px;
        height: 56px;
        border-radius: 12px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        
        &.alipay {
          background-color: #1677FF;
        }
        
        &.wechat {
          background-color: #07C160;
        }
        
        .brand-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            filter: brightness(0) invert(1);
          }
        }
      }
      
      // 二维码图片
      .qrcode-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 8px;
        transition: filter 0.5s ease, transform 0.5s ease;
        
        &:hover {
          transform: scale(1.02);
        }
        
        // 微信支付二维码特殊样式
        .payment-wechat & {
          box-shadow: 0 4px 12px rgba(7, 193, 96, 0.2);
          background: linear-gradient(135deg, rgba(7, 193, 96, 0.05), rgba(255, 255, 255, 0));
        }
      }
      
      // 扫描区域指示器
      .scan-indicator {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 0%; // 高度由动画控制
        background: linear-gradient(
          to bottom, 
          rgba(255, 255, 255, 0),
          rgba(0, 170, 255, 0.2),
          rgba(255, 255, 255, 0)
        );
        z-index: 10;
        pointer-events: none;
      }
      
      // 支付成功覆盖层
      .success-overlay {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 30;
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(2px);
        border-radius: 16px;
        
        .success-icon-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .success-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background-color: #52c41a;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(82, 196, 26, 0.4);
            margin-bottom: 12px;
            
            i {
              font-size: 36px;
              color: white;
            }
          }
          
          .success-text {
            font-size: 18px;
            font-weight: 600;
            color: #52c41a;
          }
        }
      }
    }
    
    // 文字引导
    .qrcode-guide {
      margin-top: 16px;
      
      .qrcode-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
      }
      
      .qrcode-subtitle {
        font-size: 14px;
        color: #666;
      }
    }
    
    // 倒计时
    .countdown-wrapper {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .countdown-label {
        font-size: 13px;
        color: #999;
        margin-bottom: 4px;
      }
      
      .countdown-timer {
        font-size: 24px;
        font-family: 'Courier New', monospace;
        font-weight: 600;
        color: #333;
        letter-spacing: 2px;
        transform-origin: center center;
      }
    }
  }
}

// 骨架屏动画
@keyframes qrcodeSkeleton {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

// 点动画
@keyframes dotPulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .qrcode-animated-container {
    max-width: 280px;
    
    .qrcode-skeleton {
      .qrcode-skeleton-inner {
        .qrcode-loading-text {
          font-size: 13px;
        }
      }
    }
    
    .qrcode-wrapper {
      .qrcode-image-wrapper {
        padding: 16px;
        
        .brand-icon-holder {
          width: 48px;
          height: 48px;
          
          .brand-icon {
            width: 30px;
            height: 30px;
          }
        }
      }
      
      .qrcode-guide {
        .qrcode-title {
          font-size: 16px;
        }
        
        .qrcode-subtitle {
          font-size: 13px;
        }
      }
      
      .countdown-wrapper {
        .countdown-timer {
          font-size: 20px;
        }
      }
    }
  }
}
</style> 