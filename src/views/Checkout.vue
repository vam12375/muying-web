<template>
  <div class="checkout-container">
    <!-- 页面标题 -->
    <div class="checkout-header">
      <h1 class="checkout-title">确认订单</h1>
      <div class="checkout-header-row">
        <p class="checkout-description">请在下方确认您的订单信息</p>
        <el-button type="primary" size="small" class="refresh-button" @click="refreshCheckout" :loading="isLoading">
          <el-icon><Refresh /></el-icon> 刷新页面
        </el-button>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="3" animated />
      <el-divider />
      <el-skeleton :rows="2" animated />
      <el-divider />
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-icon class="error-icon"><WarningFilled /></el-icon>
      <h2 class="error-title">加载订单信息失败</h2>
      <p class="error-message">{{ error }}</p>
      <p class="error-details" v-if="error.includes('fetch')">
        可能的原因：
        <ul>
          <li>网络连接问题</li>
          <li>服务器暂时不可用</li>
          <li>系统内部错误</li>
        </ul>
      </p>
      <div class="error-actions">
        <el-button type="primary" @click="refreshCheckout">重新加载</el-button>
        <el-button @click="goBackToCart">返回购物车</el-button>
      </div>
    </div>

    <!-- 选中商品为空 -->
    <div v-else-if="selectedItems.length === 0" class="empty-container">
      <el-icon class="empty-icon"><ShoppingCart /></el-icon>
      <h2 class="empty-title">没有选中的商品</h2>
      <p class="empty-message">请先在购物车中选择商品后再结算</p>
      <div v-if="!isLoading && cartStore" class="error-details">
        <p class="error-message">
          状态检查: {{cartStore.hasSelectedItems ? '购物车有选中商品' : '购物车无选中商品'}}
        </p>
        <p class="error-message">
          已选商品ID: {{cartStore.selectedItems.join(', ')}}
        </p>
        <p class="error-message">
          LocalStorage: {{ localStorage.getItem('checkoutItems') ? 'has data' : 'no data' }}
        </p>
        <el-button type="primary" size="small" @click="refreshCheckout">
          重新尝试加载
        </el-button>
      </div>
      <el-button type="primary" @click="reloadCart" class="mt-3">返回购物车</el-button>
    </div>

    <!-- 订单内容 -->
    <template v-else>
      <!-- 收货地址区域 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><Location /></el-icon>
            收货地址
          </h2>
        </div>
        <div class="section-content">
          <AddressManager 
            @address-selected="handleAddressSelected" 
            :initialSelectedId="selectedAddress?.addressId"
            :checkoutMode="true"
          />
        </div>
      </div>

      <!-- 订单商品区域 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><GoodsFilled /></el-icon>
            商品信息
          </h2>
        </div>
        <div class="section-content">
          <table class="order-items">
            <thead>
              <tr>
                <th width="80">商品图片</th>
                <th>商品信息</th>
                <th width="120">单价</th>
                <th width="120">数量</th>
                <th width="120">小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedItems" :key="item.id || item.cartId">
                <td>
                  <el-image 
                    class="item-image" 
                    :src="item.productImage || item.image" 
                    :alt="item.productName || item.title"
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-error">图片加载失败</div>
                    </template>
                  </el-image>
                </td>
                <td class="item-info">
                  <div class="item-name">{{ item.productName || item.title }}</div>
                  <div class="item-specs">{{ item.specs || item.specification || '默认规格' }}</div>
                </td>
                <td class="item-price">
                  <div class="price-value">￥{{ formatPrice(item.price || item.priceSnapshot) }}</div>
                </td>
                <td class="item-quantity">x{{ item.quantity }}</td>
                <td class="item-subtotal">
                  <div class="price-value">￥{{ formatPrice((item.price || item.priceSnapshot) * item.quantity) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- 调试信息 -->
          <div v-if="selectedItems.length > 0" class="debug-info">
            <details>
              <summary>调试信息</summary>
              <pre>{{ JSON.stringify(selectedItems[0], null, 2) }}</pre>
            </details>
          </div>
        </div>
      </div>

      <!-- 配送方式 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><Van /></el-icon>
            配送方式
          </h2>
        </div>
        <div class="section-content">
          <div class="shipping-options">
            <div 
              v-for="option in shippingOptions" 
              :key="option.id"
              class="option-card"
              :class="{ 'selected': selectedShipping && selectedShipping.id === option.id }"
              @click="selectShipping(option)"
            >
              <div class="option-name">
                <el-icon v-if="option.icon"><component :is="option.icon" /></el-icon>
                {{ option.name }}
              </div>
              <div class="option-fee">{{ option.fee > 0 ? `￥${formatPrice(option.fee)}` : '免运费' }}</div>
              <div class="option-description">{{ option.description }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 支付方式 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><Wallet /></el-icon>
            支付方式
          </h2>
        </div>
        <div class="section-content">
          <div class="payment-options">
            <div 
              v-for="method in paymentMethods" 
              :key="method.id"
              class="option-card"
              :class="{ 'selected': selectedPayment && selectedPayment.id === method.id }"
              @click="selectPayment(method)"
            >
              <div class="option-name">
                <el-icon v-if="method.icon"><component :is="method.icon" /></el-icon>
                {{ method.name }}
              </div>
              <div class="option-description">{{ method.description }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 优惠券 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><Ticket /></el-icon>
            优惠券
          </h2>
          <el-button type="primary" link @click="showAllCoupons = true">更多优惠券</el-button>
        </div>
        <div class="section-content">
          <div v-if="isLoading" class="skeleton-item">
            <el-skeleton :rows="2" animated />
          </div>
          <div v-else-if="coupons.length === 0" class="no-coupons">
            <p>暂无可用优惠券</p>
            <div class="apply-coupon">
              <el-input v-model="couponCode" placeholder="输入优惠码" clearable></el-input>
              <el-button type="primary" @click="applyCoupon" :loading="isCouponLoading">应用</el-button>
            </div>
          </div>
          <div v-else>
            <div class="coupon-list">
              <div 
                v-for="coupon in coupons" 
                :key="coupon.id"
                class="coupon-card"
                :class="{ 'selected': selectedCoupon && selectedCoupon.id === coupon.id }"
                @click="selectCoupon(coupon)"
              >
                <div class="coupon-left">
                  <div class="coupon-amount">
                    <template v-if="coupon.type === 'FIXED'">
                      ￥{{ formatPrice(parseFloat(coupon.value)) }}
                    </template>
                    <template v-else-if="coupon.type === 'PERCENTAGE'">
                      {{ (parseFloat(coupon.value) * 10).toFixed(1) }}折
                    </template>
                  </div>
                  <div>优惠券</div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-info">
                    <div class="coupon-name">{{ coupon.name }}</div>
                    <div class="coupon-condition">满{{ formatPrice(parseFloat(coupon.minSpend)) }}元可用</div>
                    <div class="coupon-expiry">有效期至 {{ formatDate(coupon.endTime) }}</div>
                  </div>
                  <el-radio 
                    :modelValue="selectedCoupon && selectedCoupon.id === coupon.id"
                    :label="true"
                    @change="() => selectCoupon(coupon)"
                  ></el-radio>
                </div>
              </div>
            </div>
            <div class="apply-coupon">
              <el-input v-model="couponCode" placeholder="输入优惠码" clearable></el-input>
              <el-button type="primary" @click="applyCoupon" :loading="isCouponLoading">应用</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 优惠券抽屉 -->
      <el-drawer
        v-model="showAllCoupons"
        title="选择优惠券"
        size="70%"
        direction="rtl"
      >
        <div class="drawer-content">
          <!-- 优惠券状态切换 -->
          <el-tabs v-model="couponTab" @tab-change="handleCouponTabChange" class="coupon-tabs">
            <el-tab-pane label="可用优惠券" name="available"></el-tab-pane>
            <el-tab-pane label="不可用优惠券" name="unavailable"></el-tab-pane>
          </el-tabs>
          
          <!-- 优惠券列表 -->
          <div class="drawer-coupon-list">
            <div v-if="isLoadingAllCoupons" class="coupon-loading">
              <el-skeleton :rows="3" animated />
            </div>
            <el-empty v-else-if="allCoupons.length === 0" description="暂无优惠券"></el-empty>
            <div v-else class="coupon-grid">
              <div 
                v-for="coupon in allCoupons" 
                :key="coupon.id"
                class="big-coupon-card"
                :class="{ 
                  'selected': selectedCoupon && selectedCoupon.id === coupon.id,
                  'disabled': couponTab === 'unavailable' || !isCouponAvailable(coupon)
                }"
                @click="couponTab === 'available' && isCouponAvailable(coupon) ? selectCoupon(coupon) : null"
              >
                <div class="big-coupon-header">
                  <div class="big-coupon-amount">
                    <template v-if="coupon.type === 'FIXED'">
                      <span class="amount-currency">￥</span>{{ formatPrice(parseFloat(coupon.value)) }}
                    </template>
                    <template v-else-if="coupon.type === 'PERCENTAGE'">
                      {{ (parseFloat(coupon.value) * 10).toFixed(1) }}<span class="amount-unit">折</span>
                    </template>
                  </div>
                  <div class="big-coupon-name">{{ coupon.name }}</div>
                  <div class="big-coupon-condition">
                    <template v-if="parseFloat(coupon.minSpend) > 0">
                      满{{ formatPrice(parseFloat(coupon.minSpend)) }}元可用
                    </template>
                    <template v-else>
                      无门槛
                    </template>
                  </div>
                </div>
                
                <div class="big-coupon-body">
                  <div class="big-coupon-time">
                    有效期至: {{ formatDate(coupon.endTime) }}
                  </div>
                  <div class="big-coupon-description">
                    {{ coupon.description || '全场通用' }}
                  </div>
                </div>
                
                <div class="big-coupon-footer">
                  <el-button 
                    v-if="couponTab === 'available' && isCouponAvailable(coupon)"
                    type="primary" 
                    size="small" 
                    @click.stop="selectCoupon(coupon); showAllCoupons = false;"
                  >
                    选择
                  </el-button>
                  <div v-else-if="couponTab === 'unavailable'" class="unavailable-reason">
                    {{ getCouponUnavailableReason(coupon) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 优惠码兑换 -->
          <div class="drawer-footer">
            <div class="apply-coupon-large">
              <div class="apply-title">兑换优惠码</div>
              <div class="apply-input-group">
                <el-input v-model="couponCode" placeholder="请输入优惠码" clearable></el-input>
                <el-button type="primary" @click="applyCoupon">兑换</el-button>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>
      
      <!-- 订单备注 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><EditPen /></el-icon>
            订单备注
          </h2>
        </div>
        <div class="section-content">
          <el-input
            v-model="orderRemark"
            type="textarea"
            :rows="3"
            class="remark-input"
            placeholder="请输入订单备注信息"
            maxlength="200"
            show-word-limit
          ></el-input>
        </div>
      </div>
      
      <!-- 订单金额汇总 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">
            <el-icon class="icon"><Money /></el-icon>
            订单金额
          </h2>
        </div>
        <div class="section-content">
          <div class="order-summary">
            <div class="summary-row">
              <div class="summary-label">商品总价</div>
              <div class="summary-value">￥{{ formatPrice(subtotal) }}</div>
            </div>
            <div class="summary-row">
              <div class="summary-label">运费</div>
              <div class="summary-value">{{ selectedShipping?.fee ? `￥${formatPrice(selectedShipping.fee)}` : '免运费' }}</div>
            </div>
            <div class="summary-row" v-if="selectedCoupon">
              <div class="summary-label">优惠券</div>
              <div class="summary-value">-￥{{ formatPrice(parseFloat(selectedCoupon.value)) }}</div>
            </div>
            <div class="summary-total">
              <div class="summary-label">应付总额</div>
              <div class="summary-value">￥{{ formatPrice(total) }}</div>
            </div>
          </div>

          <div class="checkout-actions">
            <div class="back-to-cart" @click="goBackToCart">
              <el-icon><ArrowLeft /></el-icon>
              返回购物车
            </div>
            <el-button 
              type="primary" 
              class="submit-btn" 
              size="large" 
              :loading="isSubmitting"
              :disabled="!selectedAddress || !selectedShipping || !selectedPayment"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 地址表单对话框 -->
      <el-dialog
        v-model="addressFormVisible"
        :title="editingAddress ? '编辑地址' : '添加新地址'"
        width="500px"
      >
        <el-form 
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressRules"
          label-width="100px"
        >
          <el-form-item label="收货人" prop="name">
            <el-input v-model="addressForm.name" placeholder="请输入收货人姓名"></el-input>
          </el-form-item>
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
          </el-form-item>
          <el-form-item label="所在地区" prop="region">
            <el-cascader
              v-model="addressForm.region"
              :options="regionData"
              placeholder="请选择省/市/区"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="detailAddress">
            <el-input 
              v-model="addressForm.detailAddress" 
              type="textarea" 
              :rows="2"
              placeholder="街道门牌、楼层房间号等信息"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="addressFormVisible = false">取消</el-button>
            <el-button type="primary" @click="saveAddress(addressFormRef)" :loading="isSavingAddress">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
      
      <!-- 订单提交结果 -->
      <el-dialog
        v-model="orderResultVisible"
        :title="orderSuccess ? '订单提交成功' : '订单提交失败'"
        width="400px"
      >
        <div class="order-result">
          <el-icon :size="50" class="result-icon" :class="{ 'success': orderSuccess, 'error': !orderSuccess }">
            <component :is="orderSuccess ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
          </el-icon>
          <h3 class="result-title">{{ orderSuccess ? '订单提交成功' : '订单提交失败' }}</h3>
          <p class="result-message">
            {{ orderSuccess ? `订单号: ${orderNumber}` : orderError }}
          </p>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="orderResultVisible = false">关闭</el-button>
            <el-button 
              v-if="orderSuccess" 
              type="primary" 
              @click="goToOrderDetail"
            >
              查看订单
            </el-button>
            <el-button 
              v-else 
              type="primary" 
              @click="retrySubmit"
            >
              重试
            </el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Location, GoodsFilled, Van, Wallet, Ticket, EditPen, Money, 
  ArrowLeft, Plus, WarningFilled, ShoppingCart, CircleCheckFilled, CircleCloseFilled, Refresh } from '@element-plus/icons-vue';
import useCheckout from '@/scripts/Checkout';
import { useRouter } from 'vue-router';
import AddressManager from '@/components/user/AddressManager.vue';

// 地址表单引用
const addressFormRef = ref(null);

const {
  // 状态
  isLoading,
  isAddressLoading,
  isSubmitting,
  isSavingAddress,
  error,
  addresses,
  selectedAddress,
  addressFormVisible,
  editingAddress,
  addressForm,
  addressRules,
  selectedItems,
  shippingOptions,
  selectedShipping,
  paymentMethods,
  selectedPayment,
  coupons,
  selectedCoupon,
  couponCode,
  orderRemark,
  orderResultVisible,
  orderSuccess,
  orderNumber,
  orderError,
  subtotal,
  total,
  regionData,
  cartStore,
  
  // 优惠券增强功能
  showAllCoupons,
  couponTab,
  allCoupons,
  isLoadingAllCoupons,
  isCouponLoading,
  
  // 方法
  initCheckout,
  fetchCoupons,
  selectAddress,
  openAddressForm,
  editAddress,
  deleteAddress,
  saveAddress,
  selectShipping,
  selectPayment,
  selectCoupon,
  applyCoupon,
  submitOrder,
  formatPrice,
  formatDate,
  goToOrderDetail,
  retrySubmit,
  goBackToCart,
  refreshCheckout,
  
  // 优惠券增强方法
  handleCouponTabChange,
  fetchAllCoupons,
  isCouponAvailable,
  getCouponUnavailableReason
} = useCheckout();

const router = useRouter();

// 返回购物车并刷新页面
function reloadCart() {
  // 清除本地存储的结算商品信息
  try {
    localStorage.removeItem('checkoutItems');
  } catch (e) {
    console.error('清除localStorage失败:', e);
  }
  
  // 重定向到购物车页面
  router.push('/cart');
}

// 替换selectAddress方法为handleAddressSelected
function handleAddressSelected(address) {
  console.log('[Checkout] 已选择地址:', address);
  if (!address) {
    console.warn('[Checkout] 收到空地址对象');
    return;
  }
  
  // 确保地址对象中有必要的字段
  if (!address.addressId) {
    console.warn('[Checkout] 地址对象缺少addressId字段:', address);
  }
  if (!address.receiver) {
    console.warn('[Checkout] 地址对象缺少receiver字段:', address);
  }
  
  selectedAddress.value = address;
  console.log('[Checkout] 更新selectedAddress:', selectedAddress.value);
}

// 刷新整个结算页面已经通过useCheckout获取，这里不需要重复定义
</script>

<style src="@/styles/Checkout.scss" scoped></style> 