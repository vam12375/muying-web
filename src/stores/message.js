import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getUnreadCount, getUserMessages, getUnreadCountByType } from '@/api/userMessage';

export const useMessageStore = defineStore('message', () => {
  // 状态
  const unreadCount = ref(0);
  const messageList = ref([]);
  const unreadCountByType = ref({});
  const loading = ref(false);
  const lastUpdateTime = ref(null);

  // 计算属性
  const hasUnreadMessages = computed(() => unreadCount.value > 0);
  
  // 获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      if (res.code === 200) {
        unreadCount.value = res.data;
        
        // 如果已经获取了各类型未读消息数量，从总数中减去催发货消息数量
        if (unreadCountByType.value.shipping_reminder) {
          unreadCount.value -= unreadCountByType.value.shipping_reminder;
        }
      }
      return res.data;
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      return 0;
    }
  };

  // 获取各类型未读消息数量
  const fetchUnreadCountByType = async () => {
    try {
      const res = await getUnreadCountByType();
      if (res.code === 200) {
        // 过滤掉 shipping_reminder 类型的消息计数
        const filteredData = { ...res.data };
        delete filteredData.shipping_reminder;
        
        unreadCountByType.value = filteredData;
      }
      return res.data;
    } catch (error) {
      console.error('获取各类型未读消息数量失败:', error);
      return {};
    }
  };

  // 获取消息列表
  const fetchMessages = async (params = { page: 1, size: 10 }) => {
    loading.value = true;
    try {
      const res = await getUserMessages(params);
      if (res.code === 200) {
        messageList.value = res.data.records || [];
        lastUpdateTime.value = new Date();
      }
      loading.value = false;
      return res.data;
    } catch (error) {
      console.error('获取消息列表失败:', error);
      loading.value = false;
      return { records: [], total: 0 };
    }
  };

  // 刷新消息数据
  const refreshMessageData = async () => {
    await Promise.all([
      fetchUnreadCount(),
      fetchUnreadCountByType()
    ]);
  };

  // 定时刷新
  const startAutoRefresh = (interval = 60000) => {
    const timerId = setInterval(refreshMessageData, interval);
    return timerId;
  };

  return {
    // 状态
    unreadCount,
    messageList,
    unreadCountByType,
    loading,
    lastUpdateTime,
    
    // 计算属性
    hasUnreadMessages,
    
    // 方法
    fetchUnreadCount,
    fetchUnreadCountByType,
    fetchMessages,
    refreshMessageData,
    startAutoRefresh
  };
}); 