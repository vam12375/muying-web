<template>
  <MainLayout>
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
  </MainLayout>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Star, Refresh, Van, ArrowRight, ArrowLeft, ArrowDown, Plus, View, Message, GoodsFilled, Present, Top } from '@element-plus/icons-vue'
import MainLayout from '@/components/layout/MainLayout.vue'
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

<style lang="scss" scoped>
/* 通用样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  position: relative;
  z-index: 2;
}

section {
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

/* 标题样式和复用组件 */
.section-tag {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.2) 0%, rgba(255, 182, 193, 0.2) 100%);
  color: #ff6699;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
  backdrop-filter: blur(4px);
}

.section-header, .section-header-with-link {
  text-align: center;
  margin-bottom: 60px;
}

.section-header-with-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
}

.section-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #333;
  position: relative;
  display: inline-block;

  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #ff6699, #ff99cc);
    border-radius: 3px;
  }
}

.countdown-title {
  &:after {
    left: 0;
    transform: none;
  }
}

.section-description {
  font-size: 18px;
  color: #666;
  max-width: 640px;
  margin: 0 auto;
  line-height: 1.6;
}

.badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.new-badge {
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 102, 153, 0.3);
}

.discount-badge {
  background: linear-gradient(135deg, #ff9933 0%, #ffcc66 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(255, 153, 51, 0.3);
  margin-left: 10px;
}

.category-badge {
  background-color: #ffebf0;
  color: #ff6699;
  margin-bottom: 8px;
}

.view-all-link {
  display: flex;
  align-items: center;
  color: #ff6699;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;

  .el-icon {
    margin-left: 4px;
    transition: transform 0.3s ease;
  }

  &:hover {
    color: #ff99cc;

    .el-icon {
      transform: translateX(4px);
    }
  }
}

.primary-btn {
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%) !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  box-shadow: 0 4px 10px rgba(255, 102, 153, 0.3) !important;
  transition: all 0.3s ease !important;

  &:hover {
    box-shadow: 0 6px 15px rgba(255, 102, 153, 0.4) !important;
    background: linear-gradient(135deg, #ff4d88 0%, #ff85c2 100%) !important;
  }

  .el-icon {
    font-size: 16px;
  }
}

.section-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;

  svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 80px;

    .shape-fill {
      fill: #FFFFFF;
    }
  }
}

/* 交互效果类 */
.hover-float {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-6px);
  }
}

.hover-float-sm {
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-3px);
  }
}

.hover-scale {
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.hover-shadow {
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
}

.hover-lift {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
  }
}

.hover-input {
  transition: all 0.3s ease;

  &.focused {
    box-shadow: 0 0 0 3px rgba(255, 102, 153, 0.2);
  }
}

.fancy-text {
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradient 3s ease infinite;
  background-size: 200% 200%;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 英雄区域 */
.hero-section {
  padding: 120px 0 160px;
  background-color: #fff;
  position: relative;
  overflow: hidden;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 90% 10%, rgba(255, 102, 153, 0.1) 0%, transparent 60%);
    z-index: 1;
  }
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 48px;
  opacity: 0;

  &.active .hero-image img {
    animation: float 5s ease-in-out infinite;
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.hero-text {
  flex: 1;
  z-index: 2;
}

.hero-title {
  font-size: 50px;
  font-weight: 800;
  line-height: 1.2;
  margin: 16px 0;
  color: #333;
  text-shadow: 0 4px 4px rgba(0, 0, 0, 0.05);
}

.hero-description {
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
  max-width: 480px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.badges {
  display: flex;
  margin-bottom: 20px;
}

.hero-features {
  display: flex;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
  border-radius: 30px;
  padding: 8px 16px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffebf0;
    color: #ff6699;
  }
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  box-shadow: 0 2px 5px rgba(255, 102, 153, 0.3);

  .el-icon {
    color: white;
    font-size: 16px;
  }
}

.hero-image {
  flex: 1;
  position: relative;

  img {
    width: 100%;
    height: auto;
    border-radius: 20px;
    position: relative;
    z-index: 2;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

.blob-shape {
  position: absolute;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  z-index: 1;
  filter: blur(40px);
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.4) 0%, rgba(255, 182, 193, 0.2) 100%);
  top: -50px;
  left: -80px;
  animation: blob-move 15s linear infinite alternate;
}

.blob-2 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, rgba(102, 204, 255, 0.3) 0%, rgba(153, 204, 255, 0.1) 100%);
  bottom: -80px;
  right: -100px;
  animation: blob-move 12s linear infinite alternate-reverse;
}

@keyframes blob-move {
  0% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  }
  50% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }
  100% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  .el-icon {
    color: #ff6699;
    font-size: 20px;
  }
}

.element-1 {
  top: 20%;
  left: 15%;
  animation: float-element 6s ease-in-out infinite;
}

.element-2 {
  top: 70%;
  left: 25%;
  animation: float-element 8s ease-in-out infinite 1s;
}

.element-3 {
  top: 40%;
  right: 10%;
  animation: float-element 7s ease-in-out infinite 2s;
}

@keyframes float-element {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
  100% {
    transform: translateY(0) rotate(0deg);
  }
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 10;

  span {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .el-icon {
    color: #ff6699;
    font-size: 24px;
  }
}

/* 分类部分 */
.categories-section {
  padding: 100px 0 160px;
  background-color: #f9f9f9;
  position: relative;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}

.category-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 30px 20px;
  text-align: center;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &:hover {
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);

    .card-overlay {
      opacity: 1;
    }

    .category-icon {
      transform: scale(1.1);
      background: white;

      .el-icon {
        color: #ff6699;
      }
    }
  }
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 102, 153, 0.9) 0%, rgba(255, 153, 204, 0.9) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  .el-icon {
    color: white;
    font-size: 24px;
  }
}

.category-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  .el-icon {
    font-size: 32px;
    color: white;
    transition: all 0.3s ease;
  }
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  position: relative;
  z-index: 2;
}

/* 热销产品部分 */
.featured-section {
  padding: 100px 0;
  background-color: #fff;
}

.products-wrapper {
  position: relative;
  margin: 0 -20px;
}

.products-carousel {
  display: flex;
  overflow-x: auto;
  padding: 20px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.product-card {
  flex: 0 0 260px;
  margin-right: 20px;
  border-radius: 16px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    .product-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.product-image {
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.product-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.action-btn {
  width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  background-color: white !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;

  .el-icon {
    font-size: 16px;
    color: #333;
  }

  &:hover {
    background-color: #ff6699 !important;

    .el-icon {
      color: white;
    }
  }
}

.product-content {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.4;
}

.product-price-rating {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #ff6699;
  margin: 0;
}

.product-rating {
  display: flex;

  .el-icon {
    color: #ffbb00;
    font-size: 14px;
    margin-left: 2px;
  }
}

.product-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;

  &:hover {
    background-color: #ff6699;
    color: white;
  }
}

.prev-button {
  left: 10px;
}

.next-button {
  right: 10px;
}

/* 促销部分 */
.promo-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  color: white;
}

.promo-content {
  display: flex;
  align-items: center;
  gap: 60px;
}

.promo-text {
  flex: 1;

  .section-tag {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .section-title, .section-description {
    color: white;
  }
}

.countdown-timer {
  display: flex;
  gap: 15px;
  margin: 30px 0;
}

.countdown-item {
  background-color: white;
  color: #333;
  width: 70px;
  height: 70px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.countdown-value {
  font-size: 24px;
  font-weight: 700;
}

.countdown-label {
  font-size: 12px;
  color: #666;
}

.promo-btn {
  background-color: white !important;
  color: #ff6699 !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.promo-products {
  flex: 1;
  display: flex;
  gap: 20px;
  overflow: visible;
}

.promo-product-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 15px;
  position: relative;
  width: 200px;
  transition: all 0.3s ease;

  &:nth-child(2) {
    transform: translateY(-20px) !important;
  }

  &:nth-child(3) {
    transform: translateY(20px) !important;
  }
}

.discount-tag {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 45px;
  height: 45px;
  background-color: #ff3366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.promo-product-image {
  margin-bottom: 15px;

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
  }
}

.promo-product-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.promo-product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.current-price {
  font-size: 16px;
  font-weight: 700;
  color: #ff6699;
}

/* 顾客评价部分 */
.testimonials-section {
  padding: 100px 0;
  background-color: #ffebf0;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="2" fill="%23ff6699" opacity="0.1"/></svg>') repeat;
    z-index: 1;
    opacity: 0.5;
  }
}

.testimonials-wrapper {
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.testimonials-slider {
  display: flex;
  transition: transform 0.5s ease;
}

.testimonial-slide {
  flex: 0 0 100%;
}

.testimonial-card {
  max-width: 700px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
}

.testimonial-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 5px solid #ffebf0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.rating {
  margin-bottom: 20px;

  .el-icon {
    color: #ffbb00;
    font-size: 18px;
    margin: 0 2px;
  }
}

.testimonial-quote {
  font-size: 18px;
  font-style: italic;
  color: #333;
  margin-bottom: 24px;
  line-height: 1.6;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.author-role {
  font-size: 14px;
  color: #666;
}

.testimonials-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(255, 102, 153, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      width: 30px;
      border-radius: 5px;
      background-color: #ff6699;
    }
  }
}

/* 通讯订阅部分 */
.newsletter-section {
  padding: 100px 0;
  background-color: #fff;
  background-image: url('data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 12.5C5 14 8 15 12 12C16 9 19 10 20.5 11.5" stroke="%23ffccd9" stroke-width="0.5"/></svg>');
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background-color: white;
  padding: 60px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;

  &:before, &:after {
    content: '';
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 10px;
    z-index: -1;
  }

  &:before {
    background-color: rgba(255, 102, 153, 0.1);
    top: -20px;
    right: -20px;
  }

  &:after {
    background-color: rgba(102, 204, 255, 0.1);
    bottom: -20px;
    left: -20px;
  }
}

.newsletter-form {
  display: flex;
  gap: 12px;
  margin: 32px 0 16px;
}

.newsletter-disclaimer {
  font-size: 12px;
  color: #999;
}

/* 品牌部分 */
.brands-section {
  padding: 80px 0;
  background-color: #f9f9f9;
}

.brands-slider {
  position: relative;
  overflow: hidden;
  padding: 20px 0;
}

.brands-track {
  display: flex;
  gap: 24px;
  transition: transform 0.5s linear;
}

.brand-logo {
  flex: 0 0 150px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: all 0.3s ease;

  &:hover {
    filter: grayscale(0);
    opacity: 1;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6699 0%, #ff99cc 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(255, 102, 153, 0.3);
  cursor: pointer;
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;

  &.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  &:hover {
    transform: translateY(-5px);
  }

  .el-icon {
    font-size: 24px;
  }
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .hero-title {
    font-size: 42px;
  }

  .categories-grid,
  .brands-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .promo-content {
    flex-direction: column;
  }

  .promo-products {
    margin-top: 40px;
  }
}

@media (max-width: 768px) {
  section {
    padding: 80px 0;
  }

  .hero-section {
    padding: 80px 0 120px;
  }

  .hero-content {
    flex-direction: column;
  }

  .hero-title {
    font-size: 36px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-features {
    flex-wrap: wrap;
  }

  .feature-item {
    flex: 0 0 calc(50% - 12px);
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-content {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .hero-features {
    flex-direction: column;
    gap: 12px;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .section-title {
    font-size: 28px;
  }

  .section-description {
    font-size: 16px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .countdown-timer {
    flex-wrap: wrap;
    justify-content: center;
  }

  .countdown-item {
    width: 60px;
    height: 60px;
  }

  .testimonial-card {
    padding: 30px 20px;
  }
}
</style>
