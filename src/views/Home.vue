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
      banners: [
        {
          id: 1,
          title: '妈妈的选择，宝宝的呵护',
          description: '严选全球优质母婴用品，为宝宝提供最好的呵护',
          image: '/banners/banner1.jpg',
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
          image: '/banners/banner2.jpg',
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
          image: '/banners/banner3.jpg',
          btnText: '了解更多',
          btnType: 'accent',
          link: '/products/nutrition',
          titleAnimation: 'fadeInScale',
          descAnimation: 'fadeInScale',
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
        backgroundImage: '/banners/promotion-bg.jpg',
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
      // 这里应该实现真实的登录状态检查逻辑
      // 示例代码：
      const token = localStorage.getItem('user_token');
      this.isLoggedIn = !!token;
    },
    loadHomeData() {
      // 加载首页所需的各种数据
      // 在实际应用中，这里应该调用API获取数据
      
      // 加载推荐数据示例
      this.loadRecommendations();
    },
    loadRecommendations() {
      // 加载个性化推荐数据
      this.isRecommendationsLoading = true;
      
      // 模拟API请求延迟
      setTimeout(() => {
        // 这里应该是真实的API调用
        this.isRecommendationsLoading = false;
        // 使用组件默认数据
      }, 1000);
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


