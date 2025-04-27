import { defineStore } from 'pinia'
import { 
  login, 
  logout, 
  register, 
  getUserInfo, 
  updateUserInfo, 
  updatePassword, 
  uploadAvatar, 
  getUserAddresses, 
  addUserAddress, 
  updateUserAddress, 
  deleteUserAddress,
  setDefaultUserAddress
} from '@/api/user'
import { removeToken, setToken, getToken } from '@/utils/auth'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    token: null,
    username: '',
    nickname: '',
    avatar: '',
    email: '',
    phone: '',
    gender: '',
    birthday: '',
    createTime: '',
    role: '',
    addresses: [],
    loading: false,
    addressLoading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    
    // 获取用户默认地址
    defaultAddress: (state) => {
      return state.addresses.find(address => address.isDefault) || null;
    },
    
    // 获取用户信息是否完整
    isProfileComplete: (state) => {
      return !!(state.nickname && state.phone && state.email);
    }
  },
  
  actions: {
    // 检查用户认证状态
    async checkAuth() {
      // 从localStorage获取token
      const token = getToken();
      
      if (!token) {
        return false;
      }
      
      // 设置token到state
      this.token = token;
      
      // 尝试获取用户信息
      return await this.fetchUserInfo();
    },
    
    // 用户登录
    async userLogin(loginForm) {
      const { username, password } = loginForm;
      
      if (!username || !password) {
        ElMessage.error('用户名和密码不能为空');
        return false;
      }
      
      this.loading = true;
      
      try {
        console.log('登录请求参数:', username, password);
        const res = await login(username, password);
        console.log('登录响应结果:', res);
        
        if (res.code === 200 && res.data && res.data.token && res.data.userInfo) {
          const { token, userInfo } = res.data;
          
          console.log('获取到的Token:', token);
          console.log('获取到的用户信息:', userInfo);
          
          // 保存token (setToken会自动添加Bearer前缀)
          setToken(token);
          
          // 更新状态
          this.token = token; // 存储原始token，getter会处理是否已登录
          this.id = userInfo.userId; // 注意User DTO中的字段名可能是userId
          this.username = userInfo.username;
          this.nickname = userInfo.nickname;
          this.avatar = userInfo.avatar;
          this.email = userInfo.email;
          this.phone = userInfo.phone;
          this.gender = userInfo.gender;
          this.birthday = userInfo.birthday;
          this.createTime = userInfo.createTime;
          this.role = userInfo.role;
          
          ElMessage.success('登录成功');
          return true;
        } else {
          // 处理登录失败或响应格式不正确的情况
          ElMessage.error(res.message || '登录失败或响应数据无效');
          if (!(res.data && res.data.token)) {
            console.error('响应中未找到有效的token', res.data);
          }
          if (!(res.data && res.data.userInfo)) {
            console.error('响应中未找到有效的用户信息', res.data);
          }
          return false;
        }
      } catch (error) {
        console.error('登录失败:', error);
        // request.js中已经处理了错误提示，这里可以只记录日志
        // ElMessage.error('登录失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 用户注册
    async userRegister(registerForm) {
      const { username, password, email, captcha } = registerForm;
      
      if (!username || !password || !email) {
        ElMessage.error('请填写完整的注册信息');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await register(registerForm);
        
        if (res.code === 200) {
          ElMessage.success('注册成功，请登录');
          return true;
        } else {
          ElMessage.error(res.message || '注册失败');
          return false;
        }
      } catch (error) {
        console.error('注册失败:', error);
        ElMessage.error('注册失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) {
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await getUserInfo();
        
        if (res.code === 200 && res.data) {
          const userInfo = res.data;
          
          // 更新状态
          this.id = userInfo.id;
          this.username = userInfo.username;
          this.nickname = userInfo.nickname;
          this.avatar = userInfo.avatar;
          this.email = userInfo.email;
          this.phone = userInfo.phone;
          this.gender = userInfo.gender;
          this.birthday = userInfo.birthday;
          this.createTime = userInfo.createTime;
          this.role = userInfo.role;
          
          // 加载用户地址
          this.fetchUserAddresses();
          
          return true;
        } else {
          this.resetUserInfo();
          ElMessage.error(res.message || '获取用户信息失败');
          return false;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        ElMessage.error('获取用户信息失败，请重新登录');
        this.resetUserInfo();
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新用户信息
    async updateProfile(userInfo) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.loading = true;
      
      try {
        // 处理生日日期格式，确保包含时间部分
        const updateData = { ...userInfo };
        if (updateData.birthday && !updateData.birthday.includes('T')) {
          // 如果只有日期部分，添加时间部分 (00:00:00)
          updateData.birthday = `${updateData.birthday}T00:00:00`;
        }
        
        console.log('发送到API的用户数据:', updateData);
        const res = await updateUserInfo(updateData);
        console.log('API更新用户信息响应:', res);
        
        if (res.code === 200) {
          // 更新本地状态
          if (updateData.nickname) this.nickname = updateData.nickname;
          if (updateData.gender) this.gender = updateData.gender;
          if (updateData.birthday) this.birthday = updateData.birthday;
          if (updateData.email) this.email = updateData.email;
          if (updateData.phone) this.phone = updateData.phone;
          
          console.log('更新后的用户状态:', {
            nickname: this.nickname,
            gender: this.gender,
            birthday: this.birthday,
            email: this.email,
            phone: this.phone
          });
          
          ElMessage.success('个人信息更新成功');
          return true;
        } else {
          ElMessage.error(res.message || '更新个人信息失败');
          return false;
        }
      } catch (error) {
        console.error('更新个人信息失败:', error);
        ElMessage.error('更新个人信息失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 修改密码
    async changePassword(passwordData) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.loading = true;
      
      try {
        const res = await updatePassword(passwordData);
        
        if (res.code === 200) {
          ElMessage.success('密码修改成功，请重新登录');
          // 修改密码后需要重新登录
          this.userLogout();
          return true;
        } else {
          ElMessage.error(res.message || '密码修改失败');
          return false;
        }
      } catch (error) {
        console.error('密码修改失败:', error);
        ElMessage.error('密码修改失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 上传头像
    async uploadUserAvatar(file) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.loading = true;
      
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        const res = await uploadAvatar(formData);
        
        if (res.code === 200 && res.data) {
          this.avatar = res.data.avatarUrl;
          ElMessage.success('头像上传成功');
          return true;
        } else {
          ElMessage.error(res.message || '头像上传失败');
          return false;
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        ElMessage.error('头像上传失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 获取用户地址列表
    async fetchUserAddresses() {
      if (!this.token) {
        return false;
      }
      
      this.addressLoading = true;
      
      try {
        const res = await getUserAddresses();
        
        if (res.code === 200 && res.data) {
          this.addresses = res.data;
          return true;
        } else {
          ElMessage.error(res.message || '获取地址列表失败');
          return false;
        }
      } catch (error) {
        console.error('获取地址列表失败:', error);
        ElMessage.error('获取地址列表失败，请稍后重试');
        return false;
      } finally {
        this.addressLoading = false;
      }
    },
    
    // 添加用户地址
    async addAddress(addressData) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.addressLoading = true;
      
      try {
        const res = await addUserAddress(addressData);
        
        if (res.code === 200 && res.data) {
          // 如果是默认地址，更新其他地址为非默认
          if (addressData.isDefault) {
            this.addresses.forEach(addr => {
              addr.isDefault = false;
            });
          }
          
          // 添加新地址到列表
          this.addresses.push(res.data);
          ElMessage.success('添加地址成功');
          return true;
        } else {
          ElMessage.error(res.message || '添加地址失败');
          return false;
        }
      } catch (error) {
        console.error('添加地址失败:', error);
        ElMessage.error('添加地址失败，请稍后重试');
        return false;
      } finally {
        this.addressLoading = false;
      }
    },
    
    // 更新用户地址
    async updateAddress(addressId, addressData) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.addressLoading = true;
      
      try {
        const res = await updateUserAddress(addressId, addressData);
        
        if (res.code === 200) {
          // 如果是默认地址，更新其他地址为非默认
          if (addressData.isDefault) {
            this.addresses.forEach(addr => {
              if (addr.id !== addressId) {
                addr.isDefault = false;
              }
            });
          }
          
          // 更新地址信息
          const index = this.addresses.findIndex(addr => addr.id === addressId);
          if (index !== -1) {
            this.addresses[index] = { ...this.addresses[index], ...addressData };
          }
          
          ElMessage.success('更新地址成功');
          return true;
        } else {
          ElMessage.error(res.message || '更新地址失败');
          return false;
        }
      } catch (error) {
        console.error('更新地址失败:', error);
        ElMessage.error('更新地址失败，请稍后重试');
        return false;
      } finally {
        this.addressLoading = false;
      }
    },
    
    // 删除用户地址
    async deleteAddress(addressId) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.addressLoading = true;
      
      try {
        const res = await deleteUserAddress(addressId);
        
        if (res.code === 200) {
          // 从列表中移除该地址
          this.addresses = this.addresses.filter(addr => addr.id !== addressId);
          ElMessage.success('删除地址成功');
          return true;
        } else {
          ElMessage.error(res.message || '删除地址失败');
          return false;
        }
      } catch (error) {
        console.error('删除地址失败:', error);
        ElMessage.error('删除地址失败，请稍后重试');
        return false;
      } finally {
        this.addressLoading = false;
      }
    },
    
    // 设置默认地址
    async setDefaultUserAddress(addressId) {
      if (!this.token) {
        ElMessage.error('请先登录');
        return false;
      }
      
      this.addressLoading = true;
      
      try {
        const res = await setDefaultUserAddress(addressId);
        
        if (res.code === 200) {
          // 更新地址列表中的默认状态
          this.addresses.forEach(addr => {
            addr.isDefault = addr.id === addressId;
          });
          
          ElMessage.success('设置默认地址成功');
          return true;
        } else {
          ElMessage.error(res.message || '设置默认地址失败');
          return false;
        }
      } catch (error) {
        console.error('设置默认地址失败:', error);
        ElMessage.error('设置默认地址失败，请稍后重试');
        return false;
      } finally {
        this.addressLoading = false;
      }
    },
    
    // 用户登出
    async userLogout() {
      if (!this.token) {
        return false;
      }
      
      try {
        await logout();
      } catch (error) {
        console.error('登出请求失败:', error);
      } finally {
        // 无论登出请求是否成功，都清除本地状态
        this.resetUserInfo();
        ElMessage.success('已安全退出登录');
      }
      
      return true;
    },
    
    // 重置用户信息
    resetUserInfo() {
      removeToken();
      this.id = null;
      this.token = null;
      this.username = '';
      this.nickname = '';
      this.avatar = '';
      this.email = '';
      this.phone = '';
      this.gender = '';
      this.birthday = '';
      this.createTime = '';
      this.role = '';
      this.addresses = [];
    }
  }
}) 