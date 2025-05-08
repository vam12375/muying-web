import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, ElImage, ElImageViewer } from 'element-plus';
import { 
  ShoppingCart, 
  Star, 
  Picture, 
  Check, 
  Ship, 
  RefreshRight, 
  MessageBox, 
  Share, 
  ChatDotRound,
  Back,
  View,
  Sort,
  Download,
  ShoppingBag,
  Discount,
  Timer,
  Promotion,
  Warning,
  MoreFilled,
  ArrowRight,
  CopyDocument,
  ZoomIn,
  Location,
  Van,
  ArrowLeft,
  QuestionFilled,
  CloseBold,
} from '@element-plus/icons-vue';
import { useOrderStore } from '@/stores/order';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import { 
  getProductDetail, 
  getProductReviews, 
  getRelatedProducts, 
  toggleProductFavorite
} from '@/api/product';
import { useHead } from '@vueuse/head';

export default function useProductDetail() {
  const route = useRoute();
  const router = useRouter();
  const orderStore = useOrderStore();
  const cartStore = useCartStore();
  const userStore = useUserStore();

  // 状态变量
  const loading = ref(true);
  const product = ref(null);
  const currentImageIndex = ref(0);
  const selectedAttrs = reactive({});
  const quantity = ref(1);
  const isAddingToCart = ref(false);
  const isFavoriteLoading = ref(false);
  const isImageViewerVisible = ref(false);
  const recentlyViewed = ref([]);
  const imageViewerIndex = ref(0);
  const isRecentViewedOpen = ref(true);
  const isShareDialogVisible = ref(false);

  // 错误状态
  const loadError = ref(false);
  const reviewLoadError = ref(false);
  const relatedLoadError = ref(false);

  // 评价相关状态
  const reviewLoading = ref(false);
  const reviewFilter = ref('all');
  const reviewPage = ref(1);
  const reviewPageSize = ref(10);
  const reviewTotal = ref(0);
  const reviews = ref([]);
  const reviewTagFilter = ref('');

  // 相关推荐状态
  const relatedProductsLoading = ref(false);
  const relatedProducts = ref([]);

  // 图片缩放相关
  const isZooming = ref(false);
  const productImage = ref(null);
  const zoomLens = ref(null);
  const zoomedImage = ref(null);

  // 悬浮购买栏
  const showFixedBar = ref(false);

  // 新增状态变量
  const newQuestion = ref('');
  const isSubmittingQuestion = ref(false);
  const recommendedProducts = ref([]);
  const recommendedPageIndex = ref(0);
  const recommendedPageSize = ref(5);
  const timeRemaining = ref(null);
  const countdownTimer = ref(null);

  // 移动设备相关
  const isMobile = ref(window.innerWidth < 768);
  const mobileTipDismissed = ref(localStorage.getItem('product_mobile_tip_dismissed') === 'true');
  const globalLoading = ref(false);
  const loadingMessage = ref('');

  // 监听窗口大小变化
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };

  // 关闭移动设备提示
  const dismissMobileTip = () => {
    mobileTipDismissed.value = true;
    localStorage.setItem('product_mobile_tip_dismissed', 'true');
  };

  // 全局加载状态管理
  const showGlobalLoading = (message = '加载中...') => {
    loadingMessage.value = message;
    globalLoading.value = true;
  };

  const hideGlobalLoading = () => {
    globalLoading.value = false;
  };

  // 计算属性
  const currentImage = computed(() => {
    if (product.value && product.value.images && product.value.images.length > 0) {
      return product.value.images[currentImageIndex.value];
    }
    return '';
  });

  const discountPercentage = computed(() => {
    if (product.value && product.value.originalPrice > product.value.price) {
      return Math.round((1 - product.value.price / product.value.originalPrice) * 100);
    }
    return 0;
  });

  const isStockLow = computed(() => {
    return product.value && product.value.stock > 0 && product.value.stock <= 10;
  });

  const isOutOfStock = computed(() => {
    return product.value && product.value.stock <= 0;
  });

  const validSelectedAttrs = computed(() => {
    if (!product.value || !product.value.attributes) return true;
    
    const requiredAttrs = product.value.attributes.filter(attr => attr.required);
    return requiredAttrs.every(attr => selectedAttrs[attr.name]);
  });

  // 产品链接
  const productLink = computed(() => {
    return `${window.location.origin}/product/${route.params.id}`;
  });

  // 产品推荐分页计算
  const recommendedPages = computed(() => {
    const pages = [];
    for (let i = 0; i < recommendedProducts.value.length; i += recommendedPageSize.value) {
      pages.push(recommendedProducts.value.slice(i, i + recommendedPageSize.value));
    }
    return pages;
  });

  // 获取已选属性文本
  const getSelectedAttrsText = (attrs) => {
    if (!attrs) return '';
    
    return Object.entries(attrs)
      .map(([name, value]) => `${name}: ${value}`)
      .join('，');
  };

  // 分享选项
  const shareOptions = [
    { name: '微信', icon: 'ChatDotRound', type: 'wechat' },
    { name: '微博', icon: 'Promotion', type: 'weibo' },
    { name: 'QQ', icon: 'View', type: 'qq' },
    { name: '链接', icon: 'CopyDocument', type: 'copy' },
  ];

  // 格式化价格
  const formatPrice = (price) => {
    // 添加空值和类型检查
    if (price === undefined || price === null) {
      return '0.00';
    }
    // 确保price是数字
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
      return '0.00';
    }
    return numPrice.toFixed(2);
  };

  // 跳转到商品列表
  const goToProductList = () => {
    router.push('/products');
  };

  // 跳转到商品详情
  const goToProduct = (id) => {
    router.push(`/product/${id}`);
  };

  // 图片查看器函数
  const openImageViewer = (index) => {
    imageViewerIndex.value = index;
    isImageViewerVisible.value = true;
    
    // 禁用背景滚动
    document.body.style.overflow = 'hidden';
  };

  // 监听图片查看器关闭事件
  watch(isImageViewerVisible, (newVal) => {
    if (!newVal) {
      // 恢复背景滚动
      document.body.style.overflow = '';
    }
  });

  // 加入购物车函数
  const addToCart = async () => {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录后再添加商品到购物车');
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
      return;
    }
    
    // 检查属性选择
    const requiredAttrs = product.value.attributes?.filter(attr => attr.required);
    if (requiredAttrs?.some(attr => !selectedAttrs[attr.name])) {
      ElMessage.warning('请选择必要的商品属性');
      return;
    }
    
    isAddingToCart.value = true;
    showGlobalLoading('正在添加到购物车...');
    
    try {
      await cartStore.addToCart({
        productId: product.value.id,
        quantity: quantity.value,
        attributes: selectedAttrs
      });
      
      ElMessage.success({
        message: '成功添加到购物车',
        type: 'success',
        customClass: 'custom-message'
      });
    } catch (error) {
      console.error('添加购物车失败:', error);
      ElMessage.error({
        message: '添加购物车失败，请稍后再试',
        type: 'error',
        customClass: 'custom-message'
      });
    } finally {
      isAddingToCart.value = false;
      hideGlobalLoading();
    }
  };

  // 立即购买函数
  const buyNow = () => {
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录后再购买');
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
      return;
    }
    
    // 检查属性选择
    const requiredAttrs = product.value.attributes?.filter(attr => attr.required);
    if (requiredAttrs?.some(attr => !selectedAttrs[attr.name])) {
      ElMessage.warning('请选择必要的商品属性');
      return;
    }
    
    showGlobalLoading('正在准备购买...');
    
    // 设置购买信息到订单仓库
    orderStore.setBuyNowProduct({
      product: product.value,
      quantity: quantity.value,
      attributes: selectedAttrs
    });
    
    // 延迟执行以显示加载状态
    setTimeout(() => {
      hideGlobalLoading();
      router.push('/checkout?type=buynow');
    }, 800);
  };

  // 分享商品
  const shareProduct = () => {
    isShareDialogVisible.value = true;
  };

  // 处理不同类型的分享
  const handleShare = (type) => {
    switch (type) {
      case 'wechat':
        ElMessage.info('请使用微信扫一扫功能分享');
        break;
      case 'weibo':
        window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(productLink.value)}&title=${encodeURIComponent(product.value?.name || '商品分享')}&pic=${encodeURIComponent(product.value?.images[0])}`);
        break;
      case 'qq':
        window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(productLink.value)}&title=${encodeURIComponent(product.value?.name || '商品分享')}&pics=${encodeURIComponent(product.value?.images[0])}`);
        break;
      default:
        copyProductLink();
    }
    
    isShareDialogVisible.value = false;
  };

  // 复制商品链接
  const copyProductLink = () => {
    navigator.clipboard.writeText(productLink.value)
      .then(() => {
        ElMessage.success('链接已复制到剪贴板');
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制');
      });
  };

  // 联系客服
  const contactCustomerService = () => {
    ElMessageBox.alert(
      '客服热线: 400-123-4567<br>工作时间: 9:00-18:00',
      '联系客服',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '知道了',
      }
    );
  };

  // 显示评价图片
  const showReviewImage = (images, index) => {
    if (!images || !images.length) return;
    
    ElMessageBox.alert(
      `<div class="text-center">
        <img src="${images[index]}" style="max-width: 100%; max-height: 70vh;">
      </div>`,
      '查看图片',
      {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        showClose: true,
        customClass: 'image-preview-dialog',
      }
    );
  };

  // 滚动监听函数
  const handleScroll = () => {
    if (window.scrollY > 600) {
      showFixedBar.value = true;
    } else {
      showFixedBar.value = false;
    }
  };

  // 切换缩放模式
  const toggleZoomMode = () => {
    isZooming.value = !isZooming.value;
  };

  // 处理图片缩放
  const handleImageZoom = (e) => {
    if (!isZooming.value) return;
    
    const img = productImage.value.$el.querySelector('img');
    const lens = zoomLens.value;
    const result = zoomedImage.value;
    
    if (!img || !lens || !result) return;
    
    // 阻止默认行为
    e.preventDefault();
    
    // 获取鼠标位置
    const pos = getCursorPos(e);
    let x = pos.x;
    let y = pos.y;
    
    // 防止镜片超出边界
    const lensWidth = lens.offsetWidth / 2;
    const lensHeight = lens.offsetHeight / 2;
    
    if (x > img.width - lensWidth) { x = img.width - lensWidth; }
    if (x < lensWidth) { x = lensWidth; }
    if (y > img.height - lensHeight) { y = img.height - lensHeight; }
    if (y < lensHeight) { y = lensHeight; }
    
    // 设置镜片位置
    lens.style.left = x - lensWidth + "px";
    lens.style.top = y - lensHeight + "px";
    
    // 设置放大图像
    const cx = result.offsetWidth / lens.offsetWidth;
    const cy = result.offsetHeight / lens.offsetHeight;
    
    result.style.backgroundImage = `url('${currentImage.value}')`;
    result.style.backgroundSize = (img.width * cx) + "px " + (img.height * cy) + "px";
    result.style.backgroundPosition = "-" + ((x * cx) - lensWidth) + "px -" + ((y * cy) - lensHeight) + "px";
  };

  // 获取鼠标位置
  const getCursorPos = (e) => {
    const img = productImage.value.$el.querySelector('img');
    let x = 0, y = 0;
    
    const rect = img.getBoundingClientRect();
    x = e.pageX - rect.left - window.scrollX;
    y = e.pageY - rect.top - window.scrollY;
    
    return { x, y };
  };

  // 360度查看功能
  const open360View = () => {
    ElMessageBox.alert(
      '360度查看功能即将推出，敬请期待！',
      '功能开发中',
      {
        confirmButtonText: '知道了',
        type: 'info',
      }
    );
  };

  // 提交问题函数
  const submitQuestion = () => {
    if (!newQuestion.value.trim()) {
      ElMessage.warning('请输入您的问题');
      return;
    }
    
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录后再提交问题');
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
      return;
    }
    
    isSubmittingQuestion.value = true;
    
    // 模拟提交
    setTimeout(() => {
      isSubmittingQuestion.value = false;
      ElMessage.success('问题提交成功，我们会尽快回复您');
      newQuestion.value = '';
    }, 1000);
  };

  // 推荐产品轮播控制
  const nextRecommended = () => {
    if (recommendedPageIndex.value < recommendedPages.value.length - 1) {
      recommendedPageIndex.value++;
    }
  };

  const prevRecommended = () => {
    if (recommendedPageIndex.value > 0) {
      recommendedPageIndex.value--;
    }
  };

  // 处理评价点赞
  const handleReviewLike = (review) => {
    if (userStore.isLoggedIn) {
      // 模拟点赞操作
      review.isLiked = !review.isLiked;
      review.likeCount = review.isLiked ? (review.likeCount || 0) + 1 : (review.likeCount || 1) - 1;
      ElMessage.success(review.isLiked ? '已点赞该评价' : '已取消点赞');
    } else {
      ElMessage.warning('请先登录后再操作');
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
    }
  };

  // 处理评价回复
  const handleReviewComment = (review) => {
    if (userStore.isLoggedIn) {
      ElMessageBox.prompt('请输入您的回复内容', '回复评价', {
        confirmButtonText: '提交回复',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入回复内容',
        inputPattern: /\S+/,
        inputErrorMessage: '回复内容不能为空'
      }).then(({ value }) => {
        ElMessage.success('回复成功，等待审核');
      }).catch(() => {});
    } else {
      ElMessage.warning('请先登录后再操作');
      router.push('/login?redirect=' + encodeURIComponent(route.fullPath));
    }
  };

  // 获取评价
  const fetchReviews = async () => {
    if (!product.value) return;
    
    reviewLoading.value = true;
    reviewLoadError.value = false;
    
    try {
      // TODO: 实际API调用
      // const res = await getProductReviews({
      //   productId: product.value.id,
      //   page: reviewPage.value,
      //   pageSize: reviewPageSize.value,
      //   filter: reviewFilter.value,
      //   tag: reviewTagFilter.value,
      // });
      
      // 模拟数据
      setTimeout(() => {
        reviews.value = Array(5).fill().map((_, i) => ({
          id: `review-${i}`,
          username: `用户${i + 1}`,
          avatar: `https://randomuser.me/api/portraits/men/${i + 1}.jpg`,
          rating: Math.min(5, Math.max(1, Math.round(Math.random() * 5))),
          content: `这是一条测试评价内容，评价了商品的质量、外观和使用体验等方面。总的来说，这是一个${Math.random() > 0.8 ? '不错' : '很好'}的产品。`,
          createTime: '2023-05-20',
          images: Math.random() > 0.5 ? Array(Math.floor(Math.random() * 3) + 1).fill().map((_, j) => `https://picsum.photos/300/300?random=${i * 3 + j}`) : [],
          productAttrs: { '颜色': '红色', '尺寸': 'L' },
          replyContent: Math.random() > 0.7 ? '感谢您的评价，我们会继续努力提供更好的产品和服务！' : null,
          likeCount: Math.floor(Math.random() * 100),
          isLiked: false,
        }));
        
        reviewTotal.value = 18;
        reviewLoading.value = false;
      }, 800);
    } catch (error) {
      console.error('获取评价失败:', error);
      reviewLoadError.value = true;
      reviewLoading.value = false;
    }
  };

  // 获取相关商品
  const fetchRelatedProducts = async () => {
    relatedProductsLoading.value = true;
    relatedLoadError.value = false;
    
    try {
      // TODO: 实际API调用
      // const res = await getRelatedProducts(product.value.id);
      
      // 模拟数据
      setTimeout(() => {
        relatedProducts.value = Array(5).fill().map((_, i) => ({
          id: i + 100,
          name: `相关商品 ${i + 1}`,
          price: Math.floor(Math.random() * 500) + 50,
          originalPrice: Math.floor(Math.random() * 500) + 250,
          image: `https://picsum.photos/300/300?random=${i+10}`,
          rating: (Math.random() * 2 + 3).toFixed(1),
        }));
        
        relatedProductsLoading.value = false;
      }, 1000);
    } catch (error) {
      console.error('获取相关商品失败:', error);
      relatedLoadError.value = true;
      relatedProductsLoading.value = false;
    }
  };

  // 获取推荐产品
  const fetchRecommendedProducts = () => {
    // 模拟推荐产品数据
    setTimeout(() => {
      recommendedProducts.value = Array(10).fill().map((_, i) => ({
        id: `rec-${i + 1}`,
        name: `推荐商品 ${i + 1}`,
        brief: '推荐商品简介',
        price: Math.floor(Math.random() * 500) + 50,
        originalPrice: Math.floor(Math.random() * 500) + 250,
        image: `https://picsum.photos/300/300?random=${i+30}`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        discount: Math.random() * 0.5 + 0.5,
        isNew: Math.random() > 0.7,
      }));
    }, 1000);
  };

  // 重试获取商品详情
  const retryFetchProductDetail = () => {
    loadError.value = false;
    loading.value = true;
    fetchProductDetail();
  };

  // 重试获取评价
  const retryFetchReviews = () => {
    reviewLoadError.value = false;
    reviewLoading.value = true;
    fetchReviews();
  };

  // 重试获取相关商品
  const retryFetchRelated = () => {
    relatedLoadError.value = false;
    relatedProductsLoading.value = true;
    fetchRelatedProducts();
  };

  // 处理评价分页大小变化
  const handleReviewSizeChange = (size) => {
    reviewPageSize.value = size;
    fetchReviews();
  };

  // 处理评价页码变化
  const handleReviewPageChange = (page) => {
    reviewPage.value = page;
    fetchReviews();
  };

  // 处理评价过滤条件变化
  const handleReviewFilterChange = () => {
    reviewPage.value = 1;
    fetchReviews();
  };

  // 按标签筛选评价
  const filterReviewsByTag = (tag) => {
    reviewTagFilter.value = tag;
    reviewPage.value = 1;
    fetchReviews();
  };

  // 最近浏览记录
  const loadRecentlyViewed = () => {
    try {
      const recentlyViewedStr = localStorage.getItem('recently_viewed');
      if (recentlyViewedStr) {
        recentlyViewed.value = JSON.parse(recentlyViewedStr);
      }
    } catch (e) {
      console.error('解析最近浏览记录失败', e);
      recentlyViewed.value = [];
    }
  };

  // 添加到最近浏览
  const addToRecentlyViewed = (product) => {
    if (!product) return;
    
    const viewed = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
    };
    
    // 移除已存在的相同商品
    const filtered = recentlyViewed.value.filter(item => item.id !== viewed.id);
    
    // 添加到开头
    recentlyViewed.value = [viewed, ...filtered].slice(0, 10);
    
    // 保存到本地存储
    try {
      localStorage.setItem('recently_viewed', JSON.stringify(recentlyViewed.value));
    } catch (e) {
      console.error('保存最近浏览记录失败', e);
    }
  };

  // 计算倒计时
  const calculateTimeRemaining = () => {
    if (!product.value?.promotion?.endTime) return null;
    
    const now = new Date();
    const endTime = new Date(product.value.promotion.endTime);
    const diff = endTime - now;
    
    if (diff <= 0) {
      clearInterval(countdownTimer.value);
      return null;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds };
  };

  // 启动倒计时
  const startCountdown = () => {
    clearInterval(countdownTimer.value);
    timeRemaining.value = calculateTimeRemaining();
    
    if (timeRemaining.value) {
      countdownTimer.value = setInterval(() => {
        timeRemaining.value = calculateTimeRemaining();
        if (!timeRemaining.value) {
          clearInterval(countdownTimer.value);
        }
      }, 1000);
    }
  };

  // 移动触摸相关
  const touchStartX = ref(0);
  const touchEndX = ref(0);
  const minSwipeDistance = 50; // 最小滑动距离，小于这个值不触发切换
  const galleryContainer = ref(null);

  // 处理触摸开始
  const handleTouchStart = (e) => {
    touchStartX.value = e.touches[0].clientX;
  };

  // 处理触摸移动
  const handleTouchMove = (e) => {
    touchEndX.value = e.touches[0].clientX;
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    // 计算滑动距离
    const swipeDistance = touchEndX.value - touchStartX.value;
    
    // 检查是否满足最小滑动距离
    if (Math.abs(swipeDistance) < minSwipeDistance) return;
    
    // 向左滑动，显示下一张图片
    if (swipeDistance < 0 && currentImageIndex.value < (product.value?.images?.length - 1 || 0)) {
      currentImageIndex.value++;
    } 
    // 向右滑动，显示上一张图片
    else if (swipeDistance > 0 && currentImageIndex.value > 0) {
      currentImageIndex.value--;
    }
    
    // 添加滑动动画类
    if (galleryContainer.value) {
      galleryContainer.value.classList.add('gallery-swiped');
      setTimeout(() => {
        galleryContainer.value?.classList.remove('gallery-swiped');
      }, 300);
    }
  };

  // 产品数据获取函数
  const fetchProductDetail = async () => {
    loading.value = true;
    loadError.value = false;
    
    try {
      showGlobalLoading('加载商品信息...');
      const id = route.params.id;
      const response = await getProductDetail(id);
      product.value = response.data;
      
      // 初始化选中的属性
      product.value.attributes?.forEach(attr => {
        if (attr.values.length > 0) {
          selectedAttrs[attr.name] = attr.values[0].id;
        }
      });
      
      // 设置页面标题
      useHead({
        title: `${product.value.name} - 母婴商城`,
        meta: [
          {
            name: 'description',
            content: product.value.brief || `${product.value.name} - 母婴商城官方网站`,
          },
        ],
      });
      
      // 添加到最近浏览
      addToRecentlyViewed(product.value);
      
      // 加载评价和相关商品
      fetchReviews();
      fetchRelatedProducts();
      hideGlobalLoading();
    } catch (error) {
      console.error('获取商品详情失败:', error);
      loadError.value = true;
      ElMessage.error('获取商品详情失败，请稍后再试');
      hideGlobalLoading();
    } finally {
      loading.value = false;
    }
  };

  // 监听产品变化，更新倒计时
  watch(() => product.value, (newProduct) => {
    if (newProduct?.promotion?.endTime) {
      startCountdown();
    } else {
      clearInterval(countdownTimer.value);
      timeRemaining.value = null;
    }
  }, { immediate: true });

  // 监听路由参数变化
  watch(
    () => route.params.id,
    (newId, oldId) => {
      if (!newId) {
        // 如果ID无效，重定向到商品列表页
        console.warn('无效的商品ID, 重定向到商品列表页');
        ElMessage.warning('商品不存在或已下架');
        router.push('/products');
        return;
      }

      if (newId && newId !== oldId) {
        currentImageIndex.value = 0;
        quantity.value = 1;
        reviewFilter.value = 'all';
        reviewPage.value = 1;
        reviewTagFilter.value = '';
        fetchProductDetail();
      }
    },
    { immediate: true } // 立即执行一次
  );

  // 生命周期钩子
  onMounted(() => {
    loadRecentlyViewed();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    fetchRecommendedProducts();
    
    // 显示页面加载状态
    if (!product.value) {
      showGlobalLoading('加载商品信息...');
    }
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
    clearInterval(countdownTimer.value);
    document.body.style.overflow = '';
  });

  return {
    // 状态变量
    loading,
    product,
    currentImageIndex,
    selectedAttrs,
    quantity,
    isAddingToCart,
    isFavoriteLoading,
    isImageViewerVisible,
    recentlyViewed,
    imageViewerIndex,
    isRecentViewedOpen,
    isShareDialogVisible,
    loadError,
    reviewLoadError,
    relatedLoadError,
    reviewLoading,
    reviewFilter,
    reviewPage,
    reviewPageSize,
    reviewTotal,
    reviews,
    reviewTagFilter,
    relatedProductsLoading,
    relatedProducts,
    isZooming,
    productImage,
    zoomLens,
    zoomedImage,
    showFixedBar,
    newQuestion,
    isSubmittingQuestion,
    recommendedProducts,
    recommendedPageIndex,
    recommendedPageSize,
    timeRemaining,
    isMobile,
    mobileTipDismissed,
    globalLoading,
    loadingMessage,
    touchStartX,
    touchEndX,
    galleryContainer,
    
    // 计算属性
    currentImage,
    discountPercentage,
    isStockLow,
    isOutOfStock,
    validSelectedAttrs,
    productLink,
    recommendedPages,
    
    // 共享变量
    shareOptions,
    
    // 方法
    handleResize,
    dismissMobileTip,
    showGlobalLoading,
    hideGlobalLoading,
    getSelectedAttrsText,
    formatPrice,
    goToProductList,
    goToProduct,
    openImageViewer,
    addToCart,
    buyNow,
    shareProduct,
    handleShare,
    copyProductLink,
    contactCustomerService,
    showReviewImage,
    toggleZoomMode,
    handleImageZoom,
    getCursorPos,
    open360View,
    submitQuestion,
    nextRecommended,
    prevRecommended,
    handleReviewLike,
    handleReviewComment,
    fetchReviews,
    fetchRelatedProducts,
    fetchRecommendedProducts,
    retryFetchProductDetail,
    retryFetchReviews,
    retryFetchRelated,
    handleReviewSizeChange,
    handleReviewPageChange,
    handleReviewFilterChange,
    filterReviewsByTag,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // 图标引用
    ShoppingCart,
    Star,
    Picture,
    Check,
    Ship,
    RefreshRight,
    MessageBox,
    Share,
    ChatDotRound,
    Back,
    View,
    Sort,
    Download,
    ShoppingBag,
    Discount,
    Timer,
    Promotion,
    Warning,
    MoreFilled,
    ArrowRight,
    CopyDocument,
    ZoomIn,
    Location,
    Van,
    ArrowLeft,
    QuestionFilled,
    CloseBold,
  };
}
