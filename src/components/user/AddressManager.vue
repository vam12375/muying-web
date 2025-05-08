<template>
  <div class="address-manager-container" :class="{ 'checkout-mode': checkoutMode }">
    <!-- 页面标题和添加按钮 -->
    <div class="section-header" v-if="!checkoutMode">
      <div class="title-container">
        <h2 class="section-title">收货地址</h2>
        <div class="subtitle">管理您的收货地址，便于快速收货</div>
      </div>
      <el-button type="primary" class="add-button" @click="openAddressDialog()">
        <i class="el-icon-plus"></i>
        添加新地址
      </el-button>
    </div>
    
    <!-- 结算模式的地址选择提示 -->
    <div class="checkout-address-tip" v-if="checkoutMode">
      请选择一个收货地址，或添加新地址
      <el-button type="primary" class="add-button-small" @click="openAddressDialog()">
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
      <div 
        v-for="address in addresses" 
        :key="address.addressId" 
        class="address-item" 
        :class="{ 'address-selected': props.checkoutMode && address.addressId == props.initialSelectedId }"
        @click="onAddressClick(address)"
      >
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
          
          <!-- 选中图标 -->
          <div v-if="props.checkoutMode && address.addressId == props.initialSelectedId" class="selected-icon">
            <el-icon color="#ff6700"><CircleCheckFilled /></el-icon>
          </div>
          
          <!-- 操作按钮 -->
          <div v-else class="address-actions">
            <div class="action-buttons">
              <el-button link @click.stop="openAddressDialog(address)" class="edit-btn">
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-divider direction="vertical" />
              <el-button link @click.stop="deleteAddress(address)" class="delete-btn">
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </div>
            <el-button 
              v-if="!address.isDefault" 
              type="info" 
              plain
              class="default-btn"
              :loading="address.setting"
              @click.stop="setDefaultAddress(address)"
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
  name: 'AddressManager',
  props: {
    // 初始选中的地址ID
    initialSelectedId: {
      type: [Number, String],
      default: null
    },
    // 结算页面模式 (简化UI)
    checkoutMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['address-selected']
}
</script>

<script setup>
import { ref, reactive, onMounted, watch, defineProps, defineEmits } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress, setDefaultUserAddress } from '@/api/user'
import regions from '@/utils/regions' // 导入完整的省市区数据
import { CircleCheckFilled } from '@element-plus/icons-vue'

const props = defineProps({
  initialSelectedId: {
    type: [Number, String],
    default: null
  },
  checkoutMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['address-selected'])

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
  console.log('[AddressManager] 开始加载地址数据')
  
  try {
    const res = await getUserAddresses()
    console.log('[AddressManager] 获取地址API响应:', res)
    
    if (res.code === 200) {
      // 为每个地址添加loading状态
      const addressesData = (res.data || []).map(address => ({
        ...address,
        setting: false
      }))
      addresses.value = addressesData
      console.log('[AddressManager] 成功加载地址数量:', addressesData.length)
      
      // 检查是否有初始选中的地址ID
      if (props.initialSelectedId) {
        console.log('[AddressManager] 初始选中地址ID:', props.initialSelectedId)
        const selected = addressesData.find(addr => addr.addressId == props.initialSelectedId)
        if (selected) {
          console.log('[AddressManager] 找到初始选中地址:', selected.receiver)
          emit('address-selected', selected)
        } else if (addressesData.length > 0 && props.checkoutMode) {
          console.log('[AddressManager] 未找到初始选中地址，选择第一个地址')
          emit('address-selected', addressesData[0])
        }
      } else if (addressesData.length > 0 && props.checkoutMode) {
        console.log('[AddressManager] 无初始选中ID，在结算模式下选择第一个地址')
        emit('address-selected', addressesData[0])
      }
    } else {
      console.error('[AddressManager] 获取地址列表失败:', res.message)
      ElMessage.error(res.message || '获取地址列表失败')
    }
  } catch (error) {
    console.error('[AddressManager] 加载地址失败:', error)
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

// 在结算页面模式下，点击地址卡片时发出选择事件
const onAddressClick = (address) => {
  if (props.checkoutMode) {
    console.log('[AddressManager] 用户选择了地址:', address.receiver)
    emit('address-selected', address)
  }
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
      
      // 如果在结算页面模式，选中该地址
      if (props.checkoutMode) {
        emit('address-selected', address)
      }
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

// 监听初始选中的地址ID变化
watch(() => props.initialSelectedId, (newId) => {
  if (newId && addresses.value.length > 0) {
    const address = addresses.value.find(addr => addr.addressId == newId)
    if (address) {
      emit('address-selected', address)
    }
  }
}, { immediate: true })

// 加载地址后检查是否有初始选中的地址
watch(() => addresses.value, (newAddresses) => {
  if (props.initialSelectedId && newAddresses.length > 0) {
    const address = newAddresses.find(addr => addr.addressId == props.initialSelectedId)
    if (address) {
      emit('address-selected', address)
    } else if (newAddresses.length > 0 && props.checkoutMode) {
      // 如果没有找到指定ID的地址，但在结算模式下，选中第一个地址
      emit('address-selected', newAddresses[0])
    }
  } else if (newAddresses.length > 0 && props.checkoutMode) {
    // 如果没有初始ID但有地址，在结算模式下选中第一个
    emit('address-selected', newAddresses[0])
  }
}, { immediate: true })

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

<style src="@/styles/user/AddressManager.scss" scoped></style>