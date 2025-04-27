<template>
  <div class="favorites-page">
    <main-layout>
      <div class="container mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold mb-6">我的收藏</h1>
        
        <!-- 筛选和操作 -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center">
              <el-radio-group v-model="viewType" size="large">
                <el-radio-button label="grid">
                  <el-icon class="mr-1"><Grid /></el-icon>网格视图
                </el-radio-button>
                <el-radio-button label="list">
                  <el-icon class="mr-1"><List /></el-icon>列表视图
                </el-radio-button>
              </el-radio-group>
            </div>
            
            <div class="flex items-center gap-3">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索收藏商品"
                prefix-icon="Search"
                clearable
                class="w-60"
                @keyup.enter="handleSearch"
              />
              
              <el-select v-model="selectedSort" placeholder="排序方式">
                <el-option label="最近收藏" value="latest" />
                <el-option label="价格从低到高" value="price_asc" />
                <el-option label="价格从高到低" value="price_desc" />
              </el-select>
              
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </div>
          </div>
        </div>
        
        <!-- 收藏商品列表 -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <el-empty v-if="!loading && favorites.length === 0" description="暂无收藏商品"></el-empty>
          
          <div v-if="loading" class="loading-skeleton">
            <el-skeleton :rows="3" animated />
          </div>
          
          <!-- 网格视图 -->
          <div v-else-if="viewType === 'grid'" class="grid-view">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <div v-for="item in favorites" :key="item.id" class="product-card">
                <div class="relative border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                  <div class="relative product-image-wrapper">
                    <img :src="item.image" alt="商品图片" class="w-full aspect-square object-cover">
                    <div class="absolute top-2 right-2 z-10">
                      <el-button circle type="danger" size="small" @click.stop="handleRemoveFavorite(item)">
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                  
                  <div class="p-3">
                    <h3 class="text-sm font-medium line-clamp-2 mb-2 cursor-pointer" @click="handleProductDetail(item)">
                      {{ item.name }}
                    </h3>
                    
                    <div class="flex justify-between items-center">
                      <div class="text-primary text-base font-semibold">¥{{ item.price.toFixed(2) }}</div>
                      <el-button size="small" type="primary" @click="handleAddToCart(item)">加入购物车</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 列表视图 -->
          <div v-else class="list-view space-y-4">
            <div v-for="item in favorites" :key="item.id" class="product-row border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-md">
              <div class="flex flex-wrap md:flex-nowrap gap-4">
                <div class="product-img-wrapper">
                  <img :src="item.image" alt="商品图片" class="w-24 h-24 object-cover rounded cursor-pointer" @click="handleProductDetail(item)">
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-medium mb-2 cursor-pointer hover:text-primary" @click="handleProductDetail(item)">
                    {{ item.name }}
                  </h3>
                  
                  <div class="text-sm text-gray-500 mb-2">
                    {{ item.description }}
                  </div>
                  
                  <div class="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                    <span>收藏时间: {{ formatDate(item.createTime) }}</span>
                    <span v-if="item.category">分类: {{ item.category }}</span>
                    <span v-if="item.sales">销量: {{ item.sales }}+</span>
                  </div>
                </div>
                
                <div class="flex flex-col justify-between items-end gap-2 min-w-[140px]">
                  <div class="text-primary text-lg font-semibold">¥{{ item.price.toFixed(2) }}</div>
                  
                  <div class="flex flex-col gap-2">
                    <el-button type="primary" size="small" @click="handleAddToCart(item)">加入购物车</el-button>
                    <el-button type="danger" size="small" @click="handleRemoveFavorite(item)">取消收藏</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页 -->
          <div class="pagination-container mt-6 flex justify-center">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        
        <!-- 批量操作区域 -->
        <div v-if="favorites.length > 0" class="batch-action-bar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-up py-3 px-4 z-10">
          <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center gap-3">
              <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
              <span>已选{{ selectedItems.length }}件</span>
            </div>
            
            <div class="flex gap-3">
              <el-button :disabled="selectedItems.length === 0" @click="handleBatchAddToCart">
                批量加入购物车
              </el-button>
              <el-button :disabled="selectedItems.length === 0" type="danger" @click="handleBatchRemove">
                批量取消收藏
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main-layout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Grid, List, Delete, Search } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// 状态变量
const loading = ref(false);
const favorites = ref([]);
const viewType = ref('grid');
const searchKeyword = ref('');
const selectedSort = ref('latest');
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const selectedItems = ref([]);
const selectAll = ref(false);

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true;
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟收藏数据
    const mockFavorites = [
      {
        id: 1,
        name: '婴儿奶粉配方',
        image: '/images/product1.jpg',
        price: 199,
        description: '高品质婴儿奶粉，富含DHA，益生菌和多种矿物质',
        createTime: '2023-05-01 10:30:00',
        category: '奶粉/辅食',
        sales: 2560,
        selected: false
      },
      {
        id: 2,
        name: '婴儿推车轻便可折叠',
        image: '/images/product2.jpg',
        price: 1299,
        description: '轻便可折叠婴儿推车，避震设计，透气网布，舒适安全',
        createTime: '2023-04-28 15:45:00',
        category: '童车/座椅',
        sales: 1870,
        selected: false
      },
      {
        id: 3,
        name: '婴儿洗护套装',
        image: '/images/product3.jpg',
        price: 199,
        description: '天然无香精配方，温和不刺激，宝宝专用洗护套装',
        createTime: '2023-04-26 09:20:00',
        category: '洗护用品',
        sales: 3650,
        selected: false
      },
      {
        id: 4,
        name: '婴儿床上用品',
        image: '/images/product4.jpg',
        price: 439,
        description: '纯棉婴儿床品四件套，柔软透气，多种颜色可选',
        createTime: '2023-04-25 14:10:00',
        category: '寝具/床品',
        sales: 1240,
        selected: false
      },
      {
        id: 5,
        name: '婴儿学步车',
        image: '/images/product5.jpg',
        price: 689,
        description: '多功能学步车，带音乐灯光，可调节高度，适合6-18个月宝宝',
        createTime: '2023-04-20 16:15:00',
        category: '童车/座椅',
        sales: 960,
        selected: false
      },
      {
        id: 6,
        name: '婴儿硅胶餐盘',
        image: '/images/product6.jpg',
        price: 89,
        description: '食品级硅胶材质，防滑底座，训练宝宝自主进食',
        createTime: '2023-04-15 11:30:00',
        category: '奶瓶/餐具',
        sales: 2980,
        selected: false
      },
      {
        id: 7,
        name: '婴儿牙胶',
        image: '/images/product7.jpg',
        price: 59,
        description: '医用级硅胶，安全无毒，符合宝宝口腔发育需求',
        createTime: '2023-04-12 09:45:00',
        category: '奶瓶/餐具',
        sales: 4200,
        selected: false
      },
      {
        id: 8,
        name: '婴儿游泳池',
        image: '/images/product8.jpg',
        price: 269,
        description: '加厚充气游泳池，环保PVC材质，带打气泵',
        createTime: '2023-04-10 13:20:00',
        category: '洗护用品',
        sales: 860,
        selected: false
      }
    ];
    
    // 应用排序
    if (selectedSort.value === 'price_asc') {
      mockFavorites.sort((a, b) => a.price - b.price);
    } else if (selectedSort.value === 'price_desc') {
      mockFavorites.sort((a, b) => b.price - a.price);
    } else {
      // 默认按收藏时间排序
      mockFavorites.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
    }
    
    // 应用搜索过滤
    let filteredFavorites = mockFavorites;
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      filteredFavorites = mockFavorites.filter(item => 
        item.name.toLowerCase().includes(keyword) || 
        item.description.toLowerCase().includes(keyword) ||
        (item.category && item.category.toLowerCase().includes(keyword))
      );
    }
    
    // 分页
    total.value = filteredFavorites.length;
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    favorites.value = filteredFavorites.slice(start, end);
    
  } catch (error) {
    console.error('获取收藏列表失败', error);
    ElMessage.error('获取收藏列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchFavorites();
};

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size;
  fetchFavorites();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  fetchFavorites();
};

// 商品操作
const handleProductDetail = (item) => {
  router.push(`/product/${item.id}`);
};

const handleAddToCart = (item) => {
  ElMessage.success(`已将"${item.name}"加入购物车`);
};

const handleRemoveFavorite = (item) => {
  ElMessageBox.confirm('确定将该商品从收藏夹中删除?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    favorites.value = favorites.value.filter(i => i.id !== item.id);
    total.value--;
    ElMessage.success('已取消收藏');
    // 更新选中状态
    selectedItems.value = selectedItems.value.filter(id => id !== item.id);
  }).catch(() => {
    // 取消操作
  });
};

// 选择相关
const handleSelectItem = (item) => {
  item.selected = !item.selected;
  updateSelectedItems();
};

const updateSelectedItems = () => {
  selectedItems.value = favorites.value.filter(item => item.selected).map(item => item.id);
  selectAll.value = selectedItems.value.length === favorites.value.length;
};

const handleSelectAll = (value) => {
  favorites.value.forEach(item => {
    item.selected = value;
  });
  updateSelectedItems();
};

// 批量操作
const handleBatchAddToCart = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }
  
  const selectedProducts = favorites.value.filter(item => selectedItems.value.includes(item.id));
  ElMessage.success(`已将${selectedProducts.length}个商品添加到购物车`);
};

const handleBatchRemove = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要取消收藏选中的${selectedItems.value.length}个商品吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟从收藏列表中移除
    favorites.value = favorites.value.filter(item => !selectedItems.value.includes(item.id));
    total.value -= selectedItems.value.length;
    selectedItems.value = [];
    selectAll.value = false;
    ElMessage.success('已批量取消收藏');
  }).catch(() => {
    // 取消操作
  });
};

// 监听排序方式变化
watch(selectedSort, () => {
  fetchFavorites();
});

// 初始化
onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 70px; /* 为底部操作栏留出空间 */
}

.product-image-wrapper {
  aspect-ratio: 1;
}

.product-img-wrapper img {
  transition: transform 0.3s ease;
}

.product-img-wrapper img:hover {
  transform: scale(1.05);
}

.shadow-up {
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}
</style> 
