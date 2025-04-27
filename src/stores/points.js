import { defineStore } from 'pinia';
import { getUserPoints, signIn, checkSignIn } from '@/api/points';

export const usePointsStore = defineStore('points', {
  state: () => ({
    userPoints: 0,
    userLevel: '',
    hasSignedToday: false,
    pointsLoading: false,
    signInLoading: false,
    checkSignInLoading: false
  }),
  
  getters: {
    // 获取当前积分
    getCurrentPoints: (state) => state.userPoints,
    
    // 获取当前会员等级
    getCurrentLevel: (state) => state.userLevel,
    
    // 检查是否已签到
    getSignInStatus: (state) => state.hasSignedToday
  },
  
  actions: {
    // 设置用户积分
    SET_USER_POINTS(points) {
      this.userPoints = points;
    },
    
    // 设置用户等级
    SET_USER_LEVEL(level) {
      this.userLevel = level;
    },
    
    // 设置签到状态
    SET_SIGN_IN_STATUS(status) {
      this.hasSignedToday = status;
    },
    
    // 获取用户积分信息
    async getUserPoints() {
      this.pointsLoading = true;
      try {
        const res = await getUserPoints();
        if (res.code === 200 && res.data) {
          this.SET_USER_POINTS(res.data.points || 0);
          this.SET_USER_LEVEL(res.data.userLevel || '普通会员');
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('获取用户积分信息失败:', error);
        return null;
      } finally {
        this.pointsLoading = false;
      }
    },
    
    // 每日签到
    async signIn() {
      this.signInLoading = true;
      try {
        const res = await signIn();
        if (res.code === 200) {
          this.SET_SIGN_IN_STATUS(true);
          
          // 更新积分
          if (res.data && res.data.points) {
            // 更新当前积分（加上新获得的积分）
            this.SET_USER_POINTS(this.userPoints + (res.data.points || 0));
          } else {
            // 如果没有返回新的积分，则重新获取用户积分信息
            await this.getUserPoints();
          }
          
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('签到失败:', error);
        return null;
      } finally {
        this.signInLoading = false;
      }
    },
    
    // 检查签到状态
    async checkSignIn() {
      this.checkSignInLoading = true;
      try {
        const res = await checkSignIn();
        if (res.code === 200) {
          this.SET_SIGN_IN_STATUS(res.data.hasSignedToday || false);
          return res.data;
        }
        return null;
      } catch (error) {
        console.error('检查签到状态失败:', error);
        return null;
      } finally {
        this.checkSignInLoading = false;
      }
    }
  }
}); 