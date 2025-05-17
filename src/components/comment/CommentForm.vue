<template>
  <div class="comment-form">
    <el-form :model="commentForm" :rules="rules" ref="commentFormRef">
      <!-- 评分 -->
      <el-form-item label="评分" prop="rating">
        <el-rate
          v-model="commentForm.rating"
          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          :texts="['很差', '较差', '一般', '较好', '很好']"
          show-text
        />
      </el-form-item>

      <!-- 评价内容 -->
      <el-form-item label="评价内容" prop="content">
        <el-input
          v-model="commentForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入您对商品的评价..."
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 评价标签 -->
      <el-form-item label="评价标签">
        <tag-selector
          v-model="commentForm.tags"
          :recommended-tags="recommendedTags"
          recommend-title="推荐标签"
          :allow-custom-tags="true"
          :allow-search="true"
          :max-tags="5"
          @tag-added="handleTagAdded"
          @tag-removed="handleTagRemoved"
        />
      </el-form-item>

      <!-- 上传图片 -->
      <el-form-item label="上传图片">
        <el-upload
          v-model:file-list="fileList"
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :limit="5"
          :on-preview="handlePictureCardPreview"
          :on-change="handleFileChange"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <el-dialog v-model="dialogVisible">
          <img w-full :src="dialogImageUrl" alt="Preview Image" />
        </el-dialog>
        <div class="el-upload__tip">
          最多上传5张图片，每张不超过5MB，支持jpg、png格式
        </div>
      </el-form-item>

      <!-- 匿名评价 -->
      <el-form-item>
        <el-checkbox v-model="commentForm.isAnonymous">匿名评价</el-checkbox>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitComment" :loading="submitting">提交评价</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits, defineProps, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createOrderComment, createComment, createCommentWithTags, getRecommendedTags } from '@/api/comment'
import TagSelector from '../common/TagSelector.vue'

const props = defineProps({
  productId: {
    type: Number,
    required: true
  },
  orderId: {
    type: Number,
    required: true
  },
  userId: {
    type: Number,
    required: true
  },
  categoryId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

// 表单引用
const commentFormRef = ref(null)

// 表单数据
const commentForm = reactive({
  userId: props.userId,
  productId: props.productId,
  orderId: props.orderId,
  content: '',
  rating: 5,
  images: [],
  isAnonymous: 0,
  tags: []
})

// 推荐标签
const recommendedTags = ref([])
const loadingTags = ref(false)

// 表单验证规则
const rules = {
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, max: 500, message: '评价内容长度在5到500个字符之间', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ]
}

// 图片上传相关
const fileList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const submitting = ref(false)

// 预览图片
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url || URL.createObjectURL(file.raw)
  dialogVisible.value = true
}

// 文件变化时处理
const handleFileChange = (file, fileList) => {
  // 检查文件类型和大小
  const isImage = file.raw.type === 'image/jpeg' || file.raw.type === 'image/png'
  const isLt5M = file.raw.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传JPG/PNG格式的图片!')
    fileList.pop()
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB!')
    fileList.pop()
    return false
  }
  
  // 生成预览URL
  file.url = URL.createObjectURL(file.raw)
}

// 将文件转换为Base64
const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })
}

// 标签相关
const handleTagAdded = (tag) => {
  console.log('标签已添加:', tag)
}

const handleTagRemoved = (tag) => {
  console.log('标签已移除:', tag)
}

// 加载推荐标签
const loadRecommendedTags = async () => {
  loadingTags.value = true
  try {
    const res = await getRecommendedTags({
      productId: props.productId,
      categoryId: props.categoryId,
      limit: 10
    })
    recommendedTags.value = res.data || []
  } catch (error) {
    console.error('获取推荐标签失败:', error)
    ElMessage.error('获取推荐标签失败')
  } finally {
    loadingTags.value = false
  }
}

// 提交评价
const submitComment = async () => {
  if (!commentFormRef.value) return
  
  await commentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitting.value = true
        
        // 处理图片上传
        const imagePromises = fileList.value.map(file => getBase64(file.raw))
        const imageBase64List = await Promise.all(imagePromises)
        
        // 设置评价数据
        commentForm.images = imageBase64List
        commentForm.isAnonymous = commentForm.isAnonymous ? 1 : 0
        
        // 处理标签
        const tagIds = commentForm.tags
          .filter(tag => !String(tag.tagId).startsWith('new-'))
          .map(tag => tag.tagId)
        
        // 获取新标签名称列表
        const newTags = commentForm.tags
          .filter(tag => String(tag.tagId).startsWith('new-'))
          .map(tag => tag.tagName)
        
        // 提交评价（带标签）
        const { data } = await createCommentWithTags({
          ...commentForm,
          tags: commentForm.tags
        })
        
        if (data) {
          ElMessage.success('评价提交成功')
          emit('success')
          resetForm()
        } else {
          ElMessage.error('评价提交失败')
        }
      } catch (error) {
        console.error('提交评价失败:', error)
        ElMessage.error(`评价提交失败: ${error.message || '未知错误'}`)
      } finally {
        submitting.value = false
      }
    } else {
      ElMessage.warning('请完善评价信息')
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (commentFormRef.value) {
    commentFormRef.value.resetFields()
    fileList.value = []
    commentForm.rating = 5
    commentForm.isAnonymous = 0
    commentForm.tags = []
  }
}

// 组件挂载时加载推荐标签
onMounted(() => {
  loadRecommendedTags()
})
</script>

<style scoped>
.comment-form {
  margin: 20px 0;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.el-rate {
  margin-top: 5px;
}

.el-upload__tip {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}
</style> 