<template>
  <div class="user-comments">
    <div class="section-header">
      <h2 class="section-title">我的评价</h2>
    </div>

    <!-- 添加选项卡组件 -->
    <el-tabs v-model="activeTab" class="comment-tabs">
      <el-tab-pane label="评价列表" name="list">
        <div class="section-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称"
            clearable
            prefix-icon="Search"
            @input="handleSearch"
            class="search-input"
          />
          <el-select v-model="filterRating" placeholder="评分筛选" @change="handleFilterChange" class="filter-select">
            <el-option label="全部评分" value="" />
            <el-option label="好评 (4-5星)" value="good" />
            <el-option label="中评 (3星)" value="neutral" />
            <el-option label="差评 (1-2星)" value="bad" />
          </el-select>
          <el-select v-model="filterTagId" placeholder="标签筛选" @change="handleTagFilterChange" class="filter-select">
            <el-option label="全部标签" :value="0" />
            <el-option v-for="tag in hotTags" :key="tag.tagId" :label="tag.tagName" :value="tag.tagId" />
          </el-select>
        </div>

        <div class="comments-stats">
          <div class="stat-item">
            <div class="stat-value">{{ totalComments }}</div>
            <div class="stat-label">总评价数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ averageRating.toFixed(1) }}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ goodRatingPercentage }}%</div>
            <div class="stat-label">好评率</div>
          </div>
        </div>

        <div class="sort-bar">
          <span class="sort-label">排序方式:</span>
          <div class="sort-options">
            <div 
              class="sort-option" 
              :class="{ active: sortField === 'createTime' }"
              @click="handleSortChange('createTime')"
            >
              <span>时间</span>
              <el-icon :class="getSortIconClass('createTime')"><Sort /></el-icon>
            </div>
            <div 
              class="sort-option" 
              :class="{ active: sortField === 'rating' }"
              @click="handleSortChange('rating')"
            >
              <span>评分</span>
              <el-icon :class="getSortIconClass('rating')"><Sort /></el-icon>
            </div>
          </div>
        </div>

        <div class="comments-list" v-loading="loading">
          <div v-if="filteredComments.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无评价记录" />
          </div>

          <div v-else class="comment-items">
            <div v-for="comment in filteredComments" :key="comment.commentId" class="comment-item">
              <div class="comment-product">
                <div class="product-image">
                  <el-image :src="comment.productImage" fit="cover" @click="goToProduct(comment.productId)">
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                <div class="product-info">
                  <div class="product-name" @click="goToProduct(comment.productId)">{{ comment.productName }}</div>
                  <div class="comment-time">{{ formatDate(comment.createTime) }}</div>
                </div>
              </div>

              <div class="comment-content">
                <div class="rating-row">
                  <el-rate v-model="comment.rating" disabled />
                  <div class="rating-text">{{ getRatingText(comment.rating) }}</div>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                
                <!-- 评价标签 -->
                <div v-if="comment.tags && comment.tags.length > 0" class="comment-tags">
                  <el-tag
                    v-for="tag in comment.tags"
                    :key="tag.tagId"
                    size="small"
                    effect="light"
                    class="comment-tag"
                    @click="filterByTag(tag.tagId)"
                  >
                    {{ tag.tagName }}
                  </el-tag>
                </div>
                
                <div v-if="comment.images && comment.images.length > 0" class="comment-images">
                  <el-image 
                    v-for="(image, index) in comment.images" 
                    :key="index" 
                    :src="image" 
                    fit="cover" 
                    class="comment-image"
                    :preview-src-list="comment.images"
                  />
                </div>
                
                <!-- 评价回复部分 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
                  <div class="replies-title">
                    <el-icon><ChatDotRound /></el-icon>
                    <span>商家回复</span>
                  </div>
                  <div v-for="reply in comment.replies" :key="reply.replyId" class="reply-item">
                    <div class="reply-header">
                      <div class="reply-user">
                        <span class="reply-user-name">{{ reply.replyUserNickname || reply.replyUserName || '商家' }}</span>
                        <span class="reply-time">{{ formatDate(reply.createTime) }}</span>
                      </div>
                    </div>
                    <div class="reply-content">{{ reply.content }}</div>
                  </div>
                </div>
                
                <div class="comment-actions">
                  <el-button type="primary" size="small" plain @click="editComment(comment)">
                    <el-icon><Edit /></el-icon> 修改评价
                  </el-button>
                  <el-button type="danger" size="small" plain @click="confirmDeleteComment(comment)">
                    <el-icon><Delete /></el-icon> 删除评价
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination-container" v-if="totalComments > pageSize">
            <el-pagination
              background
              layout="prev, pager, next"
              :total="totalComments"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="评价统计" name="stats">
        <comment-stats />
        <unrated-order-reminder />
      </el-tab-pane>
      
      <el-tab-pane label="评价分析" name="analysis">
        <el-row :gutter="20">
          <el-col :span="24">
            <comment-keywords />
          </el-col>
        </el-row>
        <el-row :gutter="20" class="mt-4">
          <el-col :span="24">
            <comment-sentiment />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑评价对话框 -->
    <el-dialog v-model="editDialogVisible" title="修改评价" width="650px">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="editForm.rating" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" />
        </el-form-item>
        
        <el-form-item label="评价内容" prop="content">
          <el-input 
            v-model="editForm.content" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入评价内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="评价图片">
          <div class="edit-images">
            <div v-if="editForm.images && editForm.images.length > 0" class="image-list">
              <div v-for="(image, index) in editForm.images" :key="index" class="image-item">
                <el-image :src="image" fit="cover" />
                <div class="image-actions">
                  <el-button type="danger" circle size="small" @click="removeImage(index)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
            
            <el-upload
              v-if="editForm.images && editForm.images.length < 5"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :on-change="handleImageChange"
              :limit="5 - (editForm.images ? editForm.images.length : 0)"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
          <div class="upload-tip">最多上传5张图片，每张不超过5MB</div>
        </el-form-item>
        
        <el-form-item label="匿名评价">
          <el-switch v-model="editForm.isAnonymous" :active-value="1" :inactive-value="0" />
        </el-form-item>
        
        <el-form-item label="评价标签">
          <div class="tag-selector">
            <div class="tag-list">
              <el-tag
                v-for="tag in editForm.tags"
                :key="tag.tagId"
                closable
                @close="removeTag(tag)"
                class="edit-tag"
              >
                {{ tag.tagName }}
              </el-tag>
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                class="tag-input"
                size="small"
                @keyup.enter="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
              />
              <el-button v-else class="tag-button" size="small" @click="showTagInput">
                + 添加标签
              </el-button>
            </div>
            <div class="recommended-tags">
              <p class="recommended-title">推荐标签:</p>
              <div class="tag-suggestions">
                <el-tag
                  v-for="tag in recommendedTags"
                  :key="tag.tagId"
                  size="small"
                  effect="plain"
                  @click="addRecommendedTag(tag)"
                  class="recommended-tag"
                  :class="{ 'is-selected': isTagSelected(tag) }"
                >
                  {{ tag.tagName }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm" :loading="submitting">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getUserComments, 
  deleteComment, 
  updateComment, 
  getUserCommentPage, 
  searchUserComments,
  getCommentReplies,
  deleteCommentReply,
  getHotTags,
  getRecommendedTags,
  getCommentTags,
  updateCommentTags,
  getUserCommentsByTag,
  getUserCommentStats
} from '@/api/comment'
import { useUserStore } from '@/stores/user'
import { Picture, Edit, Delete, Close, Plus, Search, Sort, ChatDotRound } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import CommentStats from '@/components/user/CommentStats.vue'
import UnratedOrderReminder from '@/components/user/UnratedOrderReminder.vue'
import CommentKeywords from '@/components/user/CommentKeywords.vue'
import CommentSentiment from '@/components/user/CommentSentiment.vue'

// 路由
const router = useRouter()

// 用户存储
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const comments = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)
const searchKeyword = ref('')
const filterRating = ref('')
const sortField = ref('createTime')
const sortOrder = ref('desc')
const editDialogVisible = ref(false)
const editForm = reactive({
  commentId: null,
  rating: 5,
  content: '',
  images: [],
  isAnonymous: 0,
  tags: []
})

// 表单校验规则
const rules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, max: 500, message: '评价内容长度应在5到500个字符之间', trigger: 'blur' }
  ]
}

// 表单引用
const editFormRef = ref(null)

// 标签相关状态
const filterTagId = ref(0)
const hotTags = ref([])
const recommendedTags = ref([])
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const tagInputRef = ref(null)

// 激活的选项卡
const activeTab = ref('list')

// 计算属性：过滤后的评价列表
const filteredComments = computed(() => {
  let result = [...comments.value]
  
  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(comment => 
      (comment.productName && comment.productName.toLowerCase().includes(keyword)) ||
      (comment.content && comment.content.toLowerCase().includes(keyword))
    )
  }
  
  // 评分筛选
  if (filterRating.value) {
    switch (filterRating.value) {
      case 'good':
        result = result.filter(comment => comment.rating >= 4)
        break
      case 'neutral':
        result = result.filter(comment => comment.rating === 3)
        break
      case 'bad':
        result = result.filter(comment => comment.rating < 3)
        break
    }
  }
  
  return result
})

// 计算属性：平均评分
const averageRating = computed(() => {
  if (comments.value.length === 0) return 0
  const sum = comments.value.reduce((acc, comment) => acc + comment.rating, 0)
  return sum / comments.value.length
})

// 计算属性：好评率
const goodRatingPercentage = computed(() => {
  if (comments.value.length === 0) return 0
  const goodRatings = comments.value.filter(comment => comment.rating >= 4).length
  return Math.round((goodRatings / comments.value.length) * 100)
})

// 获取用户评价
const fetchComments = async () => {
  console.log('UserComments.vue fetchComments: 开始获取用户评价');
  
  // 安全检查：确保用户ID存在
  const userId = userStore.userId || userStore.id;
  if (!userId) {
    console.error('UserComments.vue fetchComments: 用户ID不存在，无法获取评价');
    ElMessage.error('无法获取用户信息，请重新登录');
    router.push('/login');
    return;
  }
  
  console.log('UserComments.vue fetchComments: 使用用户ID:', userId);

  loading.value = true;
  try {
    let res;
    if (filterTagId.value && filterTagId.value !== 0) {
      // 按标签筛选
      res = await getUserCommentsByTag(
        userId,
        filterTagId.value,
        currentPage.value,
        pageSize.value,
        sortField.value,
        sortOrder.value
      );
    } else if (searchKeyword.value || filterRating.value) {
      // 搜索和评分筛选
      res = await searchUserComments(
        userId,
        currentPage.value,
        pageSize.value,
        sortField.value,
        sortOrder.value,
        searchKeyword.value,
        filterRating.value
      );
    } else {
      // 普通分页
      res = await getUserCommentPage(
        userId,
        currentPage.value,
        pageSize.value,
        sortField.value,
        sortOrder.value
      );
    }

    if (res.data) {
      comments.value = res.data.records || [];
      totalComments.value = res.data.total || 0;
      console.log('UserComments.vue fetchComments: 成功获取评价数据, 总数:', totalComments.value);
    }
  } catch (error) {
    console.error('获取评价失败', error);
    ElMessage.error('获取评价失败');
  } finally {
    loading.value = false;
  }
};

// 获取评价回复
const fetchCommentReplies = async () => {
  if (comments.value.length === 0) return
  
  try {
    // 为每个评价获取回复
    for (const comment of comments.value) {
      const res = await getCommentReplies(comment.commentId)
      if (res.code === 200) {
        comment.replies = res.data || []
      }
    }
  } catch (error) {
    console.error('获取评价回复出错:', error)
  }
}

// 处理页码变化
const handlePageChange = (page) => {
  currentPage.value = page
  fetchComments()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchComments()
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
  fetchComments()
}

// 处理排序变化
const handleSortChange = (field) => {
  if (sortField.value === field) {
    // 如果点击的是当前排序字段，则切换排序方向
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    // 如果点击的是新字段，则设置为降序
    sortField.value = field
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
  fetchComments()
}

// 获取排序图标类名
const getSortIconClass = (field) => {
  if (sortField.value !== field) return ''
  return sortOrder.value === 'asc' ? 'sort-icon-asc' : 'sort-icon-desc'
}

// 跳转到商品详情页
const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

// 获取评分文本
const getRatingText = (rating) => {
  if (rating >= 4) return '好评'
  if (rating === 3) return '中评'
  return '差评'
}

// 编辑评价
const editComment = async (comment) => {
  editForm.commentId = comment.commentId
  editForm.rating = comment.rating
  editForm.content = comment.content
  editForm.images = comment.images || []
  editForm.isAnonymous = comment.isAnonymous
  editForm.tags = comment.tags || []
  
  // 获取推荐标签
  try {
    const res = await getRecommendedTags({
      productId: comment.productId,
      limit: 10
    })
    recommendedTags.value = res.data || []
  } catch (error) {
    console.error('获取推荐标签失败', error)
  }
  
  editDialogVisible.value = true
}

// 提交编辑表单
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 准备提交数据
        const formData = {
          commentId: editForm.commentId,
          rating: editForm.rating,
          content: editForm.content,
          images: editForm.images,
          isAnonymous: editForm.isAnonymous
        }
        
        // 更新评价
        await updateComment(editForm.commentId, formData)
        
        // 更新标签
        const tagIds = editForm.tags
          .filter(tag => !String(tag.tagId).startsWith('new-')) // 过滤掉临时ID的标签
          .map(tag => tag.tagId)
        
        // 获取新标签名称列表
        const newTags = editForm.tags
          .filter(tag => String(tag.tagId).startsWith('new-'))
          .map(tag => tag.tagName)
        
        // TODO: 处理新标签的创建和关联
        
        await updateCommentTags(editForm.commentId, tagIds)
        
        ElMessage.success('评价修改成功')
        editDialogVisible.value = false
        
        // 刷新评价列表
        fetchComments()
      } catch (error) {
        console.error('更新评价失败', error)
        ElMessage.error('更新评价失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 确认删除评价
const confirmDeleteComment = (comment) => {
  ElMessageBox.confirm('确定要删除这条评价吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    handleDeleteComment(comment.commentId)
  }).catch(() => {})
}

// 处理删除评价
const handleDeleteComment = async (commentId) => {
  loading.value = true
  try {
    const res = await deleteComment(commentId)
    if (res.code === 200) {
      ElMessage.success('评价删除成功')
      // 更新本地数据
      comments.value = comments.value.filter(c => c.commentId !== commentId)
      totalComments.value = comments.value.length
    } else {
      ElMessage.error(res.message || '删除评价失败')
    }
  } catch (error) {
    console.error('删除评价失败:', error)
    ElMessage.error('删除评价失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理图片变化
const handleImageChange = (file) => {
  // 检查文件类型和大小
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    return false
  }
  
  // 转换为Base64
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    if (!editForm.images) {
      editForm.images = []
    }
    editForm.images.push(reader.result)
  }
}

// 移除图片
const removeImage = (index) => {
  editForm.images.splice(index, 1)
}

// 标签筛选
const handleTagFilterChange = () => {
  currentPage.value = 1
  fetchComments()
}

const filterByTag = (tagId) => {
  filterTagId.value = tagId
  currentPage.value = 1
  fetchComments()
}

// 标签输入相关
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value) {
    // 添加自定义标签
    const newTag = {
      tagId: `new-${Date.now()}`, // 临时ID，后端会处理
      tagName: tagInputValue.value,
      tagType: 2, // 用户自定义标签
      selected: true
    }
    
    // 检查是否已存在相同名称的标签
    const exists = editForm.tags.some(tag => tag.tagName === newTag.tagName)
    if (!exists) {
      editForm.tags.push(newTag)
    }
  }
  
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag) => {
  editForm.tags = editForm.tags.filter(t => t.tagId !== tag.tagId)
}

const addRecommendedTag = (tag) => {
  // 检查是否已添加
  const exists = editForm.tags.some(t => t.tagId === tag.tagId)
  if (!exists) {
    editForm.tags.push({...tag, selected: true})
  }
}

const isTagSelected = (tag) => {
  return editForm.tags.some(t => t.tagId === tag.tagId)
}

// 初始化
onMounted(async () => {
  console.log('UserComments.vue onMounted: 开始初始化');
  
  // 获取用户ID
  const userId = userStore.userId || userStore.id; // 兼容不同的属性名
  console.log('UserComments.vue onMounted: 用户ID:', userId);
  
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    console.log('UserComments.vue: 用户未登录，尝试检查认证状态');
    // 尝试检查用户认证状态
    const authStatus = await userStore.checkAuth();
    if (!authStatus) {
      console.log('UserComments.vue: 认证失败，跳转到登录页面');
      ElMessage.error('请先登录');
      router.push('/login');
      return;
    }
  }
  
  // 再次检查用户ID
  const currentUserId = userStore.userId || userStore.id;
  if (!currentUserId) {
    console.log('UserComments.vue: 无法获取用户ID，跳转到登录页面');
    ElMessage.error('无法获取用户信息，请重新登录');
    router.push('/login');
    return;
  }
  
  console.log('UserComments.vue: 用户已登录，ID:', currentUserId);

  loading.value = true;
  try {
    // 获取用户评价
    await fetchComments();
    
    // 获取热门标签
    const tagsRes = await getHotTags(10);
    hotTags.value = tagsRes.data || [];
  } catch (error) {
    console.error('获取评价失败', error);
    ElMessage.error('获取评价失败');
  } finally {
    loading.value = false;
  }
})
</script>

<style scoped>
.user-comments {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 220px;
}

.filter-select {
  width: 140px;
}

.comments-stats {
  display: flex;
  gap: 40px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.comments-list {
  min-height: 200px;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.comment-product {
  display: flex;
  flex-direction: column;
  width: 120px;
}

.product-image {
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-name:hover {
  color: #f56c6c;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  flex: 1;
}

.rating-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.rating-text {
  margin-left: 8px;
  font-size: 14px;
  color: #f56c6c;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  color: #606266;
}

.comment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.comment-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 编辑对话框样式 */
.edit-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.image-item .el-image {
  width: 100%;
  height: 100%;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .comment-item {
    flex-direction: column;
  }
  
  .comment-product {
    flex-direction: row;
    width: 100%;
    gap: 12px;
  }
  
  .product-image {
    width: 80px;
    height: 80px;
    margin-bottom: 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .section-actions {
    width: 100%;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .comments-stats {
    gap: 20px;
  }
}

.sort-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.sort-label {
  font-size: 14px;
  color: #606266;
  margin-right: 16px;
}

.sort-options {
  display: flex;
  gap: 20px;
}

.sort-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.sort-option:hover {
  background-color: #f0f0f0;
}

.sort-option.active {
  color: #f56c6c;
  font-weight: 500;
}

.sort-option span {
  margin-right: 4px;
}

.sort-icon-asc {
  transform: rotate(180deg);
}

.sort-icon-desc {
  transform: rotate(0deg);
}

.comment-replies {
  margin-top: 16px;
  padding: 12px;
  background-color: #f0f2f5;
  border-radius: 6px;
}

.replies-title {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.replies-title .el-icon {
  margin-right: 6px;
  color: #909399;
}

.reply-item {
  padding: 8px 0;
  border-bottom: 1px dashed #dcdfe6;
}

.reply-item:last-child {
  border-bottom: none;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.reply-user {
  display: flex;
  align-items: center;
}

.reply-user-name {
  font-weight: 500;
  color: #303133;
  margin-right: 8px;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0;
}

.comment-tag {
  cursor: pointer;
}

.comment-tag:hover {
  opacity: 0.8;
}

.tag-selector {
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}

.edit-tag {
  margin-right: 6px;
}

.tag-input {
  width: 120px;
  margin-right: 10px;
  vertical-align: bottom;
}

.recommended-tags {
  margin-top: 10px;
}

.recommended-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.tag-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recommended-tag {
  cursor: pointer;
}

.recommended-tag:hover {
  opacity: 0.8;
}

.recommended-tag.is-selected {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #d9ecff;
}

.comment-tabs {
  margin-bottom: 20px;
}

.mt-4 {
  margin-top: 16px;
}
</style> 