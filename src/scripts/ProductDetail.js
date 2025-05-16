import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useCartStore } from '@/stores/cart'
import { useFavoriteStore } from '@/stores/favorite'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductDetail, getRecommendedProducts, getProductDetailWithParams } from '@/api/product'
import { addToCart as addToCartApi } from '@/api/cart'

export const useProductDetail = () => {
  const route = useRoute()
  const router = useRouter()
  const store = useStore()
  const cartStore = useCartStore()
  const favoriteStore = useFavoriteStore()

  const loading = ref(true)
  const product = ref(null)
  const quantity = ref(1)
  const activeTab = ref('detail')
  const selectedSpecs = reactive({})
  const comments = ref([])
  const mainImage = ref('')
  const detailPictures = ref([])
  const descPictures = ref([])
  const imagesLoading = ref(true)
  const loadedImages = ref(0)
  const previewImages = ref([])
  
  // 添加悬浮栏相关状态
  const showFloatingBar = ref(false)
  const detailPosition = ref(0)
  const isFavorite = computed(() => {
    const productId = product.value?.goodsId || product.value?.goodsID
    return favoriteStore.isFavorite(productId)
  })
  const isMobileView = ref(false)

  // 购物车弹窗相关状态
  const cartPopupVisible = ref(false)
  const cartPopupProduct = ref({})

  // 店铺评分
  const shopRating = ref(5)

  // 用户头像和评论图片
  const userAvatar = ref('https://joeschmoe.io/api/v1/random')
  const commentImages = ref([
    'https://img.alicdn.com/imgextra/i4/2073383406/O1CN01D89oBr1PpIfEd1CJ3_!!2073383406.jpg',
    'https://img.alicdn.com/imgextra/i3/2073383406/O1CN01nMvyPK1PpIfAc2a7k_!!2073383406.jpg',
    'https://img.alicdn.com/imgextra/i4/2073383406/O1CN01HYIHBH1PpIfEd1F5T_!!2073383406.jpg'

  ])

  // 商品参数信息
  const productParams = ref([])

  // 获取商品所有图片
  const productImages = computed(() => {
    if (!product.value?.goodsID) return []
    if (product.value.pictures && product.value.pictures.length > 0) {
      return product.value.pictures.map(pic => pic.pictureUrl)
    }
    // 没有图片时使用默认图片
    const id = String(product.value.goodsID).padStart(2, '0')
    return Array.from({ length: 3 }, (_, i) => `goods${id}_${i + 1}.jpg`)
  })

  // 获取图片URL
  const getImageUrl = (filename) => {
    if (!filename) return '/src/assets/img/products/default.jpg';
    
    // 打印接收到的文件名
    console.log('处理图片URL, 接收到的filename:', filename);
    
    // 如果是完整URL，直接返回
    if (filename.startsWith('http')) return filename;
    
    // 将路径中的反斜杠转换为正斜杠
    if (filename.includes('\\')) {
      filename = filename.replace(/\\/g, '/');
    }
    
    // 标准化文件名：如果是"goods24.jpg"这样的格式
    const goodsPattern = /^goods(\d+)\.jpg$/i;
    const goodsMatch = filename.match(goodsPattern);
    if (goodsMatch) {
      // 已经是standard命名的图片，确保路径正确
      return `/products/${filename}`;
    }
    
    // 从文件名中提取商品ID
    const extractIdPattern = /(\d+)/;
    const idMatch = filename.match(extractIdPattern);
    if (idMatch) {
      const goodsId = idMatch[1];
      // 构建标准格式的文件名
      return `/products/goods${goodsId}.jpg`;
    }
    
    // 如果路径不以/开头并且不包含/products/，添加前缀
    if (!filename.startsWith('/') && !filename.includes('/products/')) {
      filename = `/products/${filename}`;
    }
    
    // 记录最终返回的URL
    console.log('最终返回的图片URL:', filename);
    
    return filename;
  }

  // 切换主图
  const changeMainImage = (img) => {
    mainImage.value = img
  }

  // 处理图片加载错误
  const handleImageError = () => {
    loadedImages.value++
    checkAllImagesLoaded()
  }

  // 处理图片加载完成
  const handleImageLoad = () => {
    loadedImages.value++
    checkAllImagesLoaded()
  }

  // 检查所有图片是否加载完成
  const checkAllImagesLoaded = () => {
    const totalImages = detailPictures.value.length + descPictures.value.length
    if (loadedImages.value >= totalImages) {
      imagesLoading.value = false
    }
  }

  // 添加到购物车
  const addToCart = async () => {
    if (!product.value) return
    
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录后再添加商品到购物车')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    // 检查是否选择了必要的规格 - 如果商品有规格才检查
    if (product.value.specs && Array.isArray(product.value.specs) && product.value.specs.length > 0) {
      if (!checkSpecSelected()) {
        ElMessage.warning('请选择完整的商品规格')
        return
      }
    }
    
    // 检查购买数量是否合法
    if (!quantity.value || quantity.value < 1) {
      ElMessage.warning('购买数量必须大于0')
      quantity.value = 1
      return
    }
    
    // 检查是否超出库存
    if (product.value.stock && quantity.value > product.value.stock) {
      ElMessage.warning(`当前库存仅剩${product.value.stock}件`)
      quantity.value = product.value.stock
      return
    }
    
    try {
      // 检查商品ID是否存在
      if (!product.value.goodsID && !product.value.goodsId) {
        console.error('商品ID不存在', product.value);
        ElMessage.error('商品信息不完整，无法添加到购物车');
        return;
      }
      
      console.log('准备添加到购物车的商品：', product.value);
      
      // 将商品详情保存到本地存储，供添加购物车时使用
      try {
        const productId = product.value.goodsID || product.value.goodsId;
        const productDetails = JSON.parse(localStorage.getItem('productDetails') || '{}');
        productDetails[productId] = {
          goodsId: productId,
          goodsName: product.value.goods_name || product.value.goodsName,
          goodsImg: product.value.goods_img || product.value.goodsImg || mainImage.value,
          priceNew: product.value.price_new || product.value.priceNew,
          priceOld: product.value.price_old || product.value.priceOld,
          // 保存更多商品信息
          stock: product.value.stock,
          category: product.value.category,
          brand: product.value.brand
        };
        localStorage.setItem('productDetails', JSON.stringify(productDetails));
      } catch (e) {
        console.error('保存商品详情到本地存储失败:', e);
      }
      
      // 获取已选规格信息 - 安全调用
      let selectedSpecsText = '';
      try {
        selectedSpecsText = getSelectedSpecsText();
        console.log('已选规格:', selectedSpecsText);
      } catch (e) {
        console.error('获取规格文本失败:', e);
      }
      
      // 构建购物车请求数据，使用后端期望的参数名
      const cartData = {
        productId: parseInt(product.value.goodsID || product.value.goodsId),
        quantity: parseInt(quantity.value) || 1,
        selected: 1
      }
      
      // 处理规格数据：将规格字符串转换为Map对象
      if (selectedSpecsText) {
        try {
          // 将"尺寸:100cm(3-4岁);颜色:红色"格式转换为Map对象
          const specsMap = {};
          selectedSpecsText.split(';').forEach(item => {
            const [key, value] = item.split(':');
            if (key && value) {
              specsMap[key.trim()] = value.trim();
            }
          });
          
          // 只有在有规格数据时才添加specs字段
          if (Object.keys(specsMap).length > 0) {
            cartData.specs = specsMap;
          }
        } catch (e) {
          console.error('规格数据转换失败:', e);
        }
      }
      
      console.log('发送购物车数据：', cartData);
      
      // 显示加载状态
      loading.value = true;
      
      // 尝试发送请求，带错误处理
      let res;
      try {
        res = await addToCartApi(cartData);
      } catch (error) {
        console.error('API调用失败，使用本地备份:', error);
        
        // 针对不同错误类型提供更详细的错误处理
        let errorMessage = '添加购物车失败，使用本地备份';
        
        // 检查是否有响应体
        if (error.response) {
          // 服务器返回了错误状态码
          const status = error.response.status;
          const responseData = error.response.data;
          
          // 记录详细错误信息
          console.error(`服务器响应错误: 状态码=${status}, 消息=${responseData?.message || '无消息'}`);
          
          if (status === 500) {
            errorMessage = '服务器内部错误，可能是参数格式不匹配';
            
            // 针对系统繁忙的特定错误
            if (responseData?.message?.includes('系统繁忙')) {
              errorMessage = '系统繁忙，请稍后重试';
            }
          } else if (status === 400) {
            errorMessage = '请求参数错误';
            
            // 检查是否有具体的错误信息
            if (responseData?.message) {
              errorMessage = responseData.message;
            }
          } else if (status === 401) {
            errorMessage = '请先登录后再操作';
            // 可能需要跳转到登录页面
            router.push('/login?redirect=' + encodeURIComponent(router.currentRoute.value.fullPath));
            return; // 中断后续操作
          }
        } else if (error.request) {
          // 请求发出但没有收到响应
          errorMessage = '网络请求超时，请检查网络连接';
        } else {
          // 在请求设置时发生错误
          errorMessage = `请求错误: ${error.message}`;
        }
        
        // 显示错误消息
        ElMessage.error(errorMessage);
        
        // 处理特定的规格格式错误
        if (error instanceof SyntaxError && error.message.includes("Unexpected token")) {
          console.log('规格格式错误，尝试使用简单字符串方式处理');
          // 无需转换，直接使用原始字符串
        }
        
        // 使用本地备份逻辑处理
        res = {
          code: 200, 
          message: errorMessage,
          data: false
        };
        
        // 手动添加到本地购物车
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const existingItemIndex = localCart.findIndex(item => {
          // 基本ID匹配
          if (item.id != cartData.productId) return false;
          
          // 如果两者都没有规格，则认为是同一商品
          if (!item.specs && !cartData.specs) return true;
          
          // 如果一个有规格一个没有，则不是同一商品
          if ((!item.specs && cartData.specs) || (item.specs && !cartData.specs)) return false;
          
          // 比较规格字符串
          return item.specs === cartData.specs;
        });
        
        if (existingItemIndex >= 0) {
          localCart[existingItemIndex].quantity += cartData.quantity;
        } else {
          localCart.push({
            id: cartData.productId,
            name: product.value.goods_name || product.value.goodsName,
            image: product.value.goods_img || product.value.goodsImg || '/src/assets/img/default.jpg',
            price: product.value.price_new || product.value.priceNew,
            quantity: cartData.quantity,
            specs: cartData.specs,
            selected: true,
            addTime: new Date().toISOString()
          });
        }
        
        localStorage.setItem('localCart', JSON.stringify(localCart));
        
        // 更新购物车数量
        const cartCount = localCart.length;
        localStorage.setItem('cartCount', cartCount.toString());
        
        // 触发购物车更新事件
        try {
          window.dispatchEvent(new CustomEvent('cart:updated', { 
            detail: { action: 'add', item: cartData }
          }));
        } catch (e) {
          console.warn('触发购物车更新事件失败:', e);
        }
      }
      
      if (res && res.code === 200) {
        // 播放动画或其他UI反馈
        ElMessage.success(res.message || '已成功添加到购物车')
        
        // 使用Pinia的cartStore更新购物车状态
        try {
          // 刷新购物车数据
          if (cartStore) {
            await cartStore.getCartItems()
          }
        } catch (e) {
          console.error('更新购物车状态失败:', e)
        }
        
        // 显示购物车弹窗
        cartPopupProduct.value = {
          id: product.value.goodsID || product.value.goodsId,
          name: product.value.goods_name || product.value.goodsName,
          image: getImageUrl(product.value.goods_img || product.value.goodsImg),
          price: product.value.price_new || product.value.priceNew,
          quantity: parseInt(quantity.value) || 1,
          specs: selectedSpecsText || ''
        }
        cartPopupVisible.value = true
        
        // 触发购物车小球动画
        triggerCartAnimation()
      } else {
        ElMessage.error(res?.message || '添加到购物车失败')
      }
    } catch (error) {
      console.error('添加到购物车出错:', error)
      ElMessage.error('添加到购物车失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  // 获取已选规格文本
  const getSelectedSpecsText = () => {
    if (!product.value || !product.value.specs) {
      return '';
    }
    
    // 确保selectedSpecs.value是对象
    if (!selectedSpecs || typeof selectedSpecs !== 'object') {
      console.warn('规格选择为空');
      return '';
    }
    
    const texts = [];
    
    // 检查是否为响应式对象
    const specsObj = selectedSpecs.value || selectedSpecs;
    
    // 确保是非空对象再进行遍历
    if (specsObj && typeof specsObj === 'object') {
      Object.keys(specsObj).forEach(key => {
        const specType = product.value.specs.find(s => s.name === key);
        if (specType) {
          const selectedValue = specType.values.find(v => v.id === specsObj[key] || v === specsObj[key]);
          if (selectedValue) {
            texts.push(`${key}:${selectedValue.name || selectedValue}`);
          }
        }
      });
    }
    
    return texts.join(';');
  }

  // 触发购物车动画
  const triggerCartAnimation = () => {
    // 这里可以实现购物车动画
    const cartEl = document.querySelector('.cart-icon');
    if (cartEl && addButton.value) {
      try {
        // 简单的购物车数量更新
        const oldCount = parseInt(localStorage.getItem('cartCount') || '0');
        const newCount = oldCount + (parseInt(quantity.value) || 1);
        localStorage.setItem('cartCount', newCount.toString());
        
        // 通知其他组件购物车已更新
        if (window.eventBus) {
          window.eventBus.emit('cart-count-updated', newCount);
        }
      } catch(e) {
        console.error('无法更新购物车计数:', e);
      }
    }
  }

  // 立即购买
  const buyNow = () => {
    if (!product.value) return
    
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录后再购买商品')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    try {
      // 检查规格是否已选择(如果有规格需要选择)
      if (!checkSpecSelected()) {
        return
      }
      
      // 清除其他可能影响结算页面的数据
      localStorage.removeItem('checkoutItems')
      
      // 构建购物项，包含更完整的商品信息
      const orderItem = {
        id: product.value.goodsID || product.value.goodsId || product.value.id,
        goodsId: product.value.goodsID || product.value.goodsId || product.value.id,
        productId: product.value.goodsID || product.value.goodsId || product.value.id, 
        name: product.value.goods_name || product.value.goodsName || product.value.name,
        goodsName: product.value.goods_name || product.value.goodsName || product.value.name,
        price: parseFloat(product.value.price_new || product.value.priceNew || product.value.price).toFixed(2),
        unitPrice: parseFloat(product.value.price_new || product.value.priceNew || product.value.price).toFixed(2),
        image: product.value.goods_img || product.value.goodsImg || product.value.image,
        goodsImg: product.value.goods_img || product.value.goodsImg || product.value.image,
        quantity: parseInt(quantity.value) || 1,
        count: parseInt(quantity.value) || 1,
        spec: getSelectedSpecsText() || '',
        specs: getSelectedSpecsText() || '',
        // 添加额外信息以帮助结算页面处理
        fromSource: 'buyNow',
        timestamp: Date.now() // 添加时间戳防止缓存问题
      }
      
      console.log('立即购买商品信息:', orderItem)
      
      // 保存到本地存储，用于结算页面获取
      localStorage.setItem('buyNow', JSON.stringify(orderItem))
      
      // 同时保存到orderProductsMap用于订单列表和详情显示
      try {
        const orderProductsMap = JSON.parse(localStorage.getItem('orderProductsMap') || '{}')
        const tempOrderId = 'temp_buy_now_' + Date.now()
        orderProductsMap[tempOrderId] = [orderItem]
        localStorage.setItem('orderProductsMap', JSON.stringify(orderProductsMap))
      } catch (e) {
        console.error('保存订单商品信息到本地存储失败:', e)
      }
      
      // 跳转到结算页面
      router.push('/checkout')
    } catch (error) {
      console.error('立即购买失败:', error)
      ElMessage.error('立即购买失败: ' + (error.message || '未知错误'))
    }
  }

  // 检查规格是否已选择
  const checkSpecSelected = () => {
    if (!product.value?.specs) return true

    const unselectedSpecs = product.value.specs.filter(
      spec => !selectedSpecs[spec.name]
    )

    if (unselectedSpecs.length) {
      ElMessage.warning(`请选择${unselectedSpecs[0].name}`)
      return false
    }

    return true
  }

  // 获取商品详情
  const fetchProductDetail = async () => {
    loading.value = true;
    try {
      console.log(`获取商品详情，ID: ${route.params.id}`);
      
      // 优先使用详情API获取商品详情和参数信息
      const response = await getProductDetail(route.params.id);
      
      if (response && response.code === 200 && response.data) {
        console.log('获取到商品详情数据:', response.data);
        
        // 添加商品状态检查
        if (response.data.productStatus !== '上架') {
          console.warn(`商品${route.params.id}状态为: ${response.data.productStatus || '未知状态'}, 库存: ${response.data.stock || 0}`);
          ElMessage.warning(`该商品${response.data.productStatus === '下架' ? '已下架' : '状态异常'}`);
        }
        
        // 检查关键属性是否存在
        if (!response.data.productName || !response.data.priceNew) {
          console.warn('商品关键属性缺失:', {
            id: response.data.productId,
            name: response.data.productName,
            price: response.data.priceNew,
            status: response.data.productStatus
          });
        }

        // 设置商品数据
        product.value = response.data;
        
        // 添加前端商品ID兼容处理
        if (product.value && product.value.productId && !product.value.goodsId) {
          product.value.goodsId = product.value.productId;
          product.value.goodsName = product.value.productName;
          product.value.goodsImg = product.value.productImg;
          console.log('添加前端兼容字段:', {
            goodsId: product.value.goodsId,
            goodsName: product.value.goodsName,
            goodsImg: product.value.goodsImg
          });
        }
        
        // 处理商品图片
        handleProductImages();
        
        // 初始化规格选择
        initSelectedSpecs();
        
        // 获取评论
        fetchComments();
        
        // 获取商品参数（直接调用，无需条件判断）
        fetchProductParams();
      } else {
        console.error('获取商品详情失败', {
          responseCode: response?.code,
          responseMsg: response?.message,
          responseData: !!response?.data
        });
        ElMessage.error(response?.message || '获取商品详情失败');
        product.value = null;
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      ElMessage.error(error.message || '获取商品详情失败');
      product.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取商品参数
  const fetchProductParams = async () => {
    try {
      const paramsResponse = await getProductDetailWithParams(route.params.id);
      if (paramsResponse && paramsResponse.code === 200 && paramsResponse.data) {
        console.log('获取到商品参数数据:', paramsResponse.data);
        
        // 设置商品参数
        productParams.value = paramsResponse.data.params || [];
        
        // 处理商品规格数据
        if (paramsResponse.data.specs && Array.isArray(paramsResponse.data.specs)) {
          handleProductSpecs(paramsResponse.data.specs);
        } else if (paramsResponse.data.specsList && Array.isArray(paramsResponse.data.specsList)) {
          handleProductSpecs(paramsResponse.data.specsList);
        } else {
          console.warn('未找到有效的商品规格数据');
        }
      } else {
        console.error('获取商品参数失败', paramsResponse);
      }
    } catch (error) {
      console.error('获取商品参数失败:', error);
    }
  };

  // 处理商品规格数据
  const handleProductSpecs = (specs) => {
    if (!specs || !Array.isArray(specs) || specs.length === 0) {
      console.log('未找到规格数据');
      return;
    }
    
    try {
      console.log('处理商品规格数据:', specs);
      
      // 确保product.value存在
      if (!product.value) return;
      
      // 转换规格数据为前端需要的格式
      product.value.specs = specs.map(spec => {
        return {
          name: spec.specName || spec.name,
          values: parseSpecValues(spec.specValues || spec.values || [])
        };
      });
      
      console.log('处理后的规格数据:', product.value.specs);
    } catch (error) {
      console.error('处理规格数据出错:', error);
    }
  };
  
  // 解析规格值（可能是JSON字符串或者已经是对象数组）
  const parseSpecValues = (values) => {
    if (typeof values === 'string') {
      try {
        return JSON.parse(values);
      } catch (e) {
        console.error('规格值JSON解析失败:', e);
        return [values]; // 如果解析失败，将字符串作为单个值返回
      }
    } else if (Array.isArray(values)) {
      return values;
    } else {
      return [];
    }
  };

  // 初始化规格选择
  const initSelectedSpecs = () => {
    if (!product.value) return;
    
    // 商品规格处理
    if (product.value.specs && Array.isArray(product.value.specs) && product.value.specs.length > 0) {
      // 规格已存在，仅初始化选择
      product.value.specs.forEach(spec => {
        if (spec.values && spec.values.length > 0) {
          const firstValue = spec.values[0];
          selectedSpecs[spec.name] = firstValue.id || firstValue;
        }
      });
      console.log('已选择规格初始值:', selectedSpecs);
    } else if (product.value.specList && Array.isArray(product.value.specList) && product.value.specList.length > 0) {
      // 转换规格数据格式
      product.value.specs = product.value.specList.map(spec => ({
        name: spec.specName || spec.name,
        values: spec.valueList || spec.values || []
      }));
      
      // 初始化选择
      product.value.specs.forEach(spec => {
        if (spec.values && spec.values.length > 0) {
          const firstValue = spec.values[0];
          selectedSpecs[spec.name] = firstValue.id || firstValue;
        }
      });
      console.log('从specList初始化的规格:', product.value.specs);
    } else {
      // 添加默认规格
      product.value.specs = [
        {
          name: '规格',
          values: ['默认']
        }
      ];
      selectedSpecs.规格 = '默认';
      console.log('使用默认规格');
    }
  };

  // 生成模拟商品数据
  const generateMockProductData = (id) => {
    const productId = String(id);
    const mockNames = {
      '1': '婴儿奶粉1段（0-6个月）',
      '2': '婴儿奶粉2段（6-12个月）',
      '3': '婴儿奶粉3段（1-3岁）',
      '4': '婴儿纸尿裤S码（3-8kg）',
      '5': '婴儿纸尿裤M码（6-11kg）',
      '6': '婴儿营养辅食套装',
      '7': '婴儿洗护套装',
      '8': '婴儿玩具套装',
      '9': '婴儿推车',
      '10': '婴儿床'
    };
    
    const name = mockNames[productId] || `母婴商品${productId}`;
    
    return {
      goodsID: productId,
      goodsId: productId,
      goods_name: name,
      goodsName: name,
      goods_detail: `这是${name}的详细描述，适合宝宝使用。`,
      goodsDetail: `这是${name}的详细描述，适合宝宝使用。`,
      goods_img: `goods${productId}.jpg`,
      goodsImg: `goods${productId}.jpg`,
      price_new: 199 + parseInt(productId) * 30,
      priceNew: 199 + parseInt(productId) * 30,
      price_old: 299 + parseInt(productId) * 30,
      priceOld: 299 + parseInt(productId) * 30,
      stock: 100,
      sales: 50 + parseInt(productId) * 10,
      rating: 4.5,
      review_count: 10 + parseInt(productId) * 5,
      reviewCount: 10 + parseInt(productId) * 5,
      categoryId: parseInt(productId) % 5 + 1,
      category_id: parseInt(productId) % 5 + 1,
      description: `这是${name}的详细描述，本产品质量优良，适合0-3岁宝宝使用。`,
      specs: [
        {
          name: '规格',
          values: ['默认']
        }
      ],
      params: [
        { name: '品牌', value: '母婴商城' },
        { name: '产地', value: '中国' },
        { name: '适用年龄', value: '0-3岁' },
        { name: '保质期', value: '24个月' }
      ],
      tags: ['热销', '新品', '推荐']
    };
  }

  // 关闭购物车弹窗
  const closeCartPopup = () => {
    cartPopupVisible.value = false
  }

  // 滚动到评论区域
  const scrollToComments = () => {
    // 如果使用了新的布局，则滚动到评论区域的元素
    const commentsElement = document.getElementById('product-comments')
    if (commentsElement) {
      // 平滑滚动到评论区域
      commentsElement.scrollIntoView({ behavior: 'smooth' })
      return
    }
    
    // 旧的布局方式（兼容）
    activeTab.value = 'comments' // 切换到评论标签页
    
    // 获取评论区域的元素
    const detailTabsElement = document.querySelector('.detail-tabs')
    if (detailTabsElement) {
      // 平滑滚动到评论区域
      detailTabsElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // 添加处理滚动的函数
  const handleScroll = () => {
    // 如果组件未挂载或已销毁，不处理
    if (!window || !document) return

    try {
      // 计算滚动位置
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      
      // 当页面滚动超过商品图片区域时显示悬浮栏（大约400px）
      const shouldShow = scrollTop > 400
      
      // 只有在状态需要变化时才更新，避免频繁重渲染
      if (showFloatingBar.value !== shouldShow) {
        showFloatingBar.value = shouldShow
      }
      
      // 检测屏幕宽度，判断是否为移动视图
      isMobileView.value = window.innerWidth < 1200
    } catch (error) {
      console.error('滚动处理出错:', error)
    }
  }
  
  // 添加返回顶部功能
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
  
  // 添加切换收藏状态功能
  const toggleFavorite = async () => {
    if (!product.value) {
      console.error('无法切换收藏状态：product对象为空')
      return
    }
    
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.warning('请先登录后再收藏商品')
      router.push({
        path: '/login',
        query: { redirect: router.currentRoute.value.fullPath }
      })
      return
    }
    
    try {
      // 确保能正确获取商品ID
      const productId = product.value.goodsId || product.value.goodsID || product.value.id
      if (!productId) {
        console.error('无法获取有效的商品ID，商品信息:', product.value)
        ElMessage.error('商品信息不完整，无法操作收藏功能')
        return
      }
      
      console.log('准备切换收藏状态', {
        productId,
        isCurrentlyFavorite: isFavorite.value,
        product: {
          goodsId: product.value.goodsId,
          goodsID: product.value.goodsID,
          id: product.value.id
        }
      })
      
      // 提前显示视觉反馈，提高用户体验
      const originalStatus = isFavorite.value
      
      // 确保收藏store已初始化
      if (!favoriteStore.initialized) {
        await favoriteStore.initFavorites()
      }
      
      // 调用store的toggleFavorite方法
      const success = await favoriteStore.toggleFavorite(productId)
      console.log('收藏状态切换结果:', success ? '成功' : '失败')
      
      if (success) {
        ElMessage.success(originalStatus ? '已取消收藏' : '收藏成功')
      } else {
        ElMessage.error(originalStatus ? '取消收藏失败' : '收藏失败')
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }

  // 检查商品是否已收藏 - 保留此方法以兼容之前的调用，但内部使用store
  const checkProductFavorite = async () => {
    if (!product.value) return
    
    // 确保收藏状态已初始化
    if (!favoriteStore.initialized) {
      await favoriteStore.initFavorites()
    }
  }

  // 添加窗口大小变化处理函数
  const handleResize = () => {
    if (typeof window !== 'undefined') {
      isMobileView.value = window.innerWidth < 1200
    }
  }

  onMounted(() => {
    fetchProductDetail()
    
    // 添加滚动监听
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleResize) // 添加窗口大小变化监听
      
      // 初始化收藏状态
      favoriteStore.initFavorites()
      
      // 初次加载时检测一次屏幕宽度
      handleResize()
      
      // 初次加载时触发一次检查
      handleScroll()
    }
  })
  
  // 添加组件卸载时的清理操作
  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize) // 移除窗口大小变化监听
    }
  })

  // 格式化商品参数显示
  const formatParamValue = (param) => {
    if (!param) return '';
    
    let value = param.paramValue || '';
    if (param.paramUnit) {
      value += param.paramUnit;
    }
    
    return value;
  };

  // 处理商品图片
  const handleProductImages = () => {
    if (!product.value) {
      console.warn('处理商品图片失败: 商品数据为空');
      return;
    }
    
    try {
      // 检查商品状态
      if (product.value.productStatus !== '上架' && product.value.productStatus !== undefined) {
        console.warn(`商品图片处理 - 商品状态: ${product.value.productStatus}`);
      }
      
      // 设置商品主图
      const mainImgSrc = product.value.goodsImg || product.value.productImg || product.value.goods_img;
      if (!mainImgSrc) {
        console.warn('商品主图URL不存在');
      }
      mainImage.value = getImageUrl(mainImgSrc);
      console.log('设置商品主图:', mainImage.value);
      
      // 收集商品的所有图片，包括主图和其他展示图
      let pictures = [];
      
      // 添加主图
      pictures.push({
        pictureId: 'main',
        image: mainImgSrc,
        imageType: 'main',
        url: getImageUrl(mainImgSrc)
      });
      
      // 如果存在图片列表，添加到Pictures中
      if (product.value.images && Array.isArray(product.value.images) && product.value.images.length > 0) {
        console.log(`商品有${product.value.images.length}张图片`);
        pictures = pictures.concat(product.value.images.map(pic => {
          // 确保图片URL存在
          if (!pic.url && pic.pictureUrl) {
            pic.url = pic.pictureUrl;
          }
          // 如果URL不是完整URL，则添加正确的路径前缀
          if (pic.url && !pic.url.startsWith('http')) {
            pic.url = `/products/${pic.url}`;
          }
          return pic;
        }));
      } else {
        console.warn('商品没有额外图片列表');
        // 没有图片列表时，生成额外的商品图片
        const productId = String(product.value.goodsId || product.value.productId || product.value.goodsID).padStart(2, '0');
        // 添加额外的商品图片作为轮播图
        for (let i = 1; i <= 3; i++) {
          const additionalImg = {
            pictureId: `goods${productId}_${i}`,
            image: `goods${productId}_${i}.jpg`,
            imageType: 'goods',
            url: `/products/goods${productId}_${i}.jpg`
          };
          pictures.push(additionalImg);
        }
      }
      
      // 生成详情图片 - 根据商品ID加载对应的详情图片
      const productId = String(product.value.goodsId || product.value.productId || product.value.goodsID).padStart(2, '0'); // 补齐2位
      console.log(`尝试加载商品ID ${productId} 的详情图片`);
      
      const descImages = [];
      
      // 固定生成6张详情图片 - 根据目录中的实际命名格式
      for (let i = 1; i <= 6; i++) {
        // 格式为 desc_xx_xx.jpg，例如 desc_01_01.jpg
        const imgNum = String(i).padStart(2, '0');
        const descImg = {
          pictureId: `desc_${productId}_${imgNum}`,
          image: `desc_${productId}_${imgNum}.jpg`,
          imageType: 'detail',
          url: `/details/desc_${productId}_${imgNum}.jpg`
        };
        descImages.push(descImg);
        console.log(`添加详情图片:`, descImg.url);
      }
      
      // 将详情图片添加到图片集合中
      pictures = pictures.concat(descImages);
      
      // 设置图片数据 - 确保只有6张详情图片
      detailPictures.value = descImages;
      
      // 设置预览图片URL列表
      previewImages.value = pictures.map(pic => pic.url || getImageUrl(pic.image));
      
      console.log("详情图片设置完成，共", detailPictures.value.length, "张图片");
      console.log("所有产品图片数量：", pictures.length);
    } catch (error) {
      console.error('处理商品图片时出错:', error);
      ElMessage.warning('加载商品图片时出现问题，请刷新页面重试');
    }
  };

  // 获取评论信息
  const fetchComments = () => {
    // 模拟获取评论数据
    if (!comments.value || comments.value.length === 0) {
      comments.value = [
        {
          id: 1,
          userName: '用户评价',
          userAvatar: '',
          rating: 5,
          content: '非常好的商品，宝宝很喜欢！',
          createTime: '2025-03-15'
        }
      ];
    }
  };

  return {
    loading,
    product,
    quantity,
    activeTab,
    selectedSpecs,
    comments,
    mainImage,
    detailPictures,
    descPictures,
    imagesLoading,
    productImages,
    previewImages,
    getImageUrl,
    changeMainImage,
    handleImageError,
    handleImageLoad,
    addToCart,
    buyNow,
    cartPopupVisible,
    cartPopupProduct,
    closeCartPopup,
    showFloatingBar,
    scrollToTop,
    scrollToComments,
    handleScroll,
    isFavorite,
    toggleFavorite,
    shopRating,
    userAvatar,
    commentImages,
    isMobileView,
    productParams,
    formatParamValue,
  }
}