import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getCartList, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart,
  getCartTotal,
  batchRemoveCartItems
} from '@/api/cart'

export const useCartStore = defineStore('cart', {
  state: () => ({
    // 购物车商品列表
    cartItems: [],
    // 购物车统计
    cartTotal: {
      totalCount: 0,
      totalPrice: 0
    },
    // 加载状态
    loading: false,
    addLoading: false,
    removeLoading: false,
    updateLoading: false,
    // 被选中的商品ID数组
    selectedItems: [],
    // 是否全选
    selectAll: false
  }),
  
  getters: {
    // 获取购物车商品数量
    cartItemCount: (state) => {
      console.log('cartItemCount getter被调用，当前值:', state.cartTotal.totalCount);
      return state.cartTotal.totalCount;
    },
    
    // 获取购物车商品总价
    cartTotalPrice: (state) => state.cartTotal.totalPrice,
    
    // 获取已选择的商品列表
    selectedCartItems: (state) => {
      console.log('[CartStore Debug] 计算selectedCartItems');
      console.log('[CartStore Debug] 当前cartItems:', state.cartItems);
      console.log('[CartStore Debug] 当前selectedItems:', state.selectedItems);
      
      // 如果cartItems为空但存在选中项，尝试从localStorage获取商品详情
      if (state.cartItems.length === 0 && state.selectedItems.length > 0) {
        try {
          console.log('[CartStore Debug] cartItems为空但有选中项，尝试从localStorage获取');
          const storedItems = localStorage.getItem('checkoutItems');
          if (storedItems) {
            return JSON.parse(storedItems);
          }
        } catch (e) {
          console.error('[CartStore Debug] 从localStorage获取商品详情失败:', e);
        }
      }
      
      // 否则使用常规方式过滤购物车项
      const items = state.cartItems.filter(item => state.selectedItems.includes(item.id));
      console.log('[CartStore Debug] 过滤后的结果:', items);
      return items;
    },
    
    // 获取已选择的商品总数
    selectedItemCount: (state) => state.selectedItems.length,
    
    // 获取已选择的商品总价
    selectedTotalPrice: (state) => {
      return state.cartItems
        .filter(item => state.selectedItems.includes(item.id))
        .reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    
    // 购物车是否为空
    isCartEmpty: (state) => state.cartItems.length === 0,
    
    // 是否有选中的商品
    hasSelectedItems: (state) => state.selectedItems.length > 0
  },
  
  actions: {
    // 获取购物车列表
    async fetchCartItems() {
      this.loading = true;
      console.log('开始获取购物车列表');
      
      try {
        const res = await getCartList();
        console.log('购物车列表API响应:', res);
        
        if (res.code === 200) {
          this.cartItems = res.data || [];
          console.log('购物车列表更新成功，总数:', this.cartItems.length);
          
          // 总是调用updateCartTotal来获取最新数量
          await this.updateCartTotal();
          
          // 默认全选
          this.selectedItems = this.cartItems.map(item => item.id);
          this.selectAll = this.cartItems.length > 0;
          
          return this.cartItems;
        } else {
          ElMessage.error(res.message || '获取购物车失败');
          return [];
        }
      } catch (error) {
        console.error('获取购物车失败:', error);
        ElMessage.error('获取购物车失败，请稍后重试');
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    // 从localStorage加载选中的商品
    loadSelectedItemsFromLocalStorage() {
      try {
        const storedItems = localStorage.getItem('checkoutItems');
        if (storedItems) {
          const items = JSON.parse(storedItems);
          if (items && items.length > 0) {
            this.selectedItems = items.map(item => item.id || item.cartId);
            console.log('[CartStore] 从localStorage加载选中商品:', this.selectedItems);
            return true;
          }
        }
      } catch (e) {
        console.error('[CartStore] 从localStorage加载选中商品失败:', e);
      }
      return false;
    },
    
    // 添加商品到购物车
    async addProductToCart(product, quantity = 1) {
      if (!product || !product.id) {
        ElMessage.error('商品信息不完整');
        return false;
      }
      
      this.addLoading = true;
      console.log('开始添加商品到购物车:', product.id, '数量:', quantity);
      
      try {
        const cartItem = {
          productId: product.id,
          quantity: quantity
        };
        
        const res = await addToCart(cartItem);
        console.log('添加购物车API响应:', res);
        
        if (res.code === 200) {
          // 更新购物车数据
          await this.fetchCartItems();
          
          // 确保更新购物车总数
          await this.updateCartTotal();
          
          // 如果后端返回了更新后的购物车数量，直接更新状态
          if (res.data && res.data.totalCount !== undefined) {
            this.cartTotal.totalCount = res.data.totalCount;
            console.log('使用API返回的购物车数量更新:', this.cartTotal.totalCount);
          }
          
          console.log('添加商品后，当前购物车总数:', this.cartTotal.totalCount);
          ElMessage.success('商品已添加到购物车');
          return true;
        } else {
          ElMessage.error(res.message || '添加到购物车失败');
          return false;
        }
      } catch (error) {
        console.error('添加到购物车失败:', error);
        ElMessage.error('添加到购物车失败，请稍后重试');
        return false;
      } finally {
        this.addLoading = false;
      }
    },
    
    // 更新购物车商品数量
    async updateItemQuantity(itemId, quantity) {
      if (!itemId) {
        ElMessage.error('购物车项ID不能为空');
        return false;
      }
      
      if (quantity <= 0) {
        ElMessage.warning('商品数量必须大于0');
        return false;
      }
      
      this.updateLoading = true;
      
      try {
        const res = await updateCartItem(itemId, { quantity });
        
        if (res.code === 200) {
          // 更新本地购物车数据
          const itemIndex = this.cartItems.findIndex(item => item.id === itemId);
          
          if (itemIndex !== -1) {
            this.cartItems[itemIndex].quantity = quantity;
            
            // 更新购物车总计
            await this.updateCartTotal();
          }
          
          return true;
        } else {
          ElMessage.error(res.message || '更新购物车失败');
          return false;
        }
      } catch (error) {
        console.error('更新购物车失败:', error);
        ElMessage.error('更新购物车失败，请稍后重试');
        return false;
      } finally {
        this.updateLoading = false;
      }
    },
    
    // 从购物车中移除商品
    async removeCartItem(itemId) {
      if (!itemId) {
        ElMessage.error('购物车项ID不能为空');
        return false;
      }
      
      this.removeLoading = true;
      
      try {
        const res = await removeFromCart(itemId);
        
        if (res.code === 200) {
          // 更新本地购物车数据
          this.cartItems = this.cartItems.filter(item => item.id !== itemId);
          
          // 从选中列表中移除
          this.selectedItems = this.selectedItems.filter(id => id !== itemId);
          
          // 更新全选状态
          if (this.cartItems.length > 0) {
            this.selectAll = this.selectedItems.length === this.cartItems.length;
          } else {
            this.selectAll = false;
          }
          
          // 更新购物车总计
          await this.updateCartTotal();
          
          ElMessage.success('商品已从购物车移除');
          return true;
        } else {
          ElMessage.error(res.message || '从购物车移除失败');
          return false;
        }
      } catch (error) {
        console.error('从购物车移除失败:', error);
        ElMessage.error('从购物车移除失败，请稍后重试');
        return false;
      } finally {
        this.removeLoading = false;
      }
    },
    
    // 清空购物车
    async clearAllItems() {
      this.loading = true;
      
      try {
        const res = await clearCart();
        
        if (res.code === 200) {
          this.cartItems = [];
          this.selectedItems = [];
          this.selectAll = false;
          this.cartTotal = {
            totalCount: 0,
            totalPrice: 0
          };
          
          ElMessage.success('购物车已清空');
          return true;
        } else {
          ElMessage.error(res.message || '清空购物车失败');
          return false;
        }
      } catch (error) {
        console.error('清空购物车失败:', error);
        ElMessage.error('清空购物车失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 更新购物车总计
    async updateCartTotal() {
      try {
        const res = await getCartTotal();
        
        if (res.code === 200) {
          // 处理后端返回值可能为整数的情况
          if (typeof res.data === 'number') {
            // 如果返回值是整数，说明是购物车总数量
            console.log('后端返回的购物车数量:', res.data);
            this.cartTotal = {
              totalCount: res.data || 0,
              totalPrice: this.cartTotal.totalPrice || 0
            };
          } else if (res.data && typeof res.data === 'object') {
            // 如果返回的是对象，包含totalCount和totalPrice
            this.cartTotal = {
              totalCount: res.data.totalCount || 0,
              totalPrice: res.data.totalPrice || 0
            };
          } else {
            // 返回格式不符合预期，使用默认值
            console.warn('购物车总计返回格式异常:', res.data);
            this.calculateCartTotalFromItems();
          }
          console.log('更新后的购物车数量:', this.cartTotal.totalCount);
          return this.cartTotal;
        } else {
          console.error('获取购物车总计失败:', res.message);
          // 如果API调用失败，尝试从本地购物车项计算总数
          this.calculateCartTotalFromItems();
          return this.cartTotal;
        }
      } catch (error) {
        console.error('获取购物车总计失败:', error);
        // 出错时从本地购物车项计算总数
        this.calculateCartTotalFromItems();
        return this.cartTotal;
      }
    },
    
    // 从本地购物车项计算总数
    calculateCartTotalFromItems() {
      let totalCount = 0;
      let totalPrice = 0;
      
      this.cartItems.forEach(item => {
        totalCount += item.quantity || 0;
        totalPrice += (item.price * item.quantity) || 0;
      });
      
      this.cartTotal = {
        totalCount,
        totalPrice
      };
    },
    
    // 选择/取消选择单个商品
    toggleSelectItem(itemId) {
      const index = this.selectedItems.indexOf(itemId);
      
      if (index === -1) {
        // 添加到选中列表
        this.selectedItems.push(itemId);
      } else {
        // 从选中列表中移除
        this.selectedItems.splice(index, 1);
      }
      
      // 更新全选状态
      this.selectAll = this.selectedItems.length === this.cartItems.length && this.cartItems.length > 0;
    },
    
    // 全选/取消全选
    toggleSelectAll() {
      this.selectAll = !this.selectAll;
      
      if (this.selectAll) {
        // 全选
        this.selectedItems = this.cartItems.map(item => item.id);
      } else {
        // 取消全选
        this.selectedItems = [];
      }
    },
    
    // 批量删除所选商品
    async removeSelectedItems() {
      if (this.selectedItems.length === 0) {
        ElMessage.warning('请先选择要删除的商品');
        return false;
      }

      this.loading = true;

      try {
        const res = await batchRemoveCartItems(this.selectedItems);

        if (res.code === 200) {
          // 从购物车中移除所选商品
          this.cartItems = this.cartItems.filter(item => !this.selectedItems.includes(item.id));
          
          // 清空选中状态
          this.selectedItems = [];
          this.selectAll = false;
          
          // 更新购物车总计
          await this.updateCartTotal();
          
          ElMessage.success('已成功删除所选商品');
          return true;
        } else {
          ElMessage.error(res.message || '删除失败');
          return false;
        }
      } catch (error) {
        console.error('批量删除购物车商品失败:', error);
        ElMessage.error('删除失败，请稍后重试');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    // 添加刷新购物车数量的独立方法
    async refreshCartCount() {
      console.log('手动刷新购物车数量');
      // 只刷新购物车数量，不获取完整列表
      try {
        await this.updateCartTotal();
        console.log('购物车数量刷新完成:', this.cartTotal.totalCount);
        return this.cartTotal.totalCount;
      } catch (error) {
        console.error('刷新购物车数量失败:', error);
        return this.cartTotal.totalCount;
      }
    },
    
    // 兼容方法：通过fetchCartItems获取购物车内容
    // 确保与ProductDetail.vue中的调用保持兼容性
    async getCartItems() {
      console.log('调用getCartItems兼容方法');
      // 直接调用fetchCartItems方法以保持行为一致性
      return await this.fetchCartItems();
    },
    
    // 初始化购物车
    async initCart() {
      console.log('初始化购物车');
      if (this.cartTotal.totalCount === 0) {
        // 只获取购物车总数，减少不必要的数据加载
        await this.refreshCartCount();
      }
    }
  }
}) 