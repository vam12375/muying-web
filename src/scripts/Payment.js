import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/user';
import { useOrderStore } from '@/stores/order';
import { getOrderDetail } from '@/api/order'; // Import API function directly
import { createAlipayOrder, queryPaymentStatus, createWechatSandboxPayment, createWalletPayment } from '@/api/payment'; // Added missing imports

// 尝试导入dayjs，如果不可用则创建一个简单的格式化函数
let dayjs;
try {
  dayjs = require('dayjs');
} catch (e) {
  console.warn('dayjs不可用，使用简单的日期格式化函数');
  dayjs = {
    format: (date, format) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleString();
    }
  };
}

export default function usePayment() {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const orderStore = useOrderStore();

  console.log('初始化Payment组件, 路由参数:', route.params, route.query);

  // 状态
  const loading = ref(true);
  const error = ref(null);
  // 获取订单ID，路由定义为 /payment/:orderId
  const orderId = ref(route.params.orderId || '');
  console.log('获取到订单ID:', orderId.value);
  const orderNo = ref('');
  const orderAmount = ref(0);
  const orderTime = ref('');
  const receiverInfo = ref('');
  const orderData = ref(null);
  
  const paymentStatus = ref('pending'); // pending, processing, success, failed
  const selectedPaymentMethod = ref('alipay');
  const showQRCode = ref(false);
  const qrcodeLoading = ref(false);
  const countdownTime = ref(900); // 15分钟倒计时
  const showPaymentForm = ref(false);
  let countdownTimer = null;
  const paymentStatusChecker = ref(null);
  const alipayForm = ref('');
  const paymentId = ref(null);

  // 钱包余额（模拟数据）
  const walletBalance = ref(1000);

  // 支付方式
  const paymentMethods = reactive([
    {
      id: 'alipay',
      name: '支付宝',
      description: '推荐有支付宝账户的用户使用',
      icon: 'el-icon-alipay',
      color: '#1677FF',
      image: '/pay/alipay.png'
    },
    {
      id: 'wechat',
      name: '微信支付',
      description: '推荐有微信账户的用户使用',
      icon: 'el-icon-wechat',
      color: '#07C160',
      image: '/pay/wechat.png'
    },
    {
      id: 'wallet',
      name: '钱包支付',
      description: '使用账户余额一键支付',
      icon: 'el-icon-wallet',
      color: '#FF6A00',
      image: '/pay/wallet.png'
    }
  ]);

  // 方法
  const fetchOrderDetail = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      console.log(`正在获取订单详情，订单ID: ${orderId.value}`);
      
      // 直接使用API方法，绕过store
      const response = await getOrderDetail(orderId.value);
      console.log('API直接调用返回结果:', response);
      
      if (response && response.code === 200 && response.data) {
        const orderDetail = response.data;
        console.log('解析后的订单详情:', orderDetail);
        
        orderData.value = orderDetail;
        orderNo.value = orderDetail.orderNo || orderDetail.orderNumber;
        orderAmount.value = orderDetail.actualAmount || orderDetail.totalAmount || 0;
        
        // 更安全的日期格式化
        try {
          if (typeof dayjs === 'function') {
            orderTime.value = dayjs(orderDetail.createTime).format('YYYY-MM-DD HH:mm:ss');
          } else if (dayjs && typeof dayjs.format === 'function') {
            orderTime.value = dayjs.format(orderDetail.createTime, 'YYYY-MM-DD HH:mm:ss');
          } else {
            const date = new Date(orderDetail.createTime);
            orderTime.value = date.toLocaleString();
          }
        } catch (dateErr) {
          console.warn('日期格式化错误:', dateErr);
          orderTime.value = orderDetail.createTime || new Date().toLocaleString();
        }
        
        const receiver = orderDetail.receiverName || '未知';
        const phone = orderDetail.receiverPhone ? orderDetail.receiverPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '';
        receiverInfo.value = `${receiver} ${phone}`;
      } else {
        // API返回错误或没有数据
        console.warn('订单API返回错误或没有数据', response);
        
        if (response && response.message) {
          throw new Error(response.message);
        } else {
          throw new Error('获取订单详情失败，服务器返回无效数据');
        }
      }
    } catch (err) {
      console.error('获取订单详情错误详情:', err);
      
      // 使用模拟数据进行测试
      console.warn('使用模拟订单数据作为备选方案');
      
      // 模拟数据
      const mockOrderDetail = {
        orderId: orderId.value || '187',
        orderNo: 'MO' + (Date.now ? Date.now() : new Date().getTime()),
        orderNumber: 'MO' + (Date.now ? Date.now() : new Date().getTime()),
        totalAmount: 299.99,
        actualAmount: 299.99,
        createTime: new Date().toISOString(),
        receiverName: '测试用户',
        receiverPhone: '13800138000',
        status: 'pending_payment'
      };
      
      orderData.value = mockOrderDetail;
      orderNo.value = mockOrderDetail.orderNo;
      orderAmount.value = mockOrderDetail.actualAmount || mockOrderDetail.totalAmount;
      
      // 更安全的日期格式化
      try {
        if (typeof dayjs === 'function') {
          orderTime.value = dayjs(mockOrderDetail.createTime).format('YYYY-MM-DD HH:mm:ss');
        } else if (dayjs && typeof dayjs.format === 'function') {
          orderTime.value = dayjs.format(mockOrderDetail.createTime, 'YYYY-MM-DD HH:mm:ss');
        } else {
          const date = new Date(mockOrderDetail.createTime);
          orderTime.value = date.toLocaleString();
        }
      } catch (dateErr) {
        console.warn('日期格式化错误:', dateErr);
        orderTime.value = mockOrderDetail.createTime || new Date().toLocaleString();
      }
      
      receiverInfo.value = `${mockOrderDetail.receiverName} ${mockOrderDetail.receiverPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`;
      
      // 显示错误消息给用户
      error.value = `数据加载错误: ${err.message}. 已显示模拟数据以便测试界面.`;
    } finally {
      loading.value = false;
    }
  };

  const selectPaymentMethod = (method) => {
    selectedPaymentMethod.value = method;
    showQRCode.value = false;
    showPaymentForm.value = false;
    alipayForm.value = '';
    
    // 重置支付状态
    if (paymentStatus.value !== 'pending') {
      paymentStatus.value = 'pending';
    }
  };

  const getSelectedPaymentMethodName = () => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod.value);
    return method ? method.name : '';
  };

  const getQRCodeForPayment = () => {
    // 模拟不同支付方式的二维码图片
    return selectedPaymentMethod.value === 'alipay' 
      ? 'https://via.placeholder.com/240x240.png?text=支付宝支付'
      : 'https://via.placeholder.com/240x240.png?text=微信支付';
  };

  const startCountdown = () => {
    // 清除可能存在的计时器
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    
    // 重置倒计时时间
    countdownTime.value = 900;
    
    // 启动新的计时器
    countdownTimer = setInterval(() => {
      if (countdownTime.value > 0) {
        countdownTime.value -= 1;
      } else {
        // 倒计时结束
        clearInterval(countdownTimer);
        if (paymentStatus.value === 'pending') {
          ElMessage.warning('支付超时，请重新发起支付');
          showQRCode.value = false;
        }
      }
    }, 1000);
  };

  const formatCountdown = () => {
    const minutes = Math.floor(countdownTime.value / 60);
    const seconds = countdownTime.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const createAlipayPayment = async () => {
    try {
      loading.value = true;
      const response = await createAlipayOrder(orderId.value);
      
      if (response && response.code === 200 && response.data) {
        // 保存支付ID用于后续查询
        paymentId.value = response.data.paymentId;
        
        // 获取支付宝表单
        alipayForm.value = response.data.form;
        
        // 启动定时器检查支付状态
        startPaymentStatusChecker();
        
        return true;
      } else {
        throw new Error(response?.message || '创建支付宝订单失败');
      }
    } catch (error) {
      console.error('创建支付宝订单错误:', error);
      ElMessage.error(`创建支付宝订单失败: ${error.message}`);
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 新增: 创建微信沙箱支付
  const createWechatPayment = async () => {
    try {
      loading.value = true;
      paymentStatus.value = 'processing';
      
      const response = await createWechatSandboxPayment(orderId.value);
      
      if (response && response.code === 200 && response.data) {
        // 保存支付ID用于后续查询
        paymentId.value = response.data.paymentId;
        
        // 沙箱支付会自动模拟成功
        if (response.data.status === 2) { // SUCCESS
          paymentStatus.value = 'success';
          ElMessage.success('微信支付成功！');
          
          // 3秒后跳转到订单详情
          setTimeout(() => {
            goToOrderDetail();
          }, 3000);
        } else {
          // 如果未自动成功，启动定时器检查状态
          startPaymentStatusChecker();
        }
        
        return true;
      } else {
        throw new Error(response?.message || '创建微信支付订单失败');
      }
    } catch (error) {
      console.error('创建微信支付订单错误:', error);
      ElMessage.error(`创建微信支付订单失败: ${error.message}`);
      paymentStatus.value = 'failed';
      return false;
    } finally {
      loading.value = false;
    }
  };

  // 启动支付状态检查定时器
  const startPaymentStatusChecker = () => {
    if (!paymentId.value) return;
    
    // 每3秒检查一次支付状态
    paymentStatusChecker.value = setInterval(async () => {
      try {
        const response = await queryPaymentStatus(paymentId.value);
        
        if (response && response.code === 200 && response.data) {
          const status = response.data.status;
          
          // 状态码: 0-待支付 1-支付中 2-支付成功 3-支付失败 4-已关闭
          if (status === 2) { // 支付成功
            paymentStatus.value = 'success';
            stopPaymentStatusChecker();
            ElMessage.success('支付成功！');
            
            // 3秒后跳转到订单详情
            setTimeout(() => {
              goToOrderDetail();
            }, 3000);
          } else if (status === 3) { // 支付失败
            paymentStatus.value = 'failed';
            stopPaymentStatusChecker();
            ElMessage.error('支付失败，请重试');
          } else if (status === 4) { // 已关闭
            paymentStatus.value = 'failed';
            stopPaymentStatusChecker();
            ElMessage.warning('支付已关闭');
          }
        }
      } catch (error) {
        console.error('查询支付状态错误:', error);
      }
    }, 3000);
  };

  // 停止支付状态检查
  const stopPaymentStatusChecker = () => {
    if (paymentStatusChecker.value) {
      clearInterval(paymentStatusChecker.value);
      paymentStatusChecker.value = null;
    }
  };

  const simulatePayment = async () => {
    if (showQRCode.value) {
      // 用户点击"已完成支付"按钮 (仅显示二维码时会出现)
      if (selectedPaymentMethod.value === 'wechat') {
        // 微信支付：实际调用API而不是模拟
        await createWechatPayment();
      } else {
        // 保留原有的模拟逻辑
        paymentStatus.value = 'processing';
        
        // 模拟支付处理
        setTimeout(() => {
          const random = Math.random();
          if (random > 0.2) { // 80%的概率支付成功
            paymentStatus.value = 'success';
            
            // 清除倒计时
            if (countdownTimer) {
              clearInterval(countdownTimer);
            }
            
            // 更新订单状态
            ElMessage.success('支付成功！');
          } else {
            paymentStatus.value = 'failed';
            ElMessage.error('支付失败，请重试');
          }
        }, 2000);
      }
    } else {
      // 用户点击"立即支付"按钮
      if (selectedPaymentMethod.value === 'wallet') {
        showPaymentForm.value = true;
      } else if (selectedPaymentMethod.value === 'alipay') {
        // 调用支付宝支付
        const success = await createAlipayPayment();
        if (success) {
          // 在页面中动态插入支付宝表单并自动提交
          const div = document.createElement('div');
          div.innerHTML = alipayForm.value;
          document.body.appendChild(div);
          
          // 尝试自动提交表单
          const form = div.querySelector('form');
          if (form) {
            form.submit();
          }
        }
      } else if (selectedPaymentMethod.value === 'wechat') {
        // 为微信支付：显示二维码
        qrcodeLoading.value = true;
        
        // 实际上，我们应该在这里调用API获取真实的二维码，但对于沙箱环境，可以简化处理
        setTimeout(() => {
          qrcodeLoading.value = false;
          showQRCode.value = true;
          startCountdown();
        }, 1500);
      }
    }
  };

  const simulateWalletPayment = async () => {
    if (walletBalance.value < orderAmount.value) {
      ElMessage.warning('账户余额不足');
      return;
    }
    
    paymentStatus.value = 'processing';
    loading.value = true;
    
    try {
      // 调用钱包支付API
      const response = await createWalletPayment(orderId.value);
      
      if (response && response.code === 200 && response.data) {
        // 保存支付ID用于后续查询
        paymentId.value = response.data.paymentId;
        
        // 扣减余额 (实际上后端已经扣减，这里只是更新前端显示)
        walletBalance.value -= orderAmount.value;
        
        // 钱包支付通常是立即成功的
        paymentStatus.value = 'success';
        ElMessage.success('钱包支付成功！');
        
        // 3秒后跳转到订单详情
        setTimeout(() => {
          goToOrderDetail();
        }, 3000);
      } else {
        throw new Error(response?.message || '钱包支付失败');
      }
    } catch (error) {
      console.error('钱包支付错误:', error);
      ElMessage.error(`钱包支付失败: ${error.message}`);
      paymentStatus.value = 'failed';
    } finally {
      loading.value = false;
    }
  };

  const retryPayment = () => {
    paymentStatus.value = 'pending';
    showQRCode.value = false;
    showPaymentForm.value = false;
    alipayForm.value = '';
  };

  const goBack = () => {
    router.push('/orders');
  };

  const goToOrderDetail = () => {
    router.push(`/order/${orderId.value}`);
  };

  const getPaymentStatusText = () => {
    switch (paymentStatus.value) {
      case 'pending': return '等待支付';
      case 'processing': return '支付处理中';
      case 'success': return '支付成功';
      case 'failed': return '支付失败';
      default: return '等待支付';
    }
  };

  const getPaymentStatusDescription = () => {
    switch (paymentStatus.value) {
      case 'pending': return '请尽快完成支付，以免订单超时取消';
      case 'processing': return '正在处理您的支付请求，请稍候...';
      case 'success': return '您的订单已支付成功，我们将尽快为您发货';
      case 'failed': return '支付失败，请重新尝试或选择其他支付方式';
      default: return '';
    }
  };

  // 生命周期钩子
  onMounted(() => {
    fetchOrderDetail();
  });

  onUnmounted(() => {
    // 清除定时器
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
    
    stopPaymentStatusChecker();
  });

  return {
    // 状态
    loading,
    error,
    orderId,
    orderNo,
    orderAmount,
    orderTime,
    receiverInfo,
    orderData,
    paymentStatus,
    selectedPaymentMethod,
    paymentMethods,
    walletBalance,
    showQRCode,
    qrcodeLoading,
    countdownTime,
    showPaymentForm,
    alipayForm,
    
    // 方法
    selectPaymentMethod,
    getSelectedPaymentMethodName,
    getPaymentStatusText,
    getPaymentStatusDescription,
    formatPrice,
    formatCountdown,
    getQRCodeForPayment,
    startCountdown,
    simulatePayment,
    retryPayment,
    goBack,
    simulateWalletPayment,
    goToOrderDetail,
    fetchOrderDetail,
    createAlipayPayment,
    createWechatPayment
  };
}
