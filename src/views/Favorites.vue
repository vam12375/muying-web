<template>
  <div class="favorites-page">
    <main-layout>
      <!-- 顶部横幅 - 现代风格渐变背景 -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="container mx-auto py-10 px-4 relative z-10">
            <motion-div
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.7 }"
            >
              <h1 class="text-4xl font-bold text-white mb-3">我的收藏</h1>
              <p class="text-gray-100 text-opacity-90 text-lg max-w-lg">在这里找到您珍藏的所有宝贝好物</p>
            </motion-div>
          </div>
        </div>
        <div class="wave-decoration">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fill-opacity="1" d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,144C840,128,960,128,1080,149.3C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          </svg>
        </div>
      </section>
        
      <div class="container mx-auto px-4 pb-28 relative -mt-12">
        <!-- 筛选和操作 - 现代化卡片设计 -->
        <motion-div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.2 }"
        >
          <div class="filter-container bg-white rounded-2xl shadow-lg p-6 mb-6 backdrop-blur-sm bg-opacity-95 border border-gray-100">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center">
                <el-radio-group v-model="viewType" size="large" class="view-toggle-group">
                  <el-radio-button label="grid" class="toggle-btn">
                    <el-icon class="mr-1"><Grid /></el-icon>网格视图
                  </el-radio-button>
                  <el-radio-button label="list" class="toggle-btn">
                    <el-icon class="mr-1"><List /></el-icon>列表视图
                  </el-radio-button>
                </el-radio-group>
              </div>
              
              <div class="flex flex-wrap md:flex-nowrap items-center gap-3">
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索收藏商品"
                  clearable
                  class="w-full md:w-60 search-input"
                  @keyup.enter="handleSearch"
                >
                  <template #prefix>
                    <el-icon class="search-icon"><Search /></el-icon>
                  </template>
                </el-input>
                
                <el-select v-model="selectedSort" placeholder="排序方式" class="sort-select w-full md:w-auto">
                  <el-option label="最近收藏" value="latest" />
                  <el-option label="价格从低到高" value="price_asc" />
                  <el-option label="价格从高到低" value="price_desc" />
                  <el-option label="销量优先" value="sales_desc" />
                </el-select>
                
                <el-button type="primary" @click="handleSearch" class="search-button w-full md:w-auto">
                  <el-icon class="mr-1"><Search /></el-icon>搜索
                </el-button>
              </div>
            </div>
          </div>
        </motion-div>
        
        <!-- 收藏商品列表 - 优化卡片设计和动画 -->
        <motion-div
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.4 }"
        >
          <div class="content-container bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <!-- 空状态 - 更现代的空状态设计 -->
            <div v-if="!loading && favorites.length === 0" class="empty-state">
              <motion-div
                :initial="{ scale: 0.9, opacity: 0 }"
                :animate="{ scale: 1, opacity: 1 }"
                :transition="{ duration: 0.5 }"
              >
                <div class="empty-content py-16 px-4">
                  <div class="empty-icon-container mb-6">
                    <div class="empty-icon-bg">
                      <svg width="90" height="90" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.69C2 5.6 4.49 3.1 7.56 3.1C9.38 3.1 10.99 3.98 12 5.34C13.01 3.98 14.63 3.1 16.44 3.1C19.51 3.1 22 5.6 22 8.69C22 15.69 15.52 19.82 12.62 20.81Z" fill="#fcd0dc" stroke="#fc98b6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                  <h3 class="text-2xl font-medium mb-4 text-gray-800">收藏列表还是空的</h3>
                  <p class="text-gray-500 text-center max-w-md mx-auto mb-10">开始收藏您喜欢的宝贝好物，它们会显示在这里</p>
                  <el-button type="primary" @click="$router.push('/products')" size="large" class="go-shopping-btn">
                    <span>去选购商品</span>
                    <el-icon class="ml-2"><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </motion-div>
            </div>
            
            <!-- 加载中 - 优化加载状态 -->
            <div v-if="loading" class="loading-container">
              <div class="loading-animation py-16">
                <div class="spinner-container">
                  <div class="spinner"></div>
                </div>
                <p class="text-gray-500 mt-6">正在加载您的收藏商品...</p>
              </div>
            </div>
            
            <!-- 网格视图 - 改进卡片设计和动画 -->
            <transition-group 
              v-else-if="viewType === 'grid'" 
              name="grid-fade" 
              tag="div"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              appear
            >
              <div 
                v-for="(item, index) in favorites" 
                :key="item.id" 
                class="product-card"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div 
                  class="product-card-inner relative rounded-xl overflow-hidden transition-all duration-300"
                  :class="{ 'selected-card': item.selected }"
                >
                  <!-- 选择框 -->
                  <div class="select-overlay absolute top-3 left-3 z-30" @click.stop="handleItemSelect(item)">
                    <div class="checkbox-wrapper">
                      <el-checkbox v-model="item.selected" @click.stop size="large"></el-checkbox>
                    </div>
                  </div>
                  
                  <!-- 商品图片 -->
                  <div class="product-image-wrapper" @click="handleProductDetail(item)">
                    <el-image 
                      :src="item.image" 
                      :alt="item.name" 
                      fit="cover"
                      loading="lazy"
                      class="product-image"
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <div class="placeholder-spinner"></div>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="image-overlay"></div>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="product-actions">
                    <el-button 
                      circle 
                      type="danger" 
                      @click.stop="handleRemoveFavorite(item)"
                      class="action-btn"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  
                  <!-- 商品信息 -->
                  <div class="product-info p-4">
                    <h3 
                      class="product-title cursor-pointer"
                      @click="handleProductDetail(item)"
                    >
                      {{ item.name }}
                    </h3>
                    
                    <div class="product-meta">
                      <span v-if="item.category" class="category-tag">{{ item.category }}</span>
                      <span class="date-tag">{{ formatDate(item.createTime) }}</span>
                    </div>
                    
                    <div class="price-section">
                      <div class="price-display">
                        <span class="current-price">¥{{ item.price.toFixed(2) }}</span>
                        <span v-if="item.originalPrice && item.originalPrice > item.price" class="original-price">¥{{ item.originalPrice.toFixed(2) }}</span>
                      </div>
                      
                      <el-button 
                        size="small" 
                        type="primary" 
                        class="cart-btn"
                        @click="handleAddToCart(item)"
                      >
                        <el-icon><ShoppingCart /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
            
            <!-- 列表视图 - 改进列表设计和动画 -->
            <transition-group 
              v-else 
              name="list-fade" 
              tag="div"
              class="list-view space-y-4"
              appear
            >
              <div 
                v-for="(item, index) in favorites" 
                :key="item.id" 
                class="product-row"
                :style="{ animationDelay: `${index * 0.05}s` }"
              >
                <div 
                  class="flex items-center p-4 rounded-xl border border-gray-100 hover:border-primary hover:shadow-md transition-all duration-300"
                  :class="{ 'selected-row': item.selected }"
                >
                  <!-- 选择框 -->
                  <div class="mr-4">
                    <el-checkbox v-model="item.selected" @change="updateSelectedItems" size="large"></el-checkbox>
                  </div>
                  
                  <!-- 商品图片 -->
                  <div class="list-image-wrapper mr-4" @click="handleProductDetail(item)">
                    <el-image 
                      :src="item.image" 
                      :alt="item.name" 
                      fit="cover"
                      loading="lazy"
                      class="list-product-image"
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <div class="placeholder-spinner"></div>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  
                  <!-- 商品信息 -->
                  <div class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-3">
                    <div class="flex-1 min-w-0">
                      <h3 
                        class="text-base font-medium mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-1" 
                        @click="handleProductDetail(item)"
                      >
                        {{ item.name }}
                      </h3>
                      
                      <div class="text-sm text-gray-500 mb-2 line-clamp-1 hidden md:block">
                        {{ item.description }}
                      </div>
                      
                      <div class="list-meta">
                        <span class="list-tag date-tag"><el-icon><Calendar /></el-icon> {{ formatDate(item.createTime) }}</span>
                        <span v-if="item.category" class="list-tag category-tag"><el-icon><Collection /></el-icon> {{ item.category }}</span>
                        <span v-if="item.sales" class="list-tag sales-tag"><el-icon><Goods /></el-icon> {{ item.sales }}+</span>
                      </div>
                    </div>
                    
                    <!-- 价格和操作 -->
                    <div class="flex items-center justify-between md:w-64 gap-4">
                      <div class="price-display">
                        <div class="text-primary text-lg font-semibold">¥{{ item.price.toFixed(2) }}</div>
                        <div v-if="item.originalPrice && item.originalPrice > item.price" class="text-gray-400 text-xs line-through">¥{{ item.originalPrice.toFixed(2) }}</div>
                      </div>
                      
                      <div class="flex gap-2">
                        <el-button type="primary" size="small" @click="handleAddToCart(item)" class="cart-btn-list">
                          <el-icon class="mr-1"><ShoppingCart /></el-icon>加入购物车
                        </el-button>
                        <el-button type="danger" size="small" @click="handleRemoveFavorite(item)" class="delete-btn-list">
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition-group>
            
            <!-- 分页 - 优化分页设计 -->
            <div v-if="favorites.length > 0" class="pagination-container mt-10 flex justify-center">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 36, 48]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                class="custom-pagination"
              />
            </div>
          </div>
        </motion-div>
        
        <!-- 批量操作区域 - 改进交互设计 -->
        <transition name="fade-up">
          <div v-if="favorites.length > 0" class="batch-action-bar fixed left-0 right-0 bottom-0 z-50">
            <div class="container mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
              <div class="flex items-center gap-3">
                <el-checkbox v-model="selectAll" @change="handleSelectAll" class="custom-checkbox">全选</el-checkbox>
                <span class="selected-count">已选<span class="count-highlight">{{ selectedItems.length }}</span>件</span>
              </div>
              
              <div class="flex flex-wrap md:flex-nowrap gap-3 action-buttons">
                <el-button 
                  :disabled="selectedItems.length === 0" 
                  @click="handleBatchAddToCart"
                  class="batch-action-btn"
                >
                  <el-icon class="mr-1"><ShoppingCart /></el-icon>批量加入购物车
                </el-button>
                <el-button 
                  :disabled="selectedItems.length === 0" 
                  type="danger" 
                  @click="handleBatchRemove"
                  class="batch-action-btn"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>批量取消收藏
                </el-button>
                <el-button 
                  type="danger" 
                  plain 
                  @click="handleClearFavorites"
                  class="batch-action-btn"
                >
                  <el-icon class="mr-1"><Delete /></el-icon>清空收藏夹
                </el-button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Grid, List, Delete, Search, ShoppingCart, 
  Calendar, Collection, Goods, ArrowRight, Picture 
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, ElImage } from 'element-plus';
import { getFavorites, addFavorite, removeFavorite, clearFavorites } from '@/api/user';
import { useCartStore } from '@/stores/cart';
import { useMotion } from '@vueuse/motion';

const router = useRouter();
const cartStore = useCartStore();

// 状态变量
const loading = ref(false);
const favorites = ref([]);
const viewType = ref(localStorage.getItem('favorites_view_type') || 'grid');
const searchKeyword = ref('');
const selectedSort = ref('latest');
const currentPage = ref(1);
const pageSize = ref(24); // 增加默认每页商品数量
const total = ref(0);
const selectedItems = ref([]);
const selectAll = ref(false);

// 持久化视图类型
watch(viewType, (newVal) => {
  localStorage.setItem('favorites_view_type', newVal);
});

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true;
  selectedItems.value = [];
  selectAll.value = false;
  
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value || undefined,
      sort: selectedSort.value || undefined
    };
    
    const res = await getFavorites(params);
    
    if (res.code === 200 && res.data) {
      // 处理返回的收藏数据，确保数据格式统一
      favorites.value = res.data.records.map(item => {
        const product = item.product || {};
        return {
          id: item.favoriteId,
          productId: item.productId,
          name: product.productName || '未知商品',
          image: product.productImg ? `/products/${product.productImg}` 
                : '/images/product-placeholder.jpg',
          price: product.priceNew || 0,
          originalPrice: product.priceOld,
          description: product.productDetail 
                ? (product.productDetail.length > 100 
                    ? product.productDetail.substring(0, 100) + '...' 
                    : product.productDetail)
                : '暂无描述',
          createTime: item.createTime,
          category: getCategoryName(product.categoryId),
          sales: product.sales || 0,
          selected: false
        };
      });
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message || '获取收藏列表失败');
      favorites.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    ElMessage.error('获取收藏列表失败，请稍后再试');
    favorites.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 根据分类ID获取分类名称
const getCategoryName = (categoryId) => {
  const categoryMap = {
    1: '奶粉',
    2: '尿不湿',
    3: '服饰',
    4: '玩具',
    5: '洗护',
    6: '喂养'
  };
  return categoryMap[categoryId] || '未分类';
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 搜索 - 增加防抖
let searchTimer = null;
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  
  searchTimer = setTimeout(() => {
    currentPage.value = 1; // 重置到第一页
    fetchFavorites();
  }, 300);
};

// 页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchFavorites();
  
  // 滚动到页面顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
  fetchFavorites();
};

// 商品操作
const handleProductDetail = (item) => {
  router.push(`/product/${item.productId}`);
};

// 添加到购物车 - 增加动画反馈
const handleAddToCart = async (item) => {
  try {
    await cartStore.addToCart(item.productId, 1);
    ElMessage({
      message: '已添加到购物车',
      type: 'success',
      customClass: 'custom-message'
    });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    ElMessage.error('添加到购物车失败，请稍后再试');
  }
};

// 移除收藏
const handleRemoveFavorite = async (item) => {
  try {
    const res = await removeFavorite(item.id);
    if (res.code === 200) {
      ElMessage({
        message: '已从收藏中移除',
        type: 'success',
        customClass: 'custom-message'
      });
      fetchFavorites(); // 刷新列表
    } else {
      ElMessage.error(res.message || '移除收藏失败');
    }
  } catch (error) {
    console.error('移除收藏失败:', error);
    ElMessage.error('移除收藏失败，请稍后再试');
  }
};

// 选择相关
const updateSelectedItems = () => {
  selectedItems.value = favorites.value
    .filter(item => item.selected)
    .map(item => item.id);
  selectAll.value = selectedItems.value.length > 0 && selectedItems.value.length === favorites.value.length;
};

// 全选/取消全选
const handleSelectAll = (val) => {
  favorites.value.forEach(item => {
    item.selected = val;
  });
  updateSelectedItems();
};

// 处理单个商品选择
const handleItemSelect = (item) => {
  item.selected = !item.selected;
  updateSelectedItems();
};

// 批量添加到购物车
const handleBatchAddToCart = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }
  
  loading.value = true;
  try {
    // 找到选中的所有商品
    const selectedProducts = favorites.value.filter(item => 
      selectedItems.value.includes(item.id)
    );
    
    // 创建一个包含所有添加购物车操作的Promise数组
    const addToCartPromises = selectedProducts.map(item => 
      cartStore.addToCart(item.productId, 1)
    );
    
    // 等待所有添加操作完成
    await Promise.all(addToCartPromises);
    
    ElMessage({
      message: `已将${selectedProducts.length}件商品添加到购物车`,
      type: 'success',
      customClass: 'custom-message'
    });
  } catch (error) {
    console.error('批量添加到购物车失败:', error);
    ElMessage.error('批量添加到购物车失败，请稍后再试');
  } finally {
    loading.value = false;
  }
};

// 批量移除收藏
const handleBatchRemove = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要移除的商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要移除选中的 ${selectedItems.value.length} 个收藏商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true;
    try {
      // 创建一个包含所有删除操作的Promise数组
      const deletePromises = selectedItems.value.map(id => {
        return removeFavorite(id).then(res => {
          if (res.code !== 200) {
            throw new Error(res.message || `移除收藏ID:${id}失败`);
          }
          return res;
        });
      });
      
      // 等待所有删除操作完成
      await Promise.all(deletePromises);
      
      ElMessage({
        message: '批量移除收藏成功',
        type: 'success',
        customClass: 'custom-message'
      });
      selectedItems.value = [];
      selectAll.value = false;
      fetchFavorites(); // 刷新列表
    } catch (error) {
      console.error('批量移除收藏失败:', error);
      ElMessage.error('部分商品移除失败，请稍后再试');
      fetchFavorites(); // 刷新列表以获取最新状态
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 清空收藏夹
const handleClearFavorites = () => {
  if (favorites.value.length === 0) {
    ElMessage.warning('收藏夹已经是空的');
    return;
  }
  
  ElMessageBox.confirm('确定要清空所有收藏商品吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    loading.value = true;
    try {
      const res = await clearFavorites();
      if (res.code === 200) {
        ElMessage({
          message: '已清空收藏夹',
          type: 'success',
          customClass: 'custom-message'
        });
        currentPage.value = 1;
        fetchFavorites();
      } else {
        ElMessage.error(res.message || '清空收藏夹失败');
      }
    } catch (error) {
      console.error('清空收藏夹失败:', error);
      ElMessage.error('清空收藏夹失败，请稍后再试');
    } finally {
      loading.value = false;
    }
  }).catch(() => {
    // 用户取消操作
  });
};

// 监听排序方式变化
watch(selectedSort, () => {
  currentPage.value = 1; // 重置到第一页
  fetchFavorites();
});

// 组件挂载时获取收藏列表
onMounted(() => {
  fetchFavorites();
});

// 组件卸载时清理
onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f9fafc;
  padding-bottom: 80px; /* 为底部操作栏留出空间 */
}

/* 顶部横幅 */
.hero-section {
  position: relative;
  overflow: hidden;
}

.hero-content {
  background: linear-gradient(135deg, #ff7eb3, #ff6b9c, #ff4785);
  padding-bottom: 40px;
  position: relative;
}

.hero-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.wave-decoration {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 70px;
  line-height: 0;
  z-index: 1;
}

.wave-decoration svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 70px;
  filter: drop-shadow(0 -1px 2px rgba(0,0,0,0.03));
}

/* 筛选容器 */
.filter-container {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.view-toggle-group :deep(.el-radio-button__inner) {
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
  font-weight: 500;
  padding: 10px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.view-toggle-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px;
}

.view-toggle-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px;
}

.view-toggle-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.2);
  transform: translateY(-1px);
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1px 16px;
}

.search-input:hover :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
}

.sort-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-button {
  border-radius: 10px;
  transition: all 0.3s ease;
  padding: 12px 20px;
  font-weight: 500;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.25);
}

/* 内容容器 */
.content-container {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

/* 产品卡片 - 网格视图 */
.product-card {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
}

.product-card-inner {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.product-card-inner:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 0, 0, 0.08);
}

.selected-card {
  border: 2px solid var(--el-color-primary) !important;
  box-shadow: 0 5px 15px rgba(var(--el-color-primary-rgb), 0.15) !important;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  overflow: hidden;
  background-color: #f8f9fc;
  cursor: pointer;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
  padding: 10px;
}

.product-card-inner:hover .product-image {
  transform: scale(1.06);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(0deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 50%);
  transition: background 0.3s ease;
}

.product-card-inner:hover .image-overlay {
  background: linear-gradient(0deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 60%);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fc;
}

.placeholder-spinner {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(var(--el-color-primary-rgb), 0.2);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fc;
  color: #ccc;
  font-size: 24px;
}

.product-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card-inner:hover .product-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  width: 40px;
  height: 40px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
}

.product-info {
  background: white;
}

.product-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
  transition: color 0.2s ease;
}

.product-title:hover {
  color: var(--el-color-primary);
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 12px;
}

.category-tag, .date-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  background: #f0f3f8;
  color: #666;
}

.category-tag {
  color: #ff92a5;
  background: #fff0f3;
}

.price-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.price-display {
  display: flex;
  flex-direction: column;
}

.current-price {
  font-weight: 600;
  color: var(--el-color-primary);
  font-size: 1.1rem;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.cart-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cart-btn:hover, .cart-btn-list:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(var(--el-color-primary-rgb), 0.2);
}

.checkbox-wrapper {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 2px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.checkbox-wrapper:hover {
  transform: scale(1.05);
}

/* 列表视图 */
.product-row {
  opacity: 0;
  animation: fadeInUp 0.5s forwards;
}

.list-image-wrapper {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #f8f9fc;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.list-product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 5px;
  transition: transform 0.3s ease;
}

.list-image-wrapper:hover .list-product-image {
  transform: scale(1.08);
}

.list-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.list-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f5f7fa;
  color: #666;
  font-size: 12px;
  transition: all 0.3s ease;
}

.list-tag.category-tag {
  color: #ff92a5;
  background: #fff0f3;
}

.list-tag.sales-tag {
  color: #5e9eff;
  background: #f0f7ff;
}

.list-tag.date-tag {
  color: #666;
  background: #f0f3f8;
}

.cart-btn-list, .delete-btn-list {
  transition: all 0.3s ease;
}

.delete-btn-list:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(var(--el-color-danger-rgb), 0.2);
}

/* 批量操作栏 */
.batch-action-bar {
  background: white;
  border-top: 1px solid #eaeaea;
  padding: 14px 16px;
  box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08);
}

.batch-action-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 16px;
}

.batch-action-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.custom-checkbox {
  font-weight: 500;
}

.selected-count {
  font-size: 14px;
}

.count-highlight {
  color: var(--el-color-primary);
  font-weight: 600;
  margin: 0 4px;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid-fade-enter-active,
.grid-fade-leave-active,
.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.grid-fade-enter-from,
.list-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.grid-fade-leave-to,
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 加载动画 */
.spinner-container {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--el-color-primary-rgb), 0.1);
  border-top: 3px solid var(--el-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-content {
  text-align: center;
}

.empty-icon-container {
  display: flex;
  justify-content: center;
}

.empty-icon-bg {
  background: white;
  padding: 16px;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(252, 152, 182, 0.18);
  display: inline-flex;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 10px 25px rgba(252, 152, 182, 0.18); }
  50% { transform: scale(1.05); box-shadow: 0 15px 30px rgba(252, 152, 182, 0.25); }
  100% { transform: scale(1); box-shadow: 0 10px 25px rgba(252, 152, 182, 0.18); }
}

.go-shopping-btn {
  display: inline-flex;
  align-items: center;
  padding: 12px 30px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-radius: 10px;
  font-weight: 500;
  font-size: 16px;
}

.go-shopping-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(var(--el-color-primary-rgb), 0.3);
}

/* 分页自定义样式 */
.custom-pagination :deep(.el-pagination__sizes .el-select .el-input),
.custom-pagination :deep(.el-pagination button),
.custom-pagination :deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.custom-pagination :deep(.el-pagination .el-pager li.is-active) {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: 600;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(var(--el-color-primary-rgb), 0.2);
}

/* 自定义消息样式 */
:global(.custom-message) {
  border-radius: 10px !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12) !important;
  padding: 12px 20px !important;
}

/* 自适应优化 */
@media (max-width: 768px) {
  .product-meta, .list-meta {
    margin-top: 2px;
  }
  
  .batch-action-bar {
    padding: 10px;
  }
  
  .batch-action-bar .action-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .batch-action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .product-actions {
    opacity: 1;
    transform: translateX(0);
  }
  
  .hero-content {
    padding-bottom: 30px;
  }
  
  .list-image-wrapper {
    width: 80px;
    height: 80px;
  }
  
  .selected-count {
    display: none;
  }
}

@media (max-width: 640px) {
  .list-image-wrapper {
    width: 70px;
    height: 70px;
  }
  
  .batch-action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .empty-icon-bg {
    padding: 12px;
  }
}

@media (min-width: 1024px) {
  .batch-action-btn {
    min-width: 150px;
  }
}
</style> 
