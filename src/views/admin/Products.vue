<template>
  <div class="products-container">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="hover">
      <div class="card-header">
        <div class="header-title">
          <el-icon class="icon-tech"><Grid /></el-icon>
          <span>商品管理</span>
        </div>
        <div class="header-actions">
          <el-tooltip content="刷新数据" placement="top">
            <el-button circle @click="loadProductList">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
          <el-button type="primary" @click="handleAdd" class="add-button">
            <el-icon><Plus /></el-icon>添加商品
          </el-button>
        </div>
      </div>
      
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称/编号"
            clearable
            prefix-icon="Search"
            @keyup.enter="handleSearch"
            class="search-input"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.category" placeholder="商品分类" clearable class="tech-select">
            <el-option
              v-for="item in categories"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="商品状态" clearable class="tech-select">
            <el-option label="上架" value="on" />
            <el-option label="下架" value="off" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" class="tech-button search-button">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetSearch" class="tech-button">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="data-card" shadow="hover">
      <el-table
        v-loading="loading"
        :data="productList"
        style="width: 100%"
        class="tech-table"
        :row-class-name="tableRowClassName"
        :header-cell-class-name="tableHeaderClassName"
        border
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column prop="goodsId" label="商品编号" width="90" align="center" />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="scope">
            <el-image
              :src="scope.row.goodsImg"
              :preview-src-list="[scope.row.goodsImg]"
              fit="cover"
              style="width: 60px; height: 60px; border-radius:.25rem;"
              :lazy="true"
              class="product-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>图片加载失败</span>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="商品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="商品分类" width="100" align="center" />
        <el-table-column prop="priceNew" label="售价" width="100" align="center">
          <template #default="scope">
            <span class="price-tag">¥{{ scope.row.priceNew.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" align="center">
          <template #default="scope">
            <el-progress 
              :percentage="Math.min(scope.row.stock / 10, 100)" 
              :color="getStockColor(scope.row.stock)"
              :stroke-width="8"
              :show-text="false"
              class="stock-progress"
            />
            <span class="stock-text">{{ scope.row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="90" align="center">
          <template #default="scope">
            <span class="sales-badge">{{ scope.row.sales }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsStatus" label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.goodsStatus === 'on' ? 'success' : 'info'"
              :effect="scope.row.goodsStatus === 'on' ? 'light' : 'plain'"
              class="status-tag"
            >
              <el-icon v-if="scope.row.goodsStatus === 'on'"><CircleCheck /></el-icon>
              <el-icon v-else><CircleClose /></el-icon>
              {{ scope.row.goodsStatus === 'on' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <div class="action-buttons">
              <el-tooltip content="编辑" placement="top">
                <el-button 
                  type="primary" 
                  circle 
                  size="small" 
                  @click="handleEdit(scope.row)"
                  class="action-button"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="scope.row.goodsStatus === 'on' ? '下架' : '上架'" placement="top">
                <el-button 
                  :type="scope.row.goodsStatus === 'on' ? 'warning' : 'success'" 
                  circle 
                  size="small" 
                  @click="handleStatusChange(scope.row)"
                  class="action-button"
                >
                  <el-icon v-if="scope.row.goodsStatus === 'on'"><Hide /></el-icon>
                  <el-icon v-else><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button 
                  type="danger" 
                  circle 
                  size="small" 
                  @click="handleDelete(scope.row)"
                  class="action-button"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          class="tech-pagination"
        />
      </div>
    </el-card>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加商品' : '编辑商品'"
      v-model="dialogVisible"
      width="60%"
      class="tech-dialog"
      destroy-on-close
    >
      <el-form
        ref="productFormRef"
        :model="productForm"
        :rules="rules"
        label-width="100px"
        class="tech-form"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="商品名称" prop="goods_name">
                  <el-input v-model="productForm.goods_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="商品分类" prop="category_id">
                  <el-select v-model="productForm.category_id" placeholder="请选择分类" style="width: 100%">
                    <el-option
                      v-for="item in categories"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="商品价格" prop="price_new">
                  <el-input-number v-model="productForm.price_new" :precision="2" :step="0.1" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="商品库存" prop="stock">
                  <el-input-number v-model="productForm.stock" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="市场价" prop="price_old">
                  <el-input-number v-model="productForm.price_old" :precision="2" :step="0.1" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="库存预警值" prop="stock_warning">
                  <el-input-number v-model="productForm.stock_warning" :min="0" style="width: 100%">
                    <template #suffix>
                      <el-tooltip content="当库存低于此值时会显示库存预警" placement="top">
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="商品图片" prop="goods_img">
              <el-upload
                class="product-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :before-upload="beforeUpload"
              >
                <div class="upload-area">
                  <img v-if="productForm.goods_img" :src="productForm.goods_img" class="product-img">
                  <div v-else class="upload-placeholder">
                    <el-icon class="upload-icon"><Plus /></el-icon>
                    <span>点击上传主图</span>
                  </div>
                </div>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="商品相册">
              <el-upload
                class="product-album-uploader"
                action="/api/upload"
                list-type="picture-card"
                :file-list="albumFiles"
                :on-success="handleAlbumSuccess"
                :on-remove="handleAlbumRemove"
                :on-preview="handleAlbumPreview"
                :before-upload="beforeUpload"
                multiple
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <el-dialog v-model="previewVisible">
                <img width="100%" :src="previewImage" alt="图片预览" />
              </el-dialog>
            </el-form-item>
            
            <el-form-item label="商品描述" prop="goods_detail">
              <el-input type="textarea" v-model="productForm.goods_detail" rows="4" />
            </el-form-item>
            
            <el-form-item label="上架状态" prop="goods_status">
              <el-switch
                v-model="productForm.goods_status"
                :active-value="'on'"
                :inactive-value="'off'"
                inline-prompt
                active-text="上架"
                inactive-text="下架"
                style="--el-switch-on-color: #13ce66"
              />
            </el-form-item>

            <el-form-item label="商品排序" prop="sort">
              <el-input-number v-model="productForm.sort" :min="0" :max="999" style="width: 100%">
                <template #suffix>
                  <el-tooltip content="数值越小排序越靠前" placement="top">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input-number>
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="规格管理" name="specs">
            <div class="specs-container">
              <div class="specs-control">
                <el-alert 
                  title="规格管理说明" 
                  type="info" 
                  description="添加规格后需要设置规格组合的价格和库存，未设置的组合将使用基本信息中的配置" 
                  show-icon 
                  :closable="false"
                  style="margin-bottom: 15px"
                />
                
                <div class="spec-group">
                  <div class="spec-header">
                    <h4>规格项</h4>
                    <el-button type="primary" size="small" @click="addSpecGroup">
                      <el-icon><Plus /></el-icon> 添加规格项
                    </el-button>
                  </div>
                  
                  <div v-for="(spec, specIndex) in productForm.specs" :key="specIndex" class="spec-item">
                    <div class="spec-item-header">
                      <el-input 
                        v-model="spec.name" 
                        placeholder="规格名称，如颜色、尺寸" 
                        style="width: 200px"
                      />
                      <el-button 
                        type="danger" 
                        size="small" 
                        circle 
                        @click="removeSpecGroup(specIndex)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                    
                    <div class="spec-values">
                      <el-tag
                        v-for="(value, valueIndex) in spec.values"
                        :key="valueIndex"
                        closable
                        :disable-transitions="false"
                        @close="removeSpecValue(specIndex, valueIndex)"
                        style="margin-right: 10px; margin-bottom: 10px"
                      >
                        {{ value }}
                      </el-tag>
                      
                      <el-input
                        v-if="spec.inputVisible"
                        ref="specValueInputRef"
                        v-model="spec.inputValue"
                        size="small"
                        style="width: 120px"
                        @keyup.enter="confirmSpecValue(specIndex)"
                        @blur="confirmSpecValue(specIndex)"
                      />
                      <el-button 
                        v-else 
                        size="small" 
                        @click="showSpecValueInput(specIndex)"
                      >
                        <el-icon><Plus /></el-icon> 添加规格值
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <div class="spec-combinations" v-if="productForm.specs.length > 0 && hasSpecValues">
                  <h4>规格组合</h4>
                  <el-table :data="specCombinations" border style="width: 100%">
                    <el-table-column 
                      v-for="(spec, index) in productForm.specs" 
                      :key="index" 
                      :label="spec.name || `规格${index + 1}`" 
                      align="center"
                    >
                      <template #default="scope">
                        {{ scope.row.specs[spec.name] }}
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="价格" width="150" align="center">
                      <template #default="scope">
                        <el-input-number 
                          v-model="scope.row.price" 
                          :min="0" 
                          :precision="2" 
                          :step="0.1" 
                          size="small" 
                          style="width: 120px"
                        />
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="库存" width="150" align="center">
                      <template #default="scope">
                        <el-input-number 
                          v-model="scope.row.stock" 
                          :min="0" 
                          size="small" 
                          style="width: 120px"
                        />
                      </template>
                    </el-table-column>
                    
                    <el-table-column label="编码" width="150" align="center">
                      <template #default="scope">
                        <el-input
                          v-model="scope.row.sku_code"
                          size="small"
                          placeholder="SKU编码"
                          style="width: 120px"
                        />
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                
                <div v-else-if="productForm.specs.length > 0" class="empty-combinations">
                  <el-empty description="请为规格项添加规格值，生成规格组合"></el-empty>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="tech-button cancel-button">取消</el-button>
          <el-button type="primary" @click="submitForm" class="tech-button submit-button">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  Plus, 
  Search, 
  Refresh, 
  Grid, 
  Edit, 
  Delete, 
  View, 
  Hide, 
  Picture, 
  CircleCheck, 
  CircleClose,
  InfoFilled 
} from '@element-plus/icons-vue';
import { getAdminProducts, addProduct, updateProduct, deleteProduct, updateProductStatus, getCategories } from '@/api/admin';

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: ''
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);

// 加载状态
const loading = ref(false);

// 商品列表数据
const productList = ref([]);

// 分类数据
const categories = ref([]);

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
};

// 表格头部样式
const tableHeaderClassName = () => {
  return 'tech-table-header';
};

// 获取库存进度条颜色
const getStockColor = (stock) => {
  if (stock <= 0) return '#F56C6C'; // 无库存
  if (stock <= 10) return '#E6A23C'; // 库存紧张
  return '#67C23A'; // 库存充足
};

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await getCategories();
    if (res.code === 200 && res.data) {
      categories.value = res.data.map(item => ({
        value: item.categoryId,
        label: item.categoryName
      }));
    }
  } catch (error) {
    console.error('加载分类数据失败:', error);
    ElMessage.error('加载分类数据失败');
  }
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref('add'); // 'add' 或 'edit'
const productFormRef = ref(null);
const activeTab = ref('basic');

const productForm = reactive({
  goodsId: null,  // 添加商品ID字段
  goods_name: '',
  category_id: '',
  goods_img: '',
  price_new: 0,
  price_old: 0,
  stock: 0,
  stock_warning: 10, // 库存预警值
  goods_detail: '',
  goods_status: 'off',
  sort: 0,
  specs: [], // 规格数组
  album: [] // 商品相册
});

// 商品相册相关
const albumFiles = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');

// 处理相册图片上传成功
const handleAlbumSuccess = (response) => {
  if (response.code === 200 && response.data) {
    const url = response.data.url;
    productForm.album.push(url);
    albumFiles.value.push({
      name: url.substring(url.lastIndexOf('/') + 1),
      url: url
    });
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 移除相册图片
const handleAlbumRemove = (file) => {
  const index = albumFiles.value.indexOf(file);
  if (index > -1) {
    albumFiles.value.splice(index, 1);
    productForm.album.splice(index, 1);
  }
};

// 预览相册图片
const handleAlbumPreview = (file) => {
  previewImage.value = file.url;
  previewVisible.value = true;
};

// 表单验证规则
const rules = {
  goods_name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category_id: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  goods_img: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  price_new: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' }
  ]
};

// 加载商品列表数据
const loadProductList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchForm.keyword || undefined,
      category: searchForm.category || undefined,
      status: searchForm.status || undefined
    };
    
    console.log('加载商品列表参数:', params);
    
    const res = await getAdminProducts(params);
    if (res.code === 200 && res.data) {
      // 检查并修复图片URL
      const processedProducts = res.data.records.map(product => {
        console.log('原始商品数据:', product);
        // 检查图片URL是否有效
        if (product.goodsImg) {
          // 使用静态资源路径，避免401认证问题
          if (!product.goodsImg.startsWith('http')) {
            // 从商品ID中提取编号，使用静态资源路径
            const goodsId = product.goodsId || '';
            product.goodsImg = `/src/assets/img/goods/goods${goodsId}.jpg`;
          }
          console.log('处理后图片URL:', product.goodsImg);
        } else {
          // 设置默认图片
          product.goodsImg = '/src/assets/img/goods/default-product.jpg';
          console.log('使用默认图片URL:', product.goodsImg);
        }
        return product;
      });
      
      productList.value = processedProducts;
      total.value = res.data.total || 0;
      console.log('加载商品列表成功，总数:', total.value);
      console.log('处理后的商品列表:', productList.value);
    } else {
      ElMessage.error(res.message || '获取商品列表失败');
    }
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索方法
const handleSearch = () => {
  currentPage.value = 1;
  loadProductList();
};

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = '';
  });
  currentPage.value = 1;
  loadProductList();
};

// 分页事件处理
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadProductList();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadProductList();
};

// 添加商品
const handleAdd = () => {
  dialogType.value = 'add';
  activeTab.value = 'basic';
  
  // 重置表单所有字段
  productForm.goodsId = null;
  productForm.goods_name = '';
  productForm.category_id = '';
  productForm.goods_img = '';
  productForm.price_new = 0;
  productForm.price_old = 0;
  productForm.stock = 0;
  productForm.stock_warning = 10;
  productForm.goods_detail = '';
  productForm.goods_status = 'off';
  productForm.sort = 0;
  productForm.specs = [];
  productForm.album = [];
  
  // 清空相册文件列表
  albumFiles.value = [];
  
  // 清空规格组合
  specCombinations.value = [];
  
  console.log('添加商品表单数据:', productForm);
  dialogVisible.value = true;
};

// 编辑商品
const handleEdit = (row) => {
  dialogType.value = 'edit';
  activeTab.value = 'basic';
  
  // 重置表单数据
  productForm.goodsId = row.goodsId;
  productForm.goods_name = row.goodsName || '';
  productForm.category_id = row.categoryId || '';
  productForm.goods_img = row.goodsImg || '';
  productForm.price_new = row.priceNew || 0;
  productForm.price_old = row.priceOld || 0;
  productForm.stock = row.stock || 0;
  productForm.stock_warning = row.stockWarning || 10;
  productForm.goods_detail = row.goodsDetail || '';
  productForm.goods_status = row.goodsStatus || 'off';
  productForm.sort = row.sort || 0;
  
  // 加载规格和相册数据
  if (row.specs && typeof row.specs === 'string') {
    try {
      productForm.specs = JSON.parse(row.specs);
      // 确保每个规格都有inputVisible和inputValue属性
      productForm.specs.forEach(spec => {
        spec.inputVisible = false;
        spec.inputValue = '';
      });
      
      // 生成规格组合
      generateSpecCombinations();
    } catch (e) {
      console.error('解析规格数据失败:', e);
      productForm.specs = [];
    }
  } else {
    productForm.specs = [];
  }
  
  // 处理相册数据
  albumFiles.value = [];
  if (row.album && typeof row.album === 'string') {
    try {
      const album = JSON.parse(row.album);
      productForm.album = album;
      
      // 转换为上传组件需要的格式
      albumFiles.value = album.map(url => ({
        name: url.substring(url.lastIndexOf('/') + 1),
        url: url
      }));
    } catch (e) {
      console.error('解析相册数据失败:', e);
      productForm.album = [];
    }
  } else {
    productForm.album = [];
  }
  
  console.log('编辑商品表单数据:', productForm);
  dialogVisible.value = true;
};

// 更新商品状态
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.goodsStatus === 'on' ? 'off' : 'on';
    const res = await updateProductStatus(row.goodsId, newStatus);
    if (res.code === 200) {
      ElMessage.success(`商品已${newStatus === 'on' ? '上架' : '下架'}`);
      row.goodsStatus = newStatus;
    } else {
      ElMessage.error(res.message || '更新商品状态失败');
    }
  } catch (error) {
    console.error('更新商品状态失败:', error);
    ElMessage.error('更新商品状态失败');
  }
};

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该商品吗？此操作不可恢复',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await deleteProduct(row.goodsId);
      if (res.code === 200) {
        ElMessage.success('删除商品成功');
        loadProductList();
      } else {
        ElMessage.error(res.message || '删除商品失败');
      }
    } catch (error) {
      console.error('删除商品失败:', error);
      ElMessage.error('删除商品失败');
    }
  }).catch(() => {});
};

// 上传图片成功回调
const handleUploadSuccess = (response) => {
  if (response.code === 200 && response.data) {
    productForm.goods_img = response.data.url;
    ElMessage.success('上传成功');
  } else {
    ElMessage.error(response.message || '上传失败');
  }
};

// 上传前验证
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG && !isPNG) {
    ElMessage.error('上传图片只能是 JPG 或 PNG 格式!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 规格管理相关
const specValueInputRef = ref(null);

// 添加规格组
const addSpecGroup = () => {
  productForm.specs.push({
    name: '',
    values: [],
    inputVisible: false,
    inputValue: ''
  });
};

// 移除规格组
const removeSpecGroup = (index) => {
  productForm.specs.splice(index, 1);
  // 更新规格组合
  generateSpecCombinations();
};

// 显示规格值输入框
const showSpecValueInput = (specIndex) => {
  productForm.specs[specIndex].inputVisible = true;
  nextTick(() => {
    specValueInputRef.value?.focus();
  });
};

// 确认添加规格值
const confirmSpecValue = (specIndex) => {
  const inputValue = productForm.specs[specIndex].inputValue.trim();
  if (inputValue) {
    // 检查是否已存在该规格值
    if (!productForm.specs[specIndex].values.includes(inputValue)) {
      productForm.specs[specIndex].values.push(inputValue);
      // 更新规格组合
      generateSpecCombinations();
    } else {
      ElMessage.warning('该规格值已存在');
    }
  }
  productForm.specs[specIndex].inputVisible = false;
  productForm.specs[specIndex].inputValue = '';
};

// 移除规格值
const removeSpecValue = (specIndex, valueIndex) => {
  productForm.specs[specIndex].values.splice(valueIndex, 1);
  // 更新规格组合
  generateSpecCombinations();
};

// 判断是否有规格值
const hasSpecValues = computed(() => {
  return productForm.specs.some(spec => spec.values.length > 0);
});

// 规格组合数据
const specCombinations = ref([]);

// 生成规格组合
const generateSpecCombinations = () => {
  // 过滤出有规格值的规格组
  const validSpecs = productForm.specs.filter(spec => spec.name && spec.values.length > 0);
  
  if (validSpecs.length === 0) {
    specCombinations.value = [];
    return;
  }
  
  // 生成所有可能的规格组合
  const combinations = [];
  
  // 递归生成组合
  const generateCombination = (index, current) => {
    if (index === validSpecs.length) {
      // 检查是否已存在相同组合
      const existingCombination = specCombinations.value.find(item => {
        return Object.keys(item.specs).every(key => item.specs[key] === current[key]);
      });
      
      // 如果已存在，保持原有价格和库存
      combinations.push({
        specs: { ...current },
        price: existingCombination ? existingCombination.price : productForm.price_new,
        stock: existingCombination ? existingCombination.stock : productForm.stock,
        sku_code: existingCombination ? existingCombination.sku_code : ''
      });
      return;
    }
    
    const spec = validSpecs[index];
    for (const value of spec.values) {
      current[spec.name] = value;
      generateCombination(index + 1, current);
    }
  };
  
  generateCombination(0, {});
  specCombinations.value = combinations;
};

// 提交表单
const submitForm = async () => {
  if (!productFormRef.value) return;
  
  productFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理规格组合数据
        const specData = productForm.specs.map(spec => ({
          name: spec.name,
          values: spec.values
        }));
        
        const formData = {
          goodsName: productForm.goods_name,
          categoryId: productForm.category_id,
          goodsImg: productForm.goods_img,
          priceNew: productForm.price_new,
          priceOld: productForm.price_old,
          stock: productForm.stock,
          stockWarning: productForm.stock_warning,
          goodsDetail: productForm.goods_detail,
          goodsStatus: productForm.goods_status,
          sort: productForm.sort,
          specs: JSON.stringify(specData),
          specCombinations: JSON.stringify(specCombinations.value),
          album: JSON.stringify(productForm.album)
        };
        
        let res;
        if (dialogType.value === 'add') {
          res = await addProduct(formData);
        } else {
          // 检查商品ID是否存在
          if (!productForm.goodsId) {
            ElMessage.error('商品ID不存在，无法更新');
            return;
          }
          console.log('更新商品:', productForm.goodsId, formData);
          res = await updateProduct(productForm.goodsId, formData);
        }
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '添加商品成功' : '更新商品成功');
          dialogVisible.value = false;
          loadProductList();
        } else {
          ElMessage.error(res.message || '操作失败');
        }
      } catch (error) {
        console.error('提交表单失败:', error);
        ElMessage.error('操作失败');
      }
    } else {
      console.log('表单校验失败');
      return false;
    }
  });
};

onMounted(() => {
  loadCategories();
  loadProductList();
});
</script>

<style lang="scss" scoped>
.products-container {
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100%;
}

/* 卡片样式 */
.search-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

.data-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  
  .header-title {
    font-size: 18px;
    font-weight: bold;
    display: flex;
    align-items: center;
    
    .icon-tech {
      margin-right: 8px;
      font-size: 20px;
      color: #409EFF;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
}

/* 按钮样式 */
.add-button {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }
}

.tech-button {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.search-button {
  background: linear-gradient(45deg, #409EFF, #59b6ff);
  border: none;
  
  &:hover {
    background: linear-gradient(45deg, #59b6ff, #409EFF);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.action-button {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* 表格样式 */
.tech-table {
  border-radius: 8px;
  
  :deep(.el-table__header) {
    th {
      background-color: #eef5ff;
      font-weight: bold;
      color: #333;
    }
  }
  
  :deep(.even-row) {
    background-color: #f9fbff;
  }
  
  :deep(.odd-row) {
    background-color: #ffffff;
  }
  
  :deep(.el-table__row) {
    transition: all 0.3s;
    
    &:hover {
      background-color: #ecf5ff !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
      z-index: 10;
    }
  }
}

/* 图片样式 */
.product-image {
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 12px;
  
  .el-icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
}

/* 标签样式 */
.price-tag {
  font-weight: bold;
  color: #ff6b6b;
}

.stock-progress {
  max-width: 60px;
  margin: 0 auto 5px;
}

.stock-text {
  font-size: 13px;
  color: #606266;
}

.sales-badge {
  display: inline-block;
  background: linear-gradient(45deg, #11cdef, #1171ef);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-tag {
  border-radius: 12px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 0 auto;
  
  .el-icon {
    margin-right: 4px;
  }
}

/* 分页样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  
  .tech-pagination {
    :deep(.el-pagination__jump) {
      margin-left: 16px;
    }
    
    :deep(.el-pager li.is-active) {
      background: linear-gradient(45deg, #409EFF, #59b6ff);
      color: white;
    }
    
    :deep(.el-pagination__sizes) {
      margin-right: 16px;
    }
  }
}

/* 对话框样式 */
:deep(.tech-dialog) {
  .el-dialog__header {
    background: linear-gradient(45deg, #409EFF, #59b6ff);
    color: white;
    padding: 16px 20px;
    border-radius: 8px 8px 0 0;
    
    .el-dialog__title {
      color: white;
      font-weight: bold;
    }
    
    .el-dialog__close {
      color: white;
    }
  }
  
  .el-dialog__footer {
    border-top: 1px solid #f0f0f0;
    padding: 12px 20px;
  }
}

/* 表单样式 */
.tech-form {
  padding: 16px 0;
}

/* 上传区域样式 */
.product-uploader {
  .upload-area {
    width: 160px;
    height: 160px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409EFF;
      background-color: #f5f7fa;
    }
    
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #909399;
      
      .upload-icon {
        font-size: 28px;
        margin-bottom: 8px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  .submit-button {
    background: linear-gradient(45deg, #409EFF, #59b6ff);
    border: none;
    
    &:hover {
      background: linear-gradient(45deg, #59b6ff, #409EFF);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }
  }
  
  .cancel-button:hover {
    opacity: 0.8;
  }
}

/* 响应式优化 */
@media screen and (max-width: 1200px) {
  .search-form {
    flex-wrap: wrap;
  }
}

/* 规格管理样式 */
.specs-container {
  margin-top: 20px;
}

.spec-group {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h4 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
}

.spec-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
}

.spec-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
}

.spec-combinations {
  margin-top: 20px;
  
  h4 {
    margin-bottom: 15px;
    font-size: 16px;
    color: #303133;
  }
}

.empty-combinations {
  margin-top: 20px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 4px;
}

/* 相册上传样式 */
.product-album-uploader {
  margin-top: 10px;
}

/* Tab 样式 */
:deep(.el-tabs__nav) {
  margin-bottom: 20px;
}

/* 库存状态样式 */
.stock-warning {
  color: #E6A23C;
  font-weight: bold;
}

.stock-danger {
  color: #F56C6C;
  font-weight: bold;
}

.stock-normal {
  color: #67C23A;
}
</style> 