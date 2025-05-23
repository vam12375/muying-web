<template>
  <div class="parenting-tip-detail-container">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else-if="!currentTip" class="not-found-container">
      <el-empty description="未找到育儿知识" />
      <el-button @click="goBack" type="primary">返回列表</el-button>
    </div>
    
    <template v-else>
      <!-- 文章头部 -->
      <div class="article-header">
        <h1>{{ currentTip.title }}</h1>
        <div class="article-meta">
          <span class="category">{{ getCategoryName(currentTip.categoryId) }}</span>
          <span class="author">作者: {{ currentTip.author }}</span>
          <span class="publish-time">发布时间: {{ formatDate(currentTip.publishTime) }}</span>
          <span class="view-count">阅读量: {{ currentTip.viewCount }}</span>
        </div>
      </div>
      
      <!-- 文章封面图 -->
      <div class="cover-image" v-if="currentTip.coverImage">
        <img :src="currentTip.coverImage" :alt="currentTip.title">
      </div>
      
      <!-- 文章摘要 -->
      <div class="article-summary">
        <p>{{ currentTip.summary }}</p>
      </div>
      
      <!-- 文章正文 -->
      <div class="article-content">
        <div v-html="formattedContent"></div>
      </div>
      
      <!-- 相关文章 -->
      <div class="related-articles" v-if="relatedTips.length > 0">
        <h3>相关育儿知识</h3>
        <div class="related-list">
          <div 
            v-for="tip in relatedTips" 
            :key="tip.id"
            class="related-item"
            @click="viewTipDetail(tip.id)"
          >
            <div class="related-img" v-if="tip.coverImage">
              <img :src="tip.coverImage" :alt="tip.title">
            </div>
            <div class="related-info">
              <h4>{{ tip.title }}</h4>
              <p>{{ tip.summary }}</p>
              <div class="related-meta">
                <span class="category">{{ getCategoryName(tip.categoryId) }}</span>
                <span class="author">{{ tip.author }}</span>
                <span class="date">{{ formatDate(tip.publishTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 用户评论 -->
      <div class="comments-section">
        <h3>用户评论</h3>
        
        <!-- 评论表单 -->
        <div class="comment-form">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="4"
            placeholder="分享您的看法和经验..."
            maxlength="500"
            show-word-limit
          />
          <div class="form-actions">
            <el-button type="primary" @click="submitComment" :loading="commentSubmitting">
              发表评论
            </el-button>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <el-empty 
            v-if="comments.length === 0 && !commentsLoading" 
            description="暂无评论，快来发表您的看法" 
          />
          
          <el-skeleton v-else-if="commentsLoading" :rows="3" animated />
          
          <div v-else class="comment-items">
            <div v-for="comment in comments" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :size="40" :src="comment.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="username">{{ comment.username }}</span>
                  <span class="time">{{ formatDate(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
              </div>
            </div>
          </div>
          
          <!-- 评论分页 -->
          <div class="comment-pagination" v-if="comments.length > 0">
            <el-pagination
              v-model:current-page="commentPage"
              :page-size="commentPageSize"
              layout="prev, pager, next"
              :total="commentTotal"
              @current-change="handleCommentPageChange"
            />
          </div>
        </div>
      </div>
    </template>
    
    <!-- 返回顶部 -->
    <el-backtop />
  </div>
</template>

<script setup>
import useParentingTipDetail from '@/scripts/ParentingTipDetail';

const {
  // 状态
  loading,
  currentTip,
  relatedTips,
  comments,
  commentContent,
  commentPage,
  commentPageSize,
  commentTotal,
  commentsLoading,
  commentSubmitting,
  formattedContent,
  
  // 方法
  fetchComments,
  submitComment,
  handleCommentPageChange,
  getCategoryName,
  viewTipDetail,
  goBack,
  formatDate
} = useParentingTipDetail();
</script>

<style scoped>
.parenting-tip-detail-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.not-found-container {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.article-header {
  margin-bottom: 24px;
}

.article-header h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: #333;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.category {
  padding: 2px 8px;
  background-color: #ecf5ff;
  color: #409EFF;
  border-radius: 4px;
}

.cover-image {
  margin-bottom: 24px;
  text-align: center;
}

.cover-image img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-summary {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f7fa;
  border-left: 4px solid #409EFF;
  border-radius: 4px;
  font-size: 16px;
  color: #666;
  line-height: 1.6;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 40px;
}

.article-content :deep(a) {
  color: #409EFF;
  text-decoration: none;
}

.article-content :deep(a:hover) {
  text-decoration: underline;
}

.article-content :deep(h2) {
  font-size: 22px;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.article-content :deep(h3) {
  font-size: 18px;
  margin: 20px 0 12px;
}

.article-content :deep(p) {
  margin-bottom: 16px;
}

.article-content :deep(ul), 
.article-content :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.article-content :deep(blockquote) {
  margin: 16px 0;
  padding: 16px;
  background-color: #f5f7fa;
  border-left: 4px solid #ddd;
  color: #666;
}

.related-articles {
  margin-top: 40px;
  margin-bottom: 40px;
}

.related-articles h3 {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.related-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.related-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
}

.related-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.related-img {
  height: 150px;
  overflow: hidden;
}

.related-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  padding: 15px;
}

.related-info h4 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.related-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.comments-section {
  margin-top: 40px;
}

.comments-section h3 {
  font-size: 22px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.comment-form {
  margin-bottom: 24px;
}

.form-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.comments-list {
  margin-top: 24px;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  background-color: #fff;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
  color: #333;
}

.time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  color: #333;
  line-height: 1.6;
}

.comment-pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .article-header h1 {
    font-size: 24px;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .related-list {
    grid-template-columns: 1fr;
  }
}
</style> 