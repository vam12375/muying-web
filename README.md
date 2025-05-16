# Muying - 母婴商城系统

一个完整的母婴商城系统，采用现代全栈技术开发，包含前台商城、后台管理系统和后端API服务。

## 项目结构

本项目采用Monorepo结构，包含三个主要部分：

- **muying-web**: 前台商城项目，面向终端用户
- **muying-admin**: 后台管理系统，面向商城管理员
- **muying-mall**: 后端API服务，为前台和后台提供数据支持

## 技术栈

### 前台商城 (muying-web)

- **核心框架**: Vue 3.5
- **构建工具**: Vite 6
- **状态管理**: Pinia 3.0 & Vuex 4.1
- **路由管理**: Vue Router 4.5
- **UI组件库**: Element Plus 2.9
- **CSS预处理器**: Sass
- **CSS框架**: Tailwind CSS 3.4
- **HTTP客户端**: Axios
- **动画库**: 
  - GSAP
  - Animate.css
  - Framer Motion
  - VueUse Motion
  - Lottie Web
- **数据可视化**: ECharts 5.6
- **3D库**: Three.js
- **构建工具**: Vite 6.2

### 后台管理系统 (muying-admin)

- **核心框架**: Vue 3.5
- **构建工具**: Vite 6.3
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.5
- **UI组件库**: 
  - Element Plus 2.9
  - Ant Design Vue 4.2
- **CSS预处理器**: Sass
- **HTTP客户端**: Axios
- **数据可视化**: ECharts 5.6
- **动画库**:
  - GSAP
  - Animate.css
  - VueUse Motion
- **其他工具**: js-cookie

### 后端服务 (muying-mall)

- **核心框架**: Spring Boot 3.2
- **Java版本**: Java 21
- **ORM框架**: MyBatis-Plus 3.5.9
- **数据库**: MySQL
- **缓存**: Redis (Spring Data Redis)
- **会话管理**: Spring Session
- **安全框架**: Spring Security
- **API文档**: SpringDoc OpenAPI 2.2.0
- **JSON处理**: 
  - FastJSON2
  - Jackson
- **搜索引擎**: Elasticsearch 8.11.0
- **支付集成**: 
  - 支付宝 SDK 4.38.0
  - 微信支付 SDK 0.0.3
- **认证授权**: JWT (JJWT 0.11.5)

## 系统功能

- 用户注册与登录
- 商品浏览与搜索
- 购物车管理
- 订单处理
- 支付集成
- 后台商品管理
- 后台订单管理
- 后台用户管理
- 数据统计与分析

## 安装与使用

### 前置条件

- Node.js 18+ (前端项目)
- Java 21 (后端项目)
- MySQL 8+
- Redis 6+
- Maven 3.8+

### 前台商城 (muying-web)

```bash
cd muying-web
npm install
npm run dev
```

前台商城将在 http://localhost:5173 运行

### 后台管理系统 (muying-admin)

```bash
cd muying-admin
npm install
npm run dev
```

后台管理系统将在 http://localhost:3000 运行

### 后端服务 (muying-mall)

```bash
cd muying-mall
mvn spring-boot:run
```

后端API服务将在 http://localhost:8080 运行

## 部署指南

### 前端项目构建

```bash
# 构建前台商城
cd muying-web
npm run build

# 构建后台管理系统
cd muying-admin
npm run build
```

### 后端项目构建

```bash
cd muying-mall
mvn clean package
```

生成的JAR文件位于`target/muying-mall-0.0.1-SNAPSHOT.jar`

## 管理员账户

- **账号**: admin
- **密码**: admin123

## 项目特色

1. 完整的前后端分离架构
2. 现代化的UI设计和用户体验
3. 高性能的后端服务
4. 完善的安全机制
5. 支持多种支付方式
6. 全面的商品搜索功能
7. 丰富的数据统计与分析

## 贡献指南

欢迎贡献代码或提出建议。请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT](LICENSE) 