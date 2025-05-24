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
import { removeToken, setToken, getToken, isAuthenticated } from '@/utils/auth'
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
    
    // 获取用户ID (兼容性getter)
    userId: (state) => state.id,
    
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
      console.log('userStore.checkAuth: 开始检查用户认证状态');
      
      // 从localStorage获取token
      const token = getToken();
      console.log('userStore.checkAuth: 获取到token:', !!token);
      
      if (!token) {
        console.log('userStore.checkAuth: 未找到token，认证失败');
        this.resetUserInfo(); // 确保状态被重置
        return false;
      }
      
      // 检查token是否有效
      try {
        // 使用auth.js中的isAuthenticated函数检查token是否有效
        const isValidToken = isAuthenticated();
        if (!isValidToken) {
          console.warn('userStore.checkAuth: token无效，认证失败');
          this.resetUserInfo();
          return false;
        }
        
        console.log('userStore.checkAuth: token有效');
      } catch (error) {
        console.error('userStore.checkAuth: 验证token时出错:', error);
        this.resetUserInfo();
        return false;
      }
      
      // 设置token到state
      this.token = token;
      console.log('userStore.checkAuth: token已设置到state');
      
      // 从localStorage恢复所有用户信息
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      const storedNickname = localStorage.getItem('nickname');
      const storedEmail = localStorage.getItem('email');
      const storedPhone = localStorage.getItem('phone');
      const storedGender = localStorage.getItem('gender');
      const storedBirthday = localStorage.getItem('birthday');
      const storedCreateTime = localStorage.getItem('createTime');
      const storedRole = localStorage.getItem('role');
      const storedAvatar = localStorage.getItem('userAvatar');
      
      console.log('userStore.checkAuth: 从localStorage获取的完整信息:', {
        storedUserId,
        storedUsername,
        storedNickname,
        storedEmail,
        storedPhone,
        storedGender,
        storedBirthday,
        storedCreateTime,
        storedRole,
        storedAvatar: !!storedAvatar
      });
      
      // 恢复所有用户信息到state
      if (storedUserId) {
        this.id = storedUserId;
        console.log('userStore.checkAuth: 恢复用户ID:', storedUserId);
      }
      
      if (storedUsername) {
        this.username = storedUsername;
        console.log('userStore.checkAuth: 恢复用户名:', storedUsername);
      }
      
      if (storedNickname) {
        this.nickname = storedNickname;
        console.log('userStore.checkAuth: 恢复昵称:', storedNickname);
      }
      
      if (storedEmail) {
        this.email = storedEmail;
        console.log('userStore.checkAuth: 恢复邮箱:', storedEmail);
      }
      
      if (storedPhone) {
        this.phone = storedPhone;
        console.log('userStore.checkAuth: 恢复手机号:', storedPhone);
      }
      
      if (storedGender) {
        this.gender = storedGender;
        console.log('userStore.checkAuth: 恢复性别:', storedGender);
      }
      
      if (storedBirthday) {
        this.birthday = storedBirthday;
        console.log('userStore.checkAuth: 恢复生日:', storedBirthday);
      }
      
      if (storedCreateTime) {
        this.createTime = storedCreateTime;
        console.log('userStore.checkAuth: 恢复注册时间:', storedCreateTime);
      }
      
      if (storedRole) {
        this.role = storedRole;
        console.log('userStore.checkAuth: 恢复角色:', storedRole);
      }
      
      // 处理头像URL
      if (storedAvatar) {
        console.log('userStore.checkAuth: 从localStorage获取头像URL:', storedAvatar);
        
        // 使用智能修复方法处理头像URL
        const fixedAvatar = this.fixAvatarUrl(storedAvatar);
        console.log('userStore.checkAuth: 修复后的头像URL:', fixedAvatar);
        
        this.avatar = fixedAvatar;
        
        // 如果URL被修复了，更新localStorage
        if (fixedAvatar !== storedAvatar) {
          localStorage.setItem('userAvatar', fixedAvatar);
          console.log('userStore.checkAuth: 修复后的头像URL已保存到localStorage');
        }
        
        // 强制刷新当前页面上的所有头像图片，添加时间戳防止缓存
        this.refreshAvatarDisplays();
      } else {
        console.log('userStore.checkAuth: localStorage中没有头像URL');
      }
      
      // 如果基本信息已从localStorage恢复，直接返回成功
      if (storedUserId && storedUsername) {
        console.log('userStore.checkAuth: 用户信息已从localStorage完全恢复');
        return true;
      }
      
      // 如果localStorage中信息不完整，尝试从API获取用户信息
      console.log('userStore.checkAuth: localStorage信息不完整，尝试从API获取用户信息');
      const result = await this.fetchUserInfo();
      console.log('userStore.checkAuth: API获取用户信息结果:', !!result);
      
      return !!result;
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
        //console.log('登录请求参数:', username, password);
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
          
          // 持久化完整用户信息到localStorage
          localStorage.setItem('userId', userInfo.userId || '');
          localStorage.setItem('username', userInfo.username || '');
          localStorage.setItem('nickname', userInfo.nickname || '');
          localStorage.setItem('email', userInfo.email || '');
          localStorage.setItem('phone', userInfo.phone || '');
          localStorage.setItem('gender', userInfo.gender || '');
          localStorage.setItem('birthday', userInfo.birthday || '');
          localStorage.setItem('createTime', userInfo.createTime || '');
          localStorage.setItem('role', userInfo.role || '');
          if (userInfo.avatar) {
            localStorage.setItem('userAvatar', userInfo.avatar);
          }
          console.log('用户完整信息已保存到localStorage');
          
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
      try {
        console.log('userStore.fetchUserInfo: 开始获取用户信息');
        const res = await getUserInfo();
        console.log('userStore.fetchUserInfo: 获取用户信息响应:', res);
        
        if (res.code === 200 && res.data) {
          const userInfo = res.data;
          console.log('userStore.fetchUserInfo: 解析到的用户信息:', userInfo);
          
          // 更新状态
          this.id = userInfo.userId || userInfo.id;
          this.username = userInfo.username;
          this.nickname = userInfo.nickname;
          this.email = userInfo.email;
          this.phone = userInfo.phone;
          this.gender = userInfo.gender;
          this.birthday = userInfo.birthday;
          this.createTime = userInfo.createTime;
          this.role = userInfo.role;
          
          // 处理头像URL并更新
          if (userInfo.avatar) {
            const fixedAvatarUrl = this.fixAvatarUrl(userInfo.avatar);
            this.avatar = fixedAvatarUrl;
            localStorage.setItem('userAvatar', fixedAvatarUrl);
            console.log('userStore.fetchUserInfo: 头像URL已修复并保存:', fixedAvatarUrl);
          }
          
          // 持久化完整用户信息到localStorage
          localStorage.setItem('userId', userInfo.userId || userInfo.id || '');
          localStorage.setItem('username', userInfo.username || '');
          localStorage.setItem('nickname', userInfo.nickname || '');
          localStorage.setItem('email', userInfo.email || '');
          localStorage.setItem('phone', userInfo.phone || '');
          localStorage.setItem('gender', userInfo.gender || '');
          localStorage.setItem('birthday', userInfo.birthday || '');
          localStorage.setItem('createTime', userInfo.createTime || '');
          localStorage.setItem('role', userInfo.role || '');
          
          console.log('userStore.fetchUserInfo: 用户信息获取成功并已持久化');
          return userInfo;
        } else {
          console.error('userStore.fetchUserInfo: 获取用户信息失败', res);
          ElMessage.error('获取用户信息失败');
          return null;
        }
      } catch (error) {
        console.error('userStore.fetchUserInfo: 获取用户信息异常:', error);
        ElMessage.error('获取用户信息异常');
        return null;
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
        formData.append('file', file);
        
        const res = await uploadAvatar(formData);
        console.log('头像上传响应:', res);
        
        if (res.code === 200 && res.data) {
          // 获取返回的头像URL
          let avatarUrl = res.data.avatarUrl || res.data;
          console.log('原始头像URL:', avatarUrl);
          
          // 使用智能修复方法处理头像URL
          avatarUrl = this.fixAvatarUrl(avatarUrl);
          console.log('修复后的头像URL:', avatarUrl);
          
          // 更新状态
          this.avatar = avatarUrl;
          
          // 持久化到localStorage  
          localStorage.setItem('userAvatar', avatarUrl);
          localStorage.setItem('userId', this.id);
          localStorage.setItem('username', this.username);
          console.log('头像URL已保存到localStorage');
          
          ElMessage.success('头像上传成功');
          return {success: true, avatarUrl};
        } else {
          console.error('头像上传响应错误:', res);
          ElMessage.error(res.message || '头像上传失败');
          return {success: false, error: res.message};
        }
      } catch (error) {
        console.error('头像上传失败:', error);
        ElMessage.error('头像上传失败，请稍后重试');
        return {success: false, error: error.message};
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
      console.log('userStore.resetUserInfo: 开始重置用户信息');
      
      // 从本地存储中移除token
      removeToken();
      console.log('userStore.resetUserInfo: 已从本地存储移除token');
      
      // 重置所有用户相关状态
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
      
      console.log('userStore.resetUserInfo: 用户信息已重置');
    },
    
    // 智能修复头像URL
    fixAvatarUrl(url) {
      console.log('userStore.fixAvatarUrl: 开始处理头像URL:', url);
      
      // 如果URL为空或无效，返回空字符串
      if (!url || typeof url !== 'string' || url.trim() === '') {
        console.log('userStore.fixAvatarUrl: URL为空或无效，返回空字符串');
        return '';
      }
      
      const trimmedUrl = url.trim();
      
      // 如果URL已经是正确的前端服务器地址（5173端口），直接返回
      if (trimmedUrl.startsWith('http://localhost:5173')) {
        console.log('userStore.fixAvatarUrl: URL已经指向前端服务器5173端口，保持不变');
        return trimmedUrl;
      }
      
      // 如果URL指向后端服务器地址（8080端口），转换为5173端口
      if (trimmedUrl.startsWith('http://localhost:8080')) {
        const fixedUrl = trimmedUrl.replace('http://localhost:8080', 'http://localhost:5173');
        console.log('userStore.fixAvatarUrl: 将8080端口URL转换为5173端口:', fixedUrl);
        return fixedUrl;
      }
      
      // 如果URL是相对路径且以/avatars开头，添加前端服务器前缀
      if (trimmedUrl.startsWith('/avatars')) {
        const fixedUrl = `http://localhost:5173${trimmedUrl}`;
        console.log('userStore.fixAvatarUrl: 相对路径转换为前端服务器绝对路径:', fixedUrl);
        return fixedUrl;
      }
      
      // 如果URL是相对路径但不以/avatars开头，尝试构建完整路径
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        // 如果不是以/开头，添加/avatars前缀
        const path = trimmedUrl.startsWith('/') ? trimmedUrl : `/avatars/${trimmedUrl}`;
        const fixedUrl = `http://localhost:5173${path}`;
        console.log('userStore.fixAvatarUrl: 构建完整的前端服务器头像URL路径:', fixedUrl);
        return fixedUrl;
      }
      
      // 如果是其他HTTP/HTTPS URL，保持原样
      console.log('userStore.fixAvatarUrl: 其他格式URL，保持原样');
      return trimmedUrl;
    },
    
    // 刷新页面上的所有头像显示
    refreshAvatarDisplays() {
      console.log('userStore.refreshAvatarDisplays: 刷新页面头像显示');
      
      if (!this.avatar) {
        console.log('userStore.refreshAvatarDisplays: 没有头像URL，无法刷新');
        return;
      }
      
      // 添加时间戳以防止浏览器缓存
      const timestampedUrl = this.avatar + (this.avatar.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
      console.log('userStore.refreshAvatarDisplays: 带时间戳的头像URL:', timestampedUrl);
      
      // 刷新所有用户头像元素
      setTimeout(() => {
        // 用户信息页面的头像
        const profileAvatarImages = document.querySelectorAll('.user-avatar');
        if (profileAvatarImages && profileAvatarImages.length > 0) {
          console.log('userStore.refreshAvatarDisplays: 更新用户信息页面头像元素，数量:', profileAvatarImages.length);
          profileAvatarImages.forEach(img => {
            img.src = timestampedUrl;
          });
        } else {
          console.log('userStore.refreshAvatarDisplays: 未找到用户信息页面头像元素');
        }
        
        // 导航栏头像
        const navAvatarImages = document.querySelectorAll('.navbar-avatar img, .header-avatar img');
        if (navAvatarImages && navAvatarImages.length > 0) {
          console.log('userStore.refreshAvatarDisplays: 更新导航栏头像元素，数量:', navAvatarImages.length);
          navAvatarImages.forEach(img => {
            img.src = timestampedUrl;
          });
        } else {
          console.log('userStore.refreshAvatarDisplays: 未找到导航栏头像元素');
        }
      }, 100); // 延迟100ms执行，确保DOM已经更新
    }
  }
}) 