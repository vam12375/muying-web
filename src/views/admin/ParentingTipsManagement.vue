<template>
  <div class="parenting-tips-management">
    <div class="page-header">
      <h2>育儿知识管理</h2>
      <el-button type="primary" @click="handleAddTip">添加育儿知识</el-button>
    </div>

    <!-- 育儿知识列表 -->
    <el-table v-loading="loading" :data="tipsList" border style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="category" label="分类" width="120" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="publishTime" label="发布时间" width="180" />
      <el-table-column prop="viewCount" label="浏览次数" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
            {{ scope.row.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEditTip(scope.row)">编辑</el-button>
          <el-button 
            :type="scope.row.status === 1 ? 'warning' : 'success'" 
            size="small" 
            @click="handleStatusChange(scope.row)"
          >
            {{ scope.row.status === 1 ? '下架' : '发布' }}
          </el-button>
          <el-button type="danger" size="small" @click="handleDeleteTip(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 育儿知识表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formType === 'add' ? '添加育儿知识' : '编辑育儿知识'"
      width="700px"
    >
      <el-form :model="tipForm" :rules="rules" ref="tipFormRef" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="tipForm.title" placeholder="请输入育儿知识标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="tipForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="新生儿护理" value="新生儿护理" />
            <el-option label="婴儿喂养" value="婴儿喂养" />
            <el-option label="幼儿教育" value="幼儿教育" />
            <el-option label="儿童健康" value="儿童健康" />
            <el-option label="孕期管理" value="孕期管理" />
          </el-select>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="tipForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="内容摘要" prop="summary">
          <el-input v-model="tipForm.summary" type="textarea" :rows="3" placeholder="请输入内容摘要" />
        </el-form-item>
        <el-form-item label="详细内容" prop="content">
          <el-input v-model="tipForm.content" type="textarea" :rows="8" placeholder="请输入详细内容" />
        </el-form-item>
        <el-form-item label="封面图片" prop="coverImage">
          <el-input v-model="tipForm.coverImage" placeholder="请输入封面图片URL" />
          <!-- 实际项目中这里应该有图片上传功能 -->
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="tipForm.status">
            <el-radio :label="1">发布</el-radio>
            <el-radio :label="0">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getParentingTipsList, addParentingTip, updateParentingTip, updateParentingTipStatus, deleteParentingTip } from '@/api/admin';

// 状态变量
const loading = ref(false);
const dialogVisible = ref(false);
const formType = ref('add'); // 'add' 或 'edit'
const submitLoading = ref(false);
const tipsList = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const tipFormRef = ref(null);

// 表单数据
const tipForm = reactive({
  id: null,
  title: '',
  category: '',
  author: '',
  summary: '',
  content: '',
  coverImage: '',
  status: 1
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入内容摘要', trigger: 'blur' },
    { max: 200, message: '摘要最多 200 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入详细内容', trigger: 'blur' }
  ]
};

// 生命周期钩子
onMounted(() => {
  fetchTipsList();
});

// 获取育儿知识列表
const fetchTipsList = async () => {
  loading.value = true;
  try {
    const res = await getParentingTipsList({
      page: currentPage.value,
      pageSize: pageSize.value,
      category: tipForm.category !== '' ? tipForm.category : undefined
    });
    
    if (res.code === 200 && res.data) {
      tipsList.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res.message || '获取育儿知识列表失败');
    }
  } catch (error) {
    console.error('获取育儿知识列表失败:', error);
    ElMessage.error('获取育儿知识列表失败');
  } finally {
    loading.value = false;
  }
};

// 添加育儿知识
const handleAddTip = () => {
  formType.value = 'add';
  resetForm();
  dialogVisible.value = true;
};

// 编辑育儿知识
const handleEditTip = (row) => {
  formType.value = 'edit';
  resetForm();
  Object.assign(tipForm, {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    summary: row.summary,
    content: row.content,
    coverImage: row.coverImage,
    status: row.status
  });
  dialogVisible.value = true;
};

// 更改育儿知识状态
const handleStatusChange = (row) => {
  const newStatus = row.status === 1 ? 0 : 1;
  const statusText = newStatus === 1 ? '发布' : '下架';
  
  ElMessageBox.confirm(
    `确定要${statusText}育儿知识 "${row.title}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await updateParentingTipStatus({
          id: row.id,
          status: newStatus
        });
        
        if (res.code === 200) {
          ElMessage.success(`${statusText}成功`);
          // 刷新列表
          fetchTipsList();
        } else {
          ElMessage.error(res.message || `${statusText}失败`);
        }
      } catch (error) {
        console.error(`${statusText}育儿知识失败:`, error);
        ElMessage.error(`${statusText}育儿知识失败`);
      }
    })
    .catch(() => {});
};

// 删除育儿知识
const handleDeleteTip = (row) => {
  ElMessageBox.confirm(
    `确定要删除育儿知识 "${row.title}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await deleteParentingTip(row.id);
        
        if (res.code === 200) {
          ElMessage.success('删除成功');
          // 刷新列表
          fetchTipsList();
        } else {
          ElMessage.error(res.message || '删除失败');
        }
      } catch (error) {
        console.error('删除育儿知识失败:', error);
        ElMessage.error('删除育儿知识失败');
      }
    })
    .catch(() => {});
};

// 提交表单
const submitForm = async () => {
  if (!tipFormRef.value) return;
  
  await tipFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    submitLoading.value = true;
    try {
      let res;
      
      if (formType.value === 'add') {
        res = await addParentingTip(tipForm);
      } else {
        res = await updateParentingTip(tipForm);
      }
      
      if (res.code === 200) {
        ElMessage.success(formType.value === 'add' ? '添加育儿知识成功' : '编辑育儿知识成功');
        dialogVisible.value = false;
        // 刷新列表
        fetchTipsList();
      } else {
        ElMessage.error(res.message || '操作失败');
      }
    } catch (error) {
      console.error('保存育儿知识失败:', error);
      ElMessage.error('保存育儿知识失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// 重置表单
const resetForm = () => {
  if (tipFormRef.value) {
    tipFormRef.value.resetFields();
  }
  Object.assign(tipForm, {
    id: null,
    title: '',
    category: '',
    author: '',
    summary: '',
    content: '',
    coverImage: '',
    status: 1
  });
};

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchTipsList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchTipsList();
};
</script>

<style scoped>
.parenting-tips-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 