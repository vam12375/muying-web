<template>
  <div class="tag-selector">
    <!-- 已选标签列表 -->
    <div class="selected-tags">
      <el-tag
        v-for="tag in modelValue"
        :key="tag.tagId"
        closable
        @close="removeTag(tag)"
        class="selected-tag"
      >
        {{ tag.tagName }}
      </el-tag>
      
      <!-- 标签输入框 -->
      <el-input
        v-if="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        class="tag-input"
        size="small"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      
      <!-- 添加标签按钮 -->
      <el-button
        v-else-if="allowCustomTags"
        class="tag-button"
        size="small"
        @click="showInput"
      >
        + 添加标签
      </el-button>
    </div>
    
    <!-- 推荐标签区域 -->
    <div v-if="recommendedTags.length > 0" class="recommended-section">
      <p class="section-title">{{ recommendTitle }}</p>
      <div class="tag-suggestions">
        <el-tag
          v-for="tag in recommendedTags"
          :key="tag.tagId"
          size="small"
          effect="plain"
          @click="addTag(tag)"
          class="recommended-tag"
          :class="{ 'is-selected': isTagSelected(tag) }"
        >
          {{ tag.tagName }}
        </el-tag>
      </div>
    </div>
    
    <!-- 搜索标签区域 -->
    <div v-if="allowSearch" class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索标签"
        clearable
        prefix-icon="Search"
        @input="handleSearch"
        class="search-input"
      />
      
      <div v-if="searchResults.length > 0" class="search-results">
        <el-tag
          v-for="tag in searchResults"
          :key="tag.tagId"
          size="small"
          effect="plain"
          @click="addTag(tag)"
          class="search-tag"
          :class="{ 'is-selected': isTagSelected(tag) }"
        >
          {{ tag.tagName }}
        </el-tag>
      </div>
      
      <div v-else-if="searchQuery && !loading" class="no-results">
        没有找到匹配的标签
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { searchTags } from '@/api/comment'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // v-model绑定的标签数组
  modelValue: {
    type: Array,
    default: () => []
  },
  // 推荐标签列表
  recommendedTags: {
    type: Array,
    default: () => []
  },
  // 推荐标签区域标题
  recommendTitle: {
    type: String,
    default: '推荐标签'
  },
  // 是否允许自定义标签
  allowCustomTags: {
    type: Boolean,
    default: true
  },
  // 是否允许搜索标签
  allowSearch: {
    type: Boolean,
    default: true
  },
  // 最大标签数量
  maxTags: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:modelValue', 'tag-added', 'tag-removed'])

// 状态
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)

// 显示输入框
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

// 处理输入确认
const handleInputConfirm = () => {
  if (inputValue.value) {
    // 检查是否已达到最大标签数量
    if (props.modelValue.length >= props.maxTags) {
      ElMessage.warning(`最多只能添加${props.maxTags}个标签`)
      inputVisible.value = false
      inputValue.value = ''
      return
    }
    
    // 添加自定义标签
    const newTag = {
      tagId: `new-${Date.now()}`, // 临时ID，后端会处理
      tagName: inputValue.value,
      tagType: 2, // 用户自定义标签
      selected: true
    }
    
    // 检查是否已存在相同名称的标签
    const exists = props.modelValue.some(tag => tag.tagName === newTag.tagName)
    if (!exists) {
      const newTags = [...props.modelValue, newTag]
      emit('update:modelValue', newTags)
      emit('tag-added', newTag)
    } else {
      ElMessage.warning('标签已存在')
    }
  }
  
  inputVisible.value = false
  inputValue.value = ''
}

// 移除标签
const removeTag = (tag) => {
  const newTags = props.modelValue.filter(t => t.tagId !== tag.tagId)
  emit('update:modelValue', newTags)
  emit('tag-removed', tag)
}

// 添加推荐标签
const addTag = (tag) => {
  // 检查是否已达到最大标签数量
  if (props.modelValue.length >= props.maxTags) {
    ElMessage.warning(`最多只能添加${props.maxTags}个标签`)
    return
  }
  
  // 检查是否已添加
  const exists = props.modelValue.some(t => t.tagId === tag.tagId)
  if (!exists) {
    const newTags = [...props.modelValue, {...tag, selected: true}]
    emit('update:modelValue', newTags)
    emit('tag-added', tag)
  } else {
    ElMessage.warning('标签已存在')
  }
}

// 判断标签是否已选择
const isTagSelected = (tag) => {
  return props.modelValue.some(t => t.tagId === tag.tagId)
}

// 搜索标签
const handleSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  loading.value = true
  try {
    const res = await searchTags(searchQuery.value, 10)
    searchResults.value = res.data || []
  } catch (error) {
    console.error('搜索标签失败', error)
    ElMessage.error('搜索标签失败')
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 监听搜索关键词变化
watch(searchQuery, (newValue) => {
  if (newValue) {
    handleSearch()
  } else {
    searchResults.value = []
  }
})
</script>

<style scoped>
.tag-selector {
  width: 100%;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  align-items: center;
}

.selected-tag {
  margin-right: 6px;
}

.tag-input {
  width: 120px;
  margin-right: 10px;
  vertical-align: bottom;
}

.recommended-section,
.search-section {
  margin-top: 15px;
}

.section-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.tag-suggestions,
.search-results {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recommended-tag,
.search-tag {
  cursor: pointer;
}

.recommended-tag:hover,
.search-tag:hover {
  opacity: 0.8;
}

.is-selected {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #d9ecff;
}

.search-input {
  margin-bottom: 10px;
  max-width: 300px;
}

.no-results {
  color: #909399;
  font-size: 14px;
  margin: 10px 0;
}
</style> 