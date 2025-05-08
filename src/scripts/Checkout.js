import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { getUserAddresses } from '@/api/user';
import { getAvailableCouponsForOrder, validateCoupon } from '@/api/coupon';
import { regionData } from '@/utils/regionData';
import { getUserInfo as getAuthUserInfo, ensureUserId } from '@/utils/auth';

export default function useCheckout() {
  const router = useRouter();
  const route = useRoute();
  const cartStore = useCartStore();
  const orderStore = useOrderStore();
  const userStore = useUserStore();

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
    // 首先尝试从cartStore获取选中商品
    console.log('[Checkout Debug] 计算selectedItems, cartStore.selectedItems:', cartStore.selectedItems);
    if (cartStore.selectedItems && cartStore.selectedItems.length > 0) {
      console.log('[Checkout Debug] 使用cartStore中的选中商品');
      const items = cartStore.selectedCartItems;
      console.log('[Checkout Debug] cartStore.selectedCartItems长度:', items.length);
      if (items && items.length > 0) {
        // 确保所有必要字段都存在
        return items.map(item => ({
          ...item,
          id: item.id || item.cartId,
          cartId: item.cartId || item.id,
          productName: item.productName || item.title || '未命名商品',
          productImage: item.productImage || item.image || '',
          price: item.price || item.priceSnapshot || 0,
          specs: item.specs || item.specification || '默认规格',
          selected: item.selected || 1
        }));
      }
    }
    
    // 如果cartStore没有选中商品或者获取到的列表为空，尝试从localStorage读取
    try {
      const storedItems = localStorage.getItem('checkoutItems');
      if (storedItems) {
        const items = JSON.parse(storedItems);
        console.log('[Checkout Debug] 从localStorage读取商品:', items.length);
        // 确保商品数据格式正确
        return items.map(item => {
          return {
            id: item.id || item.cartId,
            cartId: item.cartId || item.id,
            productId: item.productId,
            productName: item.title || item.productName || '未命名商品',
            productImage: item.image || item.productImage || '',
            price: item.price || item.priceSnapshot || 0,
            quantity: item.quantity || 1,
            specs: item.specs || item.specification || '默认规格',
            selected: 1
          };
        });
      }
    } catch (e) {
      console.error('[Checkout Debug] 解析localStorage商品数据失败:', e);
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
      icon: 'Van',
      description: '订单满99元包邮 (3-5天送达)'
    },
    { 
      id: 2, 
      name: '加急快递', 
      fee: 10, 
      icon: 'Van',
      description: '次日送达 (仅支持部分城市)'
    },
    { 
      id: 3, 
      name: '到店自提', 
      fee: 0, 
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

  const total = computed(() => {
    let totalAmount = subtotal.value;
    
    // 加上运费
    if (selectedShipping.value) {
      totalAmount += selectedShipping.value.fee || 0;
    }
    
    // 减去优惠券金额
    if (selectedCoupon.value) {
      totalAmount -= selectedCoupon.value.amount;
      // 确保总价不小于0
      if (totalAmount < 0) totalAmount = 0;
    }
    
    return totalAmount;
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
      
      // 不再调用fetchAddresses，由AddressManager组件负责加载地址
      
      // 尝试从localStorage读取已保存的结算商品信息
      let localStorageItems = [];
      try {
        const storedItems = localStorage.getItem('checkoutItems');
        if (storedItems) {
          localStorageItems = JSON.parse(storedItems);
          console.log('[Checkout Debug] 从localStorage读取到商品:', localStorageItems.length);
          
          // 如果cartStore中没有商品数据，尝试用localStorage的数据填充
          if (cartStore.cartItems.length === 0) {
            console.log('[Checkout Debug] cartStore.cartItems为空，尝试用localStorage数据填充');
            // 这里我们不直接修改cartItems，因为它需要通过API获取，但可以设置selectedItems
            if (localStorageItems.length > 0) {
              const itemIds = localStorageItems.map(item => item.id || item.cartId);
              cartStore.selectedItems = itemIds;
              console.log('[Checkout Debug] 已设置cartStore.selectedItems:', itemIds);
            }
          }
        }
      } catch (e) {
        console.error('[Checkout Debug] 读取localStorage数据失败:', e);
      }
      
      // 判断购物车选中商品状态
      if (selectedItems.value.length === 0) {
        console.error('[Checkout Debug] 没有选中的商品，无法进行结算');
        error.value = '购物车中没有选中的商品，请返回购物车选择商品后再进行结算';
        return;
      }
      
      // 初始化配送方式和支付方式
      if (shippingOptions.value.length > 0 && !selectedShipping.value) {
        selectShipping(shippingOptions.value[0]);
      }
      
      if (paymentMethods.value.length > 0 && !selectedPayment.value) {
        selectPayment(paymentMethods.value[0]);
      }
      
      // 获取可用优惠券
      fetchCoupons();
      
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
  }

  // 选择支付方式
  function selectPayment(payment) {
    selectedPayment.value = payment;
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
    
    if (!selectedPayment.value) {
      ElMessage.warning('请选择支付方式');
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
        paymentMethod: selectedPayment.value.id,
        couponId: selectedCoupon.value ? selectedCoupon.value.id : undefined,
        remark: orderRemark.value || ''
      };
      
      console.log('[Checkout Debug] 提交订单数据:', orderData);
      
      // 调用订单创建API
      const result = await orderStore.createOrder(orderData);
      
      if (!result) {
        throw new Error('订单创建失败，请稍后重试');
      }
      
      // 订单创建成功，显示成功对话框
      orderSuccess.value = true;
      orderNumber.value = result.orderNumber;
      orderResultVisible.value = true;
      
      // 清空购物车中已选中的商品
      await cartStore.removeSelectedItems();
      
      // 清除localStorage中的数据
      localStorage.removeItem('checkoutItems');
      
    } catch (err) {
      if (err === 'cancel') return;
      
      console.error('提交订单失败:', err);
      orderSuccess.value = false;
      orderError.value = err.message || '提交订单失败';
      orderResultVisible.value = true;
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
    
    // 优惠券增强功能
    showAllCoupons,
    couponTab,
    allCoupons,
    isLoadingAllCoupons,
    isCouponLoading,
    
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
    
    // 优惠券增强函数
    handleCouponTabChange,
    fetchAllCoupons,
    isCouponAvailable,
    getCouponUnavailableReason
  };
} 