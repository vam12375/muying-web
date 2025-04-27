import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { 
  getProductList, 
  getProductDetail, 
  getProductCategories,
  getRecommendProducts,
  searchProducts
} from '@/api/product';

export const useProductStore = defineStore('product', {
  state: () => ({
    // 商品列表
    productList: [],
    // 商品分类
    categories: [],
    // 商品详情
    currentProduct: null,
    // 推荐商品
    recommendProducts: [],
    // 加载状态
    loading: false,
    categoriesLoading: false,
    detailLoading: false,
    recommendLoading: false,
    // 分页信息
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    // 筛选条件
    filters: {
      category: null,
      keyword: '',
      priceRange: null,
      sortBy: 'newest', // newest, priceAsc, priceDesc, sales
    }
  }),

  getters: {
    // 格式化商品价格（保留两位小数）
    formattedPrice: () => (price) => {
      return Number(price).toFixed(2);
    },
    
    // 判断是否有库存
    hasStock: () => (product) => {
      return product && product.stock > 0;
    },
    
    // 获取分类名称通过ID
    getCategoryNameById: (state) => (categoryId) => {
      const category = state.categories.find(cat => cat.id === categoryId);
      return category ? category.name : '未分类';
    },
    
    // 按分类分组的商品
    productsByCategory: (state) => {
      const result = {};
      
      state.categories.forEach(category => {
        result[category.id] = state.productList.filter(product => 
          product.categoryId === category.id
        );
      });
      
      return result;
    }
  },

  actions: {
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        category: null,
        keyword: '',
        priceRange: null,
        sortBy: 'newest'
      };
      this.pagination.page = 1;
    },
    
    // 设置筛选条件
    setFilter(key, value) {
      if (Object.keys(this.filters).includes(key)) {
        this.filters[key] = value;
        // 重置页码
        this.pagination.page = 1;
      }
    },
    
    // 设置分页
    setPagination(page, pageSize) {
      this.pagination.page = page || 1;
      if (pageSize) {
        this.pagination.pageSize = pageSize;
      }
    },
    
    // 获取商品列表
    async fetchProducts() {
      this.loading = true;
      
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.filters
        };
        
        const res = await getProductList(params);
        
        if (res.code === 200) {
          this.productList = res.data.list || [];
          this.pagination.total = res.data.total || 0;
          return this.productList;
        } else {
          ElMessage.error(res.message || '获取商品列表失败');
          return [];
        }
      } catch (error) {
        console.error('获取商品列表失败:', error);
        ElMessage.error('获取商品列表失败，请稍后重试');
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // 搜索商品
    async searchProducts(keyword) {
      this.loading = true;
      
      try {
        const params = {
          keyword,
          page: 1,
          pageSize: 10
        };
        
        const res = await searchProducts(params);
        
        if (res.code === 200) {
          return res.data.list || [];
        } else {
          ElMessage.error(res.message || '搜索商品失败');
          return [];
        }
      } catch (error) {
        console.error('搜索商品失败:', error);
        ElMessage.error('搜索商品失败，请稍后重试');
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // 获取商品详情
    async fetchProductDetail(productId) {
      if (!productId) {
        ElMessage.error('商品ID不能为空');
        return null;
      }
      
      this.detailLoading = true;
      
      try {
        const res = await getProductDetail(productId);
        
        if (res.code === 200) {
          this.currentProduct = res.data;
          return this.currentProduct;
        } else {
          ElMessage.error(res.message || '获取商品详情失败');
          return null;
        }
      } catch (error) {
        console.error('获取商品详情失败:', error);
        ElMessage.error('获取商品详情失败，请稍后重试');
        return null;
      } finally {
        this.detailLoading = false;
      }
    },
    
    // 获取商品分类
    async fetchCategories() {
      this.categoriesLoading = true;
      
      try {
        const res = await getProductCategories();
        
        if (res.code === 200) {
          this.categories = res.data || [];
          return this.categories;
        } else {
          ElMessage.error(res.message || '获取商品分类失败');
          return [];
        }
      } catch (error) {
        console.error('获取商品分类失败:', error);
        ElMessage.error('获取商品分类失败，请稍后重试');
        return [];
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    // 获取推荐商品
    async fetchRecommendProducts(limit = 5) {
      this.recommendLoading = true;
      
      try {
        const res = await getRecommendProducts({ limit });
        
        if (res.code === 200) {
          this.recommendProducts = res.data || [];
          return this.recommendProducts;
        } else {
          console.error('获取推荐商品失败:', res.message);
          return [];
        }
      } catch (error) {
        console.error('获取推荐商品失败:', error);
        return [];
      } finally {
        this.recommendLoading = false;
      }
    },
    
    // 清除当前商品
    clearCurrentProduct() {
      this.currentProduct = null;
    }
  }
}); 