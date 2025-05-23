import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { isAuthenticated } from '@/utils/auth'

// 导入API函数
let userApi = null

// 动态导入API以避免循环依赖
const importApi = async () => {
  if (!userApi) {
    userApi = await import('@/api/user')
  }
  return userApi
}

export const useFavoriteStore = defineStore('favorite', () => {
  // 收藏商品ID列表
  const favoriteIds = ref([])
  // 收藏状态加载中
  const loading = ref(false)
  // 是否已初始化
  const initialized = ref(false)

  // 初始化收藏列表
  const initFavorites = async () => {
    // 如果已经初始化并且不是强制刷新，则直接返回
    if (initialized.value && arguments.length < 1) {
      console.log('收藏列表已初始化，无需重复加载')
      return
    }
    
    // 使用auth.js的isAuthenticated函数检查用户登录状态
    if (!isAuthenticated()) {
      console.log('用户未登录，不加载收藏状态')
      // 清空收藏列表，确保未登录状态下没有收藏数据
      favoriteIds.value = []
      initialized.value = true
      return
    }
    
    try {
      console.log('开始初始化收藏列表')
      loading.value = true
      
      // 先加载本地存储的收藏状态作为快速显示
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      // 如果本地有缓存，先使用本地缓存
      if (localFavorites.length > 0) {
        favoriteIds.value = localFavorites.map(id => String(id))
        console.log('从本地存储加载收藏列表:', favoriteIds.value)
      }
      
      const api = await importApi()
      const response = await api.getFavorites()
      
      if (response && response.code === 200 && Array.isArray(response.data)) {
        // 从服务器响应中获取收藏IDs
        const serverFavoriteIds = response.data.map(item => {
          // 确保转换为字符串进行比较
          return String(item.productId || item.goodsId || item.id)
        })
        
        console.log('服务器返回的收藏列表:', serverFavoriteIds)
        
        // 更新本地收藏状态
        favoriteIds.value = serverFavoriteIds
        
        // 同步更新本地存储
        localStorage.setItem('favorites', JSON.stringify(favoriteIds.value))
        
        console.log('初始化收藏列表成功，更新为:', favoriteIds.value)
      } else {
        console.warn('获取收藏列表失败或返回格式异常:', response)
        // 如果没有本地存储，则设置为空数组
        if (favoriteIds.value.length === 0) {
          favoriteIds.value = []
        }
        // 保持使用本地缓存数据
      }
      initialized.value = true
    } catch (error) {
      console.error('初始化收藏列表失败:', error)
      // 如果没有本地存储，则设置为空数组
      if (favoriteIds.value.length === 0) {
        favoriteIds.value = []
      }
      // 使用本地缓存
      initialized.value = true // 即使失败也标记为已初始化，避免重复尝试
    } finally {
      loading.value = false
    }
  }

  // 检查商品是否已收藏
  const isFavorite = (productId) => {
    if (!productId) return false
    
    // 确保ID为字符串用于比较
    const idStr = String(productId)
    return favoriteIds.value.includes(idStr)
  }

  // 添加收藏
  const addFavorite = async (productId) => {
    if (!productId) return false
    
    // 使用auth.js的isAuthenticated函数检查用户登录状态
    if (!isAuthenticated()) {
      console.log('addFavorite: 用户未登录，无法添加收藏')
      ElMessage.warning('请先登录后再收藏商品')
      return false
    }
    
    try {
      const idStr = String(productId)
      
      // 如果已经收藏，不重复操作
      if (favoriteIds.value.includes(idStr)) {
        console.log('商品已经收藏过，无需重复操作:', productId)
        return true
      }
      
      loading.value = true
      console.log('添加收藏，商品ID:', productId)
      
      // 先本地更新状态，提供更好的用户体验
      // 添加到收藏列表
      favoriteIds.value.push(idStr)
      
      // 同步更新本地存储
      localStorage.setItem('favorites', JSON.stringify(favoriteIds.value))
      
      // 添加详细日志
      console.log(`尝试添加收藏商品 ID: ${productId}, 当前收藏列表:`, favoriteIds.value)
      
      try {
        const api = await importApi()
        console.log('调用API添加收藏，商品ID:', productId)
        const response = await api.addFavorite(productId)
        console.log('添加收藏响应:', response)
        
        if (response && response.code === 200) {
          console.log('添加收藏成功，触发全局事件通知')
          // 触发全局事件通知
          window.dispatchEvent(new CustomEvent('favorite:updated', {
            detail: { action: 'add', productId }
          }))
          
          return true
        } else {
          throw new Error(response?.message || '服务器返回错误')
        }
      } catch (apiError) {
        console.error('API调用失败:', apiError)
        
        // API调用失败但已经本地更新了状态，可以返回部分成功
        ElMessage({
          message: '收藏状态已本地更新，但同步到服务器失败',
          type: 'warning',
          duration: 3000
        })
        
        return true // 返回成功，因为本地状态已更新
      }
    } catch (error) {
      console.error('添加收藏失败:', error)
      ElMessage.error('收藏失败，请稍后再试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 取消收藏
  const removeFavorite = async (productId) => {
    if (!productId) return false
    
    // 使用auth.js的isAuthenticated函数检查用户登录状态
    if (!isAuthenticated()) {
      console.log('removeFavorite: 用户未登录，无法取消收藏')
      ElMessage.warning('请先登录后再操作收藏')
      return false
    }
    
    try {
      const idStr = String(productId)
      
      // 如果不在收藏列表中，不需要操作
      if (!favoriteIds.value.includes(idStr)) {
        return true
      }
      
      loading.value = true
      console.log('取消收藏，商品ID:', productId)
      const api = await importApi()
      
      // 在API调用前先本地更新状态，提供更好的用户体验
      // 从收藏列表中移除
      const originalFavoriteIds = [...favoriteIds.value]
      favoriteIds.value = favoriteIds.value.filter(id => id !== idStr)
      
      // 同步更新本地存储
      localStorage.setItem('favorites', JSON.stringify(favoriteIds.value))
      
      // 添加详细日志
      console.log(`尝试取消收藏商品 ID: ${productId}, 当前收藏列表:`, favoriteIds.value)
      
      try {
        // 注意：API可能使用productId作为路径参数，而不是作为query参数
        // 尝试两种不同的API调用方式
        let response
        
        try {
          // 方式1: 使用productId作为路径参数
          console.log('尝试方式1取消收藏，商品ID:', productId)
          response = await api.removeFavorite(productId)
          console.log('取消收藏响应 (方式1):', response)
        } catch (err) {
          console.warn('使用方式1取消收藏失败，尝试方式2:', err)
          
          // 方式2: 尝试直接使用/user/favorites接口并传递productId作为参数
          console.log('尝试方式2取消收藏，商品ID:', productId)
          response = await request({
            url: '/user/favorites',
            method: 'delete',
            params: { productId }
          })
          console.log('取消收藏响应 (方式2):', response)
        }
        
        if (response && response.code === 200) {
          console.log('取消收藏成功，触发全局事件通知')
          // 触发全局事件通知
          window.dispatchEvent(new CustomEvent('favorite:updated', {
            detail: { action: 'remove', productId }
          }))
          
          return true
        } else {
          throw new Error(response?.message || '服务器返回错误')
        }
      } catch (apiError) {
        console.error('API调用失败:', apiError)
        
        // API调用失败但已经本地更新了状态，可以返回部分成功
        // 关键点：不回滚本地状态，因为用户已经看到了取消收藏的结果
        // 可以通过下次initFavorites时从服务器同步来修复可能的不一致
        ElMessage({
          message: '收藏状态已本地更新，但同步到服务器失败',
          type: 'warning',
          duration: 3000
        })
        
        return true // 返回成功，因为本地状态已更新
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败，请稍后再试')
      return false
    } finally {
      loading.value = false
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (productId) => {
    if (!productId) return false
    
    console.log('切换收藏状态，商品ID:', productId)
    
    const idStr = String(productId)
    const isCurrentlyFavorite = favoriteIds.value.includes(idStr)
    console.log('当前收藏状态:', isCurrentlyFavorite ? '已收藏' : '未收藏')
    
    if (isCurrentlyFavorite) {
      return await removeFavorite(productId)
    } else {
      return await addFavorite(productId)
    }
  }

  return {
    favoriteIds,
    loading,
    initialized,
    initFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite
  }
}) 