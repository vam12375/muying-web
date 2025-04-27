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
    cartItemCount: (state) => state.cartTotal.totalCount,
    
    // 获取购物车商品总价
    cartTotalPrice: (state) => state.cartTotal.totalPrice,
    
    // 获取已选择的商品列表
    selectedCartItems: (state) => {
      return state.cartItems.filter(item => state.selectedItems.includes(item.id));
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
    isCartEmpty: (state) => state.cartItems.length === 0
  },
  
  actions: {
    // 获取购物车列表
    async fetchCartItems() {
      this.loading = true;
      
      try {
        const res = await getCartList();
        
        if (res.code === 200) {
          this.cartItems = res.data.items || [];
          this.cartTotal = {
            totalCount: res.data.totalCount || 0,
            totalPrice: res.data.totalPrice || 0
          };
          
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
    
    // 添加商品到购物车
    async addProductToCart(product, quantity = 1) {
      if (!product || !product.id) {
        ElMessage.error('商品信息不完整');
        return false;
      }
      
      this.addLoading = true;
      
      try {
        const cartItem = {
          productId: product.id,
          quantity: quantity
        };
        
        const res = await addToCart(cartItem);
        
        if (res.code === 200) {
          // 更新购物车数据
          await this.fetchCartItems();
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
          this.cartTotal = {
            totalCount: res.data.totalCount || 0,
            totalPrice: res.data.totalPrice || 0
          };
          return this.cartTotal;
        } else {
          console.error('获取购物车总计失败:', res.message);
          return this.cartTotal;
        }
      } catch (error) {
        console.error('获取购物车总计失败:', error);
        return this.cartTotal;
      }
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
    }
  }
}) 