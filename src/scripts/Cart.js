import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCartList, addToCart as apiAddToCart, updateCartItem, removeFromCart, 
         clearCart as apiClearCart, selectCartItem, selectAllCartItems, batchRemoveCartItems,
         validateCartSelections } from '@/api/cart';
import { getProductDetail } from '@/api/product';
import { syncSession } from '@/api/user';

export default function useCart() {
  const router = useRouter();

  // 购物车数据
  const cartItems = ref([]);

  // 加载状态
  const loading = ref(false);
  const loadingMessage = ref('加载购物车数据中...');
  const error = ref('');
  const isLoggedIn = ref(true); // 添加登录状态标志
  const isSyncing = ref(false); // 会话同步状态

  // 推荐商品
  const recommendedProducts = ref([
    {
      id: 101,
      title: '婴儿洗发沐浴露二合一宝宝洗护用品新生儿沐浴露',
      image: '/products/goods10.jpg',
      price: 59.9
    },
    {
      id: 102,
      title: '儿童餐椅多功能可折叠便携式宝宝吃饭椅子',
      image: '/products/goods8.jpg',
      price: 299
    },
    {
      id: 103,
      title: '婴儿推车轻便折叠可坐可躺高景观婴儿车',
      image: '/products/goods7.jpg',
      price: 899
    },
    {
      id: 104,
      title: '宝宝辅食机多功能料理机婴儿研磨器',
      image: '/products/goods6.jpg',
      price: 259
    },
    {
      id: 105,
      title: '儿童益智早教玩具拼图积木3-6岁男女孩礼物',
      image: '/products/goods5.jpg',
      price: 69.9
    }
  ]);

  // 全选状态
  const allSelected = computed({
    get: () => {
      return cartItems.value.length > 0 && cartItems.value.every(item => item.selected === 1);
    },
    set: (value) => {
      cartItems.value.forEach(item => {
        item.selected = value ? 1 : 0;
      });
    }
  });

  // 已选商品数量
  const selectedItemsCount = computed(() => {
    return cartItems.value.filter(item => item.selected === 1).length;
  });

  // 是否有选中的商品
  const hasSelectedItems = computed(() => {
    return selectedItemsCount.value > 0;
  });

  // 判断是否为部分选中状态
  const isIndeterminate = computed(() => {
    return selectedItemsCount.value > 0 && selectedItemsCount.value < cartItems.value.length;
  });

  // 购物车是否为空
  const cartEmpty = computed(() => {
    return cartItems.value.length === 0;
  });

  // 购物车总金额
  const cartTotal = ref(0);

  // 优惠金额
  const discount = ref(0);

  // 购物车更新动画控制
  const cartUpdated = ref(false);
  const showUpdateAnimation = ref(false);

  // 同步会话并重新获取购物车数据
  const syncAndFetchCart = async (shouldRetry = true) => {
    if (isSyncing.value) return;
    
    isSyncing.value = true;
    try {
      const res = await syncSession();
      if (res && res.code === 200) {
        console.log('会话同步成功');
        ElMessage.success('会话已同步，正在获取购物车数据');
        isLoggedIn.value = true;
        
        // 延迟一小段时间再获取购物车数据，确保会话完全同步
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 获取购物车数据，根据参数决定是否允许重试
        if (shouldRetry) {
          await fetchCartData(0); // 允许重试
        } else {
          await fetchCartData(1); // 不允许重试
        }
      } else {
        ElMessage.error('会话同步失败，请尝试重新登录');
      }
    } catch (err) {
      console.error('会话同步错误:', err);
      ElMessage.error('会话同步出错，请稍后重试');
    } finally {
      isSyncing.value = false;
    }
  };

  // 从API获取购物车数据
  const fetchCartData = async (retryCount = 0) => {
    // 设置最大重试次数为1，避免多次重试导致循环
    const MAX_RETRIES = 1;
    
    // 如果已经重试超过最大次数，直接报错
    if (retryCount > MAX_RETRIES) {
      loading.value = false;
      error.value = '加载购物车数据失败，请刷新页面重试';
      return;
    }
    
    loading.value = true;
    loadingMessage.value = '加载购物车数据中...';
    error.value = '';
    
    try {
      const response = await getCartList();
      if (response.code === 200) {
        // 获取购物车商品列表
        const cartItemsData = response.data || [];
        
        if (cartItemsData.length === 0) {
          // 购物车为空，无需获取商品详情
          cartItems.value = [];
          loading.value = false;
          updateCartTotal();
          return;
        }
        
        // 提取商品ID列表
        const productIds = cartItemsData.map(item => item.productId);
        
        // 更新加载提示
        loadingMessage.value = '正在获取商品详情...';
        
        // 获取商品详细信息
        const productDetails = await fetchProductDetails(productIds);
        
        // 合并购物车项与商品详情
        cartItems.value = cartItemsData.map(item => {
          // 查找对应的商品详情
          const productDetail = productDetails[item.productId] || {};
          
          // 为没有找到详情的商品创建随机但一致的图片
          let imageUrl = '/products/goods1.jpg';
          if (productDetail.productImg) {
            imageUrl = `/products/${productDetail.productImg}`;
          } else {
            // 根据productId选择一个默认图片
            const fallbackImages = [
              '/products/goods1.jpg',
              '/products/goods2.jpg',
              '/products/goods3.jpg',
              '/products/goods4.jpg',
              '/products/goods5.jpg',
              '/products/goods6.jpg',
              '/products/goods7.jpg',
              '/products/goods8.jpg',
            ];
            const imageIndex = (item.productId || 0) % fallbackImages.length;
            imageUrl = fallbackImages[imageIndex];
          }
          
          return {
            id: item.cartId,
            cartId: item.cartId,
            productId: item.productId,
            title: productDetail.productName || item.productName || `商品 ${item.productId}`,
            image: imageUrl,
            price: item.priceSnapshot,
            quantity: item.quantity,
            subtotal: item.priceSnapshot * item.quantity,
            selected: item.selected,
            // 解析JSON规格信息，如果有的话
            specs: item.specs ? JSON.parse(item.specs) : [],
            stock: productDetail.stock || 99 // 从商品详情获取库存
          };
        });
        
        updateCartTotal();
      } else if (response.code === 400 && response.message === '未登录') {
        // 处理未登录情况
        isLoggedIn.value = false;
        
        // 避免自动显示错误消息，因为在页面上已经有专门的未登录提示
        console.log('用户未登录，显示登录提示');
        
        // 只在第一次尝试时自动进行同步，避免循环
        if (retryCount === 0) {
          console.log('自动尝试同步会话一次');
          // 尝试同步会话，但不进行重试
          await syncAndFetchCart(false);
        }
      } else {
        error.value = response.message || '获取购物车数据失败';
      }
    } catch (err) {
      console.error('获取购物车数据错误:', err);
      if (err.message === '未登录') {
        isLoggedIn.value = false;
        
        // 只在第一次尝试时自动进行同步，避免循环
        if (retryCount === 0) {
          console.log('捕获未登录错误，自动尝试同步会话一次');
          // 尝试同步会话，但不进行重试
          await syncAndFetchCart(false);
        }
      } else {
        error.value = '获取购物车数据出错，请稍后重试';
      }
    } finally {
      loading.value = false;
    }
  };

  // 批量获取商品详情
  const fetchProductDetails = async (productIds) => {
    if (!productIds || productIds.length === 0) {
      return {};
    }
    
    const productDetailsMap = {};
    
    try {
      // 使用 Promise.allSettled 并行请求多个商品详情
      // 即使某些请求失败，也能获取部分结果
      const promises = productIds.map(id => getProductDetail(id));
      const results = await Promise.allSettled(promises);
      
      // 处理结果
      results.forEach((result, index) => {
        const productId = productIds[index];
        
        if (result.status === 'fulfilled' && result.value && result.value.code === 200) {
          productDetailsMap[productId] = result.value.data;
        } else {
          console.warn(`获取商品详情失败: ID=${productId}`, result.reason || '未知错误');
        }
      });
      
      return productDetailsMap;
    } catch (error) {
      console.error('批量获取商品详情出错:', error);
      return productDetailsMap; // 返回已获取的部分
    }
  };

  // 更新购物车总金额
  const updateCartTotal = () => {
    cartTotal.value = cartItems.value
      .filter(item => item.selected === 1)
      .reduce((total, item) => {
        return total + item.subtotal;
      }, 0);
  };

  // 更新商品小计
  const updateItemSubtotal = (item) => {
    item.subtotal = item.price * item.quantity;
    updateCartTotal();
  };

  // 添加新商品到购物车
  const addToCart = async (product, quantity = 1) => {
    if (!product) return false;
    
    try {
      const result = await apiAddToCart({
        productId: product.id,
        quantity: quantity,
        selected: 1
      });
      
      if (result.code === 200) {
        // 重新获取购物车数据，包括新添加的商品
        await fetchCartData();
        ElMessage.success('商品已添加到购物车');
        return true;
      } else {
        ElMessage.error(result.message || '添加到购物车失败');
        return false;
      }
    } catch (err) {
      console.error('添加到购物车出错:', err);
      ElMessage.error('添加到购物车出错，请稍后重试');
      return false;
    }
  };

  // 更新购物车商品数量
  const updateQuantity = async (item, quantity) => {
    if (!item || !item.cartId) return;
    
    // 检查数量是否有效
    if (quantity <= 0) {
      ElMessage.warning('商品数量不能小于1');
      return;
    }
    
    if (quantity > (item.stock || 99)) {
      ElMessage.warning('超出库存限制');
      return;
    }
    
    try {
      // 更新UI，提供即时反馈
      const originalQuantity = item.quantity;
      item.quantity = quantity;
      updateItemSubtotal(item);
      
      // 发送请求到服务器
      const response = await updateCartItem(item.cartId, {
        quantity: quantity
      });
      
      if (response.code === 200) {
        showUpdateAnimationEffect();
      } else {
        // 恢复原始数量
        item.quantity = originalQuantity;
        updateItemSubtotal(item);
        ElMessage.error(response.message || '更新购物车失败');
      }
    } catch (err) {
      console.error('更新购物车出错:', err);
      ElMessage.error('更新购物车出错，请稍后重试');
    }
  };

  // 增加商品数量
  const increaseQuantity = (item) => {
    updateQuantity(item, item.quantity + 1);
  };

  // 减少商品数量
  const decreaseQuantity = (item) => {
    updateQuantity(item, item.quantity - 1);
  };

  // 直接设置商品数量
  const updateQuantityDirectly = (item, value) => {
    const quantity = parseInt(value, 10);
    if (isNaN(quantity) || quantity <= 0) {
      ElMessage.warning('请输入有效的商品数量');
      // 恢复原始数量
      return;
    }
    
    updateQuantity(item, quantity);
  };

  // 从购物车中移除商品
  const removeItemFromCart = async (item) => {
    if (!item || !item.cartId) return;
    
    try {
      // 确认删除
      await ElMessageBox.confirm('确定要从购物车中移除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 发送删除请求
      const response = await removeFromCart(item.cartId);
      
      if (response.code === 200) {
        // 从本地数组中删除
        cartItems.value = cartItems.value.filter(cartItem => cartItem.cartId !== item.cartId);
        updateCartTotal();
        ElMessage.success('商品已从购物车中移除');
      } else {
        ElMessage.error(response.message || '移除商品失败');
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('移除商品出错:', err);
        ElMessage.error('移除商品出错，请稍后重试');
      }
    }
  };

  // 切换选中状态
  const toggleCartItemSelection = async (item) => {
    console.log(`[Cart Debug] Toggling selection for item:`, JSON.parse(JSON.stringify(item)));
    if (!item || !item.cartId) {
      console.warn('[Cart Debug] Invalid item or cartId');
      return;
    }

    const originalSelectedStatus = item.selected;
    console.log(`[Cart Debug] Original selected status: ${originalSelectedStatus}`);
    // 确定目标状态，但不立即更新 item.selected
    const newSelectedStatus = originalSelectedStatus === 1 ? 0 : 1;
    console.log(`[Cart Debug] Calculated target selected status: ${newSelectedStatus}`);

    try {
      // 发送请求到服务器
      console.log(`[Cart Debug] Sending API request: cartId=${item.cartId}, selected=${newSelectedStatus}`);
      const response = await selectCartItem({
        cartId: item.cartId,
        selected: newSelectedStatus
      });
      console.log(`[Cart Debug] API Response:`, response);

      if (response.code === 200) {
        console.log(`[Cart Debug] API call successful. Updating item state.`);
        // 仅在 API 成功后更新状态
        item.selected = newSelectedStatus;
        console.log(`[Cart Debug] Updated item.selected to: ${item.selected}`);
        updateCartTotal(); // 在状态确认更新后计算总价
        showUpdateAnimationEffect();
      } else {
        console.error(`[Cart Debug] API call failed. State remains unchanged.`);
        // API 失败，状态未改变，无需恢复
        ElMessage.error(response.message || '更新选中状态失败');
      }
    } catch (err) {
      console.error('[Cart Debug] Error in toggleCartItemSelection:', err);
      ElMessage.error('更新选中状态出错，请稍后重试');
      // 出错时状态也未改变，无需恢复
    }
  };

  // 全选/全不选
  const toggleSelectAll = async (value) => {
    if (cartItems.value.length === 0) return;
    
    try {
      // 更新UI，提供即时反馈
      const newSelectedStatus = value ? 1 : 0;
      cartItems.value.forEach(item => {
        item.selected = newSelectedStatus;
      });
      updateCartTotal();
      
      // 发送请求到服务器
      const response = await selectAllCartItems(newSelectedStatus);
      
      if (response.code === 200) {
        showUpdateAnimationEffect();
      } else {
        // 刷新购物车数据
        await fetchCartData();
        ElMessage.error(response.message || '更新选中状态失败');
      }
    } catch (err) {
      console.error('更新全选状态出错:', err);
      ElMessage.error('更新全选状态出错，请稍后重试');
      // 刷新购物车数据
      await fetchCartData();
    }
  };

  // 删除选中的商品
  const removeSelectedItems = async () => {
    const selectedCartIds = cartItems.value
      .filter(item => item.selected === 1)
      .map(item => item.cartId);
    
    if (selectedCartIds.length === 0) {
      ElMessage.warning('请先选择要删除的商品');
      return;
    }
    
    try {
      // 确认删除
      await ElMessageBox.confirm(`确定要从购物车中移除这${selectedCartIds.length}件商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 发送批量删除请求
      const response = await batchRemoveCartItems(selectedCartIds);
      
      if (response.code === 200) {
        // 从本地数组中删除
        cartItems.value = cartItems.value.filter(item => item.selected !== 1);
        updateCartTotal();
        ElMessage.success('选中商品已从购物车中移除');
      } else {
        ElMessage.error(response.message || '移除选中商品失败');
        // 刷新购物车数据
        await fetchCartData();
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('批量移除商品出错:', err);
        ElMessage.error('移除选中商品出错，请稍后重试');
      }
    }
  };

  // 清空购物车
  const clearCart = async () => {
    if (cartItems.value.length === 0) {
      ElMessage.warning('购物车已经是空的');
      return;
    }
    
    try {
      // 确认清空
      await ElMessageBox.confirm('确定要清空购物车吗？此操作不可恢复', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      });
      
      // 发送清空请求
      const response = await apiClearCart();
      
      if (response.code === 200) {
        cartItems.value = [];
        updateCartTotal();
        ElMessage.success('购物车已清空');
      } else {
        ElMessage.error(response.message || '清空购物车失败');
        // 刷新购物车数据
        await fetchCartData();
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('清空购物车出错:', err);
        ElMessage.error('清空购物车出错，请稍后重试');
      }
    }
  };

  // 结算
  const proceedToCheckout = async () => {
    console.log('[Cart Debug] 尝试进入结算流程');
    console.log('[Cart Debug] hasSelectedItems 状态:', hasSelectedItems.value);
    console.log('[Cart Debug] 已选商品数量:', selectedItemsCount.value);
    
    // 检查是否有选中的商品
    if (!hasSelectedItems.value) {
      ElMessage.warning('请至少选择一件商品结算');
      return false;
    }
    
    try {
      // 检查是否已登录
      if (!isLoggedIn.value) {
        console.log('[Cart Debug] 用户未登录，尝试同步会话');
        ElMessage.warning('登录会话可能已过期，正在尝试同步...');
        
        // 尝试同步会话
        await syncAndFetchCart(false);
        
        // 再次检查登录状态
        if (!isLoggedIn.value) {
          ElMessage.error('请先登录后再结算');
          return false;
        }
      }
      
      // 在前端和后端验证选中状态是否一致
      console.log('[Cart Debug] 验证购物车选中状态');
      try {
        const validationResult = await validateCartSelections();
        if (validationResult.code !== 200) {
          console.error('[Cart Debug] 购物车选中状态验证失败:', validationResult.message);
          ElMessage.error(validationResult.message || '购物车选中状态验证失败');
          
          // 刷新购物车数据以同步前后端状态
          await fetchCartData();
          return false;
        }
        console.log('[Cart Debug] 购物车选中状态验证通过');
      } catch (validationError) {
        console.error('[Cart Debug] 验证购物车选中状态时出错:', validationError);
        
        // 如果是明确的"请先在购物车中选择商品"错误，显示更友好的提示
        if (validationError.message && validationError.message.includes('请先在购物车中选择商品')) {
          ElMessage.warning('请先在购物车中选择商品后再结算');
        } else {
          ElMessage.error('验证购物车状态失败，请刷新页面后重试');
        }
        
        // 刷新购物车数据
        await fetchCartData();
        return false;
      }
      
      console.log('[Cart Debug] 准备导航到结算页面');
      
      // 记录要结算的商品信息，供结算页面使用
      try {
        // 获取选中的商品信息
        const selectedCartItems = cartItems.value.filter(item => item.selected === 1);
        console.log('[Cart Debug] 已选中的商品数量:', selectedCartItems.length);
        
        // 确保前端和后端的选中状态一致
        if (selectedCartItems.length === 0) {
          console.error('[Cart Debug] 前端选中的商品数量为0，但验证通过，这可能是数据不同步导致的');
          ElMessage.warning('购物车状态异常，请刷新页面后重试');
          return false;
        }
        
        // 保存到localStorage，包含完整的商品信息
        localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
        console.log('[Cart Debug] 已保存结算商品信息到本地存储:', selectedCartItems);
        
        // 清除localStorage中可能存在的立即购买数据，避免干扰购物车结算
        localStorage.removeItem('buyNow');
        console.log('[Cart Debug] 已清除localStorage中的立即购买数据');
      } catch (e) {
        console.error('[Cart Debug] 保存结算商品信息失败:', e);
      }
      
      // 导航到结算页面
      return await router.push('/checkout').then(() => {
        console.log('[Cart Debug] 成功导航到结算页面');
        return true;
      }).catch(err => {
        console.error('[Cart Debug] 导航到结算页面失败:', err);
        
        if (err.name === 'NavigationDuplicated') {
          // 如果是导航重复错误，可能是用户点击了多次
          ElMessage.info('正在处理您的请求，请勿重复点击');
          return true;
        } else {
          // 其他导航错误
          ElMessage.error('无法进入结算页面，请稍后再试');
          
          // 刷新购物车数据
          fetchCartData().then(() => {
            console.log('[Cart Debug] 已刷新购物车数据');
          });
          return false;
        }
      });
    } catch (error) {
      console.error('[Cart Debug] 结算过程中出错:', error);
      ElMessage.error('结算过程出错，请刷新页面后重试');
      return false;
    }
  };

  // 跳转到商品详情页
  const goToProduct = (productId) => {
    router.push(`/product/${productId}`);
  };

  // 处理图片加载错误
  const handleImageError = (e, item) => {
    // 为没有找到详情的商品创建随机但一致的图片
    const fallbackImages = [
      '/products/goods1.jpg',
      '/products/goods2.jpg',
      '/products/goods3.jpg',
      '/products/goods4.jpg',
      '/products/goods5.jpg',
    ];
    const imageIndex = (item.productId || 0) % fallbackImages.length;
    e.target.src = fallbackImages[imageIndex];
  };

  // 显示更新动画效果
  const showUpdateAnimationEffect = () => {
    showUpdateAnimation.value = true;
    setTimeout(() => {
      showUpdateAnimation.value = false;
    }, 2000);
  };

  // 格式化价格
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // 跳转到商城首页
  const goToShop = () => {
    router.push('/');
  };

  // 跳转到商城首页并显示提示
  const goShopping = () => {
    router.push('/');
    ElMessage.info('欢迎开始购物!');
  };

  // 生命周期
  onMounted(() => {
    // 获取购物车数据
    fetchCartData();
  });

  return {
    // 状态
    cartItems,
    loading,
    loadingMessage,
    error,
    isLoggedIn,
    isSyncing,
    recommendedProducts,
    allSelected,
    selectedItemsCount,
    hasSelectedItems,
    isIndeterminate,
    cartEmpty,
    cartTotal,
    discount,
    cartUpdated,
    showUpdateAnimation,
    
    // 方法
    syncAndFetchCart,
    fetchCartData,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    updateQuantityDirectly,
    removeItemFromCart,
    toggleCartItemSelection,
    toggleSelectAll,
    removeSelectedItems,
    clearCart,
    proceedToCheckout,
    goToProduct,
    handleImageError,
    formatPrice,
    goToShop,
    goShopping
  };
} 