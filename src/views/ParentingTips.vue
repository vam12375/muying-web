<template>
  <div class="parenting-tips-container">
    <div class="page-header">
      <h1>母婴育儿知识库</h1>
      <p>专业的母婴育儿知识，助您轻松解决育儿难题</p>
    </div>

    <div class="content-wrapper">
      <!-- 左侧分类列表 -->
      <div class="categories-sidebar">
        <h3>知识分类</h3>
        <div class="category-list">
          <el-skeleton v-if="categoriesLoading" :rows="5" animated />
          <template v-else>
            <div 
              class="category-item" 
              :class="{ active: !selectedCategory }"
              @click="selectCategory(null)"
            >
              全部分类
            </div>
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
              <span class="count">({{ getCategoryItemCount(category.id) }})</span>
            </div>
          </template>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="tips-content">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索育儿知识"
            prefix-icon="el-icon-search"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 热门育儿知识 -->
        <div class="hot-tips" v-if="!searchKeyword && !selectedCategory">
          <h2>热门育儿知识</h2>
          <el-skeleton v-if="hotLoading" :rows="3" animated />
          <div v-else class="hot-tips-list">
            <div 
              v-for="tip in hotTips" 
              :key="tip.id"
              class="hot-tip-item"
              @click="viewTipDetail(tip.id)"
            >
              <div class="hot-tip-img" v-if="tip.coverImage">
                <img :src="tip.coverImage" :alt="tip.title">
              </div>
              <div class="hot-tip-info">
                <h3>{{ tip.title }}</h3>
                <p class="summary">{{ tip.summary }}</p>
                <div class="meta">
                  <span class="category">{{ getCategoryName(tip.categoryId) }}</span>
                  <span class="author">{{ tip.author }}</span>
                  <span class="date">{{ formatDate(tip.publishTime) }}</span>
                  <span class="views"><i class="el-icon-view"></i> {{ tip.viewCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 育儿知识列表 -->
        <div class="tips-list">
          <h2>{{ getListTitle() }}</h2>
          
          <el-empty 
            v-if="tipsList.length === 0 && !loading" 
            description="暂无相关育儿知识" 
          />
          
          <el-skeleton v-else-if="loading" :rows="10" animated />
          
          <div v-else class="tips-items">
            <div 
              v-for="tip in tipsList" 
              :key="tip.id"
              class="tip-item"
              @click="viewTipDetail(tip.id)"
            >
              <div class="tip-img" v-if="tip.coverImage">
                <img :src="tip.coverImage" :alt="tip.title">
              </div>
              <div class="tip-info">
                <h3>{{ tip.title }}</h3>
                <p class="summary">{{ tip.summary }}</p>
                <div class="meta">
                  <span class="category">{{ getCategoryName(tip.categoryId) }}</span>
                  <span class="author">{{ tip.author }}</span>
                  <span class="date">{{ formatDate(tip.publishTime) }}</span>
                  <span class="views"><i class="el-icon-view"></i> {{ tip.viewCount }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 分页器 -->
          <div class="pagination" v-if="tipsList.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :layout="'total, sizes, prev, pager, next, jumper'"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import useParentingTips from '@/scripts/ParentingTips';

const {
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
} = useParentingTips();
</script>

<style scoped>
.parenting-tips-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.categories-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.categories-sidebar h3 {
  margin-bottom: 15px;
  font-size: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.category-item {
  padding: 10px 0;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
  padding-left: 10px;
  margin-bottom: 5px;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.category-item.active {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: bold;
}

.count {
  color: #999;
  font-size: 12px;
  margin-left: 5px;
}

.tips-content {
  flex: 1;
}

.search-bar {
  margin-bottom: 20px;
}

.hot-tips {
  margin-bottom: 30px;
}

.hot-tips h2,
.tips-list h2 {
  font-size: 20px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.hot-tips-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.hot-tip-item,
.tip-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  display: flex;
  margin-bottom: 20px;
}

.hot-tip-item:hover,
.tip-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.hot-tip-img,
.tip-img {
  width: 120px;
  height: 120px;
  overflow: hidden;
  flex-shrink: 0;
}

.hot-tip-img img,
.tip-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-tip-info,
.tip-info {
  padding: 15px;
  flex: 1;
}

.hot-tip-info h3,
.tip-info h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.meta {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .categories-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .hot-tips-list {
    grid-template-columns: 1fr;
  }
}
</style> 