<template>
  <div class="profile-page">
    <main-layout>
      <div class="container mx-auto py-8 px-4 animate__animated animate__fadeIn">
        <!-- 顶部封面和头像区域 -->
        <div class="profile-header rounded-xl overflow-hidden bg-white shadow-lg mb-6" data-aos="fade-up">
          <div class="cover-photo relative h-48 w-full overflow-hidden">
            <el-image 
              src="https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=2070" 
              fit="cover" 
              class="w-full h-full object-cover"
              :loading="lazy"
            />
            <div class="absolute right-4 bottom-4">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="handleCoverUpload"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button size="small" type="primary" circle>
                  <el-icon><Camera /></el-icon>
                </el-button>
              </el-upload>
            </div>
          </div>
          
          <div class="relative px-6 pb-6">
            <div class="absolute -top-16 left-6 rounded-full border-4 border-white bg-white shadow-md">
              <div class="relative w-32 h-32 rounded-full overflow-hidden">
                <el-image 
                  :src="userInfo.avatar || defaultAvatar" 
                  :alt="userInfo.nickname || '用户'" 
                  class="w-full h-full object-cover"
                />
                <div class="absolute bottom-0 right-0">
                  <el-upload
                    class="avatar-uploader"
                    action="#"
                    :http-request="handleAvatarUpload"
                    :show-file-list="false"
                    accept="image/*"
                  >
                    <el-button size="small" type="primary" circle>
                      <el-icon><Camera /></el-icon>
                    </el-button>
                  </el-upload>
                </div>
              </div>
            </div>
            
            <div class="mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 class="text-2xl font-bold">{{ userInfo.nickname || userInfo.username }}</h1>
                <p class="text-gray-500">@{{ userInfo.username }}</p>
                <p class="mt-2 text-sm max-w-md">{{ userInfo.bio || '这个人很懒，什么都没留下' }}</p>
              </div>
              
              <div class="flex gap-4">
                <el-button type="primary" @click="startEdit" v-if="!isEditing">编辑资料</el-button>
                <template v-else>
                  <el-button @click="cancelEdit">取消</el-button>
                  <el-button type="primary" @click="saveUserInfo">保存</el-button>
                </template>
                <el-dropdown trigger="click">
                  <el-button circle>
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="showPasswordDialog = true">
                        <el-icon><Lock /></el-icon>修改密码
                      </el-dropdown-item>
                      <el-dropdown-item @click="showPhoneDialog = true">
                        <el-icon><Iphone /></el-icon>{{ userInfo.phone ? '更换手机号' : '绑定手机号' }}
                      </el-dropdown-item>
                      <el-dropdown-item @click="showEmailDialog = true">
                        <el-icon><Message /></el-icon>{{ userInfo.email ? '更换邮箱' : '绑定邮箱' }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            
            <!-- 用户统计数据 -->
            <div class="mt-6 grid grid-cols-3 sm:max-w-md gap-4">
              <div class="stat-item transform hover:scale-105 transition-transform bg-pink-gradient p-4 rounded-lg text-center text-white">
                <div class="text-2xl font-bold">{{ userInfo.orderCount || 0 }}</div>
                <div class="text-sm">订单</div>
              </div>
              <div class="stat-item transform hover:scale-105 transition-transform bg-pink-gradient p-4 rounded-lg text-center text-white">
                <div class="text-2xl font-bold">{{ userInfo.points || 0 }}</div>
                <div class="text-sm">积分</div>
              </div>
              <div class="stat-item transform hover:scale-105 transition-transform bg-pink-gradient p-4 rounded-lg text-center text-white">
                <div class="text-2xl font-bold">{{ userInfo.couponCount || 0 }}</div>
                <div class="text-sm">优惠券</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 内容标签页 -->
        <el-tabs class="profile-tabs" tab-position="top">
          <el-tab-pane label="个人资料">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- 基本资料卡片 -->
              <div class="lg:col-span-2" data-aos="fade-right">
                <div class="bg-white rounded-lg shadow-md p-6 h-full">
                  <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-semibold">基本资料</h3>
                  </div>
                  
                  <!-- 查看模式 -->
                  <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div v-for="(item, index) in userInfoDisplay" :key="index" 
                         class="info-item transform hover:translate-x-2 transition-transform">
                      <div class="text-gray-500 mb-1">{{ item.label }}</div>
                      <div>{{ item.value }}</div>
                    </div>
                    
                    <div class="info-item md:col-span-2 transform hover:translate-x-2 transition-transform">
                      <div class="text-gray-500 mb-1">个性签名</div>
                      <div>{{ userInfo.bio || '这个人很懒，什么都没留下' }}</div>
                    </div>
                  </div>
                  
                  <!-- 编辑模式 -->
                  <el-form 
                    v-else 
                    :model="editForm" 
                    :rules="rules" 
                    ref="formRef" 
                    label-width="100px"
                    class="edit-form"
                  >
                    <el-form-item label="昵称" prop="nickname">
                      <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
                    </el-form-item>
                    
                    <el-form-item label="性别" prop="gender">
                      <el-radio-group v-model="editForm.gender">
                        <el-radio :label="1">男</el-radio>
                        <el-radio :label="2">女</el-radio>
                        <el-radio :label="0">保密</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    
                    <el-form-item label="生日" prop="birthday">
                      <el-date-picker 
                        v-model="editForm.birthday" 
                        type="date" 
                        placeholder="选择出生日期"
                        :disabled-date="disabledDate"
                      />
                    </el-form-item>
                    
                    <el-form-item label="个性签名" prop="bio">
                      <el-input 
                        v-model="editForm.bio" 
                        type="textarea" 
                        :rows="3" 
                        placeholder="介绍一下自己吧" 
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </el-form>
                </div>
              </div>
              
              <!-- 账号安全卡片 -->
              <div class="lg:col-span-1" data-aos="fade-left">
                <div class="bg-white rounded-lg shadow-md p-6 h-full">
                  <h3 class="text-lg font-semibold mb-6">账号安全</h3>
                  <div class="space-y-4">
                    <div v-for="(item, index) in securityItems" :key="index"
                         class="security-item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                         @click="item.action">
                      <div class="flex items-center gap-3">
                        <div class="icon-wrapper flex items-center justify-center w-10 h-10 rounded-full bg-pink-gradient text-white">
                          <el-icon><component :is="item.icon" /></el-icon>
                        </div>
                        <div>
                          <div class="font-medium">{{ item.title }}</div>
                          <div class="text-sm text-gray-500">{{ item.description }}</div>
                        </div>
                      </div>
                      <el-icon class="text-gray-400"><ArrowRight /></el-icon>
                    </div>
                    
                    <div class="security-item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div class="flex items-center gap-3">
                        <div class="icon-wrapper flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-500">
                          <el-icon><UserFilled /></el-icon>
                        </div>
                        <div>
                          <div class="font-medium">会员等级</div>
                          <div class="text-sm text-gray-500">{{ getUserLevel(userInfo.level) }}</div>
                        </div>
                      </div>
                      <el-tag type="warning" effect="plain">{{ userInfo.level }} 级</el-tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="收货地址">
            <!-- 收货地址卡片 -->
            <div class="bg-white rounded-lg shadow-md p-6 mt-2" data-aos="fade-up">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold">收货地址</h3>
                <el-button type="primary" @click="goToAddressManager">管理收货地址</el-button>
              </div>
              
              <div v-if="addresses.length === 0" class="text-center py-8">
                <el-empty description="暂无收货地址"></el-empty>
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="address in addresses" :key="address.id" 
                     class="address-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                     :class="{'border-pink': address.isDefault}">
                  <div class="flex justify-between mb-2">
                    <div class="font-medium">{{ address.receiver }}</div>
                    <div class="text-gray-500">{{ address.phone }}</div>
                  </div>
                  <div class="text-gray-600 mb-2">
                    {{ formatFullAddress(address) }}
                  </div>
                  <div class="flex items-center justify-between">
                    <el-tag v-if="address.isDefault" size="small" type="success">默认地址</el-tag>
                    <div class="flex gap-2">
                      <el-button size="small" @click="editAddress(address)">编辑</el-button>
                      <el-button size="small" type="danger" @click="deleteAddress(address)" v-if="!address.isDefault">删除</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="订单记录">
            <div class="bg-white rounded-lg shadow-md p-6 mt-2" data-aos="fade-up">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-semibold">最近订单</h3>
                <el-button type="primary" @click="goToOrderList">查看全部订单</el-button>
              </div>
              
              <div class="orders-list">
                <el-empty description="暂无订单记录" v-if="!recentOrders || recentOrders.length === 0"></el-empty>
                
                <div v-else class="space-y-4">
                  <div v-for="order in recentOrders" :key="order.id" 
                       class="order-item border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between mb-2">
                      <div class="font-medium">订单号: {{ order.orderNumber }}</div>
                      <el-tag :type="getOrderStatusType(order.status)">{{ getOrderStatusText(order.status) }}</el-tag>
                    </div>
                    <div class="text-gray-600 mb-2">下单时间: {{ formatDate(order.createTime) }}</div>
                    <div class="text-right font-bold text-pink">¥{{ order.totalAmount.toFixed(2) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </main-layout>
    
    <!-- 对话框组件 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      custom-class="profile-dialog"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
        <el-form-item label="当前密码" prop="currentPassword">
          <el-input
            v-model="passwordForm.currentPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPasswordDialog = false">取消</el-button>
          <el-button type="primary" @click="changePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 绑定/更换手机号对话框 -->
    <el-dialog
      v-model="showPhoneDialog"
      :title="userInfo.phone ? '更换手机号' : '绑定手机号'"
      width="500px"
      custom-class="profile-dialog"
    >
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="120px">
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="phoneForm.phone"
            placeholder="请输入手机号码"
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="code">
          <div class="flex">
            <el-input
              v-model="phoneForm.code"
              placeholder="请输入验证码"
              class="flex-1 mr-2"
            />
            <el-button 
              :disabled="codeButtonDisabled" 
              @click="sendVerificationCode"
            >
              {{ codeButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPhoneDialog = false">取消</el-button>
          <el-button type="primary" @click="bindPhone">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 绑定/更换邮箱对话框 -->
    <el-dialog
      v-model="showEmailDialog"
      :title="userInfo.email ? '更换邮箱' : '绑定邮箱'"
      width="500px"
      custom-class="profile-dialog"
    >
      <el-form :model="emailForm" :rules="emailRules" ref="emailFormRef" label-width="120px">
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="emailForm.email"
            placeholder="请输入邮箱地址"
          />
        </el-form-item>
        
        <el-form-item label="验证码" prop="code">
          <div class="flex">
            <el-input
              v-model="emailForm.code"
              placeholder="请输入验证码"
              class="flex-1 mr-2"
            />
            <el-button 
              :disabled="emailCodeButtonDisabled" 
              @click="sendEmailVerificationCode"
            >
              {{ emailCodeButtonText }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEmailDialog = false">取消</el-button>
          <el-button type="primary" @click="bindEmail">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  Lock, 
  Iphone, 
  Message, 
  More, 
  Camera, 
  UserFilled, 
  ArrowRight,
  EditPen
} from '@element-plus/icons-vue';

const router = useRouter();

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';

// 用户信息
const userInfo = ref({
  id: 1,
  username: 'user123',
  nickname: '快乐妈妈',
  gender: 2,
  phone: '13800138000',
  birthday: '1990-01-01',
  email: 'user@example.com',
  avatar: '',
  bio: '热爱生活，热爱宝宝，分享育儿经验和好物。',
  registerDate: '2023-01-15',
  lastLoginDate: '2023-05-01',
  level: 2,
  points: 358,
  orderCount: 12,
  couponCount: 5
});

// 用户信息显示
const userInfoDisplay = computed(() => [
  { label: '用户名', value: userInfo.value.username },
  { label: '昵称', value: userInfo.value.nickname || '-' },
  { label: '性别', value: formatGender(userInfo.value.gender) },
  { label: '生日', value: userInfo.value.birthday || '-' },
  { label: '手机号码', value: formatPhone(userInfo.value.phone) || '-' },
  { label: '邮箱', value: userInfo.value.email || '-' },
]);

// 安全设置项
const securityItems = computed(() => [
  { 
    title: '登录密码', 
    description: '定期修改密码可保障账号安全', 
    icon: 'Lock',
    action: () => showPasswordDialog.value = true 
  },
  { 
    title: '绑定手机', 
    description: userInfo.value.phone ? '已绑定：' + formatPhone(userInfo.value.phone) : '未绑定手机号', 
    icon: 'Iphone',
    action: () => showPhoneDialog.value = true 
  },
  { 
    title: '绑定邮箱', 
    description: userInfo.value.email ? '已绑定：' + userInfo.value.email : '未绑定邮箱', 
    icon: 'Message',
    action: () => showEmailDialog.value = true 
  }
]);

// 编辑状态
const isEditing = ref(false);
const formRef = ref(null);

// 编辑表单
const editForm = ref({
  nickname: '',
  gender: 0,
  birthday: '',
  bio: ''
});

// 表单规则
const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个性签名最多200个字符', trigger: 'blur' }
  ]
};

// 收货地址
const addresses = ref([
  {
    id: 1,
    receiver: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园10号101室',
    isDefault: true
  },
  {
    id: 2,
    receiver: '李四',
    phone: '13900139000',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    detail: '体育西路123号',
    isDefault: false
  }
]);

// 最近订单
const recentOrders = ref([
  {
    id: 1,
    orderNumber: '202404151234',
    status: 1,
    createTime: '2024-04-15 14:30:25',
    totalAmount: 299.50
  },
  {
    id: 2,
    orderNumber: '202404101001',
    status: 3,
    createTime: '2024-04-10 10:25:18',
    totalAmount: 128.00
  },
  {
    id: 3,
    orderNumber: '202404050023',
    status: 4,
    createTime: '2024-04-05 09:15:42',
    totalAmount: 458.90
  }
]);

// 密码修改相关
const showPasswordDialog = ref(false);
const passwordFormRef = ref(null);
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 手机号绑定相关
const showPhoneDialog = ref(false);
const phoneFormRef = ref(null);
const phoneForm = ref({
  phone: '',
  code: ''
});
const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
};
const codeButtonDisabled = ref(false);
const countdown = ref(0);
const codeButtonText = computed(() => {
  return countdown.value > 0 ? `重新获取(${countdown.value}s)` : '获取验证码';
});

// 邮箱绑定相关
const showEmailDialog = ref(false);
const emailFormRef = ref(null);
const emailForm = ref({
  email: '',
  code: ''
});
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度应为6位', trigger: 'blur' }
  ]
};
const emailCodeButtonDisabled = ref(false);
const emailCountdown = ref(0);
const emailCodeButtonText = computed(() => {
  return emailCountdown.value > 0 ? `重新获取(${emailCountdown.value}s)` : '获取验证码';
});

// 生命周期钩子
onMounted(() => {
  loadUserInfo();
  loadAddresses();
  loadRecentOrders();
});

// 方法

// 加载用户信息
const loadUserInfo = () => {
  // 模拟API调用
  console.log('加载用户信息');
  // 实际应用中这里会是一个API调用
};

// 加载收货地址
const loadAddresses = () => {
  // 模拟API调用
  console.log('加载收货地址');
  // 实际应用中这里会是一个API调用
};

// 加载最近订单
const loadRecentOrders = () => {
  // 模拟API调用
  console.log('加载最近订单');
  // 实际应用中这里会是一个API调用
};

// 格式化性别
const formatGender = (gender) => {
  const genderMap = {
    0: '保密',
    1: '男',
    2: '女'
  };
  return genderMap[gender] || '保密';
};

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return date.split(' ')[0];
};

// 格式化完整地址
const formatFullAddress = (address) => {
  if (!address) return '';
  return `${address.province} ${address.city} ${address.district} ${address.detail}`;
};

// 获取用户等级名称
const getUserLevel = (level) => {
  const levelMap = {
    0: '普通会员',
    1: '铜牌会员',
    2: '银牌会员',
    3: '金牌会员',
    4: '钻石会员'
  };
  return levelMap[level] || '普通会员';
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
    3: '已完成',
    4: '已取消'
  };
  return statusMap[status] || '未知状态';
};

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  };
  return typeMap[status] || 'info';
};

// 开始编辑用户信息
const startEdit = () => {
  editForm.value = {
    nickname: userInfo.value.nickname,
    gender: userInfo.value.gender,
    birthday: userInfo.value.birthday,
    bio: userInfo.value.bio
  };
  isEditing.value = true;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};

// 保存用户信息
const saveUserInfo = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 模拟API调用
    console.log('保存用户信息', editForm.value);
    
    // 更新本地状态
    Object.assign(userInfo.value, editForm.value);
    isEditing.value = false;
    
    ElMessage({
      type: 'success',
      message: '个人资料更新成功'
    });
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 处理头像上传
const handleAvatarUpload = async (options) => {
  const file = options.file;
  
  // 模拟上传过程
  console.log('上传头像', file);
  
  try {
    // 实际应用中这里会调用上传API
    // 模拟上传成功
    const avatarUrl = URL.createObjectURL(file);
    userInfo.value.avatar = avatarUrl;
    
    ElMessage({
      type: 'success',
      message: '头像更新成功'
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '头像上传失败'
    });
  }
};

// 处理封面上传
const handleCoverUpload = async (options) => {
  const file = options.file;
  
  // 模拟上传过程
  console.log('上传封面', file);
  
  try {
    // 实际应用中这里会调用上传API
    ElMessage({
      type: 'success',
      message: '封面更新成功'
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '封面上传失败'
    });
  }
};

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return;
  
  try {
    await passwordFormRef.value.validate();
    
    // 模拟API调用
    console.log('修改密码', passwordForm.value);
    
    ElMessage({
      type: 'success',
      message: '密码修改成功'
    });
    
    showPasswordDialog.value = false;
    // 重置表单
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 发送手机验证码
const sendVerificationCode = () => {
  if (!phoneForm.value.phone) {
    ElMessage({
      type: 'warning',
      message: '请先输入手机号码'
    });
    return;
  }
  
  // 模拟发送验证码
  codeButtonDisabled.value = true;
  countdown.value = 60;
  
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      codeButtonDisabled.value = false;
    }
  }, 1000);
  
  ElMessage({
    type: 'success',
    message: `验证码已发送至 ${phoneForm.value.phone}`
  });
};

// 绑定手机号
const bindPhone = async () => {
  if (!phoneFormRef.value) return;
  
  try {
    await phoneFormRef.value.validate();
    
    // 模拟API调用
    console.log('绑定手机号', phoneForm.value);
    
    // 更新本地状态
    userInfo.value.phone = phoneForm.value.phone;
    
    ElMessage({
      type: 'success',
      message: '手机号绑定成功'
    });
    
    showPhoneDialog.value = false;
    // 重置表单
    phoneForm.value = {
      phone: '',
      code: ''
    };
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 发送邮箱验证码
const sendEmailVerificationCode = () => {
  if (!emailForm.value.email) {
    ElMessage({
      type: 'warning',
      message: '请先输入邮箱地址'
    });
    return;
  }
  
  // 模拟发送验证码
  emailCodeButtonDisabled.value = true;
  emailCountdown.value = 60;
  
  const timer = setInterval(() => {
    emailCountdown.value--;
    if (emailCountdown.value <= 0) {
      clearInterval(timer);
      emailCodeButtonDisabled.value = false;
    }
  }, 1000);
  
  ElMessage({
    type: 'success',
    message: `验证码已发送至 ${emailForm.value.email}`
  });
};

// 绑定邮箱
const bindEmail = async () => {
  if (!emailFormRef.value) return;
  
  try {
    await emailFormRef.value.validate();
    
    // 模拟API调用
    console.log('绑定邮箱', emailForm.value);
    
    // 更新本地状态
    userInfo.value.email = emailForm.value.email;
    
    ElMessage({
      type: 'success',
      message: '邮箱绑定成功'
    });
    
    showEmailDialog.value = false;
    // 重置表单
    emailForm.value = {
      email: '',
      code: ''
    };
  } catch (error) {
    console.error('表单验证失败', error);
  }
};

// 限制日期选择（不能选择未来日期）
const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

// 跳转到地址管理页面
const goToAddressManager = () => {
  router.push('/address');
};

// 编辑地址
const editAddress = (address) => {
  console.log('编辑地址', address);
  // 实际应用中可能会跳转到编辑页面或打开编辑对话框
};

// 删除地址
const deleteAddress = (address) => {
  console.log('删除地址', address);
  // 实际应用中会调用删除API
};

// 跳转到订单列表
const goToOrderList = () => {
  router.push('/orders');
};
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  
  .profile-header {
    position: relative;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .cover-photo {
      position: relative;
    }
  }
  
  .stat-item {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(255, 133, 162, 0.2);
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0));
      z-index: 1;
    }
    
    .text-2xl {
      position: relative;
      z-index: 2;
    }
    
    .text-sm {
      position: relative;
      z-index: 2;
    }
  }
  
  .profile-tabs {
    .el-tabs__nav-wrap::after {
      height: 1px;
    }
    
    .el-tabs__active-bar {
      height: 3px;
      border-radius: 3px;
      background-color: var(--pink-color);
    }
    
    .el-tabs__item {
      font-size: 16px;
      transition: all 0.3s ease;
      
      &.is-active {
        color: var(--pink-color);
        font-weight: 600;
      }
      
      &:hover {
        color: var(--pink-color);
      }
    }
  }
  
  .info-item {
    padding: 10px;
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: rgba(245, 245, 245, 0.8);
    }
  }
  
  .security-item {
    .icon-wrapper {
      transition: transform 0.3s ease;
    }
    
    &:hover .icon-wrapper {
      transform: scale(1.1);
    }
  }
  
  .address-card {
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--pink-color);
    }
  }
  
  .order-item {
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--pink-color);
    }
  }
  
  .edit-form {
    .el-input, .el-textarea {
      .el-input__inner, .el-textarea__inner {
        border-radius: 8px;
        transition: all 0.3s ease;
        
        &:focus {
          box-shadow: 0 0 0 2px rgba(255, 133, 162, 0.2);
        }
      }
    }
    
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  
  .profile-dialog {
    .el-dialog__header {
      text-align: center;
      margin-bottom: 10px;
    }
    
    .el-dialog__body {
      padding-top: 0;
    }
  }
  
  .avatar-uploader {
    .el-upload {
      cursor: pointer;
    }
  }
}

/* 自定义背景渐变 */
.bg-pink-gradient {
  background: var(--pink-gradient);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-page {
    .profile-header {
      .mt-16 {
        margin-top: 80px;
      }
    }
  }
}
</style>