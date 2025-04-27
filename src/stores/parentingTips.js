import { defineStore } from 'pinia';
import { ElMessage } from 'element-plus';
import { 
  getParentingTipsList, 
  getParentingTipDetail, 
  getParentingTipCategories 
} from '@/api/parentingTips';

export const useParentingTipsStore = defineStore('parentingTips', {
  state: () => ({
    // 育儿知识列表
    tipsList: [],
    // 育儿知识分类
    categories: [],
    // 当前育儿知识详情
    currentTip: null,
    // 热门育儿知识
    hotTips: [],
    // 最新育儿知识
    latestTips: [],
    // 相关育儿知识
    relatedTips: [],
    // 加载状态
    loading: false,
    detailLoading: false,
    categoriesLoading: false,
    hotLoading: false,
    latestLoading: false,
    relatedLoading: false,
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
      status: 1 // 默认只获取已发布的
    }
  }),

  getters: {
    // 通过分类ID获取分类名称
    getCategoryName: (state) => (categoryId) => {
      const category = state.categories.find(cat => cat.id === categoryId);
      return category ? category.name : '未分类';
    },
    
    // 按分类分组的育儿知识
    tipsByCategory: (state) => {
      const result = {};
      
      if (state.categories.length > 0) {
        state.categories.forEach(category => {
          result[category.id] = state.tipsList.filter(tip => 
            tip.categoryId === category.id
          );
        });
      }
      
      return result;
    }
  },

  actions: {
    // 设置筛选条件
    setFilter(key, value) {
      if (Object.keys(this.filters).includes(key)) {
        this.filters[key] = value;
        // 重置页码
        this.pagination.page = 1;
      }
    },
    
    // 重置筛选条件
    resetFilters() {
      this.filters = {
        category: null,
        keyword: '',
        status: 1
      };
      this.pagination.page = 1;
    },
    
    // 设置分页
    setPagination(page, pageSize) {
      this.pagination.page = page || 1;
      if (pageSize) {
        this.pagination.pageSize = pageSize;
      }
    },
    
    // 获取育儿知识列表
    async fetchTipsList() {
      this.loading = true;
      
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.filters
        };
        
        const res = await getParentingTipsList(params);
        
        if (res.code === 200) {
          this.tipsList = res.data.list || [];
          this.pagination.total = res.data.total || 0;
          return this.tipsList;
        } else {
          ElMessage.error(res.message || '获取育儿知识列表失败');
          return [];
        }
      } catch (error) {
        console.error('获取育儿知识列表失败:', error);
        ElMessage.error('获取育儿知识列表失败');
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // 获取育儿知识详情
    async fetchTipDetail(id) {
      if (!id) {
        ElMessage.error('育儿知识ID不能为空');
        return null;
      }
      
      this.detailLoading = true;
      
      try {
        const res = await getParentingTipDetail(id);
        
        if (res.code === 200) {
          this.currentTip = res.data;
          return this.currentTip;
        } else {
          ElMessage.error(res.message || '获取育儿知识详情失败');
          return null;
        }
      } catch (error) {
        console.error('获取育儿知识详情失败:', error);
        ElMessage.error('获取育儿知识详情失败');
        return null;
      } finally {
        this.detailLoading = false;
      }
    },
    
    // 获取育儿知识分类
    async fetchCategories() {
      if (this.categories.length > 0) {
        return this.categories;
      }
      
      this.categoriesLoading = true;
      
      try {
        const res = await getParentingTipCategories();
        
        if (res.code === 200) {
          this.categories = res.data || [];
          return this.categories;
        } else {
          console.error('获取育儿知识分类失败:', res.message);
          return [];
        }
      } catch (error) {
        console.error('获取育儿知识分类失败:', error);
        return [];
      } finally {
        this.categoriesLoading = false;
      }
    },
    
    // 获取热门育儿知识
    async fetchHotTips(limit = 5) {
      this.hotLoading = true;
      
      try {
        const params = {
          page: 1,
          pageSize: limit,
          sortBy: 'viewCount',
          status: 1
        };
        
        const res = await getParentingTipsList(params);
        
        if (res.code === 200) {
          this.hotTips = res.data.list || [];
          return this.hotTips;
        } else {
          console.error('获取热门育儿知识失败:', res.message);
          return [];
        }
      } catch (error) {
        console.error('获取热门育儿知识失败:', error);
        return [];
      } finally {
        this.hotLoading = false;
      }
    },
    
    // 获取最新育儿知识
    async fetchLatestTips(limit = 5) {
      this.latestLoading = true;
      
      try {
        const params = {
          page: 1,
          pageSize: limit,
          sortBy: 'publishTime',
          status: 1
        };
        
        const res = await getParentingTipsList(params);
        
        if (res.code === 200) {
          this.latestTips = res.data.list || [];
          return this.latestTips;
        } else {
          console.error('获取最新育儿知识失败:', res.message);
          return [];
        }
      } catch (error) {
        console.error('获取最新育儿知识失败:', error);
        return [];
      } finally {
        this.latestLoading = false;
      }
    },
    
    // 获取相关育儿知识
    async fetchRelatedTips(categoryId, currentId, limit = 4) {
      if (!categoryId) {
        return [];
      }
      
      this.relatedLoading = true;
      
      try {
        const params = {
          page: 1,
          pageSize: limit + 1, // 多获取一条，用于排除当前文章
          category: categoryId,
          status: 1
        };
        
        const res = await getParentingTipsList(params);
        
        if (res.code === 200) {
          // 排除当前正在查看的文章
          this.relatedTips = (res.data.list || [])
            .filter(tip => tip.id !== currentId)
            .slice(0, limit);
          return this.relatedTips;
        } else {
          console.error('获取相关育儿知识失败:', res.message);
          return [];
        }
      } catch (error) {
        console.error('获取相关育儿知识失败:', error);
        return [];
      } finally {
        this.relatedLoading = false;
      }
    },
    
    // 清除当前育儿知识
    clearCurrentTip() {
      this.currentTip = null;
    }
  }
}); 