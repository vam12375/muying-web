<template>
  <div class="product-detail-page">
    <main-layout>
      <div class="container mx-auto py-8 px-4">
        <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
          <el-skeleton :rows="10" animated />
        </div>
        
        <div v-else-if="!product" class="text-center py-12">
          <el-empty description="商品不存在或已下架"></el-empty>
          <el-button class="mt-4" type="primary" @click="goToProductList">返回商品列表</el-button>
        </div>
        
        <template v-else>
          <!-- 面包屑导航 -->
          <div class="breadcrumb mb-6">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item :to="{ path: '/products' }">全部商品</el-breadcrumb-item>
              <el-breadcrumb-item :to="{ path: `/products?category=${product.category.id}` }">
                {{ product.category.name }}
              </el-breadcrumb-item>
              <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="product-main bg-white rounded-lg shadow-md p-6 mb-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- 产品图片区 -->
              <div class="product-gallery">
                <div class="main-image mb-4 border rounded-lg overflow-hidden relative">
                  <el-image
                    :src="currentImage"
                    fit="contain"
                    :preview-src-list="product.images"
                    :initial-index="currentImageIndex"
                    class="w-full"
                    style="height: 400px"
                  >
                    <template #error>
                      <div class="flex justify-center items-center h-full bg-gray-100">
                        <el-icon><Picture /></el-icon>
                        <span class="ml-2">加载失败</span>
                      </div>
                    </template>
                  </el-image>
                  
                  <div class="absolute top-4 left-4 z-10">
                    <el-tag v-if="product.isNew" type="success" effect="dark" class="mr-2">新品</el-tag>
                    <el-tag v-if="product.discount > 0" type="danger" effect="dark">{{ formatDiscount(product.discount) }}折</el-tag>
                  </div>
                </div>
                
                <div class="thumbnails-list flex gap-2 overflow-x-auto">
                  <div
                    v-for="(image, index) in product.images"
                    :key="index"
                    class="thumbnail-item cursor-pointer border rounded min-w-[80px] h-[80px] overflow-hidden"
                    :class="{ 'border-primary border-2': currentImageIndex === index }"
                    @click="setCurrentImage(index)"
                  >
                    <el-image :src="image" fit="cover" class="w-full h-full" />
                  </div>
                </div>
              </div>
              
              <!-- 产品信息区 -->
              <div class="product-info flex flex-col">
                <h1 class="text-2xl font-bold mb-2">{{ product.name }}</h1>
                
                <div class="product-brief text-gray-500 mb-4">{{ product.brief }}</div>
                
                <div class="product-price-box mb-6 bg-gray-50 p-4 rounded-lg">
                  <div class="flex items-baseline mb-2">
                    <span class="text-lg font-bold text-primary">¥{{ formatPrice(product.price) }}</span>
                    <span v-if="product.originalPrice > product.price" class="text-gray-400 line-through ml-3">
                      ¥{{ formatPrice(product.originalPrice) }}
                    </span>
                  </div>
                  
                  <div class="flex flex-wrap gap-4 text-sm">
                    <div class="sales-count text-gray-500">
                      <span>销量: {{ product.salesCount }}</span>
                    </div>
                    <div class="reviews text-gray-500 flex items-center">
                      <span>评价: {{ product.reviewCount }}</span>
                      <div class="ml-1">
                        <el-rate
                          v-model="product.rating"
                          disabled
                          text-color="#ff9900"
                          :score-template="product.rating + '分'"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- 商品属性选择 -->
                <div class="product-attrs mb-6">
                  <div v-for="(attr, index) in product.attributes" :key="index" class="attr-group mb-4">
                    <div class="attr-name text-gray-700 mb-2">{{ attr.name }}</div>
                    <div class="attr-values flex flex-wrap gap-2">
                      <el-radio-group v-model="selectedAttrs[attr.name]">
                        <el-radio-button 
                          v-for="value in attr.values" 
                          :key="value.id" 
                          :label="value.id"
                          class="mb-2"
                        >
                          {{ value.name }}
                        </el-radio-button>
                      </el-radio-group>
                    </div>
                  </div>
                </div>
                
                <!-- 购买数量 -->
                <div class="product-quantity flex items-center mb-6">
                  <div class="text-gray-700 mr-4">购买数量</div>
                  <el-input-number 
                    v-model="quantity" 
                    :min="1" 
                    :max="product.stock"
                  />
                  <div class="text-gray-500 ml-4">库存 {{ product.stock }} 件</div>
                </div>
                
                <!-- 购买按钮 -->
                <div class="product-actions flex gap-4 mt-auto">
                  <el-button 
                    type="primary" 
                    size="large" 
                    :icon="ShoppingCart"
                    :disabled="product.stock <= 0"
                    @click="addToCart"
                  >
                    加入购物车
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="large"
                    :disabled="product.stock <= 0"
                    @click="buyNow"
                  >
                    立即购买
                  </el-button>
                  <el-button
                    :icon="Star"
                    size="large"
                    :type="product.isFavorite ? 'warning' : ''"
                    @click="toggleFavorite"
                  >
                    {{ product.isFavorite ? '已收藏' : '收藏' }}
                  </el-button>
                </div>
                
                <!-- 服务承诺 -->
                <div class="product-services mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
                  <div class="service-item flex items-center">
                    <el-icon class="mr-1"><Check /></el-icon>
                    <span>正品保证</span>
                  </div>
                  <div class="service-item flex items-center">
                    <el-icon class="mr-1"><Ship /></el-icon>
                    <span>全场包邮</span>
                  </div>
                  <div class="service-item flex items-center">
                    <el-icon class="mr-1"><RefreshRight /></el-icon>
                    <span>7天无理由退换</span>
                  </div>
                  <div class="service-item flex items-center">
                    <el-icon class="mr-1"><MessageBox /></el-icon>
                    <span>售后服务保障</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 商品详情和评价 tabs -->
          <div class="product-tabs bg-white rounded-lg shadow-md">
            <el-tabs type="border-card">
              <el-tab-pane label="商品详情">
                <div class="p-6">
                  <h3 class="text-xl font-bold mb-4">商品参数</h3>
                  <div class="specs-table mb-8">
                    <el-descriptions :column="2" border>
                      <el-descriptions-item v-for="(spec, index) in product.specifications" :key="index" :label="spec.name">
                        {{ spec.value }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                  
                  <h3 class="text-xl font-bold mb-4">商品详情</h3>
                  <div class="rich-text-content" v-html="product.description"></div>
                </div>
              </el-tab-pane>
              
              <el-tab-pane :label="`商品评价(${product.reviewCount})`">
                <div class="p-6">
                  <div class="review-summary flex items-center mb-6">
                    <div class="review-stats text-center pr-8 border-r">
                      <div class="text-3xl font-bold text-primary">{{ product.rating.toFixed(1) }}</div>
                      <div class="text-sm text-gray-500">综合评分</div>
                      <div class="mt-2">
                        <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
                      </div>
                    </div>
                    
                    <div class="review-tags flex-1 ml-8">
                      <div class="text-gray-700 mb-2">大家都在说：</div>
                      <div class="tag-cloud flex flex-wrap gap-2">
                        <el-tag 
                          v-for="(tag, index) in reviewTags" 
                          :key="index"
                          :type="tag.type"
                          effect="plain"
                          class="cursor-pointer"
                          @click="filterReviewsByTag(tag.name)"
                        >
                          {{ tag.name }} ({{ tag.count }})
                        </el-tag>
                      </div>
                    </div>
                  </div>
                  
                  <div class="reviews-filter mb-4">
                    <el-radio-group v-model="reviewFilter" size="small" @change="handleReviewFilterChange">
                      <el-radio-button label="all">全部评价</el-radio-button>
                      <el-radio-button label="good">好评</el-radio-button>
                      <el-radio-button label="neutral">中评</el-radio-button>
                      <el-radio-button label="bad">差评</el-radio-button>
                      <el-radio-button label="hasImage">有图</el-radio-button>
                    </el-radio-group>
                  </div>
                  
                  <div v-if="reviews.length === 0" class="py-8 text-center">
                    <el-empty description="暂无相关评价"></el-empty>
                  </div>
                  
                  <div v-else class="reviews-list divide-y">
                    <div 
                      v-for="(review, index) in reviews" 
                      :key="index"
                      class="review-item py-6"
                    >
                      <div class="review-header flex justify-between mb-3">
                        <div class="user-info flex items-center">
                          <el-avatar :size="40" :src="review.avatar"></el-avatar>
                          <div class="ml-3">
                            <div class="user-name text-gray-800">{{ review.username }}</div>
                            <div class="review-time text-gray-400 text-sm">{{ review.createTime }}</div>
                          </div>
                        </div>
                        <div class="review-rating">
                          <el-rate v-model="review.rating" disabled text-color="#ff9900" />
                        </div>
                      </div>
                      
                      <div class="review-attrs text-sm text-gray-500 mb-3">
                        {{ getSelectedAttrsText(review.productAttrs) }}
                      </div>
                      
                      <div class="review-content text-gray-700 mb-4">
                        {{ review.content }}
                      </div>
                      
                      <div v-if="review.images && review.images.length > 0" class="review-images flex gap-2 mb-4">
                        <div 
                          v-for="(img, imgIndex) in review.images" 
                          :key="imgIndex"
                          class="review-image-item w-24 h-24 cursor-pointer overflow-hidden rounded"
                          @click="showReviewImage(review.images, imgIndex)"
                        >
                          <el-image :src="img" fit="cover" class="w-full h-full" />
                        </div>
                      </div>
                      
                      <div v-if="review.replyContent" class="shop-reply bg-gray-50 p-3 rounded text-sm">
                        <div class="font-medium text-gray-800 mb-1">商家回复：</div>
                        <div class="text-gray-600">{{ review.replyContent }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="pagination-container mt-6 flex justify-center">
                    <el-pagination
                      v-model:current-page="reviewPage"
                      v-model:page-size="reviewPageSize"
                      :page-sizes="[5, 10, 20]"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="reviewTotal"
                      @size-change="handleReviewSizeChange"
                      @current-change="handleReviewPageChange"
                    />
                  </div>
                </div>
              </el-tab-pane>
            </el-tabs>
          </div>
          
          <!-- 相关推荐 -->
          <div class="related-products mt-8">
            <h3 class="text-xl font-bold mb-4">相关推荐</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <product-card
                v-for="(item, index) in relatedProducts"
                :key="index"
                :product="item"
              />
            </div>
          </div>
        </template>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ShoppingCart, Star, Picture, Check, Ship, RefreshRight, MessageBox } from '@element-plus/icons-vue';
import ProductCard from '@/components/product/ProductCard.vue';

const route = useRoute();
const router = useRouter();

// 状态变量
const loading = ref(true);
const product = ref(null);
const currentImageIndex = ref(0);
const selectedAttrs = reactive({});
const quantity = ref(1);

// 评价相关状态
const reviewFilter = ref('all');
const reviewPage = ref(1);
const reviewPageSize = ref(10);
const reviewTotal = ref(0);
const reviews = ref([]);

// 计算属性
const currentImage = computed(() => {
  if (product.value && product.value.images && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value];
  }
  return '';
});

// 相关推荐商品
const relatedProducts = ref([]);

// 评价标签
const reviewTags = ref([
  { name: '质量好', count: 42, type: '' },
  { name: '包装精美', count: 31, type: 'success' },
  { name: '物流快', count: 28, type: 'info' },
  { name: '性价比高', count: 26, type: 'warning' },
  { name: '服务好', count: 24, type: 'danger' },
  { name: '材质柔软', count: 18, type: 'info' },
  { name: '使用方便', count: 15, type: '' },
  { name: '尺寸合适', count: 12, type: 'success' }
]);

// 方法
const setCurrentImage = (index) => {
  currentImageIndex.value = index;
};

const formatPrice = (price) => {
  return price.toFixed(2);
};

const formatDiscount = (discount) => {
  return (discount * 10).toFixed(0);
};

const getSelectedAttrsText = (attrs) => {
  if (!attrs) return '';
  const attrTexts = [];
  for (const key in attrs) {
    attrTexts.push(`${key}: ${attrs[key]}`);
  }
  return attrTexts.join(' / ');
};

const goToProductList = () => {
  router.push('/products');
};

// 添加到购物车
const addToCart = () => {
  // 检查是否选择了所有必选属性
  if (!validateSelectedAttrs()) {
    return;
  }
  
  // 模拟添加到购物车的API调用
  setTimeout(() => {
    ElMessage.success('已成功加入购物车');
  }, 300);
};

// 立即购买
const buyNow = () => {
  // 检查是否选择了所有必选属性
  if (!validateSelectedAttrs()) {
    return;
  }
  
  // 模拟跳转到结算页
  router.push({
    path: '/checkout',
    query: {
      productId: product.value.id,
      quantity: quantity.value,
      attrs: JSON.stringify(selectedAttrs)
    }
  });
};

// 验证是否选择了所有必选属性
const validateSelectedAttrs = () => {
  if (!product.value || !product.value.attributes) return true;
  
  const requiredAttrs = product.value.attributes.filter(attr => attr.required);
  let valid = true;
  
  requiredAttrs.forEach(attr => {
    if (!selectedAttrs[attr.name]) {
      ElMessage.warning(`请选择${attr.name}`);
      valid = false;
    }
  });
  
  return valid;
};

// 切换收藏状态
const toggleFavorite = () => {
  if (!product.value) return;
  
  product.value.isFavorite = !product.value.isFavorite;
  
  ElMessage({
    type: 'success',
    message: product.value.isFavorite ? '已添加到收藏' : '已取消收藏'
  });
};

// 显示评价图片
const showReviewImage = (images, index) => {
  const imgViewer = new ElImageViewer({
    urlList: images,
    initialIndex: index
  });
  imgViewer.show();
};

// 筛选评价
const handleReviewFilterChange = () => {
  reviewPage.value = 1;
  fetchReviews();
};

// 按标签筛选评价
const filterReviewsByTag = (tagName) => {
  // 这里可以实现按标签筛选评价的逻辑
  ElMessage.info(`按"${tagName}"标签筛选评价功能开发中`);
};

// 评价分页事件处理
const handleReviewSizeChange = (size) => {
  reviewPageSize.value = size;
  fetchReviews();
};

const handleReviewPageChange = (page) => {
  reviewPage.value = page;
  fetchReviews();
};

// 获取商品详情
const fetchProductDetail = async () => {
  loading.value = true;
  try {
    const productId = route.params.id;
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟商品数据
    const productData = {
      id: 1001,
      name: '多功能婴儿推车轻便折叠',
      brief: '德国工艺，品质保障，30秒一键收车，承重40kg',
      price: 1299.00,
      originalPrice: 1599.00,
      discount: 0.8,
      stock: 86,
      salesCount: 1250,
      reviewCount: 352,
      rating: 4.8,
      isNew: true,
      isFavorite: false,
      category: {
        id: 3,
        name: '婴儿推车'
      },
      images: [
        '/images/product_detail_1.jpg',
        '/images/product_detail_2.jpg',
        '/images/product_detail_3.jpg',
        '/images/product_detail_4.jpg',
        '/images/product_detail_5.jpg'
      ],
      attributes: [
        {
          name: '颜色',
          required: true,
          values: [
            { id: 101, name: '星空蓝' },
            { id: 102, name: '高贵紫' },
            { id: 103, name: '典雅灰' }
          ]
        },
        {
          name: '款式',
          required: true,
          values: [
            { id: 201, name: '基础款' },
            { id: 202, name: '豪华款' },
            { id: 203, name: '至尊款' }
          ]
        }
      ],
      specifications: [
        { name: '品牌', value: '贝塔儿童用品' },
        { name: '产地', value: '德国' },
        { name: '适用年龄', value: '0-3岁' },
        { name: '产品重量', value: '6.5kg' },
        { name: '产品尺寸', value: '长85cm×宽60cm×高105cm' },
        { name: '折叠尺寸', value: '长80cm×宽30cm×高25cm' },
        { name: '最大承重', value: '40kg' },
        { name: '材质', value: '铝合金车架，牛津布坐垫' },
        { name: '认证', value: 'CCC认证、3C认证、EN1888' }
      ],
      description: `
        <div class="product-description">
          <h4>产品介绍</h4>
          <p>多功能婴儿推车，采用优质铝合金材质，轻便易携带，折叠后体积小，方便收纳和携带。推车配有五点式安全带，保证宝宝的安全。前轮可360度旋转，后轮带刹车装置，操作灵活安全。</p>
          
          <h4>产品特点</h4>
          <ul>
            <li>轻量化设计，仅重6.5kg，妈妈轻松提起</li>
            <li>30秒一键折叠，折叠后可直立站立</li>
            <li>加宽加厚座椅，宝宝乘坐更舒适</li>
            <li>座椅靠背可调节，满足宝宝各种乘坐姿势需求</li>
            <li>大容量储物篮，轻松装下宝宝所需物品</li>
            <li>高弹性减震系统，保证宝宝乘坐的舒适度</li>
            <li>UV50+顶篷，有效隔离紫外线，保护宝宝娇嫩肌肤</li>
          </ul>
          
          <h4>购买须知</h4>
          <p>1. 本产品支持7天无理由退换，但需保持产品完好无损，不影响二次销售。</p>
          <p>2. 产品颜色可能因显示器设置或光线等因素与实物略有差异，请以实物为准。</p>
          <p>3. 产品自签收之日起，提供一年的保修服务。</p>
        </div>
      `
    };
    
    product.value = productData;
    
    // 默认选择第一个属性值
    product.value.attributes.forEach(attr => {
      if (attr.values && attr.values.length > 0) {
        selectedAttrs[attr.name] = attr.values[0].id;
      }
    });
    
    // 获取评价和相关推荐
    fetchReviews();
    fetchRelatedProducts();
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取商品评价
const fetchReviews = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 模拟评价数据
    const mockReviews = [
      {
        id: 1,
        username: '华华',
        avatar: '/images/avatar1.jpg',
        rating: 5,
        content: '质量非常好，推车很轻便，宝宝坐着也很舒服，一键收车特别方便，强烈推荐给其他宝妈！',
        createTime: '2023-05-10',
        productAttrs: { '颜色': '星空蓝', '款式': '豪华款' },
        images: ['/images/review1.jpg', '/images/review2.jpg'],
        replyContent: '感谢您的购买和好评，祝宝宝健康成长！'
      },
      {
        id: 2,
        username: '小鱼儿',
        avatar: '/images/avatar2.jpg',
        rating: 4,
        content: '推车整体很满意，做工精细，就是折叠后还是有点重，我一个人提着有点费力。',
        createTime: '2023-05-05',
        productAttrs: { '颜色': '典雅灰', '款式': '基础款' },
        images: [],
        replyContent: ''
      },
      {
        id: 3,
        username: '阳光妈妈',
        avatar: '/images/avatar3.jpg',
        rating: 5,
        content: '已经是第二次购买了，这次是送给妹妹的，质量和操作都很好，妹妹很喜欢！',
        createTime: '2023-04-28',
        productAttrs: { '颜色': '高贵紫', '款式': '至尊款' },
        images: ['/images/review3.jpg'],
        replyContent: '感谢您的再次购买和支持！'
      },
      {
        id: 4,
        username: '糖糖妈',
        avatar: '/images/avatar4.jpg',
        rating: 3,
        content: '推车基本功能都不错，就是座椅靠背调节不是很顺滑，有时候调节起来有点费劲。',
        createTime: '2023-04-22',
        productAttrs: { '颜色': '星空蓝', '款式': '基础款' },
        images: [],
        replyContent: '您好，非常抱歉带来不好的体验。关于座椅靠背调节问题，可能是锁扣有些紧，您可以先按下调节按钮再尝试调节，或联系客服为您解决。'
      },
      {
        id: 5,
        username: '小豆包',
        avatar: '/images/avatar5.jpg',
        rating: 5,
        content: '物流超级快，包装也很好，推车颜色和图片一样漂亮，宝宝很喜欢，一键折叠确实很方便！',
        createTime: '2023-04-15',
        productAttrs: { '颜色': '典雅灰', '款式': '豪华款' },
        images: ['/images/review4.jpg', '/images/review5.jpg'],
        replyContent: ''
      }
    ];
    
    // 根据筛选条件过滤评价
    let filteredReviews = [...mockReviews];
    
    // 根据评分筛选
    if (reviewFilter.value !== 'all') {
      switch (reviewFilter.value) {
        case 'good':
          filteredReviews = filteredReviews.filter(review => review.rating >= 4);
          break;
        case 'neutral':
          filteredReviews = filteredReviews.filter(review => review.rating === 3);
          break;
        case 'bad':
          filteredReviews = filteredReviews.filter(review => review.rating <= 2);
          break;
        case 'hasImage':
          filteredReviews = filteredReviews.filter(review => review.images && review.images.length > 0);
          break;
      }
    }
    
    reviewTotal.value = filteredReviews.length;
    
    // 分页
    const start = (reviewPage.value - 1) * reviewPageSize.value;
    const end = start + reviewPageSize.value;
    reviews.value = filteredReviews.slice(start, end);
  } catch (error) {
    console.error('获取商品评价失败:', error);
  }
};

// 获取相关推荐商品
const fetchRelatedProducts = async () => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 模拟相关推荐商品数据
    relatedProducts.value = [
      {
        id: 1002,
        name: '婴儿推车专用雨罩',
        price: 69.00,
        originalPrice: 99.00,
        image: '/images/related1.jpg',
        discount: 0.7,
        isNew: false,
        rating: 4.7
      },
      {
        id: 1003,
        name: '多功能婴儿车置物袋',
        price: 49.00,
        originalPrice: 69.00,
        image: '/images/related2.jpg',
        discount: 0.7,
        isNew: true,
        rating: 4.6
      },
      {
        id: 1004,
        name: '婴儿推车专用蚊帐',
        price: 39.00,
        originalPrice: 59.00,
        image: '/images/related3.jpg',
        discount: 0.7,
        isNew: false,
        rating: 4.8
      },
      {
        id: 1005,
        name: '婴儿推车保暖脚套',
        price: 89.00,
        originalPrice: 129.00,
        image: '/images/related4.jpg',
        discount: 0.7,
        isNew: false,
        rating: 4.9
      },
      {
        id: 1006,
        name: '婴儿车遮阳伞',
        price: 59.00,
        originalPrice: 89.00,
        image: '/images/related5.jpg',
        discount: 0.7,
        isNew: true,
        rating: 4.5
      }
    ];
  } catch (error) {
    console.error('获取相关推荐商品失败:', error);
  }
};

// 生命周期钩子
onMounted(() => {
  fetchProductDetail();
});
</script>

<style scoped>
.product-detail-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.text-primary {
  color: #f27c8d;
}

.border-primary {
  border-color: #f27c8d;
}

.product-brief {
  color: #666;
  font-size: 0.95rem;
}

.rich-text-content {
  color: #333;
  line-height: 1.8;
}

.rich-text-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.5rem 0 0.8rem;
  color: #333;
}

.rich-text-content p {
  margin-bottom: 1rem;
}

.rich-text-content ul {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.rich-text-content li {
  margin-bottom: 0.5rem;
  position: relative;
}

.review-item:first-child {
  border-top: none;
}

.review-item:last-child {
  border-bottom: none;
}

/* 评价图片悬停效果 */
.review-image-item {
  transition: transform 0.2s ease;
}

.review-image-item:hover {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .review-summary {
    flex-direction: column;
  }
  
  .review-stats {
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    width: 100%;
  }
  
  .review-tags {
    margin-left: 0;
    margin-top: 1rem;
  }
}
</style> 
