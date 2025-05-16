<template>
  <section 
    class="promotion-banner"
    :style="{ backgroundImage: `url(${backgroundImage})` }"
  >
    <div class="container">
      <div 
        :class="[
          'promotion-content', 
          `promotion-content--${alignment}`,
          { 'promotion-content--glass': glass }
        ]"
      >
        <div class="promotion-content__inner">
          <h2 
            class="promotion-content__title animate-fadeInUp"
          >
            {{ title }}
          </h2>
          <p 
            class="promotion-content__subtitle animate-fadeInUp delay-200"
          >
            {{ subtitle }}
          </p>
          <div 
            v-if="badge" 
            class="promotion-content__badge animate-fadeInScale delay-300"
          >
            {{ badge }}
          </div>
          <p 
            class="promotion-content__description animate-fadeInUp delay-400"
            v-if="description"
          >
            {{ description }}
          </p>
          <div 
            class="promotion-content__action animate-fadeInUp delay-500"
            v-if="buttonText"
          >
            <MuButton 
              :type="buttonType || 'primary'"
              :rounded="buttonRounded"
              :withShine="buttonWithShine"
              @click="navigateTo(buttonLink)"
            >
              {{ buttonText }}
            </MuButton>
          </div>
          <div 
            v-if="countdown" 
            class="promotion-content__countdown animate-fadeInUp delay-600"
          >
            <div class="countdown">
              <div class="countdown__item">
                <div class="countdown__value">{{ countdownValues.days }}</div>
                <div class="countdown__label">天</div>
              </div>
              <div class="countdown__separator">:</div>
              <div class="countdown__item">
                <div class="countdown__value">{{ countdownValues.hours }}</div>
                <div class="countdown__label">时</div>
              </div>
              <div class="countdown__separator">:</div>
              <div class="countdown__item">
                <div class="countdown__value">{{ countdownValues.minutes }}</div>
                <div class="countdown__label">分</div>
              </div>
              <div class="countdown__separator">:</div>
              <div class="countdown__item">
                <div class="countdown__value">{{ countdownValues.seconds }}</div>
                <div class="countdown__label">秒</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="promotion-banner__particles">
      <div v-for="i in 5" :key="i" class="particle"></div>
    </div>

    <div 
      v-if="overlay"
      class="promotion-banner__overlay"
      :style="{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }"
    ></div>
  </section>
</template>

<script>
import MuButton from '../ui/Button.vue';

export default {
  name: 'PromotionBanner',
  components: {
    MuButton
  },
  props: {
    backgroundImage: {
      type: String,
      default: '/banners/promotion-bg.jpg'
    },
    title: {
      type: String,
      default: '奇妙母婴节'
    },
    subtitle: {
      type: String,
      default: 'BABY FAIR'
    },
    description: {
      type: String,
      default: '全场母婴用品限时5折起，更有买赠活动等你来'
    },
    badge: {
      type: String,
      default: '限时优惠'
    },
    buttonText: {
      type: String,
      default: '立即抢购'
    },
    buttonLink: {
      type: String,
      default: '/promotion/baby-fair'
    },
    buttonType: {
      type: String,
      default: 'primary'
    },
    buttonRounded: {
      type: Boolean,
      default: true
    },
    buttonWithShine: {
      type: Boolean,
      default: true
    },
    alignment: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'center', 'right'].includes(value)
    },
    overlay: {
      type: Boolean,
      default: true
    },
    overlayOpacity: {
      type: Number,
      default: 0.4
    },
    glass: {
      type: Boolean,
      default: true
    },
    countdown: {
      type: Boolean,
      default: true
    },
    countdownEndDate: {
      type: String,
      default: () => {
        // 默认设置为当前时间30天后
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        return endDate.toISOString();
      }
    }
  },
  data() {
    return {
      countdownValues: {
        days: '00',
        hours: '00',
        minutes: '00',
        seconds: '00'
      },
      countdownInterval: null
    }
  },
  mounted() {
    if (this.countdown) {
      this.startCountdown();
    }
  },
  beforeUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  },
  methods: {
    navigateTo(link) {
      if (link) {
        this.$router.push(link);
      }
    },
    startCountdown() {
      this.updateCountdown();
      this.countdownInterval = setInterval(this.updateCountdown, 1000);
    },
    updateCountdown() {
      const now = new Date().getTime();
      const endDate = new Date(this.countdownEndDate).getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        // 倒计时结束
        clearInterval(this.countdownInterval);
        this.countdownValues = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00'
        };
        return;
      }
      
      // 计算天、时、分、秒
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // 更新数据
      this.countdownValues = {
        days: days < 10 ? `0${days}` : days.toString(),
        hours: hours < 10 ? `0${hours}` : hours.toString(),
        minutes: minutes < 10 ? `0${minutes}` : minutes.toString(),
        seconds: seconds < 10 ? `0${seconds}` : seconds.toString()
      };
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.promotion-banner {
  position: relative;
  background-size: cover;
  background-position: center;
  padding: $spacing-16 0;
  color: $color-white;
  overflow: hidden;
  
  .container {
    position: relative;
    max-width: $container-max-width;
    margin: 0 auto;
    padding: 0 $container-padding;
    z-index: 2;
  }
  
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  &__particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    
    .particle {
      position: absolute;
      width: 8px;
      height: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: none;
      
      @for $i from 1 through 5 {
        &:nth-child(#{$i}) {
          left: random(100) * 1%;
          top: random(100) * 1%;
          width: (random(10) + 5) + px;
          height: (random(10) + 5) + px;
          opacity: random(5) * 0.1 + 0.2;
          animation: pulseSmall random(3) + 2s $ease-in-out infinite;
        }
      }
    }
  }
}

.promotion-content {
  max-width: 550px;
  padding: $spacing-8;
  border-radius: $radius-xl;
  opacity: 0;
  animation: fadeIn 0.8s $ease-out forwards;
  
  &--glass {
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  &--left {
    margin-right: auto;
  }
  
  &--center {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }
  
  &--right {
    margin-left: auto;
  }
  
  &__inner {
    position: relative;
  }
  
  &__title {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-2;
    line-height: 1.2;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-2xl;
    }
  }
  
  &__subtitle {
    font-size: $font-size-lg;
    font-weight: $font-weight-light;
    margin-bottom: $spacing-4;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.9);
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-md;
    }
  }
  
  &__badge {
    display: inline-block;
    padding: $spacing-1 $spacing-3;
    background: $gradient-accent;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-4;
  }
  
  &__description {
    font-size: $font-size-md;
    margin-bottom: $spacing-6;
    line-height: $line-height-loose;
    max-width: 95%;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-base;
    }
  }
  
  &__action {
    margin-bottom: $spacing-6;
    
    .mu-button {
      padding: 0 $spacing-6;
      height: 3.25rem;
      font-size: $font-size-base;
      
      @media (max-width: $breakpoint-md) {
        height: 2.75rem;
        padding: 0 $spacing-5;
      }
    }
  }
  
  &--center {
    .promotion-content__description {
      margin-left: auto;
      margin-right: auto;
    }
  }
}

.countdown {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  
  .promotion-content--center & {
    justify-content: center;
  }
  
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.15);
    border-radius: $radius-md;
    padding: $spacing-2 $spacing-3;
    min-width: 60px;
    
    @media (max-width: $breakpoint-md) {
      min-width: 50px;
      padding: $spacing-1 $spacing-2;
    }
  }
  
  &__value {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    line-height: 1.2;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-lg;
    }
  }
  
  &__label {
    font-size: $font-size-xs;
    color: rgba(255, 255, 255, 0.7);
  }
  
  &__separator {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    margin: 0 $spacing-2;
    padding-bottom: $spacing-3;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-lg;
      margin: 0 $spacing-1;
    }
  }
}
</style> 