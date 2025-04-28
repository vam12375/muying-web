<template>
  <div class="address-manager-container">
    <!-- 页面标题和添加按钮 -->
    <div class="section-header">
      <div class="title-container">
        <h2 class="section-title">收货地址</h2>
        <div class="subtitle">管理您的收货地址，便于快速收货</div>
      </div>
      <el-button type="primary" class="add-button" @click="openAddressDialog()">
        <i class="el-icon-plus"></i>
        添加新地址
      </el-button>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="addresses.length === 0" class="empty-container">
      <el-empty description="暂无收货地址">
        <div class="empty-description">添加您的收货地址，享受便捷的配送服务</div>
        <el-button type="primary" class="empty-button" @click="openAddressDialog()">添加新地址</el-button>
      </el-empty>
    </div>
    
    <!-- 地址列表 -->
    <transition-group 
      name="address-list" 
      tag="div" 
      class="address-list"
      v-else
    >
      <div v-for="address in addresses" :key="address.addressId" class="address-item">
        <div class="address-content">
          <div class="address-info">
            <!-- 地址头部信息 -->
            <div class="address-header">
              <span class="recipient">{{ address.receiver }}</span>
              <span class="phone">{{ address.phone }}</span>
              <transition name="tag-fade">
                <el-tag v-if="address.isDefault" size="small" type="danger" class="default-tag">默认地址</el-tag>
              </transition>
              <div class="tag-label" v-if="address.tag">
                <el-tag size="small" class="address-tag">{{ address.tag }}</el-tag>
              </div>
            </div>
            <!-- 详细地址 -->
            <div class="address-detail">
              {{ formatAddress(address) }}
            </div>
            <div class="address-postal" v-if="address.postalCode">
              <span class="postal-code">邮编: {{ address.postalCode }}</span>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="address-actions">
            <div class="action-buttons">
              <el-button link @click="openAddressDialog(address)" class="edit-btn">
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-divider direction="vertical" />
              <el-button link @click="deleteAddress(address)" class="delete-btn">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
            <el-button 
              v-if="!address.isDefault" 
              type="info" 
              plain
              class="default-btn"
              :loading="address.setting"
              @click="setDefaultAddress(address)"
            >
              设为默认
            </el-button>
          </div>
        </div>
      </div>
    </transition-group>
    
    <!-- 添加/编辑地址表单对话框 -->
    <el-dialog
      :title="editingAddress.addressId ? '编辑收货地址' : '添加收货地址'"
      v-model="dialogVisible"
      width="500px"
      custom-class="address-dialog"
      destroy-on-close
    >
      <el-form
        ref="addressFormRef"
        :model="editingAddress"
        :rules="addressRules"
        label-width="100px"
        class="address-form"
      >
        <el-form-item label="收货人" prop="receiver">
          <el-input v-model="editingAddress.receiver" placeholder="请输入收货人姓名"></el-input>
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="editingAddress.phone" placeholder="请输入手机号码"></el-input>
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-cascader
            v-model="editingAddress.region"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            class="region-selector"
          ></el-cascader>
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input
            v-model="editingAddress.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址信息，如道路、门牌号、小区、楼栋号、单元等"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="邮政编码" prop="postalCode">
          <el-input v-model="editingAddress.postalCode" placeholder="请输入邮政编码(选填)"></el-input>
        </el-form-item>
        
        <el-form-item label="地址标签" prop="tag">
          <div class="tag-selector">
            <el-select v-model="editingAddress.tag" placeholder="请选择(选填)" class="tag-select">
              <el-option label="家" value="家"></el-option>
              <el-option label="公司" value="公司"></el-option>
              <el-option label="学校" value="学校"></el-option>
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="editingAddress.isDefault" class="default-checkbox">
            设为默认收货地址
          </el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="saveAddress" :loading="saving" class="save-btn">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AddressManager'
}
</script>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultUserAddress } from '@/api/user'
import regions from '@/utils/regions' // 导入完整的省市区数据

// 状态
const loading = ref(false)
const saving = ref(false)
const addresses = ref([])
const dialogVisible = ref(false)
const addressFormRef = ref(null)

// 编辑中的地址
const editingAddress = reactive({
  addressId: null,
  receiver: '',
  phone: '',
  region: [],
  detail: '',
  postalCode: '',
  tag: '',
  isDefault: false
})

// 表单验证规则
const addressRules = {
  receiver: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  postalCode: [
    { pattern: /^\d{6}$/, message: '邮政编码格式不正确', trigger: 'blur' }
  ]
}

// 地区选项
const regionOptions = regions

onMounted(() => {
  loadAddresses()
})

// 加载地址数据
const loadAddresses = async () => {
  loading.value = true
  try {
    const res = await getUserAddresses()
    if (res.code === 200) {
      // 为每个地址添加loading状态
      const addressesData = (res.data || []).map(address => ({
        ...address,
        setting: false
      }))
      addresses.value = addressesData
    } else {
      ElMessage.error(res.message || '获取地址列表失败')
    }
  } catch (error) {
    console.error('加载地址失败:', error)
    ElMessage.error('加载地址失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 打开地址对话框
const openAddressDialog = (address = null) => {
  // 重置表单
  if (addressFormRef.value) {
    addressFormRef.value.resetFields()
  }
  
  if (address) {
    // 编辑模式，复制现有地址数据
    Object.assign(editingAddress, address)
    
    // 将省市区信息转换为级联选择器需要的region数组
    if (address.province || address.city || address.district) {
      editingAddress.region = [
        address.province,
        address.city,
        address.district
      ].filter(Boolean) // 过滤掉空值
    } else {
      editingAddress.region = []
    }
  } else {
    // 新增模式，重置表单
    Object.assign(editingAddress, {
      addressId: null,
      receiver: '',
      phone: '',
      region: [],
      detail: '',
      postalCode: '',
      tag: '',
      isDefault: false
    })
  }
  
  dialogVisible.value = true
}

// 保存地址
const saveAddress = () => {
  if (!addressFormRef.value) return
  
  addressFormRef.value.validate(async (valid) => {
    if (valid) {
      saving.value = true
      
      try {
        // 处理region数组，将其转换为province、city、district字段
        if (editingAddress.region && editingAddress.region.length) {
          editingAddress.province = editingAddress.region[0] || ''
          editingAddress.city = editingAddress.region[1] || ''
          editingAddress.district = editingAddress.region[2] || ''
        }
        
        // 清除region字段，API不需要这个字段
        const addressData = { ...editingAddress }
        delete addressData.region
        delete addressData.setting
        
        let res
        if (editingAddress.addressId) {
          // 更新地址
          res = await updateUserAddress(editingAddress.addressId, addressData)
        } else {
          // 添加新地址
          res = await addUserAddress(addressData)
        }
        
        if (res.code === 200) {
          ElMessage({
            message: editingAddress.addressId ? '地址更新成功' : '地址添加成功',
            type: 'success',
            customClass: 'address-message'
          })
          dialogVisible.value = false
          // 重新加载地址列表
          loadAddresses()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        console.error('保存地址时出错:', error)
        ElMessage.error('操作失败')
      } finally {
        saving.value = false
      }
    }
  })
}

// 删除地址
const deleteAddress = (address) => {
  ElMessageBox.confirm(
    '确定要删除该收货地址吗？',
    '删除地址',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      customClass: 'address-confirm-box'
    }
  )
    .then(async () => {
      try {
        const res = await deleteUserAddress(address.addressId)
        if (res.code === 200) {
          ElMessage({
            message: '地址删除成功',
            type: 'success',
            customClass: 'address-message'
          })
          
          // 使用动画效果删除地址
          const index = addresses.value.findIndex(a => a.addressId === address.addressId)
          if (index !== -1) {
            addresses.value.splice(index, 1)
          }
        } else {
          ElMessage.error(res.message || '地址删除失败')
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        ElMessage.error('删除地址失败，请稍后重试')
      }
    })
    .catch(() => {})
}

// 设置默认地址
const setDefaultAddress = async (address) => {
  // 设置loading状态
  address.setting = true
  
  try {
    const res = await setDefaultUserAddress(address.addressId)
    if (res.code === 200) {
      ElMessage({
        message: '默认地址设置成功',
        type: 'success',
        customClass: 'address-message'
      })
      await loadAddresses() // 重新加载地址列表
    } else {
      ElMessage.error(res.message || '设置默认地址失败')
    }
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败，请稍后重试')
  } finally {
    address.setting = false
  }
}

// 格式化地址显示
const formatAddress = (address) => {
  let result = ''
  
  // 使用省市区信息组合地址
  if (address.province) {
    result += address.province
  }
  if (address.city) {
    result += ' ' + address.city
  }
  if (address.district) {
    result += ' ' + address.district
  }
  
  // 添加详细地址
  if (address.detail) {
    result += ' ' + address.detail
  }
  
  return result
}
</script>

<style lang="scss" scoped>
.address-manager-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease-in-out;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  .title-container {
    display: flex;
    flex-direction: column;
  }
  
  .section-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 3px;
      background: linear-gradient(90deg, #f27c8d, #ffa9b7);
      border-radius: 3px;
    }
  }
  
  .subtitle {
    font-size: 14px;
    color: #909399;
    margin-top: 8px;
  }
  
  .add-button {
    font-weight: 500;
    padding: 12px 24px;
    border-radius: 8px;
    background: linear-gradient(135deg, #f27c8d, #e86b7d);
    border: none;
    box-shadow: 0 4px 12px rgba(242, 124, 141, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(242, 124, 141, 0.4);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(242, 124, 141, 0.3);
    }
  }
}

.loading-container, .empty-container {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  
  .empty-description {
    margin: 15px 0 25px;
    color: #909399;
    font-size: 14px;
  }
  
  .empty-button {
    padding: 12px 24px;
    font-weight: 500;
    border-radius: 8px;
    background: linear-gradient(135deg, #f27c8d, #e86b7d);
    border: none;
    box-shadow: 0 4px 12px rgba(242, 124, 141, 0.3);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(242, 124, 141, 0.4);
    }
  }
}

.address-list {
  margin-top: 25px;
  
  .address-item {
    border: 1px solid #ebeef5;
    border-radius: 12px;
    margin-bottom: 20px;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: #e1e4e8;
    }
  }
  
  .address-content {
    padding: 24px;
  }
  
  .address-info {
    margin-bottom: 20px;
  }
  
  .address-header {
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    
    .recipient {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
    
    .phone {
      color: #606266;
      font-size: 15px;
    }
    
    .default-tag {
      border-radius: 4px;
      font-weight: 500;
      padding: 0 8px;
      height: 22px;
      line-height: 20px;
      background-color: rgba(242, 124, 141, 0.1);
      border-color: rgba(242, 124, 141, 0.2);
      color: #f27c8d;
    }
    
    .address-tag {
      background-color: #ecf5ff;
      border-color: #d9ecff;
      color: #409eff;
    }
  }
  
  .address-detail {
    color: #606266;
    line-height: 1.6;
    font-size: 15px;
    padding-left: 3px;
  }
  
  .address-postal {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
  }
  
  .address-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #ebeef5;
    padding-top: 16px;
    margin-top: 4px;
    
    .action-buttons {
      display: flex;
      align-items: center;
      
      .edit-btn, .delete-btn {
        font-weight: 500;
        transition: all 0.3s;
        color: #606266;
        
        &:hover {
          color: #f27c8d;
          transform: translateY(-1px);
        }
      }
      
      .delete-btn:hover {
        color: #f56c6c;
      }
      
      .el-divider {
        margin: 0 12px;
        height: 16px;
      }
    }
    
    .default-btn {
      font-weight: 500;
      background: #f5f7fa;
      color: #606266;
      border: none;
      transition: all 0.3s;
      border-radius: 6px;
      padding: 9px 16px;
      
      &:hover {
        background: #f0f2f5;
        color: #303133;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      &:active {
        transform: translateY(0);
        box-shadow: none;
      }
    }
  }
}

/* 地址列表动画 */
.address-list-enter-active,
.address-list-leave-active {
  transition: all 0.5s ease;
}
.address-list-enter-from,
.address-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 标签动画 */
.tag-fade-enter-active,
.tag-fade-leave-active {
  transition: all 0.3s ease;
}
.tag-fade-enter-from,
.tag-fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 表单样式 */
.address-form {
  .el-form-item {
    margin-bottom: 22px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .el-input, .el-select, .el-cascader, .el-checkbox {
    width: 100%;
  }
  
  .region-selector {
    width: 100%;
  }
  
  .default-checkbox {
    color: #606266;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  
  .cancel-btn {
    margin-right: 12px;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  .save-btn {
    background: linear-gradient(135deg, #f27c8d, #e86b7d);
    border: none;
    font-weight: 500;
    transition: all 0.3s;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(242, 124, 141, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: none;
    }
  }
}

/* 响应式样式 */
@media (max-width: 768px) {
  .address-manager-container {
    padding: 20px;
    border-radius: 8px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    
    .add-button {
      width: 100%;
      margin-top: 10px;
    }
  }
  
  .address-item {
    .address-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
      
      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
      
      .default-btn {
        width: 100%;
        margin-top: 5px;
      }
    }
  }
  
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .address-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }
}

/* 添加全局样式，使dialog更现代化 */
:deep(.address-dialog) {
  border-radius: 12px;
  overflow: hidden;
  
  .el-dialog__header {
    padding: 20px 24px;
    margin-right: 0;
    border-bottom: 1px solid #f0f2f5;
    
    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f2f5;
  }
  
  .el-form-item__label {
    font-weight: 500;
  }
  
  .el-input__inner {
    border-radius: 6px;
  }
}

/* 消息框样式 */
:global(.address-message) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 确认框样式 */
:global(.address-confirm-box) {
  border-radius: 12px;
  
  .el-message-box__header {
    padding-top: 20px;
  }
  
  .el-message-box__content {
    padding: 24px;
  }
  
  .el-message-box__btns {
    padding: 12px 20px 20px;
  }
}
</style>