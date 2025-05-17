import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        title: '首页',
        requiresAuth: false
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录/注册',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      redirect: '/login'
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductList.vue'),
      meta: {
        title: '商品列表',
        requiresAuth: false
      }
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetail.vue'),
      meta: {
        title: '商品详情',
        requiresAuth: false
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/Cart.vue'),
      meta: {
        title: '购物车',
        requiresAuth: true
      }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('../views/Checkout.vue'),
      meta: {
        title: '订单结算',
        requiresAuth: true
      }
    },
    {
      path: '/payment/:orderId',
      name: 'payment',
      component: () => import('../views/Payment.vue'),
      meta: {
        title: '订单支付',
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/points',
      name: 'points',
      component: () => import('../views/Points.vue'),
      meta: {
        title: '我的积分',
        requiresAuth: true
      }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/user/User.vue'),
      meta: {
        title: '个人中心',
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        console.log('[UserRoute] 进入用户中心路由守卫');
        const userStore = useUserStore();
        
        // 检查用户是否已登录
        if (!userStore.isLoggedIn) {
          console.log('[UserRoute] 用户未登录，尝试检查认证状态');
          
          // 尝试检查认证状态
          userStore.checkAuth().then(authStatus => {
            if (!authStatus) {
              console.log('[UserRoute] 认证失败，重定向到登录页面');
              ElMessage.warning('请先登录');
              next({
                path: '/login',
                query: { redirect: to.fullPath }
              });
            } else {
              console.log('[UserRoute] 认证成功，允许访问用户中心');
              next();
            }
          });
        } else {
          console.log('[UserRoute] 用户已登录，允许访问用户中心');
          next();
        }
      }
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('../views/Messages.vue'),
      meta: {
        title: '消息中心',
        requiresAuth: true
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/Orders.vue'),
      meta: {
        title: '我的订单',
        requiresAuth: true
      }
    },
    {
      path: '/order/:orderId',
      name: 'order-detail',
      component: () => import('../views/OrderDetail.vue'),
      meta: {
        title: '订单详情',
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/review/order/:orderId',
      name: 'order-review',
      component: () => import('../views/ReviewOrder.vue'),
      meta: {
        title: '订单评价',
        requiresAuth: true
      },
      props: true
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/Favorites.vue'),
      meta: {
        title: '我的收藏',
        requiresAuth: true
      }
    },
    {
      path: '/coupons',
      name: 'coupons',
      component: () => import('../views/Coupons.vue'),
      meta: {
        title: '我的优惠券',
        requiresAuth: true
      }
    },
    {
      path: '/test-api',
      name: 'test-api',
      component: () => import('../views/TestPage.vue'),
    },
    {
      path: '/test-connection',
      name: 'test-connection',
      component: () => import('../pages/TestConnection.vue'),
      meta: {
        title: '前后端连接测试',
        requiresAuth: false
      }
    },
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound.vue'),
      meta: {
        title: '页面未找到',
        requiresAuth: false
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 母婴商城` : '母婴商城';
  
  // 记录路由跳转
  console.log(`[Guard] 路由跳转: ${from.path} -> ${to.path}`);
  
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    console.log(`[Guard] 路由需要认证: ${to.path}`);
    
    // 获取用户存储
    const userStore = useUserStore();
    
    // 检查用户是否已登录
    if (!userStore.isLoggedIn) {
      console.log(`[Guard] 用户未登录，尝试检查认证状态`);
      
      // 尝试检查认证状态
      const authStatus = await userStore.checkAuth();
      
      if (!authStatus) {
        console.log(`[Guard] 认证失败，重定向到登录页面`);
        ElMessage.warning('请先登录');
        
        // 保存原始目标路由，以便登录后重定向
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
        return;
      }
      
      console.log(`[Guard] 认证成功，用户ID: ${userStore.id}`);
    } else {
      console.log(`[Guard] 用户已登录，ID: ${userStore.id}`);
    }
  } else {
    console.log(`[Guard] 路由不需要认证: ${to.path}`);
  }
  
  // 继续导航
  next();
});

export default router
