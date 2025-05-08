<template>
  <div class="home-page">
    <!-- 动态英雄区域 -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content" :class="{ 'active': isHeroActive }" ref="heroSection">
          <div class="hero-text" data-aos="fade-right" data-aos-delay="200">
            <div class="badges">
              <div class="badge new-badge animate__animated animate__pulse animate__infinite">新品上市</div>
              <div class="badge discount-badge animate__animated animate__fadeIn animate__delay-1s">限时优惠</div>
            </div>
            <h1 class="hero-title">
              为您的宝宝提供<br />
              <span class="accent-text fancy-text">最优质的呵护</span>
            </h1>
            <p class="hero-description">
              我们精选全球高品质母婴产品，为中国宝宝和妈妈提供安全、健康、舒适的成长环境。
            </p>
            <div class="hero-buttons">
              <el-button type="primary" size="large" class="primary-btn hover-float" @click="scrollToSection('featured-section')">
                <span>立即选购</span>
                <el-icon class="animate__animated animate__fadeInLeft animate__delay-1s"><ArrowDown /></el-icon>
              </el-button>
              <el-button size="large" class="hover-float-sm">了解更多</el-button>
            </div>
            <div class="hero-features">
              <div class="feature-item hover-scale" v-for="(feature, index) in features" :key="index" data-aos="fade-up" :data-aos-delay="200 + (index * 100)">
                <div class="feature-icon">
                  <el-icon><component :is="feature.icon" /></el-icon>
                </div>
                <span>{{ feature.text }}</span>
              </div>
            </div>
          </div>
          <div class="hero-image" data-aos="zoom-in" data-aos-delay="400">
            <div class="blob-shape blob-1"></div>
            <div class="blob-shape blob-2"></div>
            <img
              src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80"
              alt="幸福的宝宝"
              class="hover-float"
            />
            <div class="floating-elements">
              <div class="floating-element element-1"><el-icon><Star /></el-icon></div>
              <div class="floating-element element-2"><el-icon><GoodsFilled /></el-icon></div>
              <div class="floating-element element-3"><el-icon><Present /></el-icon></div>
            </div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator" @click="scrollToSection('categories-section')">
        <span>向下滚动</span>
        <el-icon class="animate__animated animate__bounce animate__infinite"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- 分类部分 -->
    <section id="categories-section" class="categories-section">
      <div class="container">
        <div class="section-header" data-aos="fade-up">
          <div class="section-tag">全方位服务</div>
          <h2 class="section-title">产品分类</h2>
          <p class="section-description">
            我们提供全面的母婴产品，从婴儿护理到孕妇用品，满足您和宝宝的各种需求。
          </p>
        </div>
        <div class="categories-grid">
          <router-link
            v-for="(category, index) in categories"
            :key="index"
            :to="category.path"
            class="category-card hover-lift"
            data-aos="fade-up"
            :data-aos-delay="100 * index"
          >
            <div class="category-icon">
              <el-icon><component :is="category.icon" /></el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <div class="card-overlay">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </router-link>
        </div>
      </div>
      <div class="section-divider">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
        </svg>
      </div>
    </section>

    <!-- 热销产品部分 -->
    <section id="featured-section" class="featured-section">
      <div class="container">
        <div class="section-header-with-link">
          <div data-aos="fade-right">
            <div class="section-tag">精选好物</div>
            <h2 class="section-title">热销产品</h2>
            <p class="section-description">精选优质母婴产品，深受妈妈们喜爱</p>
          </div>
          <router-link to="/products" class="view-all-link hover-scale" data-aos="fade-left">
            <span>查看全部</span>
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="products-wrapper" data-aos="fade-up">
          <el-icon class="product-nav prev-button" @click="scrollProducts('left')"><ArrowLeft /></el-icon>
          <div class="products-carousel" ref="productsCarousel">
            <router-link
              v-for="product in featuredProducts"
              :key="product.id"
              :to="`/product/${product.id}`"
              class="product-card hover-shadow"
            >
              <div class="product-image">
                <img :src="product.image" :alt="product.name" />
                <div class="product-actions">
                  <el-button circle class="action-btn"><el-icon><Star /></el-icon></el-button>
                  <el-button circle class="action-btn"><el-icon><Plus /></el-icon></el-button>
                  <el-button circle class="action-btn"><el-icon><View /></el-icon></el-button>
                </div>
              </div>
              <div class="product-content">
                <div class="badge category-badge">{{ product.category }}</div>
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-price-rating">
                  <p class="product-price">{{ product.price }}</p>
                  <div class="product-rating">
                    <el-icon v-for="i in 5" :key="i"><Star /></el-icon>
                  </div>
                </div>
              </div>
            </router-link>
          </div>
          <el-icon class="product-nav next-button" @click="scrollProducts('right')"><ArrowRight /></el-icon>
        </div>
      </div>
    </section>

    <!-- 限时促销部分 -->
    <section class="promo-section" ref="promoSection">
      <div class="container">
        <div class="promo-content" data-aos="fade-up">
          <div class="promo-text">
            <div class="section-tag">限时活动</div>
            <h2 class="section-title countdown-title">母婴节特惠</h2>
            <p class="section-description">本周特惠活动，多款产品限时折扣</p>
            <div class="countdown-timer">
              <div class="countdown-item" v-for="(unit, index) in countdownUnits" :key="index">
                <div class="countdown-value">{{ unit.value }}</div>
                <div class="countdown-label">{{ unit.label }}</div>
              </div>
            </div>
            <el-button type="danger" size="large" class="promo-btn hover-float">立即抢购</el-button>
          </div>
          <div class="promo-products" ref="promoProductsRef">
            <div
              v-for="(product, index) in promoProducts"
              :key="index"
              class="promo-product-card hover-shadow"
              :style="{ transform: `translateX(${promoScroll}px)` }"
            >
              <div class="discount-tag">-{{ product.discount }}%</div>
              <div class="promo-product-image">
                <img :src="product.image" :alt="product.name" />
              </div>
              <div class="promo-product-content">
                <h3 class="promo-product-name">{{ product.name }}</h3>
                <div class="promo-product-price">
                  <span class="original-price">¥{{ product.originalPrice }}</span>
                  <span class="current-price">¥{{ product.currentPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 顾客评价部分 -->
    <section class="testimonials-section" data-aos="fade-up">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">用户心声</div>
          <h2 class="section-title">顾客评价</h2>
          <p class="section-description">
            听听其他妈妈们对我们产品和服务的真实评价
          </p>
        </div>
        <div class="testimonials-wrapper">
          <div
            class="testimonials-slider"
            :style="{ transform: `translateX(${-currentTestimonial * 100}%)` }"
          >
            <div
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="testimonial-slide"
            >
              <div class="testimonial-card">
                <div class="testimonial-image">
                  <img :src="testimonial.image || 'https://via.placeholder.com/80x80'" :alt="testimonial.author" />
                </div>
                <div class="rating">
                  <el-icon v-for="i in 5" :key="i"><Star /></el-icon>
                </div>
                <p class="testimonial-quote">"{{ testimonial.quote }}"</p>
                <div class="testimonial-author">
                  <p class="author-name">{{ testimonial.author }}</p>
                  <p class="author-role">{{ testimonial.role }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="testimonials-dots">
            <span
              v-for="(_, index) in testimonials"
              :key="index"
              :class="{ active: index === currentTestimonial }"
              @click="setTestimonial(index)"
            ></span>
          </div>
        </div>
      </div>
    </section>

    <!-- 通讯订阅部分 -->
    <section class="newsletter-section" data-aos="fade-up">
      <div class="container">
        <div class="newsletter-content">
          <div class="section-tag">育儿资讯</div>
          <h2 class="section-title">订阅我们的育儿通讯</h2>
          <p class="section-description">
            获取最新的育儿知识、产品优惠和专家建议，帮助您更好地照顾宝宝。
          </p>
          <div class="newsletter-form">
            <el-input
              v-model="email"
              placeholder="请输入您的邮箱"
              class="hover-input"
              @focus="isInputFocused = true"
              @blur="isInputFocused = false"
              :class="{ 'focused': isInputFocused }"
            />
            <el-button type="primary" class="primary-btn hover-float">
              立即订阅
              <el-icon><Message /></el-icon>
            </el-button>
          </div>
          <p class="newsletter-disclaimer">
            订阅即表示您同意接收我们的营销邮件。您可以随时取消订阅。
          </p>
        </div>
      </div>
    </section>

    <!-- 品牌介绍部分 -->
    <section class="brands-section" data-aos="fade-up">
      <div class="container">
        <div class="section-header">
          <div class="section-tag">品质保证</div>
          <h2 class="section-title">合作品牌</h2>
          <p class="section-description">携手国内外知名母婴品牌，为宝宝提供优质产品</p>
        </div>
        <div class="brands-slider" ref="brandsSlider">
          <div class="brands-track" :style="{ transform: `translateX(${brandsOffset}px)` }">
            <div v-for="(brand, index) in allBrands" :key="index" class="brand-logo hover-scale">
              <img :src="brand.logo" :alt="brand.name" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 返回顶部按钮 -->
    <div class="back-to-top" :class="{ 'visible': showBackToTop }" @click="scrollToTop">
      <el-icon><Top /></el-icon>
    </div>
  </div>
</template>
<style src="@/styles/Home.scss" scoped></style>
<script>
export default {
  name: 'Home'
}
</script>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Star, Refresh, Van, ArrowRight, ArrowLeft, ArrowDown, Plus, View, Message, GoodsFilled, Present, Top } from '@element-plus/icons-vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import 'animate.css'
import AOS from 'aos'
import 'aos/dist/aos.css'

// 注册GSAP插件
gsap.registerPlugin(ScrollTrigger)

const router = useRouter()
const email = ref('')
const isInputFocused = ref(false)
const isHeroActive = ref(false)
const heroSection = ref(null)
const productsCarousel = ref(null)
const promoSection = ref(null)
const promoProductsRef = ref(null)
const brandsSlider = ref(null)
const showBackToTop = ref(false)
const currentTestimonial = ref(0)
const testimonialInterval = ref(null)
const promoScroll = ref(0)
const brandsOffset = ref(0)

// 滚动到指定部分
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: 'smooth'
    })
  }
}

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 产品轮播
const scrollProducts = (direction) => {
  if (!productsCarousel.value) return

  const scrollAmount = 280 // 每次滚动的像素量
  const currentScroll = productsCarousel.value.scrollLeft
  const newScroll = direction === 'left'
    ? currentScroll - scrollAmount
    : currentScroll + scrollAmount

  productsCarousel.value.scrollTo({
    left: newScroll,
    behavior: 'smooth'
  })
}

// 设置当前评价
const setTestimonial = (index) => {
  currentTestimonial.value = index
  resetTestimonialInterval()
}

// 重置评价轮播间隔
const resetTestimonialInterval = () => {
  if (testimonialInterval.value) {
    clearInterval(testimonialInterval.value)
  }

  testimonialInterval.value = setInterval(() => {
    currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.length
  }, 5000)
}

// 倒计时数据
const countdownUnits = reactive([
  { label: '天', value: '02' },
  { label: '时', value: '18' },
  { label: '分', value: '45' },
  { label: '秒', value: '30' }
])

// 更新倒计时
const updateCountdown = () => {
  // 这里可以实现真实的倒计时逻辑
  const now = new Date()
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)
  const diff = endDate - now

  if (diff <= 0) {
    // 倒计时结束逻辑
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  countdownUnits[0].value = days.toString().padStart(2, '0')
  countdownUnits[1].value = hours.toString().padStart(2, '0')
  countdownUnits[2].value = minutes.toString().padStart(2, '0')
  countdownUnits[3].value = seconds.toString().padStart(2, '0')
}

// 自动轮播品牌
const animateBrands = () => {
  if (!brandsSlider.value) return

  const brandsTrack = brandsSlider.value.querySelector('.brands-track')
  if (!brandsTrack) return

  const brandWidth = 150 // 品牌logo的宽度
  const gapWidth = 24 // 间隔宽度
  const totalWidth = allBrands.length * (brandWidth + gapWidth)

  gsap.to(brandsOffset, {
    value: -totalWidth,
    duration: 30,
    ease: 'linear',
    repeat: -1,
    onUpdate: () => {
      // 当滚动到最后时，重置位置
      if (brandsOffset.value <= -totalWidth + window.innerWidth) {
        brandsOffset.value = 0
      }
    }
  })
}

// 处理滚动效果
const handleScroll = () => {
  const scrollPosition = window.scrollY

  // 显示/隐藏返回顶部按钮
  showBackToTop.value = scrollPosition > 500

  // 根据滚动位置添加视差效果
  if (promoProductsRef.value) {
    promoScroll.value = scrollPosition * 0.08
  }
}

// 功能特点数据
const features = [
  { icon: 'Star', text: '100%品质保证' },
  { icon: 'Refresh', text: '7天无理由退换' },
  { icon: 'Van', text: '全国免费配送' },
  { icon: 'Message', text: '专业育儿顾问' }
]

// 分类数据
const categories = [
  {
    name: '婴儿护理',
    path: '/products?category=baby-care',
    icon: 'Milk'
  },
  {
    name: '喂养用品',
    path: '/products?category=feeding',
    icon: 'Bowl'
  },
  {
    name: '玩具早教',
    path: '/products?category=toys',
    icon: 'Present'
  },
  {
    name: '孕妇用品',
    path: '/products?category=maternity',
    icon: 'Female'
  },
  {
    name: '童装童鞋',
    path: '/products?category=clothing',
    icon: 'Clothes'
  },
  {
    name: '洗护用品',
    path: '/products?category=bath',
    icon: 'Bathroom'
  }
]

// 热销产品数据
const featuredProducts = [
  {
    id: 1,
    name: '有机棉婴儿连体衣',
    price: '¥199',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '婴儿服装'
  },
  {
    id: 2,
    name: '多功能婴儿推车',
    price: '¥1299',
    image: 'https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '出行用品'
  },
  {
    id: 3,
    name: '婴儿安全座椅',
    price: '¥899',
    image: 'https://images.unsplash.com/photo-1591348122449-02525c0d3ddb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '出行用品'
  },
  {
    id: 4,
    name: '婴儿奶瓶套装',
    price: '¥299',
    image: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '喂养用品'
  },
  {
    id: 5,
    name: '婴儿床套装',
    price: '¥1599',
    image: 'https://images.unsplash.com/photo-1586105449897-20b5efeb3233?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '睡眠用品'
  },
  {
    id: 6,
    name: '婴儿监视器',
    price: '¥499',
    image: 'https://images.unsplash.com/photo-1592500763277-7352950da229?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    category: '安全用品'
  }
]

// 促销产品数据
const promoProducts = [
  {
    name: '婴儿安全座椅',
    originalPrice: '1299',
    currentPrice: '899',
    discount: 30,
    image: 'https://images.unsplash.com/photo-1591348122449-02525c0d3ddb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    name: '婴儿奶瓶套装',
    originalPrice: '399',
    currentPrice: '299',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80'
  },
  {
    name: '有机棉婴儿连体衣',
    originalPrice: '299',
    currentPrice: '199',
    discount: 33,
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80'
  }
]

// 顾客评价数据
const testimonials = [
  {
    quote: '这家母婴店的产品质量非常好，我的宝宝很喜欢这里的玩具！通过他们的育儿顾问，我也学到了很多育儿知识。',
    author: '李女士',
    role: '两岁宝宝的妈妈',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    quote: '服务很贴心，店员会给出专业的育儿建议，让我这个新手妈妈少走了很多弯路。产品种类也很全面。',
    author: '张女士',
    role: '新生儿妈妈',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    quote: '产品种类齐全，价格合理，是我购买母婴用品的首选。他们的退换货政策也非常人性化。',
    author: '王先生',
    role: '双胞胎爸爸',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80'
  }
]

// 复制品牌数据以实现无缝轮播
const brands = [
  { name: '好孩子', logo: 'https://via.placeholder.com/150x60?text=好孩子' },
  { name: '飞利浦', logo: 'https://via.placeholder.com/150x60?text=飞利浦' },
  { name: '贝亲', logo: 'https://via.placeholder.com/150x60?text=贝亲' },
  { name: '帮宝适', logo: 'https://via.placeholder.com/150x60?text=帮宝适' },
  { name: '美素佳儿', logo: 'https://via.placeholder.com/150x60?text=美素佳儿' },
  { name: '爱他美', logo: 'https://via.placeholder.com/150x60?text=爱他美' }
]

// 为无缝滚动复制品牌
const allBrands = computed(() => {
  return [...brands, ...brands, ...brands]
})

// 生命周期钩子
onMounted(() => {
  // 初始化AOS动画库
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true
  })

  // 设置滚动监听
  window.addEventListener('scroll', handleScroll)

  // 初始化GSAP动画
  gsap.to(heroSection.value, {
    opacity: 1,
    duration: 0.8,
    ease: 'power2.out',
    onComplete: () => {
      isHeroActive.value = true
    }
  })

 // 初始化ScrollTrigger动画
  ScrollTrigger.create({
    trigger: '.hero-section',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      if (heroSection.value) {
        // 视差滚动效果
        gsap.to(heroSection.value.querySelector('.hero-image'), {
          y: self.progress * 50,
          duration: 0.1
        })
      }
    }
  })

  // 设置评价轮播
  resetTestimonialInterval()

  // 开始倒计时
  const countdownTimer = setInterval(updateCountdown, 1000)

  // 启动品牌轮播
  animateBrands()

  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    clearInterval(testimonialInterval.value)
    clearInterval(countdownTimer)
  })
})
</script>


