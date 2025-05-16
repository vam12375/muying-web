import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'

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
      component: () => import('../views/Orders.vue'),
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

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 母婴商城` : '母婴商城'
  
  // 暂时注释掉会话同步逻辑
  /*
  const lastSessionSync = localStorage.getItem('lastSessionSync');
  const currentTime = Date.now();
  const SESSION_SYNC_DEBOUNCE = 10000; // 会话同步防抖时间(10秒)
  
  import('@/utils/auth').then(({ getToken }) => {
    const token = getToken();
    if (token) {
      if (!lastSessionSync || (currentTime - parseInt(lastSessionSync)) > SESSION_SYNC_DEBOUNCE) {
        import('@/utils/request').then(({ startSessionRefresh }) => {
          startSessionRefresh();
          localStorage.setItem('lastSessionSync', currentTime.toString());
        });
      } else {
        console.log('跳过会话同步，上次同步时间:', new Date(parseInt(lastSessionSync)).toLocaleTimeString());
      }
    }
  });
  */

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 使用 import 动态导入，确保 getToken 能获取最新状态
    import('@/utils/auth').then(({ getToken }) => {
      const token = getToken();
      console.log('[Guard] Checking auth for:', to.path, 'Token exists:', !!token);
      if (!token) {
        console.log('[Guard] No token, redirecting to login for:', to.fullPath);
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      } else {
        console.log('[Guard] Token exists, proceeding to:', to.path);
        next(); // Token 存在，继续导航
      }
    }).catch(err => {
        console.error('[Guard] Error importing auth utils:', err);
        // 发生错误，阻止导航可能不是最佳选择，但可以先重定向到登录页
        next({ path: '/login' }); 
    });
  } else {
    console.log('[Guard] Route does not require auth:', to.path);
    next(); // 不需要认证，直接继续
  }

  // 暂时注释掉 /cart 特殊处理逻辑
  /*
  if (to.path === '/cart' && from.path !== '/cart') {
    if (lastSessionSync && (currentTime - parseInt(lastSessionSync)) < SESSION_SYNC_DEBOUNCE) {
      next({
        path: '/cart',
        query: { ...to.query, noAutoLoad: 'true' }
      });
      return;
    }
  }
  */
})

export default router
