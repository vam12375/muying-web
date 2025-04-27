<template>
  <div class="parenting-tips-manage">
    <div class="page-header">
      <h1>育儿知识管理</h1>
      <el-button type="primary" @click="showAddDialog">添加文章</el-button>
    </div>
    
    <div class="search-box">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="标题">
          <el-input v-model="searchForm.title" placeholder="搜索文章标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="选择分类" clearable>
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchTips">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      :data="tipsList"
      style="width: 100%"
      border
      v-loading="loading"
      stripe
    >
      <el-table-column type="index" width="50" label="#"></el-table-column>
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="scope">
          <el-link type="primary" :underline="false" @click="previewTip(scope.row)">
            {{ scope.row.title }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="scope">
          <el-tag size="small" type="success">{{ getCategoryName(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="作者" width="120"></el-table-column>
      <el-table-column prop="date" label="发布日期" width="120"></el-table-column>
      <el-table-column prop="views" label="浏览量" width="100" sortable></el-table-column>
      <el-table-column prop="likes" label="点赞数" width="100" sortable></el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click="editTip(scope.row)"
          >编辑</el-button>
          <el-button
            size="small"
            type="danger"
            @click="deleteTip(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        :current-page="currentPage"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 添加/编辑文章对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加文章' : '编辑文章'"
      v-model="dialogVisible"
      width="70%"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="tipFormRef" 
        :model="tipForm" 
        :rules="tipRules" 
        label-width="100px"
        class="tip-form"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="tipForm.title" placeholder="请输入文章标题"></el-input>
        </el-form-item>
        
        <el-form-item label="分类" prop="category">
          <el-select v-model="tipForm.category" placeholder="请选择分类">
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
              v-if="item.id !== 'all'"
            ></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="作者" prop="author">
          <el-input v-model="tipForm.author" placeholder="请输入作者名称"></el-input>
        </el-form-item>
        
        <el-form-item label="摘要" prop="summary">
          <el-input 
            v-model="tipForm.summary" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入文章摘要"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="封面图片" prop="image">
          <el-input v-model="tipForm.image" placeholder="请输入图片URL"></el-input>
          <div class="image-preview" v-if="tipForm.image">
            <img :src="tipForm.image" alt="封面预览">
          </div>
        </el-form-item>
        
        <el-form-item label="内容" prop="content">
          <el-input 
            v-model="tipForm.content" 
            type="textarea" 
            :rows="10" 
            placeholder="请输入文章内容，支持HTML格式"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 预览文章对话框 -->
    <el-dialog
      title="文章预览"
      v-model="previewVisible"
      width="60%"
      fullscreen
    >
      <div class="preview-content">
        <h1 class="preview-title">{{ previewData.title }}</h1>
        <div class="preview-meta">
          <span>作者：{{ previewData.author }}</span>
          <span>日期：{{ previewData.date }}</span>
          <span>分类：{{ getCategoryName(previewData.category) }}</span>
        </div>
        <div class="preview-image" v-if="previewData.image">
          <img :src="previewData.image" :alt="previewData.title">
        </div>
        <div class="preview-summary">
          <strong>摘要：</strong>{{ previewData.summary }}
        </div>
        <div class="preview-article-content" v-html="previewData.content"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="editTip(previewData)">编辑</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getParentingTips, 
  getParentingCategories, 
  addParentingTip, 
  updateParentingTip, 
  deleteParentingTip 
} from '@/api/parenting'

export default {
  name: 'ParentingTipsManage',
  setup() {
    // 数据定义
    const tipsList = ref([])
    const categories = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const dialogVisible = ref(false)
    const previewVisible = ref(false)
    const dialogType = ref('add') // 'add' or 'edit'
    const tipFormRef = ref(null)
    const searchForm = reactive({
      title: '',
      category: ''
    })
    
    // 表单数据
    const tipForm = reactive({
      id: null,
      title: '',
      category: '',
      author: '',
      summary: '',
      content: '',
      image: '',
      date: new Date().toISOString().slice(0, 10) // 默认为当前日期
    })
    
    // 表单验证规则
    const tipRules = {
      title: [
        { required: true, message: '请输入文章标题', trigger: 'blur' },
        { min: 2, max: 100, message: '标题长度在2-100个字符之间', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '请选择文章分类', trigger: 'change' }
      ],
      author: [
        { required: true, message: '请输入作者名称', trigger: 'blur' }
      ],
      summary: [
        { required: true, message: '请输入文章摘要', trigger: 'blur' },
        { min: 10, max: 200, message: '摘要长度在10-200个字符之间', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入文章内容', trigger: 'blur' }
      ],
      image: [
        { required: true, message: '请输入封面图片URL', trigger: 'blur' }
      ]
    }
    
    // 预览数据
    const previewData = reactive({
      id: null,
      title: '',
      category: '',
      author: '',
      summary: '',
      content: '',
      image: '',
      date: ''
    })
    
    // 获取文章列表
    const fetchTips = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          pageSize: pageSize.value,
          title: searchForm.title || undefined,
          category: searchForm.category || undefined
        }
        const { data } = await getParentingTips(params)
        
        tipsList.value = data.list
        total.value = data.total
      } catch (error) {
        console.error('获取文章列表失败:', error)
        ElMessage.error('获取文章列表失败')
      } finally {
        loading.value = false
      }
    }
    
    // 获取分类
    const fetchCategories = async () => {
      try {
        const { data } = await getParentingCategories()
        categories.value = data
      } catch (error) {
        console.error('获取分类失败:', error)
        ElMessage.error('获取分类失败')
      }
    }
    
    // 获取分类名称
    const getCategoryName = (categoryId) => {
      if (!categoryId) return '未分类'
      const category = categories.value.find(item => item.id === categoryId)
      return category ? category.name : '未分类'
    }
    
    // 搜索文章
    const searchTips = () => {
      currentPage.value = 1
      fetchTips()
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchForm.title = ''
      searchForm.category = ''
      searchTips()
    }
    
    // 显示添加对话框
    const showAddDialog = () => {
      dialogType.value = 'add'
      resetForm()
      dialogVisible.value = true
    }
    
    // 编辑文章
    const editTip = (row) => {
      dialogType.value = 'edit'
      resetForm()
      
      // 填充表单数据
      Object.keys(tipForm).forEach(key => {
        if (key in row) {
          tipForm[key] = row[key]
        }
      })
      
      dialogVisible.value = true
      previewVisible.value = false // 如果预览窗口打开，则关闭
    }
    
    // 预览文章
    const previewTip = (row) => {
      // 填充预览数据
      Object.keys(previewData).forEach(key => {
        if (key in row) {
          previewData[key] = row[key]
        }
      })
      
      previewVisible.value = true
    }
    
    // 删除文章
    const deleteTip = (row) => {
      ElMessageBox.confirm(
        `确定要删除《${row.title}》这篇文章吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await deleteParentingTip(row.id)
          ElMessage.success('删除成功')
          fetchTips() // 刷新列表
        } catch (error) {
          console.error('删除文章失败:', error)
          ElMessage.error('删除文章失败')
        }
      }).catch(() => {
        // 取消删除，不做任何操作
      })
    }
    
    // 重置表单
    const resetForm = () => {
      if (tipFormRef.value) {
        tipFormRef.value.resetFields()
      }
      
      // 手动重置表单数据
      tipForm.id = null
      tipForm.title = ''
      tipForm.category = ''
      tipForm.author = ''
      tipForm.summary = ''
      tipForm.content = ''
      tipForm.image = ''
      tipForm.date = new Date().toISOString().slice(0, 10)
    }
    
    // 提交表单
    const submitForm = () => {
      tipFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (dialogType.value === 'add') {
              // 新增文章
              await addParentingTip(tipForm)
              ElMessage.success('添加成功')
            } else {
              // 更新文章
              await updateParentingTip(tipForm.id, tipForm)
              ElMessage.success('更新成功')
            }
            
            dialogVisible.value = false
            fetchTips() // 刷新列表
          } catch (error) {
            console.error('保存文章失败:', error)
            ElMessage.error('保存文章失败')
          }
        } else {
          return false
        }
      })
    }
    
    // 页码变化
    const handleCurrentChange = (page) => {
      currentPage.value = page
      fetchTips()
    }
    
    // 每页条数变化
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      fetchTips()
    }
    
    // 初始化
    onMounted(() => {
      fetchCategories()
      fetchTips()
    })
    
    return {
      tipsList,
      categories,
      loading,
      currentPage,
      pageSize,
      total,
      dialogVisible,
      previewVisible,
      dialogType,
      tipFormRef,
      tipForm,
      tipRules,
      searchForm,
      previewData,
      getCategoryName,
      fetchTips,
      searchTips,
      resetSearch,
      showAddDialog,
      editTip,
      previewTip,
      deleteTip,
      submitForm,
      handleCurrentChange,
      handleSizeChange
    }
  }
}
</script>

<style scoped>
.parenting-tips-manage {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-box {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.tip-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 20px;
}

.image-preview {
  margin-top: 10px;
  width: 200px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-content {
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
}

.preview-title {
  font-size: 2em;
  margin-bottom: 15px;
}

.preview-meta {
  display: flex;
  gap: 20px;
  color: #666;
  margin-bottom: 20px;
}

.preview-image {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.preview-summary {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-article-content {
  line-height: 1.8;
}

.preview-article-content h2 {
  font-size: 1.8em;
  margin: 25px 0 15px;
}

.preview-article-content h3 {
  font-size: 1.5em;
  margin: 20px 0 10px;
}

.preview-article-content p {
  margin-bottom: 15px;
}
</style> 