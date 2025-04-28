<template>
    <div 
      class="coupon-card" 
      :class="[
        status === 'available' ? 'coupon-card--available' : 
        status === 'mine' ? 'coupon-card--mine' : 
        status === 'used' ? 'coupon-card--used' : 
        status === 'expired' ? 'coupon-card--expired' : ''
      ]"
      @click="$emit('click', coupon)"
    >
      <div class="coupon-inner">
        <!-- 优惠券左侧金额 -->
        <div 
          class="coupon-amount" 
          :class="{'discount-type': coupon.type === 'PERCENTAGE'}"
        >
          <div class="coupon-value">
            <span v-if="coupon.type === 'FIXED'" class="currency">¥</span>
            <span class="amount">{{ formatCouponValue(coupon) }}</span>
            <span v-if="coupon.type === 'PERCENTAGE'" class="unit">折</span>
          </div>
          <div class="coupon-threshold" v-if="coupon.minAmount > 0">
            满{{ coupon.minAmount }}元可用
          </div>
        </div>
        
        <!-- 优惠券信息 -->
        <div class="coupon-info">
          <div class="coupon-title">{{ coupon.name }}</div>
          <div class="coupon-desc">{{ coupon.description || '全场通用优惠券' }}</div>
          <div class="coupon-limit" v-if="coupon.useScope">{{ coupon.useScope }}</div>
          <div class="coupon-time">
            {{ formatDate(coupon.startDate) }} - {{ formatDate(coupon.endDate) }}
          </div>
          
          <!-- 操作按钮区域 - 使用插槽允许自定义 -->
          <div class="coupon-action">
            <slot name="action">
              <el-button 
                v-if="status === 'available'" 
                type="primary" 
                class="receive-btn"
                @click.stop="$emit('receive', coupon)"
              >
                立即领取
              </el-button>
              
              <el-button 
                v-else-if="status === 'mine'" 
                type="primary" 
                class="use-btn"
                @click.stop="$emit('use', coupon)"
              >
                立即使用
              </el-button>
              
              <div v-else-if="status === 'used'" class="use-info">
                使用时间：{{ formatDateTime(coupon.useTime) }}
              </div>
              
              <div v-else-if="status === 'expired'" class="expire-info">
                已过期
              </div>
            </slot>
          </div>
        </div>
        
        <!-- 状态标记 - 使用插槽允许自定义 -->
        <slot name="badge">
          <coupon-badge 
            v-if="coupon.isNewUser" 
            type="new-user"
          />
          
          <coupon-badge 
            v-else-if="status === 'mine' && isExpireSoon(coupon)"
            type="expire-soon"
            :text="`剩${getDaysUntilExpire(coupon)}天过期`"
            :animated="true"
          />
          
          <div 
            v-else-if="status === 'used' || status === 'expired'" 
            class="coupon-status-mark"
          >
            {{ status === 'used' ? '已使用' : '已过期' }}
          </div>
        </slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import CouponBadge from './CouponBadge.vue';
  
  const props = defineProps({
    coupon: {
      type: Object,
      required: true
    },
    // 可选值: available(可领取), mine(我的优惠券), used(已使用), expired(已过期)
    status: {
      type: String,
      default: 'available',
      validator: (value) => ['available', 'mine', 'used', 'expired'].includes(value)
    }
  });
  
  // 定义事件
  defineEmits(['receive', 'use', 'click']);
  
  // 格式化优惠券值
  const formatCouponValue = (coupon) => {
    if (coupon.type === 'FIXED') {
      return coupon.value;
    } else if (coupon.type === 'PERCENTAGE') {
      // 将小数转为折扣数，例如0.9 -> 9，0.85 -> 8.5
      return (coupon.value * 10).toFixed(coupon.value % 0.1 === 0 ? 0 : 1);
    }
    return coupon.value;
  };
  
  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return `${formatDate(dateTimeStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 判断优惠券是否即将过期（7天内）
  const isExpireSoon = (coupon) => {
    const now = new Date();
    const expireDate = new Date(coupon.endDate);
    const daysUntilExpire = Math.floor((expireDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpire >= 0 && daysUntilExpire <= 7;
  };
  
  // 获取优惠券剩余有效天数
  const getDaysUntilExpire = (coupon) => {
    const now = new Date();
    const expireDate = new Date(coupon.endDate);
    return Math.max(0, Math.floor((expireDate - now) / (1000 * 60 * 60 * 24)));
  };
  </script>
  
  <style lang="scss" scoped>
  .coupon-card {
    position: relative;
    transition: all 0.3s ease;
    overflow: visible;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(242, 124, 141, 0.1);
    }
    
    .coupon-inner {
      position: relative;
      display: flex;
      background-color: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      height: 100%;
    }
    
    /* 优惠券金额区域样式 */
    .coupon-amount {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 120px;
      min-width: 120px;
      padding: 24px 15px;
      background: linear-gradient(135deg, var(--pink-color, #ff85a2), var(--pink-light, #ffb8c8));
      color: #fff;
      position: relative;
      
      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 10px;
        background: radial-gradient(circle at 0 6px, #fff 6px, transparent 0), 
                  radial-gradient(circle at 0 18px, #fff 6px, transparent 0);
        background-size: 10px 24px;
        background-repeat: repeat-y;
      }
      
      &.discount-type {
        background: linear-gradient(135deg, #9d6bff, #c9a7ff);
      }
    }
    
    .coupon-value {
      font-size: 28px;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 10px;
      display: flex;
      align-items: baseline;
      
      .currency {
        font-size: 18px;
        margin-right: 2px;
      }
      
      .unit {
        font-size: 16px;
        margin-left: 2px;
      }
    }
    
    .coupon-threshold {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 5px;
      text-align: center;
      line-height: 1.3;
    }
    
    /* 优惠券信息区域样式 */
    .coupon-info {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .coupon-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    
    .coupon-desc {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .coupon-limit {
      font-size: 13px;
      color: var(--pink-color, #ff85a2);
      margin-bottom: 5px;
      background-color: rgba(242, 124, 141, 0.1);
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
    }
    
    .coupon-time {
      font-size: 12px;
      color: #999;
      margin-bottom: 15px;
    }
    
    .coupon-action {
      margin-top: auto;
    }
    
    /* 优惠券状态样式 */
    &--available .receive-btn,
    &--mine .use-btn {
      background: linear-gradient(135deg, var(--pink-color, #ff85a2), var(--pink-light, #ffb8c8));
      border: none;
      border-radius: 20px;
      padding: 8px 16px;
      font-weight: 500;
      transition: all 0.3s;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 10px rgba(242, 124, 141, 0.3);
      }
    }
    
    /* 已使用和已过期优惠券样式 */
    &--used .coupon-amount,
    &--expired .coupon-amount {
      background: linear-gradient(135deg, #a0a0a0, #c8c8c8);
    }
    
    &--used .coupon-inner,
    &--expired .coupon-inner {
      opacity: 0.8;
    }
    
    .coupon-status-mark {
      position: absolute;
      top: 15px;
      right: -5px;
      background-color: #a0a0a0;
      color: #fff;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 3px 0 0 3px;
      transform: rotate(45deg);
      transform-origin: right top;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      
      &::before {
        content: "";
        position: absolute;
        top: 100%;
        right: 0;
        border: 5px solid transparent;
        border-top-color: #707070;
        border-right-color: #707070;
      }
    }
    
    .use-info,
    .expire-info {
      font-size: 13px;
      color: #999;
    }
  }
  
  @media (max-width: 768px) {
    .coupon-card {
      .coupon-amount {
        width: 100px;
        min-width: 100px;
        padding: 15px 10px;
      }
      
      .coupon-value {
        font-size: 22px;
        
        .currency {
          font-size: 14px;
        }
      }
      
      .coupon-title {
        font-size: 16px;
      }
      
      .coupon-desc {
        font-size: 13px;
      }
    }
  }
  
  @media (max-width: 576px) {
    .coupon-card {
      .coupon-amount {
        width: 80px;
        min-width: 80px;
      }
      
      .coupon-info {
        padding: 15px;
      }
    }
  }
  </style>