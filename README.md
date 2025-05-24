# 母婴商城前台系统 (Vue 3 + Vite)

<p align="center">
  <img src="https://img.shields.io/badge/版本-2.0.0-blue" alt="版本" />
  <img src="https://img.shields.io/badge/Vue-3.5-41B883?logo=vue.js" alt="Vue" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Element%20Plus-2.9.8-409EFF?logo=element" alt="Element Plus" />
  <img src="https://img.shields.io/badge/Pinia-3.0-yellow?logo=pinia" alt="Pinia" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/GSAP-3.12.7-88CE02?logo=greensock" alt="GSAP" />
</p>

<p align="center">基于Vue 3和Vite构建的现代化母婴电商平台前台系统，提供完整的购物体验和丰富的交互功能。</p>

![母婴商城前台系统概览](https://via.placeholder.com/1200x600/f0f4f8/808080?text=母婴商城前台系统概览)

## 📋 目录

- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [功能模块详解](#功能模块详解)
- [开发指南](#开发指南)
- [API接口](#API接口)
- [性能优化](#性能优化)
- [设计规范](#设计规范)
- [测试](#测试)
- [贡献指南](#贡献指南)
- [版本历史](#版本历史)
- [许可证](#许可证)

## ✨ 功能特性

### 🌟 核心特性

- **现代化UI设计**：采用Material Design和Neumorphism设计风格，美观直观
- **响应式布局**：完美适配从手机到大屏幕的各种设备尺寸
- **丰富动效**：使用GSAP、Vue Motion等实现流畅的过渡和动画效果
- **多主题支持**：内置浅色/深色主题，并支持自动跟随系统设置
- **离线缓存**：关键数据本地缓存，提升二次访问速度
- **国际化支持**：多语言架构设计，便于扩展不同语言版本
- **PWA支持**：可作为渐进式网络应用安装到设备上

### 💼 业务功能

#### 🛒 商品与购物

- **商品展示**：分类浏览、搜索筛选、详情展示
- **商品推荐**：基于用户历史和偏好的个性化推荐
- **价格比较**：同类商品价格对比
- **购物车**：商品收藏、添加购物车、批量操作
- **订单管理**：订单创建、状态跟踪、历史查询
- **支付集成**：多种支付方式，安全支付流程

#### 👤 用户中心

- **账户管理**：注册、登录、个人资料维护
- **地址管理**：收货地址添加、编辑、默认设置
- **订单历史**：历史订单查询和状态跟踪
- **评价系统**：商品评价、图片上传、追评功能
- **积分系统**：积分获取、使用和明细查询
- **优惠券**：优惠券领取、使用和过期提醒
- **消息中心**：系统通知、促销信息、订单状态更新

#### 🔍 内容与营销

- **内容展示**：母婴知识文章、育儿技巧分享
- **活动专区**：限时特惠、新品发布、主题活动
- **品牌专区**：品牌故事、特色产品展示
- **社区互动**：用户评论、分享、点赞功能

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🛠️ 技术架构

### 前端技术栈

- **核心框架**: Vue 3.5 (使用组合式API)
- **构建工具**: Vite 6.2
- **状态管理**: 
  - Pinia 3.0 (主要状态管理工具)
  - Vuex 4.1 (兼容性支持)
- **路由管理**: Vue Router 4.5
- **UI组件库**: Element Plus 2.9.8
- **CSS预处理器**: Sass (使用嵌入式版本)
- **CSS框架**: Tailwind CSS 3.4.1
- **HTTP客户端**: Axios 1.9.0

### 动画与效果库

- **GSAP 3.12.7**: 高性能动画库
- **Animate.css 4.1.1**: CSS动画集合
- **Framer Motion 11.1.7**: 声明式动画库
- **VueUse Motion 3.0.3**: Vue动画钩子集合
- **Lottie Web 5.12.2**: Adobe After Effects动画支持

### 数据可视化与特效

- **ECharts 5.6.0**: 数据图表库
- **Three.js 0.162.0**: 3D效果库
- **Vue Kinesis 2.0.5**: 视差效果库
- **AOS 2.3.4**: 滚动动画库
- **Swiper 11.0.7**: 轮播组件

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 📂 项目结构

母婴商城前台系统采用模块化的目录结构，按功能和职责清晰划分：

```
muying-web/
├── public/                # 静态资源目录
│   ├── favicon.ico        # 网站图标
│   ├── images/            # 静态图片
│   └── ...                # 其他静态资源
├── src/                   # 源代码目录
│   ├── api/               # API接口定义
│   │   ├── user.js        # 用户相关API
│   │   ├── product.js     # 商品相关API
│   │   ├── order.js       # 订单相关API
│   │   ├── cart.js        # 购物车相关API
│   │   └── ...            # 其他API模块
│   ├── assets/            # 项目资源文件
│   │   ├── images/        # 图片资源
│   │   ├── icons/         # 图标资源
│   │   └── fonts/         # 字体资源
│   ├── components/        # 可复用组件
│   │   ├── common/        # 通用组件
│   │   ├── layout/        # 布局组件
│   │   ├── product/       # 商品相关组件
│   │   ├── cart/          # 购物车相关组件
│   │   ├── user/          # 用户相关组件
│   │   ├── ui/            # UI基础组件
│   │   └── ...            # 其他业务组件
│   ├── hooks/             # 自定义Hooks
│   │   ├── useAuth.js     # 认证相关hook
│   │   ├── useCart.js     # 购物车相关hook
│   │   └── ...            # 其他自定义hook
│   ├── pages/             # 页面组件(可选)
│   ├── router/            # 路由配置
│   │   └── index.js       # 路由定义
│   ├── scripts/           # 工具脚本
│   ├── stores/            # 状态管理
│   │   ├── user.js        # 用户状态
│   │   ├── cart.js        # 购物车状态
│   │   ├── product.js     # 商品状态
│   │   └── ...            # 其他状态模块
│   ├── styles/            # 全局样式
│   │   ├── variables.scss # 样式变量
│   │   ├── mixins.scss    # 样式混合
│   │   └── global.scss    # 全局样式
│   ├── utils/             # 工具函数
│   │   ├── request.js     # 请求封装
│   │   ├── auth.js        # 认证工具
│   │   ├── storage.js     # 存储工具
│   │   └── ...            # 其他工具函数
│   ├── views/             # 视图组件
│   │   ├── Home.vue       # 首页
│   │   ├── Login.vue      # 登录页
│   │   ├── ProductList.vue # 商品列表页
│   │   ├── ProductDetail.vue # 商品详情页
│   │   ├── Cart.vue       # 购物车页
│   │   ├── Checkout.vue   # 结算页
│   │   ├── Payment.vue    # 支付页
│   │   └── ...            # 其他页面组件
│   ├── App.vue            # 应用根组件
│   └── main.js            # 应用入口文件
├── .eslintrc.js           # ESLint配置
├── .gitignore             # Git忽略文件
├── index.html             # HTML模板
├── package.json           # 项目依赖配置
├── postcss.config.js      # PostCSS配置
├── tailwind.config.js     # TailwindCSS配置
├── vite.config.js         # Vite构建配置
└── README.md              # 项目说明文档
```

### 核心目录详解

| 目录/文件 | 描述 |
|----------|------|
| `src/api/` | 所有后端API调用的封装，按业务模块分类 |
| `src/components/` | 可复用组件，包括通用UI组件和业务组件 |
| `src/hooks/` | Vue 3组合式API的可复用逻辑 |
| `src/stores/` | Pinia状态管理，包含各业务模块的状态 |
| `src/views/` | 页面级组件，对应路由的各个页面 |
| `src/utils/` | 通用工具函数，如请求封装、日期处理等 |
| `src/styles/` | 全局样式定义，包括变量、混合和全局样式 |
| `src/router/` | 路由配置，定义应用的导航结构 |

### 命名规范

- 组件文件：使用PascalCase（如`ProductCard.vue`）
- JS/TS工具文件：使用camelCase（如`formatPrice.js`）
- 样式文件：使用kebab-case（如`product-card.scss`）
- 目录名：使用kebab-case（如`product-images/`）

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🚀 快速开始

### 环境要求

- Node.js 18.0+ (推荐使用LTS版本)
- npm 8.0+ 或 yarn 1.22+ 或 pnpm 7+
- 现代浏览器（Chrome、Firefox、Safari、Edge等最新版本）

### 开发环境设置

#### 1. 克隆仓库

```bash
git clone https://github.com/your-username/muying-web.git
cd muying-web
```

#### 2. 安装依赖

使用npm:

```bash
npm install
```

使用yarn:

```bash
yarn install
```

使用pnpm:

```bash
pnpm install
```

#### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

应用将在 http://localhost:5173 运行（或其他可用端口），并支持热模块替换(HMR)。

#### 4. 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

构建产物将输出到 `dist` 目录。

#### 5. 预览生产构建

```bash
npm run preview
# 或
yarn preview
# 或
pnpm preview
```

### 环境变量配置

项目支持不同环境的配置文件：

- `.env`: 所有环境的默认值
- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置
- `.env.local`: 本地覆盖（不提交到代码仓库）

示例配置：

```
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=母婴商城(开发)
VITE_ENABLE_MOCK=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=母婴商城
VITE_ENABLE_MOCK=false
```

### 接口代理配置

开发环境下，可通过Vite的代理功能连接后端API：

```javascript
// vite.config.js
export default defineConfig({
  // ...其他配置
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
```

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 📦 功能模块详解

### 🛍️ 商品与购物系统

母婴商城提供完整的商品浏览、购买和订单管理流程：

- **商品展示与搜索**：支持分类浏览、多条件筛选、关键词搜索和高级筛选
- **商品详情**：包含商品轮播图、规格选择、库存显示、价格显示、评价系统等
- **智能推荐**：基于用户行为和偏好的个性化推荐算法
- **购物车管理**：支持商品添加、批量操作、数量修改、规格更换等
- **结算流程**：地址选择、支付方式选择、优惠券/积分应用、发票信息等
- **订单跟踪**：完整的订单状态跟踪、物流信息查询和评价反馈系统

### 👤 用户中心系统

用户中心提供全面的账户管理和个人数据功能：

- **账户管理**：包含注册登录、第三方登录、个人资料管理、安全设置等
- **订单管理**：历史订单查询、订单状态跟踪、售后服务申请等
- **地址管理**：支持多地址维护、默认地址设置、地址标签等
- **资产管理**：积分和优惠券的获取、使用和明细查询功能
- **消息中心**：系统通知、订单状态更新、促销活动推送等

### 📱 内容与营销系统

丰富的内容营销功能增强用户黏性和购物体验：

- **母婴知识库**：专业的母婴知识文章、育儿技巧分享
- **活动专区**：限时特惠、满减活动、秒杀、拼团等多种营销活动
- **品牌专区**：品牌故事、特色产品展示、新品发布会等
- **互动社区**：用户评论、分享、收藏和点赞等社交互动功能

### 🌐 跨平台兼容性

系统针对不同设备类型进行了专门优化：

- **响应式设计**：自适应桌面端、平板和移动端
- **触摸优化**：针对触摸设备优化的交互体验
- **性能优化**：针对低性能设备的特殊优化措施
- **兼容性处理**：解决跨浏览器兼容性问题

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🧪 开发指南

### 组件开发规范

项目采用基于Vue 3组合式API的组件开发方式：

```vue
<script setup>
// 导入依赖
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

// 状态和逻辑
const cartStore = useCartStore()
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})

// 方法
const increment = () => {
  count.value++
}
</script>

<template>
  <div class="component-container">
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped lang="scss">
.component-container {
  padding: 1rem;
  /* 更多样式... */
}
</style>
```

### 状态管理使用指南

项目使用Pinia进行状态管理，示例如下：

```javascript
// stores/cart.js
import { defineStore } from 'pinia'
import { addToCart, getCartItems, updateCartItem, removeCartItem } from '@/api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    loading: false,
    error: null
  }),
  
  getters: {
    cartTotal: (state) => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    itemCount: (state) => state.items.length,
    // 更多计算属性...
  },
  
  actions: {
    // 添加商品到购物车
    async addItem(product, quantity = 1) {
      this.loading = true
      try {
        const response = await addToCart({ 
          productId: product.id, 
          quantity 
        })
        if (response.code === 200) {
          this.items.push({ ...product, quantity })
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 更多操作...
  }
})
```

### 路由配置指南

使用Vue Router管理应用路由：

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { requiresAuth: false }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/views/ProductDetail.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart.vue'),
      meta: { requiresAuth: true }
    },
    // 更多路由...
  ]
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const userStore = useUserStore()
  
  if (requiresAuth && !userStore.isLoggedIn) {
    // 检查认证状态
    await userStore.checkAuth()
    
    if (!userStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  next()
})

export default router
```

### API调用规范

项目统一使用封装的API模块进行后端交互：

```javascript
// api/product.js
import request from '@/utils/request'

// 获取商品列表
export function getProductList(params) {
  return request({
    url: '/products',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

// 更多API...
```

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🔌 API接口

### 接口约定

所有API请求都会返回统一格式的响应：

```typescript
interface ApiResponse<T> {
  code: number;       // 状态码，200表示成功
  message: string;    // 响应消息
  data: T;            // 响应数据
  success: boolean;   // 成功标志
}
```

### 核心API模块

项目API按业务模块组织：

| 模块 | 描述 | 文件路径 |
|------|------|----------|
| 用户API | 用户登录、注册、信息维护 | `src/api/user.js` |
| 商品API | 商品列表、详情、搜索 | `src/api/product.js` |
| 购物车API | 购物车操作、结算 | `src/api/cart.js` |
| 订单API | 订单创建、状态查询 | `src/api/order.js` |
| 支付API | 支付处理、回调 | `src/api/payment.js` |
| 评论API | 商品评价、回复 | `src/api/comment.js` |
| 内容API | 文章、活动、品牌 | `src/api/content.js` |

### 使用示例

```javascript
// 在组件中使用API
import { getProductDetail } from '@/api/product'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    const product = ref(null)
    const loading = ref(false)
    const error = ref(null)
    
    onMounted(async () => {
      loading.value = true
      try {
        const productId = route.params.id
        const response = await getProductDetail(productId)
        if (response.code === 200) {
          product.value = response.data
        } else {
          error.value = response.message
        }
      } catch (err) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    })
    
    return { product, loading, error }
  }
}
```

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## ⚡ 性能优化

### 优化策略

母婴商城前台系统采用多种策略优化用户体验和加载性能：

- **组件懒加载**：非关键路径组件采用动态导入
- **图片优化**：自动图片压缩、WebP格式支持、响应式图片
- **资源预加载**：关键资源预加载和预连接
- **状态管理优化**：Pinia状态精细化管理，避免不必要的渲染
- **虚拟列表**：长列表使用虚拟滚动技术
- **代码分割**：基于路由的代码分割
- **服务端渲染(SSR)**：关键页面支持服务端渲染
- **缓存策略**：浏览器缓存、LocalStorage、SessionStorage合理使用

### 关键指标

项目针对以下性能指标进行持续优化：

- **首次内容绘制(FCP)**: < 1.2s
- **交互可用时间(TTI)**: < 3.8s
- **最大内容绘制(LCP)**: < 2.5s
- **首次输入延迟(FID)**: < 100ms
- **累积布局偏移(CLS)**: < 0.1

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🎨 设计规范

### 色彩系统

母婴商城采用温馨柔和的色彩系统：

- **主色调**：温暖粉色 (#FF9FB0)，象征关爱和温暖
- **辅助色**：薄荷绿 (#A6DDCF)，柔和黄 (#FFEBAB)，天空蓝 (#A6C0FF)
- **文本色**：深灰 (#333333)，中灰 (#666666)，浅灰 (#999999)
- **功能色**：成功绿 (#67C23A)，警告黄 (#E6A23C)，危险红 (#F56C6C)，信息蓝 (#909399)

### 排版规范

- **主标题**：24px，粗体
- **次级标题**：20px，粗体
- **内容标题**：18px，粗体
- **正文**：16px，常规
- **次要文本**：14px，常规
- **辅助文本**：12px，常规

### 间距规范

采用8px为基准的间距系统：

- **紧凑**：4px, 8px
- **标准**：16px, 24px
- **宽松**：32px, 48px

### 响应式断点

- **移动端**：< 640px
- **平板**：640px - 1024px
- **桌面**：> 1024px

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 🧰 测试

### 测试框架

项目采用以下测试框架和工具：

- **单元测试**：Vitest + Vue Test Utils
- **端到端测试**：Cypress
- **性能测试**：Lighthouse CI

### 编写测试示例

```javascript
// 组件单元测试示例
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ProductCard from '@/components/product/ProductCard.vue'

describe('ProductCard', () => {
  it('正确显示产品信息', () => {
    const product = {
      id: 1,
      name: '婴儿奶瓶',
      price: 99.9,
      image: '/images/bottle.jpg'
    }
    
    const wrapper = mount(ProductCard, {
      props: { product }
    })
    
    expect(wrapper.text()).toContain('婴儿奶瓶')
    expect(wrapper.text()).toContain('99.9')
    expect(wrapper.find('img').attributes('src')).toBe('/images/bottle.jpg')
  })
  
  it('点击加入购物车按钮时触发事件', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: { id: 1, name: '婴儿奶瓶', price: 99.9 } }
    })
    
    await wrapper.find('.add-to-cart-btn').trigger('click')
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
  })
})
```

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 👥 贡献指南

### 开发流程

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码规范

- 遵循ESLint配置的代码风格
- 组件使用组合式API (Composition API)
- 提交前运行测试确保通过
- 新功能需要添加相应的测试

### 提交规范

提交信息格式：`type(scope): subject`

类型(type)包括：
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 代码风格变更（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具变更

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 📋 版本历史

### v2.0.0 (2023-10-15)

- 🎉 全面升级至Vue 3.5和Vite 6.2
- 💄 全新UI设计，采用Material Design风格
- ✨ 新增动画效果和交互体验
- 🔧 性能优化和代码重构
- 📱 增强移动端适配

### v1.5.0 (2023-06-20)

- ✨ 新增积分系统
- 🔐 增强账户安全系统
- 🛒 优化购物车体验
- 📦 增加商品推荐算法

### v1.0.0 (2023-01-10)

- 🚀 首次正式发布
- 🛍️ 完整的商品浏览和购买流程
- 👤 用户中心基本功能
- 🔍 搜索和分类功能

<div align="right">[ <a href="#目录">返回顶部 ⬆</a> ]</div>

## 📄 许可证

本项目采用[MIT许可证](LICENSE)开源。

---

<p align="center">
  <b>母婴商城前台系统 (Vue 3 + Vite)</b><br>
  为中国妈妈和宝宝打造的现代化网上购物平台
</p>

<p align="center">
  由开发团队倾力打造 💖
</p>