import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'

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
      path: '/admin',
      name: 'admin',
      component: AdminLayout,
      meta: {
        title: '后台管理',
        requiresAuth: true,
        requiresAdmin: true
      },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue'),
          meta: {
            title: '管理控制台',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('../views/admin/ProductManagement.vue'),
          meta: {
            title: '商品管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/OrderManagement.vue'),
          meta: {
            title: '订单管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/UserManagement.vue'),
          meta: {
            title: '用户管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'reviews',
          name: 'admin-reviews',
          component: () => import('../views/admin/ReviewManagement.vue'),
          meta: {
            title: '评论管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'parenting-tips',
          name: 'admin-parenting-tips',
          component: () => import('../views/admin/ParentingTipsManagement.vue'),
          meta: {
            title: '育儿知识管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'coupons',
          name: 'admin-coupons',
          component: () => import('../views/admin/CouponManagement.vue'),
          meta: {
            title: '优惠券管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'cache',
          name: 'admin-cache',
          component: () => import('../views/admin/CacheManagement.vue'),
          meta: {
            title: '缓存管理',
            requiresAuth: true,
            requiresAdmin: true
          }
        }
      ]
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
      path: '/payment',
      name: 'payment',
      component: () => import('../views/Payment.vue'),
      meta: {
        title: '订单支付',
        requiresAuth: true
      }
    },
    {
      path: '/point',
      name: 'point',
      component: () => import('../views/Point.vue'),
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
      path: '/orders',
      name: 'orders',
      component: () => import('../views/Orders.vue'),
      meta: {
        title: '我的订单',
        requiresAuth: true
      }
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

  // 检查是否需要登录权限
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  next()
})

export default router
