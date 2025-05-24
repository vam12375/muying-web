<template>
  <div class="home-page">
    <!-- 顶部轮播Banner区域 -->
    <HeroSection :banners="banners" bannerHeight="550px" />
    
    <!-- 分类导航区域 -->
    <CategoryNav :categories="categories" />
    
    <!-- 精选商品区域 -->
    <FeaturedProducts :products="featuredProducts" @add-to-cart="addToCart" @toggle-wishlist="toggleWishlist" />
    
    <!-- 促销横幅区域 -->
    <PromotionBanner 
      :title="promotionData.title"
      :subtitle="promotionData.subtitle"
      :description="promotionData.description"
      :badge="promotionData.badge"
      :buttonText="promotionData.buttonText"
      :buttonLink="promotionData.buttonLink"
      :backgroundImage="promotionData.backgroundImage"
      :countdown="true"
      :countdownEndDate="promotionData.countdownEndDate"
    />
    
    <!-- 新品上市区域 -->
    <NewArrivals :products="newArrivals" />
    
    <!-- 品牌展示区域 -->
    <BrandShowcase :brands="brands" />
    
    <!-- 个性化推荐区域 -->
    <RecommendedForYou 
      :title="isLoggedIn ? '为您推荐' : '猜你喜欢'"
      :isLoggedIn="isLoggedIn"
      :recommendations="recommendations"
      :isLoading="isRecommendationsLoading"
      @add-to-cart="addToCart" 
      @toggle-wishlist="toggleWishlist"
    />
  </div>
</template>

<script>
import HeroSection from '@/components/home/HeroSection.vue';
import CategoryNav from '@/components/home/CategoryNav.vue';
import FeaturedProducts from '@/components/home/FeaturedProducts.vue';
import PromotionBanner from '@/components/home/PromotionBanner.vue';
import NewArrivals from '@/components/home/NewArrivals.vue';
import BrandShowcase from '@/components/home/BrandShowcase.vue';
import RecommendedForYou from '@/components/home/RecommendedForYou.vue';
import { ElMessage } from 'element-plus';
import { getProductList, getHotProducts, getNewProducts, getRecommendedProducts } from '@/api/product';
import { useUserStore } from '@/stores/user';

export default {
  name: 'HomePage',
  components: {
    HeroSection,
    CategoryNav,
    FeaturedProducts,
    PromotionBanner,
    NewArrivals,
    BrandShowcase,
    RecommendedForYou
  },
  data() {
    return {
      isLoggedIn: false, // 根据实际认证状态修改
      isRecommendationsLoading: false,
      isLoading: {
        featuredProducts: false,
        newArrivals: false,
        recommendations: false
      },
      banners: [
        {
          id: 1,
          title: '妈妈的选择，宝宝的呵护',
          description: '严选全球优质母婴用品，为宝宝提供最好的呵护',
          image: '/banners/banner1.png',
          btnText: '立即选购',
          btnType: 'primary',
          link: '/products/baby-care',
          titleAnimation: 'fadeInDown',
          descAnimation: 'fadeInUp',
          btnAnimation: 'fadeInUp'
        },
        {
          id: 2,
          title: '初春上新，温暖出行',
          description: '精选婴幼儿春季新款服饰，舒适保暖又时尚',
          image: '/banners/banner2.png',
          btnText: '查看详情',
          btnType: 'secondary',
          link: '/products/baby-clothes',
          titleAnimation: 'fadeInLeft',
          descAnimation: 'fadeInRight',
          btnAnimation: 'fadeInUp'
        },
        {
          id: 3,
          title: '科学营养，健康成长',
          description: '来自全球的优质辅食和营养品，助力宝宝健康成长',
          image: '/banners/banner3.png',
          btnText: '了解更多',
          btnType: 'accent',
          link: '/products/nutrition',
          titleAnimation: 'fadeInScale',
          descAnimation: 'fadeInScale',
          btnAnimation: 'fadeInUp'
        },
        {
          id: 4,
          title: '智能育儿，科技陪伴',
          description: '前沿科技产品，让育儿更轻松更智能',
          image: '/banners/banner4.png',
          btnText: '探索科技',
          btnType: 'primary',
          link: '/products/tech',
          titleAnimation: 'fadeInRight',
          descAnimation: 'fadeInLeft',
          btnAnimation: 'fadeInUp'
        }
      ],
      categories: [], // 分类数据，使用组件默认值
      featuredProducts: [], // 精选商品数据，使用组件默认值
      promotionData: {
        title: '婴幼儿用品节',
        subtitle: 'BABY PRODUCTS FESTIVAL',
        description: '全场婴幼儿用品满300减50，满500减100，更有精选套装低至5折',
        badge: '限时特惠',
        buttonText: '立即抢购',
        buttonLink: '/promotion/baby-festival',
        backgroundImage: '/banners/banner5.png',
        countdownEndDate: (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 7);
          return endDate.toISOString();
        })()
      },
      newArrivals: [], // 新品数据，使用组件默认值
      brands: [], // 品牌数据，使用组件默认值
      recommendations: [] // 推荐数据，使用组件默认值
    };
  },
  created() {
    // 检查用户登录状态
    this.checkLoginStatus();
    
    // 加载数据
    this.loadHomeData();
  },
  methods: {
    checkLoginStatus() {
      // 使用Pinia userStore获取登录状态
      const userStore = useUserStore();
      this.isLoggedIn = userStore.isLoggedIn;
      
      // 监听登录状态变化，主要用于调试
      console.log('Home页面检测到用户登录状态:', this.isLoggedIn);
    },
    loadHomeData() {
      // 加载首页所需的各种数据
      this.loadFeaturedProducts();
      this.loadNewArrivals();
      this.loadRecommendations();
    },
    async loadFeaturedProducts() {
      this.isLoading.featuredProducts = true;
      
      try {
        // 获取商品列表，每页20条，随机展示
        const params = {
          page: 1,
          size: 20,
          isRecommend: true // 获取推荐商品
        };
        
        const res = await getProductList(params);
        
        if (res.code === 200 && res.data && res.data.records) {
          // 将商品数据转换为组件所需格式
          const products = res.data.records.map(item => ({
            id: item.productId,
            name: item.productName,
            shortDesc: item.productDetail ? 
              (item.productDetail.length > 50 ? item.productDetail.substring(0, 50) + '...' : item.productDetail) : 
              '暂无描述',
            image: item.productImg ? 
              (item.productImg.startsWith('/') ? item.productImg : `/${item.productImg}`) : 
              '/images/product-placeholder.jpg',
            price: item.priceNew || 0,
            originalPrice: item.priceOld || null,
            discount: item.priceOld && item.priceNew ? 
              Math.round((1 - item.priceNew / item.priceOld) * 100) : null,
            isNew: item.isNew === 1,
            rating: item.rating || 4.5,
            ratingCount: item.reviewCount || 0,
            category: item.categoryId,
            tags: this.generateTags(item),
            inWishlist: false // 默认未收藏
          }));
          
          // 随机打乱商品顺序
          this.featuredProducts = this.shuffleArray(products).slice(0, 8);
        } else {
          console.error('获取精选商品失败:', res.message || '未知错误');
        }
      } catch (error) {
        console.error('获取精选商品出错:', error);
      } finally {
        this.isLoading.featuredProducts = false;
      }
    },
    generateTags(product) {
      const tags = [];
      if (product.isNew === 1) tags.push('new');
      if (product.priceOld && product.priceNew && product.priceNew < product.priceOld) tags.push('sale');
      if (product.isHot === 1) tags.push('popular');
      if (product.isRecommend === 1 && tags.length === 0) tags.push('popular'); // 如果是推荐商品但没有其他标签，默认为热门
      return tags;
    },
    shuffleArray(array) {
      // Fisher-Yates 洗牌算法
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },
    loadNewArrivals() {
      // 加载新品上市数据
      this.isLoading.newArrivals = true;
      
      // 这里应该是真实的API调用
      // 示例: getNewProducts(8).then(res => { this.newArrivals = res.data; })
      
      // 模拟API请求延迟
      setTimeout(() => {
        this.isLoading.newArrivals = false;
        // 使用组件默认数据
      }, 1000);
    },
    loadRecommendations() {
      // 加载个性化推荐数据
      this.isRecommendationsLoading = true;
      
      // 准备查询参数
      const params = {
        limit: 12, // 增加获取的数量，以便随机选择
        userId: localStorage.getItem('userId') || undefined, // 获取用户ID
        type: this.isLoggedIn ? 'personalized' : 'popular', // 已登录用户获取个性化推荐，否则获取热门推荐
        timestamp: Date.now(), // 添加时间戳，防止API缓存结果
        random: Math.random().toString(36).substring(2,7) // 添加随机字符串，确保每次请求都不同
      };
      
      // 调用API获取推荐数据
      getRecommendedProducts(params)
        .then(res => {
          if (res.code === 200 && res.data) {
            // 将API返回的数据转换为组件需要的格式
            const recommendations = res.data.map(item => ({
              id: item.productId,
              name: item.productName,
              description: item.productDetail ? 
                (item.productDetail.length > 50 ? item.productDetail.substring(0, 50) + '...' : item.productDetail) : 
                '暂无描述',
              image: item.productImg ? 
                (item.productImg.startsWith('/') ? item.productImg : `/${item.productImg}`) : 
                '/images/product-placeholder.jpg',
              price: item.priceNew || 0,
              originalPrice: item.priceOld || null,
              discount: item.priceOld && item.priceNew ? 
                Math.round((1 - item.priceNew / item.priceOld) * 100) : null,
              rating: item.rating || 4.5,
              matchPercent: item.matchScore || this.generateRandomMatchScore(), // 使用API返回的匹配分数或随机生成
              tags: this.generateRecommendTags(item),
              inWishlist: item.isFavorite === 1 // 是否已收藏
            }));
            
            // 对推荐数据进行随机排序，确保每次刷新页面呈现不同的顺序
            const shuffledRecommendations = this.shuffleArray(recommendations);
            
            // 只取前6个推荐，避免显示过多
            const limitedRecommendations = shuffledRecommendations.slice(0, 6);
            
            // 更新推荐数据
            this.recommendations = limitedRecommendations;
            console.log(`获取到个性化推荐数据: 原始${recommendations.length}条，随机选取${limitedRecommendations.length}条`);
          } else {
            console.warn('获取推荐数据失败:', res.message || '未知错误');
            // 使用空数组，让组件使用默认数据
            this.recommendations = [];
          }
        })
        .catch(error => {
          console.error('获取推荐数据出错:', error);
          // 使用空数组，让组件使用默认数据
          this.recommendations = [];
          
          // 只有在用户登录状态下才显示错误提示
          if (this.isLoggedIn) {
            ElMessage({
              message: '获取个性化推荐失败，将显示默认推荐',
              type: 'warning',
              duration: 3000
            });
          }
        })
        .finally(() => {
          this.isRecommendationsLoading = false;
        });
    },
    
    // 为推荐商品生成标签
    generateRecommendTags(product) {
      let tags = [];
      
      // 转换API返回的标签为组件需要的格式
      if (product.tags && Array.isArray(product.tags)) {
        tags = product.tags.map(tag => ({
          id: tag.id || tag.name,
          name: tag.name,
          type: tag.type || 'default'
        }));
      } else {
        // 根据商品属性生成标签
        if (this.isLoggedIn) {
          tags.push({ id: 'for_you', name: '为您推荐', type: 'primary' });
        }
        
        if (product.isNew === 1) {
          tags.push({ id: 'new', name: '新品', type: 'success' });
        }
        
        if (product.priceOld && product.priceNew && product.priceNew < product.priceOld) {
          tags.push({ id: 'sale', name: '特惠', type: 'danger' });
        }
        
        if (product.isHot === 1) {
          tags.push({ id: 'hot', name: '热门', type: 'warning' });
        }
        
        if (product.isRecommend === 1 && tags.length === 0) {
          tags.push({ id: 'popular', name: '热门', type: 'info' });
        }
      }
      
      return tags;
    },
    
    // 生成随机匹配度（仅在API未返回匹配度时使用）
    generateRandomMatchScore() {
      // 对登录用户生成较高的匹配度
      const minScore = this.isLoggedIn ? 85 : 70;
      return Math.floor(Math.random() * (100 - minScore) + minScore);
    },
    addToCart(product) {
      // 添加到购物车的逻辑
      console.log('添加到购物车:', product);
      
      // 这里应该实现真实的添加购物车逻辑
      // 例如调用store的action:
      // this.$store.dispatch('cart/addItem', product);
      
      // 显示成功提示
      ElMessage({
        message: `已将 ${product.name} 加入购物车`,
        type: 'success'
      });
    },
    toggleWishlist(product) {
      // 切换收藏状态
      console.log('切换收藏状态:', product);
      
      // 这里应该实现真实的收藏逻辑
      // 例如调用store的action:
      // this.$store.dispatch('wishlist/toggleItem', product);
      
      // 显示提示
      const action = product.inWishlist ? '移出' : '加入';
      ElMessage({
        message: `已${action}收藏`,
        type: 'success'
      });
    }
  }
};
</script>

<style lang="scss">
@import '@/styles/variables.scss';
@import '@/styles/animations.scss';

.home-page {
  width: 100%;
  overflow-x: hidden;
  
  // 页面交叉处理，防止组件间有间隙
  section + section {
    margin-top: -1px;
  }
  
  // 为可能处于页面顶部的组件添加页面顶部空间
  section:first-child {
    margin-top: $spacing-6;
    
    @media (max-width: $breakpoint-md) {
      margin-top: $spacing-4;
    }
  }
  
  // 为可能处于页面底部的组件添加页面底部空间
  section:last-child {
    margin-bottom: $spacing-12;
    
    @media (max-width: $breakpoint-md) {
      margin-bottom: $spacing-8;
    }
  }
}
</style>


