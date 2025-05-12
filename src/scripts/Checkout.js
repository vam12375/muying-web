import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { usePointsStore } from '@/stores/points';
import { getUserAddresses } from '@/api/user';
import { getAvailableCouponsForOrder, validateCoupon } from '@/api/coupon';
import { getUserPoints } from '@/api/points';
import { regionData } from '@/utils/regionData';
import { getUserInfo as getAuthUserInfo, ensureUserId } from '@/utils/auth';

export default function useCheckout() {
  const router = useRouter();
  const route = useRoute();
  const cartStore = useCartStore();
  const orderStore = useOrderStore();
  const userStore = useUserStore();
  const pointsStore = usePointsStore();

  // 购买来源（'cart' 或 'buy_now'）
  const orderSource = ref('cart');

  // 加载状态
  const isLoading = ref(true);
  const isAddressLoading = ref(true);
  const isSubmitting = ref(false);
  const isSavingAddress = ref(false);
  const error = ref(null);

  // 收货地址相关
  const addresses = ref([]);
  const selectedAddress = ref(null);
  const addressFormVisible = ref(false);
  const editingAddress = ref(null);

  const addressForm = ref({
    id: null,
    name: '',
    phone: '',
    region: [],
    province: '',
    city: '',
    district: '',
    detailAddress: '',
    isDefault: false
  });

  const addressRules = {
    name: [
      { required: true, message: '请输入收货人姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    region: [
      { required: true, message: '请选择所在地区', trigger: 'change' }
    ],
    detailAddress: [
      { required: true, message: '请输入详细地址', trigger: 'blur' },
      { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
    ]
  };

  // 订单商品
  const selectedItems = computed(() => {
    console.log('[Checkout Debug] 计算selectedItems, cartStore.selectedItems:', cartStore.selectedItems);
    
    // 首先尝试从localStorage读取选中商品
    try {
      const storedItems = localStorage.getItem('checkoutItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        console.log('[Checkout Debug] 从localStorage读取到商品数量:', items.length);
        
        // 确保数据有效
        if (items && items.length > 0) {
          // 确保所有必要字段都存在
          const formattedItems = items.map(item => ({
            id: item.id || item.cartId,
            cartId: item.cartId || item.id,
            productId: item.productId,
            productName: item.productName || item.title || '未命名商品',
            productImage: item.productImage || item.image || '',
            price: item.price || item.priceSnapshot || 0,
            quantity: item.quantity || 1,
            specs: Array.isArray(item.specs) ? item.specs.join(', ') : (item.specs || item.specification || '默认规格'),
            selected: 1
          }));
          
          console.log('[Checkout Debug] 使用localStorage中的商品数据, 商品数量:', formattedItems.length);
          return formattedItems;
        }
      } else {
        console.log('[Checkout Debug] localStorage中没有checkoutItems数据');
      }
    } catch (e) {
      console.error('[Checkout Debug] 解析localStorage商品数据失败:', e);
    }
    
    // 如果localStorage没有数据，再尝试从cartStore获取选中商品
    if (cartStore.selectedItems && cartStore.selectedItems.length > 0) {
      console.log('[Checkout Debug] 尝试从cartStore获取选中商品');
      
      // 显式过滤已选中状态的商品项
      const filteredItems = cartStore.cartItems.filter(item => item.selected === 1);
      console.log('[Checkout Debug] 从cartStore过滤后的已选中商品数量:', filteredItems.length);
      
      if (filteredItems.length > 0) {
        // 确保所有必要字段都存在
        const formattedItems = filteredItems.map(item => ({
          id: item.id || item.cartId,
          cartId: item.cartId || item.id,
          productId: item.productId,
          productName: item.productName || item.title || '未命名商品',
          productImage: item.productImage || item.image || '',
          price: item.price || item.priceSnapshot || 0,
          quantity: item.quantity || 1,
          specs: Array.isArray(item.specs) ? item.specs.join(', ') : (item.specs || item.specification || '默认规格'),
          selected: 1
        }));
        
        console.log('[Checkout Debug] 使用过滤后的cartStore商品数据，商品数量:', formattedItems.length);
        return formattedItems;
      }
      
      console.log('[Checkout Debug] cartStore中没有已选中状态的商品，检查selectedCartItems');
      
      // 当前代码中的cartStore.selectedCartItems可能包含未选中的商品，因此最终手段才使用它
      const items = cartStore.selectedCartItems;
      console.log('[Checkout Debug] cartStore.selectedCartItems长度:', items?.length || 0);
      
      if (items && items.length > 0) {
        // 确保所有必要字段都存在
        const formattedItems = items.map(item => ({
          id: item.id || item.cartId,
          cartId: item.cartId || item.id,
          productId: item.productId,
          productName: item.productName || item.title || '未命名商品',
          productImage: item.productImage || item.image || '',
          price: item.price || item.priceSnapshot || 0,
          quantity: item.quantity || 1,
          specs: Array.isArray(item.specs) ? item.specs.join(', ') : (item.specs || item.specification || '默认规格'),
          selected: 1
        }));
        
        console.log('[Checkout Debug] 使用cartStore.selectedCartItems数据，商品数量:', formattedItems.length);
        return formattedItems;
      }
    }
    
    console.log('[Checkout Debug] 无法获取选中商品，返回空数组');
    // 如果都没有数据，返回空数组
    return [];
  });

  // 配送方式
  const shippingOptions = ref([
    { 
      id: 1, 
      name: '普通快递', 
      fee: 0,
      actualFee: 0, // 将在initCheckout中根据订单金额更新
      icon: 'Van',
      description: '订单满99元包邮 (3-5天送达)'
    },
    { 
      id: 2, 
      name: '加急快递', 
      fee: 10,
      actualFee: 10,
      icon: 'Van',
      description: '次日送达 (仅支持部分城市)'
    },
    { 
      id: 3, 
      name: '到店自提', 
      fee: 0,
      actualFee: 0,
      icon: 'ShoppingBag',
      description: '节省运费，门店取货更方便'
    }
  ]);
  const selectedShipping = ref(null);

  // 支付方式
  const paymentMethods = ref([
    { 
      id: 'alipay', 
      name: '支付宝', 
      icon: 'Money',
      description: '推荐使用支付宝支付'
    },
    { 
      id: 'wechat', 
      name: '微信支付', 
      icon: 'Money',
      description: '使用微信扫码支付'
    },
    { 
      id: 'wallet', 
      name: '银行卡支付', 
      icon: 'CreditCard',
      description: '支持多家银行卡支付'
    }
  ]);
  const selectedPayment = ref(null);

  // 优惠券
  const coupons = ref([]);
  const selectedCoupon = ref(null);
  const couponCode = ref('');
  const isCouponLoading = ref(false);
  
  // 增强优惠券功能
  const showAllCoupons = ref(false);
  const couponTab = ref('available');
  const allCoupons = ref([]);
  const isLoadingAllCoupons = ref(false);

  // 订单备注
  const orderRemark = ref('');

  // 订单结果
  const orderResultVisible = ref(false);
  const orderSuccess = ref(false);
  const orderNumber = ref('');
  const orderError = ref('');

  // 计算总价
  const subtotal = computed(() => {
    if (!selectedItems.value || selectedItems.value.length === 0) return 0;
    return selectedItems.value.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  });

  // 计算运费
  const shippingFee = computed(() => {
    if (!selectedShipping.value) return 0;
    
    // 如果已经计算了actualFee，则直接使用
    if (selectedShipping.value.actualFee !== undefined) {
      return selectedShipping.value.actualFee;
    }
    
    // 普通快递，订单满99元免运费，否则10元运费
    if (selectedShipping.value.id === 1) {
      return subtotal.value >= 99 ? 0 : 10;
    }
    
    // 其他配送方式，使用固定运费
    return selectedShipping.value.fee || 0;
  });

  // 积分抵扣相关状态
  const userPoints = ref(0);
  const usePointsForDiscount = ref(false);
  const pointsToUse = ref(0);
  const pointsInputValue = ref(0);
  const isLoadingPoints = ref(true);
  const maxPointsDiscount = ref(50); // 最大积分抵扣金额（元）
  const maxPointsUsage = ref(5000); // 最大可使用积分数量

  // 计算积分抵扣金额
  const pointsDiscountAmount = computed(() => {
    if (!usePointsForDiscount.value || pointsToUse.value <= 0) {
      console.log('[Checkout] 积分抵扣未启用或积分为0:', { usePointsForDiscount: usePointsForDiscount.value, pointsToUse: pointsToUse.value });
      return 0;
    }
    // 每100积分抵扣1元
    const discount = Math.floor(pointsToUse.value / 100);
    // 不超过最大抵扣金额和订单总金额
    const maxDiscount = Math.min(maxPointsDiscount.value, subtotal.value);
    const finalDiscount = Math.min(discount, maxDiscount);
    console.log('[Checkout] 计算积分抵扣金额:', { discount, maxDiscount, finalDiscount, pointsToUse: pointsToUse.value });
    return finalDiscount;
  });

  // 修改total的计算属性，加入积分抵扣逻辑
  const total = computed(() => {
    let totalAmount = subtotal.value;
    
    // 加上运费
    if (selectedShipping.value && selectedShipping.value.actualFee !== undefined) {
      totalAmount += selectedShipping.value.actualFee;
    } else if (shippingFee.value) {
      totalAmount += shippingFee.value;
    }
    
    // 减去优惠券金额
    if (selectedCoupon.value) {
      // 确保优惠券金额是数字
      const couponAmount = parseFloat(selectedCoupon.value.value || selectedCoupon.value.amount || 0);
      totalAmount -= couponAmount;
      // 确保总价不小于0
      if (totalAmount < 0) totalAmount = 0;
    }
    
    // 减去积分抵扣金额
    if (usePointsForDiscount.value && pointsToUse.value > 0) {
      console.log('[Checkout] 积分抵扣金额:', pointsDiscountAmount.value);
      totalAmount -= pointsDiscountAmount.value;
      if (totalAmount < 0) totalAmount = 0;
    }
    
    console.log('[Checkout] 最终总价:', totalAmount, '积分抵扣:', pointsDiscountAmount.value);
    return totalAmount;
  });

  // 监听subtotal变化，更新普通快递的actualFee
  watch(subtotal, (newValue) => {
    // 更新普通快递的actualFee
    const standardShipping = shippingOptions.value.find(option => option.id === 1);
    if (standardShipping) {
      standardShipping.actualFee = newValue >= 99 ? 0 : 10;
    }
    
    // 如果当前选择的是普通快递，也更新selectedShipping的actualFee
    if (selectedShipping.value && selectedShipping.value.id === 1) {
      selectedShipping.value.actualFee = newValue >= 99 ? 0 : 10;
    }
  });

  // 初始化页面数据
  async function initCheckout() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // 检查用户是否登录
      if (!userStore.isLoggedIn) {
        console.warn('[Checkout Debug] 用户未登录，重定向到登录页面');
        router.push({ 
          path: '/login', 
          query: { redirect: router.currentRoute.value.fullPath } 
        });
        return;
      }
      
      // 确保用户ID存在 - 先尝试获取，如果不存在则从token中提取
      const userId = userStore.id || ensureUserId();
      console.log('[Checkout Debug] 初始化页面时的用户ID:', userId);
      
      // 如果仍然无法获取用户ID，显示错误
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('[Checkout Debug] 无法获取有效的用户ID');
        error.value = '无法获取用户信息，请重新登录后再试';
        isLoading.value = false;
        return;
      }
      
      // 如果userStore中没有ID，则手动设置
      if (!userStore.id && userId) {
        console.log('[Checkout Debug] 将用户ID设置到userStore:', userId);
        userStore.id = userId;
      }
      
      console.log('[Checkout Debug] 初始化结算页面');
      console.log('[Checkout Debug] cartStore.hasSelectedItems:', cartStore.hasSelectedItems);
      console.log('[Checkout Debug] cartStore.cartItems长度:', cartStore.cartItems.length);
      
      // 尝试从localStorage读取已保存的结算商品信息
      let localStorageItems = [];
      try {
        const storedItems = localStorage.getItem('checkoutItems');
        if (storedItems) {
          localStorageItems = JSON.parse(storedItems);
          console.log('[Checkout Debug] 从localStorage读取到商品:', localStorageItems.length);
          
          // 验证localStorage数据有效性
          if (!localStorageItems || !Array.isArray(localStorageItems) || localStorageItems.length === 0) {
            console.warn('[Checkout Debug] localStorage中的checkoutItems无效或为空');
          } else {
            // 检查每个商品是否有必要的属性
            const hasValidItems = localStorageItems.every(item => 
              item && (item.id || item.cartId) && item.productId && 
              (item.price || item.priceSnapshot) && item.quantity
            );
            
            if (!hasValidItems) {
              console.warn('[Checkout Debug] localStorage中的商品数据不完整');
            }
          }
        } else {
          console.warn('[Checkout Debug] localStorage中不存在checkoutItems数据');
        }
      } catch (e) {
        console.error('[Checkout Debug] 读取localStorage数据失败:', e);
      }
      
      // 判断购物车选中商品状态
      if (selectedItems.value.length === 0) {
        console.error('[Checkout Debug] 没有选中的商品，无法进行结算');
        error.value = '购物车中没有选中的商品，请返回购物车选择商品后再进行结算。如果已选择商品，请刷新购物车后再尝试结算。';
        return;
      } else {
        console.log('[Checkout Debug] 已选商品数量:', selectedItems.value.length);
        
        // 检查商品数据的完整性
        const invalidItems = selectedItems.value.filter(item => 
          !item.productId || !item.price || !item.quantity
        );
        
        if (invalidItems.length > 0) {
          console.warn('[Checkout Debug] 存在不完整的商品数据:', invalidItems);
          // 不立即返回错误，尝试继续处理，但记录警告
        }
        
        // 记录所选商品的ID，方便调试
        const itemIds = selectedItems.value.map(item => item.productId);
        console.log('[Checkout Debug] 已选商品ID:', itemIds.join(', '));
      }
      
      // 初始化配送方式和支付方式
      if (shippingOptions.value.length > 0) {
        // 更新普通快递的actualFee
        const standardShipping = shippingOptions.value.find(option => option.id === 1);
        if (standardShipping) {
          standardShipping.actualFee = subtotal.value >= 99 ? 0 : 10;
        }
        
        // 如果没有选择配送方式，选择第一个
        if (!selectedShipping.value) {
          selectShipping(shippingOptions.value[0]);
        } else if (selectedShipping.value.actualFee === undefined) {
          // 如果已经有选择的配送方式但没有设置actualFee，则更新它
          selectShipping(selectedShipping.value);
        }
      }
      
      // 获取可用优惠券
      await fetchCoupons();
      
      // 获取用户积分
      await fetchUserPoints();
      
      console.log('[Checkout Debug] 初始化完成，再次检查selectedItems:', selectedItems.value.length);
    } catch (err) {
      console.error('[Checkout Debug] 初始化结算页面失败:', err);
      error.value = '加载结算页面失败，请稍后重试';
    } finally {
      isLoading.value = false;
    }
  }

  // 获取可用优惠券列表
  async function fetchCoupons(status = 'UNUSED') {
    isCouponLoading.value = true;
    try {
      // 这里调用API获取优惠券列表，确保参数格式正确
      // 使用对象作为参数，根据API文档提供正确的参数名称
      const productIds = selectedItems.value.map(item => item.productId);
      
      // 添加更好的错误处理
      try {
        const result = await getAvailableCouponsForOrder({
          totalAmount: subtotal.value,
          productIds: productIds
        });
        
        if (result.code === 200) {
          coupons.value = formatCoupons(result.data || []);
          
          // 如果有之前选择的优惠券，找到匹配的并自动选择
          if (selectedCoupon.value) {
            const previousId = selectedCoupon.value.id;
            const currentCoupon = coupons.value.find(c => c.id === previousId);
            if (currentCoupon) {
              selectCoupon(currentCoupon);
            } else {
              selectedCoupon.value = null;
            }
          }
        } else {
          console.warn('获取优惠券失败:', result.message);
          coupons.value = [];
        }
      } catch (apiError) {
        console.error('API调用失败：', apiError);
        // CORS错误或API不可用时使用默认空数组
        coupons.value = [];
        
        // 如果是网络错误，不显示给用户看，以免影响体验
        if (apiError.message === 'Network Error') {
          console.warn('网络错误或CORS问题，使用空优惠券列表');
        } else {
          ElMessage.error('获取优惠券列表失败');
        }
      }
    } catch (err) {
      console.error('获取优惠券列表失败:', err);
      coupons.value = [];
    } finally {
      isCouponLoading.value = false;
    }
  }
  
  // 格式化优惠券数据
  function formatCoupons(couponsData) {
    console.log('原始优惠券数据:', couponsData);
    if (!Array.isArray(couponsData)) {
      console.warn('优惠券数据不是数组格式');
      return [];
    }
    
    return couponsData.map(coupon => {
      // 处理优惠券或用户优惠券对象
      const couponData = coupon.coupon || coupon;
      
      // 优惠券数据格式统一化处理
      const formattedCoupon = {
        id: coupon.id || 0,
        name: couponData.name || '优惠券',
        description: couponData.description || '',
        type: couponData.type || 'FIXED',
        // 处理金额：保证有数值
        value: parseFloat(couponData.value) || 0,
        amount: parseFloat(couponData.value) || 0,
        // 确保最低消费金额有值
        minAmount: parseFloat(couponData.minSpend) || 0, 
        minSpend: parseFloat(couponData.minSpend) || 0,
        maxDiscount: parseFloat(couponData.maxDiscount) || 0,
        // 确保日期正确格式化
        startDate: couponData.startTime,
        endDate: couponData.endTime,
        startTime: couponData.startTime,
        endTime: couponData.endTime,
        code: couponData.code || '',
        status: coupon.status || 'UNUSED'
      };

      console.log('格式化后的优惠券:', formattedCoupon);
      return formattedCoupon;
    });
  }
  
  // 获取所有优惠券（包括不可用的）
  async function fetchAllCoupons() {
    isLoadingAllCoupons.value = true;
    try {
      const result = await userStore.getUserCoupons();
      
      if (result && result.code === 200) {
        const couponsData = result.data || [];
        allCoupons.value = formatCoupons(couponsData);
        
        // 如果当前有选中的优惠券，确保在列表中也选中它
        if (selectedCoupon.value) {
          const selectedId = selectedCoupon.value.id;
          const foundCoupon = allCoupons.value.find(c => c.id === selectedId);
          if (foundCoupon) {
            // 确保选中状态保持一致
            foundCoupon.selected = true;
          }
        }
      } else {
        ElMessage.error(result?.message || '获取所有优惠券失败');
        allCoupons.value = [];
      }
    } catch (err) {
      console.error('获取所有优惠券失败:', err);
      ElMessage.error('获取所有优惠券失败');
      allCoupons.value = [];
    } finally {
      isLoadingAllCoupons.value = false;
    }
  }
  
  // 判断优惠券是否可用于当前订单
  function isCouponAvailable(coupon) {
    // 金额判断
    if (coupon.minAmount > subtotal.value) {
      return false;
    }
    
    // 日期判断
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return false;
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return false;
    }
    
    return true;
  }
  
  // 获取优惠券不可用原因
  function getCouponUnavailableReason(coupon) {
    // 金额判断
    if (coupon.minAmount > subtotal.value) {
      return `订单金额不满${coupon.minAmount}元`;
    }
    
    // 日期判断
    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return `优惠券未到使用时间`;
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return `优惠券已过期`;
    }
    
    return '不满足使用条件';
  }
  
  // 选择优惠券
  function selectCoupon(coupon) {
    // 判断是否满足优惠券使用条件
    if (subtotal.value < coupon.minAmount) {
      ElMessage.warning(`订单金额不满${coupon.minAmount}元，无法使用该优惠券`);
      return;
    }
    
    // 如果已选择该优惠券，则取消选择
    if (selectedCoupon.value && selectedCoupon.value.id === coupon.id) {
      selectedCoupon.value = null;
    } else {
      selectedCoupon.value = coupon;
      console.log('[Checkout] 已选择优惠券:', coupon);
    }
  }
  
  // 应用优惠码
  async function applyCoupon() {
    if (!couponCode.value) {
      ElMessage.warning('请输入优惠码');
      return;
    }
    
    isCouponLoading.value = true;
    try {
      // 调用API验证优惠码
      const result = await validateCoupon(couponCode.value);
      
      if (result.code === 200) {
        const couponData = result.data;
        
        // 判断是否满足使用条件
        if (subtotal.value < couponData.minAmount) {
          ElMessage.warning(`订单金额不满${couponData.minAmount}元，无法使用该优惠券`);
          return;
        }
        
        // 添加到优惠券列表并选中
        const formattedCoupon = formatCoupons([couponData])[0];
        coupons.value.push(formattedCoupon);
        selectedCoupon.value = formattedCoupon;
        
        ElMessage.success('优惠码应用成功');
        couponCode.value = '';
        showAllCoupons.value = false;
      } else {
        ElMessage.error(result.message || '无效的优惠码');
      }
    } catch (err) {
      console.error('应用优惠码失败:', err);
      ElMessage.error('无效的优惠码');
    } finally {
      isCouponLoading.value = false;
    }
  }
  
  // 处理优惠券Tab切换
  function handleCouponTabChange() {
    if (couponTab.value === 'available' && allCoupons.value.length === 0) {
      fetchAllCoupons();
    }
  }
  
  // 监听购物车总价变化，重新计算优惠券可用性
  watch(subtotal, (newValue) => {
    // 如果当前选中的优惠券不满足金额条件，提示用户
    if (selectedCoupon.value && selectedCoupon.value.minAmount > newValue) {
      ElMessage.warning(`订单金额不满${selectedCoupon.value.minAmount}元，已取消选择该优惠券`);
      selectedCoupon.value = null;
    }
  });
  
  // 监听优惠券抽屉打开
  watch(showAllCoupons, (isOpen) => {
    if (isOpen && allCoupons.value.length === 0) {
      fetchAllCoupons();
    }
  });

  // 选择地址
  function selectAddress(address) {
    selectedAddress.value = address;
  }

  // 打开地址表单
  function openAddressForm(address = null) {
    // 如果是编辑，填充表单数据
    if (address) {
      editingAddress.value = address;
      addressForm.value = {
        id: address.id,
        name: address.name,
        phone: address.phone,
        region: [address.province, address.city, address.district],
        province: address.province,
        city: address.city,
        district: address.district,
        detailAddress: address.detailAddress,
        isDefault: address.isDefault
      };
    } else {
      // 新增地址，清空表单
      editingAddress.value = null;
      addressForm.value = {
        id: null,
        name: '',
        phone: '',
        region: [],
        province: '',
        city: '',
        district: '',
        detailAddress: '',
        isDefault: false
      };
    }
    
    addressFormVisible.value = true;
  }

  // 编辑地址
  function editAddress(address) {
    openAddressForm(address);
  }

  // 删除地址
  async function deleteAddress(address) {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个地址吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      // 调用API删除地址
      await userStore.deleteAddress(address.id);
      
      // 更新地址列表
      addresses.value = addresses.value.filter(addr => addr.id !== address.id);
      
      // 如果删除的是已选择的地址，重新选择默认地址
      if (selectedAddress.value && selectedAddress.value.id === address.id) {
        selectedAddress.value = addresses.value.length > 0 ? addresses.value[0] : null;
      }
      
      ElMessage.success('地址删除成功');
    } catch (err) {
      if (err !== 'cancel') {
        console.error('删除地址失败:', err);
        ElMessage.error('删除地址失败');
      }
    }
  }

  // 保存地址
  async function saveAddress(formRef) {
    // 校验表单
    if (!formRef) return;
    
    try {
      await formRef.validate();
      
      isSavingAddress.value = true;
      
      // 处理地区数据
      if (addressForm.value.region && addressForm.value.region.length === 3) {
        addressForm.value.province = addressForm.value.region[0];
        addressForm.value.city = addressForm.value.region[1];
        addressForm.value.district = addressForm.value.region[2];
      }
      
      // 构建地址数据
      const addressData = {
        id: addressForm.value.id,
        name: addressForm.value.name,
        phone: addressForm.value.phone,
        province: addressForm.value.province,
        city: addressForm.value.city,
        district: addressForm.value.district,
        detailAddress: addressForm.value.detailAddress,
        isDefault: addressForm.value.isDefault
      };
      
      let result;
      
      if (editingAddress.value) {
        // 编辑现有地址
        result = await userStore.updateAddress(addressData);
        
        // 更新地址列表
        const index = addresses.value.findIndex(addr => addr.id === addressData.id);
        if (index !== -1) {
          addresses.value[index] = { ...addresses.value[index], ...addressData };
        }
        
        ElMessage.success('地址更新成功');
      } else {
        // 添加新地址
        result = await userStore.addAddress(addressData);
        
        // 添加到地址列表
        addresses.value.push(result);
        
        ElMessage.success('地址添加成功');
        
        // 如果是默认地址或者当前没有选择地址，则选择这个地址
        if (addressData.isDefault || !selectedAddress.value) {
          selectedAddress.value = result || addressData;
        }
      }
      
      // 关闭表单对话框
      addressFormVisible.value = false;
    } catch (err) {
      console.error('保存地址失败:', err);
      ElMessage.error(err.message || '保存地址失败');
    } finally {
      isSavingAddress.value = false;
    }
  }

  // 选择配送方式
  function selectShipping(shipping) {
    selectedShipping.value = shipping;
    
    // 更新配送方式的实际运费（针对普通快递）
    if (shipping.id === 1) {
      // 普通快递，订单满99元免运费，否则10元运费
      shipping.actualFee = subtotal.value >= 99 ? 0 : 10;
    } else {
      shipping.actualFee = shipping.fee;
    }
  }

  // 选择支付方式
  function selectPayment(payment) {
    selectedPayment.value = payment;
  }

  // 添加获取用户积分的方法
  async function fetchUserPoints() {
    isLoadingPoints.value = true;
    try {
      // 先尝试从pointsStore获取积分
      let points = pointsStore.userPoints;
      
      // 如果store中没有积分数据，则调用API获取
      if (!points) {
        const response = await getUserPoints();
        if (response.code === 200 && response.data) {
          points = response.data.points || 0;
          console.log('[Checkout] 获取用户积分成功:', points);
        } else {
          console.error('[Checkout] 获取用户积分失败:', response.message);
          points = 0;
        }
      }
      
      userPoints.value = points;
    } catch (error) {
      console.error('[Checkout] 获取用户积分异常:', error);
      userPoints.value = 0;
    } finally {
      isLoadingPoints.value = false;
    }
  }

  // 处理积分使用变化
  function handleUsePointsChange(value) {
    console.log('[Checkout] 积分开关状态变化, 原始值:', value);
    usePointsForDiscount.value = value;
    console.log('[Checkout] 积分开关状态已更新:', usePointsForDiscount.value);
    
    if (!usePointsForDiscount.value) {
      // 取消使用积分时，清空积分相关值
      pointsToUse.value = 0;
      pointsInputValue.value = 0;
      console.log('[Checkout] 已清空积分使用数量');
    } else if (pointsInputValue.value > 0) {
      // 开启使用积分且已有输入值时，更新积分使用数量
      handlePointsInputChange(pointsInputValue.value);
    } else {
      // 默认使用最大可用积分数量
      const maxUsablePoints = Math.min(userPoints.value, maxPointsUsage.value);
      pointsInputValue.value = maxUsablePoints;
      pointsToUse.value = maxUsablePoints;
      console.log('[Checkout] 已设置默认最大积分:', maxUsablePoints);
    }
  }

  // 处理积分输入变化
  function handlePointsInputChange(value) {
    console.log('[Checkout] 积分输入原始值:', value);
    // 确保是数字
    const numValue = parseInt(value) || 0;
    
    // 确保不超过用户拥有的积分
    let points = Math.min(numValue, userPoints.value);
    
    // 确保不超过最大可用积分（5000）
    points = Math.min(points, maxPointsUsage.value);
    
    // 确保是100的整数倍
    points = Math.floor(points / 100) * 100;
    
    console.log('[Checkout] 积分输入处理后:', points);
    
    pointsInputValue.value = points;
    pointsToUse.value = points;
  }

  // 提交订单
  async function submitOrder() {
    // 表单验证
    if (!selectedAddress.value) {
      ElMessage.warning('请选择收货地址');
      return;
    }
    
    if (!selectedShipping.value) {
      ElMessage.warning('请选择配送方式');
      return;
    }
    
    // 确认提交
    try {
      await ElMessageBox.confirm(
        `确认提交订单？总计：￥${formatPrice(total.value)}`,
        '提交订单',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
      );
      
      isSubmitting.value = true;
      
      // 获取用户ID的多种方法，按优先级尝试
      let userId = null;

      // 1. 从userStore获取
      if (userStore.id) {
        userId = userStore.id;
        console.log('[Checkout Debug] 从userStore获取到用户ID:', userId);
      } 
      // 2. 从userStore.userInfo获取
      else if (userStore.userInfo && userStore.userInfo.id) {
        userId = userStore.userInfo.id;
        console.log('[Checkout Debug] 从userStore.userInfo获取到用户ID:', userId);
      }
      // 3. 从localStorage获取
      else {
        const authUserInfo = getAuthUserInfo();
        if (authUserInfo && authUserInfo.userId) {
          userId = authUserInfo.userId;
          console.log('[Checkout Debug] 从localStorage获取到用户ID:', userId);
        }
      }
      
      // 4. 尝试确保用户ID存在（从token提取）
      if (!userId) {
        userId = ensureUserId();
        console.log('[Checkout Debug] 从token提取到用户ID:', userId);
      }
      
      // 如果以上方法都没有获取到ID，则抛出错误
      if (!userId) {
        throw new Error('无法获取用户ID，请重新登录');
      }
      
      // 构建订单数据
      const orderData = {
        userId: userId,
        addressId: selectedAddress.value.addressId,
        cartIds: selectedItems.value.map(item => item.id || item.cartId || item.productId),
        paymentMethod: 'alipay', // 默认使用支付宝，用户可在支付页面更改
        couponId: selectedCoupon.value ? selectedCoupon.value.id : undefined,
        remark: orderRemark.value || '',
        shippingFee: shippingFee.value, // 添加运费
        pointsUsed: usePointsForDiscount.value ? pointsToUse.value : 0 // 添加积分抵扣
      };
      
      // 增加详细日志，记录积分抵扣相关信息
      console.log('[Checkout Debug] 提交订单前详细数据:', {
        orderData,
        积分抵扣: {
          usePointsForDiscount: usePointsForDiscount.value,
          pointsToUse: pointsToUse.value,
          userPoints: userPoints.value,
          pointsDiscountAmount: pointsDiscountAmount.value
        },
        订单金额: {
          subtotal: subtotal.value,
          shippingFee: shippingFee.value,
          couponDiscount: selectedCoupon.value ? (selectedCoupon.value.value || selectedCoupon.value.amount || 0) : 0,
          finalTotal: total.value
        }
      });
      
      // 调用订单创建API
      const result = await orderStore.createOrder(orderData);
      
      // 详细记录API返回的订单数据
      console.log('[Checkout Debug] 订单创建返回详细结果:', {
        orderResult: result,
        orderId: result ? result.orderId : null,
        orderNumber: result ? result.orderNumber : null,
        totalAmount: result ? result.totalAmount : null,
        actualAmount: result ? result.actualAmount : null,
        pointsUsed: result ? result.pointsUsed : null,
        pointsDiscount: result ? result.pointsDiscount : null
      });
      
      if (!result) {
        throw new Error('订单创建失败，请稍后重试');
      }
      
      // 如果使用了积分，更新积分store中的积分数量
      if (usePointsForDiscount.value && pointsToUse.value > 0) {
        console.log('[Checkout Debug] 更新积分store, 减少积分:', pointsToUse.value);
        // 检查返回的订单数据中是否有积分抵扣信息
        console.log('[Checkout Debug] 订单中的积分抵扣信息:', {
          pointsUsed: result.pointsUsed,
          pointsDiscount: result.pointsDiscount,
          请求的积分抵扣: orderData.pointsUsed
        });
        
        pointsStore.SET_USER_POINTS(userPoints.value - pointsToUse.value);
      }
      
      // 清空购物车中已选中的商品
      await cartStore.removeSelectedItems();
      
      // 清除localStorage中的数据
      localStorage.removeItem('checkoutItems');
      
      // 直接跳转到支付页面
      router.push(`/payment/${result.orderId || result.orderNumber}`);
      
    } catch (err) {
      if (err === 'cancel') return;
      
      console.error('提交订单失败:', err);
      ElMessage.error(err.message || '提交订单失败');
    } finally {
      isSubmitting.value = false;
    }
  }

  // 格式化价格
  function formatPrice(price) {
    return Number(price).toFixed(2);
  }

  // 格式化日期
  function formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '无效日期';
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch (e) {
      console.error('日期格式化错误:', e, dateString);
      return '无效日期';
    }
  }

  // 跳转到订单详情
  function goToOrderDetail() {
    orderResultVisible.value = false;
    router.push(`/order/${orderNumber.value}`);
  }

  // 重试提交订单
  function retrySubmit() {
    orderResultVisible.value = false;
    submitOrder();
  }

  // 返回购物车页面
  function goBackToCart() {
    router.push('/cart');
  }

  // 处理窗口大小变化
  function handleResize() {
    // 可以在这里根据窗口大小调整界面布局
  }

  // 组件挂载时初始化数据
  onMounted(() => {
    console.log('[Checkout Debug] 组件挂载');
    
    // 检查用户认证状态
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('[Checkout Debug] 未找到token，重定向到登录页面');
      router.push({ 
        path: '/login', 
        query: { redirect: '/checkout' } 
      });
      return;
    }
    
    // 确保用户ID存在
    const authInfo = getAuthUserInfo();
    const userId = userStore.id || authInfo?.userId || ensureUserId();
    
    console.log('[Checkout Debug] 挂载时的用户认证信息:', { 
      hasToken: !!token, 
      userStoreId: userStore.id,
      authInfoUserId: authInfo?.userId,
      ensuredUserId: userId
    });
    
    // 如果userStore中没有ID，但我们已经获取到了ID，则设置它
    if (!userStore.id && userId) {
      userStore.id = userId;
    }
    
    // 先尝试从localStorage加载选中商品到cartStore
    if (!cartStore.hasSelectedItems) {
      const loaded = cartStore.loadSelectedItemsFromLocalStorage();
      console.log('[Checkout Debug] 尝试从localStorage加载选中商品:', loaded ? '成功' : '失败');
    }
    
    // 初始化结算页面
    initCheckout();
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize);
  });

  // 组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  // 刷新结算页面
  async function refreshCheckout() {
    console.log('[Checkout Debug] 完全刷新结算页面');
    isLoading.value = true;
    error.value = null;
    
    try {
      // 先尝试刷新购物车数据
      if (cartStore) {
        try {
          await cartStore.fetchCartItems();
          console.log('[Checkout Debug] 刷新购物车数据成功');
        } catch (e) {
          console.error('[Checkout Debug] 刷新购物车数据失败:', e);
        }
      }
      
      // 清除状态
      selectedShipping.value = null;
      selectedPayment.value = null;
      selectedCoupon.value = null;
      
      // 重新初始化
      setTimeout(() => {
        initCheckout();
      }, 300);
    } catch (err) {
      console.error('[Checkout Debug] 刷新页面失败:', err);
      error.value = '刷新页面失败，请稍后重试或返回购物车';
      isLoading.value = false;
    }
  }

  // 手动刷新购物车数据
  async function reloadCartData() {
    try {
      // 显示loading消息
      ElMessage({
        message: '正在刷新购物车数据...',
        type: 'info',
        duration: 2000
      });
      
      // 清除localStorage中的结算数据
      localStorage.removeItem('checkoutItems');
      console.log('[Checkout Debug] 已清除localStorage中的checkoutItems数据');
      
      // 重新加载购物车数据
      console.log('[Checkout Debug] 开始重新加载购物车数据');
      await cartStore.fetchCartItems();
      console.log('[Checkout Debug] 购物车数据重新加载完成');
      
      // 重新初始化结算页面
      await initCheckout();
      
      // 成功消息
      ElMessage({
        message: '购物车数据已刷新',
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('[Checkout Debug] 刷新购物车数据失败:', error);
      ElMessage.error('刷新购物车数据失败，请稍后重试');
    }
  }

  return {
    // 状态
    isLoading,
    isAddressLoading,
    isSubmitting,
    isSavingAddress,
    error,
    addresses,
    selectedAddress,
    addressFormVisible,
    editingAddress,
    addressForm,
    addressRules,
    selectedItems,
    shippingOptions,
    selectedShipping,
    paymentMethods,
    selectedPayment,
    coupons,
    selectedCoupon,
    couponCode,
    orderRemark,
    orderResultVisible,
    orderSuccess,
    orderNumber,
    orderError,
    subtotal,
    total,
    regionData,
    cartStore,
    shippingFee,
    
    // 优惠券增强功能
    showAllCoupons,
    couponTab,
    allCoupons,
    isLoadingAllCoupons,
    isCouponLoading,
    
    // 积分相关
    userPoints,
    usePointsForDiscount,
    pointsToUse,
    pointsInputValue,
    isLoadingPoints,
    pointsDiscountAmount,
    maxPointsDiscount,
    maxPointsUsage,
    handleUsePointsChange,
    handlePointsInputChange,
    
    // 方法
    initCheckout,
    fetchCoupons,
    selectAddress,
    openAddressForm,
    editAddress,
    deleteAddress,
    saveAddress,
    selectShipping,
    selectPayment,
    selectCoupon,
    applyCoupon,
    submitOrder,
    formatPrice,
    formatDate,
    goToOrderDetail,
    retrySubmit,
    goBackToCart,
    refreshCheckout,
    reloadCartData,
    
    // 优惠券增强函数
    handleCouponTabChange,
    fetchAllCoupons,
    isCouponAvailable,
    getCouponUnavailableReason
  };
} 