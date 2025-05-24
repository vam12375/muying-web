import { ref } from 'vue';
import gsap from 'gsap';

/**
 * 购物车动画工具函数
 * 提供各种购物车相关的动画效果
 */
export default function useCartAnimation() {
  // 动画状态
  const cartUpdated = ref(false);
  const showUpdateAnimation = ref(false);
  const isPriceAnimating = ref(false);
  const isQuantityUpdating = ref(false);
  const isItemRemoving = ref(false);
  const showConfetti = ref(false);

  /**
   * 添加到购物车的飞入动画
   * @param {Element} startEl - 动画起始元素
   * @param {Element} endEl - 动画结束元素 (购物车图标)
   * @param {Object} options - 动画配置项
   */
  const flyToCartAnimation = (startEl, endEl, options = {}) => {
    if (!startEl || !endEl) return;
    
    // 创建一个克隆元素用于动画
    const imgEl = startEl.cloneNode(true);
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    
    // 设置克隆元素的样式
    Object.assign(imgEl.style, {
      position: 'fixed',
      top: `${startRect.top}px`,
      left: `${startRect.left}px`,
      width: `${startRect.width}px`,
      height: `${startRect.height}px`,
      zIndex: 9999,
      opacity: 0.8,
      pointerEvents: 'none',
      transition: 'none',
      borderRadius: '8px',
    });
    
    // 将克隆元素添加到页面
    document.body.appendChild(imgEl);
    
    // 使用GSAP创建动画
    gsap.to(imgEl, {
      duration: options.duration || 0.8,
      x: endRect.left - startRect.left + endRect.width / 2 - startRect.width / 2,
      y: endRect.top - startRect.top + endRect.height / 2 - startRect.height / 2,
      scale: 0.1,
      ease: options.ease || 'power2.inOut',
      opacity: 0.2,
      onComplete: () => {
        imgEl.remove();
        // 触发购物车更新动画
        updateCartBadge();
        // 执行回调函数
        if (options.onComplete) options.onComplete();
      }
    });
  };

  /**
   * 更新购物车图标上的数字徽标的动画
   */
  const updateCartBadge = () => {
    cartUpdated.value = true;
    setTimeout(() => {
      cartUpdated.value = false;
    }, 1500);
  };

  /**
   * 购物车项更新成功时的动画
   */
  const showItemUpdateAnimation = () => {
    showUpdateAnimation.value = true;
    setTimeout(() => {
      showUpdateAnimation.value = false;
    }, 2000);
  };

  /**
   * 价格变化时的动画
   * @param {Element} el - 价格元素
   * @param {Number} oldPrice - 旧价格
   * @param {Number} newPrice - 新价格
   */
  const animatePriceChange = (el, oldPrice, newPrice) => {
    if (!el || isPriceAnimating.value) return;
    
    isPriceAnimating.value = true;
    
    // 标记元素为正在动画中
    el.dataset.animating = 'true';
    
    // 价格增加时使用绿色，减少时使用红色
    const colorClass = newPrice > oldPrice ? 'price-increase' : 'price-decrease';
    el.classList.add(colorClass);
    
    // 使用GSAP创建数字过渡动画
    gsap.fromTo(
      { value: oldPrice },
      { 
        value: newPrice,
        duration: 1,
        ease: 'power2.out',
        onUpdate: function() {
          // 格式化价格并更新显示
          if (el && el.dataset.animating === 'true') {
            const formattedPrice = this.targets()[0].value.toFixed(2);
            el.textContent = formattedPrice;
          }
        },
        onComplete: function() {
          // 动画结束，移除颜色类
          if (el) {
            el.classList.remove(colorClass);
            delete el.dataset.animating;
          }
          isPriceAnimating.value = false;
        }
      }
    );
  };

  /**
   * 数量变更时的动画
   * @param {Element} el - 数量元素
   * @param {Number} oldValue - 旧数量
   * @param {Number} newValue - 新数量
   */
  const animateQuantityChange = (el, oldValue, newValue) => {
    if (!el || isQuantityUpdating.value) return;
    
    isQuantityUpdating.value = true;
    
    // 标记元素为正在动画中
    el.dataset.animating = 'true';
    
    // 数量增加或减少的类名
    const changeClass = newValue > oldValue ? 'quantity-increase' : 'quantity-decrease';
    el.classList.add(changeClass);
    
    gsap.fromTo(
      { value: oldValue },
      {
        value: newValue,
        duration: 0.4,
        ease: 'power2.out',
        onUpdate: function() {
          if (el && el.dataset.animating === 'true') {
            el.textContent = Math.round(this.targets()[0].value);
          }
        },
        onComplete: function() {
          if (el) {
            el.classList.remove(changeClass);
            delete el.dataset.animating;
          }
          isQuantityUpdating.value = false;
        }
      }
    );
  };

  /**
   * 删除购物车项时的动画
   * @param {Element} el - 要删除的元素
   * @param {Function} onComplete - 动画完成后的回调
   */
  const animateRemoveItem = (el, onComplete) => {
    if (!el || isItemRemoving.value) return;
    
    isItemRemoving.value = true;
    
    gsap.to(el, {
      height: 0,
      opacity: 0,
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      marginBottom: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        if (onComplete) onComplete();
        isItemRemoving.value = false;
      }
    });
  };

  /**
   * 成功结算时的庆祝动画
   */
  const playCheckoutConfetti = () => {
    showConfetti.value = true;
    
    // 如果有可用的confetti库，可以在这里调用
    // 例如: confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    
    setTimeout(() => {
      showConfetti.value = false;
    }, 3000);
  };

  return {
    // 状态
    cartUpdated,
    showUpdateAnimation,
    isPriceAnimating,
    isQuantityUpdating,
    isItemRemoving,
    showConfetti,
    
    // 方法
    flyToCartAnimation,
    updateCartBadge,
    showItemUpdateAnimation,
    animatePriceChange,
    animateQuantityChange,
    animateRemoveItem,
    playCheckoutConfetti
  };
} 