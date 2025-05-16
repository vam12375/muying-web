# Muying Web - 母婴商城前台

母婴商城系统的前台用户界面，基于Vue 3和Vite构建的现代化Web应用。

## 技术栈

- **核心框架**: Vue 3.5
- **构建工具**: Vite 6.2
- **状态管理**: 
  - Pinia 3.0
  - Vuex 4.1
- **路由管理**: Vue Router 4.5
- **UI组件库**: Element Plus 2.9.8
- **CSS预处理器**: Sass
- **CSS框架**: Tailwind CSS 3.4.1
- **HTTP客户端**: Axios 1.9.0
- **动画库**: 
  - GSAP 3.12.7
  - Animate.css 4.1.1
  - Framer Motion 11.1.7
  - VueUse Motion 3.0.3
  - Lottie Web 5.12.2
- **数据可视化**: ECharts 5.6.0
- **3D库**: Three.js 0.162.0
- **其他辅助库**:
  - Vue Kinesis 2.0.5
  - aos 2.3.4
  - mitt 3.0.1
  - Swiper 11.0.7

## 功能特性

- 响应式设计，适配多种设备屏幕尺寸
- 丰富的UI动画和过渡效果
- 商品分类和搜索功能
- 用户注册和登录
- 购物车管理
- 订单处理
- 支付集成
- 个人中心和订单历史
- 商品详情展示
- 用户评价系统

## 项目设置

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码规范检查

```bash
npm run lint
```

## 项目结构

```
src/
├── api/          # API请求
├── assets/       # 静态资源
├── components/   # 通用组件
├── hooks/        # Vue组合式API钩子
├── pages/        # 页面组件
├── router/       # 路由配置
├── scripts/      # 工具脚本
├── stores/       # Pinia/Vuex状态管理
├── styles/       # 全局样式
├── utils/        # 工具函数
├── views/        # 视图组件
├── App.vue       # 应用根组件
└── main.js       # 应用入口
```

## 开发指南

- 所有API请求应放在`api`目录下
- 共享组件应放在`components`目录下
- 页面级组件应放在`pages`或`views`目录下
- 路由配置位于`router`目录
- 全局状态管理位于`stores`目录

## API接口

应用默认连接到后端API服务：

- 开发环境: `http://localhost:8080/api`
- 生产环境: 根据部署配置不同而变化

## 设计特色

本应用采用现代UI设计风格，以母婴产品为中心，提供温馨舒适的用户体验。UI设计侧重于：

- 柔和的色彩方案
- 友好的用户界面
- 流畅的交互动画
- 高质量的产品展示
- 简化的购物流程

## 浏览器兼容性

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)