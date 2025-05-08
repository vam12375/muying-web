import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useParentingTipsStore } from '@/stores/parentingTips';
import { formatDate as formatDateUtil } from '@/utils/format';

export default function useParentingTips() {
  const router = useRouter();
  const parentingTipsStore = useParentingTipsStore();

  // 状态
  const searchKeyword = ref('');
  const selectedCategory = ref(null);
  const currentPage = ref(1);
  const pageSize = ref(10);

  // 计算属性
  const tipsList = computed(() => parentingTipsStore.tipsList);
  const hotTips = computed(() => parentingTipsStore.hotTips);
  const categories = computed(() => parentingTipsStore.categories);
  const total = computed(() => parentingTipsStore.pagination.total);
  const loading = computed(() => parentingTipsStore.loading);
  const hotLoading = computed(() => parentingTipsStore.hotLoading);
  const categoriesLoading = computed(() => parentingTipsStore.categoriesLoading);

  // 生命周期钩子
  onMounted(async () => {
    // 获取分类
    await parentingTipsStore.fetchCategories();
    
    // 获取热门育儿知识
    await parentingTipsStore.fetchHotTips();
    
    // 获取育儿知识列表
    await fetchTips();
  });

  // 监听分类和搜索关键字变化
  watch([selectedCategory, searchKeyword], () => {
    currentPage.value = 1;
    fetchTips();
  });

  // 方法
  const fetchTips = async () => {
    // 设置筛选条件
    if (selectedCategory.value) {
      parentingTipsStore.setFilter('category', selectedCategory.value);
    } else {
      parentingTipsStore.setFilter('category', null);
    }
    
    if (searchKeyword.value) {
      parentingTipsStore.setFilter('keyword', searchKeyword.value);
    } else {
      parentingTipsStore.setFilter('keyword', '');
    }
    
    // 设置分页
    parentingTipsStore.setPagination(currentPage.value, pageSize.value);
    
    // 获取列表
    await parentingTipsStore.fetchTipsList();
  };

  const selectCategory = (categoryId) => {
    selectedCategory.value = categoryId;
  };

  const handleSearch = () => {
    fetchTips();
  };

  const handleSizeChange = (size) => {
    pageSize.value = size;
    fetchTips();
  };

  const handleCurrentChange = (page) => {
    currentPage.value = page;
    fetchTips();
  };

  const viewTipDetail = (id) => {
    router.push(`/parenting-tips/detail/${id}`);
  };

  const getCategoryName = (categoryId) => {
    return parentingTipsStore.getCategoryName(categoryId);
  };

  const getCategoryItemCount = (categoryId) => {
    const items = tipsList.value.filter(tip => tip.categoryId === categoryId);
    return items.length || 0;
  };

  const getListTitle = () => {
    if (searchKeyword.value) {
      return `搜索"${searchKeyword.value}"的结果`;
    } else if (selectedCategory.value) {
      return getCategoryName(selectedCategory.value);
    } else {
      return '所有育儿知识';
    }
  };

  const formatDate = (date) => {
    return formatDateUtil(date, 'YYYY-MM-DD');
  };

  return {
    // 状态
    searchKeyword,
    selectedCategory,
    currentPage,
    pageSize,
    
    // 计算属性
    tipsList,
    hotTips,
    categories,
    total,
    loading,
    hotLoading,
    categoriesLoading,
    
    // 方法
    fetchTips,
    selectCategory,
    handleSearch,
    handleSizeChange,
    handleCurrentChange,
    viewTipDetail,
    getCategoryName,
    getCategoryItemCount,
    getListTitle,
    formatDate
  };
} 